
// import { useState, useRef, useEffect } from "react";

// function AmassParameters() {

//     const [commandType, setCommandType] = useState("enum");
//     const [mode, setMode] = useState("passive");
//     const [target, setTarget] = useState("");
//     const [optional, setOptional] = useState("");

//     const [command, setCommand] = useState("");
//     const [output, setOutput] = useState("");
//     const [isRunning, setIsRunning] = useState(false);
//     const [executionStatus, setExecutionStatus] = useState("waiting");


//     const terminalRef = useRef(null);

//     useEffect(() => {
//         if (terminalRef.current) {
//             terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
//         }
//     }, [output]);

//     const generateCommand = () => {
//         let cmd = `amass ${commandType}`;

//         if (mode && commandType !== "db") {
//             cmd += ` -${mode}`;
//         }

//         if (target) {
//             cmd += ` -d ${target}`;
//         }

//         if (optional) {
//             cmd += ` ${optional}`;
//         }

//         return cmd;
//     };

//     const updateCommandPreview = () => {
//         const cmd = generateCommand();
//         setCommand(cmd);
//     };

//     const runCommand = async () => {
//         const cmd = generateCommand();
//         setIsRunning(true);
//         setExecutionStatus("running");
//         // setOutput(prev => prev + `\n$ ${cmd}\n`);

//         try {
//             const response = await fetch("http://127.0.0.1:8000/tools/run/", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json"
//                 },
//                 body: JSON.stringify({
//                     command: cmd
//                 })
//             });

//             const data = await response.json();

//             if (response.ok) {
//                 setOutput(prev => prev + `${data.output || 'Command executed successfully'}\n`);
//                 setExecutionStatus("success");
//             } else {
//                 setOutput(prev => prev + `${data.message || 'Unknown error'}\n`);
//                 setExecutionStatus("error");
//             }
//         } catch (error) {
//             setOutput(prev => prev + `${error.message}\n`);
//             setExecutionStatus("error");
//         } finally {
//             setIsRunning(false);
//         }
//     };

//     const clearTerminal = () => {
//         setOutput("");
//         setExecutionStatus("waiting");
//     };

//     useEffect(() => {
//         updateCommandPreview();
//     }, [commandType, mode, target, optional]);

//     const getCommandTypeDisplay = (type) => {
//         const types = {
//             enum: "Enumeration",
//             intel: "Intelligence",
//             db: "Database",
//             viz: "Visualization",
//             track: "Tracking"
//         };
//         return types[type] || type;
//     };

//     const getModeDisplay = (mode) => {
//         const modes = {
//             passive: "Passive",
//             active: "Active",
//             brute: "Brute Force",
//             alts: "Alterations",
//             ip: "IP Resolve",
//             whois: "WHOIS"
//         };
//         return modes[mode] || mode;
//     };

//     return (
//         <div className="amass-box">
//             <h3>
//                 Amass Configuration
//             </h3>

//             <div className="amass-form">
//                 <div className="amass-field">
//                     <label>
//                         Command
//                     </label>
//                     <select
//                         value={commandType}
//                         onChange={(e) => setCommandType(e.target.value)}
//                     >
//                         <option value="enum">Enumeration</option>
//                         <option value="intel">Intelligence</option>
//                         <option value="db">Database</option>
//                         <option value="viz">Visualization</option>
//                         <option value="track">Tracking</option>
//                     </select>
//                 </div>

//                 <div className="amass-field">
//                     <label>
//                         Mode
//                     </label>
//                     <select
//                         value={mode}
//                         onChange={(e) => setMode(e.target.value)}
//                         disabled={commandType === "db"}
//                     >
//                         <option value="passive">Passive</option>
//                         <option value="active">Active</option>
//                         <option value="brute">Brute Force</option>
//                         <option value="alts">Alterations</option>
//                         <option value="ip">IP Resolve</option>
//                         <option value="whois">WHOIS</option>
//                     </select>
//                 </div>

//                 <div className="amass-field">
//                     <label>
//                         Domain / Target
//                     </label>
//                     <input
//                         placeholder="example.com"
//                         value={target}
//                         onChange={(e) => setTarget(e.target.value)}
//                     />
//                 </div>

//                 <div className="amass-field">
//                     <label>
//                         Optional Parameters
//                     </label>
//                     <input
//                         placeholder="-o output.txt"
//                         value={optional}
//                         onChange={(e) => setOptional(e.target.value)}
//                     />
//                 </div>
//             </div>

//             <div className="command-area">
//                 <label>
//                     Generated Command
//                 </label>
//                 <div className="command-preview">
//                     <span className="command-text">{command || "Command..."}</span>
//                 </div>
//                 <br />

//                 <button
//                     className={`run-btn ${isRunning ? 'running' : ''}`}
//                     onClick={runCommand}
//                     disabled={isRunning || !command}
//                 >
//                     {isRunning ? (
//                         <><i className="fas fa-spinner fa-spin"></i> Running...</>
//                     ) : (
//                         <><i className="fas fa-play"></i> Run Command</>
//                     )}
//                 </button>

//                 {output && (
//                     <button
//                         className="run-btn"
//                         style={{
//                             background: '#6b7a9a',
//                             marginLeft: '10px',
//                             padding: '12px 20px'
//                         }}
//                         onClick={clearTerminal}
//                     >
//                         <i className="fas fa-eraser"></i> Clear
//                     </button>
//                 )}
//             </div>

//             <div className="command-area">
//                 <div className="terminal" ref={terminalRef}>
//                     <pre>
//                         {output || "Waiting for execution..."}
//                         {isRunning && 
//                             <span className="cursor"></span>
//                         }
//                     </pre>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default AmassParameters;


