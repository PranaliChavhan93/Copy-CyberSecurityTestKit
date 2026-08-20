import { useState, useRef, useEffect } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";
import "./ToolCommon.css";

function WapitiParameters({ tool, parameters, setParameters, stageCode, onAdvanceStage }) {
    // Core options
    const [targetUrl, setTargetUrl] = useState("");
    const [scope, setScope] = useState("folder");
    const [modules, setModules] = useState("all");
    const [level, setLevel] = useState("1");
    const [depth, setDepth] = useState("5");
    const [scanForce, setScanForce] = useState("normal");
    const [format, setFormat] = useState("html");
    const [outputPath, setOutputPath] = useState("");
    const [verbose, setVerbose] = useState("1");

    // Advanced options as optional string
    const [optional, setOptional] = useState("");

    const [command, setCommand] = useState("");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [executionStatus, setExecutionStatus] = useState("waiting");

    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("");
    const [outputFile, setOutputFile] = useState("wapiti_results.txt");

    const terminalRef = useRef(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [output]);

    useEffect(() => {
        updateCommandPreview();
    }, [targetUrl, scope, modules, level, depth, scanForce, format, outputPath, verbose, optional]);

    const generateCommand = () => {
        let cmd = "wapiti";

        // Target URL (required)
        if (targetUrl) {
            cmd += ` -u "${targetUrl}"`;
        }

        // Scope (only if not default)
        if (scope && scope !== "folder") {
            cmd += ` --scope ${scope}`;
        }

        // Modules (only if not default)
        if (modules && modules !== "all") {
            cmd += ` -m ${modules}`;
        }

        // Level (only if not default)
        if (level && level !== "1") {
            cmd += ` -l ${level}`;
        }

        // Depth (only if not default)
        if (depth && depth !== "5") {
            cmd += ` -d ${depth}`;
        }

        // Scan Force (only if not default)
        if (scanForce && scanForce !== "normal") {
            cmd += ` -S ${scanForce}`;
        }

        // Output format (only if not default)
        if (format && format !== "html") {
            cmd += ` -f ${format}`;
        }

        // Output path
        if (outputPath) {
            cmd += ` -o ${outputPath}`;
        }

        // Verbose (only if not default)
        if (verbose && verbose !== "1") {
            cmd += ` -v ${verbose}`;
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
        if (!targetUrl) {
            setOutput("Error: Please enter a Target URL");
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
                        targetUrl,
                        scope,
                        modules,
                        level,
                        depth,
                        scanForce,
                        format,
                        outputPath,
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
        if (!output || output === "Waiting for execution..." || output === "Error: Please enter a Target URL") {
            alert("No output available! Please run the command first.");
            return;
        }
        setPopupType("download");
        setShowPopup(true);
    };

    const handlePopupConfirm = async () => {
        if (popupType === "download") {
            downloadTxtFile(output, outputFile || "wapiti_results.txt");
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
                Wapiti Configuration
                {tool && <span className="tool-badge">{tool.tool_name}</span>}
            </h3>

            <div className="tool-form">
                <div className="tool-field">
                    <label>Target URL *</label>
                    <input
                        placeholder="https://example.com"
                        value={targetUrl}
                        onChange={(e) => setTargetUrl(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Scope</label>
                    <select
                        value={scope}
                        onChange={(e) => setScope(e.target.value)}
                    >
                        <option value="folder">Folder</option>
                        <option value="url">URL</option>
                        <option value="page">Page</option>
                        <option value="subdomain">Subdomain</option>
                        <option value="domain">Domain</option>
                        <option value="punk">Punk</option>
                    </select>
                </div>

                <div className="tool-field">
                    <label>Modules</label>
                    <select
                        value={modules}
                        onChange={(e) => setModules(e.target.value)}
                    >
                        <option value="all">All Modules</option>
                        <option value="sql">SQL Injection</option>
                        <option value="xss">XSS</option>
                        <option value="file">File Disclosure</option>
                        <option value="exec">Command Execution</option>
                        <option value="backup">Backup Discovery</option>
                        <option value="blindsql">Blind SQL</option>
                        <option value="bruteforce">Bruteforce</option>
                        <option value="crlf">CRLF Injection</option>
                        <option value="lfi">LFI</option>
                        <option value="log4shell">Log4Shell</option>
                        <option value="shellshock">Shellshock</option>
                    </select>
                </div>

                <div className="tool-field">
                    <label>Attack Level</label>
                    <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                    >
                        <option value="1">Level 1</option>
                        <option value="2">Level 2</option>
                    </select>
                </div>

                <div className="tool-field">
                    <label>Depth</label>
                    <input
                        type="number"
                        placeholder="5"
                        value={depth}
                        onChange={(e) => setDepth(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Scan Force</label>
                    <select
                        value={scanForce}
                        onChange={(e) => setScanForce(e.target.value)}
                    >
                        <option value="paranoid">Paranoid</option>
                        <option value="sneaky">Sneaky</option>
                        <option value="polite">Polite</option>
                        <option value="normal">Normal</option>
                        <option value="aggressive">Aggressive</option>
                        <option value="insane">Insane</option>
                    </select>
                </div>

                <div className="tool-field">
                    <label>Output Format</label>
                    <select
                        value={format}
                        onChange={(e) => setFormat(e.target.value)}
                    >
                        <option value="html">HTML</option>
                        <option value="json">JSON</option>
                        <option value="xml">XML</option>
                        <option value="txt">TXT</option>
                        <option value="md">Markdown</option>
                        <option value="csv">CSV</option>
                    </select>
                </div>

                <div className="tool-field">
                    <label>Output Path</label>
                    <input
                        placeholder="wapiti_report"
                        value={outputPath}
                        onChange={(e) => setOutputPath(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Verbose Level</label>
                    <select
                        value={verbose}
                        onChange={(e) => setVerbose(e.target.value)}
                    >
                        <option value="0">Quiet</option>
                        <option value="1">Normal</option>
                        <option value="2">Verbose</option>
                    </select>
                </div>

                <div className="tool-field">
                    <label>Optional Parameters</label>
                    <input
                        placeholder="--auth-user admin --auth-password pass --proxy http://127.0.0.1:8080 --tor --header 'X-Custom: value'"
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
                    disabled={isRunning || !command || !targetUrl}
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
                {output && output !== "Waiting for execution..." && output !== "Error: Please enter a Target URL" && (
                    <div className="action-buttons">
                        <AIAnalysisPanel
                            output={output}
                            toolName={tool?.tool_name || "Wapiti"}
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

export default WapitiParameters;