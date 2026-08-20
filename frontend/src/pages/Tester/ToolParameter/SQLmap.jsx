import { useState, useRef, useEffect } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";
import "./ToolCommon.css";

function SQLmapParameters({
    tool,
    parameters,
    setParameters,
    stageCode,
    onAdvanceStage
}) {
    // Target options
    const [url, setUrl] = useState("");
    const [googleDork, setGoogleDork] = useState("");
    const [data, setData] = useState("");
    const [cookie, setCookie] = useState("");
    const [randomAgent, setRandomAgent] = useState(false);
    const [proxy, setProxy] = useState("");
    const [tor, setTor] = useState(false);
    const [checkTor, setCheckTor] = useState(false);

    // Injection options
    const [testParameter, setTestParameter] = useState("");
    const [dbms, setDbms] = useState("");

    // Detection options
    const [level, setLevel] = useState("1");
    const [risk, setRisk] = useState("1");

    // Techniques options
    const [technique, setTechnique] = useState("BEUSTQ");

    // Enumeration options
    const [all, setAll] = useState(false);
    const [banner, setBanner] = useState(false);
    const [currentUser, setCurrentUser] = useState(false);
    const [currentDb, setCurrentDb] = useState(false);
    const [passwords, setPasswords] = useState(false);
    const [dbs, setDbs] = useState(false);
    const [tables, setTables] = useState(false);
    const [columns, setColumns] = useState(false);
    const [schema, setSchema] = useState(false);
    const [dump, setDump] = useState(false);
    const [dumpAll, setDumpAll] = useState(false);
    const [database, setDatabase] = useState("");
    const [table, setTable] = useState("");
    const [column, setColumn] = useState("");

    // OS access options
    const [osShell, setOsShell] = useState(false);
    const [osPwn, setOsPwn] = useState(false);

    // General options
    const [batch, setBatch] = useState(false);
    const [flushSession, setFlushSession] = useState(false);

    // Misc options
    const [wizard, setWizard] = useState(false);
    const [verbosity, setVerbosity] = useState("1");

    const [command, setCommand] = useState("");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [executionStatus, setExecutionStatus] = useState("waiting");

    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("");
    const [outputFile, setOutputFile] = useState("sqlmap_results.txt");

    const terminalRef = useRef(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [output]);

    useEffect(() => {
        updateCommandPreview();
    }, [
        url,
        googleDork,
        data,
        cookie,
        randomAgent,
        proxy,
        tor,
        checkTor,
        testParameter,
        dbms,
        level,
        risk,
        technique,
        all,
        banner,
        currentUser,
        currentDb,
        passwords,
        dbs,
        tables,
        columns,
        schema,
        dump,
        dumpAll,
        database,
        table,
        column,
        osShell,
        osPwn,
        batch,
        flushSession,
        wizard,
        verbosity
    ]);

    const generateCommand = () => {
        let cmd = "sqlmap";

        // Target options
        if (url) {
            cmd += ` -u "${url}"`;
        }

        if (googleDork) {
            cmd += ` -g "${googleDork}"`;
        }

        // Request options
        if (data) {
            cmd += ` --data "${data}"`;
        }

        if (cookie) {
            cmd += ` --cookie "${cookie}"`;
        }

        if (randomAgent) {
            cmd += " --random-agent";
        }

        if (proxy) {
            cmd += ` --proxy ${proxy}`;
        }

        if (tor) {
            cmd += " --tor";
        }

        if (checkTor) {
            cmd += " --check-tor";
        }

        // Injection options
        if (testParameter) {
            cmd += ` -p ${testParameter}`;
        }

        if (dbms) {
            cmd += ` --dbms ${dbms}`;
        }

        // Detection options
        if (level !== "1") {
            cmd += ` --level ${level}`;
        }

        if (risk !== "1") {
            cmd += ` --risk ${risk}`;
        }

        // Techniques options
        if (technique !== "BEUSTQ") {
            cmd += ` --technique ${technique}`;
        }

        // Enumeration options
        if (all) {
            cmd += " -a";
        }

        if (banner) {
            cmd += " -b";
        }

        if (currentUser) {
            cmd += " --current-user";
        }

        if (currentDb) {
            cmd += " --current-db";
        }

        if (passwords) {
            cmd += " --passwords";
        }

        if (dbs) {
            cmd += " --dbs";
        }

        if (tables) {
            cmd += " --tables";
        }

        if (columns) {
            cmd += " --columns";
        }

        if (schema) {
            cmd += " --schema";
        }

        if (dump) {
            cmd += " --dump";
        }

        if (dumpAll) {
            cmd += " --dump-all";
        }

        if (database) {
            cmd += ` -D ${database}`;
        }

        if (table) {
            cmd += ` -T ${table}`;
        }

        if (column) {
            cmd += ` -C ${column}`;
        }

        // OS access options
        if (osShell) {
            cmd += " --os-shell";
        }

        if (osPwn) {
            cmd += " --os-pwn";
        }

        // General options
        if (batch) {
            cmd += " --batch";
        }

        if (flushSession) {
            cmd += " --flush-session";
        }

        // Misc options
        if (wizard) {
            cmd += " --wizard";
        }

        if (verbosity !== "1") {
            cmd += ` -v ${verbosity}`;
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
                            url,
                            googleDork,
                            data,
                            cookie,
                            randomAgent,
                            proxy,
                            tor,
                            checkTor,
                            testParameter,
                            dbms,
                            level,
                            risk,
                            technique,
                            all,
                            banner,
                            currentUser,
                            currentDb,
                            passwords,
                            dbs,
                            tables,
                            columns,
                            schema,
                            dump,
                            dumpAll,
                            database,
                            table,
                            column,
                            osShell,
                            osPwn,
                            batch,
                            flushSession,
                            wizard,
                            verbosity
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
                outputFile || "sqlmap_results.txt"
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
                url,
                googleDork,
                data,
                cookie,
                randomAgent,
                proxy,
                tor,
                checkTor,
                testParameter,
                dbms,
                level,
                risk,
                technique,
                all,
                banner,
                currentUser,
                currentDb,
                passwords,
                dbs,
                tables,
                columns,
                schema,
                dump,
                dumpAll,
                database,
                table,
                column,
                osShell,
                osPwn,
                batch,
                flushSession,
                wizard,
                verbosity,
                command,
                output,
                executionStatus
            });
        }
    };

    return (
        <div className="tool-box">
            <h3>
                SQLmap Configuration
                {tool && <span className="tool-badge">{tool.tool_name}</span>}
            </h3>

            <div className="tool-form">
                <div className="tool-field">
                    <label>Target URL</label>
                    <input
                        type="text"
                        placeholder="http://www.site.com/vuln.php?id=1"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Google Dork</label>
                    <input
                        type="text"
                        placeholder="inurl:index.php?id="
                        value={googleDork}
                        onChange={(e) => setGoogleDork(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>POST Data</label>
                    <input
                        type="text"
                        placeholder="id=1&name=admin"
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Cookie</label>
                    <input
                        type="text"
                        placeholder="PHPSESSID=a8d127e.."
                        value={cookie}
                        onChange={(e) => setCookie(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Proxy</label>
                    <input
                        type="text"
                        placeholder="http://127.0.0.1:8080"
                        value={proxy}
                        onChange={(e) => setProxy(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Test Parameter</label>
                    <input
                        type="text"
                        placeholder="id"
                        value={testParameter}
                        onChange={(e) => setTestParameter(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>DBMS</label>
                    <input
                        type="text"
                        placeholder="mysql, postgresql, oracle, mssql"
                        value={dbms}
                        onChange={(e) => setDbms(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Level</label>
                    <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                    >
                        <option value="1">1 - Basic</option>
                        <option value="2">2 - Extended</option>
                        <option value="3">3 - Deep</option>
                        <option value="4">4 - Very Deep</option>
                        <option value="5">5 - Maximum</option>
                    </select>
                </div>

                <div className="tool-field">
                    <label>Risk</label>
                    <select
                        value={risk}
                        onChange={(e) => setRisk(e.target.value)}
                    >
                        <option value="1">1 - Low</option>
                        <option value="2">2 - Medium</option>
                        <option value="3">3 - High</option>
                    </select>
                </div>

                <div className="tool-field">
                    <label>Verbosity Level</label>
                    <select
                        value={verbosity}
                        onChange={(e) => setVerbosity(e.target.value)}
                    >
                        <option value="0">0 - Silent</option>
                        <option value="1">1 - Normal</option>
                        <option value="2">2 - Verbose</option>
                        <option value="3">3 - More Verbose</option>
                        <option value="4">4 - Debug</option>
                        <option value="5">5 - More Debug</option>
                        <option value="6">6 - Full Debug</option>
                    </select>
                </div>

                <div className="tool-field">
                    <label>Techniques</label>
                    <select
                        value={technique}
                        onChange={(e) => setTechnique(e.target.value)}
                    >
                        <option value="BEUSTQ">All - BEUSTQ</option>
                        <option value="B">Boolean-based blind</option>
                        <option value="E">Error-based</option>
                        <option value="U">Union query</option>
                        <option value="S">Stacked queries</option>
                        <option value="T">Time-based blind</option>
                        <option value="Q">Inline queries</option>
                    </select>
                </div>

                <div className="tool-field">
                    <label>Database (-D)</label>
                    <input
                        type="text"
                        placeholder="database_name"
                        value={database}
                        onChange={(e) => setDatabase(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Table (-T)</label>
                    <input
                        type="text"
                        placeholder="table_name"
                        value={table}
                        onChange={(e) => setTable(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Column (-C)</label>
                    <input
                        type="text"
                        placeholder="column1,column2"
                        value={column}
                        onChange={(e) => setColumn(e.target.value)}
                    />
                </div>
            </div>

            <div className="tool-options">
                <label>
                    <input
                        type="checkbox"
                        checked={randomAgent}
                        onChange={(e) => setRandomAgent(e.target.checked)}
                    />
                    Random Agent
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={tor}
                        onChange={(e) => setTor(e.target.checked)}
                    />
                    Use Tor
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={checkTor}
                        onChange={(e) => setCheckTor(e.target.checked)}
                    />
                    Check Tor
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={batch}
                        onChange={(e) => setBatch(e.target.checked)}
                    />
                    Batch Mode
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={flushSession}
                        onChange={(e) => setFlushSession(e.target.checked)}
                    />
                    Flush Session
                </label>
            </div>

            <h4 style={{ marginTop: "20px", marginBottom: "10px" }}>Enumeration Options</h4>
            <div className="tool-options">
                <label>
                    <input
                        type="checkbox"
                        checked={all}
                        onChange={(e) => setAll(e.target.checked)}
                    />
                    Retrieve Everything (-a)
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={banner}
                        onChange={(e) => setBanner(e.target.checked)}
                    />
                    DBMS Banner (-b)
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={currentUser}
                        onChange={(e) => setCurrentUser(e.target.checked)}
                    />
                    Current User
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={currentDb}
                        onChange={(e) => setCurrentDb(e.target.checked)}
                    />
                    Current Database
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={passwords}
                        onChange={(e) => setPasswords(e.target.checked)}
                    />
                    Enumerate Passwords
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={dbs}
                        onChange={(e) => setDbs(e.target.checked)}
                    />
                    Enumerate Databases
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={tables}
                        onChange={(e) => setTables(e.target.checked)}
                    />
                    Enumerate Tables
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={columns}
                        onChange={(e) => setColumns(e.target.checked)}
                    />
                    Enumerate Columns
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={schema}
                        onChange={(e) => setSchema(e.target.checked)}
                    />
                    Enumerate Schema
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={dump}
                        onChange={(e) => setDump(e.target.checked)}
                    />
                    Dump Table Data
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={dumpAll}
                        onChange={(e) => setDumpAll(e.target.checked)}
                    />
                    Dump All Databases
                </label>
            </div>

            {/* <h4 style={{ marginTop: "20px", marginBottom: "10px" }}>OS Access Options</h4> */}
            <div className="tool-options">
            <h4 style={{ marginTop: "20px", marginBottom: "10px" }}>OS Access Options</h4>
                <label>
                    <input
                        type="checkbox"
                        checked={osShell}
                        onChange={(e) => setOsShell(e.target.checked)}
                    />
                    OS Shell
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={osPwn}
                        onChange={(e) => setOsPwn(e.target.checked)}
                    />
                    OS Pwn (Meterpreter/VNC)
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={wizard}
                        onChange={(e) => setWizard(e.target.checked)}
                    />
                    Wizard Mode
                </label>
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
                    disabled={isRunning || !command || (!url && !googleDork)}
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
                            toolName={tool?.tool_name || "SQLmap"}
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
                            <small>The output will be saved as a text file.</small>
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

export default SQLmapParameters;