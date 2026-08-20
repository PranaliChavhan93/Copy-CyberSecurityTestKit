import { useState, useRef, useEffect } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";
import "./ToolCommon.css";

function AircrackngParameters({
    tool,
    parameters,
    setParameters,
    stageCode,
    onAdvanceStage
}) {
    // ----- Mode selection -----
    const [mode, setMode] = useState("aircrack");

    // ----- Common options -----
    const [interfaceName, setInterfaceName] = useState("");
    const [captureFile, setCaptureFile] = useState("");
    const [wordlist, setWordlist] = useState("");
    const [bssid, setBssid] = useState("");
    const [essid, setEssid] = useState("");
    const [channel, setChannel] = useState("");
    const [outputFile, setOutputFile] = useState("");

    // ----- aircrack-ng options -----
    const [wep, setWep] = useState(false);
    const [wpa, setWpa] = useState(true);
    const [wpa2, setWpa2] = useState(false);
    const [dictionary, setDictionary] = useState(true);
    const [ivsOnly, setIvsOnly] = useState(false);
    const [usePMK, setUsePMK] = useState(false);

    // ----- airodump-ng options -----
    const [write, setWrite] = useState(true);
    const [outputFormat, setOutputFormat] = useState("cap");
    const [gpsd, setGpsd] = useState(false);
    const [band, setBand] = useState("bg"); // bg, a, g, n

    // ----- aireplay-ng options -----
    const [attackType, setAttackType] = useState("deauth");
    const [count, setCount] = useState("");
    const [delay, setDelay] = useState("");
    const [packetSize, setPacketSize] = useState("");

    // ----- airgraph-ng options -----
    const [graphType, setGraphType] = useState("CAPR");
    const [imageFormat, setImageFormat] = useState("png");

    // ----- airmon-ng options -----
    const [action, setAction] = useState("start"); // start, stop, check

    // ----- General -----
    const [verbose, setVerbose] = useState(false);
    const [quiet, setQuiet] = useState(false);

    // ----- Command & output state -----
    const [command, setCommand] = useState("");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [executionStatus, setExecutionStatus] = useState("waiting");

    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("");
    const [downloadFileName, setDownloadFileName] = useState("aircrack_results.txt");

    const terminalRef = useRef(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [output]);

    useEffect(() => {
        updateCommandPreview();
    }, [
        mode,
        interfaceName, captureFile, wordlist, bssid, essid, channel, outputFile,
        wep, wpa, wpa2, dictionary, ivsOnly, usePMK,
        write, outputFormat, gpsd, band,
        attackType, count, delay, packetSize,
        graphType, imageFormat,
        action,
        verbose, quiet
    ]);

    // ------------------------------
    // Command generation
    // ------------------------------
    const generateCommand = () => {
        let cmd = "";

        switch (mode) {
            case "aircrack":
                cmd = "aircrack-ng";
                if (wordlist) {
                    cmd += ` -w ${wordlist}`;
                }
                if (bssid) {
                    cmd += ` -b ${bssid}`;
                }
                if (essid) {
                    cmd += ` -e "${essid}"`;
                }
                if (wep) {
                    cmd += " --wep";
                }
                if (wpa) {
                    cmd += " --wpa";
                }
                if (wpa2) {
                    cmd += " --wpa2";
                }
                if (dictionary) {
                    // default behavior
                }
                if (ivsOnly) {
                    cmd += " -i";
                }
                if (usePMK) {
                    cmd += " --pmk";
                }
                if (verbose) {
                    cmd += " -v";
                }
                if (quiet) {
                    cmd += " -q";
                }
                if (captureFile) {
                    cmd += ` ${captureFile}`;
                }
                break;

            case "airodump":
                cmd = "airodump-ng";
                if (interfaceName) {
                    cmd += ` ${interfaceName}`;
                }
                if (bssid) {
                    cmd += ` --bssid ${bssid}`;
                }
                if (essid) {
                    cmd += ` --essid "${essid}"`;
                }
                if (channel) {
                    cmd += ` -c ${channel}`;
                }
                if (write) {
                    cmd += ` -w ${outputFile || "capture"}`;
                }
                if (outputFormat === "cap" || outputFormat === "ivs") {
                    cmd += ` --output-format ${outputFormat}`;
                }
                if (gpsd) {
                    cmd += " --gpsd";
                }
                if (band === "a") {
                    cmd += " -a";
                } else if (band === "g") {
                    cmd += " -g";
                } else if (band === "n") {
                    cmd += " -n";
                }
                if (verbose) {
                    cmd += " -v";
                }
                if (quiet) {
                    cmd += " -q";
                }
                break;

            case "aireplay":
                cmd = "aireplay-ng";
                if (interfaceName) {
                    cmd += ` ${interfaceName}`;
                }
                if (attackType === "deauth") {
                    cmd += " -0";
                    if (count) {
                        cmd += ` ${count}`;
                    } else {
                        cmd += " 1";
                    }
                    if (bssid) {
                        cmd += ` -a ${bssid}`;
                    }
                    if (essid) {
                        cmd += ` -e "${essid}"`;
                    }
                } else if (attackType === "fakeauth") {
                    cmd += " -1";
                    if (delay) {
                        cmd += ` ${delay}`;
                    } else {
                        cmd += " 0";
                    }
                    if (bssid) {
                        cmd += ` -a ${bssid}`;
                    }
                    if (essid) {
                        cmd += ` -e "${essid}"`;
                    }
                } else if (attackType === "arp") {
                    cmd += " -3";
                    if (bssid) {
                        cmd += ` -b ${bssid}`;
                    }
                } else if (attackType === "fragmentation") {
                    cmd += " -5";
                    if (bssid) {
                        cmd += ` -b ${bssid}`;
                    }
                } else if (attackType === "chopchop") {
                    cmd += " -4";
                    if (bssid) {
                        cmd += ` -b ${bssid}`;
                    }
                } else if (attackType === "caffe-latte") {
                    cmd += " -6";
                    if (bssid) {
                        cmd += ` -b ${bssid}`;
                    }
                } else if (attackType === "cfrag") {
                    cmd += " -7";
                } else if (attackType === "test") {
                    cmd += " -9";
                }
                if (packetSize) {
                    cmd += ` -s ${packetSize}`;
                }
                if (verbose) {
                    cmd += " -v";
                }
                if (quiet) {
                    cmd += " -q";
                }
                break;

            case "airgraph":
                cmd = "airgraph-ng";
                if (captureFile) {
                    cmd += ` -i ${captureFile}`;
                }
                if (outputFile) {
                    cmd += ` -o ${outputFile}`;
                }
                if (graphType) {
                    cmd += ` -g ${graphType}`;
                }
                if (imageFormat) {
                    cmd += ` -f ${imageFormat}`;
                }
                if (verbose) {
                    cmd += " -v";
                }
                if (quiet) {
                    cmd += " -q";
                }
                break;

            case "airmon":
                cmd = "airmon-ng";
                if (action === "start") {
                    cmd += ` start ${interfaceName}`;
                } else if (action === "stop") {
                    cmd += ` stop ${interfaceName}`;
                } else if (action === "check") {
                    cmd += " check";
                }
                if (verbose) {
                    cmd += " -v";
                }
                if (quiet) {
                    cmd += " -q";
                }
                break;

            default:
                cmd = "aircrack-ng";
        }

        return cmd;
    };

    const updateCommandPreview = () => {
        setCommand(generateCommand());
    };

    // ------------------------------
    // API execution
    // ------------------------------
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
                            interfaceName,
                            captureFile,
                            wordlist,
                            bssid,
                            essid,
                            channel,
                            outputFile,
                            wep,
                            wpa,
                            wpa2,
                            dictionary,
                            ivsOnly,
                            usePMK,
                            write,
                            outputFormat,
                            gpsd,
                            band,
                            attackType,
                            count,
                            delay,
                            packetSize,
                            graphType,
                            imageFormat,
                            action,
                            verbose,
                            quiet
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

    // ------------------------------
    // Utility functions
    // ------------------------------
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
            downloadTxtFile(output, downloadFileName || "aircrack_results.txt");
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
                interfaceName,
                captureFile,
                wordlist,
                bssid,
                essid,
                channel,
                outputFile,
                wep,
                wpa,
                wpa2,
                dictionary,
                ivsOnly,
                usePMK,
                write,
                outputFormat,
                gpsd,
                band,
                attackType,
                count,
                delay,
                packetSize,
                graphType,
                imageFormat,
                action,
                verbose,
                quiet,
                command,
                output,
                executionStatus
            });
        }
    };

    // ------------------------------
    // Render
    // ------------------------------
    return (
        <div className="tool-box">
            <h3>
                Aircrack-ng Configuration
                {tool && <span className="tool-badge">{tool.tool_name}</span>}
            </h3>

            {/* Mode Selection */}
            <div className="tool-form">
                <div className="tool-field">
                    <label>Mode</label>
                    <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                    >
                        <option value="aircrack">aircrack-ng (Crack WEP/WPA)</option>
                        <option value="airodump">airodump-ng (Capture)</option>
                        <option value="aireplay">aireplay-ng (Injection)</option>
                        <option value="airgraph">airgraph-ng (Graph)</option>
                        <option value="airmon">airmon-ng (Interface)</option>
                    </select>
                </div>
            </div>

            {/* Conditional fields */}
            {mode === "aircrack" && (
                <>
                    <div className="tool-form">
                        <div className="tool-field">
                            <label>Capture File (.cap or .ivs)</label>
                            <input
                                type="text"
                                placeholder="/path/to/wpa.cap"
                                value={captureFile}
                                onChange={(e) => setCaptureFile(e.target.value)}
                            />
                        </div>
                        <div className="tool-field">
                            <label>Wordlist (-w)</label>
                            <input
                                type="text"
                                placeholder="/usr/share/wordlists/rockyou.txt"
                                value={wordlist}
                                onChange={(e) => setWordlist(e.target.value)}
                            />
                        </div>
                        <div className="tool-field">
                            <label>BSSID (-b)</label>
                            <input
                                type="text"
                                placeholder="00:11:22:33:44:55"
                                value={bssid}
                                onChange={(e) => setBssid(e.target.value)}
                            />
                        </div>
                        <div className="tool-field">
                            <label>ESSID (-e)</label>
                            <input
                                type="text"
                                placeholder="MyNetwork"
                                value={essid}
                                onChange={(e) => setEssid(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="tool-options">
                        <label>
                            <input
                                type="checkbox"
                                checked={wep}
                                onChange={(e) => setWep(e.target.checked)}
                            />
                            WEP Attack
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={wpa}
                                onChange={(e) => setWpa(e.target.checked)}
                            />
                            WPA Attack
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={wpa2}
                                onChange={(e) => setWpa2(e.target.checked)}
                            />
                            WPA2 Attack
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={ivsOnly}
                                onChange={(e) => setIvsOnly(e.target.checked)}
                            />
                            Use .ivs only (-i)
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={usePMK}
                                onChange={(e) => setUsePMK(e.target.checked)}
                            />
                            Use PMK (--pmk)
                        </label>
                    </div>
                </>
            )}

            {mode === "airodump" && (
                <>
                    <div className="tool-form">
                        <div className="tool-field">
                            <label>Interface</label>
                            <input
                                type="text"
                                placeholder="wlan0mon"
                                value={interfaceName}
                                onChange={(e) => setInterfaceName(e.target.value)}
                            />
                        </div>
                        <div className="tool-field">
                            <label>BSSID (optional)</label>
                            <input
                                type="text"
                                placeholder="00:11:22:33:44:55"
                                value={bssid}
                                onChange={(e) => setBssid(e.target.value)}
                            />
                        </div>
                        <div className="tool-field">
                            <label>ESSID (optional)</label>
                            <input
                                type="text"
                                placeholder="MyNetwork"
                                value={essid}
                                onChange={(e) => setEssid(e.target.value)}
                            />
                        </div>
                        <div className="tool-field">
                            <label>Channel (optional)</label>
                            <input
                                type="number"
                                placeholder="6"
                                value={channel}
                                onChange={(e) => setChannel(e.target.value)}
                            />
                        </div>
                        <div className="tool-field">
                            <label>Prefix for output files (-w)</label>
                            <input
                                type="text"
                                placeholder="capture"
                                value={outputFile}
                                onChange={(e) => setOutputFile(e.target.value)}
                            />
                        </div>
                        <div className="tool-field">
                            <label>Output Format</label>
                            <select
                                value={outputFormat}
                                onChange={(e) => setOutputFormat(e.target.value)}
                            >
                                <option value="cap">.cap</option>
                                <option value="ivs">.ivs</option>
                            </select>
                        </div>
                        <div className="tool-field">
                            <label>Band</label>
                            <select
                                value={band}
                                onChange={(e) => setBand(e.target.value)}
                            >
                                <option value="bg">2.4 GHz (b/g)</option>
                                <option value="a">5 GHz (a)</option>
                                <option value="g">2.4 GHz (g)</option>
                                <option value="n">2.4/5 GHz (n)</option>
                            </select>
                        </div>
                    </div>
                    <div className="tool-options">
                        <label>
                            <input
                                type="checkbox"
                                checked={write}
                                onChange={(e) => setWrite(e.target.checked)}
                            />
                            Write capture (-w)
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={gpsd}
                                onChange={(e) => setGpsd(e.target.checked)}
                            />
                            Use GPSD (--gpsd)
                        </label>
                    </div>
                </>
            )}

            {mode === "aireplay" && (
                <>
                    <div className="tool-form">
                        <div className="tool-field">
                            <label>Interface</label>
                            <input
                                type="text"
                                placeholder="wlan0mon"
                                value={interfaceName}
                                onChange={(e) => setInterfaceName(e.target.value)}
                            />
                        </div>
                        <div className="tool-field">
                            <label>Attack Type</label>
                            <select
                                value={attackType}
                                onChange={(e) => setAttackType(e.target.value)}
                            >
                                <option value="deauth">Deauth (-0)</option>
                                <option value="fakeauth">Fake Auth (-1)</option>
                                <option value="arp">ARP Replay (-3)</option>
                                <option value="fragmentation">Fragmentation (-5)</option>
                                <option value="chopchop">Chop Chop (-4)</option>
                                <option value="caffe-latte">Caffe Latte (-6)</option>
                                <option value="cfrag">C-Frag (-7)</option>
                                <option value="test">Test (-9)</option>
                            </select>
                        </div>
                        <div className="tool-field">
                            <label>BSSID (-a / -b)</label>
                            <input
                                type="text"
                                placeholder="00:11:22:33:44:55"
                                value={bssid}
                                onChange={(e) => setBssid(e.target.value)}
                            />
                        </div>
                        <div className="tool-field">
                            <label>ESSID (-e) (for fake auth)</label>
                            <input
                                type="text"
                                placeholder="MyNetwork"
                                value={essid}
                                onChange={(e) => setEssid(e.target.value)}
                            />
                        </div>
                        <div className="tool-field">
                            <label>Count (deauth only)</label>
                            <input
                                type="number"
                                placeholder="0 for infinite"
                                value={count}
                                onChange={(e) => setCount(e.target.value)}
                            />
                        </div>
                        <div className="tool-field">
                            <label>Delay (fake auth only)</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={delay}
                                onChange={(e) => setDelay(e.target.value)}
                            />
                        </div>
                        <div className="tool-field">
                            <label>Packet Size (-s)</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={packetSize}
                                onChange={(e) => setPacketSize(e.target.value)}
                            />
                        </div>
                    </div>
                </>
            )}

            {mode === "airgraph" && (
                <>
                    <div className="tool-form">
                        <div className="tool-field">
                            <label>CSV Input File (-i)</label>
                            <input
                                type="text"
                                placeholder="dump-01.csv"
                                value={captureFile}
                                onChange={(e) => setCaptureFile(e.target.value)}
                            />
                        </div>
                        <div className="tool-field">
                            <label>Output File (-o)</label>
                            <input
                                type="text"
                                placeholder="graph.png"
                                value={outputFile}
                                onChange={(e) => setOutputFile(e.target.value)}
                            />
                        </div>
                        <div className="tool-field">
                            <label>Graph Type (-g)</label>
                            <select
                                value={graphType}
                                onChange={(e) => setGraphType(e.target.value)}
                            >
                                <option value="CAPR">CAPR (Client/AP)</option>
                                <option value="CPG">CPG (Common/Passive)</option>
                            </select>
                        </div>
                        <div className="tool-field">
                            <label>Image Format (-f)</label>
                            <select
                                value={imageFormat}
                                onChange={(e) => setImageFormat(e.target.value)}
                            >
                                <option value="png">PNG</option>
                                <option value="jpg">JPG</option>
                                <option value="pdf">PDF</option>
                                <option value="svg">SVG</option>
                            </select>
                        </div>
                    </div>
                </>
            )}

            {mode === "airmon" && (
                <>
                    <div className="tool-form">
                        <div className="tool-field">
                            <label>Action</label>
                            <select
                                value={action}
                                onChange={(e) => setAction(e.target.value)}
                            >
                                <option value="start">Start (enable monitor)</option>
                                <option value="stop">Stop (disable monitor)</option>
                                <option value="check">Check (list interfaces)</option>
                            </select>
                        </div>
                        {action !== "check" && (
                            <div className="tool-field">
                                <label>Interface</label>
                                <input
                                    type="text"
                                    placeholder="wlan0"
                                    value={interfaceName}
                                    onChange={(e) => setInterfaceName(e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* General options (appear for all modes) */}
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
                    Quiet (-q)
                </label>
            </div>

            {/* Command & Execution */}
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

            {/* Terminal Output */}
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
                            toolName={tool?.tool_name || "Aircrack-ng"}
                            stageCode={stageCode}
                            onAdvanceStage={onAdvanceStage}
                        />
                        <button className="download-btn" onClick={handleDownload}>
                            <i className="fas fa-download"></i> Download TXT
                        </button>
                    </div>
                )}
            </div>

            {/* Download Popup */}
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
                                value={downloadFileName}
                                onChange={(e) => setDownloadFileName(e.target.value)}
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

export default AircrackngParameters;