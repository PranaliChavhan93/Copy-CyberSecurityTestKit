import { useState, useRef, useEffect } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";
import "./ToolCommon.css";

function LynisParameters({
    tool,
    parameters,
    setParameters,
    stageCode,
    onAdvanceStage
}) {
    // --- Audit Mode ---
    const [auditMode, setAuditMode] = useState("local"); // "local", "remote", "dockerfile"
    const [remoteHost, setRemoteHost] = useState("");
    const [dockerfilePath, setDockerfilePath] = useState("");

    // --- Show Commands ---
    const [showCommand, setShowCommand] = useState("none"); // "none", "version", "help"

    // --- Update ---
    const [updateInfo, setUpdateInfo] = useState(false);

    // --- Options ---
    const [noColors, setNoColors] = useState(false);
    const [quiet, setQuiet] = useState(false);
    const [reverseColors, setReverseColors] = useState(false);
    const [debug, setDebug] = useState(false);
    const [noLog, setNoLog] = useState(false);
    const [verbose, setVerbose] = useState(false);
    const [wait, setWait] = useState(false);
    const [slowWarning, setSlowWarning] = useState("");
    const [pentest, setPentest] = useState(false);
    const [forensics, setForensics] = useState(false);
    const [profile, setProfile] = useState("");

    // --- Command and Output ---
    const [command, setCommand] = useState("");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [executionStatus, setExecutionStatus] = useState("waiting");

    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("");
    const [outputFile, setOutputFile] = useState("lynis_results.txt");

    const terminalRef = useRef(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [output]);

    useEffect(() => {
        updateCommandPreview();
    }, [
        auditMode, remoteHost, dockerfilePath,
        showCommand, updateInfo,
        noColors, quiet, reverseColors, debug, noLog, verbose, wait, slowWarning,
        pentest, forensics, profile
    ]);

    const generateCommand = () => {
        let cmd = "lynis";

        // --- Audit mode ---
        if (auditMode === "local") {
            cmd += " audit system";
        } else if (auditMode === "remote") {
            cmd += ` audit system remote ${remoteHost}`;
        } else if (auditMode === "dockerfile") {
            cmd += ` audit dockerfile ${dockerfilePath}`;
        }

        // --- Show commands ---
        if (showCommand === "version") {
            cmd = "lynis show version";
        } else if (showCommand === "help") {
            cmd = "lynis show help";
        }

        // --- Update info (if selected and no show command) ---
        if (updateInfo && showCommand === "none") {
            cmd = "lynis update info";
        }

        // --- Options (only if not show/update) ---
        const isShowOrUpdate = (showCommand !== "none" || updateInfo);
        if (!isShowOrUpdate) {
            if (noColors) cmd += " --no-colors";
            if (quiet) cmd += " --quiet";
            if (reverseColors) cmd += " --reverse-colors";
            if (debug) cmd += " --debug";
            if (noLog) cmd += " --no-log";
            if (verbose) cmd += " --verbose";
            if (wait) cmd += " --wait";
            if (slowWarning) cmd += ` --slow-warning ${slowWarning}`;
            if (pentest) cmd += " --pentest";
            if (forensics) cmd += " --forensics";
            if (profile) cmd += ` --profile ${profile}`;
        }

        return cmd;
    };

    const updateCommandPreview = () => {
        setCommand(generateCommand());
    };

    const runCommand = async () => {
        const cmd = generateCommand();

        setIsRunning(true);
        setExecutionStatus("running");

        setOutput(prev => prev + `\n# ${cmd}\n`);

        try {
            const response = await fetch(
                "http://127.0.0.1:8000/tools/run/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${sessionStorage.getItem("access")}`
                    },
                    body: JSON.stringify({
                        command: cmd,
                        tool_id: tool?.id || null,
                        parameters: {
                            auditMode,
                            remoteHost,
                            dockerfilePath,
                            showCommand,
                            updateInfo,
                            noColors,
                            quiet,
                            reverseColors,
                            debug,
                            noLog,
                            verbose,
                            wait,
                            slowWarning,
                            pentest,
                            forensics,
                            profile
                        }
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                setOutput(prev =>
                    prev +
                    `${data.output || "Command executed successfully"}\n`
                );
                setExecutionStatus("success");
            } else {
                setOutput(prev =>
                    prev +
                    `${data.message || "Unknown error"}\n`
                );
                setExecutionStatus("error");
            }
        } catch (error) {
            setOutput(prev => prev + `${error.message}\n`);
            setExecutionStatus("error");
        } finally {
            setIsRunning(false);
        }
    };

    const clearTerminal = () => {
        setOutput("");
        setExecutionStatus("waiting");
    };

    const downloadTxtFile = (content, filename) => {
        if (!filename.endsWith(".txt")) {
            filename += ".txt";
        }
        const blob = new Blob([content], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const handleDownload = () => {
        if (!output || output === "Waiting for execution...") {
            alert("No output available! Please run the command first.");
            return;
        }
        setPopupType("download");
        setShowPopup(true);
    };

    const handlePopupConfirm = () => {
        if (popupType === "download") {
            downloadTxtFile(
                output,
                outputFile || "lynis_results.txt"
            );
            setShowPopup(false);
            setPopupType("");
        }
    };

    const handlePopupCancel = () => {
        setShowPopup(false);
        setPopupType("");
    };

    return (
        <div className="tool-box">
            <h3>
                Lynis Configuration
                {tool && <span className="tool-badge">{tool.tool_name}</span>}
            </h3>

            <div className="tool-form">
                {/* Audit Mode */}
                <div className="tool-field">
                    <label>Audit Mode</label>
                    <select
                        value={auditMode}
                        onChange={(e) => setAuditMode(e.target.value)}
                    >
                        <option value="local">Local System Audit</option>
                        <option value="remote">Remote System Audit</option>
                        <option value="dockerfile">Dockerfile Audit</option>
                    </select>
                </div>

                {auditMode === "remote" && (
                    <div className="tool-field">
                        <label>Remote Host</label>
                        <input
                            type="text"
                            placeholder="192.168.1.10"
                            value={remoteHost}
                            onChange={(e) => setRemoteHost(e.target.value)}
                        />
                    </div>
                )}

                {auditMode === "dockerfile" && (
                    <div className="tool-field">
                        <label>Dockerfile Path</label>
                        <input
                            type="text"
                            placeholder="/path/to/Dockerfile"
                            value={dockerfilePath}
                            onChange={(e) => setDockerfilePath(e.target.value)}
                        />
                    </div>
                )}

                {/* Show Commands */}
                <div className="tool-field">
                    <label>Show Command</label>
                    <select
                        value={showCommand}
                        onChange={(e) => setShowCommand(e.target.value)}
                    >
                        <option value="none">None (Audit/Update)</option>
                        <option value="version">Version</option>
                        <option value="help">Help</option>
                    </select>
                </div>

                {/* Update Info */}
                <div className="tool-field" style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <label style={{ marginRight: '10px' }}>Update Info</label>
                    <input
                        type="checkbox"
                        checked={updateInfo}
                        onChange={(e) => setUpdateInfo(e.target.checked)}
                    />
                </div>
            </div>

            {/* Options (only when not show/update) */}
            {(showCommand === "none" && !updateInfo) && (
                <>
                    <div className="tool-options">
                        <label>
                            <input
                                type="checkbox"
                                checked={noColors}
                                onChange={(e) => setNoColors(e.target.checked)}
                            />
                            No Colors
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                checked={quiet}
                                onChange={(e) => setQuiet(e.target.checked)}
                            />
                            Quiet (-q)
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                checked={reverseColors}
                                onChange={(e) => setReverseColors(e.target.checked)}
                            />
                            Reverse Colors
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                checked={debug}
                                onChange={(e) => setDebug(e.target.checked)}
                            />
                            Debug
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                checked={noLog}
                                onChange={(e) => setNoLog(e.target.checked)}
                            />
                            No Log
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                checked={verbose}
                                onChange={(e) => setVerbose(e.target.checked)}
                            />
                            Verbose
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                checked={wait}
                                onChange={(e) => setWait(e.target.checked)}
                            />
                            Wait
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                checked={pentest}
                                onChange={(e) => setPentest(e.target.checked)}
                            />
                            Pentest Mode
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                checked={forensics}
                                onChange={(e) => setForensics(e.target.checked)}
                            />
                            Forensics Mode
                        </label>
                    </div>

                    <div className="tool-form">
                        <div className="tool-field">
                            <label>Slow Warning Threshold (seconds)</label>
                            <input
                                type="number"
                                placeholder="10"
                                value={slowWarning}
                                onChange={(e) => setSlowWarning(e.target.value)}
                            />
                        </div>

                        <div className="tool-field">
                            <label>Profile File</label>
                            <input
                                type="text"
                                placeholder="/path/to/profile.prf"
                                value={profile}
                                onChange={(e) => setProfile(e.target.value)}
                            />
                        </div>
                    </div>
                </>
            )}

            <div className="command-area">
                <label>Generated Command</label>
                <div className="command-preview">
                    <span className="command-text">
                        {command || "Command..."}
                    </span>
                </div>
                <br />

                <button
                    className={`run-btn ${isRunning ? 'running' : ''}`}
                    onClick={runCommand}
                    disabled={isRunning || !command}
                >
                    {isRunning ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i>
                            {" "}Running...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-play"></i>
                            {" "}Run Command
                        </>
                    )}
                </button>

                {output && (
                    <button
                        className="run-btn"
                        style={{
                            background: "#6b7a9a",
                            marginLeft: "10px",
                            padding: "12px 20px"
                        }}
                        onClick={clearTerminal}
                    >
                        <i className="fas fa-eraser"></i>
                        {" "}Clear
                    </button>
                )}
            </div>

            <div className="command-area">
                <label>Terminal Output</label>
                <div className="terminal" ref={terminalRef}>
                    <pre>
                        {output || "Waiting for execution..."}
                        {isRunning && <span className="cursor"></span>}
                    </pre>
                </div>

                {output && output !== "Waiting for execution..." && (
                    <div className="action-buttons">
                        <AIAnalysisPanel
                            output={output}
                            toolName={tool?.tool_name || "Lynis"}
                            stageCode={stageCode}
                            onAdvanceStage={onAdvanceStage}
                        />
                        <button
                            className="download-btn"
                            onClick={handleDownload}
                        >
                            <i className="fas fa-download"></i>
                            {" "}Download TXT
                        </button>
                    </div>
                )}
            </div>

            {showPopup && (
                <div className="popup-overlay" onClick={handlePopupCancel}>
                    <div className="popup-box confirm-popup" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            <i className="fas fa-download"></i>
                            {" "}Download File
                        </h3>

                        <div className="popup-message">
                            <p>Do you want to download this output as a .txt file?</p>
                        </div>

                        <div className="popup-file-info">
                            <label>File Name</label>
                            <input
                                type="text"
                                value={outputFile}
                                onChange={(e) => setOutputFile(e.target.value)}
                            />
                            <small>The output will be saved as a text file.</small>
                        </div>

                        <div className="popup-buttons">
                            <button
                                className="popup-cancel-btn"
                                onClick={handlePopupCancel}
                            >
                                Cancel
                            </button>
                            <button
                                className="popup-confirm-btn"
                                onClick={handlePopupConfirm}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LynisParameters;