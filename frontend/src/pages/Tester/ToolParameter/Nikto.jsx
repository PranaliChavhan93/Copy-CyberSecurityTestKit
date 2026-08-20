import { useState, useRef, useEffect } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";
import "./ToolCommon.css";

function NiktoParameters({ tool, parameters, setParameters, stageCode, onAdvanceStage }) {
    // Core options
    const [target, setTarget] = useState("");
    const [port, setPort] = useState("80");
    const [ssl, setSsl] = useState(false);
    const [format, setFormat] = useState("txt");
    const [outputFile, setOutputFile] = useState("nikto_results.txt");
    const [tuning, setTuning] = useState("");
    const [verbose, setVerbose] = useState(false);
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
    }, [target, port, ssl, format, outputFile, tuning, verbose, optional]);

    const generateCommand = () => {
        let cmd = "nikto";

        // Target (required)
        if (target) {
            cmd += ` -host ${target}`;
        }

        // Port (only if not default)
        if (port && port !== "80") {
            cmd += ` -port ${port}`;
        }

        // SSL
        if (ssl) {
            cmd += ` -ssl`;
        }

        // Format (only if not default)
        if (format && format !== "txt") {
            cmd += ` -Format ${format}`;
        }

        // Output file
        if (outputFile) {
            cmd += ` -output ${outputFile}`;
        }

        // Tuning
        if (tuning) {
            cmd += ` -Tuning ${tuning}`;
        }

        // Verbose
        if (verbose) {
            cmd += ` -Display V`;
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
        if (!target) {
            setOutput("Error: Please enter a Target Host/URL");
            return;
        }

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
                        target,
                        port,
                        ssl,
                        format,
                        outputFile,
                        tuning,
                        verbose,
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
        if (!output || output === "Waiting for execution..." || output === "Error: Please enter a Target Host/URL") {
            alert("No output available! Please run the command first.");
            return;
        }
        setPopupType("download");
        setShowPopup(true);
    };

    const handlePopupConfirm = async () => {
        if (popupType === "download") {
            downloadTxtFile(output, outputFile || "nikto_results.txt");
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
                Nikto Configuration
                {tool && <span className="tool-badge">{tool.tool_name}</span>}
            </h3>

            <div className="tool-form">
                <div className="tool-field">
                    <label>Target Host/URL *</label>
                    <input
                        placeholder="192.168.1.1 or example.com"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Port</label>
                    <input
                        type="number"
                        placeholder="80"
                        value={port}
                        onChange={(e) => setPort(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Output Format</label>
                    <select
                        value={format}
                        onChange={(e) => setFormat(e.target.value)}
                    >
                        <option value="txt">Plain Text (txt)</option>
                        <option value="htm">HTML (htm)</option>
                        <option value="json">JSON</option>
                        <option value="csv">CSV</option>
                        <option value="xml">XML</option>
                    </select>
                </div>

                <div className="tool-field">
                    <label>Output File</label>
                    <input
                        placeholder="nikto_results.txt"
                        value={outputFile}
                        onChange={(e) => setOutputFile(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Tuning (1-9, 0, a-e)</label>
                    <input
                        placeholder="123bde"
                        value={tuning}
                        onChange={(e) => setTuning(e.target.value)}
                    />
                    
                </div>

                <div className="tool-field">
                    <label>Optional Parameters</label>
                    <input
                        placeholder="-id admin:pass -root /dir -vhost example.com -evasion 1 -mutate 1,2"
                        value={optional}
                        onChange={(e) => setOptional(e.target.value)}
                    />
                </div>
            </div>

            <div className="tool-options">
                <label>
                    <input
                        type="checkbox"
                        checked={ssl}
                        onChange={(e) => setSsl(e.target.checked)}
                    />
                    Force SSL Mode (-ssl)
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={verbose}
                        onChange={(e) => setVerbose(e.target.checked)}
                    />
                    Verbose Output (-Display V)
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
                    disabled={isRunning || !command || !target}
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
                {output && output !== "Waiting for execution..." && output !== "Error: Please enter a Target Host/URL" && (
                    <div className="action-buttons">
                        <AIAnalysisPanel
                            output={output}
                            toolName={tool?.tool_name || "Nikto"}
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
                            <small>The output will be saved as a text file.</small>
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

export default NiktoParameters;