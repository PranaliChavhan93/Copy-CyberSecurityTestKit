import { useEffect, useRef, useState } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";
import "./ToolCommon.css";

function CrackMapExecParameters({
    tool,
    parameters,
    setParameters,
    stageCode,
    onAdvanceStage
}) {
    const [target, setTarget] = useState("");
    const [protocol, setProtocol] = useState("smb");
    const [threads, setThreads] = useState("");
    const [timeout, setTimeoutValue] = useState("");
    const [jitter, setJitter] = useState("");
    const [darrell, setDarrell] = useState(false);
    const [verbose, setVerbose] = useState(false);

    const [command, setCommand] = useState("");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [executionStatus, setExecutionStatus] = useState("waiting");

    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("");
    const [outputFile, setOutputFile] = useState("crackmapexec_results.txt");

    const terminalRef = useRef(null);

    useEffect(() => {
        terminalRef.current?.scrollTo(0, terminalRef.current.scrollHeight);
    }, [output]);

    useEffect(() => {
        setCommand(generateCommand());
    }, [target, protocol, threads, timeout, jitter, darrell, verbose]);

    const generateCommand = () => {
        let cmd = `crackmapexec ${protocol}`;

        if (threads) cmd += ` -t ${threads}`;
        if (timeout) cmd += ` --timeout ${timeout}`;
        if (jitter) cmd += ` --jitter ${jitter}`;
        if (darrell) cmd += " --darrell";
        if (verbose) cmd += " --verbose";
        if (target) cmd += ` ${target}`;

        return cmd;
    };

    const runCommand = async () => {
        const cmd = generateCommand();

        setIsRunning(true);
        setExecutionStatus("running");
        setOutput(prev => `${prev}\n# ${cmd}\n`);

        try {
            const response = await fetch("http://127.0.0.1:8000/tools/run/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${sessionStorage.getItem("access")}`
                },
                body: JSON.stringify({
                    command: cmd,
                    tool_id: tool?.id || null,
                    parameters: {
                        target,
                        protocol,
                        threads,
                        timeout,
                        jitter,
                        darrell,
                        verbose
                    }
                })
            });

            const data = await response.json();

            if (response.ok) {
                setOutput(prev => `${prev}${data.output || "Command executed successfully"}\n`);
                setExecutionStatus("success");
            } else {
                setOutput(prev => `${prev}${data.message || "Unknown error"}\n`);
                setExecutionStatus("error");
            }
        } catch (error) {
            setOutput(prev => `${prev}${error.message}\n`);
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
        const name = filename.endsWith(".txt") ? filename : `${filename}.txt`;
        const url = window.URL.createObjectURL(
            new Blob([content], { type: "text/plain" })
        );
        const link = document.createElement("a");

        link.href = url;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        link.remove();
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
                outputFile || "crackmapexec_results.txt"
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
        setParameters?.({
            target,
            protocol,
            threads,
            timeout,
            jitter,
            darrell,
            verbose,
            command,
            output,
            executionStatus
        });
    };

    return (
        <div className="tool-box">
            <h3>
                CrackMapExec Configuration
                {tool && <span className="tool-badge">{tool.tool_name}</span>}
            </h3>

            <div className="tool-form">
                <div className="tool-field">
                    <label>Target IP / Host</label>
                    <input
                        type="text"
                        placeholder="192.168.1.10"
                        value={target}
                        onChange={e => setTarget(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Protocol</label>
                    <select
                        value={protocol}
                        onChange={e => setProtocol(e.target.value)}
                    >
                        <option value="smb">SMB</option>
                        <option value="winrm">WINRM</option>
                        <option value="mssql">MSSQL</option>
                        <option value="ftp">FTP</option>
                        <option value="ssh">SSH</option>
                        <option value="rdp">RDP</option>
                        <option value="ldap">LDAP</option>
                    </select>
                </div>

                <div className="tool-field">
                    <label>Threads</label>
                    <input
                        type="number"
                        placeholder="100"
                        value={threads}
                        onChange={e => setThreads(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Timeout</label>
                    <input
                        type="number"
                        placeholder="Seconds"
                        value={timeout}
                        onChange={e => setTimeoutValue(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Jitter Interval</label>
                    <input
                        type="text"
                        placeholder="e.g. 1-3"
                        value={jitter}
                        onChange={e => setJitter(e.target.value)}
                    />
                </div>
            </div>

            <div className="tool-options">
                <label>
                    <input
                        type="checkbox"
                        checked={darrell}
                        onChange={e => setDarrell(e.target.checked)}
                    />
                    Darrell
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={verbose}
                        onChange={e => setVerbose(e.target.checked)}
                    />
                    Verbose
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
                    className={`run-btn ${isRunning ? "running" : ""}`}
                    onClick={runCommand}
                    disabled={isRunning || !command || !target}
                >
                    {isRunning ? (
                        <>
                            <i className="fas fa-spinner fa-spin" /> Running...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-play" /> Run Command
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
                        <i className="fas fa-eraser" /> Clear
                    </button>
                )}
            </div>

            <div className="command-area">
                <label>Terminal Output</label>

                <div className="terminal" ref={terminalRef}>
                    <pre>
                        {output || "Waiting for execution..."}
                        {isRunning && <span className="cursor" />}
                    </pre>
                </div>

                {output && output !== "Waiting for execution..." && (
                    <div className="action-buttons">
                        <AIAnalysisPanel
                            output={output}
                            toolName={tool?.tool_name || "CrackMapExec"}
                            stageCode={stageCode}
                            onAdvanceStage={onAdvanceStage}
                        />

                        <button
                            className="download-btn"
                            onClick={handleDownload}
                        >
                            <i className="fas fa-download" /> Download TXT
                        </button>
                    </div>
                )}
            </div>

            {showPopup && (
                <div
                    className="popup-overlay"
                    onClick={handlePopupCancel}
                >
                    <div
                        className="popup-box confirm-popup"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3>
                            <i className="fas fa-download" /> Download File
                        </h3>

                        <div className="popup-message">
                            <p>
                                Do you want to download this output as a .txt
                                file?
                            </p>
                        </div>

                        <div className="popup-file-info">
                            <label>File Name</label>
                            <input
                                type="text"
                                value={outputFile}
                                onChange={e => setOutputFile(e.target.value)}
                            />
                            <small>
                                The output will be saved as a text file.
                            </small>
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

export default CrackMapExecParameters;