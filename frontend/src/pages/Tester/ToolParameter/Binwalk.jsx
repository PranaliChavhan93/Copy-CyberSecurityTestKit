import { useState, useRef, useEffect } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";
import "./ToolCommon.css";

function BinwalkParameters({
    tool,
    parameters,
    setParameters,
    stageCode,
    onAdvanceStage
}) {
    const [target, setTarget] = useState("");
    const [length, setLength] = useState("");
    const [offset, setOffset] = useState("");

    const [signature, setSignature] = useState(true);
    const [opcodes, setOpcodes] = useState(false);
    const [disasm, setDisasm] = useState(false);
    const [rawBytes, setRawBytes] = useState("");

    const [extract, setExtract] = useState(false);
    const [matryoshka, setMatryoshka] = useState(false);
    const [depth, setDepth] = useState("8");
    const [directory, setDirectory] = useState("");

    const [entropy, setEntropy] = useState(false);

    const [verbose, setVerbose] = useState(false);
    const [quiet, setQuiet] = useState(false);
    const [log, setLog] = useState("");

    const [command, setCommand] = useState("");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [executionStatus, setExecutionStatus] = useState("waiting");

    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("");
    const [outputFile, setOutputFile] = useState("binwalk_results.txt");

    const terminalRef = useRef(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [output]);

    useEffect(() => {
        updateCommandPreview();
    }, [
        target, length, offset,
        signature, opcodes, disasm, rawBytes,
        extract, matryoshka, depth, directory,
        entropy,
        verbose, quiet, log
    ]);

    const generateCommand = () => {
        let cmd = "binwalk";

        if (target) cmd += ` ${target}`;

        if (length) cmd += ` -l ${length}`;
        if (offset) cmd += ` -o ${offset}`;

        if (signature) cmd += " -B";
        if (opcodes) cmd += " -A";
        if (disasm) cmd += " -Y";
        if (rawBytes) cmd += ` -R "${rawBytes}"`;

        if (extract) cmd += " -e";
        if (matryoshka) cmd += " -M";
        if (depth) cmd += ` -d ${depth}`;
        if (directory) cmd += ` -C ${directory}`;

        if (entropy) cmd += " -E";

        if (verbose) cmd += " -v";
        if (quiet) cmd += " -q";
        if (log) cmd += ` -f ${log}`;

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
                            target, length, offset,
                            signature, opcodes, disasm, rawBytes,
                            extract, matryoshka, depth, directory,
                            entropy,
                            verbose, quiet, log
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
            downloadTxtFile(output, outputFile || "binwalk_results.txt");
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
                target, length, offset,
                signature, opcodes, disasm, rawBytes,
                extract, matryoshka, depth, directory,
                entropy,
                verbose, quiet, log,
                command, output, executionStatus
            });
        }
    };

    return (
        <div className="tool-box">
            <h3>
                Binwalk Configuration
                {tool && <span className="tool-badge">{tool.tool_name}</span>}
            </h3>

            <div className="tool-form">
                <div className="tool-field">
                    <label>Target File</label>
                    <input
                        type="text"
                        placeholder="/path/to/firmware.bin"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Scan Length (bytes)</label>
                    <input
                        type="number"
                        placeholder="(full file)"
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Start Offset</label>
                    <input
                        type="text"
                        placeholder="0x1000 or 4096"
                        value={offset}
                        onChange={(e) => setOffset(e.target.value)}
                    />
                </div>
            </div>

            <h4 style={{ marginTop: "20px", marginBottom: "10px" }}>Scan Types</h4>
            <div className="tool-options">
                <label>
                    <input
                        type="checkbox"
                        checked={signature}
                        onChange={(e) => setSignature(e.target.checked)}
                    />
                    Signature Scan (-B)
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={opcodes}
                        onChange={(e) => setOpcodes(e.target.checked)}
                    />
                    Opcode Scan (-A)
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={disasm}
                        onChange={(e) => setDisasm(e.target.checked)}
                    />
                    Disassemble (-Y) – CPU architecture
                </label>

                <div className="tool-field" style={{ width: '100%' }}>
                    <label>Raw Bytes (-R)</label>
                    <input
                        type="text"
                        placeholder="\x00\x01\x02"
                        value={rawBytes}
                        onChange={(e) => setRawBytes(e.target.value)}
                    />
                </div>
            </div>

            <h4 style={{ marginTop: "20px", marginBottom: "10px" }}>Extraction</h4>
            <div className="tool-options">
                <label>
                    <input
                        type="checkbox"
                        checked={extract}
                        onChange={(e) => setExtract(e.target.checked)}
                    />
                    Extract (-e) – auto extract known types
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={matryoshka}
                        onChange={(e) => setMatryoshka(e.target.checked)}
                        disabled={!extract}
                    />
                    Matryoshka (-M) – recursive extraction
                </label>

                <div className="tool-field" style={{ width: '100%' }}>
                    <label>Recursion Depth (-d)</label>
                    <input
                        type="number"
                        placeholder="8"
                        value={depth}
                        onChange={(e) => setDepth(e.target.value)}
                        disabled={!extract || !matryoshka}
                    />
                </div>

                <div className="tool-field" style={{ width: '100%' }}>
                    <label>Output Directory (-C)</label>
                    <input
                        type="text"
                        placeholder="./extracted"
                        value={directory}
                        onChange={(e) => setDirectory(e.target.value)}
                        disabled={!extract}
                    />
                </div>
            </div>

            <h4 style={{ marginTop: "20px", marginBottom: "10px" }}>Entropy</h4>
            <div className="tool-options">
                <label>
                    <input
                        type="checkbox"
                        checked={entropy}
                        onChange={(e) => setEntropy(e.target.checked)}
                    />
                    Calculate Entropy (-E)
                </label>
            </div>

            <h4 style={{ marginTop: "20px", marginBottom: "10px" }}>General Options</h4>
            <div className="tool-options">
                <label>
                    <input
                        type="checkbox"
                        checked={verbose}
                        onChange={(e) => setVerbose(e.target.checked)}
                    />
                    Verbose (-v)
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={quiet}
                        onChange={(e) => setQuiet(e.target.checked)}
                    />
                    Quiet (-q) – suppress stdout
                </label>

                <div className="tool-field" style={{ width: '100%' }}>
                    <label>Log File (-f)</label>
                    <input
                        type="text"
                        placeholder="results.log"
                        value={log}
                        onChange={(e) => setLog(e.target.value)}
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
                    disabled={isRunning || !command || !target}
                >
                    {isRunning ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i> Running...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-play"></i>Run Command
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
                            toolName={tool?.tool_name || "Binwalk"}
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
                        </div>
                        <div className="popup-buttons">
                            <button className="popup-cancel-btn" 
                                onClick={handlePopupCancel}
                            >Cancel
                            </button>
                            <button className="popup-confirm-btn" 
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

export default BinwalkParameters;