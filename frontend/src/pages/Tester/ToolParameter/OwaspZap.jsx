import { useState, useRef, useEffect } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";
import "./ToolCommon.css";

function OwaspZapParameters({ tool, parameters, setParameters, stageCode, onAdvanceStage }) {
    // Core options
    const [mode, setMode] = useState("cmd");
    const [targetUrl, setTargetUrl] = useState("");
    const [outputFile, setOutputFile] = useState("zap_results.html");
    const [session, setSession] = useState("");
    const [newSession, setNewSession] = useState("");
    const [config, setConfig] = useState("");
    const [host, setHost] = useState("");
    const [port, setPort] = useState("");
    const [silent, setSilent] = useState(false);
    const [optional, setOptional] = useState("");

    const [command, setCommand] = useState("");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [executionStatus, setExecutionStatus] = useState("waiting");

    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("");

    const terminalRef = useRef(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [output]);

    useEffect(() => {
        updateCommandPreview();
    }, [mode, targetUrl, outputFile, session, newSession, config, host, port, silent, optional]);

    const generateCommand = () => {
        let cmd = "zap.sh";

        // Mode
        if (mode === "cmd") {
            cmd += " -cmd";
        } else if (mode === "daemon") {
            cmd += " -daemon";
        } else if (mode === "silent") {
            cmd += " -silent";
        }

        // Target URL (quick scan)
        if (targetUrl) {
            cmd += ` -quickurl ${targetUrl}`;
            if (outputFile) {
                cmd += ` -quickout ${outputFile}`;
            }
        }

        // Session
        if (session) {
            cmd += ` -session ${session}`;
        }

        // New Session
        if (newSession) {
            cmd += ` -newsession ${newSession}`;
        }

        // Config
        if (config) {
            cmd += ` -config "${config}"`;
        }

        // Host
        if (host) {
            cmd += ` -host ${host}`;
        }

        // Port
        if (port) {
            cmd += ` -port ${port}`;
        }

        // Silent mode
        if (silent) {
            cmd += ` -silent`;
        }

        // Optional parameters
        if (optional) {
            cmd += ` ${optional}`;
        }

        return cmd;
    };

    const updateCommandPreview = () => {
        const cmd = generateCommand();
        setCommand(cmd);
    };

    const runCommand = async () => {
        const cmd = generateCommand();
        setIsRunning(true);
        setExecutionStatus("running");
        setOutput(prev => prev + `\n# ${cmd}\n`);

        try {
            const response = await fetch("http://127.0.0.1:8000/tools/run/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionStorage.getItem("access")}`
                },
                body: JSON.stringify({
                    command: cmd,
                    tool_id: tool?.id || null,
                    parameters: {
                        mode,
                        targetUrl,
                        outputFile,
                        session,
                        newSession,
                        config,
                        host,
                        port,
                        silent,
                        optional
                    }
                })
            });

            const data = await response.json();

            if (response.ok) {
                setOutput(prev => prev + `${data.output || 'Command executed successfully'}\n`);
                setExecutionStatus("success");
            } else {
                setOutput(prev => prev + `${data.message || 'Unknown error'}\n`);
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
        if (!filename.endsWith('.txt')) {
            filename = filename + '.txt';
        }

        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
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

    const handlePopupConfirm = async () => {
        if (popupType === "download") {
            downloadTxtFile(output, outputFile || "zap_results.txt");
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
                OWASP ZAP Configuration
                {tool && <span className="tool-badge">{tool.tool_name}</span>}
            </h3>

            <div className="tool-form">
                <div className="tool-field">
                    <label>Mode</label>
                    <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                    >
                        <option value="cmd">Command Line (Quick Scan)</option>
                        <option value="daemon">Daemon Mode</option>
                        <option value="silent">Silent Mode</option>
                    </select>
                </div>

                <div className="tool-field">
                    <label>Target URL</label>
                    <input
                        placeholder="https://example.com"
                        value={targetUrl}
                        onChange={(e) => setTargetUrl(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Output File</label>
                    <input
                        placeholder="zap_results.html"
                        value={outputFile}
                        onChange={(e) => setOutputFile(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Session File</label>
                    <input
                        placeholder="session.session"
                        value={session}
                        onChange={(e) => setSession(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>New Session</label>
                    <input
                        placeholder="/path/to/new/session.session"
                        value={newSession}
                        onChange={(e) => setNewSession(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Config (key=value)</label>
                    <input
                        placeholder="proxy.host=127.0.0.1 proxy.port=8080"
                        value={config}
                        onChange={(e) => setConfig(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Proxy Host</label>
                    <input
                        placeholder="127.0.0.1"
                        value={host}
                        onChange={(e) => setHost(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Proxy Port</label>
                    <input
                        type="number"
                        placeholder="8080"
                        value={port}
                        onChange={(e) => setPort(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Optional Parameters</label>
                    <input
                        placeholder="-addoninstall openapi -openapiurl https://example.com/swagger.json -autorun plan.yaml"
                        value={optional}
                        onChange={(e) => setOptional(e.target.value)}
                    />
                </div>
            </div>

            <div className="tool-options">
                <label>
                    <input
                        type="checkbox"
                        checked={silent}
                        onChange={(e) => setSilent(e.target.checked)}
                    />
                    Silent Mode (No update checks)
                </label>
            </div>

            <div className="command-area">
                <label>Generated Command</label>
                <div className="command-preview">
                    <span className="command-text">{command || "Command..."}</span>
                </div>
                <br />

                <button
                    className={`run-btn ${isRunning ? 'running' : ''}`}
                    onClick={runCommand}
                    disabled={isRunning || !command}
                >
                    {isRunning ? (
                        <><i className="fas fa-spinner fa-spin"></i> Running...</>
                    ) : (
                        <><i className="fas fa-play"></i>Run Command</>
                    )}
                </button>

                {output && (
                    <button
                        className="run-btn"
                        style={{
                            background: '#6b7a9a',
                            marginLeft: '10px',
                            padding: '12px 20px'
                        }}
                        onClick={clearTerminal}
                    >
                        <i className="fas fa-eraser"></i> Clear
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
                            toolName={tool?.tool_name || "OWASP ZAP"}
                            stageCode={stageCode}
                            onAdvanceStage={onAdvanceStage}
                        />
                        <button 
                            className="download-btn"
                            onClick={handleDownload}
                        >
                            <i className="fas fa-download"></i> Download TXT
                        </button>
                    </div>
                )}
            </div>

            {/* Confirmation Popup */}
            {showPopup && (
                <div className="popup-overlay" onClick={handlePopupCancel}>
                    <div className="popup-box confirm-popup" onClick={(e) => e.stopPropagation()}>
                        <h3><i className="fas fa-download"></i> Download File</h3>
                        
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

export default OwaspZapParameters;