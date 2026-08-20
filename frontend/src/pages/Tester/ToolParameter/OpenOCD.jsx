import { useState, useRef, useEffect } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";
import "./ToolCommon.css";

function OpenOCDParameters({ tool, parameters, setParameters, stageCode, onAdvanceStage }) 
{
    const [commandType, setCommandType] = useState( parameters?.commandType || "normal" );
    const [configFile, setConfigFile] = useState( parameters?.configFile || "" );
    const [searchPath, setSearchPath] = useState( parameters?.searchPath || "" );
    const [debugLevel, setDebugLevel] = useState( parameters?.debugLevel || "" );

    const [logOutput, setLogOutput] = useState( parameters?.logOutput || "" );
    const [openocdCommand, setOpenocdCommand] = useState( parameters?.openocdCommand || "" );

    const [showHelp, setShowHelp] = useState( parameters?.showHelp || false );
    const [showVersion, setShowVersion] = useState( parameters?.showVersion || false );

    const [command, setCommand] = useState( parameters?.command || "" );
    const [output, setOutput] = useState( parameters?.output || "" );

    const [isRunning, setIsRunning] = useState(false);
    const [executionStatus, setExecutionStatus] = useState( parameters?.executionStatus || "waiting" );

    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("");
    const [outputFile, setOutputFile] = useState( parameters?.outputFile || "openocd_results.txt" );

    const terminalRef = useRef(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop =
                terminalRef.current.scrollHeight;
        }
    }, [output]);
 
    useEffect(() => {
        updateCommandPreview();
    }, [
        commandType,
        configFile,
        searchPath,
        debugLevel,
        logOutput,
        openocdCommand,
        showHelp,
        showVersion
    ]);

    const generateCommand = () => {
        let cmd = "openocd";
        if (showHelp) {
            cmd += " -h";
        }

        if (showVersion) {
            cmd += " -v";
        }

        if (configFile) {
            cmd += ` -f "${configFile}"`;
        }

        if (searchPath) {
            cmd += ` -s "${searchPath}"`;
        }

        if (debugLevel) {
            if (debugLevel === "3") {
                cmd += " -d";
            } else {
                cmd += ` -d${debugLevel}`;
            }
        }

        if (logOutput) {
            cmd += ` -l "${logOutput}"`;
        }

        if (openocdCommand) {
            cmd += ` -c "${openocdCommand}"`;
        }
        return cmd;
    };

    const updateCommandPreview = () => {
        setCommand(generateCommand());
    };

    const runCommand = async () => {
        const cmd = generateCommand();

        if (!cmd || cmd.trim() === "openocd") {
            setOutput(
                prev =>
                    prev +
                    "\nPlease configure an OpenOCD command first.\n"
            );
            setExecutionStatus("error");
            return;
        }

        setIsRunning(true);
        setExecutionStatus("running");

        setOutput(
            prev =>
                prev +
                `\n# ${cmd}\n`
        );

        try {
            const response = await fetch(
                "http://127.0.0.1:8000/tools/run/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization":
                            `Bearer ${sessionStorage.getItem("access")}`
                    },
                    body: JSON.stringify({
                        command: cmd,
                        tool_id: tool?.id || null,
                        parameters: {
                            commandType,
                            configFile,
                            searchPath,
                            debugLevel,
                            logOutput,
                            openocdCommand,
                            showHelp,
                            showVersion
                        }
                    })
                }
            );

            let data = {};
            try {
                data = await response.json();
            } catch {
                data = {};
            }

            if (response.ok) {
                setOutput(
                    prev =>
                        prev +
                        `${data.output || "Command executed successfully"}\n`
                );
                setExecutionStatus("success");
            } else {
                setOutput(
                    prev =>
                        prev +
                        `${data.message ||
                            data.detail ||
                            "Unknown error"}\n`
                );
                setExecutionStatus("error");
            }
        } catch (error) {
            setOutput(
                prev =>
                    prev +
                    `${error.message}\n`
            );
            setExecutionStatus("error");
        } finally {
            setIsRunning(false);
        }
    };

    const clearTerminal = () => {
        setOutput("");
        setExecutionStatus("waiting");
    };

    const downloadTxtFile = (
        content,
        filename
    ) => {
        let finalFilename =
            filename || "openocd_results.txt";
        if (
            !finalFilename
                .toLowerCase()
                .endsWith(".txt")
        ) {
            finalFilename += ".txt";
        }

        const blob = new Blob(
            [content],
            {
                type: "text/plain"
            }
        );

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = finalFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const handleDownload = () => {
        if (
            !output ||
            output === "Waiting for execution..."
        ) {
            alert(
                "No output available! Please run the command first."
            );
            return;
        }
        setPopupType("download");
        setShowPopup(true);
    };

    const handlePopupConfirm = () => {
        if (popupType === "download") {
            downloadTxtFile(
                output,
                outputFile ||
                    "openocd_results.txt"
            );
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
                commandType,
                configFile,
                searchPath,
                debugLevel,
                logOutput,
                openocdCommand,
                showHelp,
                showVersion,

                command,
                output,
                executionStatus
            });
        }
    };

    const handleCommandTypeChange = (value) => {
        setCommandType(value);
    };

    return (
        <div className="tool-box">
            <h3> OpenOCD Configuration
                {tool && (
                    <span className="tool-badge">
                        {tool.tool_name}
                    </span>
                )}
            </h3>

            <div className="tool-form">
                <div className="tool-field">
                    <label> Command Type </label>
                    <select
                        value={commandType}
                        onChange={(e) =>
                            handleCommandTypeChange(
                                e.target.value
                            )
                        }
                    >
                        <option value="normal"> Normal OpenOCD </option>
                        <option value="help"> Help (-h) </option>
                        <option value="version"> Version (-v) </option>
                        <option value="configuration"> Configuration File (-f) </option>
                        <option value="search"> Search Path (-s) </option>
                        <option value="debug"> Debug Mode (-d) </option>
                        <option value="log"> Log Output (-l) </option>
                        <option value="command"> Execute Command (-c) </option>
                    </select>
                </div>

                <div className="tool-field">
                    <label> Configuration File </label>
                    <input
                        type="text"
                        placeholder="interface/stlink.cfg"
                        value={configFile}
                        onChange={(e) =>
                            setConfigFile(
                                e.target.value
                            )
                        }
                    />
                </div>

                <div className="tool-field">
                    <label> Search Directory </label>
                    <input
                        type="text"
                        placeholder="/usr/share/openocd/scripts"
                        value={searchPath}
                        onChange={(e) =>
                            setSearchPath(
                                e.target.value
                            )
                        }
                    />
                </div>

                <div className="tool-field">
                    <label> Debug Level </label>
                    <select
                        value={debugLevel}
                        onChange={(e) =>
                            setDebugLevel(
                                e.target.value
                            )
                        }
                    >
                        <option value=""> None </option>
                        <option value="3"> Level 3 (-d) </option>
                        <option value="0"> Level 0 (-d0) </option>
                        <option value="1"> Level 1 (-d1) </option>
                        <option value="2"> Level 2 (-d2) </option>
                        <option value="4"> Level 4 (-d4) </option>
                        <option value="5"> Level 5 (-d5) </option>
                    </select>
                </div>

                <div className="tool-field">
                    <label> Log Output File </label>
                    <input
                        type="text"
                        placeholder="openocd.log"
                        value={logOutput}
                        onChange={(e) =>
                            setLogOutput(
                                e.target.value
                            )
                        }
                    />
                </div>

                <div className="tool-field">
                    <label> OpenOCD Command </label>
                    <input
                        type="text"
                        placeholder="init; reset halt"
                        value={openocdCommand}
                        onChange={(e) =>
                            setOpenocdCommand(
                                e.target.value
                            )
                        }
                    />
                </div>
            </div>

            <div className="tool-options">
                <label>
                    <input
                        type="checkbox"
                        checked={showHelp}
                        onChange={(e) =>
                            setShowHelp(
                                e.target.checked
                            )
                        }
                    />
                    Help (-h)
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={showVersion}
                        onChange={(e) =>
                            setShowVersion(
                                e.target.checked
                            )
                        }
                    />
                    Version (-v)
                </label>
            </div>

            <div className="command-area">
                <label> Generated Command </label>
                <div className="command-preview">
                    <span className="command-text">
                        {command || "Command..."}
                    </span>
                </div>
                <br />

                <button
                    className={
                        `run-btn ${
                            isRunning
                                ? "running"
                                : ""
                        }`
                    }
                    onClick={runCommand}
                    disabled={isRunning}
                >
                    {isRunning ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i>
                            {" "}
                            Running...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-play"></i>
                            {" "}
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
                        <i className="fas fa-eraser"></i>
                        {" "}
                        Clear
                    </button>
                )}
            </div>

            <div className="command-area">
                <label> Terminal Output </label>
                <div
                    className="terminal"
                    ref={terminalRef}
                >
                    <pre>
                        {output ||
                            "Waiting for execution..."}

                        {isRunning && (
                            <span className="cursor"></span>
                        )}
                    </pre>
                </div>

                {output &&
                    output !==
                        "Waiting for execution..." && (

                    <div className="action-buttons">
                        <AIAnalysisPanel
                            output={output}
                            toolName={
                                tool?.tool_name ||
                                "OpenOCD"
                            }
                            stageCode={stageCode}
                            onAdvanceStage={
                                onAdvanceStage
                            }
                        />

                        <button
                            className="download-btn"
                            onClick={
                                handleDownload
                            }
                        >

                            <i className="fas fa-download"></i>
                            {" "}
                            Download TXT
                        </button>
                    </div>
                )}
            </div>

            {showPopup && (
                <div
                    className="popup-overlay"
                    onClick={
                        handlePopupCancel
                    }
                >
                    <div
                        className="popup-box confirm-popup"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >
                        <h3>
                            <i className="fas fa-download"></i>
                            {" "}
                            Download File
                        </h3>

                        <div className="popup-message">
                            <p> Do you want to download this output as a .txt file? </p>
                        </div>

                        <div className="popup-file-info">
                            <label> File Name </label>
                            <input
                                type="text"
                                value={outputFile}
                                onChange={(e) =>
                                    setOutputFile(
                                        e.target.value
                                    )
                                }
                            />
                        </div>

                        <div className="popup-buttons">
                            <button
                                className="popup-cancel-btn"
                                onClick={
                                    handlePopupCancel
                                }
                            >
                                Cancel
                            </button>

                            <button
                                className="popup-confirm-btn"
                                onClick={
                                    handlePopupConfirm
                                }
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

export default OpenOCDParameters;