import { useState, useRef, useEffect } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";
import "./ToolCommon.css";

function AirodumpParameters({
    tool,
    parameters,
    setParameters,
    stageCode,
    onAdvanceStage
}) {
    // ----- Core settings -----
    const [interfaceName, setInterfaceName] = useState("");
    const [writePrefix, setWritePrefix] = useState("");
    const [readFile, setReadFile] = useState("");
    const [channel, setChannel] = useState("");
    const [band, setBand] = useState("bg");
    const [frequencies, setFrequencies] = useState("");
    const [cswitch, setCswitch] = useState("0");

    // ----- Output formats -----
    const [outputFormats, setOutputFormats] = useState("pcap");
    const [writeInterval, setWriteInterval] = useState("");
    const [updateDelay, setUpdateDelay] = useState("");
    const [berlin, setBerlin] = useState("120");

    // ----- Flags -----
    const [ivs, setIvs] = useState(false);
    const [gpsd, setGpsd] = useState(false);
    const [beacons, setBeacons] = useState(false);
    const [showack, setShowack] = useState(false);
    const [hideKnown, setHideKnown] = useState(false);
    const [manufacturer, setManufacturer] = useState(false);
    const [uptime, setUptime] = useState(false);
    const [wps, setWps] = useState(false);
    const [ignoreNegativeOne, setIgnoreNegativeOne] = useState(false);
    const [realTime, setRealTime] = useState(false);
    const [ht20, setHt20] = useState(false);
    const [ht40minus, setHt40minus] = useState(false);
    const [ht40plus, setHt40plus] = useState(false);
    const [ignoreOtherChans, setIgnoreOtherChans] = useState(false);

    // ----- Filters -----
    const [encrypt, setEncrypt] = useState("");
    const [netmask, setNetmask] = useState("");
    const [bssid, setBssid] = useState("");
    const [essid, setEssid] = useState("");
    const [essidRegex, setEssidRegex] = useState("");
    const [minPackets, setMinPackets] = useState("2");
    const [minPower, setMinPower] = useState("-120");
    const [minRxq, setMinRxq] = useState("");
    const [filterUnassociated, setFilterUnassociated] = useState(false);
    const [filterAssociated, setFilterAssociated] = useState(false);

    // ----- Advanced -----
    const [hopTime, setHopTime] = useState("");
    const [activeScanning, setActiveScanning] = useState("");

    // ----- Command & output -----
    const [command, setCommand] = useState("");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [executionStatus, setExecutionStatus] = useState("waiting");

    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("");
    const [outputFile, setOutputFile] = useState("airodump_results.txt");

    const terminalRef = useRef(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [output]);

    useEffect(() => {
        updateCommandPreview();
    }, [
        interfaceName, writePrefix, readFile, channel, band, frequencies, cswitch,
        outputFormats, writeInterval, updateDelay, berlin,
        ivs, gpsd, beacons, showack, hideKnown, manufacturer, uptime, wps,
        ignoreNegativeOne, realTime, ht20, ht40minus, ht40plus, ignoreOtherChans,
        encrypt, netmask, bssid, essid, essidRegex, minPackets, minPower, minRxq,
        filterUnassociated, filterAssociated, hopTime, activeScanning
    ]);

    // ------------------------------
    // Command generation
    // ------------------------------
    const generateCommand = () => {
        let cmd = "airodump-ng";

        // Interface (required)
        if (interfaceName) {
            cmd += ` ${interfaceName}`;
        }

        // Write prefix
        if (writePrefix) {
            cmd += ` --write ${writePrefix}`;
        }

        // Read from file
        if (readFile) {
            cmd += ` -r ${readFile}`;
        }

        // Channel(s)
        if (channel) {
            cmd += ` --channel ${channel}`;
        }

        // Band
        if (band && band !== "bg") {
            cmd += ` --band ${band}`;
        }

        // Frequencies
        if (frequencies) {
            cmd += ` -C ${frequencies}`;
        }

        // Channel switching method
        if (cswitch !== "0") {
            cmd += ` --cswitch ${cswitch}`;
        }

        // Output format
        if (outputFormats && outputFormats !== "pcap") {
            cmd += ` --output-format ${outputFormats}`;
        }

        // Write interval
        if (writeInterval) {
            cmd += ` --write-interval ${writeInterval}`;
        }

        // Update delay
        if (updateDelay) {
            cmd += ` --update ${updateDelay}`;
        }

        // Berlin (time before removing AP)
        if (berlin && berlin !== "120") {
            cmd += ` --berlin ${berlin}`;
        }

        // Flags
        if (ivs) cmd += " --ivs";
        if (gpsd) cmd += " --gpsd";
        if (beacons) cmd += " --beacons";
        if (showack) cmd += " --showack";
        if (hideKnown) cmd += " -h";
        if (manufacturer) cmd += " --manufacturer";
        if (uptime) cmd += " --uptime";
        if (wps) cmd += " --wps";
        if (ignoreNegativeOne) cmd += " --ignore-negative-one";
        if (realTime) cmd += " --real-time";
        if (ht20) cmd += " --ht20";
        if (ht40minus) cmd += " --ht40-";
        if (ht40plus) cmd += " --ht40+";
        if (ignoreOtherChans && channel) cmd += " --ignore-other-chans";

        // Filters
        if (encrypt) {
            // Can be multiple, but we'll handle as comma-separated
            const encrypts = encrypt.split(",").map(e => e.trim());
            encrypts.forEach(enc => {
                if (enc) cmd += ` --encrypt ${enc}`;
            });
        }
        if (netmask) cmd += ` --netmask ${netmask}`;
        if (bssid) cmd += ` --bssid ${bssid}`;
        if (essid) cmd += ` --essid ${essid}`;
        if (essidRegex) cmd += ` --essid-regex "${essidRegex}"`;
        if (minPackets && minPackets !== "2") {
            cmd += ` --min-packets ${minPackets}`;
        }
        if (minPower && minPower !== "-120") {
            cmd += ` --min-power ${minPower}`;
        }
        if (minRxq) {
            cmd += ` --min-rxq ${minRxq}`;
        }
        if (filterUnassociated) cmd += " -a";
        if (filterAssociated) cmd += " -z";

        // Hop time (f)
        if (hopTime) {
            cmd += ` -f ${hopTime}`;
        }

        // Active scanning simulation (x)
        if (activeScanning) {
            cmd += ` -x ${activeScanning}`;
        }

        return cmd;
    };

    const updateCommandPreview = () => {
        setCommand(generateCommand());
    };

    // ------------------------------
    // API execution (same as SQLmap)
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
                            interfaceName, writePrefix, readFile, channel, band,
                            frequencies, cswitch, outputFormats, writeInterval,
                            updateDelay, berlin, ivs, gpsd, beacons, showack,
                            hideKnown, manufacturer, uptime, wps, ignoreNegativeOne,
                            realTime, ht20, ht40minus, ht40plus, ignoreOtherChans,
                            encrypt, netmask, bssid, essid, essidRegex, minPackets,
                            minPower, minRxq, filterUnassociated, filterAssociated,
                            hopTime, activeScanning
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
            downloadTxtFile(output, outputFile || "airodump_results.txt");
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
                interfaceName, writePrefix, readFile, channel, band,
                frequencies, cswitch, outputFormats, writeInterval,
                updateDelay, berlin, ivs, gpsd, beacons, showack,
                hideKnown, manufacturer, uptime, wps, ignoreNegativeOne,
                realTime, ht20, ht40minus, ht40plus, ignoreOtherChans,
                encrypt, netmask, bssid, essid, essidRegex, minPackets,
                minPower, minRxq, filterUnassociated, filterAssociated,
                hopTime, activeScanning,
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
                Airodump-ng Configuration
                {tool && <span className="tool-badge">{tool.tool_name}</span>}
            </h3>

            {/* ----- Interface & Output ----- */}
            <div className="tool-form">
                <div className="tool-field">
                    <label>Interface</label>
                    <input
                        type="text"
                        placeholder="wlan0mon"
                        value={interfaceName}
                        onChange={(e) => setInterfaceName(e.target.value)}
                    />
                    <small>Required: wireless interface in monitor mode</small>
                </div>

                <div className="tool-field">
                    <label>Write Prefix (--write)</label>
                    <input
                        type="text"
                        placeholder="capture"
                        value={writePrefix}
                        onChange={(e) => setWritePrefix(e.target.value)}
                    />
                    <small>Prefix for output files (.cap, .csv, .kismet, etc.)</small>
                </div>

                <div className="tool-field">
                    <label>Read from File (-r)</label>
                    <input
                        type="text"
                        placeholder="/path/to/file.cap"
                        value={readFile}
                        onChange={(e) => setReadFile(e.target.value)}
                    />
                    <small>Read packets from a file instead of live capture</small>
                </div>

                <div className="tool-field">
                    <label>Output Format (--output-format)</label>
                    <select
                        value={outputFormats}
                        onChange={(e) => setOutputFormats(e.target.value)}
                    >
                        <option value="pcap">pcap</option>
                        <option value="ivs">ivs</option>
                        <option value="csv">csv</option>
                        <option value="gps">gps</option>
                        <option value="kismet">kismet</option>
                        <option value="netxml">netxml</option>
                        <option value="logcsv">logcsv</option>
                    </select>
                </div>

                <div className="tool-field">
                    <label>Write Interval (--write-interval, seconds)</label>
                    <input
                        type="number"
                        placeholder="(default: 0)"
                        value={writeInterval}
                        onChange={(e) => setWriteInterval(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Update Delay (--update, seconds)</label>
                    <input
                        type="number"
                        placeholder="(default: 1)"
                        value={updateDelay}
                        onChange={(e) => setUpdateDelay(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Berlin Timeout (--berlin, seconds)</label>
                    <input
                        type="number"
                        placeholder="120"
                        value={berlin}
                        onChange={(e) => setBerlin(e.target.value)}
                    />
                    <small>Time before removing AP/client from screen</small>
                </div>
            </div>

            {/* ----- Channel & Band ----- */}
            <h4 style={{ marginTop: "20px", marginBottom: "10px" }}>Channel & Band</h4>
            <div className="tool-form">
                <div className="tool-field">
                    <label>Channel(s) (--channel)</label>
                    <input
                        type="text"
                        placeholder="1,6,11 or 1-11"
                        value={channel}
                        onChange={(e) => setChannel(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Band (--band)</label>
                    <select
                        value={band}
                        onChange={(e) => setBand(e.target.value)}
                    >
                        <option value="bg">bg (2.4 GHz)</option>
                        <option value="a">a (5 GHz)</option>
                        <option value="g">g (2.4 GHz)</option>
                        <option value="n">n (2.4/5 GHz)</option>
                    </select>
                </div>

                <div className="tool-field">
                    <label>Frequencies (-C, MHz)</label>
                    <input
                        type="text"
                        placeholder="2412,2437,2462"
                        value={frequencies}
                        onChange={(e) => setFrequencies(e.target.value)}
                    />
                    <small>Use these frequencies instead of channel hopping</small>
                </div>

                <div className="tool-field">
                    <label>Channel Switching Method (--cswitch)</label>
                    <select
                        value={cswitch}
                        onChange={(e) => setCswitch(e.target.value)}
                    >
                        <option value="0">FIFO (default)</option>
                        <option value="1">Round Robin</option>
                        <option value="2">Hop on last</option>
                    </select>
                </div>
            </div>

            <div className="tool-options">
                <label>
                    <input
                        type="checkbox"
                        checked={ht20}
                        onChange={(e) => setHt20(e.target.checked)}
                    />
                    HT20 (802.11n)
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={ht40minus}
                        onChange={(e) => setHt40minus(e.target.checked)}
                    />
                    HT40- (802.11n)
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={ht40plus}
                        onChange={(e) => setHt40plus(e.target.checked)}
                    />
                    HT40+ (802.11n)
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={ignoreOtherChans}
                        onChange={(e) => setIgnoreOtherChans(e.target.checked)}
                    />
                    Ignore Other Channels (--ignore-other-chans)
                </label>
            </div>

            {/* ----- Filter Options ----- */}
            <h4 style={{ marginTop: "20px", marginBottom: "10px" }}>Filter Options</h4>
            <div className="tool-form">
                <div className="tool-field">
                    <label>Encrypt (--encrypt, comma separated)</label>
                    <input
                        type="text"
                        placeholder="WEP,WPA,WPA2"
                        value={encrypt}
                        onChange={(e) => setEncrypt(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Netmask (--netmask)</label>
                    <input
                        type="text"
                        placeholder="255.255.255.0"
                        value={netmask}
                        onChange={(e) => setNetmask(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>BSSID (--bssid)</label>
                    <input
                        type="text"
                        placeholder="00:11:22:33:44:55"
                        value={bssid}
                        onChange={(e) => setBssid(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>ESSID (--essid)</label>
                    <input
                        type="text"
                        placeholder="MyNetwork"
                        value={essid}
                        onChange={(e) => setEssid(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>ESSID Regex (--essid-regex)</label>
                    <input
                        type="text"
                        placeholder="^My.*"
                        value={essidRegex}
                        onChange={(e) => setEssidRegex(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Min Packets (--min-packets)</label>
                    <input
                        type="number"
                        placeholder="2"
                        value={minPackets}
                        onChange={(e) => setMinPackets(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Min Power (--min-power)</label>
                    <input
                        type="number"
                        placeholder="-120"
                        value={minPower}
                        onChange={(e) => setMinPower(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Min RXQ (--min-rxq)</label>
                    <input
                        type="number"
                        placeholder="0"
                        value={minRxq}
                        onChange={(e) => setMinRxq(e.target.value)}
                    />
                    <small>Requires --channel or -C</small>
                </div>
            </div>

            <div className="tool-options">
                <label>
                    <input
                        type="checkbox"
                        checked={filterUnassociated}
                        onChange={(e) => setFilterUnassociated(e.target.checked)}
                    />
                    Filter Unassociated Stations (-a)
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={filterAssociated}
                        onChange={(e) => setFilterAssociated(e.target.checked)}
                    />
                    Filter Associated Stations (-z)
                </label>
            </div>

            {/* ----- Display Options ----- */}
            <h4 style={{ marginTop: "20px", marginBottom: "10px" }}>Display Options</h4>
            <div className="tool-options">
                <label>
                    <input
                        type="checkbox"
                        checked={ivs}
                        onChange={(e) => setIvs(e.target.checked)}
                    />
                    Save Only IVs (--ivs)
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={gpsd}
                        onChange={(e) => setGpsd(e.target.checked)}
                    />
                    Use GPSd (--gpsd)
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={beacons}
                        onChange={(e) => setBeacons(e.target.checked)}
                    />
                    Record All Beacons (--beacons)
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={showack}
                        onChange={(e) => setShowack(e.target.checked)}
                    />
                    Show ACK/CTS/RTS Stats (--showack)
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={hideKnown}
                        onChange={(e) => setHideKnown(e.target.checked)}
                    />
                    Hide Known Stations (-h) (with --showack)
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={manufacturer}
                        onChange={(e) => setManufacturer(e.target.checked)}
                    />
                    Show Manufacturer (--manufacturer)
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={uptime}
                        onChange={(e) => setUptime(e.target.checked)}
                    />
                    Show AP Uptime (--uptime)
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={wps}
                        onChange={(e) => setWps(e.target.checked)}
                    />
                    Show WPS Info (--wps)
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={ignoreNegativeOne}
                        onChange={(e) => setIgnoreNegativeOne(e.target.checked)}
                    />
                    Ignore -1 Channel Message (--ignore-negative-one)
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={realTime}
                        onChange={(e) => setRealTime(e.target.checked)}
                    />
                    Real-time Simulation (-r with --real-time)
                </label>
            </div>

            {/* ----- Advanced Timing ----- */}
            <h4 style={{ marginTop: "20px", marginBottom: "10px" }}>Advanced Timing</h4>
            <div className="tool-form">
                <div className="tool-field">
                    <label>Hop Time (-f, msecs)</label>
                    <input
                        type="number"
                        placeholder="(default: 250)"
                        value={hopTime}
                        onChange={(e) => setHopTime(e.target.value)}
                    />
                    <small>Time between hopping channels</small>
                </div>

                <div className="tool-field">
                    <label>Active Scanning Simulation (-x, msecs)</label>
                    <input
                        type="number"
                        placeholder="(default: 0)"
                        value={activeScanning}
                        onChange={(e) => setActiveScanning(e.target.value)}
                    />
                </div>
            </div>

            {/* ----- Command & Execution ----- */}
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
                    disabled={isRunning || !command || !interfaceName}
                >
                    {isRunning ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i> Capturing...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-play"></i>Run Cammand
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

            {/* ----- Terminal Output ----- */}
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
                            toolName={tool?.tool_name || "Airodump-ng"}
                            stageCode={stageCode}
                            onAdvanceStage={onAdvanceStage}
                        />
                        <button className="download-btn" onClick={handleDownload}>
                            <i className="fas fa-download"></i> Download TXT
                        </button>
                    </div>
                )}
            </div>

            {/* ----- Download Popup ----- */}
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

export default AirodumpParameters;