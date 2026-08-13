import { useState, useRef, useEffect } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";
import "./ToolCommon.css";

function Enum4LinuxParameters({
    tool,
    parameters,
    setParameters,
    stageCode,
    onAdvanceStage
}) {
    const [target, setTarget] = useState("");
    const [enumeration, setEnumeration] = useState("all");

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [ridRange, setRidRange] = useState("");
    const [keepSearching, setKeepSearching] = useState("");
    const [workgroup, setWorkgroup] = useState("");
    const [shareFile, setShareFile] = useState("");
    const [knownUsers, setKnownUsers] = useState("");

    const [detailed, setDetailed] = useState(false);
    const [ridCycling, setRidCycling] = useState(false);
    const [ldap, setLdap] = useState(false);
    const [osInfo, setOsInfo] = useState(false);
    const [printerInfo, setPrinterInfo] = useState(false);
    const [nmbLookup, setNmbLookup] = useState(false);
    const [verbose, setVerbose] = useState(false);
    const [aggressive, setAggressive] = useState(false);

    const [command, setCommand] = useState("");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [executionStatus, setExecutionStatus] = useState("waiting");

    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("");
    const [outputFile, setOutputFile] = useState("enum4linux_results.txt");

    const terminalRef = useRef(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [output]);

    useEffect(() => {
        updateCommandPreview();
    }, [
        target,
        enumeration,
        username,
        password,
        ridRange,
        keepSearching,
        workgroup,
        shareFile,
        knownUsers,
        detailed,
        ridCycling,
        ldap,
        osInfo,
        printerInfo,
        nmbLookup,
        verbose,
        aggressive
    ]);

    const generateCommand = () => {
        let cmd = "enum4linux";

        if (enumeration === "users") {
            cmd += " -U";
        }

        if (enumeration === "machines") {
            cmd += " -M";
        }

        if (enumeration === "shares") {
            cmd += " -S";
        }

        if (enumeration === "password") {
            cmd += " -P";
        }

        if (enumeration === "groups") {
            cmd += " -G";
        }

        if (enumeration === "all") {
            cmd += " -a";
        }

        if (detailed) {
            cmd += " -d";
        }

        if (ridCycling) {
            cmd += " -r";
        }

        if (ridRange) {
            cmd += ` -R ${ridRange}`;
        }

        if (keepSearching) {
            cmd += ` -K ${keepSearching}`;
        }

        if (ldap) {
            cmd += " -l";
        }

        if (shareFile) {
            cmd += ` -s ${shareFile}`;
        }

        if (knownUsers) {
            cmd += ` -k ${knownUsers}`;
        }

        if (osInfo) {
            cmd += " -o";
        }

        if (printerInfo) {
            cmd += " -i";
        }

        if (workgroup) {
            cmd += ` -w ${workgroup}`;
        }

        if (nmbLookup) {
            cmd += " -n";
        }

        if (verbose) {
            cmd += " -v";
        }

        if (aggressive) {
            cmd += " -A";
        }

        if (username) {
            cmd += ` -u ${username}`;
        }

        if (password) {
            cmd += ` -p ${password}`;
        }

        if (target) {
            cmd += ` ${target}`;
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
                            target,
                            enumeration,
                            username,
                            password,
                            ridRange,
                            keepSearching,
                            workgroup,
                            shareFile,
                            knownUsers,
                            detailed,
                            ridCycling,
                            ldap,
                            osInfo,
                            printerInfo,
                            nmbLookup,
                            verbose,
                            aggressive
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

        const blob = new Blob([content], {
            type: "text/plain"
        });

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
                outputFile || "enum4linux_results.txt"
            );

            setShowPopup(false);
            setPopupType("");
        }
    };

    const handlePopupCancel = () => {
        setShowPopup(false);
        setPopupType("");
    };

    const saveParameters = () => {
        if (setParameters) {
            setParameters({
                target,
                enumeration,
                username,
                password,
                ridRange,
                keepSearching,
                workgroup,
                shareFile,
                knownUsers,
                detailed,
                ridCycling,
                ldap,
                osInfo,
                printerInfo,
                nmbLookup,
                verbose,
                aggressive,
                command,
                output,
                executionStatus
            });
        }
    };

    return (
        <div className="tool-box">
            <h3>
                Enum4Linux Configuration
                {tool && <span className="tool-badge">{tool.tool_name}</span>}
            </h3>

            <div className="tool-form">
                <div className="tool-field">
                    <label>Target IP / Host</label>
                    <input
                        type="text"
                        placeholder="192.168.1.10"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Enumeration Type</label>
                    <select
                        value={enumeration}
                        onChange={(e) => setEnumeration(e.target.value)}
                    >
                        <option value="all">All Simple Enumeration</option>
                        <option value="users">User List (-U)</option>
                        <option value="machines">Machine List (-M)</option>
                        <option value="shares">Share List (-S)</option>
                        <option value="password">Password Policy (-P)</option>
                        <option value="groups">Groups and Members (-G)</option>
                    </select>
                </div>

                <div className="tool-field">
                    <label>Username</label>
                    <input
                        type="text"
                        placeholder="administrator"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Optional"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Workgroup</label>
                    <input
                        type="text"
                        placeholder="WORKGROUP"
                        value={workgroup}
                        onChange={(e) => setWorkgroup(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>RID Range</label>
                    <input
                        type="text"
                        placeholder="500-550,1000-1050"
                        value={ridRange}
                        onChange={(e) => setRidRange(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Keep Searching RIDs</label>
                    <input
                        type="number"
                        placeholder="100"
                        value={keepSearching}
                        onChange={(e) => setKeepSearching(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Known User(s)</label>
                    <input
                        type="text"
                        placeholder="administrator,guest"
                        value={knownUsers}
                        onChange={(e) => setKnownUsers(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Share Names File</label>
                    <input
                        type="text"
                        placeholder="shares.txt"
                        value={shareFile}
                        onChange={(e) => setShareFile(e.target.value)}
                    />
                </div>
            </div>

            <div className="tool-options">
                <label>
                    <input
                        type="checkbox"
                        checked={detailed}
                        onChange={(e) => setDetailed(e.target.checked)}
                    />
                    Detailed (-d)
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={ridCycling}
                        onChange={(e) => setRidCycling(e.target.checked)}
                    />
                    RID Cycling (-r)
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={ldap}
                        onChange={(e) => setLdap(e.target.checked)}
                    />
                    LDAP Information (-l)
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={osInfo}
                        onChange={(e) => setOsInfo(e.target.checked)}
                    />
                    OS Information (-o)
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={printerInfo}
                        onChange={(e) => setPrinterInfo(e.target.checked)}
                    />
                    Printer Information (-i)
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={nmbLookup}
                        onChange={(e) => setNmbLookup(e.target.checked)}
                    />
                    NMB Lookup (-n)
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={verbose}
                        onChange={(e) => setVerbose(e.target.checked)}
                    />
                    Verbose (-v)
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={aggressive}
                        onChange={(e) => setAggressive(e.target.checked)}
                    />
                    Aggressive (-A)
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
                    disabled={isRunning || !command || !target}
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
                            toolName={tool?.tool_name || "Enum4Linux"}
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

export default Enum4LinuxParameters;