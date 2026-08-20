import { useState, useRef, useEffect } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";
import "./ToolCommon.css";

function DieParameters({
    tool,
    parameters,
    setParameters,
    stageCode,
    onAdvanceStage
}) {
    const [target, setTarget] = useState("");
    const [options, setOptions] = useState({
        recursivescan: false,
        deepscan: false,
        heuristicscan: false,
        verbose: false,
        aggressivecscan: false,
        alltypes: false,
        format: false,
        profiling: false,
        messages: false,
        hideunknown: false,
        entropy: false,
        info: false,
        xml: false,
        json: false,
        csv: false,
        tsv: false,
        plaintext: false,
        showdatabase: false,
        showstructs: false
    });

    const [struct, setStruct] = useState("");
    const [database, setDatabase] = useState("");
    const [extraDatabase, setExtraDatabase] = useState("");
    const [customDatabase, setCustomDatabase] = useState("");

    const [command, setCommand] = useState("");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [executionStatus, setExecutionStatus] = useState("waiting");

    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("");
    const [outputFile, setOutputFile] = useState("die_results.txt");

    const terminalRef = useRef(null);

    useEffect(() => {
        terminalRef.current?.scrollTo(
            0,
            terminalRef.current.scrollHeight
        );
    }, [output]);

    useEffect(() => {
        setCommand(generateCommand());
    }, [
        target,
        options,
        struct,
        database,
        extraDatabase,
        customDatabase
    ]);

    const generateCommand = () => {
        let cmd = "diec";

        const flags = {
            recursivescan: "-r",
            deepscan: "-d",
            heuristicscan: "-u",
            verbose: "-b",
            aggressivecscan: "-g",
            alltypes: "-a",
            profiling: "-l",
            messages: "-M",
            hideunknown: "-U",
            entropy: "-e",
            info: "-i",
            showdatabase: "-s",
            showstructs: "-w"
        };

        Object.entries(flags).forEach(([key, flag]) => {
            if (options[key]) cmd += ` ${flag}`;
        });

        if (options.format) cmd += " -f";
        if (struct) cmd += ` -S ${struct}`;
        if (database) cmd += ` -D ${database}`;
        if (extraDatabase) cmd += ` -E ${extraDatabase}`;
        if (customDatabase) cmd += ` -C ${customDatabase}`;

        if (options.xml) cmd += " -x";
        if (options.json) cmd += " -j";
        if (options.csv) cmd += " -c";
        if (options.tsv) cmd += " -t";
        if (options.plaintext) cmd += " -p";

        if (target) cmd += ` ${target}`;

        return cmd;
    };

    const runCommand = async () => {
        const cmd = generateCommand();

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
                        Authorization: `Bearer ${sessionStorage.getItem("access")}`
                    },
                    body: JSON.stringify({
                        command: cmd,
                        tool_id: tool?.id || null,
                        parameters: {
                            target,
                            ...options,
                            struct,
                            database,
                            extraDatabase,
                            customDatabase
                        }
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

        setPopupType("download");
        setShowPopup(true);
    };

    const handlePopupConfirm = () => {
        if (popupType === "download") {
            downloadTxtFile(
                output,
                outputFile || "die_results.txt"
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
        setParameters?.({
            target,
            ...options,
            struct,
            database,
            extraDatabase,
            customDatabase,
            command,
            output,
            executionStatus
        });
    };

    const toggleOption = key => {
        setOptions(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <div className="tool-box">
            <h3>
                Detect It Easy Configuration
                {tool && (
                    <span className="tool-badge">
                        {tool.tool_name}
                    </span>
                )}
            </h3>

            <div className="tool-form">
                <div className="tool-field">
                    <label>Target File / Directory</label>
                    <input
                        type="text"
                        placeholder="/home/user/sample.exe"
                        value={target}
                        onChange={e => setTarget(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Structure</label>
                    <input
                        type="text"
                        placeholder="Hash or Hash#MD5"
                        value={struct}
                        onChange={e => setStruct(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Database Path</label>
                    <input
                        type="text"
                        placeholder="/path/to/database"
                        value={database}
                        onChange={e => setDatabase(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Extra Database</label>
                    <input
                        type="text"
                        placeholder="/path/to/extra/database"
                        value={extraDatabase}
                        onChange={e => setExtraDatabase(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Custom Database</label>
                    <input
                        type="text"
                        placeholder="/path/to/custom/database"
                        value={customDatabase}
                        onChange={e => setCustomDatabase(e.target.value)}
                    />
                </div>
            </div>

            <div className="tool-options">
                {[
                    ["recursivescan", "Recursive Scan (-r)"],
                    ["deepscan", "Deep Scan (-d)"],
                    ["heuristicscan", "Heuristic Scan (-u)"],
                    ["verbose", "Verbose (-b)"],
                    ["aggressivecscan", "Aggressive Scan (-g)"],
                    ["alltypes", "All File Types (-a)"],
                    ["format", "Format Output (-f)"],
                    ["profiling", "Profiling (-l)"],
                    ["messages", "Messages / Warnings (-M)"],
                    ["hideunknown", "Hide Unknown (-U)"],
                    ["entropy", "Entropy (-e)"],
                    ["info", "File Information (-i)"],
                    ["showdatabase", "Show Database (-s)"],
                    ["showstructs", "Show Structures (-w)"],
                    ["xml", "XML Output (-x)"],
                    ["json", "JSON Output (-j)"],
                    ["csv", "CSV Output (-c)"],
                    ["tsv", "TSV Output (-t)"],
                    ["plaintext", "Plain Text (-p)"]
                ].map(([key, label]) => (
                    <label key={key}>
                        <input
                            type="checkbox"
                            checked={options[key]}
                            onChange={() => toggleOption(key)}
                        />
                        {label}
                    </label>
                ))}
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
                    className={`run-btn ${isRunning ? "running" : ""}`}
                    onClick={runCommand}
                    disabled={isRunning || !command || !target}
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
                            toolName={tool?.tool_name || "Detect It Easy"}
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
                                Do you want to download this output as a
                                .txt file?
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

export default DieParameters;