import { useState, useRef, useEffect } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";
import "./ToolCommon.css";

function NmapParameters({ tool, stageCode, onAdvanceStage }) {
    const [target, setTarget] = useState("");
    const [scanOption, setScanOption] = useState("basic");
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
        if (!target) return "nmap ";

        let cmd = "nmap";

        switch (scanOption) {
            case "basic":
                break;
            case "specific_ports":
                cmd += " -p"; 
                break;
            case "syn":
                cmd += " -sS";
                break;
            case "tcp_connect":
                cmd += " -sT";
                break;
            case "version":
                cmd += " -sV";
                break;
            case "os":
                cmd += " -O";
                break;
            case "aggressive":
                cmd += " -A";
                break;
            case "range":
                break;
            case "ping":
                cmd += " -sn";
                break;
            case "udp":
                cmd += " -sU";
                break;
            case "script":
                cmd += " --script=vuln";
                break;
            case "verbose":
                cmd += " -v";
                break;
            default:
                break;
        }
        if (outputFile) {
            const fileName = outputFile.endsWith('.txt') ? outputFile : `${outputFile}.txt`;
            cmd += ` -oN ${fileName}`;
        }
        cmd += ` ${target}`;
        return cmd;
    };
    
    const runCommand = async () => {
        if (!target) {
            setOutput("Error: Please enter a Target IP");
            return;
        }

        setIsExecuting(true);
        const cmd = generateCommand();
        
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
                        target,
                        scanOption,
                        outputFile
                    }
                })
            });

            const data = await response.json();

            if (response.ok) {
                setOutput(prev => prev + `${data.output || 'Command executed successfully'}\n`);
            } else {
                setOutput(prev => prev + `${data.message || 'Unknown error'}\n`);
            }
        } catch (error) {
            setOutput(prev => prev + "\nNetwork Error : " + error.message);
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
        if (!output || output === "Waiting for execution..." || output === "Error: Please enter a Target IP") {
            alert("No output available! Please run the command first.");
            return;
        }
        setPopupType("download");
        setShowPopup(true);
    };

    const handlePopupConfirm = () => {
        downloadTxtFile(output, outputFile || "nmap_results.txt");
        setShowPopup(false);
        setPopupType("");
    };

    const handlePopupCancel = () => {
        setShowPopup(false);
        setPopupType("");
    };

    return (
        <div className="tool-box">
            <h3>
                Nmap Configuration
                {tool && <span className="tool-badge">{tool.tool_name}</span>}
            </h3>

            <div className="tool-form">
                <div className="tool-field">
                    <label>Scan Options</label>
                    <select
                        value={scanOption}
                        onChange={e => setScanOption(e.target.value)}
                    >
                        <option value="basic">Basic Scan</option>
                        <option value="specific_ports">Scan Specific Ports (-p 21,22,80)</option>
                        <option value="syn">SYN Stealth Scan (-sS)</option>
                        <option value="tcp_connect">TCP Connect Scan (-sT)</option>
                        <option value="version">Service Version Detection (-sV)</option>
                        <option value="os">OS Detection (-O)</option>
                        <option value="aggressive">Aggressive Scan (-A)</option>
                        <option value="range">Network Range Scan</option>
                        <option value="ping">Ping Scan (-sn)</option>
                        <option value="udp">UDP Scan (-sU)</option>
                        <option value="script">Script Scan (--script=vuln)</option>
                        <option value="verbose">Verbose Mode (-v)</option>
                    </select>
                </div>

                <div className="tool-field">
                    <label>Target IP / Hostname / Range</label>
                    <input
                        value={target}
                        placeholder="192.168.1.1, example.org, 1 - 1000"
                        onChange={e => setTarget(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Save Output to File (-oN)</label>
                    <input
                        placeholder="scan_results.txt"
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
                        <><i className="fas fa-spinner fa-spin"></i> Scanning...</>
                    ) : (
                        <><i className="fas fa-play"></i> Run Nmap</>
                    )}
                </button>

                {output && output !== "Waiting for execution..." && output !== "Error: Please enter a Target IP" && (
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
                {output && output !== "Waiting for execution..." && output !== "Error: Please enter a Target IP" && (
                    <div className="action-buttons">
                        <AIAnalysisPanel
                            output={output}
                            toolName={tool?.tool_name || "Nmap"}
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

export default NmapParameters;