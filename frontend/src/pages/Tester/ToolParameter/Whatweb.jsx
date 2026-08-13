import { useState, useRef, useEffect } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";
import "./ToolCommon.css";

function WhatWebParameters({ tool, parameters, setParameters, stageCode, onAdvanceStage }) {
    // Core options
    const [target, setTarget] = useState("");
    const [aggression, setAggression] = useState("1");
    const [verbose, setVerbose] = useState(false);
    const [quiet, setQuiet] = useState(false);
    const [followRedirects, setFollowRedirects] = useState("always");
    const [maxThreads, setMaxThreads] = useState("25");
    const [timeout, setTimeout] = useState("15");
    const [readTimeout, setReadTimeout] = useState("30");
    const [userAgent, setUserAgent] = useState("");
    const [header, setHeader] = useState("");
    const [auth, setAuth] = useState("");
    const [cookie, setCookie] = useState("");
    const [proxy, setProxy] = useState("");
    const [plugins, setPlugins] = useState("");
    const [grep, setGrep] = useState("");
    const [outputFormat, setOutputFormat] = useState("brief");
    const [outputFile, setOutputFile] = useState("");
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
    }, [
        target, aggression, verbose, quiet, followRedirects,
        maxThreads, timeout, readTimeout, userAgent, header,
        auth, cookie, proxy, plugins, grep, outputFormat, outputFile, optional
    ]);

    const generateCommand = () => {
        let cmd = "whatweb";

        // Target (required)
        if (target) {
            cmd += ` ${target}`;
        }

        // Aggression level (only if not default)
        if (aggression && aggression !== "1") {
            cmd += ` -a ${aggression}`;
        }

        // Verbose
        if (verbose) {
            cmd += ` -v`;
        }

        // Quiet
        if (quiet) {
            cmd += ` -q`;
        }

        // Follow redirects (only if not default)
        if (followRedirects && followRedirects !== "always") {
            cmd += ` --follow-redirect ${followRedirects}`;
        }

        // Max threads (only if not default)
        if (maxThreads && maxThreads !== "25") {
            cmd += ` -t ${maxThreads}`;
        }

        // Timeout (only if not default)
        if (timeout && timeout !== "15") {
            cmd += ` --open-timeout ${timeout}`;
        }

        // Read timeout (only if not default)
        if (readTimeout && readTimeout !== "30") {
            cmd += ` --read-timeout ${readTimeout}`;
        }

        // User Agent
        if (userAgent) {
            cmd += ` -U "${userAgent}"`;
        }

        // Header
        if (header) {
            cmd += ` -H "${header}"`;
        }

        // Authentication
        if (auth) {
            cmd += ` -u ${auth}`;
        }

        // Cookie
        if (cookie) {
            cmd += ` -c "${cookie}"`;
        }

        // Proxy
        if (proxy) {
            cmd += ` --proxy ${proxy}`;
        }

        // Plugins
        if (plugins) {
            cmd += ` -p ${plugins}`;
        }

        // Grep
        if (grep) {
            cmd += ` -g "${grep}"`;
        }

        // Output format
        if (outputFormat === "brief") {
            // Default, no flag needed
        } else if (outputFormat === "verbose") {
            // Verbose is already handled
        } else if (outputFormat === "log") {
            if (outputFile) {
                cmd += ` --log-${outputFormat}=${outputFile}`;
            }
        } else if (outputFormat === "json" || outputFormat === "xml" || outputFormat === "sql") {
            if (outputFile) {
                cmd += ` --log-${outputFormat}=${outputFile}`;
            }
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
            setOutput("Error: Please enter a Target URL, IP, or hostname");
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
                        aggression,
                        verbose,
                        quiet,
                        followRedirects,
                        maxThreads,
                        timeout,
                        readTimeout,
                        userAgent,
                        header,
                        auth,
                        cookie,
                        proxy,
                        plugins,
                        grep,
                        outputFormat,
                        outputFile,
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
        if (!output || output === "Waiting for execution..." || output === "Error: Please enter a Target URL, IP, or hostname") {
            alert("No output available! Please run the command first.");
            return;
        }
        setPopupType("download");
        setShowPopup(true);
    };

    const handlePopupConfirm = async () => {
        if (popupType === "download") {
            downloadTxtFile(output, outputFile || "whatweb_results.txt");
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
                WhatWeb Configuration
                {tool && <span className="tool-badge">{tool.tool_name}</span>}
            </h3>

            <div className="tool-form">
                <div className="tool-field">
                    <label>Target URL/IP/Hostname *</label>
                    <input
                        placeholder="example.com or 192.168.1.1"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Aggression Level</label>
                    <select
                        value={aggression}
                        onChange={(e) => setAggression(e.target.value)}
                    >
                        <option value="1">1 - Stealthy (Default)</option>
                        <option value="3">3 - Aggressive</option>
                        <option value="4">4 - Heavy</option>
                    </select>
                </div>

                <div className="tool-field">
                    <label>Max Threads</label>
                    <input
                        type="number"
                        placeholder="25"
                        value={maxThreads}
                        onChange={(e) => setMaxThreads(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Open Timeout (seconds)</label>
                    <input
                        type="number"
                        placeholder="15"
                        value={timeout}
                        onChange={(e) => setTimeout(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Read Timeout (seconds)</label>
                    <input
                        type="number"
                        placeholder="30"
                        value={readTimeout}
                        onChange={(e) => setReadTimeout(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Follow Redirects</label>
                    <select
                        value={followRedirects}
                        onChange={(e) => setFollowRedirects(e.target.value)}
                    >
                        <option value="always">Always</option>
                        <option value="never">Never</option>
                        <option value="http-only">HTTP Only</option>
                        <option value="meta-only">Meta Only</option>
                        <option value="same-site">Same Site</option>
                    </select>
                </div>

                <div className="tool-field">
                    <label>User Agent</label>
                    <input
                        placeholder="Custom User-Agent"
                        value={userAgent}
                        onChange={(e) => setUserAgent(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Custom Header</label>
                    <input
                        placeholder="X-Custom: value"
                        value={header}
                        onChange={(e) => setHeader(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>HTTP Auth (user:password)</label>
                    <input
                        placeholder="admin:password"
                        value={auth}
                        onChange={(e) => setAuth(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Cookie</label>
                    <input
                        placeholder="name=value; name2=value2"
                        value={cookie}
                        onChange={(e) => setCookie(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Proxy</label>
                    <input
                        placeholder="hostname:8080"
                        value={proxy}
                        onChange={(e) => setProxy(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Plugins</label>
                    <input
                        placeholder="all or plugin1,plugin2"
                        value={plugins}
                        onChange={(e) => setPlugins(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Grep (Search)</label>
                    <input
                        placeholder="String or /regex/"
                        value={grep}
                        onChange={(e) => setGrep(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Output Format</label>
                    <select
                        value={outputFormat}
                        onChange={(e) => setOutputFormat(e.target.value)}
                    >
                        <option value="brief">Brief (STDOUT)</option>
                        <option value="verbose">Verbose</option>
                        <option value="log">Log File</option>
                        <option value="json">JSON</option>
                        <option value="xml">XML</option>
                        <option value="sql">SQL</option>
                    </select>
                </div>

                <div className="tool-field">
                    <label>Output File</label>
                    <input
                        placeholder="whatweb_results.txt"
                        value={outputFile}
                        onChange={(e) => setOutputFile(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Optional Parameters</label>
                    <input
                        placeholder="--no-cookies --no-errors --url-prefix https://"
                        value={optional}
                        onChange={(e) => setOptional(e.target.value)}
                    />
                    <small style={{ color: '#666', fontSize: '11px' }}>
                        Common: --no-cookies, --no-errors, --url-prefix, --url-suffix, --dorks, --list-plugins
                    </small>
                </div>
            </div>

            <div className="tool-options">
                <label>
                    <input
                        type="checkbox"
                        checked={verbose}
                        onChange={(e) => setVerbose(e.target.checked)}
                    />
                    Verbose Output (-v)
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={quiet}
                        onChange={(e) => setQuiet(e.target.checked)}
                    />
                    Quiet Mode (-q)
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
                        <><i className="fas fa-play"></i> Run WhatWeb</>
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
                {output && output !== "Waiting for execution..." && output !== "Error: Please enter a Target URL, IP, or hostname" && (
                    <div className="action-buttons">
                        <AIAnalysisPanel
                            output={output}
                            toolName={tool?.tool_name || "WhatWeb"}
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

export default WhatWebParameters;