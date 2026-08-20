import { useState, useRef, useEffect } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";
import "./ToolCommon.css";

function TcpdumpParameters({
    tool,
    parameters,
    setParameters,
    stageCode,
    onAdvanceStage
}) {
    const [p, setP] = useState({
        target: "",
        interface: "",
        count: "",
        buffer: "",
        snaplen: "",
        read: "",
        write: "",
        direction: "",
        filter: "",
        immediate: false,
        ascii: false,
        hex: false,
        hexAscii: false,
        ethernet: false,
        verbosity: ""
    });

    const [command, setCommand] = useState("");
    const [output, setOutput] = useState("");
    const [running, setRunning] = useState(false);
    const [status, setStatus] = useState("waiting");
    const [popup, setPopup] = useState(false);
    const [fileName, setFileName] = useState("tcpdump_results.txt");
    const terminalRef = useRef(null);

    const update = (key, value) =>
        setP(prev => ({ ...prev, [key]: value }));

    const generateCommand = () => {
        let cmd = "tcpdump";

        const add = (value) => value && (cmd += ` ${value}`);

        add(p.interface && `-i ${p.interface}`);
        add(p.count && `-c ${p.count}`);
        add(p.buffer && `-B ${p.buffer}`);
        add(p.snaplen && `-s ${p.snaplen}`);
        add(p.read && `-r ${p.read}`);
        add(p.write && `-w ${p.write}`);
        add(p.direction && `-Q ${p.direction}`);

        add(p.immediate && "--immediate-mode");
        add(p.ascii && "-A");
        add(p.hex && "-x");
        add(p.hexAscii && "-X");
        add(p.ethernet && "-e");

        add(p.verbosity && p.verbosity);

        add(p.target);
        add(p.filter);

        return cmd;
    };

    useEffect(() => {
        setCommand(generateCommand());
    }, [p]);

    useEffect(() => {
        if (terminalRef.current)
            terminalRef.current.scrollTop =
                terminalRef.current.scrollHeight;
    }, [output]);

    const runCommand = async () => {
        const cmd = generateCommand();

        setRunning(true);
        setStatus("running");
        setOutput(prev => prev + `\n# ${cmd}\n`);

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
                        parameters: p
                    })
                }
            );

            const data = await response.json();

            setOutput(prev =>
                prev +
                `${response.ok
                    ? data.output || "Command executed successfully"
                    : data.message || "Unknown error"}\n`
            );

            setStatus(response.ok ? "success" : "error");
        } catch (error) {
            setOutput(prev => prev + `${error.message}\n`);
            setStatus("error");
        } finally {
            setRunning(false);
        }
    };

    const clearTerminal = () => {
        setOutput("");
        setStatus("waiting");
    };

    const download = () => {
        if (!output) {
            alert("No output available! Please run the command first.");
            return;
        }

        setPopup(true);
    };

    const confirmDownload = () => {
        const name = fileName.endsWith(".txt")
            ? fileName
            : `${fileName}.txt`;

        const url = URL.createObjectURL(
            new Blob([output], { type: "text/plain" })
        );

        const link = document.createElement("a");
        link.href = url;
        link.download = name;
        link.click();

        URL.revokeObjectURL(url);
        setPopup(false);
    };

    const saveParameters = () => {
        setParameters?.({
            ...p,
            command,
            output,
            executionStatus: status
        });
    };

    const fields = [
        ["Target / Host", "target", "192.168.1.10"],
        ["Interface (-i)", "interface", "eth0"],
        ["Packet Count (-c)", "count", "100"],
        ["Buffer Size (-B)", "buffer", "4096"],
        ["Snaplen (-s)", "snaplen", "262144"],
        ["Read File (-r)", "read", "capture.pcap"],
        ["Write File (-w)", "write", "capture.pcap"]
    ];

    const options = [
        ["immediate", "--immediate-mode"],
        ["ascii", "ASCII (-A)"],
        ["hex", "Hex (-x)"],
        ["hexAscii", "Hex + ASCII (-X)"],
        ["ethernet", "Ethernet (-e)"]
    ];

    return (
        <div className="tool-box">
            <h3>
                Tcpdump Configuration
                {tool && (
                    <span className="tool-badge">
                        {tool.tool_name}
                    </span>
                )}
            </h3>

            <div className="tool-form">
                {fields.map(([label, key, placeholder]) => (
                    <div className="tool-field" key={key}>
                        <label>{label}</label>
                        <input
                            type="text"
                            placeholder={placeholder}
                            value={p[key]}
                            onChange={e => update(key, e.target.value)}
                        />
                    </div>
                ))}

                <div className="tool-field">
                    <label>Direction (-Q)</label>
                    <select
                        value={p.direction}
                        onChange={e =>
                            update("direction", e.target.value)
                        }
                    >
                        <option value="">Default</option>
                        <option value="in">Incoming</option>
                        <option value="out">Outgoing</option>
                        <option value="inout">Both</option>
                    </select>
                </div>

                <div className="tool-field">
                    <label>Packet Filter</label>
                    <input
                        type="text"
                        placeholder="tcp port 80"
                        value={p.filter}
                        onChange={e =>
                            update("filter", e.target.value)
                        }
                    />
                </div>
            </div>

            <div className="tool-options">
                {options.map(([key, label]) => (
                    <label key={key}>
                        <input
                            type="checkbox"
                            checked={p[key]}
                            onChange={e =>
                                update(key, e.target.checked)
                            }
                        />
                        {label}
                    </label>
                ))}
            </div>

            <div className="tool-form">
                <div className="tool-field">
                    <label>Verbosity</label>
                    <select
                        value={p.verbosity}
                        onChange={e =>
                            update("verbosity", e.target.value)
                        }
                    >
                        <option value="">Normal</option>
                        <option value="-v">Verbose (-v)</option>
                        <option value="-vv">Very Verbose (-vv)</option>
                        <option value="-vvv">Maximum (-vvv)</option>
                    </select>
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
                    className={`run-btn ${running ? "running" : ""}`}
                    onClick={runCommand}
                    disabled={running || !command}
                >
                    <i
                        className={
                            running
                                ? "fas fa-spinner fa-spin"
                                : "fas fa-play"
                        }
                    />
                    {" "}
                    {running ? "Running..." : "Run Command"}
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
                        <i className="fas fa-eraser" /> Clear
                    </button>
                )}
            </div>

            <div className="command-area">
                <label>Terminal Output</label>

                <div className="terminal" ref={terminalRef}>
                    <pre>
                        {output || "Waiting for execution..."}
                        {running && <span className="cursor" />}
                    </pre>
                </div>

                {output && (
                    <div className="action-buttons">
                        <AIAnalysisPanel
                            output={output}
                            toolName={tool?.tool_name || "Tcpdump"}
                            stageCode={stageCode}
                            onAdvanceStage={onAdvanceStage}
                        />

                        <button
                            className="download-btn"
                            onClick={download}
                        >
                            <i className="fas fa-download" />
                            {" "}Download TXT
                        </button>
                    </div>
                )}
            </div>

            {popup && (
                <div
                    className="popup-overlay"
                    onClick={() => setPopup(false)}
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
                            <p> Do you want to download this output as a .txt file? </p>
                        </div>

                        <div className="popup-file-info">
                            <label>File Name</label>

                            <input
                                type="text"
                                value={fileName}
                                onChange={e =>
                                    setFileName(e.target.value)
                                }
                            />
                        </div>

                        <div className="popup-buttons">
                            <button
                                className="popup-cancel-btn"
                                onClick={() => setPopup(false)}
                            >
                                Cancel
                            </button>

                            <button
                                className="popup-confirm-btn"
                                onClick={confirmDownload}
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

export default TcpdumpParameters;