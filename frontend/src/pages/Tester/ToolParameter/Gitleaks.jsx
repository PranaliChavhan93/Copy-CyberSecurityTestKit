import { useState, useRef, useEffect } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";
import "./ToolCommon.css";

function GitleaksParameters({ tool, parameters, setParameters, stageCode, onAdvanceStage }) 
{
    const [commandType, setCommandType] = useState("git");
    const [target, setTarget] = useState("");
    const [configPath, setConfigPath] = useState("");
    
    const [baselinePath, setBaselinePath] = useState("");
    const [reportFormat, setReportFormat] = useState("");
    const [reportPath, setReportPath] = useState("");
    const [logLevel, setLogLevel] = useState("info");
    const [exitCode, setExitCode] = useState("1");
    const [maxTargetMb, setMaxTargetMb] = useState("");
    const [maxDecodeDepth, setMaxDecodeDepth] = useState("");
    const [enableRules, setEnableRules] = useState("");
    const [gitleaksIgnorePath, setGitleaksIgnorePath] = useState(".");
    const [redact, setRedact] = useState("");

    const [verbose, setVerbose] = useState(false);
    const [noColor, setNoColor] = useState(false);
    const [noBanner, setNoBanner] = useState(false);
    const [ignoreGitleaksAllow, setIgnoreGitleaksAllow] = useState(false);

    const [extraArgs, setExtraArgs] = useState("");

    const [command, setCommand] = useState("");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [executionStatus, setExecutionStatus] = useState("waiting");

    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("");
    const [outputFile, setOutputFile] = useState("gitleaks_output.txt");

    const terminalRef = useRef(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [output]);

    useEffect(() => {
        updateCommandPreview();
    }, [
        commandType,
        target,
        configPath,
        baselinePath,
        reportFormat,
        reportPath,
        logLevel,
        exitCode,
        maxTargetMb,
        maxDecodeDepth,
        enableRules,
        gitleaksIgnorePath,
        redact,
        verbose,
        noColor,
        noBanner,
        ignoreGitleaksAllow,
        extraArgs
    ]);

    const generateCommand = () => {
        let cmd = "gitleaks";

        if (commandType) {
            cmd += ` ${commandType}`;
        }

        if (target && (commandType === "git" || commandType === "dir")) {
            cmd += ` ${target}`;
        }

        if (configPath) cmd += ` --config ${configPath}`;
        if (baselinePath) cmd += ` --baseline-path ${baselinePath}`;
        if (reportFormat) cmd += ` --report-format ${reportFormat}`;
        if (reportPath) cmd += ` --report-path ${reportPath}`;
        if (logLevel) cmd += ` --log-level ${logLevel}`;
        if (exitCode) cmd += ` --exit-code ${exitCode}`;
        if (maxTargetMb) cmd += ` --max-target-megabytes ${maxTargetMb}`;
        if (maxDecodeDepth) cmd += ` --max-decode-depth ${maxDecodeDepth}`;
        if (enableRules) cmd += ` --enable-rule ${enableRules}`;
        if (gitleaksIgnorePath) cmd += ` --gitleaks-ignore-path ${gitleaksIgnorePath}`;
        if (redact) cmd += ` --redact ${redact}`;

        if (verbose) cmd += " --verbose";
        if (noColor) cmd += " --no-color";
        if (noBanner) cmd += " --no-banner";
        if (ignoreGitleaksAllow) cmd += " --ignore-gitleaks-allow";

        if (extraArgs.trim()) {
            cmd += ` ${extraArgs.trim()}`;
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
                            commandType,
                            target,
                            configPath,
                            baselinePath,
                            reportFormat,
                            reportPath,
                            logLevel,
                            exitCode,
                            maxTargetMb,
                            maxDecodeDepth,
                            enableRules,
                            gitleaksIgnorePath,
                            redact,
                            verbose,
                            noColor,
                            noBanner,
                            ignoreGitleaksAllow,
                            extraArgs
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
        if (!filename.endsWith(".txt")) filename += ".txt";
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
                outputFile || "gitleaks_output.txt"
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
                Gitleaks Configuration
                {tool && <span className="tool-badge">{tool.tool_name}</span>}
            </h3>

            <div className="tool-form">
                <div className="tool-field">
                    <label>Command</label>
                    <select
                        value={commandType}
                        onChange={(e) => setCommandType(e.target.value)}
                    >
                        <option value="git">git – Scan Git Repository</option>
                        <option value="dir">dir – Scan Directory</option>
                        <option value="stdin">stdin – Scan from STDIN</option>
                    </select>
                </div>

                {(commandType === "git" || commandType === "dir") && (
                    <div className="tool-field">
                        <label>Target</label>
                        <input
                            type="text"
                            placeholder={commandType === "git" ? "Path to Git repo" : "Path to directory"}
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                        />
                    </div>
                )}

                <div className="tool-field">
                    <label>Config File</label>
                    <input
                        type="text"
                        placeholder="/path/to/config.toml"
                        value={configPath}
                        onChange={(e) => setConfigPath(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Baseline Path</label>
                    <input
                        type="text"
                        placeholder="/path/to/baseline.json"
                        value={baselinePath}
                        onChange={(e) => setBaselinePath(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Report Format</label>
                    <select
                        value={reportFormat}
                        onChange={(e) => setReportFormat(e.target.value)}
                    >
                        <option value="">Default (json)</option>
                        <option value="json">json</option>
                        <option value="csv">csv</option>
                        <option value="junit">junit</option>
                        <option value="sarif">sarif</option>
                        <option value="template">template</option>
                    </select>
                </div>

                <div className="tool-field">
                    <label>Report Path</label>
                    <input
                        type="text"
                        placeholder="report.json"
                        value={reportPath}
                        onChange={(e) => setReportPath(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Log Level</label>
                    <select
                        value={logLevel}
                        onChange={(e) => setLogLevel(e.target.value)}
                    >
                        <option value="trace">trace</option>
                        <option value="debug">debug</option>
                        <option value="info">info</option>
                        <option value="warn">warn</option>
                        <option value="error">error</option>
                        <option value="fatal">fatal</option>
                    </select>
                </div>

                <div className="tool-field">
                    <label>Exit Code</label>
                    <input
                        type="number"
                        placeholder="1"
                        value={exitCode}
                        onChange={(e) => setExitCode(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Max Target Megabytes</label>
                    <input
                        type="number"
                        placeholder="e.g. 10"
                        value={maxTargetMb}
                        onChange={(e) => setMaxTargetMb(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Max Decode Depth</label>
                    <input
                        type="number"
                        placeholder="0 (disabled)"
                        value={maxDecodeDepth}
                        onChange={(e) => setMaxDecodeDepth(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Enable Rule (comma separated)</label>
                    <input
                        type="text"
                        placeholder="rule1,rule2"
                        value={enableRules}
                        onChange={(e) => setEnableRules(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Gitleaks Ignore Path</label>
                    <input
                        type="text"
                        placeholder="."
                        value={gitleaksIgnorePath}
                        onChange={(e) => setGitleaksIgnorePath(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Redact (percentage)</label>
                    <input
                        type="number"
                        placeholder="100"
                        min="0"
                        max="100"
                        value={redact}
                        onChange={(e) => setRedact(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Extra Arguments</label>
                    <input
                        type="text"
                        placeholder="--some-flag"
                        value={extraArgs}
                        onChange={(e) => setExtraArgs(e.target.value)}
                    />
                </div>
            </div>

            <div className="tool-options">
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
                        checked={noColor}
                        onChange={(e) => setNoColor(e.target.checked)}
                    />
                    No Color
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={noBanner}
                        onChange={(e) => setNoBanner(e.target.checked)}
                    />
                    No Banner
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={ignoreGitleaksAllow}
                        onChange={(e) => setIgnoreGitleaksAllow(e.target.checked)}
                    />
                    Ignore Gitleaks Allow
                </label>
            </div>

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
                            toolName={tool?.tool_name || "Gitleaks"}
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

export default GitleaksParameters;