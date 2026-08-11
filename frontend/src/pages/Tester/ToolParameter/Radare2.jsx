import { useState, useRef, useEffect } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";

function Radare2Parameters({ tool, parameters, setParameters, stageCode, onAdvanceStage }) {
    // Command types based on radare2 help
    const [commandType, setCommandType] = useState("basic");
    const [mode, setMode] = useState("default");
    const [target, setTarget] = useState("");
    const [optional, setOptional] = useState("");

    const [command, setCommand] = useState("");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [executionStatus, setExecutionStatus] = useState("waiting");

    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [outputFile, setOutputFile] = useState("radare2_results.txt");

    const terminalRef = useRef(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [output]);

    useEffect(() => {
        updateCommandPreview();
    }, [commandType, mode, target, optional]);

    const generateCommand = () => {
        let cmd = "r2";

        // Basic command type
        if (commandType === "agent") {
            cmd = "r2agent";
        } else if (commandType === "pm") {
            cmd = "r2pm";
        } else if (commandType === "r") {
            cmd = "r2r";
        } else if (commandType === "sdb") {
            cmd = "r2sdb";
        }

        // Mode/options based on command type
        if (cmd === "r2") {
            if (mode === "debug") cmd += " -d";
            else if (mode === "write") cmd += " -w";
            else if (mode === "quiet") cmd += " -q";
            else if (mode === "analyze") cmd += " -A";
            else if (mode === "sandbox") cmd += " -S";
            
            if (target) {
                cmd += ` ${target}`;
            }
        } else if (cmd === "r2agent") {
            if (mode === "daemon") cmd += " -d";
            else if (mode === "sandbox") cmd += " -s";
            else if (mode === "auth") cmd += " -u";
            else if (mode === "all") cmd += " -a";
            
            if (target) {
                cmd += ` -p ${target}`;
            }
        } else if (cmd === "r2pm") {
            if (mode === "install") {
                cmd += ` -i ${target || "package"}`;
            } else if (mode === "uninstall") {
                cmd += ` -u ${target || "package"}`;
            } else if (mode === "list") {
                cmd += " -l";
            } else if (mode === "update") {
                cmd += " -U";
            } else if (mode === "search") {
                cmd += ` -s ${target || "keyword"}`;
            }
        } else if (cmd === "r2r") {
            if (mode === "verbose") cmd += " -V";
            else if (mode === "quiet") cmd += " -q";
            else if (mode === "interactive") cmd += " -i";
            
            if (target) {
                cmd += ` ${target}`;
            }
        } else if (cmd === "r2sdb") {
            if (mode === "count") cmd += " -c";
            else if (mode === "json") cmd += " -j";
            else if (mode === "decode") cmd += " -d";
            else if (mode === "encode") cmd += " -e";
            
            if (target) {
                cmd += ` ${target}`;
            }
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
                        commandType,
                        mode,
                        target,
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
            downloadTxtFile(output, outputFile || "radare2_results.txt");
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
                commandType,
                mode,
                target,
                optional,
                command,
                output,
                executionStatus
            });
        }
    };

    // Get placeholder text based on mode
    const getPlaceholder = () => {
        if (commandType === "r2") return "binary_file";
        if (commandType === "agent") return "8080";
        if (commandType === "pm") return "package_name";
        if (commandType === "r") return "test_file";
        if (commandType === "sdb") return "database.sdb";
        return "arguments";
    };

    // Get mode options based on command type
    const getModeOptions = () => {
        switch(commandType) {
            case "r2":
                return [
                    { value: "default", label: "Default" },
                    { value: "debug", label: "Debug Mode (-d)" },
                    { value: "write", label: "Write Mode (-w)" },
                    { value: "quiet", label: "Quiet Mode (-q)" },
                    { value: "analyze", label: "Analyze (-A)" },
                    { value: "sandbox", label: "Sandbox (-S)" },
                ];
            case "agent":
                return [
                    { value: "default", label: "Default" },
                    { value: "daemon", label: "Daemon Mode (-d)" },
                    { value: "sandbox", label: "Sandbox (-s)" },
                    { value: "auth", label: "Auth Enabled (-u)" },
                    { value: "all", label: "Listen All (-a)" },
                ];
            case "pm":
                return [
                    { value: "install", label: "Install Package (-i)" },
                    { value: "uninstall", label: "Uninstall Package (-u)" },
                    { value: "list", label: "List Installed (-l)" },
                    { value: "update", label: "Update Database (-U)" },
                    { value: "search", label: "Search Package (-s)" },
                ];
            case "r":
                return [
                    { value: "default", label: "Default" },
                    { value: "verbose", label: "Verbose (-V)" },
                    { value: "quiet", label: "Quiet (-q)" },
                    { value: "interactive", label: "Interactive (-i)" },
                ];
            case "sdb":
                return [
                    { value: "default", label: "Default" },
                    { value: "count", label: "Count Keys (-c)" },
                    { value: "json", label: "JSON Output (-j)" },
                    { value: "decode", label: "Decode Base64 (-d)" },
                    { value: "encode", label: "Encode Base64 (-e)" },
                ];
            default:
                return [{ value: "default", label: "Default" }];
        }
    };

    return (
        <div className="radare2-box">
            <h3>
                Radare2 Configuration
                {tool && <span className="tool-badge">{tool.tool_name}</span>}
            </h3>

            <div className="radare2-form">
                <div className="radare2-field">
                    <label>Command</label>
                    <select
                        value={commandType}
                        onChange={(e) => {
                            setCommandType(e.target.value);
                            setMode("default");
                            setTarget("");
                        }}
                    >
                        <option value="r2">r2 - Radare2 Core</option>
                        <option value="agent">r2agent - HTTP Server</option>
                        <option value="pm">r2pm - Package Manager</option>
                        <option value="r">r2r - Test Runner</option>
                        <option value="sdb">r2sdb - Database Tool</option>
                    </select>
                </div>

                <div className="radare2-field">
                    <label>Mode</label>
                    <select
                        value={mode}
                        onChange={(e) => {
                            setMode(e.target.value);
                            setTarget("");
                        }}
                    >
                        {getModeOptions().map(opt => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="radare2-field">
                    <label>Target / File</label>
                    <input
                        placeholder={getPlaceholder()}
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        disabled={mode === "default" || mode === "list" || mode === "update"}
                    />
                </div>

                <div className="radare2-field">
                    <label>Optional Parameters</label>
                    <input
                        placeholder="-e asm.arch=x86 -c 'pdf'"
                        value={optional}
                        onChange={(e) => setOptional(e.target.value)}
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
                            toolName={tool?.tool_name || "Radare2"}
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

            {/* Confirmation Popup (download only) */}
            {showPopup && (
                <div className="popup-overlay" onClick={handlePopupCancel}>
                    <div className="popup-box confirm-popup" onClick={(e) => e.stopPropagation()}>
                        <h3><i className="fas fa-download"></i> Download File</h3>
                        
                        <div className="popup-message">
                            <p>Do you want to download this output as a .txt file?</p>
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

            <style jsx>{`
                .radare2-box {
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    margin: 16px 0;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                }

                .radare2-box h3 {
                    margin: 0 0 20px 0;
                    color: #1a1a1a;
                    font-size: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .radare2-form {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    margin-bottom: 20px;
                }

                .radare2-field {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .radare2-field label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #333;
                }

                .radare2-field select,
                .radare2-field input {
                    padding: 8px 12px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 14px;
                    transition: border-color 0.3s ease;
                }

                .radare2-field select:focus,
                .radare2-field input:focus {
                    outline: none;
                    border-color: #4a6cf7;
                    box-shadow: 0 0 0 3px rgba(74,108,247,0.1);
                }

                .radare2-field input:disabled {
                    background: #f5f5f5;
                    cursor: not-allowed;
                }

                .command-area {
                    margin-top: 16px;
                }

                .command-area label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #333;
                    display: block;
                    margin-bottom: 8px;
                }

                .command-preview {
                    background: #f8f9fa;
                    padding: 12px 16px;
                    border-radius: 6px;
                    font-family: monospace;
                    font-size: 14px;
                    border: 1px solid #e9ecef;
                    margin-bottom: 12px;
                    overflow-x: auto;
                }

                .command-text {
                    color: #2d3748;
                }

                .run-btn {
                    padding: 10px 24px;
                    background: #4a6cf7;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.3s ease;
                }

                .run-btn:hover:not(:disabled) {
                    background: #3a5cd5;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(74,108,247,0.3);
                }

                .run-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .run-btn.running {
                    background: #6c757d;
                }

                .terminal {
                    background: #1a1a2e;
                    color: #e0e0e0;
                    padding: 16px;
                    border-radius: 8px;
                    font-family: 'Courier New', monospace;
                    font-size: 13px;
                    min-height: 120px;
                    max-height: 300px;
                    overflow-y: auto;
                    margin-top: 8px;
                    position: relative;
                }

                .terminal pre {
                    margin: 0;
                    white-space: pre-wrap;
                    word-break: break-all;
                }

                .action-buttons {
                    display: flex;
                    gap: 10px;
                    margin-top: 10px;
                    flex-wrap: wrap;
                }

                .pass-to-ai-btn {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }

                .pass-to-ai-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                }

                .pass-to-ai-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .download-btn {
                    background: #28a745;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }

                .download-btn:hover:not(:disabled) {
                    background: #218838;
                    transform: translateY(-2px);
                }

                .download-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .tool-badge {
                    background: #4a6cf7;
                    color: white;
                    padding: 2px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 400;
                    margin-left: 10px;
                }

                .cursor {
                    display: inline-block;
                    width: 8px;
                    height: 18px;
                    background: #4a6cf7;
                    animation: blink 1s infinite;
                    margin-left: 2px;
                    vertical-align: middle;
                }

                @keyframes blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0; }
                }

                .popup-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(4px);
                }

                .popup-box {
                    background: white;
                    border-radius: 12px;
                    padding: 30px;
                    max-width: 600px;
                    width: 90%;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                    animation: slideIn 0.3s ease;
                }

                @keyframes slideIn {
                    from {
                        transform: translateY(-30px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                .popup-box h3 {
                    margin: 0 0 20px 0;
                    color: #1a1a1a;
                    font-size: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .popup-message {
                    margin-bottom: 20px;
                    color: #444;
                    line-height: 1.5;
                }

                .popup-file-info {
                    margin: 15px 0;
                    padding: 12px;
                    background: #f8f9fa;
                    border-radius: 6px;
                }

                .popup-file-info label {
                    display: block;
                    font-weight: 500;
                    margin-bottom: 5px;
                    color: #333;
                }

                .popup-file-info input {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 14px;
                }

                .popup-file-info small {
                    display: block;
                    margin-top: 4px;
                    color: #666;
                    font-size: 12px;
                }

                .popup-preview {
                    margin: 15px 0;
                }

                .popup-preview label {
                    display: block;
                    font-weight: 500;
                    margin-bottom: 8px;
                    color: #333;
                }

                .preview-text {
                    background: #f8f9fa;
                    padding: 12px;
                    border-radius: 6px;
                    font-family: monospace;
                    font-size: 13px;
                    max-height: 100px;
                    overflow-y: auto;
                    white-space: pre-wrap;
                    word-break: break-all;
                    color: #555;
                }

                .popup-buttons {
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                    margin-top: 20px;
                }

                .popup-cancel-btn {
                    padding: 10px 24px;
                    background: #e9ecef;
                    color: #333;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }

                .popup-cancel-btn:hover {
                    background: #dee2e6;
                }

                .popup-confirm-btn {
                    padding: 10px 24px;
                    background: #4a6cf7;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }

                .popup-confirm-btn:hover {
                    background: #3a5cd5;
                    transform: translateY(-1px);
                }

                .analysis-popup {
                    max-width: 700px;
                    max-height: 80vh;
                    display: flex;
                    flex-direction: column;
                }

                .analysis-popup-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #e9ecef;
                    padding-bottom: 15px;
                    margin-bottom: 15px;
                }

                .analysis-popup-header h3 {
                    margin: 0;
                    color: #1a1a1a;
                    font-size: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .close-popup-btn {
                    background: none;
                    border: none;
                    font-size: 20px;
                    color: #999;
                    cursor: pointer;
                    padding: 4px 8px;
                    border-radius: 4px;
                    transition: all 0.3s ease;
                }

                .close-popup-btn:hover {
                    background: #f5f5f5;
                    color: #333;
                }

                .analysis-popup-body {
                    flex: 1;
                    overflow-y: auto;
                    margin-bottom: 15px;
                    min-height: 100px;
                    max-height: 400px;
                }

                .loading-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 20px;
                    text-align: center;
                }

                .spinner {
                    width: 50px;
                    height: 50px;
                    border: 4px solid #e9ecef;
                    border-top: 4px solid #4a6cf7;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 20px;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .loading-container p {
                    margin: 5px 0;
                    color: #333;
                    font-size: 16px;
                }

                .loading-subtext {
                    color: #999 !important;
                    font-size: 14px !important;
                }

                .analysis-content {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    white-space: pre-wrap;
                    font-family: inherit;
                    line-height: 1.6;
                    color: #333;
                }

                .analysis-content p {
                    margin: 0 0 8px 0;
                }

                .error-message {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 20px;
                    background: #fff5f5;
                    border-radius: 8px;
                    color: #dc3545;
                }

                .error-message i {
                    font-size: 24px;
                }

                .analysis-popup-footer {
                    border-top: 1px solid #e9ecef;
                    padding-top: 15px;
                    display: flex;
                    justify-content: flex-end;
                }

                .continue-btn {
                    padding: 10px 30px;
                    background: #4a6cf7;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 15px;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.3s ease;
                }

                .continue-btn:hover:not(:disabled) {
                    background: #3a5cd5;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(74, 108, 247, 0.3);
                }

                .continue-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                @media (max-width: 768px) {
                    .radare2-form {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}

export default Radare2Parameters;