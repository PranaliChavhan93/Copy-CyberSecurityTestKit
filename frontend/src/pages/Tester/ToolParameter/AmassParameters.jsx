
import { useState, useRef, useEffect } from "react";

function AmassParameters() {

    const [commandType, setCommandType] = useState("enum");
    const [mode, setMode] = useState("passive");
    const [target, setTarget] = useState("");
    const [optional, setOptional] = useState("");

    const [command, setCommand] = useState("");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [executionStatus, setExecutionStatus] = useState("waiting");

    const terminalRef = useRef(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [output]);

    const generateCommand = () => {
        let cmd = `amass ${commandType}`;

        if (mode && commandType !== "db") {
            cmd += ` -${mode}`;
        }

        if (target) {
            cmd += ` -d ${target}`;
        }

        if (optional) {
            cmd += ` ${optional}`;
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
        setOutput(prev => prev + `\n$ ${cmd}\n`);

        try {
            const response = await fetch("http://127.0.0.1:8000/tools/run/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    command: cmd
                })
            });

            const data = await response.json();

            if (response.ok) {
                setOutput(prev => prev + `\x1b[32m✓ ${data.output || 'Command executed successfully'}\x1b[0m\n`);
                setExecutionStatus("success");
            } else {
                setOutput(prev => prev + `\x1b[31m✗ Error: ${data.message || 'Unknown error'}\x1b[0m\n`);
                setExecutionStatus("error");
            }
        } catch (error) {
            setOutput(prev => prev + `\x1b[31m✗ Error: ${error.message}\x1b[0m\n`);
            setExecutionStatus("error");
        } finally {
            setIsRunning(false);
        }
    };

    const clearTerminal = () => {
        setOutput("");
        setExecutionStatus("waiting");
    };

    useEffect(() => {
        updateCommandPreview();
    }, [commandType, mode, target, optional]);

    const getCommandTypeDisplay = (type) => {
        const types = {
            enum: "Enumeration",
            intel: "Intelligence",
            db: "Database",
            viz: "Visualization",
            track: "Tracking"
        };
        return types[type] || type;
    };

    const getModeDisplay = (mode) => {
        const modes = {
            passive: "Passive",
            active: "Active",
            brute: "Brute Force",
            alts: "Alterations",
            ip: "IP Resolve",
            whois: "WHOIS"
        };
        return modes[mode] || mode;
    };

    return (
        <div className="amass-box">
            <h3>
                {/* <i className="fas fa-cog"></i>  */}
                Amass Configuration
            </h3>

            <div className="amass-form">
                <div className="amass-field">
                    <label>
                        {/* <i className="fas fa-terminal"></i>  */}
                        Command
                    </label>
                    <select
                        value={commandType}
                        onChange={(e) => setCommandType(e.target.value)}
                    >
                        <option value="enum">Enumeration</option>
                        <option value="intel">Intelligence</option>
                        <option value="db">Database</option>
                        <option value="viz">Visualization</option>
                        <option value="track">Tracking</option>
                    </select>
                </div>

                <div className="amass-field">
                    <label>
                        {/* <i className="fas fa-sliders-h"></i>  */}
                        Mode
                    </label>
                    <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                        disabled={commandType === "db"}
                    >
                        <option value="passive">Passive</option>
                        <option value="active">Active</option>
                        <option value="brute">Brute Force</option>
                        <option value="alts">Alterations</option>
                        <option value="ip">IP Resolve</option>
                        <option value="whois">WHOIS</option>
                    </select>
                </div>

                <div className="amass-field">
                    <label>
                        {/* <i className="fas fa-globe"></i>  */}
                        Domain / Target
                    </label>
                    <input
                        placeholder="example.com"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                    />
                </div>

                <div className="amass-field">
                    <label>
                        <i className="fas fa-ellipsis-h"></i> Optional Parameters
                    </label>
                    <input
                        placeholder="-o output.txt"
                        value={optional}
                        onChange={(e) => setOptional(e.target.value)}
                    />
                </div>
            </div>

            <div className="command-area">
                <label>
                    {/* <i className="fas fa-code"></i>  */}
                    Generated Command
                </label>
                <div className="command-preview">
                    {/* <span className="prompt">$</span> */}
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
                <label>
                    <i className="fas fa-window-restore"></i> Output
                    <span style={{
                        fontSize: '11px',
                        color: '#9ca3af',
                        fontWeight: '400',
                        marginLeft: '8px'
                    }}>
                        {executionStatus === 'running' && '(Running...)'}
                        {executionStatus === 'success' && '(Completed ✓)'}
                        {executionStatus === 'error' && '(Failed ✗)'}
                    </span>
                </label>
                <div className="terminal" ref={terminalRef}>
                    <pre>
                        {output || "Waiting for execution..."}
                        {isRunning && <span className="cursor"></span>}
                    </pre>
                </div>
            </div>
        </div>
    );
}

export default AmassParameters;