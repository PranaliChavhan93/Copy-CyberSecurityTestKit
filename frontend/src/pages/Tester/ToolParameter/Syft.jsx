import { useState, useRef, useEffect } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";
import "./ToolCommon.css";

function SyftParameters({
    tool,
    parameters,
    setParameters,
    stageCode,
    onAdvanceStage
}) {
    const [source, setSource] = useState("");
    const [sourceType, setSourceType] = useState("");
    const [outputFormat, setOutputFormat] = useState("");
    const [outputFile, setOutputFile] = useState("");
    const [scope, setScope] = useState("");
    const [platform, setPlatform] = useState("");
    const [exclude, setExclude] = useState("");

    const [verbose, setVerbose] = useState(false);
    const [quiet, setQuiet] = useState(false);

    const [command, setCommand] = useState("");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [executionStatus, setExecutionStatus] = useState("waiting");

    const [showPopup, setShowPopup] = useState(false);
    const [outputFileName, setOutputFileName] =
        useState("syft_results.txt");

    const terminalRef = useRef(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop =
                terminalRef.current.scrollHeight;
        }
    }, [output]);

    useEffect(() => {
        setCommand(generateCommand());
    }, [
        source,
        sourceType,
        outputFormat,
        outputFile,
        scope,
        platform,
        exclude,
        verbose,
        quiet
    ]);

    const generateCommand = () => {
        let cmd = "syft scan";

        if (source) {
            if (sourceType) {
                cmd += ` ${sourceType}:${source}`;
            } else {
                cmd += ` ${source}`;
            }
        }

        if (outputFormat) {
            if (outputFile) {
                cmd += ` -o ${outputFormat}=${outputFile}`;
            } else {
                cmd += ` -o ${outputFormat}`;
            }
        }

        if (scope) {
            cmd += ` --scope ${scope}`;
        }

        if (platform) {
            cmd += ` --platform ${platform}`;
        }

        if (exclude) {
            cmd += ` --exclude ${exclude}`;
        }

        if (verbose && !quiet) {
            cmd += " -v";
        }

        if (quiet && !verbose) {
            cmd += " -q";
        }

        return cmd;
    };

    const runCommand = async () => {
        const cmd = generateCommand();

        if (!source) {
            alert("Please enter a source to scan.");
            return;
        }

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
                        Authorization: `Bearer ${sessionStorage.getItem(
                            "access"
                        )}`
                    },
                    body: JSON.stringify({
                        command: cmd,
                        tool_id: tool?.id || null,
                        parameters: {
                            source,
                            sourceType,
                            outputFormat,
                            outputFile,
                            scope,
                            platform,
                            exclude,
                            verbose,
                            quiet
                        }
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                setOutput(
                    prev =>
                        prev +
                        `${data.output ||
                            "Command executed successfully"}\n`
                );

                setExecutionStatus("success");
            } else {
                setOutput(
                    prev =>
                        prev +
                        `${data.message ||
                            data.error ||
                            "Unknown error"}\n`
                );

                setExecutionStatus("error");
            }
        } catch (error) {
            setOutput(
                prev => prev + `${error.message}\n`
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

    const downloadTxtFile = (content, filename) => {
        if (!filename.toLowerCase().endsWith(".txt")) {
            filename += ".txt";
        }
        const blob = new Blob([content], {
            type: "text/plain"
        });
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
        if (!output) {
            alert(
                "No output available! Please run the command first."
            );
            return;
        }
        setShowPopup(true);
    };

    const handlePopupConfirm = () => {
        downloadTxtFile(
            output,
            outputFileName || "syft_results.txt"
        );
        setShowPopup(false);
    };

    const handlePopupCancel = () => {
        setShowPopup(false);
    };

    const saveParameters = () => {
        if (setParameters) {
            setParameters({
                source,
                sourceType,
                outputFormat,
                outputFile,
                scope,
                platform,
                exclude,
                verbose,
                quiet,
                command,
                output,
                executionStatus
            });
        }
    };

    return (
        <div className="tool-box">
            <h3> Syft Configuration
                {tool && (
                    <span className="tool-badge">
                        {tool.tool_name}
                    </span>
                )}
            </h3>

            <div className="tool-form">

                <div className="tool-field">
                    <label>Source</label>

                    <input
                        type="text"
                        placeholder="alpine:latest"
                        value={source}
                        onChange={e =>
                            setSource(e.target.value)
                        }
                    />
                </div>

                <div className="tool-field">
                    <label>Source Type</label>
                    <select
                        value={sourceType}
                        onChange={e =>
                            setSourceType(e.target.value)
                        }
                    >
                        <option value=""> Automatic </option>
                        <option value="docker"> Dockerv</option>
                        <option value="podman"> Podman </option>
                        <option value="registry"> Registry </option>
                        <option value="dir"> Directory </option>
                        <option value="file"> File </option>
                        <option value="docker-archive"> Docker Archive </option>
                        <option value="oci-archive"> OCI Archive </option>
                        <option value="oci-dir"> OCI Directory </option>
                        <option value="singularity"> Singularity </option>
                    </select>
                </div>

                <div className="tool-field">
                    <label>Output Format</label>
                    <select
                        value={outputFormat}
                        onChange={e =>
                            setOutputFormat(e.target.value)
                        }
                    >
                        <option value=""> None </option>
                        <option value="syft-table"> Syft Table </option>
                        <option value="syft-text"> Syft Text </option>
                        <option value="syft-json"> Syft JSON </option>
                        <option value="cyclonedx-json"> CycloneDX JSON </option>
                        <option value="cyclonedx-xml"> CycloneDX XML </option>
                        <option value="spdx-json"> SPDX JSON </option>
                        <option value="spdx-tag-value"> SPDX Tag Value </option>
                        <option value="github-json"> GitHub JSON </option>
                    </select>
                </div>

                <div className="tool-field">
                    <label>Output File</label>

                    <input
                        type="text"
                        placeholder="Optional"
                        value={outputFile}
                        onChange={e =>
                            setOutputFile(e.target.value)
                        }
                    />
                </div>

                {/* Scope */}
                <div className="tool-field">
                    <label>Scope</label>

                    <select
                        value={scope}
                        onChange={e =>
                            setScope(e.target.value)
                        }
                    >
                        <option value="squashed">
                            Squashed
                        </option>

                        <option value="all-layers">
                            All Layers
                        </option>

                        <option value="deep-squashed">
                            Deep Squashed
                        </option>
                    </select>
                </div>

                {/* Platform */}
                <div className="tool-field">
                    <label>Platform</label>

                    <input
                        type="text"
                        placeholder="linux/amd64"
                        value={platform}
                        onChange={e =>
                            setPlatform(e.target.value)
                        }
                    />
                </div>

                {/* Exclude */}
                <div className="tool-field">
                    <label>Exclude</label>

                    <input
                        type="text"
                        placeholder="*.log"
                        value={exclude}
                        onChange={e =>
                            setExclude(e.target.value)
                        }
                    />
                </div>

            </div>

            {/* OPTIONS */}

            <div className="tool-options">

                <label>
                    <input
                        type="checkbox"
                        checked={verbose}
                        disabled={quiet}
                        onChange={e =>
                            setVerbose(e.target.checked)
                        }
                    />
                    Verbose (-v)
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={quiet}
                        disabled={verbose}
                        onChange={e =>
                            setQuiet(e.target.checked)
                        }
                    />
                    Quiet (-q)
                </label>

            </div>

            {/* COMMAND */}

            <div className="command-area">

                <label>Generated Command</label>

                <div className="command-preview">
                    <span className="command-text">
                        {command || "Command..."}
                    </span>
                </div>

                <br />

                <button
                    className={`run-btn ${
                        isRunning ? "running" : ""
                    }`}
                    onClick={runCommand}
                    disabled={isRunning || !source}
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

            {/* TERMINAL */}

            <div className="command-area">

                <label>Terminal Output</label>

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

                {output && (
                    <div className="action-buttons">

                        <AIAnalysisPanel
                            output={output}
                            toolName={
                                tool?.tool_name || "Syft"
                            }
                            stageCode={stageCode}
                            onAdvanceStage={
                                onAdvanceStage
                            }
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

            {/* DOWNLOAD POPUP */}

            {showPopup && (
                <div
                    className="popup-overlay"
                    onClick={handlePopupCancel}
                >
                    <div
                        className="popup-box confirm-popup"
                        onClick={e =>
                            e.stopPropagation()
                        }
                    >
                        <h3>
                            <i className="fas fa-download"></i>
                            {" "}Download File
                        </h3>

                        <div className="popup-message">
                            <p>
                                Do you want to download this
                                output as a .txt file?
                            </p>
                        </div>

                        <div className="popup-file-info">

                            <label>File Name</label>

                            <input
                                type="text"
                                value={outputFileName}
                                onChange={e =>
                                    setOutputFileName(
                                        e.target.value
                                    )
                                }
                            />

                            <small>
                                The output will be saved as a
                                text file.
                            </small>

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

export default SyftParameters;