import { useState, useRef, useEffect } from "react";

function AmassParameters({ tool, parameters, setParameters }) {
    const [commandType, setCommandType] = useState("enum");
    const [mode, setMode] = useState("passive");
    const [target, setTarget] = useState("");
    const [optional, setOptional] = useState("");

    const [command, setCommand] = useState("");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [executionStatus, setExecutionStatus] = useState("waiting");

    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("");
    const [aiFeedback, setAiFeedback] = useState("");
    const [outputFile, setOutputFile] = useState("amass_results.txt");

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
        let cmd = `amass ${commandType}`;

        if (mode && commandType !== "db") {
            cmd += ` -${mode}`;
        }

        if (target) {
            cmd += ` -d ${target}`;
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

    const getCommandTypeDisplay = (type) => {
        const types = {
            enum: "Enumeration",
            intel: "Intelligence",
            db: "Database",
            viz: "Visualization",
            track: "Tracking"
        };
        return types[type] || type;
    };

    const getModeDisplay = (mode) => {
        const modes = {
            passive: "Passive",
            active: "Active",
            brute: "Brute Force",
            alts: "Alterations",
            ip: "IP Resolve",
            whois: "WHOIS"
        };
        return modes[mode] || mode;
    };

    const downloadTxtFile = (content, filename) => {
        if (!filename.endsWith('.txt')) 
        {
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

    const sendToAI = async (content) => {
        try {
            const response = await fetch("http://127.0.0.1:8000/ai/analyze/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionStorage.getItem("access")}`
                },
                body: JSON.stringify({
                    output: content,
                    tool_name: tool?.tool_name || "Amass"
                })
            });
            const data = await response.json();
            console.log("AI Response:", data);
            
            setOutput(prev => prev + `${data.analysis || 'Analysis complete'}\n`);
        } catch (error) {
            console.error("AI Error:", error);
            setOutput(prev => prev + `${error.message}\n`);
        }
    };

    const handlePassToAI = () => {
        if (!output || output === "Waiting for execution...") {
            alert("No output available! Please run the command first.");
            return;
        }
        setPopupType("ai");
        setShowPopup(true);
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
        if (popupType === "ai") {
            sendToAI(output);
            setShowPopup(false);
            setPopupType("");
        } else if (popupType === "download") {
            downloadTxtFile(output, outputFile || "amass_results.txt");
            setShowPopup(false);
            setPopupType("");
        }
    };

    const handlePopupCancel = () => {
        setShowPopup(false);
        setPopupType("");
        setAiFeedback("");
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

    return (
        <div className="amass-box">
            <h3>
                Amass Configuration
                {tool && <span className="tool-badge">{tool.tool_name}</span>}
            </h3>

            <div className="amass-form">
                <div className="amass-field">
                    <label>
                        Command
                    </label>
                    <select
                        value={commandType}
                        onChange={(e) => setCommandType(e.target.value)}
                    >
                        <option value="enum">Enumeration</option>
                        <option value="intel">Intelligence</option>
                        <option value="db">Database</option>
                        <option value="viz">Visualization</option>
                        <option value="track">Tracking</option>
                    </select>
                </div>

                <div className="amass-field">
                    <label>
                        Mode
                    </label>
                    <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                        disabled={commandType === "db"}
                    >
                        <option value="passive">Passive</option>
                        <option value="active">Active</option>
                        <option value="brute">Brute Force</option>
                        <option value="alts">Alterations</option>
                        <option value="ip">IP Resolve</option>
                        <option value="whois">WHOIS</option>
                    </select>
                </div>

                <div className="amass-field">
                    <label>
                        Domain / Target
                    </label>
                    <input
                        placeholder="example.com"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                    />
                </div>

                <div className="amass-field">
                    <label>
                        Optional Parameters
                    </label>
                    <input
                        placeholder="-o output.txt"
                        value={optional}
                        onChange={(e) => setOptional(e.target.value)}
                    />
                </div>
            </div>

            <div className="command-area">
                <label>
                    Generated Command
                </label>
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
                        {isRunning && 
                            <span className="cursor"></span>
                        }
                    </pre>
                </div>
                {output && 
                    output !== 
                    "Waiting for execution..." && (
                    <div className="action-buttons">
                        <button 
                            className="pass-to-ai-btn"
                            onClick={handlePassToAI}
                        >
                            Pass Output to AI
                        </button>
                        <button 
                            className="download-btn"
                            onClick={handleDownload}
                        >
                            Download TXT
                        </button>
                    </div>
                )}
            </div>

            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup-box confirm-popup">
                        <h3>{popupType === 'ai' ? 'Pass Output to AI' : '📥 Download TXT File'}</h3>
                        
                        <div className="popup-message">
                            <p>
                                {popupType === 'ai' 
                                    ? 'Do you confirm this output is correct and want to send it to AI for analysis?'
                                    : 'Do you confirm this output is correct and want to download it as a .txt file?'
                                }
                            </p>
                        </div>

                        {popupType === 'download' && (
                            <p className="popup-file-info">
                                Filename: <strong>{outputFile.endsWith('.txt') ? outputFile : outputFile + '.txt'}</strong>
                            </p>
                        )}

                        <div className="popup-buttons">
                            <button 
                                className="popup-cancel-btn"
                                onClick={handlePopupCancel}
                            >
                                Cancle
                            </button>
                            <button 
                                className="popup-confirm-btn"
                                onClick={handlePopupConfirm}
                            >
                                Conform
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AmassParameters;