import { useState, useRef, useEffect } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";
import "./ToolCommon.css";

function DirsearchParameters({ tool, parameters, setParameters, stageCode, onAdvanceStage }) {
    // Core Settings
    const [url, setUrl] = useState("");
    const [urlFile, setUrlFile] = useState("");
    const [extensions, setExtensions] = useState("");
    const [threads, setThreads] = useState("25");
    const [wordlists, setWordlists] = useState("");
    
    // Toggle Options
    const [recursive, setRecursive] = useState(false);
    const [followRedirects, setFollowRedirects] = useState(false);
    const [randomAgent, setRandomAgent] = useState(false);
    const [forceExtensions, setForceExtensions] = useState(false);
    const [quietMode, setQuietMode] = useState(false);
    const [noColor, setNoColor] = useState(false);
    const [tor, setTor] = useState(false);
    const [crawl, setCrawl] = useState(false);

    // Advanced Settings (collapsible)
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [httpMethod, setHttpMethod] = useState("GET");
    const [includeStatus, setIncludeStatus] = useState("");
    const [excludeStatus, setExcludeStatus] = useState("");
    const [excludeSizes, setExcludeSizes] = useState("");
    const [timeout, setTimeout] = useState("10");
    const [delay, setDelay] = useState("0");
    const [maxTime, setMaxTime] = useState("");
    const [data, setData] = useState("");
    const [headers, setHeaders] = useState("");
    const [cookie, setCookie] = useState("");
    const [userAgent, setUserAgent] = useState("");
    const [proxy, setProxy] = useState("");
    const [auth, setAuth] = useState("");
    const [outputFormat, setOutputFormat] = useState("simple");
    const [outputFile, setOutputFile] = useState("dirsearch_results.txt");
    const [excludeText, setExcludeText] = useState("");
    const [excludeRegex, setExcludeRegex] = useState("");
    const [minResponseSize, setMinResponseSize] = useState("");
    const [maxResponseSize, setMaxResponseSize] = useState("");

    // Command state
    const [command, setCommand] = useState("");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [executionStatus, setExecutionStatus] = useState("waiting");
    const [showPopup, setShowPopup] = useState(false);

    const terminalRef = useRef(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [output]);

    useEffect(() => {
        updateCommandPreview();
    }, [
        url, urlFile, extensions, threads, wordlists,
        recursive, followRedirects, randomAgent, forceExtensions,
        quietMode, noColor, tor, crawl,
        httpMethod, includeStatus, excludeStatus, excludeSizes,
        timeout, delay, maxTime, data, headers, cookie,
        userAgent, proxy, auth, outputFormat, outputFile,
        excludeText, excludeRegex, minResponseSize, maxResponseSize
    ]);

    const generateCommand = () => {
        let cmd = "dirsearch";

        // Mandatory - URL (required)
        if (url) cmd += ` -u ${url}`;
        if (urlFile) cmd += ` -l ${urlFile}`;

        // Dictionary
        if (extensions) cmd += ` -e ${extensions}`;
        if (wordlists) cmd += ` -w ${wordlists}`;
        if (forceExtensions) cmd += ` -f`;

        // General
        if (threads && threads !== "25") cmd += ` -t ${threads}`;
        if (recursive) cmd += ` -r`;
        if (includeStatus) cmd += ` -i ${includeStatus}`;
        if (excludeStatus) cmd += ` -x ${excludeStatus}`;
        if (excludeSizes) cmd += ` --exclude-sizes ${excludeSizes}`;
        if (excludeText) cmd += ` --exclude-text "${excludeText}"`;
        if (excludeRegex) cmd += ` --exclude-regex "${excludeRegex}"`;
        if (minResponseSize) cmd += ` --min-response-size ${minResponseSize}`;
        if (maxResponseSize) cmd += ` --max-response-size ${maxResponseSize}`;
        if (maxTime) cmd += ` --max-time ${maxTime}`;

        // Request
        if (httpMethod && httpMethod !== "GET") cmd += ` -m ${httpMethod}`;
        if (data) cmd += ` -d "${data}"`;
        if (headers) cmd += ` -H "${headers}"`;
        if (followRedirects) cmd += ` -F`;
        if (randomAgent) cmd += ` --random-agent`;
        if (auth) cmd += ` --auth ${auth}`;
        if (userAgent) cmd += ` --user-agent "${userAgent}"`;
        if (cookie) cmd += ` --cookie "${cookie}"`;

        // Connection
        if (timeout && timeout !== "10") cmd += ` --timeout ${timeout}`;
        if (delay && delay !== "0") cmd += ` --delay ${delay}`;
        if (proxy) cmd += ` --proxy ${proxy}`;
        if (tor) cmd += ` --tor`;

        // Advanced
        if (crawl) cmd += ` --crawl`;

        // View
        if (noColor) cmd += ` --no-color`;
        if (quietMode) cmd += ` -q`;

        // Output
        if (outputFile) cmd += ` -o ${outputFile}`;
        if (outputFormat && outputFormat !== "simple") cmd += ` --format ${outputFormat}`;

        return cmd;
    };

    const updateCommandPreview = () => {
        setCommand(generateCommand());
    };

    const runCommand = async () => {
        if (!url && !urlFile) {
            setOutput("Error: Please enter a Target URL or URL file");
            return;
        }

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
                        url, urlFile, extensions, threads, wordlists,
                        recursive, followRedirects, randomAgent, forceExtensions,
                        quietMode, noColor, tor, crawl,
                        httpMethod, includeStatus, excludeStatus, excludeSizes,
                        timeout, delay, maxTime, data, headers, cookie,
                        userAgent, proxy, auth, outputFormat, outputFile,
                        excludeText, excludeRegex, minResponseSize, maxResponseSize
                    }
                })
            });

            const data = await response.json();

            if (response.ok) {
                setOutput(prev => prev + `${data.output || "Command executed successfully"}\n`);
                setExecutionStatus("success");
            } else {
                setOutput(prev => prev + `${data.message || "Unknown error"}\n`);
                setExecutionStatus("error");
            }
        } catch (err) {
            setOutput(prev => prev + `${err.message}\n`);
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
            alert("Run command first.");
            return;
        }
        setShowPopup(true);
    };

    const handlePopupConfirm = () => {
        downloadTxtFile(output, outputFile);
        setShowPopup(false);
    };

    const handlePopupCancel = () => {
        setShowPopup(false);
    };

    // Helper for checkbox options
    const CheckboxOption = ({ label, checked, onChange, flag }) => (
        <label>
            <input type="checkbox" checked={checked} onChange={onChange} />
            {label} {flag && <span className="flag-hint">{flag}</span>}
        </label>
    );

    return (
        <div className="tool-box">
            <h3>
                Dirsearch Configuration
                {tool && <span className="tool-badge">{tool.tool_name}</span>}
            </h3>

            <div className="tool-form">
                {/* Core Fields */}
                <div className="tool-field">
                    <label>Target URL <span className="required">*</span></label>
                    <input
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>URL List File</label>
                    <input
                        placeholder="path/to/urls.txt"
                        value={urlFile}
                        onChange={(e) => setUrlFile(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Extensions</label>
                    <input
                        placeholder="php,asp,aspx,jsp,html"
                        value={extensions}
                        onChange={(e) => setExtensions(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Threads</label>
                    <input
                        type="number"
                        placeholder="25"
                        value={threads}
                        onChange={(e) => setThreads(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Wordlists</label>
                    <input
                        placeholder="/usr/share/wordlists/dirb/common.txt"
                        value={wordlists}
                        onChange={(e) => setWordlists(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>HTTP Method</label>
                    <select
                        value={httpMethod}
                        onChange={(e) => setHttpMethod(e.target.value)}
                    >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="HEAD">HEAD</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                        <option value="OPTIONS">OPTIONS</option>
                        <option value="PATCH">PATCH</option>
                    </select>
                </div>

                <div className="tool-field">
                    <label>Output File</label>
                    <input
                        placeholder="dirsearch_results.txt"
                        value={outputFile}
                        onChange={(e) => setOutputFile(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Output Format</label>
                    <select
                        value={outputFormat}
                        onChange={(e) => setOutputFormat(e.target.value)}
                    >
                        <option value="simple">Simple</option>
                        <option value="plain">Plain</option>
                        <option value="json">JSON</option>
                        <option value="xml">XML</option>
                        <option value="md">Markdown</option>
                        <option value="csv">CSV</option>
                        <option value="html">HTML</option>
                        <option value="sqlite">SQLite</option>
                    </select>
                </div>

                {/* Advanced Toggle
                <div className="tool-field" style={{ marginTop: '10px' }}>
                    <button
                        className="advanced-toggle"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#4a90d9',
                            cursor: 'pointer',
                            fontSize: '14px',
                            padding: '5px 0'
                        }}
                    >
                        {showAdvanced ? '▼' : '▶'} Advanced Settings
                    </button>
                </div>

                {showAdvanced && (
                    <>
                        <div className="tool-field">
                            <label>Status Codes (Include)</label>
                            <input
                                placeholder="200,300-399"
                                value={includeStatus}
                                onChange={(e) => setIncludeStatus(e.target.value)}
                            />
                        </div>

                        <div className="tool-field">
                            <label>Status Codes (Exclude)</label>
                            <input
                                placeholder="301,404,500-599"
                                value={excludeStatus}
                                onChange={(e) => setExcludeStatus(e.target.value)}
                            />
                        </div>

                        <div className="tool-field">
                            <label>Exclude Sizes</label>
                            <input
                                placeholder="0B,4KB"
                                value={excludeSizes}
                                onChange={(e) => setExcludeSizes(e.target.value)}
                            />
                        </div>

                        <div className="tool-field">
                            <label>Exclude Text</label>
                            <input
                                placeholder="Not Found"
                                value={excludeText}
                                onChange={(e) => setExcludeText(e.target.value)}
                            />
                        </div>

                        <div className="tool-field">
                            <label>Exclude Regex</label>
                            <input
                                placeholder=".*error.*"
                                value={excludeRegex}
                                onChange={(e) => setExcludeRegex(e.target.value)}
                            />
                        </div>

                        <div className="tool-field">
                            <label>Min Response Size</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={minResponseSize}
                                onChange={(e) => setMinResponseSize(e.target.value)}
                            />
                        </div>

                        <div className="tool-field">
                            <label>Max Response Size</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={maxResponseSize}
                                onChange={(e) => setMaxResponseSize(e.target.value)}
                            />
                        </div>

                        <div className="tool-field">
                            <label>Timeout (seconds)</label>
                            <input
                                type="number"
                                placeholder="10"
                                value={timeout}
                                onChange={(e) => setTimeout(e.target.value)}
                            />
                        </div>

                        <div className="tool-field">
                            <label>Delay (seconds)</label>
                            <input
                                type="number"
                                step="0.1"
                                placeholder="0"
                                value={delay}
                                onChange={(e) => setDelay(e.target.value)}
                            />
                        </div>

                        <div className="tool-field">
                            <label>Max Time (seconds)</label>
                            <input
                                type="number"
                                placeholder="3600"
                                value={maxTime}
                                onChange={(e) => setMaxTime(e.target.value)}
                            />
                        </div>

                        <div className="tool-field">
                            <label>Request Data</label>
                            <input
                                placeholder="username=admin&password=pass"
                                value={data}
                                onChange={(e) => setData(e.target.value)}
                            />
                        </div>

                        <div className="tool-field">
                            <label>Headers</label>
                            <input
                                placeholder="X-Custom: value"
                                value={headers}
                                onChange={(e) => setHeaders(e.target.value)}
                            />
                        </div>

                        <div className="tool-field">
                            <label>Cookie</label>
                            <input
                                placeholder="session=abc123"
                                value={cookie}
                                onChange={(e) => setCookie(e.target.value)}
                            />
                        </div>

                        <div className="tool-field">
                            <label>User-Agent</label>
                            <input
                                placeholder="Mozilla/5.0..."
                                value={userAgent}
                                onChange={(e) => setUserAgent(e.target.value)}
                            />
                        </div>

                        <div className="tool-field">
                            <label>Proxy</label>
                            <input
                                placeholder="http://127.0.0.1:8080"
                                value={proxy}
                                onChange={(e) => setProxy(e.target.value)}
                            />
                        </div>

                        <div className="tool-field">
                            <label>Authentication</label>
                            <input
                                placeholder="user:password"
                                value={auth}
                                onChange={(e) => setAuth(e.target.value)}
                            />
                        </div>
                    </>
                )} */}
            </div>

            {/* Checkbox Options - Same as Recon */}
            <div className="tool-options">
                <CheckboxOption
                    label="Recursive Scan"
                    checked={recursive}
                    onChange={(e) => setRecursive(e.target.checked)}
                    flag="(-r)"
                />

                <CheckboxOption
                    label="Follow Redirects"
                    checked={followRedirects}
                    onChange={(e) => setFollowRedirects(e.target.checked)}
                    flag="(-F)"
                />

                <CheckboxOption
                    label="Random User-Agent"
                    checked={randomAgent}
                    onChange={(e) => setRandomAgent(e.target.checked)}
                    flag="(--random-agent)"
                />

                <CheckboxOption
                    label="Force Extensions"
                    checked={forceExtensions}
                    onChange={(e) => setForceExtensions(e.target.checked)}
                    flag="(-f)"
                />

                <CheckboxOption
                    label="Quiet Mode"
                    checked={quietMode}
                    onChange={(e) => setQuietMode(e.target.checked)}
                    flag="(-q)"
                />

                <CheckboxOption
                    label="No Color Output"
                    checked={noColor}
                    onChange={(e) => setNoColor(e.target.checked)}
                    flag="(--no-color)"
                />

                <CheckboxOption
                    label="Use Tor Network"
                    checked={tor}
                    onChange={(e) => setTor(e.target.checked)}
                    flag="(--tor)"
                />

                <CheckboxOption
                    label="Crawl for Paths"
                    checked={crawl}
                    onChange={(e) => setCrawl(e.target.checked)}
                    flag="(--crawl)"
                />
            </div>

            {/* Command Area - Same as Recon */}
            <div className="command-area">
                <label>Generated Command</label>
                <div className="command-preview">
                    <span className="command-text">{command || "dirsearch -u <target>"}</span>
                </div>
                <br />

                <button
                    className={`run-btn ${isRunning ? 'running' : ''}`}
                    onClick={runCommand}
                    disabled={isRunning || (!url && !urlFile)}
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
                            marginLeft: "10px",
                            background: "#6b7a9a"
                        }}
                        onClick={clearTerminal}
                    >
                        <i className="fas fa-eraser"></i> Clear
                    </button>
                )}
            </div>

            {/* Terminal Output - Same as Recon */}
            <div className="command-area">
                <label>Terminal Output</label>
                <div className="terminal" ref={terminalRef}>
                    <pre>
                        {output || "Waiting for execution..."}
                        {isRunning && <span className="cursor"></span>}
                    </pre>
                </div>

                {output && output !== "Waiting for execution..." && output !== "Error: Please enter a Target URL or URL file" && (
                    <div className="action-buttons">
                        <AIAnalysisPanel
                            output={output}
                            toolName={tool?.tool_name || "Dirsearch"}
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

            {/* Popup - Same as Recon */}
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

export default DirsearchParameters;