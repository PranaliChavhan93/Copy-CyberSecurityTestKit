import { useState, useRef, useEffect } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";
import "./ToolCommon.css";

function RopperParameters({
    tool,
    parameters,
    setParameters,
    stageCode,
    onAdvanceStage
}) {
    const [file, setFile] = useState("");
    const [arch, setArch] = useState("");
    const [raw, setRaw] = useState(false);
    const [imagebase, setImagebase] = useState("");
    const [badbytes, setBadbytes] = useState("");

    const [info, setInfo] = useState(false);
    const [entrypoint, setEntrypoint] = useState(false);
    const [imagebaseFlag, setImagebaseFlag] = useState(false);
    const [sections, setSections] = useState(false);
    const [segments, setSegments] = useState(false);
    const [imports, setImports] = useState(false);
    const [symbols, setSymbols] = useState(false);
    const [dllcharacteristics, setDllcharacteristics] = useState(false);

    const [instCount, setInstCount] = useState("6");
    const [search, setSearch] = useState("");
    const [opcode, setOpcode] = useState("");
    const [instructions, setInstructions] = useState("");
    const [type, setType] = useState("all");
    const [detailed, setDetailed] = useState(false);
    const [allGadgets, setAllGadgets] = useState(false);
    const [cfgOnly, setCfgOnly] = useState(false);
    const [quality, setQuality] = useState("");
    const [ppr, setPpr] = useState(false);
    const [jmp, setJmp] = useState("");
    const [stackPivot, setStackPivot] = useState(false);
    const [stringSearch, setStringSearch] = useState("");
    const [hex, setHex] = useState(false);

    const [chain, setChain] = useState("");
    const [chainParams, setChainParams] = useState("");

    const [consoleMode, setConsoleMode] = useState(false);
    const [noLoad, setNoLoad] = useState(false);
    const [clearCache, setClearCache] = useState(false);
    const [nocolor, setNocolor] = useState(false);

    const [command, setCommand] = useState("");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [executionStatus, setExecutionStatus] = useState("waiting");

    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("");
    const [outputFile, setOutputFile] = useState("ropper_results.txt");

    const terminalRef = useRef(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [output]);

    useEffect(() => {
        updateCommandPreview();
    }, [
        file, arch, raw, imagebase, badbytes,
        info, entrypoint, imagebaseFlag, sections, segments,
        imports, symbols, dllcharacteristics,
        instCount, search, opcode, instructions, type, detailed,
        allGadgets, cfgOnly, quality, ppr, jmp, stackPivot,
        stringSearch, hex,
        chain, chainParams,
        consoleMode, noLoad, clearCache, nocolor
    ]);

    const generateCommand = () => {
        let cmd = "ropper";

        if (file) { 
            cmd += ` -f ${file}`; 
        }

        if (arch) { 
            cmd += ` -a ${arch}`; 
        }

        if (raw) {
            cmd += " -r";
        }

        if (imagebase) {
            cmd += ` -I ${imagebase}`;
        }

        if (badbytes) {
            cmd += ` -b ${badbytes}`;
        }

        if (info) cmd += " -i";
        if (entrypoint) cmd += " -e";
        if (imagebaseFlag) cmd += " --imagebase";
        if (sections) cmd += " -s";
        if (segments) cmd += " -S";
        if (imports) cmd += " --imports";
        if (symbols) cmd += " --symbols";
        if (dllcharacteristics) cmd += " -c";

        if (stringSearch) {
            cmd += ` --string "${stringSearch}"`;
        }

        if (hex) {
            cmd += " --hex";
        }

        if (search) {
            cmd += ` --search "${search}"`;
        }

        if (opcode) {
            cmd += ` --opcode ${opcode}`;
        }

        if (instructions) {
            cmd += ` --instructions "${instructions}"`;
        }

        if (type && type !== "all") {
            cmd += ` --type ${type}`;
        }

        if (detailed) cmd += " --detailed";
        if (allGadgets) cmd += " --all";
        if (cfgOnly) cmd += " --cfg-only";

        if (instCount && instCount !== "6") {
            cmd += ` --inst-count ${instCount}`;
        }

        if (quality) {
            cmd += ` --quality ${quality}`;
        }

        if (ppr) cmd += " -p";

        if (jmp) {
            cmd += ` -j ${jmp}`;
        }

        if (stackPivot) cmd += " --stack-pivot";

        if (chain) {
            let chainStr = ` --chain ${chain}`;
            if (chainParams) {
                chainStr += ` ${chainParams}`;
            }
            cmd += chainStr;
        }

        if (consoleMode) cmd += " --console";
        if (noLoad) cmd += " --no-load";
        if (clearCache) cmd += " --clear-cache";
        if (nocolor) cmd += " --nocolor";

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
                            file, arch, raw, imagebase, badbytes,
                            info, entrypoint, imagebaseFlag, sections, segments,
                            imports, symbols, dllcharacteristics,
                            instCount, search, opcode, instructions, type, detailed,
                            allGadgets, cfgOnly, quality, ppr, jmp, stackPivot,
                            stringSearch, hex,
                            chain, chainParams,
                            consoleMode, noLoad, clearCache, nocolor
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
            downloadTxtFile(output, outputFile || "ropper_results.txt");
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
                file, arch, raw, imagebase, badbytes,
                info, entrypoint, imagebaseFlag, sections, segments,
                imports, symbols, dllcharacteristics,
                instCount, search, opcode, instructions, type, detailed,
                allGadgets, cfgOnly, quality, ppr, jmp, stackPivot,
                stringSearch, hex,
                chain, chainParams,
                consoleMode, noLoad, clearCache, nocolor,
                command, output, executionStatus
            });
        }
    };

    return (
        <div className="tool-box">
            <h3> Ropper Configuration
                {tool && <span className="tool-badge">{tool.tool_name}</span>}
            </h3>

            <div className="tool-form">
                <div className="tool-field">
                    <label>Target File (-f)</label>
                    <input
                        type="text"
                        placeholder="/path/to/binary"
                        value={file}
                        onChange={(e) => setFile(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Architecture (-a)</label>
                    <select
                        value={arch}
                        onChange={(e) => setArch(e.target.value)}
                    >
                        <option value="">(auto-detect)</option>
                        <option value="x86">x86</option>
                        <option value="x86_64">x86_64</option>
                        <option value="ARM">ARM</option>
                        <option value="ARMTHUMB">ARM/Thumb</option>
                        <option value="ARM64">ARM64</option>
                        <option value="MIPS">MIPS</option>
                        <option value="MIPS64">MIPS64</option>
                        <option value="PPC">PowerPC</option>
                        <option value="PPC64">PowerPC64</option>
                        <option value="SPARC64">SPARC64</option>
                    </select>
                </div>

                <div className="tool-field">
                    <label>Image Base (-I)</label>
                    <input
                        type="text"
                        placeholder="0x400000"
                        value={imagebase}
                        onChange={(e) => setImagebase(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Bad Bytes (-b)</label>
                    <input
                        type="text"
                        placeholder="0x00,0x0a"
                        value={badbytes}
                        onChange={(e) => setBadbytes(e.target.value)}
                    />
                </div>
            </div>

            <div className="tool-options">
                <label>
                    <input
                        type="checkbox"
                        checked={raw}
                        onChange={(e) => setRaw(e.target.checked)}
                    />
                    Raw file (-r)
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={nocolor}
                        onChange={(e) => setNocolor(e.target.checked)}
                    />
                    No color (--nocolor)
                </label>
            </div>

            <h4 style={{ marginTop: "20px", marginBottom: "10px" }}>Display Information</h4>
            <div className="tool-options">
                <label>
                    <input
                        type="checkbox"
                        checked={info}
                        onChange={(e) => setInfo(e.target.checked)}
                    />
                    File Header (-i)
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={entrypoint}
                        onChange={(e) => setEntrypoint(e.target.checked)}
                    />
                    Entry Point (-e)
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={imagebaseFlag}
                        onChange={(e) => setImagebaseFlag(e.target.checked)}
                    />
                    Image Base (--imagebase)
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={sections}
                        onChange={(e) => setSections(e.target.checked)}
                    />
                    Sections (-s)
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={segments}
                        onChange={(e) => setSegments(e.target.checked)}
                    />
                    Segments (-S)
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={imports}
                        onChange={(e) => setImports(e.target.checked)}
                    />
                    Imports (--imports)
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={symbols}
                        onChange={(e) => setSymbols(e.target.checked)}
                    />
                    Symbols (--symbols)
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={dllcharacteristics}
                        onChange={(e) => setDllcharacteristics(e.target.checked)}
                    />
                    Dll Characteristics (-c) [PE]
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={hex}
                        onChange={(e) => setHex(e.target.checked)}
                    />
                    Hex output (--hex)
                </label>
                <div className="tool-field" style={{ width: '100%' }}>
                    <label>String Search (--string)</label>
                    <input
                        type="text"
                        placeholder="password"
                        value={stringSearch}
                        onChange={(e) => setStringSearch(e.target.value)}
                    />
                </div>
            </div>

            <h4 style={{ marginTop: "20px", marginBottom: "10px" }}>Gadget Search</h4>
            <div className="tool-form">
                <div className="tool-field">
                    <label>Search (--search) [regex]</label>
                    <input
                        type="text"
                        placeholder="pop rdi; ret"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="tool-field">
                    <label>Opcode (--opcode)</label>
                    <input
                        type="text"
                        placeholder="ffe4"
                        value={opcode}
                        onChange={(e) => setOpcode(e.target.value)}
                    />
                </div>
                <div className="tool-field">
                    <label>Instructions (--instructions)</label>
                    <input
                        type="text"
                        placeholder="jmp esp"
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                    />
                </div>
                <div className="tool-field">
                    <label>Inst Count (--inst-count)</label>
                    <input
                        type="number"
                        placeholder="6"
                        value={instCount}
                        onChange={(e) => setInstCount(e.target.value)}
                    />
                </div>
                <div className="tool-field">
                    <label>Quality (--quality)</label>
                    <input
                        type="number"
                        placeholder="1"
                        value={quality}
                        onChange={(e) => setQuality(e.target.value)}
                    />
                </div>
                <div className="tool-field">
                    <label>Type (--type)</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value="all">All</option>
                        <option value="rop">ROP</option>
                        <option value="jop">JOP</option>
                        <option value="sys">SYS</option>
                    </select>
                </div>
                <div className="tool-field">
                    <label>JMP Register (-j)</label>
                    <input
                        type="text"
                        placeholder="esp,eax"
                        value={jmp}
                        onChange={(e) => setJmp(e.target.value)}
                    />
                </div>
            </div>

            <div className="tool-options">
                <label>
                    <input
                        type="checkbox"
                        checked={ppr}
                        onChange={(e) => setPpr(e.target.checked)}
                    />
                    PPR (-p) – pop reg; pop reg; ret
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={stackPivot}
                        onChange={(e) => setStackPivot(e.target.checked)}
                    />
                    Stack Pivot (--stack-pivot)
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={detailed}
                        onChange={(e) => setDetailed(e.target.checked)}
                    />
                    Detailed (--detailed)
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={allGadgets}
                        onChange={(e) => setAllGadgets(e.target.checked)}
                    />
                    All (--all) – no duplicate removal
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={cfgOnly}
                        onChange={(e) => setCfgOnly(e.target.checked)}
                    />
                    CFG Only (--cfg-only) [PE]
                </label>
            </div>

            <h4 style={{ marginTop: "20px", marginBottom: "10px" }}>ROP Chain Generation</h4>
            <div className="tool-form">
                <div className="tool-field">
                    <label>Chain Generator (--chain)</label>
                    <select
                        value={chain}
                        onChange={(e) => setChain(e.target.value)}
                    >
                        <option value="">(none)</option>
                        <option value="execve">execve (Linux x86/x86_64)</option>
                        <option value="mprotect">mprotect (Linux x86/x86_64)</option>
                        <option value="virtualprotect">virtualprotect (Windows x86)</option>
                    </select>
                </div>
                {chain && (
                    <div className="tool-field">
                        <label>Parameters</label>
                        <input
                            type="text"
                            placeholder='execve="/bin/sh"'
                            value={chainParams}
                            onChange={(e) => setChainParams(e.target.value)}
                        />
                    </div>
                )}
            </div>

            <h4 style={{ marginTop: "20px", marginBottom: "10px" }}>Console & Misc</h4>
            <div className="tool-options">
                <label>
                    <input
                        type="checkbox"
                        checked={consoleMode}
                        onChange={(e) => setConsoleMode(e.target.checked)}
                    />
                    Console Mode (--console)
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={noLoad}
                        onChange={(e) => setNoLoad(e.target.checked)}
                    />
                    No Load (--no-load) – don't load gadgets automatically
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={clearCache}
                        onChange={(e) => setClearCache(e.target.checked)}
                    />
                    Clear Cache (--clear-cache)
                </label>
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
                    disabled={isRunning || !command || !file}
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
                            toolName={tool?.tool_name || "Ropper"}
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
                            <button className="popup-cancel-btn" onClick={handlePopupCancel}>Cancel</button>
                            <button className="popup-confirm-btn" onClick={handlePopupConfirm}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RopperParameters;