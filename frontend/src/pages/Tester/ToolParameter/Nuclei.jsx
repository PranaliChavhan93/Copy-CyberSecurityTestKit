import { useState, useRef, useEffect } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";
import "./ToolCommon.css";

function NucleiParameters({
    tool,
    parameters,
    setParameters,
    stageCode,
    onAdvanceStage
}) {
    // Target
    const [target, setTarget] = useState("");
    const [list, setList] = useState("");
    const [excludeHosts, setExcludeHosts] = useState("");
    const [resume, setResume] = useState("");
    const [scanAllIPs, setScanAllIPs] = useState(false);
    const [ipVersion, setIpVersion] = useState("4");

    // Templates & Filtering
    const [templates, setTemplates] = useState("");
    const [workflows, setWorkflows] = useState("");
    const [tags, setTags] = useState("");
    const [excludeTags, setExcludeTags] = useState("");
    const [severity, setSeverity] = useState("");
    const [excludeSeverity, setExcludeSeverity] = useState("");
    const [type, setType] = useState("");
    const [excludeType, setExcludeType] = useState("");
    const [templateId, setTemplateId] = useState("");
    const [validate, setValidate] = useState(false);
    const [templateList, setTemplateList] = useState(false);

    // Output
    const [output, setOutput] = useState("");
    const [silent, setSilent] = useState(false);
    const [noColor, setNoColor] = useState(false);
    const [jsonl, setJsonl] = useState(false);
    const [omitRaw, setOmitRaw] = useState(false);
    const [markdownExport, setMarkdownExport] = useState("");
    const [jsonExport, setJsonExport] = useState("");

    // Config
    const [followRedirects, setFollowRedirects] = useState(false);
    const [maxRedirects, setMaxRedirects] = useState("10");
    const [headers, setHeaders] = useState("");
    const [vars, setVars] = useState("");
    const [proxy, setProxy] = useState("");
    const [passive, setPassive] = useState(false);
    const [headless, setHeadless] = useState(false);
    const [showBrowser, setShowBrowser] = useState(false);

    // Performance
    const [rateLimit, setRateLimit] = useState("150");
    const [concurrency, setConcurrency] = useState("25");
    const [timeout, setTimeout] = useState("10");
    const [retries, setRetries] = useState("1");

    // Debug
    const [debug, setDebug] = useState(false);
    const [verbose, setVerbose] = useState(false);
    const [verboseVerbose, setVerboseVerbose] = useState(false);

    const [command, setCommand] = useState("");
    const [commandOutput, setCommandOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [executionStatus, setExecutionStatus] = useState("waiting");
    const [showPopup, setShowPopup] = useState(false);
    const [outputFile, setOutputFile] = useState("nuclei_results.txt");
    const terminalRef = useRef(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [commandOutput]);

    useEffect(() => {
        updateCommandPreview();
    }, [
        target, list, excludeHosts, resume, scanAllIPs, ipVersion,
        templates, workflows, tags, excludeTags, severity, excludeSeverity,
        type, excludeType, templateId, validate, templateList,
        output, silent, noColor, jsonl, omitRaw, markdownExport, jsonExport,
        followRedirects, maxRedirects, headers, vars, proxy, passive,
        headless, showBrowser, rateLimit, concurrency, timeout, retries,
        debug, verbose, verboseVerbose
    ]);

    const generateCommand = () => {
        let cmd = "nuclei";

        // Target
        if (target) cmd += ` -u ${target}`;
        if (list) cmd += ` -l ${list}`;
        if (excludeHosts) cmd += ` -eh ${excludeHosts}`;
        if (resume) cmd += ` -resume ${resume}`;
        if (scanAllIPs) cmd += " -sa";
        if (ipVersion !== "4") cmd += ` -iv ${ipVersion}`;

        // Templates & Filtering
        if (templates) cmd += ` -t ${templates}`;
        if (workflows) cmd += ` -w ${workflows}`;
        if (tags) cmd += ` -tags ${tags}`;
        if (excludeTags) cmd += ` -etags ${excludeTags}`;
        if (severity) cmd += ` -s ${severity}`;
        if (excludeSeverity) cmd += ` -es ${excludeSeverity}`;
        if (type) cmd += ` -pt ${type}`;
        if (excludeType) cmd += ` -ept ${excludeType}`;
        if (templateId) cmd += ` -id ${templateId}`;
        if (validate) cmd += " -validate";
        if (templateList) cmd += " -tl";

        // Output
        if (output) cmd += ` -o ${output}`;
        if (silent) cmd += " -silent";
        if (noColor) cmd += " -nc";
        if (jsonl) cmd += " -j";
        if (omitRaw) cmd += " -or";
        if (markdownExport) cmd += ` -me ${markdownExport}`;
        if (jsonExport) cmd += ` -je ${jsonExport}`;

        // Config
        if (followRedirects) cmd += " -fr";
        if (maxRedirects !== "10") cmd += ` -mr ${maxRedirects}`;
        if (headers) cmd += ` -H "${headers}"`;
        if (vars) cmd += ` -V ${vars}`;
        if (proxy) cmd += ` -p ${proxy}`;
        if (passive) cmd += " -passive";
        if (headless) cmd += " -headless";
        if (showBrowser) cmd += " -sb";

        // Performance
        if (rateLimit !== "150") cmd += ` -rl ${rateLimit}`;
        if (concurrency !== "25") cmd += ` -c ${concurrency}`;
        if (timeout !== "10") cmd += ` -timeout ${timeout}`;
        if (retries !== "1") cmd += ` -retries ${retries}`;

        // Debug
        if (debug) cmd += " -debug";
        if (verbose) cmd += " -v";
        if (verboseVerbose) cmd += " -vv";

        return cmd;
    };

    const updateCommandPreview = () => {
        setCommand(generateCommand());
    };

    const runCommand = async () => {
        const cmd = generateCommand();
        setIsRunning(true);
        setExecutionStatus("running");
        setCommandOutput(prev => prev + `\n# ${cmd}\n`);

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
                        target, list, excludeHosts, resume, scanAllIPs, ipVersion,
                        templates, workflows, tags, excludeTags, severity, excludeSeverity,
                        type, excludeType, templateId, validate, templateList,
                        output, silent, noColor, jsonl, omitRaw, markdownExport, jsonExport,
                        followRedirects, maxRedirects, headers, vars, proxy, passive,
                        headless, showBrowser, rateLimit, concurrency, timeout, retries,
                        debug, verbose, verboseVerbose
                    }
                })
            });

            const data = await response.json();
            if (response.ok) {
                setCommandOutput(prev => prev + `${data.output || "Command executed successfully"}\n`);
                setExecutionStatus("success");
            } else {
                setCommandOutput(prev => prev + `${data.message || "Unknown error"}\n`);
                setExecutionStatus("error");
            }
        } catch (error) {
            setCommandOutput(prev => prev + `${error.message}\n`);
            setExecutionStatus("error");
        } finally {
            setIsRunning(false);
        }
    };

    const clearTerminal = () => {
        setCommandOutput("");
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
        if (!commandOutput || commandOutput === "Waiting for execution...") {
            alert("No output available! Please run the command first.");
            return;
        }
        setShowPopup(true);
    };

    const handlePopupConfirm = () => {
        downloadTxtFile(commandOutput, outputFile || "nuclei_results.txt");
        setShowPopup(false);
    };

    const handlePopupCancel = () => {
        setShowPopup(false);
    };

    return (
        <div className="tool-box">
            <h3>
                Nuclei Configuration
                {tool && <span className="tool-badge">{tool.tool_name}</span>}
            </h3>

            <div className="tool-form">
                {/* Target Section */}
                <h4>Target</h4>
                <div className="tool-field">
                    <label>Target URL</label>
                    <input type="text" placeholder="example.com" value={target} onChange={(e) => setTarget(e.target.value)} />
                </div>
                <div className="tool-field">
                    <label>Target List File</label>
                    <input type="text" placeholder="hosts.txt" value={list} onChange={(e) => setList(e.target.value)} />
                </div>
                <div className="tool-field">
                    <label>Exclude Hosts</label>
                    <input type="text" placeholder="192.168.1.1,10.0.0.0/8" value={excludeHosts} onChange={(e) => setExcludeHosts(e.target.value)} />
                </div>
                <div className="tool-field">
                    <label>Resume File</label>
                    <input type="text" placeholder="resume.cfg" value={resume} onChange={(e) => setResume(e.target.value)} />
                </div>
                <div className="tool-field">
                    <label>IP Version</label>
                    <select value={ipVersion} onChange={(e) => setIpVersion(e.target.value)}>
                        <option value="4">IPv4</option>
                        <option value="6">IPv6</option>
                        <option value="4,6">Both</option>
                    </select>
                </div>

                {/* Templates & Filtering */}
                <h4>Templates & Filtering</h4>
                <div className="tool-field">
                    <label>Templates</label>
                    <input type="text" placeholder="http/cves/,ssl/" value={templates} onChange={(e) => setTemplates(e.target.value)} />
                </div>
                <div className="tool-field">
                    <label>Workflows</label>
                    <input type="text" placeholder="workflow.yaml" value={workflows} onChange={(e) => setWorkflows(e.target.value)} />
                </div>
                <div className="tool-field">
                    <label>Template ID(s)</label>
                    <input type="text" placeholder="CVE-2021-1234" value={templateId} onChange={(e) => setTemplateId(e.target.value)} />
                </div>
                <div className="tool-field">
                    <label>Tags</label>
                    <input type="text" placeholder="cve,security" value={tags} onChange={(e) => setTags(e.target.value)} />
                </div>
                <div className="tool-field">
                    <label>Exclude Tags</label>
                    <input type="text" placeholder="deprecated" value={excludeTags} onChange={(e) => setExcludeTags(e.target.value)} />
                </div>
                <div className="tool-field">
                    <label>Severity</label>
                    <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
                        <option value="">All</option>
                        <option value="info">Info</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                    </select>
                </div>
                <div className="tool-field">
                    <label>Exclude Severity</label>
                    <select value={excludeSeverity} onChange={(e) => setExcludeSeverity(e.target.value)}>
                        <option value="">None</option>
                        <option value="info">Info</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                    </select>
                </div>
                <div className="tool-field">
                    <label>Protocol Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="">All</option>
                        <option value="http">HTTP</option>
                        <option value="dns">DNS</option>
                        <option value="tcp">TCP</option>
                        <option value="headless">Headless</option>
                        <option value="ssl">SSL</option>
                    </select>
                </div>

                {/* Output */}
                <h4>Output</h4>
                <div className="tool-field">
                    <label>Output File</label>
                    <input type="text" placeholder="results.txt" value={output} onChange={(e) => setOutput(e.target.value)} />
                </div>
                <div className="tool-field">
                    <label>Markdown Export</label>
                    <input type="text" placeholder="reports/" value={markdownExport} onChange={(e) => setMarkdownExport(e.target.value)} />
                </div>
                <div className="tool-field">
                    <label>JSON Export</label>
                    <input type="text" placeholder="output.json" value={jsonExport} onChange={(e) => setJsonExport(e.target.value)} />
                </div>

                {/* Configuration */}
                <h4>Configuration</h4>
                <div className="tool-field">
                    <label>Headers</label>
                    <input type="text" placeholder="Authorization: Bearer token" value={headers} onChange={(e) => setHeaders(e.target.value)} />
                </div>
                <div className="tool-field">
                    <label>Variables</label>
                    <input type="text" placeholder="key=value" value={vars} onChange={(e) => setVars(e.target.value)} />
                </div>
                <div className="tool-field">
                    <label>Proxy</label>
                    <input type="text" placeholder="http://127.0.0.1:8080" value={proxy} onChange={(e) => setProxy(e.target.value)} />
                </div>
                <div className="tool-field">
                    <label>Max Redirects</label>
                    <input type="number" value={maxRedirects} onChange={(e) => setMaxRedirects(e.target.value)} />
                </div>

                {/* Performance */}
                <h4>Performance</h4>
                <div className="tool-field">
                    <label>Rate Limit (req/sec)</label>
                    <input type="number" value={rateLimit} onChange={(e) => setRateLimit(e.target.value)} />
                </div>
                <div className="tool-field">
                    <label>Concurrency</label>
                    <input type="number" value={concurrency} onChange={(e) => setConcurrency(e.target.value)} />
                </div>
                <div className="tool-field">
                    <label>Timeout (sec)</label>
                    <input type="number" value={timeout} onChange={(e) => setTimeout(e.target.value)} />
                </div>
                <div className="tool-field">
                    <label>Retries</label>
                    <input type="number" value={retries} onChange={(e) => setRetries(e.target.value)} />
                </div>
            </div>

            {/* Checkboxes */}
            <div className="tool-options">
                <label><input type="checkbox" checked={scanAllIPs} onChange={(e) => setScanAllIPs(e.target.checked)} /> Scan All IPs</label>
                <label><input type="checkbox" checked={validate} onChange={(e) => setValidate(e.target.checked)} /> Validate Templates</label>
                <label><input type="checkbox" checked={templateList} onChange={(e) => setTemplateList(e.target.checked)} /> List Templates</label>
                <label><input type="checkbox" checked={headless} onChange={(e) => setHeadless(e.target.checked)} /> Headless</label>
                <label><input type="checkbox" checked={showBrowser} onChange={(e) => setShowBrowser(e.target.checked)} /> Show Browser</label>
                <label><input type="checkbox" checked={followRedirects} onChange={(e) => setFollowRedirects(e.target.checked)} /> Follow Redirects</label>
                <label><input type="checkbox" checked={passive} onChange={(e) => setPassive(e.target.checked)} /> Passive Mode</label>
                <label><input type="checkbox" checked={silent} onChange={(e) => setSilent(e.target.checked)} /> Silent</label>
                <label><input type="checkbox" checked={noColor} onChange={(e) => setNoColor(e.target.checked)} /> No Color</label>
                <label><input type="checkbox" checked={jsonl} onChange={(e) => setJsonl(e.target.checked)} /> JSONL</label>
                <label><input type="checkbox" checked={omitRaw} onChange={(e) => setOmitRaw(e.target.checked)} /> Omit Raw</label>
                <label><input type="checkbox" checked={debug} onChange={(e) => setDebug(e.target.checked)} /> Debug</label>
                <label><input type="checkbox" checked={verbose} onChange={(e) => setVerbose(e.target.checked)} /> Verbose</label>
                <label><input type="checkbox" checked={verboseVerbose} onChange={(e) => setVerboseVerbose(e.target.checked)} /> Very Verbose</label>
            </div>

            {/* Command Execution */}
            <div className="command-area">
                <label>Generated Command</label>
                <div className="command-preview">
                    <span className="command-text">{command || "Command..."}</span>
                </div>
                <br />
                <button
                    className={`run-btn ${isRunning ? 'running' : ''}`}
                    onClick={runCommand}
                    disabled={isRunning || !command || (!target && !list)}
                >
                    {isRunning ? (
                        <><i className="fas fa-spinner fa-spin"></i> Running...</>
                    ) : (
                        <><i className="fas fa-play"></i> Run Command</>
                    )}
                </button>
                {commandOutput && (
                    <button
                        className="run-btn"
                        style={{ background: "#6b7a9a", marginLeft: "10px", padding: "12px 20px" }}
                        onClick={clearTerminal}
                    >
                        <i className="fas fa-eraser"></i> Clear
                    </button>
                )}
            </div>

            {/* Terminal Output */}
            <div className="command-area">
                <label>Terminal Output</label>
                <div className="terminal" ref={terminalRef}>
                    <pre>
                        {commandOutput || "Waiting for execution..."}
                        {isRunning && <span className="cursor"></span>}
                    </pre>
                </div>
                {commandOutput && commandOutput !== "Waiting for execution..." && (
                    <div className="action-buttons">
                        <AIAnalysisPanel
                            output={commandOutput}
                            toolName={tool?.tool_name || "Nuclei"}
                            stageCode={stageCode}
                            onAdvanceStage={onAdvanceStage}
                        />
                        <button className="download-btn" onClick={handleDownload}>
                            <i className="fas fa-download"></i> Download TXT
                        </button>
                    </div>
                )}
            </div>

            {/* Popup */}
            {showPopup && (
                <div className="popup-overlay" onClick={handlePopupCancel}>
                    <div className="popup-box confirm-popup" onClick={(e) => e.stopPropagation()}>
                        <h3><i className="fas fa-download"></i> Download File</h3>
                        <div className="popup-message">
                            <p>Do you want to download this output as a .txt file?</p>
                        </div>
                        <div className="popup-file-info">
                            <label>File Name</label>
                            <input type="text" value={outputFile} onChange={(e) => setOutputFile(e.target.value)} />
                            <small>The output will be saved as a text file.</small>
                        </div>
                        <div className="popup-buttons">
                            <button className="popup-cancel-btn" onClick={handlePopupCancel}>Cancel</button>
                            <button className="popup-confirm-btn" onClick={handlePopupConfirm}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NucleiParameters;