import { useState, useRef, useEffect } from "react";
import "./SaveOutput.css";
import AIAnalysisPanel from "./AIAnalysisPanel";

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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ command: cmd })
            });

            const rawText = await response.text();

            let data;
            try {
                data = JSON.parse(rawText);
                setOutput(prev => prev + data.output);
            } catch (jsonError) {
                setOutput(prev => prev);
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
        <div className="amass-box">
            <h3>Nmap Configuration</h3>

            <div className="amass-form">
                <div className="amass-field">
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

                <div className="amass-field">
                    <label>Target IP / Hostname / Range</label>
                    <input
                        value={target}
                        placeholder="192.168.1.1, example.org, 1 - 1000"
                        onChange={e => setTarget(e.target.value)}
                    />
                </div>

                <div className="amass-field">
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
                    {generateCommand()}
                </div>
                <br />
                <button
                    className="run-btn"
                    onClick={runCommand}
                    // disabled={isExecuting || !target}
                >
                    {isExecuting ? 'Scanning...' : 'Run Nmap'}
                </button>

                {/* Added Clear Button */}
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
                        Clear
                    </button>
                )}
            </div>

            <div className="command-area">
                <label>Terminal Output</label>
                <div className="terminal" ref={terminalRef}>
                    <pre>
                        {output || "Waiting for execution..."}
                    </pre>
                </div>
                {output && output !== "Waiting for execution..." && (
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
                            Download TXT
                        </button>
                    </div>
                )}
            </div>

            {/* Popup Component */}
            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup-box confirm-popup">
                        <h3>📥 Download TXT File</h3>
                        
                        <div className="popup-message">
                            <p>Do you confirm this output is correct and want to download it as a .txt file?</p>
                        </div>

                        {outputFile && (
                            <p className="popup-file-info">
                                Filename: <strong>{outputFile.endsWith('.txt') ? outputFile : outputFile + '.txt'}</strong>
                            </p>
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
            
        
            <style jsx>{`
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

                /* AI Analysis Popup Styles */
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

                .tool-badge {
                    background: #4a6cf7;
                    color: white;
                    padding: 2px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 400;
                    margin-left: 10px;
                }
            `}</style>
        </div>
    );
}

export default NmapParameters;