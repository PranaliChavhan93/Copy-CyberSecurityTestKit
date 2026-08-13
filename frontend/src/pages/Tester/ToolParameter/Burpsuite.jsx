import { useState, useRef, useEffect } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";
import "./ToolCommon.css";

function BurpSuiteParameters({ tool, parameters, setParameters, stageCode, onAdvanceStage }) {
    const [commandType, setCommandType] = useState("gui");
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
    const [outputFile, setOutputFile] = useState("burpsuite_results.txt");

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
        let cmd = "burpsuite";

        if (commandType === "headless") {
            cmd += " --headless";
        } else if (commandType === "collaborator") {
            cmd += " --collaborator-server";
        } else if (commandType === "diagnostics") {
            cmd += " --diagnostics";
        }

        if (mode === "disable-extensions" && commandType === "gui") {
            cmd += " --disable-extensions";
        } else if (mode === "use-defaults" && commandType === "gui") {
            cmd += " --use-defaults";
        } else if (mode === "disable-auto-update" && commandType === "gui") {
            cmd += " --disable-auto-update";
        } else if (mode === "project-file" && commandType === "headless") {
            if (target) {
                cmd += ` --project-file ${target}`;
            } else {
                cmd += ` --project-file project.burp`;
            }
        } else if (mode === "config-file" && commandType === "headless") {
            if (target) {
                cmd += ` --config-file ${target}`;
            }
        } else if (mode === "user-config-file" && commandType === "headless") {
            if (target) {
                cmd += ` --user-config-file ${target}`;
            }
        } else if (mode === "config" && commandType === "collaborator") {
            if (target) {
                cmd += ` --collaborator-config ${target}`;
            }
        }

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
            downloadTxtFile(output, outputFile || "burpsuite_results.txt");
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

    const getPlaceholder = () => {
        if (mode === "project-file") return "project.burp";
        if (mode === "config-file") return "config.json";
        if (mode === "user-config-file") return "user-config.json";
        if (mode === "config") return "collaborator.config";
        return "--data-dir /path/to/data";
    };

    return (
        <div className="tool-box">
            <h3>
                BurpSuite Configuration
                {tool && <span className="tool-badge">{tool.tool_name}</span>}
            </h3>

            <div className="tool-form">
                <div className="tool-field">
                    <label>Command</label>
                    <select
                        value={commandType}
                        onChange={(e) => {
                            setCommandType(e.target.value);
                            setMode("default");
                            setTarget("");
                        }}
                    >
                        <option value="gui">GUI Mode</option>
                        <option value="headless">Headless Mode</option>
                        <option value="collaborator">Collaborator Server</option>
                        <option value="diagnostics">Diagnostics</option>
                    </select>
                </div>

                <div className="tool-field">
                    <label>Mode</label>
                    <select
                        value={mode}
                        onChange={(e) => {
                            setMode(e.target.value);
                            setTarget("");
                        }}
                    >
                        {commandType === "gui" && (
                            <>
                                <option value="default">Default</option>
                                <option value="disable-extensions">Disable Extensions</option>
                                <option value="use-defaults">Use Default Settings</option>
                                <option value="disable-auto-update">Disable Auto Update</option>
                            </>
                        )}
                        {commandType === "headless" && (
                            <>
                                <option value="default">Default</option>
                                <option value="project-file">With Project File</option>
                                <option value="config-file">With Config File</option>
                                <option value="user-config-file">With User Config</option>
                            </>
                        )}
                        {commandType === "collaborator" && (
                            <>
                                <option value="default">Default</option>
                                <option value="config">With Config File</option>
                            </>
                        )}
                        {commandType === "diagnostics" && (
                            <option value="default">Default</option>
                        )}
                    </select>
                </div>

                <div className="tool-field">
                    <label>Target / File</label>
                    <input
                        placeholder={getPlaceholder()}
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        disabled={mode === "default" || mode === "disable-extensions" || mode === "use-defaults" || mode === "disable-auto-update"}
                    />
                </div>

                <div className="tool-field">
                    <label>Optional Parameters</label>
                    <input
                        placeholder="--data-dir /path/to/data --version"
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
                            toolName={tool?.tool_name || "BurpSuite"}
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

export default BurpSuiteParameters;