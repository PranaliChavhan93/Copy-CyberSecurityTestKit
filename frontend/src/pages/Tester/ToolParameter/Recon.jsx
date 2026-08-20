import { useState, useRef, useEffect } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";
import "./ToolCommon.css";

function ReconParameters({ tool, parameters, setParameters, stageCode, onAdvanceStage }) {
    const [toolType, setToolType] = useState("recon-cli");
    const [workspace, setWorkspace] = useState("");
    const [module, setModule] = useState("");
    const [resourceFile, setResourceFile] = useState("");
    const [globalCommand, setGlobalCommand] = useState("");
    const [moduleCommand, setModuleCommand] = useState("");
    const [globalOption, setGlobalOption] = useState("");
    const [moduleOption, setModuleOption] = useState("");
    const [host, setHost] = useState("0.0.0.0");
    const [port, setPort] = useState("5000");
    const [showModules, setShowModules] = useState(false);
    const [showModuleOptions, setShowModuleOptions] = useState(false);
    const [showGlobalOptions, setShowGlobalOptions] = useState(false);
    const [runModule, setRunModule] = useState(true);
    const [disableVersion, setDisableVersion] = useState(false);
    const [disableAnalytics, setDisableAnalytics] = useState(false);
    const [disableMarketplace, setDisableMarketplace] = useState(false);
    const [stealth, setStealth] = useState(false);
    const [accessible, setAccessible] = useState(false);
    const [analytics, setAnalytics] = useState(false);
    const [version, setVersion] = useState(false);

    const [command, setCommand] = useState("");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [executionStatus, setExecutionStatus] = useState("waiting");

    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("");
    const [outputFile, setOutputFile] = useState("recon_results.txt");

    const terminalRef = useRef(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [output]);

    useEffect(() => {
        updateCommandPreview();
    }, [
        toolType,
        workspace,
        module,
        resourceFile,
        globalCommand,
        moduleCommand,
        globalOption,
        moduleOption,
        host,
        port,
        showModules,
        showModuleOptions,
        showGlobalOptions,
        runModule,
        disableVersion,
        disableAnalytics,
        disableMarketplace,
        stealth,
        accessible,
        analytics,
        version
    ]);

    const generateCommand = () => {
        let cmd = toolType;

        if (toolType === "recon-cli") {
            if (workspace) cmd += ` -w ${workspace}`;
            if (globalCommand) cmd += ` -C "${globalCommand}"`;
            if (moduleCommand) cmd += ` -c "${moduleCommand}"`;
            if (showGlobalOptions) cmd += ` -G`;
            if (globalOption) cmd += ` -g ${globalOption}`;
            if (showModules) cmd += ` -M`;
            if (module) cmd += ` -m ${module}`;
            if (showModuleOptions) cmd += ` -O`;
            if (moduleOption) cmd += ` -o ${moduleOption}`;
            if (runModule) cmd += ` -x`;
        } else if (toolType === "recon-ng") {
            if (workspace) cmd += ` -w ${workspace}`;
            if (resourceFile) cmd += ` -r ${resourceFile}`;
            if (accessible) cmd += ` --accessible`;
        } else {
            if (host) cmd += ` --host ${host}`;
            if (port) cmd += ` --port ${port}`;
        }

        if (disableVersion) cmd += ` --no-version`;
        if (disableAnalytics) cmd += ` --no-analytics`;
        if (disableMarketplace) cmd += ` --no-marketplace`;
        if (stealth) cmd += ` --stealth`;
        if (analytics) cmd += ` --analytics`;
        if (version) cmd += ` --version`;

        return cmd;
    };

    const updateCommandPreview = () => {
        setCommand(generateCommand());
    };

    const runCommand = async () => {
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
                        toolType,
                        workspace,
                        module,
                        resourceFile,
                        globalCommand,
                        moduleCommand,
                        globalOption,
                        moduleOption,
                        host,
                        port
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
        setPopupType("download");
        setShowPopup(true);
    };

    const handlePopupConfirm = () => {
        downloadTxtFile(output, outputFile);
        setShowPopup(false);
    };

    const handlePopupCancel = () => {
        setShowPopup(false);
        setPopupType("");
    };

    const saveParameters = () => {
        if (setParameters) {
            setParameters({
                toolType,
                workspace,
                module,
                resourceFile,
                globalCommand,
                moduleCommand,
                globalOption,
                moduleOption,
                host,
                port,
                command,
                output,
                executionStatus
            });
        }
    };

    return (
        <div className="tool-box">
            <h3>
                Recon-ng Configuration
                {tool && <span className="tool-badge">{tool.tool_name}</span>}
            </h3>

            <div className="tool-form">
                <div className="tool-field">
                    <label>Tool</label>
                    <select
                        value={toolType}
                        onChange={(e) => setToolType(e.target.value)}
                    >
                        <option value="recon-cli">recon-cli</option>
                        <option value="recon-ng">recon-ng</option>
                        <option value="recon-web">recon-web</option>
                    </select>
                </div>

                {(toolType === "recon-cli" || toolType === "recon-ng") && (
                    <div className="tool-field">
                        <label>Workspace</label>
                        <input
                            placeholder="default"
                            value={workspace}
                            onChange={(e) => setWorkspace(e.target.value)}
                        />
                    </div>
                )}

                {toolType === "recon-cli" && (
                    <div className="tool-field">
                        <label>Module</label>
                        <input
                            placeholder="recon/domains-hosts/bing_domain_web"
                            value={module}
                            onChange={(e) => setModule(e.target.value)}
                        />
                    </div>
                )}

                {toolType === "recon-cli" && (
                    <div className="tool-field">
                        <label>Module Option</label>
                        <input
                            placeholder="SOURCE=example.com"
                            value={moduleOption}
                            onChange={(e) => setModuleOption(e.target.value)}
                        />
                    </div>
                )}

                {toolType === "recon-cli" && (
                    <div className="tool-field">
                        <label>Global Option</label>
                        <input
                            placeholder="THREADS=10"
                            value={globalOption}
                            onChange={(e) => setGlobalOption(e.target.value)}
                        />
                    </div>
                )}

                {toolType === "recon-cli" && (
                    <div className="tool-field">
                        <label>Global Command</label>
                        <input
                            placeholder="marketplace search"
                            value={globalCommand}
                            onChange={(e) => setGlobalCommand(e.target.value)}
                        />
                    </div>
                )}

                {toolType === "recon-cli" && (
                    <div className="tool-field">
                        <label>Module Command</label>
                        <input
                            placeholder="options list"
                            value={moduleCommand}
                            onChange={(e) => setModuleCommand(e.target.value)}
                        />
                    </div>
                )}

                {toolType === "recon-ng" && (
                    <div className="tool-field">
                        <label>Resource File</label>
                        <input
                            placeholder="commands.rc"
                            value={resourceFile}
                            onChange={(e) => setResourceFile(e.target.value)}
                        />
                    </div>
                )}

                {toolType === "recon-web" && (
                    <div className="tool-field">
                        <label>Host</label>
                        <input
                            value={host}
                            onChange={(e) => setHost(e.target.value)}
                        />
                    </div>
                )}

                {toolType === "recon-web" && (
                    <div className="tool-field">
                        <label>Port</label>
                        <input
                            value={port}
                            onChange={(e) => setPort(e.target.value)}
                        />
                    </div>
                )}
            </div>

            <div className="tool-options">
                {toolType === "recon-cli" && (
                    <>
                        <label>
                            <input
                                type="checkbox"
                                checked={showModules}
                                onChange={(e) => setShowModules(e.target.checked)}
                            />
                            Show Modules (-M)
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                checked={showModuleOptions}
                                onChange={(e) => setShowModuleOptions(e.target.checked)}
                            />
                            Show Module Options (-O)
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                checked={showGlobalOptions}
                                onChange={(e) => setShowGlobalOptions(e.target.checked)}
                            />
                            Show Global Options (-G)
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                checked={runModule}
                                onChange={(e) => setRunModule(e.target.checked)}
                            />
                            Run Module (-x)
                        </label>
                    </>
                )}

                <label>
                    <input
                        type="checkbox"
                        checked={stealth}
                        onChange={(e) => setStealth(e.target.checked)}
                    />
                    Stealth
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={disableVersion}
                        onChange={(e) => setDisableVersion(e.target.checked)}
                    />
                    Disable Version Check
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={disableAnalytics}
                        onChange={(e) => setDisableAnalytics(e.target.checked)}
                    />
                    Disable Analytics
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={disableMarketplace}
                        onChange={(e) => setDisableMarketplace(e.target.checked)}
                    />
                    Disable Marketplace
                </label>

                {toolType === "recon-ng" && (
                    <label>
                        <input
                            type="checkbox"
                            checked={accessible}
                            onChange={(e) => setAccessible(e.target.checked)}
                        />
                        Accessible Output
                    </label>
                )}

                {toolType === "recon-cli" && (
                    <label>
                        <input
                            type="checkbox"
                            checked={analytics}
                            onChange={(e) => setAnalytics(e.target.checked)}
                        />
                        Enable Analytics
                    </label>
                )}

                <label>
                    <input
                        type="checkbox"
                        checked={version}
                        onChange={(e) => setVersion(e.target.checked)}
                    />
                    Show Version
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
                    disabled={isRunning}
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
                            toolName={tool?.tool_name || "Recon-ng"}
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

export default ReconParameters;