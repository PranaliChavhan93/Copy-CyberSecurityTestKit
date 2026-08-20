import { useState, useRef, useEffect } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";
import "./ToolCommon.css";

function KismetParameters({
    tool,
    parameters,
    setParameters,
    stageCode,
    onAdvanceStage
}) {
    const [captureSources, setCaptureSources] = useState("");
    const [configFile, setConfigFile] = useState("");
    const [daemonize, setDaemonize] = useState(false);
    const [silent, setSilent] = useState(false);
    const [noPlugins, setNoPlugins] = useState(false);
    const [noLineWrap, setNoLineWrap] = useState(false);
    const [debug, setDebug] = useState(false);

    const [logTypes, setLogTypes] = useState("");
    const [logTitle, setLogTitle] = useState("");
    const [logPrefix, setLogPrefix] = useState("");
    const [noLogging, setNoLogging] = useState(false);

    const [deviceTimeout, setDeviceTimeout] = useState("");

    const [homedir, setHomedir] = useState("");
    const [confdir, setConfdir] = useState("");
    const [datadir, setDatadir] = useState("");
    const [override, setOverride] = useState("");

    const [command, setCommand] = useState("");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [executionStatus, setExecutionStatus] = useState("waiting");

    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("");
    const [outputFile, setOutputFile] = useState("kismet_results.txt");

    const terminalRef = useRef(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [output]);

    useEffect(() => {
        updateCommandPreview();
    }, [
        captureSources, configFile, daemonize, silent, noPlugins,
        noLineWrap, debug, logTypes, logTitle, logPrefix, noLogging,
        deviceTimeout, homedir, confdir, datadir, override
    ]);

    const generateCommand = () => {
        let cmd = "kismet";

        if (captureSources) {
            const sources = captureSources.split(",").map(s => s.trim()).filter(s => s);
            sources.forEach(src => {
                cmd += ` -c ${src}`;
            });
        }

        if (configFile) cmd += ` -f ${configFile}`;
        if (daemonize) cmd += " --daemonize";
        if (silent) cmd += " -s";
        if (noPlugins) cmd += " --no-plugins";
        if (noLineWrap) cmd += " --no-line-wrap";
        if (debug) cmd += " --debug";

        if (logTypes) cmd += ` -T ${logTypes}`;
        if (logTitle) cmd += ` -t ${logTitle}`;
        if (logPrefix) cmd += ` -p ${logPrefix}`;
        if (noLogging) cmd += " -n";

        if (deviceTimeout) cmd += ` --device-timeout=${deviceTimeout}`;

        if (homedir) cmd += ` --homedir ${homedir}`;
        if (confdir) cmd += ` --confdir ${confdir}`;
        if (datadir) cmd += ` --datadir ${datadir}`;
        if (override) cmd += ` --override ${override}`;

        return cmd || "kismet";
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
                            captureSources,
                            configFile,
                            daemonize,
                            silent,
                            noPlugins,
                            noLineWrap,
                            debug,
                            logTypes,
                            logTitle,
                            logPrefix,
                            noLogging,
                            deviceTimeout,
                            homedir,
                            confdir,
                            datadir,
                            override
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
            downloadTxtFile(output, outputFile || "kismet_results.txt");
            setShowPopup(false);
            setPopupType("");
        }
    };

    const handlePopupCancel = () => {
        setShowPopup(false);
        setPopupType("");
    };

    const saveParameters = () => {
        if (setParameters) {
            setParameters({
                captureSources,
                configFile,
                daemonize,
                silent,
                noPlugins,
                noLineWrap,
                debug,
                logTypes,
                logTitle,
                logPrefix,
                noLogging,
                deviceTimeout,
                homedir,
                confdir,
                datadir,
                override,
                command,
                output,
                executionStatus
            });
        }
    };

    return (
        <div className="tool-box">
            <h3>
                Kismet Configuration
                {tool && <span className="tool-badge">{tool.tool_name}</span>}
            </h3>

            <div className="tool-form">
                <div className="tool-field">
                    <label>Capture Sources (-c)</label>
                    <input
                        type="text"
                        placeholder="wlan0, wlan1, wlan0mon"
                        value={captureSources}
                        onChange={(e) => setCaptureSources(e.target.value)}
                    />
                    <small>Comma‑separated list of interfaces or sources</small>
                </div>

                <div className="tool-field">
                    <label>Config File (-f)</label>
                    <input
                        type="text"
                        placeholder="/etc/kismet/kismet.conf"
                        value={configFile}
                        onChange={(e) => setConfigFile(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Device Timeout (seconds)</label>
                    <input
                        type="number"
                        placeholder="300"
                        value={deviceTimeout}
                        onChange={(e) => setDeviceTimeout(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Log Types (-T)</label>
                    <input
                        type="text"
                        placeholder="kismet,netxml,etc"
                        value={logTypes}
                        onChange={(e) => setLogTypes(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Log Title (-t)</label>
                    <input
                        type="text"
                        placeholder="capture_2025"
                        value={logTitle}
                        onChange={(e) => setLogTitle(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Log Prefix (-p)</label>
                    <input
                        type="text"
                        placeholder="/var/log/kismet"
                        value={logPrefix}
                        onChange={(e) => setLogPrefix(e.target.value)}
                    />
                </div>
            </div>

            <div className="tool-options">
                <label>
                    <input
                        type="checkbox"
                        checked={daemonize}
                        onChange={(e) => setDaemonize(e.target.checked)}
                    />
                    Daemonize (--daemonize)
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={silent}
                        onChange={(e) => setSilent(e.target.checked)}
                    />
                    Silent (-s)
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={noLogging}
                        onChange={(e) => setNoLogging(e.target.checked)}
                    />
                    No Logging (-n)
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={noPlugins}
                        onChange={(e) => setNoPlugins(e.target.checked)}
                    />
                    No Plugins (--no-plugins)
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={noLineWrap}
                        onChange={(e) => setNoLineWrap(e.target.checked)}
                    />
                    No Line Wrap (--no-line-wrap)
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={debug}
                        onChange={(e) => setDebug(e.target.checked)}
                    />
                    Debug Mode (--debug)
                </label>
            </div>

            <h4 style={{ marginTop: "20px", marginBottom: "10px" }}>Path Overrides</h4>
            <div className="tool-form">
                <div className="tool-field">
                    <label>Home Directory (--homedir)</label>
                    <input
                        type="text"
                        placeholder="/path/to/home"
                        value={homedir}
                        onChange={(e) => setHomedir(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Config Directory (--confdir)</label>
                    <input
                        type="text"
                        placeholder="/etc/kismet"
                        value={confdir}
                        onChange={(e) => setConfdir(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Data Directory (--datadir)</label>
                    <input
                        type="text"
                        placeholder="/usr/share/kismet"
                        value={datadir}
                        onChange={(e) => setDatadir(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Override (--override)</label>
                    <input
                        type="text"
                        placeholder="flavor"
                        value={override}
                        onChange={(e) => setOverride(e.target.value)}
                    />
                </div>
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
                    disabled={isRunning || !command}
                >
                    {isRunning ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i> Running...
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
                        style={{ background: "#6b7a9a", marginLeft: "10px", padding: "12px 20px" }}
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
                            toolName={tool?.tool_name || "Kismet"}
                            stageCode={stageCode}
                            onAdvanceStage={onAdvanceStage}
                        />
                        <button className="download-btn" onClick={handleDownload}>
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
                            <button className="popup-cancel-btn" onClick={handlePopupCancel}>Cancel</button>
                            <button className="popup-confirm-btn" onClick={handlePopupConfirm}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default KismetParameters;