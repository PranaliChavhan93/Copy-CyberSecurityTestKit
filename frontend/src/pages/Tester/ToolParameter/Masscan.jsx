import { useState, useRef, useEffect } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";
import "./ToolCommon.css";

function MasscanParameters({
    tool,
    parameters,
    setParameters,
    stageCode,
    onAdvanceStage
}) {
    // Core scan parameters
    const [target, setTarget] = useState("");
    const [ports, setPorts] = useState("22,80,443,445");
    const [rate, setRate] = useState("1000");
    const [excludeIPs, setExcludeIPs] = useState("");
    const [outputFormat, setOutputFormat] = useState("interactive");
    const [outputFile, setOutputFile] = useState("masscan_results.txt");
    
    // Options flags
    const [bannerGrab, setBannerGrab] = useState(false);
    const [noPing, setNoPing] = useState(false);
    const [noDNS, setNoDNS] = useState(false);
    const [verbose, setVerbose] = useState(true);
    const [randomizeHosts, setRandomizeHosts] = useState(true);
    
    // Command and output
    const [command, setCommand] = useState("");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [executionStatus, setExecutionStatus] = useState("waiting");
    
    // Popup
    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("");
    const [downloadFileName, setDownloadFileName] = useState("masscan_results.txt");
    
    const terminalRef = useRef(null);
    
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [output]);
    
    useEffect(() => {
        updateCommandPreview();
    }, [
        target, ports, rate, excludeIPs, outputFormat,
        bannerGrab, noPing, noDNS, verbose, randomizeHosts
    ]);
    
    const generateCommand = () => {
        let cmd = "masscan";
        
        if (target) cmd += ` ${target}`;
        if (ports) cmd += ` -p${ports}`;
        if (rate) cmd += ` --rate ${rate}`;
        if (excludeIPs) cmd += ` --exclude ${excludeIPs}`;
        
        if (bannerGrab) cmd += " --banners";
        if (noPing) cmd += " -Pn";
        if (noDNS) cmd += " -n";
        if (verbose) cmd += " -v";
        if (randomizeHosts) cmd += " --randomize-hosts";
        
        if (outputFormat !== "interactive") {
            cmd += ` -o${outputFormat.charAt(0).toUpperCase()}`;
            if (outputFile) cmd += ` ${outputFile}`;
        }
        
        return cmd;
    };
    
    const updateCommandPreview = () => {
        setCommand(generateCommand());
    };
    
    const runCommand = async () => {
        const cmd = generateCommand();
        
        setIsRunning(true);
        setExecutionStatus("running");
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
                            target, ports, rate, excludeIPs, outputFormat,
                            bannerGrab, noPing, noDNS, verbose, randomizeHosts
                        }
                    })
                }
            );
            
            const data = await response.json();
            
            if (response.ok) {
                setOutput(prev => prev + `${data.output || "Command executed successfully"}\n`);
                setExecutionStatus("success");
            } else {
                setOutput(prev => prev + `${data.message || "Unknown error"}\n`);
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
        if (!filename.endsWith(".txt")) filename += ".txt";
        const blob = new Blob([content], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
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
            downloadTxtFile(output, downloadFileName || "masscan_results.txt");
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
                Masscan Configuration
                {tool && <span className="tool-badge">{tool.tool_name}</span>}
            </h3>
            
            <div className="tool-form">
                <div className="tool-field">
                    <label>Target IP / CIDR Range</label>
                    <input
                        type="text"
                        placeholder="192.168.1.0/24 or 10.0.0.0/8"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                    />
                </div>
                
                <div className="tool-field">
                    <label>Ports</label>
                    <input
                        type="text"
                        placeholder="22,80,443,445 or 1-65535"
                        value={ports}
                        onChange={(e) => setPorts(e.target.value)}
                    />
                </div>
                
                <div className="tool-field">
                    <label>Scan Rate (packets/sec)</label>
                    <input
                        type="number"
                        placeholder="1000"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                    />
                </div>
                
                <div className="tool-field">
                    <label>Exclude IPs</label>
                    <input
                        type="text"
                        placeholder="192.168.1.1,192.168.1.2"
                        value={excludeIPs}
                        onChange={(e) => setExcludeIPs(e.target.value)}
                    />
                </div>
                
                <div className="tool-field">
                    <label>Output Format</label>
                    <select
                        value={outputFormat}
                        onChange={(e) => setOutputFormat(e.target.value)}
                    >
                        <option value="interactive">Interactive (Default)</option>
                        <option value="json">JSON (-oJ)</option>
                        <option value="nmap">Nmap Style (-oN)</option>
                        <option value="grepable">Grepable (-oG)</option>
                        <option value="list">List (-oL)</option>
                        <option value="xml">XML (-oX)</option>
                    </select>
                </div>
                
                <div className="tool-field">
                    <label>Output File Name</label>
                    <input
                        type="text"
                        placeholder="masscan_results.txt"
                        value={downloadFileName}
                        onChange={(e) => setDownloadFileName(e.target.value)}
                    />
                </div>
            </div>
            
            <div className="tool-options">
                <label>
                    <input
                        type="checkbox"
                        checked={bannerGrab}
                        onChange={(e) => setBannerGrab(e.target.checked)}
                    />
                    Banner Grab (--banners)
                </label>
                
                <label>
                    <input
                        type="checkbox"
                        checked={noPing}
                        onChange={(e) => setNoPing(e.target.checked)}
                    />
                    No Ping (-Pn)
                </label>
                
                <label>
                    <input
                        type="checkbox"
                        checked={noDNS}
                        onChange={(e) => setNoDNS(e.target.checked)}
                    />
                    No DNS (-n)
                </label>
                
                <label>
                    <input
                        type="checkbox"
                        checked={randomizeHosts}
                        onChange={(e) => setRandomizeHosts(e.target.checked)}
                    />
                    Randomize Hosts (--randomize-hosts)
                </label>
                
                <label>
                    <input
                        type="checkbox"
                        checked={verbose}
                        onChange={(e) => setVerbose(e.target.checked)}
                    />
                    Verbose (-v)
                </label>
            </div>
            
            <div className="command-area">
                <label>Generated Command</label>
                <div className="command-preview">
                    <span className="command-text">
                        {command || "Configure options above..."}
                    </span>
                </div>
                <br />
                
                <button
                    className={`run-btn ${isRunning ? 'running' : ''}`}
                    onClick={runCommand}
                    disabled={isRunning || !command || !target}
                >
                    {isRunning ? (
                        <>
                            Running...
                        </>
                    ) : (
                        <>
                            Run Command
                        </>
                    )}
                </button>
                
                {output && (
                    <button
                        className="run-btn"
                        style={{
                            background: "#6b7a9a",
                            marginLeft: "10px",
                            padding: "12px 20px"
                        }}
                        onClick={clearTerminal}
                    >
                        {/* <i className="fas fa-eraser"></i> */}
                        Clear
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
                            toolName={tool?.tool_name || "Masscan"}
                            stageCode={stageCode}
                            onAdvanceStage={onAdvanceStage}
                        />
                        <button
                            className="download-btn"
                            onClick={handleDownload}
                        >
                            <i className="fas fa-download"></i>
                            {" "}Download TXT
                        </button>
                    </div>
                )}
            </div>
            
            {showPopup && (
                <div className="popup-overlay" onClick={handlePopupCancel}>
                    <div className="popup-box confirm-popup" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            <i className="fas fa-download"></i>
                            {" "}Download File
                        </h3>
                        
                        <div className="popup-message">
                            <p>Do you want to download this output as a .txt file?</p>
                        </div>
                        
                        <div className="popup-file-info">
                            <label>File Name</label>
                            <input
                                type="text"
                                value={downloadFileName}
                                onChange={(e) => setDownloadFileName(e.target.value)}
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

export default MasscanParameters;