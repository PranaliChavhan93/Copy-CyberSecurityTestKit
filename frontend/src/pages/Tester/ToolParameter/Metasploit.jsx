import { useState, useRef, useEffect } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";
import "./ToolCommon.css";

function MetasploitParameters({ tool, parameters, setParameters, stageCode, onAdvanceStage }) {
    const [commandType, setCommandType] = useState("msfconsole");
    const [subCommand, setSubCommand] = useState("");
    const [target, setTarget] = useState("");
    const [optional, setOptional] = useState("");
    const [payload, setPayload] = useState("");
    const [lhost, setLhost] = useState("");
    const [lport, setLport] = useState("");
    const [format, setFormat] = useState("exe");
    const [outputFile, setOutputFile] = useState("metasploit_results.txt");

    const [command, setCommand] = useState("");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [executionStatus, setExecutionStatus] = useState("waiting");

    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const terminalRef = useRef(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [output]);

    useEffect(() => {
        updateCommandPreview();
    }, [commandType, subCommand, target, optional, payload, lhost, lport, format, outputFile]);

    const generateCommand = () => {
        let cmd = "";

        switch (commandType) {
            case "msfconsole":
                cmd = "msfconsole";
                if (subCommand) {
                    cmd += ` ${subCommand}`;
                }
                if (target) {
                    cmd += ` -x "use ${target}"`;
                }
                if (optional) {
                    cmd += ` ${optional}`;
                }
                break;

            case "msfvenom":
                cmd = "msfvenom";
                if (payload) {
                    cmd += ` -p ${payload}`;
                }
                if (lhost) {
                    cmd += ` LHOST=${lhost}`;
                }
                if (lport) {
                    cmd += ` LPORT=${lport}`;
                }
                if (format) {
                    cmd += ` -f ${format}`;
                }
                if (outputFile) {
                    cmd += ` -o ${outputFile}`;
                }
                if (target) {
                    cmd += ` ${target}`;
                }
                if (optional) {
                    cmd += ` ${optional}`;
                }
                break;

            case "msfrpcd":
                cmd = "msfrpcd";
                if (target) {
                    cmd += ` -a ${target}`;
                }
                if (subCommand) {
                    cmd += ` -p ${subCommand}`;
                }
                if (optional) {
                    cmd += ` ${optional}`;
                }
                break;

            case "msfrpc":
                cmd = "msfrpc";
                if (target) {
                    cmd += ` -a ${target}`;
                }
                if (subCommand) {
                    cmd += ` -p ${subCommand}`;
                }
                if (optional) {
                    cmd += ` ${optional}`;
                }
                break;

            case "msfdb":
                cmd = "msfdb";
                if (subCommand) {
                    cmd += ` ${subCommand}`;
                }
                if (optional) {
                    cmd += ` ${optional}`;
                }
                break;

            case "msf-egghunter":
                cmd = "msf-egghunter";
                if (target) {
                    cmd += ` -e ${target}`;
                }
                if (format) {
                    cmd += ` -f ${format}`;
                }
                if (optional) {
                    cmd += ` ${optional}`;
                }
                break;

            case "msf-pattern_create":
                cmd = "msf-pattern_create";
                if (target) {
                    cmd += ` -l ${target}`;
                }
                if (optional) {
                    cmd += ` ${optional}`;
                }
                break;

            case "msf-pattern_offset":
                cmd = "msf-pattern_offset";
                if (target) {
                    cmd += ` -q ${target}`;
                }
                if (optional) {
                    cmd += ` ${optional}`;
                }
                break;

            case "msf-nasm_shell":
                cmd = "msf-nasm_shell";
                if (target) {
                    cmd += ` ${target}`;
                }
                if (optional) {
                    cmd += ` ${optional}`;
                }
                break;

            case "msfd":
                cmd = "msfd";
                if (target) {
                    cmd += ` -a ${target}`;
                }
                if (subCommand) {
                    cmd += ` -p ${subCommand}`;
                }
                if (optional) {
                    cmd += ` ${optional}`;
                }
                break;

            case "msfupdate":
                cmd = "msfupdate";
                if (optional) {
                    cmd += ` ${optional}`;
                }
                break;

            case "msf-virustotal":
                cmd = "msf-virustotal";
                if (target) {
                    cmd += ` -f ${target}`;
                }
                if (optional) {
                    cmd += ` ${optional}`;
                }
                break;

            case "msf-jsobfu":
                cmd = "msf-jsobfu";
                if (target) {
                    cmd += ` -i ${target}`;
                }
                if (outputFile) {
                    cmd += ` -o ${outputFile}`;
                }
                if (optional) {
                    cmd += ` ${optional}`;
                }
                break;

            case "msf-md5_lookup":
                cmd = "msf-md5_lookup";
                if (target) {
                    cmd += ` -i ${target}`;
                }
                if (optional) {
                    cmd += ` ${optional}`;
                }
                break;

            case "msf-exe2vba":
                cmd = "msf-exe2vba";
                if (target) {
                    cmd += ` ${target}`;
                }
                if (outputFile) {
                    cmd += ` ${outputFile}`;
                }
                if (optional) {
                    cmd += ` ${optional}`;
                }
                break;

            case "msf-exe2vbs":
                cmd = "msf-exe2vbs";
                if (target) {
                    cmd += ` ${target}`;
                }
                if (outputFile) {
                    cmd += ` ${outputFile}`;
                }
                if (optional) {
                    cmd += ` ${optional}`;
                }
                break;

            default:
                cmd = "msfconsole";
                if (optional) {
                    cmd += ` ${optional}`;
                }
        }

        return cmd;
    };

    const updateCommandPreview = () => {
        const cmd = generateCommand();
        setCommand(cmd);
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
                    "Authorization": `Bearer ${sessionStorage.getItem("access")}`
                },
                body: JSON.stringify({
                    command: cmd,
                    tool_id: tool?.id || null,
                    parameters: {
                        commandType,
                        subCommand,
                        target,
                        optional,
                        payload,
                        lhost,
                        lport,
                        format,
                        outputFile
                    }
                })
            });

            const data = await response.json();

            if (response.ok) {
                setOutput(prev => prev + `${data.output || 'Command executed successfully'}\n`);
                setExecutionStatus("success");
            } else {
                setOutput(prev => prev + `${data.message || 'Unknown error'}\n`);
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

    const handlePopupConfirm = async () => {
        if (popupType === "download") {
            downloadTxtFile(output, outputFile || "metasploit_results.txt");
            setShowPopup(false);
            setPopupType("");
        }
    };

    const handlePopupCancel = () => {
        setShowPopup(false);
        setPopupType("");
    };

    const renderCommandSpecificFields = () => {
        switch (commandType) {
            case "msfconsole":
                return (
                    <>
                        <div className="tool-field">
                            <label>Sub-command</label>
                            <select
                                value={subCommand}
                                onChange={(e) => setSubCommand(e.target.value)}
                            >
                                <option value="">None</option>
                                <option value="-q">Quiet Mode</option>
                                <option value="-x">Execute Command</option>
                                <option value="-r">Resource File</option>
                                <option value="-p">Plugin</option>
                            </select>
                        </div>
                        <div className="tool-field">
                            <label>Module</label>
                            <input
                                placeholder="exploit/windows/smb/ms17_010_eternalblue"
                                value={target}
                                onChange={(e) => setTarget(e.target.value)}
                            />
                        </div>
                    </>
                );

            case "msfvenom":
                return (
                    <>
                        <div className="tool-field">
                            <label>Payload</label>
                            <select
                                value={payload}
                                onChange={(e) => setPayload(e.target.value)}
                            >
                                <option value="">Select Payload</option>
                                <option value="windows/meterpreter/reverse_tcp">Windows Meterpreter Reverse TCP</option>
                                <option value="windows/meterpreter/reverse_https">Windows Meterpreter Reverse HTTPS</option>
                                <option value="linux/x86/meterpreter/reverse_tcp">Linux Meterpreter Reverse TCP</option>
                                <option value="android/meterpreter/reverse_tcp">Android Meterpreter Reverse TCP</option>
                                <option value="java/meterpreter/reverse_tcp">Java Meterpreter Reverse TCP</option>
                                <option value="osx/x64/meterpreter/reverse_tcp">OSX Meterpreter Reverse TCP</option>
                                <option value="python/meterpreter/reverse_tcp">Python Meterpreter Reverse TCP</option>
                            </select>
                        </div>
                        <div className="tool-field">
                            <label>LHOST</label>
                            <input
                                placeholder="192.168.1.100"
                                value={lhost}
                                onChange={(e) => setLhost(e.target.value)}
                            />
                        </div>
                        <div className="tool-field">
                            <label>LPORT</label>
                            <input
                                placeholder="4444"
                                value={lport}
                                onChange={(e) => setLport(e.target.value)}
                            />
                        </div>
                        <div className="tool-field">
                            <label>Format</label>
                            <select
                                value={format}
                                onChange={(e) => setFormat(e.target.value)}
                            >
                                <option value="exe">Executable (exe)</option>
                                <option value="raw">Raw</option>
                                <option value="python">Python</option>
                                <option value="c">C</option>
                                <option value="csharp">C#</option>
                                <option value="psh">PowerShell</option>
                                <option value="vba">VBA</option>
                                <option value="hex">Hex</option>
                                <option value="js_le">JavaScript (Little Endian)</option>
                                <option value="js_be">JavaScript (Big Endian)</option>
                            </select>
                        </div>
                        <div className="tool-field">
                            <label>Output File</label>
                            <input
                                placeholder="payload.exe"
                                value={outputFile}
                                onChange={(e) => setOutputFile(e.target.value)}
                            />
                        </div>
                        <div className="tool-field">
                            <label>Additional Options</label>
                            <input
                                placeholder="-e x86/shikata_ga_nai -i 5"
                                value={optional}
                                onChange={(e) => setOptional(e.target.value)}
                            />
                        </div>
                    </>
                );

            // ... (rest of renderCommandSpecificFields remains the same but with tool-field class)
            default:
                return (
                    <>
                        <div className="tool-field">
                            <label>Command</label>
                            <input
                                placeholder="Enter command parameters..."
                                value={target}
                                onChange={(e) => setTarget(e.target.value)}
                            />
                        </div>
                        <div className="tool-field">
                            <label>Additional Options</label>
                            <input
                                placeholder="-h"
                                value={optional}
                                onChange={(e) => setOptional(e.target.value)}
                            />
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="tool-box">
            <h3>
                Metasploit Configuration
                {tool && <span className="tool-badge">{tool.tool_name}</span>}
            </h3>

            <div className="tool-form">
                <div className="tool-field">
                    <label>Command</label>
                    <select
                        value={commandType}
                        onChange={(e) => {
                            setCommandType(e.target.value);
                            setSubCommand("");
                            setTarget("");
                            setOptional("");
                            setPayload("");
                            setLhost("");
                            setLport("");
                            setFormat("exe");
                            setOutputFile("metasploit_results.txt");
                        }}
                    >
                        <optgroup label="Main Tools">
                            <option value="msfconsole">msfconsole - Main Console</option>
                            <option value="msfvenom">msfvenom - Payload Generator</option>
                            <option value="msfrpc">msfrpc - RPC Client</option>
                            <option value="msfrpcd">msfrpcd - RPC Daemon</option>
                            <option value="msfd">msfd - Multi-User Daemon</option>
                        </optgroup>
                        <optgroup label="Database">
                            <option value="msfdb">msfdb - Database Management</option>
                        </optgroup>
                        <optgroup label="Development Tools">
                            <option value="msf-egghunter">msf-egghunter - Egg Hunter</option>
                            <option value="msf-nasm_shell">msf-nasm_shell - NASM Shell</option>
                            <option value="msf-pattern_create">msf-pattern_create - Pattern Creator</option>
                            <option value="msf-pattern_offset">msf-pattern_offset - Pattern Locator</option>
                            <option value="msf-jsobfu">msf-jsobfu - JavaScript Obfuscator</option>
                            <option value="msf-metasm_shell">msf-metasm_shell - Metasm Shell</option>
                        </optgroup>
                        <optgroup label="Conversion Tools">
                            <option value="msf-exe2vba">msf-exe2vba - EXE to VBA</option>
                            <option value="msf-exe2vbs">msf-exe2vbs - EXE to VBS</option>
                            <option value="msf-pdf2xdp">msf-pdf2xdp - PDF to XDP</option>
                        </optgroup>
                        <optgroup label="Analysis Tools">
                            <option value="msf-virustotal">msf-virustotal - VirusTotal Lookup</option>
                            <option value="msf-md5_lookup">msf-md5_lookup - MD5 Lookup</option>
                            <option value="msf-find_badchars">msf-find_badchars - Bad Character Finder</option>
                            <option value="msf-halflm_second">msf-halflm_second - HalfLM Second</option>
                            <option value="msf-hmac_sha1_crack">msf-hmac_sha1_crack - HMAC-SHA1 Cracker</option>
                            <option value="msf-java_deserializer">msf-java_deserializer - Java Deserializer</option>
                        </optgroup>
                        <optgroup label="Other Tools">
                            <option value="msfupdate">msfupdate - Update Tool</option>
                            <option value="msf-makeiplist">msf-makeiplist - IP List Creator</option>
                            <option value="msf-msf_irb_shell">msf-msf_irb_shell - IRB Shell</option>
                        </optgroup>
                    </select>
                </div>

                {renderCommandSpecificFields()}
            </div>

            <div className="command-area">
                <label>Generated Command</label>
                <div className="command-preview">
                    <span className="command-text">{command || "Command..."}</span>
                </div>
                <br />

                <button
                    className={`run-btn ${isRunning ? 'running' : ''}`}
                    onClick={runCommand}
                    disabled={isRunning || !command}
                >
                    {isRunning ? (
                        <><i className="fas fa-spinner fa-spin"></i> Running...</>
                    ) : (
                        <><i className="fas fa-play"></i> Run Command</>
                    )}
                </button>

                {output && (
                    <button
                        className="run-btn"
                        style={{
                            background: '#6b7a9a',
                            marginLeft: '10px',
                            padding: '12px 20px'
                        }}
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
                            toolName={tool?.tool_name || "Metasploit"}
                            stageCode={stageCode}
                            onAdvanceStage={onAdvanceStage}
                        />
                        <button 
                            className="download-btn"
                            onClick={handleDownload}
                        >
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

export default MetasploitParameters;