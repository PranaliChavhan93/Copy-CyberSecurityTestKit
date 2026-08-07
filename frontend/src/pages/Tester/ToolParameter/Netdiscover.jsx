
import { useState } from "react";
import "./SaveOutput.css";
import AIAnalysisPanel from "./AIAnalysisPanel";

function Netdiscover({ tool, stageCode, onAdvanceStage }) {
    const [interfaceName, setInterfaceName] = useState("eth0");
    const [range, setRange] = useState("");
    const [mode, setMode] = useState("");
    const [sleep, setSleep] = useState("");
    const [outputFile, setOutputFile] = useState("");
    const [output, setOutput] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);
    const [popupType, setPopupType] = useState("");

    const generateCommand = () => {
        let cmd = "sudo netdiscover";

        if (interfaceName)
            cmd += ` -i ${interfaceName}`;
        if (range)
            cmd += ` -r ${range}`;
        if (mode === "passive")
            cmd += " -p";
        if (mode === "fast")
            cmd += " -f";
        if (mode === "no-dns")
            cmd += " -N";
        if (mode === "verbose")
            cmd += " -v";
        if (sleep)
            cmd += ` -s ${sleep}`;
        if (outputFile)
            cmd += ` > ${outputFile}`;
        return cmd;
    };

    const runCommand = async () => {
        setIsExecuting(true);
        const cmd = generateCommand();
        
        try {
            const response = await fetch(
                "http://127.0.0.1:8000/tools/run/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        command: cmd
                    })
                }
            );

            const data = await response.json();

            // setOutput(prev => prev +"\n"+data.output);
            setOutput(prev => prev + `\n# ${cmd}\n`);


        } catch (error) {
            setOutput(
                prev =>
                prev +
                "\nError : " +
                error.message
            );
        } finally {
            setIsExecuting(false);
        }
    };

    const downloadTxtFile = (content, filename) => {
        if (!filename.endsWith('.txt')) {
            filename = filename + '.txt';
        }

        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
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
            downloadTxtFile(output, outputFile || "netdiscover_results.txt");
            setShowPopup(false);
            setPopupType("");
        }
    };

    const handlePopupCancel = () => {
        setShowPopup(false);
        setPopupType("");
    };

    return (
        <div className="amass-box">
            <h3>Netdiscover Configuration</h3>

            <div className="amass-form">
                <div className="amass-field">
                    <label>Interface</label>
                    <input
                        value={interfaceName}
                        placeholder="eth0"
                        onChange={e => setInterfaceName(e.target.value)}
                    />
                </div>

                <div className="amass-field">
                    <label>Network Range</label>
                    <input
                        placeholder="192.168.1.0/24"
                        value={range}
                        onChange={e => setRange(e.target.value)}
                    />
                </div>

                <div className="amass-field">
                    <label>Scan Mode</label>
                    <select
                        value={mode}
                        onChange={e => setMode(e.target.value)}
                    >
                        <option value="">Normal Scan</option>
                        <option value="passive">Passive Mode (-p)</option>
                        <option value="fast">Fast Mode (-f)</option>
                        <option value="no-dns">Disable DNS (-N)</option>
                        <option value="verbose">Verbose (-v)</option>
                    </select>
                </div>

                <div className="amass-field">
                    <label>Sleep Time</label>
                    <input
                        placeholder="10"
                        value={sleep}
                        onChange={e => setSleep(e.target.value)}
                    />
                </div>

                <div className="amass-field">
                    <label>Save Output File</label>
                    <input
                        placeholder="results.txt"
                        value={outputFile}
                        onChange={e => setOutputFile(e.target.value)}
                    />
                </div>
            </div>

            <div className="command-area">
                <label>Generated Command</label>
                <div className="command-preview">
                    {generateCommand()}
                </div>
                <button
                    className="run-btn"
                    onClick={runCommand}
                    disabled={isExecuting}
                >
                    {isExecuting ? 'Running...' : 'Run'}
                </button>
            </div>

            <div className="command-area">
                <label>Result</label>
                <div className="terminal">
                    <pre>
                        {output || "Waiting for execution..."}
                    </pre>
                </div>
                {output && output !== "Waiting for execution..." && (
                    <div className="action-buttons">
                        <AIAnalysisPanel
                            output={output}
                            toolName={tool?.tool_name || "Sublist3r"}
                            stageCode={stageCode}
                            onAdvanceStage={onAdvanceStage}
                        />
                        <button 
                            className="download-btn"
                            onClick={handleDownload}
                        >
                            Download TXT
                        </button>
                    </div>
                )}
            </div>

            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup-box confirm-popup">
                        <h3>📥 Download TXT File</h3>
                        
                        <div className="popup-message">
                            <p>Do you confirm this output is correct and want to download it as a .txt file?</p>
                        </div>

                        {popupType === 'download' && outputFile && (
                            <p className="popup-file-info">
                                Filename: <strong>{outputFile.endsWith('.txt') ? outputFile : outputFile + '.txt'}</strong>
                            </p>
                        )}

                        <div className="popup-buttons">
                            <button 
                                className="popup-cancel-btn"
                                onClick={handlePopupCancel}
                            >
                                Cancle
                            </button>
                            <button 
                                className="popup-confirm-btn"
                                onClick={handlePopupConfirm}
                            >
                                Conform
                            </button>
                        </div>
                        
                    </div>
                </div>
            )}
        </div>
    );
}

export default Netdiscover;