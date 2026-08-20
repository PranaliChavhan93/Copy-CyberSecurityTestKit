import { useEffect, useRef, useState } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";
import "./ToolCommon.css";

function SocatParameters({ tool, parameters, setParameters, stageCode, onAdvanceStage }) {
    const [mode, setMode] = useState("socat");
    const [address1, setAddress1] = useState("");
    const [address2, setAddress2] = useState("");
    const [address3, setAddress3] = useState("");
    const [verbose, setVerbose] = useState(false);
    const [sloppy, setSloppy] = useState(false);
    const [ipv4, setIpv4] = useState(false);
    const [ipv6, setIpv6] = useState(false);
    const [statistics, setStatistics] = useState(false);
    const [timeout, setTimeoutValue] = useState("");
    const [inactivityTimeout, setInactivityTimeout] = useState("");
    const [command, setCommand] = useState("");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [executionStatus, setExecutionStatus] = useState("waiting");
    const [showPopup, setShowPopup] = useState(false);
    const [outputFile, setOutputFile] = useState("socat_results.txt");
    const terminalRef = useRef(null);

    useEffect(() => {
        terminalRef.current?.scrollTo(0, terminalRef.current.scrollHeight);
    }, [output]);

    useEffect(() => {
        setCommand(generateCommand());
    }, [mode, address1, address2, address3, verbose, sloppy, ipv4, ipv6, statistics, timeout, inactivityTimeout]);

    const generateCommand = () => {
        let cmd = mode === "socat" ? "socat" : `socat-${mode}.sh`;

        if (verbose) 
            cmd += " -d";
        if (mode === "socat" && sloppy) 
            cmd += " -s";
        if (mode === "socat" && ipv4) 
            cmd += " -4";
        if (mode === "socat" && ipv6) 
            cmd += " -6";
        if (statistics && (mode === "socat" || mode === "broker")) {
            cmd += mode === "socat" ? " --statistics" : " -S";
        }
        if (timeout && mode !== "mux") 
            cmd += ` -t ${timeout}`;
        if (inactivityTimeout && mode !== "mux") 
            cmd += ` -T ${inactivityTimeout}`;

        if (mode === "socat" && address1 && address2)
            cmd += ` ${address1} ${address2}`;
        else if (mode === "broker" && address1)
            cmd += ` ${address1}`;
        else if (mode === "chain" && address1 && address2 && address3)
            cmd += ` ${address1} ${address2} ${address3}`;
        else if (mode === "mux" && address1 && address2)
            cmd += ` ${address1} ${address2}`;

        return cmd;
    };

    const runCommand = async () => {
        const cmd = generateCommand();
        setIsRunning(true);
        setExecutionStatus("running");
        setOutput(prev => prev + `\n# ${cmd}\n`);

        try {
            const response = await fetch("http://127.0.0.1:8000/tools/run/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${sessionStorage.getItem("access")}`
                },
                body: JSON.stringify({
                    command: cmd,
                    tool_id: tool?.id || null,
                    parameters: {
                        mode, address1, address2, address3, verbose, sloppy,
                        ipv4, ipv6, statistics, timeout, inactivityTimeout
                    }
                })
            });

            const data = await response.json();
            setOutput(prev => prev + `${response.ok
                ? data.output || "Command executed successfully"
                : data.message || "Unknown error"}\n`);
            setExecutionStatus(response.ok ? "success" : "error");
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
        filename = filename.endsWith(".txt") ? filename : `${filename}.txt`;
        const url = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    const handleDownload = () => {
        if (!output || output === "Waiting for execution...") {
            alert("No output available! Please run the command first.");
            return;
        }
        setShowPopup(true);
    };

    const validCommand =
        command &&
        address1 &&
        (mode === "broker" ||
            (mode === "socat" && address2) ||
            (mode === "mux" && address2) ||
            (mode === "chain" && address2 && address3));

    const addressFields = [
        {
            show: true,
            label: mode === "broker" ? "Listener" : mode === "mux" ? "Listener" : mode === "chain" ? "Address 1" : "Left Address",
            value: address1,
            set: setAddress1,
            placeholder: mode === "broker" ? "TCP4-L:1234" : "TCP4-L:1234,reuseaddr,fork"
        },
        {
            show: mode !== "broker",
            label: mode === "chain" ? "Address 2" : mode === "mux" ? "Target" : "Right Address",
            value: address2,
            set: setAddress2,
            placeholder: "TCP:10.2.3.4:12345"
        },
        {
            show: mode === "chain",
            label: "Address 3",
            value: address3,
            set: setAddress3,
            placeholder: "OPENSSL:10.2.3.4:12345"
        }
    ];

    const options = [
        ["Verbose (-d)", verbose, setVerbose],
        ...(mode === "socat" ? [
            ["Sloppy (-s)", sloppy, setSloppy],
            ["IPv4 (-4)", ipv4, setIpv4],
            ["IPv6 (-6)", ipv6, setIpv6]
        ] : []),
        ...(mode === "socat" || mode === "broker"
            ? [["Statistics", statistics, setStatistics]]
            : [])
    ];

    return (
        <div className="tool-box">
            <h3> Socat Configuration
                {tool && <span className="tool-badge">{tool.tool_name}</span>}
            </h3>

            <div className="tool-form">
                <div className="tool-field">
                    <label>Operation</label>
                    <select value={mode} onChange={e => setMode(e.target.value)}>
                        <option value="socat">Socat</option>
                        <option value="broker">Socat Broker</option>
                        <option value="chain">Socat Chain</option>
                        <option value="mux">Socat Mux</option>
                    </select>
                </div>

                {addressFields.filter(f => f.show).map((field, i) => (
                    <div className="tool-field" key={i}>
                        <label>{field.label}</label>
                        <input
                            type="text"
                            placeholder={field.placeholder}
                            value={field.value}
                            onChange={e => field.set(e.target.value)}
                        />
                    </div>
                ))}

                {mode !== "mux" && (
                    <>
                        <div className="tool-field">
                            <label>Timeout</label>
                            <input
                                type="number"
                                placeholder="10"
                                value={timeout}
                                onChange={e => setTimeoutValue(e.target.value)}
                            />
                        </div>

                        <div className="tool-field">
                            <label>Inactivity Timeout</label>
                            <input
                                type="number"
                                placeholder="30"
                                value={inactivityTimeout}
                                onChange={e => setInactivityTimeout(e.target.value)}
                            />
                        </div>
                    </>
                )}
            </div>

            <div className="tool-options">
                {options.map(([label, checked, setChecked]) => (
                    <label key={label}>
                        <input
                            type="checkbox"
                            checked={checked}
                            onChange={e => setChecked(e.target.checked)}
                        />
                        {label}
                    </label>
                ))}
            </div>

            <div className="command-area">
                <label>Generated Command</label>
                <div className="command-preview">
                    <span className="command-text">{command || "Command..."}</span>
                </div>
                <br />

                <button
                    className={`run-btn ${isRunning ? "running" : ""}`}
                    onClick={runCommand}
                    disabled={isRunning || !validCommand}
                >
                    <i className={isRunning ? "fas fa-spinner fa-spin" : "fas fa-play"} />
                    {" "}{isRunning ? "Running..." : "Run Command"}
                </button>

                {output && (
                    <button
                        className="run-btn"
                        style={{ background: "#6b7a9a", marginLeft: "10px", padding: "12px 20px" }}
                        onClick={clearTerminal}
                    >
                        <i className="fas fa-eraser" /> Clear
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
                            toolName={tool?.tool_name || "Socat"}
                            stageCode={stageCode}
                            onAdvanceStage={onAdvanceStage}
                        />
                        <button className="download-btn" onClick={handleDownload}>
                            <i className="fas fa-download" /> Download TXT
                        </button>
                    </div>
                )}
            </div>

            {showPopup && (
                <div className="popup-overlay" onClick={() => setShowPopup(false)}>
                    <div className="popup-box confirm-popup" onClick={e => e.stopPropagation()}>
                        <h3><i className="fas fa-download" /> Download File</h3>

                        <div className="popup-message">
                            <p>Do you want to download this output as a .txt file?</p>
                        </div>

                        <div className="popup-file-info">
                            <label>File Name</label>
                            <input
                                type="text"
                                value={outputFile}
                                onChange={e => setOutputFile(e.target.value)}
                            />
                            <small>The output will be saved as a text file.</small>
                        </div>

                        <div className="popup-buttons">
                            <button
                                className="popup-cancel-btn"
                                onClick={() => setShowPopup(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="popup-confirm-btn"
                                onClick={() => {
                                    downloadTxtFile(output, outputFile || "socat_results.txt");
                                    setShowPopup(false);
                                }}
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

export default SocatParameters;