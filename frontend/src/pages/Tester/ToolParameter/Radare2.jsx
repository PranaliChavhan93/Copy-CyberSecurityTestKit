import { useState, useRef, useEffect } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";
import "./ToolCommon.css";

function Radare2Parameters({ tool, parameters, setParameters, stageCode, onAdvanceStage }) {
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

        if (commandType === "agent") {
            cmd = "r2agent";
        } else if (commandType === "pm") {
            cmd = "r2pm";
        } else if (commandType === "r") {
            cmd = "r2r";
        } else if (commandType === "sdb") {
            cmd = "r2sdb";
        }

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

    const getPlaceholder = () => {
        if (commandType === "r2") return "binary_file";
        if (commandType === "agent") return "8080";
        if (commandType === "pm") return "package_name";
        if (commandType === "r") return "test_file";
        if (commandType === "sdb") return "database.sdb";
        return "arguments";
    };

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
        <div className="tool-box">
            <h3>
                Radare2 Configuration
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
                        <option value="r2">r2 - Radare2 Core</option>
                        <option value="agent">r2agent - HTTP Server</option>
                        <option value="pm">r2pm - Package Manager</option>
                        <option value="r">r2r - Test Runner</option>
                        <option value="sdb">r2sdb - Database Tool</option>
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
                        {getModeOptions().map(opt => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="tool-field">
                    <label>Target / File</label>
                    <input
                        placeholder={getPlaceholder()}
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        disabled={mode === "default" || mode === "list" || mode === "update"}
                    />
                </div>

                <div className="tool-field">
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

                    // <div className="action-buttons">
                    //     <div className="left-buttons">
                    //         <AIAnalysisPanel
                    //             output={output}
                    //             toolName={tool?.tool_name || "ToolName"}
                    //             stageCode={stageCode}
                    //             onAdvanceStage={onAdvanceStage}
                    //         />
                    //     </div>
                    //     <div className="right-buttons">
                    //         <button 
                    //             className="download-btn"
                    //             onClick={handleDownload}
                    //         >
                    //             <i className="fas fa-download"></i> Download TXT
                    //         </button>
                    //     </div>
                    // </div>
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

export default Radare2Parameters;