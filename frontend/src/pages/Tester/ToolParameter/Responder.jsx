import { useState, useRef, useEffect } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";
import "./ToolCommon.css";

function ResponderParameters({
    tool,
    parameters,
    setParameters,
    stageCode,
    onAdvanceStage
}) {
    // Required Options
    const [interface_, setInterface_] = useState("");
    
    // Poisoning Options
    const [analyze, setAnalyze] = useState(false);
    const [externalIP, setExternalIP] = useState("");
    const [externalIP6, setExternalIP6] = useState("");
    const [rdnss, setRdnss] = useState(false);
    const [dnssl, setDnssl] = useState("");
    const [ttl, setTtl] = useState("");
    const [answerName, setAnswerName] = useState("");
    
    // DHCP Options
    const [dhcp, setDhcp] = useState(false);
    const [dhcpDNS, setDhcpDNS] = useState(false);
    const [dhcpv6, setDhcpv6] = useState(false);
    
    // WPAD / Proxy Options
    const [wpad, setWpad] = useState(false);
    const [forceWpadAuth, setForceWpadAuth] = useState(false);
    const [proxyAuth, setProxyAuth] = useState(false);
    const [upstreamProxy, setUpstreamProxy] = useState("");
    
    // Authentication Options
    const [basic, setBasic] = useState(false);
    const [lm, setLm] = useState(false);
    const [disableEss, setDisableEss] = useState(false);
    const [errorCode, setErrorCode] = useState(false);
    
    // Output Options
    const [verbose, setVerbose] = useState(false);
    const [quiet, setQuiet] = useState(false);
    
    // Platform Options
    const [ip, setIp] = useState("");

    const [command, setCommand] = useState("");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [executionStatus, setExecutionStatus] = useState("waiting");

    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("");
    const [outputFile, setOutputFile] = useState("responder_results.txt");

    const terminalRef = useRef(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [output]);

    useEffect(() => {
        updateCommandPreview();
    }, [
        interface_,
        analyze,
        externalIP,
        externalIP6,
        rdnss,
        dnssl,
        ttl,
        answerName,
        dhcp,
        dhcpDNS,
        dhcpv6,
        wpad,
        forceWpadAuth,
        proxyAuth,
        upstreamProxy,
        basic,
        lm,
        disableEss,
        errorCode,
        verbose,
        quiet,
        ip
    ]);

    const generateCommand = () => {
        let cmd = "responder";

        // Required Options
        if (interface_) {
            cmd += ` -I ${interface_}`;
        }

        // Poisoning Options
        if (analyze) {
            cmd += " -A";
        }

        if (externalIP) {
            cmd += ` -e ${externalIP}`;
        }

        if (externalIP6) {
            cmd += ` -6 ${externalIP6}`;
        }

        if (rdnss) {
            cmd += " --rdnss";
        }

        if (dnssl) {
            cmd += ` --dnssl ${dnssl}`;
        }

        if (ttl) {
            cmd += ` -t ${ttl}`;
        }

        if (answerName) {
            cmd += ` -N ${answerName}`;
        }

        // DHCP Options
        if (dhcp) {
            cmd += " -d";
        }

        if (dhcpDNS) {
            cmd += " -D";
        }

        if (dhcpv6) {
            cmd += " --dhcpv6";
        }

        // WPAD / Proxy Options
        if (wpad) {
            cmd += " -w";
        }

        if (forceWpadAuth) {
            cmd += " -F";
        }

        if (proxyAuth) {
            cmd += " -P";
        }

        if (upstreamProxy) {
            cmd += ` -u ${upstreamProxy}`;
        }

        // Authentication Options
        if (basic) {
            cmd += " -b";
        }

        if (lm) {
            cmd += " --lm";
        }

        if (disableEss) {
            cmd += " --disable-ess";
        }

        if (errorCode) {
            cmd += " -E";
        }

        // Output Options
        if (verbose) {
            cmd += " -v";
        }

        if (quiet) {
            cmd += " -Q";
        }

        // Platform Options
        if (ip) {
            cmd += ` -i ${ip}`;
        }

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
                            interface: interface_,
                            analyze,
                            externalIP,
                            externalIP6,
                            rdnss,
                            dnssl,
                            ttl,
                            answerName,
                            dhcp,
                            dhcpDNS,
                            dhcpv6,
                            wpad,
                            forceWpadAuth,
                            proxyAuth,
                            upstreamProxy,
                            basic,
                            lm,
                            disableEss,
                            errorCode,
                            verbose,
                            quiet,
                            ip
                        }
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                setOutput(prev =>
                    prev +
                    `${data.output || "Command executed successfully"}\n`
                );

                setExecutionStatus("success");
            } else {
                setOutput(prev =>
                    prev +
                    `${data.message || "Unknown error"}\n`
                );

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
        if (!filename.endsWith(".txt")) {
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
                outputFile || "responder_results.txt"
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
                interface: interface_,
                analyze,
                externalIP,
                externalIP6,
                rdnss,
                dnssl,
                ttl,
                answerName,
                dhcp,
                dhcpDNS,
                dhcpv6,
                wpad,
                forceWpadAuth,
                proxyAuth,
                upstreamProxy,
                basic,
                lm,
                disableEss,
                errorCode,
                verbose,
                quiet,
                ip,
                command,
                output,
                executionStatus
            });
        }
    };

    return (
        <div className="tool-box">
            <h3>
                Responder Configuration
                {tool && <span className="tool-badge">{tool.tool_name}</span>}
            </h3>

            <div className="tool-form">
                <div className="tool-field">
                    <label>Network Interface</label>
                    <input
                        type="text"
                        placeholder="eth0 or ALL"
                        value={interface_}
                        onChange={(e) => setInterface_(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>External IP (IPv4)</label>
                    <input
                        type="text"
                        placeholder="10.0.0.100"
                        value={externalIP}
                        onChange={(e) => setExternalIP(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>External IP (IPv6)</label>
                    <input
                        type="text"
                        placeholder="2800:ac:4000:8f9e::1"
                        value={externalIP6}
                        onChange={(e) => setExternalIP6(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>DNSSL Domain</label>
                    <input
                        type="text"
                        placeholder="example.com"
                        value={dnssl}
                        onChange={(e) => setDnssl(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>TTL Value (Hex)</label>
                    <input
                        type="text"
                        placeholder="1e or random"
                        value={ttl}
                        onChange={(e) => setTtl(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Answer Name</label>
                    <input
                        type="text"
                        placeholder="canonical.name"
                        value={answerName}
                        onChange={(e) => setAnswerName(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Upstream Proxy</label>
                    <input
                        type="text"
                        placeholder="proxy.host:8080"
                        value={upstreamProxy}
                        onChange={(e) => setUpstreamProxy(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Local IP (OSX only)</label>
                    <input
                        type="text"
                        placeholder="192.168.1.100"
                        value={ip}
                        onChange={(e) => setIp(e.target.value)}
                    />
                </div>
            </div>

            <div className="tool-options">
                <h4 style={{ marginTop: "10px", marginBottom: "10px" }}>Poisoning Options</h4>
                <label>
                    <input
                        type="checkbox"
                        checked={analyze}
                        onChange={(e) => setAnalyze(e.target.checked)}
                    />
                    Analyze Mode (-A) - Passive
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={rdnss}
                        onChange={(e) => setRdnss(e.target.checked)}
                    />
                    RDNSS Poisoning
                </label>
                <label htmlFor=""></label>
            </div>

            <div className="tool-options">
                <h4 style={{ marginTop: "10px", marginBottom: "10px" }}>DHCP Options</h4>
                <label>
                    <input
                        type="checkbox"
                        checked={dhcp}
                        onChange={(e) => setDhcp(e.target.checked)}
                    />
                    DHCPv4 Poisoning (-d)
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={dhcpDNS}
                        onChange={(e) => setDhcpDNS(e.target.checked)}
                    />
                    DHCPv4 DNS Injection (-D)
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={dhcpv6}
                        onChange={(e) => setDhcpv6(e.target.checked)}
                    />
                    DHCPv6 Poisoning
                </label>
            </div>

            <div className="tool-options">
                <h4 style={{ marginTop: "10px", marginBottom: "10px" }}>WPAD / Proxy Options</h4>
                <label>
                    <input
                        type="checkbox"
                        checked={wpad}
                        onChange={(e) => setWpad(e.target.checked)}
                    />
                    WPAD Rogue Proxy (-w)
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={forceWpadAuth}
                        onChange={(e) => setForceWpadAuth(e.target.checked)}
                    />
                    Force WPAD Auth (-F)
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={proxyAuth}
                        onChange={(e) => setProxyAuth(e.target.checked)}
                    />
                    Proxy Authentication (-P)
                </label>
            </div>
            
            <div className="tool-options">
                <h4 style={{ marginTop: "10px", marginBottom: "10px" }}>Authentication Options</h4>
                <label>
                    <input
                        type="checkbox"
                        checked={basic}
                        onChange={(e) => setBasic(e.target.checked)}
                    />
                    HTTP Basic Auth (-b)
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={lm}
                        onChange={(e) => setLm(e.target.checked)}
                    />
                    Force LM Hashing (--lm)
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={disableEss}
                        onChange={(e) => setDisableEss(e.target.checked)}
                    />
                    Disable ESS (--disable-ess)
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={errorCode}
                        onChange={(e) => setErrorCode(e.target.checked)}
                    />
                    STATUS_LOGON_FAILURE (-E)
                </label>
            </div>

            <div className="tool-options">
                <h4 style={{ marginTop: "10px", marginBottom: "10px" }}>Output Options</h4>
                <label>
                    <input
                        type="checkbox"
                        checked={verbose}
                        onChange={(e) => setVerbose(e.target.checked)}
                    />
                    Verbose Output (-v)
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={quiet}
                        onChange={(e) => setQuiet(e.target.checked)}
                    />
                    Quiet Mode (-Q)
                </label>
                <label htmlFor=""></label>

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
                    className={`run-btn ${isRunning ? 'running' : ''}`}
                    onClick={runCommand}
                    disabled={isRunning || !command || !interface_}
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
                            toolName={tool?.tool_name || "Responder"}
                            stageCode={stageCode}
                            onAdvanceStage={onAdvanceStage}
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

            {showPopup && (
                <div className="popup-overlay" onClick={handlePopupCancel}>
                    <div className="popup-box confirm-popup" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            <i className="fas fa-download"></i>
                            {" "}Download File
                        </h3>

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

export default ResponderParameters;