import { useState, useRef, useEffect } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";
import "./ToolCommon.css";

function TruffleHogParameters({ tool, parameters, setParameters, stageCode, onAdvanceStage }) 
{
    const [commandType, setCommandType] = useState("");

    const [logLevel, setLogLevel] = useState("");
    const [jsonOutput, setJsonOutput] = useState(false);
    const [jsonLegacy, setJsonLegacy] = useState(false);
    const [githubActions, setGithubActions] = useState(false);
    const [concurrency, setConcurrency] = useState("");
    const [noVerification, setNoVerification] = useState(false);
    const [results, setResults] = useState("");
    const [noColor, setNoColor] = useState(false);
    const [allowVerificationOverlap, setAllowVerificationOverlap] = useState(false);
    const [filterUnverified, setFilterUnverified] = useState(false);
    const [filterEntropy, setFilterEntropy] = useState("");
    const [maxDecodeDepth, setMaxDecodeDepth] = useState("");
    const [configPath, setConfigPath] = useState("");
    const [printAvgDetectorTime, setPrintAvgDetectorTime] = useState(false);
    const [noUpdate, setNoUpdate] = useState(false);
    const [fail, setFail] = useState(false);
    const [failOnScanErrors, setFailOnScanErrors] = useState(false);
    const [includeDetectors, setIncludeDetectors] = useState("");
    const [excludeDetectors, setExcludeDetectors] = useState("");
    const [noVerificationCache, setNoVerificationCache] = useState(false);
    const [forceSkipBinaries, setForceSkipBinaries] = useState(false);
    const [forceSkipArchives, setForceSkipArchives] = useState(false);
    const [skipAdditionalRefs, setSkipAdditionalRefs] = useState(false);
    const [userAgentSuffix, setUserAgentSuffix] = useState("");

    const [gitUri, setGitUri] = useState("");
    const [githubToken, setGithubToken] = useState("");
    const [githubRepo, setGithubRepo] = useState("");
    const [githubExperimental, setGithubExperimental] = useState(false);
    const [gitlabToken, setGitlabToken] = useState("");
    const [filesystemPaths, setFilesystemPaths] = useState("");
    const [syslogFormat, setSyslogFormat] = useState("");
    const [circleciToken, setCircleciToken] = useState("");
    const [travisciToken, setTravisciToken] = useState("");
    const [jenkinsUrl, setJenkinsUrl] = useState("");
    const [jenkinsToken, setJenkinsToken] = useState("");
    const [jsonEnumeratorPaths, setJsonEnumeratorPaths] = useState("");

    const [extraArgs, setExtraArgs] = useState("");

    const [command, setCommand] = useState("");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [executionStatus, setExecutionStatus] = useState("waiting");

    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("");
    const [outputFile, setOutputFile] = useState("trufflehog_output.txt");

    const terminalRef = useRef(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [output]);

    useEffect(() => {
        updateCommandPreview();
    }, [
        commandType,
        logLevel,
        jsonOutput,
        jsonLegacy,
        githubActions,
        concurrency,
        noVerification,
        results,
        noColor,
        allowVerificationOverlap,
        filterUnverified,
        filterEntropy,
        maxDecodeDepth,
        configPath,
        printAvgDetectorTime,
        noUpdate,
        fail,
        failOnScanErrors,
        includeDetectors,
        excludeDetectors,
        noVerificationCache,
        forceSkipBinaries,
        forceSkipArchives,
        skipAdditionalRefs,
        userAgentSuffix,
        gitUri,
        githubToken,
        githubRepo,
        githubExperimental,
        gitlabToken,
        filesystemPaths,
        syslogFormat,
        circleciToken,
        travisciToken,
        jenkinsUrl,
        jenkinsToken,
        jsonEnumeratorPaths,
        extraArgs
    ]);

    const generateCommand = () => {
        let cmd = "trufflehog";

        if (commandType) {
            cmd += ` ${commandType}`;
        }

        switch (commandType) {
            case "git":
                if (gitUri) cmd += ` ${gitUri}`;
                break;
            case "github":
                if (githubToken) cmd += ` --token=${githubToken}`;
                if (githubRepo && githubExperimental) {
                    cmd += ` --repo=${githubRepo}`;
                }
                break;
            case "github-experimental":
                break;
            case "gitlab":
                if (gitlabToken) cmd += ` --token=${gitlabToken}`;
                break;
            case "filesystem":
                if (filesystemPaths) cmd += ` ${filesystemPaths}`;
                break;
            case "syslog":
                if (syslogFormat) cmd += ` --format=${syslogFormat}`;
                break;
            case "circleci":
                if (circleciToken) cmd += ` --token=${circleciToken}`;
                break;
            case "travisci":
                if (travisciToken) cmd += ` --token=${travisciToken}`;
                break;
            case "jenkins":
                if (jenkinsUrl) cmd += ` --url=${jenkinsUrl}`;
                if (jenkinsToken) cmd += ` --token=${jenkinsToken}`;
                break;
            case "json-enumerator":
                if (jsonEnumeratorPaths) cmd += ` ${jsonEnumeratorPaths}`;
                break;
            default:
                break;
        }

        if (logLevel) cmd += ` --log-level=${logLevel}`;
        if (jsonOutput) cmd += " --json";
        if (jsonLegacy) cmd += " --json-legacy";
        if (githubActions) cmd += " --github-actions";
        if (concurrency) cmd += ` --concurrency=${concurrency}`;
        if (noVerification) cmd += " --no-verification";
        if (results) cmd += ` --results=${results}`;
        if (noColor) cmd += " --no-color";
        if (allowVerificationOverlap) cmd += " --allow-verification-overlap";
        if (filterUnverified) cmd += " --filter-unverified";
        if (filterEntropy) cmd += ` --filter-entropy=${filterEntropy}`;
        if (maxDecodeDepth) cmd += ` --max-decode-depth=${maxDecodeDepth}`;
        if (configPath) cmd += ` --config=${configPath}`;
        if (printAvgDetectorTime) cmd += " --print-avg-detector-time";
        if (noUpdate) cmd += " --no-update";
        if (fail) cmd += " --fail";
        if (failOnScanErrors) cmd += " --fail-on-scan-errors";
        if (includeDetectors && includeDetectors !== "all") {
            cmd += ` --include-detectors=${includeDetectors}`;
        }
        if (excludeDetectors) cmd += ` --exclude-detectors=${excludeDetectors}`;
        if (noVerificationCache) cmd += " --no-verification-cache";
        if (forceSkipBinaries) cmd += " --force-skip-binaries";
        if (forceSkipArchives) cmd += " --force-skip-archives";
        if (skipAdditionalRefs) cmd += " --skip-additional-refs";
        if (userAgentSuffix) cmd += ` --user-agent-suffix=${userAgentSuffix}`;

        // Extra args
        if (extraArgs.trim()) {
            cmd += ` ${extraArgs.trim()}`;
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
                            commandType,
                            logLevel,
                            jsonOutput,
                            jsonLegacy,
                            githubActions,
                            concurrency,
                            noVerification,
                            results,
                            noColor,
                            allowVerificationOverlap,
                            filterUnverified,
                            filterEntropy,
                            maxDecodeDepth,
                            configPath,
                            printAvgDetectorTime,
                            noUpdate,
                            fail,
                            failOnScanErrors,
                            includeDetectors,
                            excludeDetectors,
                            noVerificationCache,
                            forceSkipBinaries,
                            forceSkipArchives,
                            skipAdditionalRefs,
                            userAgentSuffix,
                            gitUri,
                            githubToken,
                            githubRepo,
                            githubExperimental,
                            gitlabToken,
                            filesystemPaths,
                            syslogFormat,
                            circleciToken,
                            travisciToken,
                            jenkinsUrl,
                            jenkinsToken,
                            jsonEnumeratorPaths,
                            extraArgs
                        }
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                setOutput(prev =>
                    prev +
                    `${data.output || "Command executed successfully"}\n`
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
            downloadTxtFile(
                output,
                outputFile || "trufflehog_output.txt"
            );
            setShowPopup(false);
            setPopupType("");
        }
    };

    const handlePopupCancel = () => {
        setShowPopup(false);
        setPopupType("");
    };

    const renderCommandFields = () => {
        switch (commandType) {
            case "git":
                return (
                    <div className="tool-field">
                        <label>Git Repository URI</label>
                        <input
                            type="text"
                            placeholder="https://github.com/user/repo.git"
                            value={gitUri}
                            onChange={(e) => setGitUri(e.target.value)}
                        />
                    </div>
                );
            case "github":
                return (
                    <>
                        <div className="tool-field">
                            <label>GitHub Token</label>
                            <input
                                type="password"
                                placeholder="ghp_..."
                                value={githubToken}
                                onChange={(e) => setGithubToken(e.target.value)}
                            />
                        </div>
                        <div className="tool-field" style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <label style={{ marginRight: '10px' }}>Experimental Mode</label>
                            <input
                                type="checkbox"
                                checked={githubExperimental}
                                onChange={(e) => setGithubExperimental(e.target.checked)}
                            />
                        </div>
                        {githubExperimental && (
                            <div className="tool-field">
                                <label>Repository (--repo)</label>
                                <input
                                    type="text"
                                    placeholder="user/repo"
                                    value={githubRepo}
                                    onChange={(e) => setGithubRepo(e.target.value)}
                                />
                            </div>
                        )}
                    </>
                );
            case "gitlab":
                return (
                    <div className="tool-field">
                        <label>GitLab Token</label>
                        <input
                            type="password"
                            placeholder="glpat-..."
                            value={gitlabToken}
                            onChange={(e) => setGitlabToken(e.target.value)}
                        />
                    </div>
                );
            case "filesystem":
                return (
                    <div className="tool-field">
                        <label>Paths (space separated)</label>
                        <input
                            type="text"
                            placeholder="/path/to/dir /path/to/file"
                            value={filesystemPaths}
                            onChange={(e) => setFilesystemPaths(e.target.value)}
                        />
                    </div>
                );
            case "syslog":
                return (
                    <div className="tool-field">
                        <label>Format (--format)</label>
                        <input
                            type="text"
                            placeholder="rfc5424, rfc3164, etc."
                            value={syslogFormat}
                            onChange={(e) => setSyslogFormat(e.target.value)}
                        />
                    </div>
                );
            case "circleci":
                return (
                    <div className="tool-field">
                        <label>CircleCI Token</label>
                        <input
                            type="password"
                            placeholder="Your CircleCI token"
                            value={circleciToken}
                            onChange={(e) => setCircleciToken(e.target.value)}
                        />
                    </div>
                );
            case "travisci":
                return (
                    <div className="tool-field">
                        <label>TravisCI Token</label>
                        <input
                            type="password"
                            placeholder="Your TravisCI token"
                            value={travisciToken}
                            onChange={(e) => setTravisciToken(e.target.value)}
                        />
                    </div>
                );
            case "jenkins":
                return (
                    <>
                        <div className="tool-field">
                            <label>Jenkins URL</label>
                            <input
                                type="text"
                                placeholder="https://jenkins.example.com"
                                value={jenkinsUrl}
                                onChange={(e) => setJenkinsUrl(e.target.value)}
                            />
                        </div>
                        <div className="tool-field">
                            <label>Jenkins Token</label>
                            <input
                                type="password"
                                placeholder="Your Jenkins API token"
                                value={jenkinsToken}
                                onChange={(e) => setJenkinsToken(e.target.value)}
                            />
                        </div>
                    </>
                );
            case "json-enumerator":
                return (
                    <div className="tool-field">
                        <label>JSON Enumerator Paths</label>
                        <input
                            type="text"
                            placeholder="path/to/file1 path/to/file2"
                            value={jsonEnumeratorPaths}
                            onChange={(e) => setJsonEnumeratorPaths(e.target.value)}
                        />
                    </div>
                );
            default:
                // Commands with no specific fields: docker, s3, gcs, postman, elasticsearch, huggingface, stdin, multi-scan, analyze
                return (
                    <div className="tool-field">
                        <em>No additional arguments required for this command.</em>
                    </div>
                );
        }
    };

    return (
        <div className="tool-box">
            <h3>
                TruffleHog Configuration
                {tool && <span className="tool-badge">{tool.tool_name}</span>}
            </h3>

            <div className="tool-form">
                {/* Command dropdown */}
                <div className="tool-field">
                    <label>Command</label>
                    <select
                        value={commandType}
                        onChange={(e) => setCommandType(e.target.value)}
                    >
                        <option value="git">git – Scan Git Repository</option>
                        <option value="github">github – Scan GitHub</option>
                        <option value="gitlab">gitlab – Scan GitLab</option>
                        <option value="filesystem">filesystem – Scan Local Filesystem</option>
                        <option value="s3">s3 – Scan S3 Buckets</option>
                        <option value="gcs">gcs – Scan GCS Buckets</option>
                        <option value="syslog">syslog – Scan Syslog</option>
                        <option value="circleci">circleci – Scan CircleCI</option>
                        <option value="docker">docker – Scan Docker Image</option>
                        <option value="travisci">travisci – Scan TravisCI</option>
                        <option value="postman">postman – Scan Postman</option>
                        <option value="elasticsearch">elasticsearch – Scan Elasticsearch</option>
                        <option value="jenkins">jenkins – Scan Jenkins</option>
                        <option value="huggingface">huggingface – Scan HuggingFace</option>
                        <option value="stdin">stdin – Scan from STDIN</option>
                        <option value="multi-scan">multi-scan – Multiple Sources</option>
                        <option value="json-enumerator">json-enumerator – JSON Enumerator</option>
                        <option value="analyze">analyze – Analyze API Keys</option>
                    </select>
                </div>

                {/* {renderCommandFields()} */}

                <div className="tool-field">
                    <label>Log Level</label>
                    <select
                        value={logLevel}
                        onChange={(e) => setLogLevel(e.target.value)}
                    >
                        <option value="">Default (info)</option>
                        <option value="0">0 (info)</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5 (trace)</option>
                        <option value="-1">-1 (disabled)</option>
                    </select>
                </div>

                <div className="tool-field">
                    <label>Concurrency</label>
                    <input
                        type="number"
                        placeholder="6"
                        value={concurrency}
                        onChange={(e) => setConcurrency(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Results (comma separated)</label>
                    <input
                        type="text"
                        placeholder="verified,unverified,unknown"
                        value={results}
                        onChange={(e) => setResults(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Filter Entropy</label>
                    <input
                        type="number"
                        step="0.1"
                        placeholder="e.g., 3.0"
                        value={filterEntropy}
                        onChange={(e) => setFilterEntropy(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Max Decode Depth</label>
                    <input
                        type="number"
                        placeholder="5"
                        value={maxDecodeDepth}
                        onChange={(e) => setMaxDecodeDepth(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Config File Path</label>
                    <input
                        type="text"
                        placeholder="/path/to/config.yaml"
                        value={configPath}
                        onChange={(e) => setConfigPath(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Include Detectors (comma separated or 'all')</label>
                    <input
                        type="text"
                        placeholder="all"
                        value={includeDetectors}
                        onChange={(e) => setIncludeDetectors(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Exclude Detectors (comma separated)</label>
                    <input
                        type="text"
                        placeholder="aws,github"
                        value={excludeDetectors}
                        onChange={(e) => setExcludeDetectors(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>User-Agent Suffix</label>
                    <input
                        type="text"
                        placeholder="my-suffix"
                        value={userAgentSuffix}
                        onChange={(e) => setUserAgentSuffix(e.target.value)}
                    />
                </div>
            </div>

            <div className="tool-options">
                <label>
                    <input
                        type="checkbox"
                        checked={jsonOutput}
                        onChange={(e) => setJsonOutput(e.target.checked)}
                    />
                    JSON Output
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={jsonLegacy}
                        onChange={(e) => setJsonLegacy(e.target.checked)}
                    />
                    JSON Legacy (pre-v3.0)
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={githubActions}
                        onChange={(e) => setGithubActions(e.target.checked)}
                    />
                    GitHub Actions Format
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={noVerification}
                        onChange={(e) => setNoVerification(e.target.checked)}
                    />
                    No Verification
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={noColor}
                        onChange={(e) => setNoColor(e.target.checked)}
                    />
                    No Color
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={allowVerificationOverlap}
                        onChange={(e) => setAllowVerificationOverlap(e.target.checked)}
                    />
                    Allow Verification Overlap
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={filterUnverified}
                        onChange={(e) => setFilterUnverified(e.target.checked)}
                    />
                    Filter Unverified
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={printAvgDetectorTime}
                        onChange={(e) => setPrintAvgDetectorTime(e.target.checked)}
                    />
                    Print Avg Detector Time
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={noUpdate}
                        onChange={(e) => setNoUpdate(e.target.checked)}
                    />
                    No Update Check
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={fail}
                        onChange={(e) => setFail(e.target.checked)}
                    />
                    Fail (exit code 183) if results found
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={failOnScanErrors}
                        onChange={(e) => setFailOnScanErrors(e.target.checked)}
                    />
                    Fail on Scan Errors
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={noVerificationCache}
                        onChange={(e) => setNoVerificationCache(e.target.checked)}
                    />
                    No Verification Cache
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={forceSkipBinaries}
                        onChange={(e) => setForceSkipBinaries(e.target.checked)}
                    />
                    Force Skip Binaries
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={forceSkipArchives}
                        onChange={(e) => setForceSkipArchives(e.target.checked)}
                    />
                    Force Skip Archives
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={skipAdditionalRefs}
                        onChange={(e) => setSkipAdditionalRefs(e.target.checked)}
                    />
                    Skip Additional Refs
                </label>
            </div>

            <div className="tool-form">
                <div className="tool-field">
                    <label>Extra Arguments</label>
                    <input
                        type="text"
                        placeholder="--custom-flag value"
                        value={extraArgs}
                        onChange={(e) => setExtraArgs(e.target.value)}
                    />
                </div>
            </div>

            <div className="command-area">
                <label>Generated Command</label>
                <div className="command-preview">
                    <span className="command-text">
                        {command || "Command..."}
                    </span>
                </div>
                <br />

                <button
                    className={`run-btn ${isRunning ? 'running' : ''}`}
                    onClick={runCommand}
                    disabled={isRunning || !command}
                >
                    {isRunning ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i>
                            {" "}Running...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-play"></i>
                            {" "}Run Command
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

            {/* Terminal Output */}
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
                            toolName={tool?.tool_name || "TruffleHog"}
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

            {/* Download Popup */}
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

export default TruffleHogParameters;