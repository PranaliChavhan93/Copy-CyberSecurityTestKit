import { useState, useRef, useEffect } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";
import "./ToolCommon.css";

function Netdiscover({ tool, stageCode, onAdvanceStage }) {
    const [interfaceName, setInterfaceName] = useState("eth0");
    const [range, setRange] = useState("");
    const [mode, setMode] = useState("");
    const [sleep, setSleep] = useState("");
    const [outputFile, setOutputFile] = useState("");
    const [output, setOutput] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);
    const [popupType, setPopupType] = useState("");

    const terminalRef = useRef(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [output]);

    const generateCommand = () => {
        let cmd = "sudo netdiscover";

        if (interfaceName)
            cmd += ` -i ${interfaceName}`;
        if (range)
            cmd += ` -r ${range}`;
        if (mode === "passive")
            cmd += " -p";
        if (mode === "fast")
            cmd += " -f";
        if (mode === "no-dns")
            cmd += " -N";
        if (mode === "verbose")
            cmd += " -v";
        if (sleep)
            cmd += ` -s ${sleep}`;
        if (outputFile)
            cmd += ` > ${outputFile}`;
        return cmd;
    };

    const runCommand = async () => {
        setIsExecuting(true);
        const cmd = generateCommand();
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
                            interfaceName,
                            range,
                            mode,
                            sleep,
                            outputFile
                        }
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                setOutput(prev => prev + `${data.output || 'Command executed successfully'}\n`);
            } else {
                setOutput(prev => prev + `${data.message || 'Unknown error'}\n`);
            }
        } catch (error) {
            setOutput(prev => prev + `\nError : ${error.message}\n`);
        } finally {
            setIsExecuting(false);
        }
    };

    const clearTerminal = () => {
        setOutput("");
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
        if (popupType === "download") {
            downloadTxtFile(output, outputFile || "netdiscover_results.txt");
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
                Netdiscover Configuration
                {tool && <span className="tool-badge">{tool.tool_name}</span>}
            </h3>

            <div className="tool-form">
                <div className="tool-field">
                    <label>Interface</label>
                    <input
                        value={interfaceName}
                        placeholder="eth0"
                        onChange={e => setInterfaceName(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Network Range</label>
                    <input
                        placeholder="192.168.1.0/24"
                        value={range}
                        onChange={e => setRange(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Scan Mode</label>
                    <select
                        value={mode}
                        onChange={e => setMode(e.target.value)}
                    >
                        <option value="">Normal Scan</option>
                        <option value="passive">Passive Mode (-p)</option>
                        <option value="fast">Fast Mode (-f)</option>
                        <option value="no-dns">Disable DNS (-N)</option>
                        <option value="verbose">Verbose (-v)</option>
                    </select>
                </div>

                <div className="tool-field">
                    <label>Sleep Time</label>
                    <input
                        placeholder="10"
                        value={sleep}
                        onChange={e => setSleep(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Save Output File</label>
                    <input
                        placeholder="results.txt"
                        value={outputFile}
                        onChange={e => setOutputFile(e.target.value)}
                    />
                </div>
            </div>

            <div className="command-area">
                <label>Generated Command</label>
                <div className="command-preview">
                    <span className="command-text">{generateCommand() || "Command..."}</span>
                </div>
                <br />

                <button
                    className={`run-btn ${isExecuting ? 'running' : ''}`}
                    onClick={runCommand}
                    disabled={isExecuting}
                >
                    {isExecuting ? (
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
                        {isExecuting && <span className="cursor"></span>}
                    </pre>
                </div>
                {output && output !== "Waiting for execution..." && (
                    <div className="action-buttons">
                        <AIAnalysisPanel
                            output={output}
                            toolName={tool?.tool_name || "Netdiscover"}
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

export default Netdiscover;