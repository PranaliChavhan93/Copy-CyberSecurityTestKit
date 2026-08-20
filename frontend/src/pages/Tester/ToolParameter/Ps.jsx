import { useState, useRef, useEffect } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";
import "./ToolCommon.css";

function PsParameters({
    tool,
    parameters,
    setParameters,
    stageCode,
    onAdvanceStage
}) {
    const [hideHeader, setHideHeader] = useState(true);
    const [command, setCommand] = useState("ps -h");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [executionStatus, setExecutionStatus] = useState("waiting");
    const [showPopup, setShowPopup] = useState(false);
    const [outputFile, setOutputFile] = useState("ps_results.txt");

    const terminalRef = useRef(null);

    useEffect(() => {
        setCommand(hideHeader ? "ps -h" : "ps");
    }, [hideHeader]);

    useEffect(() => {
        if (terminalRef.current)
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }, [output]);

    const runCommand = async () => {
        const cmd = hideHeader ? "ps -h" : "ps";

        setIsRunning(true);
        setExecutionStatus("running");
        setOutput(prev => `${prev}\n# ${cmd}\n`);

        try {
            const response = await fetch(
                "http://127.0.0.1:8000/tools/run/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization:
                            `Bearer ${sessionStorage.getItem("access")}`
                    },
                    body: JSON.stringify({
                        command: cmd,
                        tool_id: tool?.id || null,
                        parameters: { hideHeader }
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                setOutput(
                    prev =>
                        `${prev}${data.output || "Command executed successfully"}\n`
                );
                setExecutionStatus("success");
            } else {
                setOutput(
                    prev => `${prev}${data.message || "Unknown error"}\n`
                );
                setExecutionStatus("error");
            }
        } catch (error) {
            setOutput(prev => `${prev}${error.message}\n`);
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

        setShowPopup(true);
    };

    const handlePopupConfirm = () => {
        downloadTxtFile(
            output,
            outputFile || "ps_results.txt"
        );
        setShowPopup(false);
    };

    const handlePopupCancel = () => setShowPopup(false);

    const saveParameters = () => {
        setParameters?.({
            hideHeader,
            command,
            output,
            executionStatus
        });
    };

    return (
        <div className="tool-box">
            <h3>
                PS Process Configuration
                {tool && (
                    <span className="tool-badge">
                        {tool.tool_name}
                    </span>
                )}
            </h3>

            <div className="tool-form">
                <div className="tool-field">
                    <label>Process Display</label>
                    <select
                        value={hideHeader ? "hide" : "show"}
                        onChange={e =>
                            setHideHeader(e.target.value === "hide")
                        }
                    >
                        <option value="hide">
                            Hide Header (-h)
                        </option>
                        <option value="show">
                            Show Header
                        </option>
                    </select>
                </div>
            </div>

            <div className="tool-options">
                <label>
                    <input
                        type="checkbox"
                        checked={hideHeader}
                        onChange={e =>
                            setHideHeader(e.target.checked)
                        }
                    />
                    Hide Header (-h)
                </label>
            </div>

            <div className="command-area">
                <label>Generated Command</label>

                <div className="command-preview">
                    <span className="command-text">
                        {command}
                    </span>
                </div>

                <br />

                <button
                    className={`run-btn ${isRunning ? "running" : ""}`}
                    onClick={runCommand}
                    disabled={isRunning}
                >
                    {isRunning ? (
                        <>
                            <i className="fas fa-spinner fa-spin" />
                            {" "}Running...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-play" />
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
                        <i className="fas fa-eraser" />
                        {" "}Clear
                    </button>
                )}
            </div>

            <div className="command-area">
                <label>Terminal Output</label>

                <div className="terminal" ref={terminalRef}>
                    <pre>
                        {output || "Waiting for execution..."}
                        {isRunning && <span className="cursor" />}
                    </pre>
                </div>

                {output && output !== "Waiting for execution..." && (
                    <div className="action-buttons">
                        <AIAnalysisPanel
                            output={output}
                            toolName={tool?.tool_name || "PS"}
                            stageCode={stageCode}
                            onAdvanceStage={onAdvanceStage}
                        />

                        <button
                            className="download-btn"
                            onClick={handleDownload}
                        >
                            <i className="fas fa-download" />
                            {" "}Download TXT
                        </button>
                    </div>
                )}
            </div>

            {showPopup && (
                <div
                    className="popup-overlay"
                    onClick={handlePopupCancel}
                >
                    <div
                        className="popup-box confirm-popup"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3>
                            <i className="fas fa-download" />
                            {" "}Download File
                        </h3>

                        <div className="popup-message">
                            <p>
                                Do you want to download this output as
                                a .txt file?
                            </p>
                        </div>

                        <div className="popup-file-info">
                            <label>File Name</label>

                            <input
                                type="text"
                                value={outputFile}
                                onChange={e =>
                                    setOutputFile(e.target.value)
                                }
                            />

                            <small>
                                The output will be saved as a text file.
                            </small>
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

export default PsParameters;