import { useState, useRef, useEffect } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";
import "./ToolCommon.css";

function GNURadioParameters({
    tool,
    parameters,
    setParameters,
    stageCode,
    onAdvanceStage
}) {
    // ----- Mode selection -----
    const [mode, setMode] = useState("companion"); // "companion" or "config"

    // ----- gnuradio-companion options -----
    const [flowGraph, setFlowGraph] = useState("");
    const [logLevel, setLogLevel] = useState("");
    const [framework, setFramework] = useState("qt"); // "qt" or "gtk"

    // ----- gnuradio-config-info options -----
    const [printAll, setPrintAll] = useState(false);
    const [prefix, setPrefix] = useState(false);
    const [sysconfdir, setSysconfdir] = useState(false);
    const [prefsdir, setPrefsdir] = useState(false);
    const [userprefsdir, setUserprefsdir] = useState(false);
    const [persistentdir, setPersistentdir] = useState(false);
    const [prefs, setPrefs] = useState(false);
    const [builddate, setBuilddate] = useState(false);
    const [enabledComponents, setEnabledComponents] = useState(false);
    const [cc, setCc] = useState(false);
    const [cxx, setCxx] = useState(false);
    const [cflags, setCflags] = useState(false);
    const [version, setVersion] = useState(false);
    const [pybind, setPybind] = useState(false);

    // ----- Command & output state -----
    const [command, setCommand] = useState("");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [executionStatus, setExecutionStatus] = useState("waiting");

    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("");
    const [outputFile, setOutputFile] = useState("gnuradio_results.txt");

    const terminalRef = useRef(null);

    // Effects
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [output]);

    useEffect(() => {
        updateCommandPreview();
    }, [
        mode,
        flowGraph, logLevel, framework,
        printAll, prefix, sysconfdir, prefsdir, userprefsdir,
        persistentdir, prefs, builddate, enabledComponents,
        cc, cxx, cflags, version, pybind
    ]);

    // When printAll is toggled, set all checkboxes accordingly
    useEffect(() => {
        if (printAll) {
            setPrefix(true);
            setSysconfdir(true);
            setPrefsdir(true);
            setUserprefsdir(true);
            setPersistentdir(true);
            setPrefs(true);
            setBuilddate(true);
            setEnabledComponents(true);
            setCc(true);
            setCxx(true);
            setCflags(true);
            setVersion(true);
            setPybind(true);
        } else {
            setPrefix(false);
            setSysconfdir(false);
            setPrefsdir(false);
            setUserprefsdir(false);
            setPersistentdir(false);
            setPrefs(false);
            setBuilddate(false);
            setEnabledComponents(false);
            setCc(false);
            setCxx(false);
            setCflags(false);
            setVersion(false);
            setPybind(false);
        }
    }, [printAll]);

    // Command generation
    const generateCommand = () => {
        let cmd = "";

        if (mode === "companion") {
            cmd = "gnuradio-companion";
            if (logLevel) {
                cmd += ` --log ${logLevel}`;
            }
            if (framework === "qt") {
                cmd += " --qt";
            } else if (framework === "gtk") {
                cmd += " --gtk";
            }
            if (flowGraph) {
                cmd += ` ${flowGraph}`;
            }
        } else {
            cmd = "gnuradio-config-info";
            const options = [];
            if (printAll) options.push("--print-all");
            if (prefix) options.push("--prefix");
            if (sysconfdir) options.push("--sysconfdir");
            if (prefsdir) options.push("--prefsdir");
            if (userprefsdir) options.push("--userprefsdir");
            if (persistentdir) options.push("--persistentdir");
            if (prefs) options.push("--prefs");
            if (builddate) options.push("--builddate");
            if (enabledComponents) options.push("--enabled-components");
            if (cc) options.push("--cc");
            if (cxx) options.push("--cxx");
            if (cflags) options.push("--cflags");
            if (version) options.push("-v");
            if (pybind) options.push("--pybind");
            if (options.length > 0) {
                cmd += " " + options.join(" ");
            } else {
                cmd += " -v";
            }
        }

        return cmd;
    };

    const updateCommandPreview = () => {
        setCommand(generateCommand());
    };

    // API execution
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
                            mode,
                            flowGraph,
                            logLevel,
                            framework,
                            printAll,
                            prefix,
                            sysconfdir,
                            prefsdir,
                            userprefsdir,
                            persistentdir,
                            prefs,
                            builddate,
                            enabledComponents,
                            cc,
                            cxx,
                            cflags,
                            version,
                            pybind
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
            downloadTxtFile(output, outputFile || "gnuradio_results.txt");
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
                mode,
                flowGraph,
                logLevel,
                framework,
                printAll,
                prefix,
                sysconfdir,
                prefsdir,
                userprefsdir,
                persistentdir,
                prefs,
                builddate,
                enabledComponents,
                cc,
                cxx,
                cflags,
                version,
                pybind,
                command,
                output,
                executionStatus
            });
        }
    };

    return (
        <div className="tool-box">
            <h3>
                GNU Radio Configuration
                {tool && <span className="tool-badge">{tool.tool_name}</span>}
            </h3>

            <div className="tool-form">
                <div className="tool-field">
                    <label>Mode</label>
                    <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                    >
                        <option value="companion">Launch GRC (gnuradio-companion)</option>
                        <option value="config">Show Config Info (gnuradio-config-info)</option>
                    </select>
                </div>
            </div>

            {mode === "companion" && (
                <>
                    <div className="tool-form">
                        <div className="tool-field">
                            <label>Flow Graph File</label>
                            <input
                                type="text"
                                placeholder="/path/to/flowgraph.grc"
                                value={flowGraph}
                                onChange={(e) => setFlowGraph(e.target.value)}
                            />
                        </div>

                        <div className="tool-field">
                            <label>Log Level</label>
                            <select
                                value={logLevel}
                                onChange={(e) => setLogLevel(e.target.value)}
                            >
                                <option value="">Default (info)</option>
                                <option value="debug">debug</option>
                                <option value="info">info</option>
                                <option value="warning">warning</option>
                                <option value="error">error</option>
                                <option value="critical">critical</option>
                            </select>
                        </div>

                        <div className="tool-field">
                            <label>GUI Framework</label>
                            <select
                                value={framework}
                                onChange={(e) => setFramework(e.target.value)}
                            >
                                <option value="qt">QT (--qt)</option>
                                <option value="gtk">GTK (--gtk)</option>
                            </select>
                        </div>
                    </div>
                </>
            )}

            {mode === "config" && (
                <>
                    <h4 style={{ marginTop: "20px", marginBottom: "10px" }}>Config Info Options</h4>
                    <div className="tool-options">
                        <label>
                            <input
                                type="checkbox"
                                checked={printAll}
                                onChange={(e) => setPrintAll(e.target.checked)}
                            />
                            Print All (--print-all)
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                checked={prefix}
                                onChange={(e) => setPrefix(e.target.checked)}
                                disabled={printAll}
                            />
                            --prefix
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                checked={sysconfdir}
                                onChange={(e) => setSysconfdir(e.target.checked)}
                                disabled={printAll}
                            />
                            --sysconfdir
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                checked={prefsdir}
                                onChange={(e) => setPrefsdir(e.target.checked)}
                                disabled={printAll}
                            />
                            --prefsdir
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                checked={userprefsdir}
                                onChange={(e) => setUserprefsdir(e.target.checked)}
                                disabled={printAll}
                            />
                            --userprefsdir
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                checked={persistentdir}
                                onChange={(e) => setPersistentdir(e.target.checked)}
                                disabled={printAll}
                            />
                            --persistentdir
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                checked={prefs}
                                onChange={(e) => setPrefs(e.target.checked)}
                                disabled={printAll}
                            />
                            --prefs
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                checked={builddate}
                                onChange={(e) => setBuilddate(e.target.checked)}
                                disabled={printAll}
                            />
                            --builddate
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                checked={enabledComponents}
                                onChange={(e) => setEnabledComponents(e.target.checked)}
                                disabled={printAll}
                            />
                            --enabled-components
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                checked={cc}
                                onChange={(e) => setCc(e.target.checked)}
                                disabled={printAll}
                            />
                            --cc
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                checked={cxx}
                                onChange={(e) => setCxx(e.target.checked)}
                                disabled={printAll}
                            />
                            --cxx
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                checked={cflags}
                                onChange={(e) => setCflags(e.target.checked)}
                                disabled={printAll}
                            />
                            --cflags
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                checked={version}
                                onChange={(e) => setVersion(e.target.checked)}
                                disabled={printAll}
                            />
                            -v (--version) (Default)
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                checked={pybind}
                                onChange={(e) => setPybind(e.target.checked)}
                                disabled={printAll}
                            />
                            --pybind
                        </label>
                    </div>
                </>
            )}

            {/* Command area */}
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
                            <i className="fas fa-play"></i> Run Command
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

            {/* Terminal output */}
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
                            toolName={tool?.tool_name || "GNU Radio"}
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

export default GNURadioParameters;