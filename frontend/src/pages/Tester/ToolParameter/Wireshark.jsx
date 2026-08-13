import { useState, useRef, useEffect } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";
import "./ToolCommon.css";

function WiresharkParameters({
    tool,
    parameters,
    setParameters,
    stageCode,
    onAdvanceStage
}) {
    // Interface and capture settings
    const [interfaceName, setInterfaceName] = useState("eth0");
    const [captureFilter, setCaptureFilter] = useState("");
    const [displayFilter, setDisplayFilter] = useState("");
    const [outputFile, setOutputFile] = useState("capture.pcap");
    const [captureMode, setCaptureMode] = useState("gui");
    
    // Advanced capture options
    const [promiscuousMode, setPromiscuousMode] = useState(true);
    const [monitorMode, setMonitorMode] = useState(false);
    const [snapshotLength, setSnapshotLength] = useState("");
    const [bufferSize, setBufferSize] = useState("");
    const [autoSave, setAutoSave] = useState(false);
    const [autoSaveInterval, setAutoSaveInterval] = useState("");
    const [ringBuffer, setRingBuffer] = useState(false);
    const [ringBufferFiles, setRingBufferFiles] = useState("");
    
    // Traffic generation
    const [pingTarget, setPingTarget] = useState("google.com");
    const [httpTarget, setHttpTarget] = useState("http://example.com");
    const [dnsQuery, setDnsQuery] = useState("google.com");
    const [generateTraffic, setGenerateTraffic] = useState(false);
    
    // Common filters
    const [filterType, setFilterType] = useState("all");
    
    // Command and output
    const [command, setCommand] = useState("");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [executionStatus, setExecutionStatus] = useState("waiting");
    
    // Popup
    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("");
    const [downloadFileName, setDownloadFileName] = useState("wireshark_results.txt");
    
    const terminalRef = useRef(null);
    
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [output]);
    
    useEffect(() => {
        updateCommandPreview();
    }, [
        interfaceName,
        captureFilter,
        displayFilter,
        outputFile,
        captureMode,
        promiscuousMode,
        monitorMode,
        snapshotLength,
        bufferSize,
        autoSave,
        autoSaveInterval,
        ringBuffer,
        ringBufferFiles
    ]);
    
    const generateCommand = () => {
        let cmd = "";
        
        if (captureMode === "gui") {
            cmd = "wireshark";
            
            // Display filter for GUI
            if (displayFilter) {
                cmd += ` -f "${displayFilter}"`;
            }
            
            // Interface selection
            if (interfaceName) {
                cmd += ` -i ${interfaceName}`;
            }
            
            // Capture filter for GUI
            if (captureFilter) {
                cmd += ` -f "${captureFilter}"`;
            }
            
            // Promiscuous mode
            if (!promiscuousMode) {
                cmd += " -p";
            }
            
            // Snapshot length
            if (snapshotLength) {
                cmd += ` -s ${snapshotLength}`;
            }
            
            // Buffer size
            if (bufferSize) {
                cmd += ` -B ${bufferSize}`;
            }
            
        } else if (captureMode === "tshark") {
            cmd = "sudo tshark";
            
            // Interface
            if (interfaceName) {
                cmd += ` -i ${interfaceName}`;
            }
            
            // Capture filter
            if (captureFilter) {
                cmd += ` ${captureFilter}`;
            }
            
            // Promiscuous mode
            if (!promiscuousMode) {
                cmd += " -p";
            }
            
            // Monitor mode
            if (monitorMode) {
                cmd += " -I";
            }
            
            // Snapshot length
            if (snapshotLength) {
                cmd += ` -s ${snapshotLength}`;
            }
            
            // Buffer size
            if (bufferSize) {
                cmd += ` -B ${bufferSize}`;
            }
            
            // Output file
            if (outputFile) {
                cmd += ` -w ${outputFile}`;
            }
            
            // Auto save interval
            if (autoSave && autoSaveInterval) {
                cmd += ` -a duration:${autoSaveInterval}`;
            }
            
            // Ring buffer
            if (ringBuffer && ringBufferFiles) {
                cmd += ` -b files:${ringBufferFiles}`;
            }
        }
        
        return cmd || "Configure options above...";
    };
    
    const updateCommandPreview = () => {
        setCommand(generateCommand());
    };
    
    const runCommand = async () => {
        let cmd = generateCommand();
        
        // If in GUI mode, just open Wireshark
        if (captureMode === "gui") {
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
                                interfaceName,
                                captureFilter,
                                displayFilter,
                                outputFile,
                                captureMode,
                                promiscuousMode,
                                monitorMode,
                                snapshotLength,
                                bufferSize,
                                autoSave,
                                autoSaveInterval,
                                ringBuffer,
                                ringBufferFiles
                            }
                        })
                    }
                );
                
                const data = await response.json();
                
                if (response.ok) {
                    setOutput(prev => 
                        prev + 
                        `${data.output || "Wireshark GUI opened successfully"}\n`
                    );
                    setExecutionStatus("success");
                } else {
                    setOutput(prev => 
                        prev + 
                        `${data.message || "Unknown error"}\n`
                    );
                    setExecutionStatus("error");
                }
            } catch (error) {
                setOutput(prev => prev + `${error.message}\n`);
                setExecutionStatus("error");
            } finally {
                setIsRunning(false);
            }
            return;
        }
        
        // TShark mode - generate traffic if enabled
        if (generateTraffic) {
            const trafficCommands = [];
            
            if (pingTarget) {
                trafficCommands.push(`ping -c 4 ${pingTarget}`);
            }
            
            if (httpTarget) {
                trafficCommands.push(`curl -s ${httpTarget}`);
            }
            
            if (dnsQuery) {
                trafficCommands.push(`nslookup ${dnsQuery}`);
            }
            
            if (trafficCommands.length > 0) {
                // Run traffic generation in background
                setOutput(prev => prev + `\n# Generating test traffic...\n`);
                
                for (const trafficCmd of trafficCommands) {
                    setOutput(prev => prev + `$ ${trafficCmd}\n`);
                    
                    try {
                        const trafficResponse = await fetch(
                            "http://127.0.0.1:8000/tools/run/",
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${sessionStorage.getItem("access")}`
                                },
                                body: JSON.stringify({
                                    command: trafficCmd,
                                    tool_id: tool?.id || null,
                                    parameters: {}
                                })
                            }
                        );
                        
                        const trafficData = await trafficResponse.json();
                        
                        if (trafficResponse.ok) {
                            setOutput(prev => prev + `${trafficData.output || ""}\n`);
                        }
                    } catch (error) {
                        setOutput(prev => prev + `${error.message}\n`);
                    }
                }
                
                setOutput(prev => prev + `\n# Starting packet capture...\n`);
            }
        }
        
        // Start TShark capture
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
                            interfaceName,
                            captureFilter,
                            displayFilter,
                            outputFile,
                            captureMode,
                            promiscuousMode,
                            monitorMode,
                            snapshotLength,
                            bufferSize,
                            autoSave,
                            autoSaveInterval,
                            ringBuffer,
                            ringBufferFiles,
                            pingTarget,
                            httpTarget,
                            dnsQuery,
                            generateTraffic
                        }
                    })
                }
            );
            
            const data = await response.json();
            
            if (response.ok) {
                setOutput(prev => 
                    prev + 
                    `${data.output || "Packet capture completed successfully"}\n`
                );
                
                if (outputFile && data.output) {
                    setOutput(prev => 
                        prev + 
                        `\n# Capture saved to: ${outputFile}\n`
                    );
                }
                
                setExecutionStatus("success");
            } else {
                setOutput(prev => 
                    prev + 
                    `${data.message || "Unknown error"}\n`
                );
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
        if (!filename.endsWith(".txt")) {
            filename += ".txt";
        }
        
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
            alert("No output available! Please run the capture first.");
            return;
        }
        
        setPopupType("download");
        setShowPopup(true);
    };
    
    const handlePopupConfirm = () => {
        if (popupType === "download") {
            downloadTxtFile(
                output,
                downloadFileName || "wireshark_results.txt"
            );
            setShowPopup(false);
            setPopupType("");
        }
    };
    
    const handlePopupCancel = () => {
        setShowPopup(false);
        setPopupType("");
    };
    
    const applyFilterTemplate = (filter) => {
        setDisplayFilter(filter);
        setFilterType(filter);
    };
    
    return (
        <div className="tool-box">
            <h3>
                Wireshark Configuration
                {tool && <span className="tool-badge">{tool.tool_name}</span>}
            </h3>
            
            <div className="tool-form">
                {/* Mode Selection */}
                <div className="tool-field">
                    <label>Capture Mode</label>
                    <select
                        value={captureMode}
                        onChange={(e) => setCaptureMode(e.target.value)}
                    >
                        <option value="gui">GUI (Wireshark)</option>
                        <option value="tshark">CLI (TShark)</option>
                    </select>
                </div>
                
                <div className="tool-field">
                    <label>Network Interface</label>
                    <input
                        type="text"
                        placeholder="eth0, wlan0, lo"
                        value={interfaceName}
                        onChange={(e) => setInterfaceName(e.target.value)}
                    />
                    <small>Common: eth0 (Ethernet), wlan0 (WiFi), lo (Loopback)</small>
                </div>
                
                <div className="tool-field">
                    <label>Capture Filter (BPF)</label>
                    <input
                        type="text"
                        placeholder="tcp port 80, icmp, not arp"
                        value={captureFilter}
                        onChange={(e) => setCaptureFilter(e.target.value)}
                    />
                    <small>Filters packets during capture</small>
                </div>
                
                <div className="tool-field">
                    <label>Display Filter (GUI Only)</label>
                    <input
                        type="text"
                        placeholder="http, dns, tcp, icmp"
                        value={displayFilter}
                        onChange={(e) => setDisplayFilter(e.target.value)}
                    />
                </div>
                
                {/* Quick Filter Templates */}
                <div className="tool-field">
                    <label>Quick Filter Templates</label>
                    <div className="filter-templates">
                        <button 
                            className="filter-btn"
                            onClick={() => applyFilterTemplate("http")}
                        >
                            HTTP
                        </button>
                        <button 
                            className="filter-btn"
                            onClick={() => applyFilterTemplate("dns")}
                        >
                            DNS
                        </button>
                        <button 
                            className="filter-btn"
                            onClick={() => applyFilterTemplate("icmp")}
                        >
                            ICMP
                        </button>
                        <button 
                            className="filter-btn"
                            onClick={() => applyFilterTemplate("tcp")}
                        >
                            TCP
                        </button>
                        <button 
                            className="filter-btn"
                            onClick={() => applyFilterTemplate("udp")}
                        >
                            UDP
                        </button>
                        <button 
                            className="filter-btn"
                            onClick={() => applyFilterTemplate("tls")}
                        >
                            TLS
                        </button>
                        <button 
                            className="filter-btn"
                            onClick={() => applyFilterTemplate("arp")}
                        >
                            ARP
                        </button>
                        <button 
                            className="filter-btn"
                            onClick={() => applyFilterTemplate("tcp.flags.syn == 1")}
                        >
                            SYN Scans
                        </button>
                    </div>
                </div>
                
                {captureMode === "tshark" && (
                    <div className="tool-field">
                        <label>Output File (.pcap)</label>
                        <input
                            type="text"
                            placeholder="capture.pcap"
                            value={outputFile}
                            onChange={(e) => setOutputFile(e.target.value)}
                        />
                    </div>
                )}
            </div>
            
            <div className="tool-options">
                <h4>Capture Options</h4>
                
                <label>
                    <input
                        type="checkbox"
                        checked={promiscuousMode}
                        onChange={(e) => setPromiscuousMode(e.target.checked)}
                    />
                    Promiscuous Mode (Capture all traffic)
                </label>
                
                {captureMode === "tshark" && (
                    <label>
                        <input
                            type="checkbox"
                            checked={monitorMode}
                            onChange={(e) => setMonitorMode(e.target.checked)}
                        />
                        Monitor Mode (-I) - WiFi monitor mode
                    </label>
                )}
                
                <div className="tool-field">
                    <label>Snapshot Length (bytes)</label>
                    <input
                        type="number"
                        placeholder="65535"
                        value={snapshotLength}
                        onChange={(e) => setSnapshotLength(e.target.value)}
                    />
                    <small>Maximum packet size to capture</small>
                </div>
                
                <div className="tool-field">
                    <label>Buffer Size (MB)</label>
                    <input
                        type="number"
                        placeholder="2"
                        value={bufferSize}
                        onChange={(e) => setBufferSize(e.target.value)}
                    />
                </div>
            </div>
            
            <div className="tool-options">
                <h4>Advanced Capture Settings</h4>
                
                {captureMode === "tshark" && (
                    <>
                        <label>
                            <input
                                type="checkbox"
                                checked={autoSave}
                                onChange={(e) => setAutoSave(e.target.value)}
                            />
                            Auto Save Capture
                        </label>
                        
                        <div className="tool-field">
                            <label>Auto Save Interval (seconds)</label>
                            <input
                                type="number"
                                placeholder="60"
                                value={autoSaveInterval}
                                onChange={(e) => setAutoSaveInterval(e.target.value)}
                                disabled={!autoSave}
                            />
                        </div>
                        
                        <label>
                            <input
                                type="checkbox"
                                checked={ringBuffer}
                                onChange={(e) => setRingBuffer(e.target.checked)}
                            />
                            Ring Buffer Mode
                        </label>
                        
                        <div className="tool-field">
                            <label>Number of Ring Buffer Files</label>
                            <input
                                type="number"
                                placeholder="5"
                                value={ringBufferFiles}
                                onChange={(e) => setRingBufferFiles(e.target.value)}
                                disabled={!ringBuffer}
                            />
                        </div>
                    </>
                )}
            </div>
            
            <div className="tool-options">
                <h4>Traffic Generation (TShark Mode)</h4>
                
                <label>
                    <input
                        type="checkbox"
                        checked={generateTraffic}
                        onChange={(e) => setGenerateTraffic(e.target.checked)}
                    />
                    Generate Test Traffic
                </label>
                
                {generateTraffic && (
                    <>
                        <div className="tool-field">
                            <label>Ping Target</label>
                            <input
                                type="text"
                                placeholder="google.com"
                                value={pingTarget}
                                onChange={(e) => setPingTarget(e.target.value)}
                            />
                        </div>
                        
                        <div className="tool-field">
                            <label>HTTP Target</label>
                            <input
                                type="text"
                                placeholder="http://example.com"
                                value={httpTarget}
                                onChange={(e) => setHttpTarget(e.target.value)}
                            />
                        </div>
                        
                        <div className="tool-field">
                            <label>DNS Query</label>
                            <input
                                type="text"
                                placeholder="google.com"
                                value={dnsQuery}
                                onChange={(e) => setDnsQuery(e.target.value)}
                            />
                        </div>
                    </>
                )}
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
                    disabled={isRunning || !command || !interfaceName}
                >
                    {isRunning ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i>
                            {" "}Running...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-play"></i>
                            {" "}{captureMode === "gui" ? "Open Wireshark" : "Start Capture"}
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
                        <i className="fas fa-eraser"></i>
                        {" "}Clear
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
                            toolName={tool?.tool_name || "Wireshark"}
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

export default WiresharkParameters;