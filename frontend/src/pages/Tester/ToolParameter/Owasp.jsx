import { useState, useRef, useEffect } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";
import "./ToolCommon.css";

function OwaspParameter({ tool, parameters, setParameters, stageCode, onAdvanceStage }) {
    const [zapMode, setZapMode] = useState("cmd");
    const [targetUrl, setTargetUrl] = useState("");
    const [outputFile, setOutputFile] = useState("zap_results.txt");
    const [optionalParams, setOptionalParams] = useState("");
    const [configParams, setConfigParams] = useState("");
    const [scanType, setScanType] = useState("quick");
    const [addonAction, setAddonAction] = useState("install");
    const [addonId, setAddonId] = useState("");
    const [sessionPath, setSessionPath] = useState("");
    const [reportFormat, setReportFormat] = useState("html");

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
    }, [zapMode, targetUrl, scanType, optionalParams, configParams, sessionPath, addonAction, addonId, reportFormat, outputFile]);

    const generateCommand = () => {
        let cmd = "zap.sh";

        if (zapMode === "cmd") {
            cmd += " -cmd";
        } else if (zapMode === "daemon") {
            cmd += " -daemon";
        } else if (zapMode === "silent") {
            cmd += " -silent";
        }

        if (sessionPath) {
            if (zapMode === "newsession") {
                cmd += ` -newsession ${sessionPath}`;
            } else {
                cmd += ` -session ${sessionPath}`;
            }
        }

        if (scanType === "quick" && targetUrl) {
            cmd += ` -quickurl ${targetUrl}`;
            if (outputFile) {
                cmd += ` -quickout ${outputFile}`;
            }
        } else if (scanType === "zapit" && targetUrl) {
            cmd += ` -zapit ${targetUrl}`;
        } else if (scanType === "openapi" && targetUrl) {
            cmd += ` -openapiurl ${targetUrl}`;
        } else if (scanType === "graphql" && targetUrl) {
            cmd += ` -graphqlurl ${targetUrl}`;
        } else if (scanType === "postman" && targetUrl) {
            cmd += ` -postmanurl ${targetUrl}`;
        }

        if (addonAction === "install" && addonId) {
            cmd += ` -addoninstall ${addonId}`;
        } else if (addonAction === "uninstall" && addonId) {
            cmd += ` -addonuninstall ${addonId}`;
        } else if (addonAction === "update") {
            cmd += " -addonupdate";
        } else if (addonAction === "list") {
            cmd += " -addonlist";
        }

        if (scanType === "autorun" && optionalParams) {
            cmd += ` -autorun ${optionalParams}`;
        }

        if (configParams) {
            cmd += ` -config ${configParams}`;
        }

        if (optionalParams && scanType !== "quick") {
            cmd += ` ${optionalParams}`;
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
        setOutput(prev => prev + `\n$ ${cmd}\n`);

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
                        zapMode,
                        targetUrl,
                        scanType,
                        optionalParams,
                        configParams,
                        sessionPath,
                        addonAction,
                        addonId,
                        reportFormat,
                        outputFile
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

    const handlePopupConfirm = () => {
        downloadTxtFile(output, outputFile || "zap_results.txt");
        setShowPopup(false);
        setPopupType("");
    };

    const handlePopupCancel = () => {
        setShowPopup(false);
        setPopupType("");
    };

    const saveParameters = () => {
        if (setParameters) {
            setParameters({
                zapMode,
                targetUrl,
                scanType,
                optionalParams,
                configParams,
                sessionPath,
                addonAction,
                addonId,
                reportFormat,
                outputFile,
                command,
                output,
                executionStatus
            });
        }
    };

    return (
        <div className="tool-box">
            <h3>
                OWASP ZAP Configuration
                {tool && <span className="tool-badge">{tool.tool_name}</span>}
            </h3>

            <div className="tool-form">
                <div className="tool-field">
                    <label>ZAP Mode</label>
                    <select
                        value={zapMode}
                        onChange={(e) => setZapMode(e.target.value)}
                    >
                        <option value="cmd">Command Line (cmd)</option>
                        <option value="daemon">Daemon Mode</option>
                        <option value="silent">Silent Mode</option>
                        <option value="newsession">New Session</option>
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
                    <label>Scan Type</label>
                    <select
                        value={scanType}
                        onChange={(e) => setScanType(e.target.value)}
                    >
                        <option value="quick">Quick Scan</option>
                        <option value="zapit">ZAP It (Reconnaissance)</option>
                        <option value="openapi">OpenAPI Scan</option>
                        <option value="graphql">GraphQL Scan</option>
                        <option value="postman">Postman Scan</option>
                        <option value="autorun">Automation (Autorun)</option>
                    </select>
                </div>

                <div className="tool-field">
                    <label>Session Path</label>
                    <input
                        placeholder="/path/to/session.session"
                        value={sessionPath}
                        onChange={(e) => setSessionPath(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Add-on Action</label>
                    <select
                        value={addonAction}
                        onChange={(e) => setAddonAction(e.target.value)}
                    >
                        <option value="none">None</option>
                        <option value="install">Install Add-on</option>
                        <option value="uninstall">Uninstall Add-on</option>
                        <option value="update">Update All Add-ons</option>
                        <option value="list">List Add-ons</option>
                    </select>
                </div>

                {addonAction !== "none" && addonAction !== "update" && addonAction !== "list" && (
                    <div className="tool-field">
                        <label>Add-on ID</label>
                        <input
                            placeholder="e.g., openapi"
                            value={addonId}
                            onChange={(e) => setAddonId(e.target.value)}
                        />
                    </div>
                )}

                <div className="tool-field">
                    <label>Output File</label>
                    <input
                        placeholder="zap_results.txt"
                        value={outputFile}
                        onChange={(e) => setOutputFile(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Config Parameters (key=value)</label>
                    <input
                        placeholder="key1=value1 key2=value2"
                        value={configParams}
                        onChange={(e) => setConfigParams(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Optional Parameters</label>
                    <input
                        placeholder="-host 127.0.0.1 -port 8080"
                        value={optionalParams}
                        onChange={(e) => setOptionalParams(e.target.value)}
                    />
                </div>
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
                        <><i className="fas fa-play"></i> Run Command</>
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

            {showPopup && (
                <div className="popup-overlay" onClick={handlePopupCancel}>
                    <div className="popup-box confirm-popup" onClick={(e) => e.stopPropagation()}>
                        <h3><i className="fas fa-download"></i> Download File</h3>
                        
                        <div className="popup-message">
                            <p>Do you want to download this output as a .txt file?</p>
                        </div>

                        {outputFile && (
                            <div className="popup-file-info">
                                <label>Filename</label>
                                <input
                                    type="text"
                                    value={outputFile}
                                    onChange={(e) => setOutputFile(e.target.value)}
                                />
                                <small>File will be saved as a text file.</small>
                            </div>
                        )}

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

export default OwaspParameter;