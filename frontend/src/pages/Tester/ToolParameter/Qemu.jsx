import { useState, useRef, useEffect } from "react";
import AIAnalysisPanel from "./AIAnalysisPanel";
import "./ToolCommon.css";

function QemuParameters({ tool, parameters, setParameters, stageCode, onAdvanceStage }) 
{
    const [binary, setBinary] = useState("qemu-system-x86_64");
    const [diskImage, setDiskImage] = useState("");

    const [memory, setMemory] = useState("");
    const [smpCores, setSmpCores] = useState("");
    const [cpuType, setCpuType] = useState("");
    const [machineType, setMachineType] = useState("");
    const [bootOrder, setBootOrder] = useState("");
    const [enableKvm, setEnableKvm] = useState(false);
    const [snapshot, setSnapshot] = useState(false);
    const [noGraphic, setNoGraphic] = useState(false);

    const [driveFile, setDriveFile] = useState("");
    const [driveFormat, setDriveFormat] = useState("");
    const [driveInterface, setDriveInterface] = useState("");

    const [netdevType, setNetdevType] = useState("");
    const [netNic, setNetNic] = useState("");

    const [displayType, setDisplayType] = useState("");
    const [vgaType, setVgaType] = useState("");

    const [extraArgs, setExtraArgs] = useState("");

    const [command, setCommand] = useState("");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [executionStatus, setExecutionStatus] = useState("waiting");

    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("");
    const [outputFile, setOutputFile] = useState("qemu_output.txt");

    const terminalRef = useRef(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [output]);

    useEffect(() => {
        updateCommandPreview();
    }, [
        binary,
        diskImage,
        memory,
        smpCores,
        cpuType,
        machineType,
        bootOrder,
        enableKvm,
        snapshot,
        noGraphic,
        driveFile,
        driveFormat,
        driveInterface,
        netdevType,
        netNic,
        displayType,
        vgaType,
        extraArgs
    ]);

    const generateCommand = () => {
        let cmd = binary;

        if (memory) cmd += ` -m ${memory}`;
        if (smpCores) cmd += ` -smp ${smpCores}`;
        if (cpuType) cmd += ` -cpu ${cpuType}`;
        if (machineType) cmd += ` -machine ${machineType}`;
        if (bootOrder) cmd += ` -boot ${bootOrder}`;
        if (enableKvm) cmd += " -enable-kvm";
        if (snapshot) cmd += " -snapshot";
        if (noGraphic) cmd += " -nographic";

        if (driveFile) {
            let driveOpt = `file=${driveFile}`;
            if (driveFormat) driveOpt += `,format=${driveFormat}`;
            if (driveInterface) driveOpt += `,if=${driveInterface}`;
            cmd += ` -drive ${driveOpt}`;
        } else if (diskImage) {
            cmd += ` -hda ${diskImage}`;
        }

        if (netdevType) {
            cmd += ` -netdev ${netdevType},id=net0`;
            if (netNic) cmd += ` -device ${netNic},netdev=net0`;
        }

        if (displayType) {
            cmd += ` -display ${displayType}`;
        }
        if (vgaType) {
            cmd += ` -vga ${vgaType}`;
        }

        if (extraArgs.trim()) {
            cmd += ` ${extraArgs.trim()}`;
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
                            binary,
                            diskImage,
                            memory,
                            smpCores,
                            cpuType,
                            machineType,
                            bootOrder,
                            enableKvm,
                            snapshot,
                            noGraphic,
                            driveFile,
                            driveFormat,
                            driveInterface,
                            netdevType,
                            netNic,
                            displayType,
                            vgaType,
                            extraArgs
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
            downloadTxtFile(
                output,
                outputFile || "qemu_output.txt"
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
                binary,
                diskImage,
                memory,
                smpCores,
                cpuType,
                machineType,
                bootOrder,
                enableKvm,
                snapshot,
                noGraphic,
                driveFile,
                driveFormat,
                driveInterface,
                netdevType,
                netNic,
                displayType,
                vgaType,
                extraArgs,
                command,
                output,
                executionStatus
            });
        }
    };

    return (
        <div className="tool-box">
            <h3>
                QEMU Configuration
                {tool && <span className="tool-badge">{tool.tool_name}</span>}
            </h3>

            <div className="tool-form">
                {/* Binary selection */}
                <div className="tool-field">
                    <label>QEMU Binary</label>
                    <select
                        value={binary}
                        onChange={(e) => setBinary(e.target.value)}
                    >
                        <option value="qemu-system-x86_64">qemu-system-x86_64</option>
                        <option value="qemu-system-i386">qemu-system-i386</option>
                        <option value="qemu-system-arm">qemu-system-arm</option>
                        <option value="qemu-system-aarch64">qemu-system-aarch64</option>
                        <option value="qemu-system-ppc">qemu-system-ppc</option>
                        <option value="qemu-system-mips">qemu-system-mips</option>
                        <option value="qemu-system-sparc">qemu-system-sparc</option>
                        <option value="qemu-img">qemu-img</option>
                        <option value="qemu-io">qemu-io</option>
                        <option value="qemu-nbd">qemu-nbd</option>
                    </select>
                </div>

                <div className="tool-field">
                    <label>Disk Image (-hda or -drive file)</label>
                    <input
                        type="text"
                        placeholder="/path/to/disk.img"
                        value={diskImage}
                        onChange={(e) => setDiskImage(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Memory (-m) [MB]</label>
                    <input
                        type="text"
                        placeholder="512"
                        value={memory}
                        onChange={(e) => setMemory(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>SMP Cores (-smp)</label>
                    <input
                        type="text"
                        placeholder="1"
                        value={smpCores}
                        onChange={(e) => setSmpCores(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>CPU Type (-cpu)</label>
                    <input
                        type="text"
                        placeholder="host (for KVM) or qemu64"
                        value={cpuType}
                        onChange={(e) => setCpuType(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Machine Type (-machine)</label>
                    <input
                        type="text"
                        placeholder="pc, virt, etc."
                        value={machineType}
                        onChange={(e) => setMachineType(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Boot Order (-boot)</label>
                    <input
                        type="text"
                        placeholder="c (hd), d (cdrom), n (network)"
                        value={bootOrder}
                        onChange={(e) => setBootOrder(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Drive File (if different from disk image)</label>
                    <input
                        type="text"
                        placeholder="/path/to/drive.img"
                        value={driveFile}
                        onChange={(e) => setDriveFile(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Drive Format</label>
                    <input
                        type="text"
                        placeholder="raw, qcow2, etc."
                        value={driveFormat}
                        onChange={(e) => setDriveFormat(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Drive Interface</label>
                    <select
                        value={driveInterface}
                        onChange={(e) => setDriveInterface(e.target.value)}
                    >
                        <option value="">None</option>
                        <option value="ide">ide</option>
                        <option value="virtio">virtio</option>
                        <option value="scsi">scsi</option>
                        <option value="sd">sd</option>
                        <option value="mtd">mtd</option>
                        <option value="floppy">floppy</option>
                        <option value="pflash">pflash</option>
                    </select>
                </div>

                <div className="tool-field">
                    <label>Netdev Type</label>
                    <select
                        value={netdevType}
                        onChange={(e) => setNetdevType(e.target.value)}
                    >
                        <option value="">None</option>
                        <option value="user">user</option>
                        <option value="tap">tap</option>
                        <option value="bridge">bridge</option>
                        <option value="socket">socket</option>
                        <option value="vde">vde</option>
                        <option value="none">none</option>
                    </select>
                </div>

                <div className="tool-field">
                    <label>NIC Model (-device)</label>
                    <input
                        type="text"
                        placeholder="e1000, virtio-net, rtl8139"
                        value={netNic}
                        onChange={(e) => setNetNic(e.target.value)}
                    />
                </div>

                <div className="tool-field">
                    <label>Display Type</label>
                    <select
                        value={displayType}
                        onChange={(e) => setDisplayType(e.target.value)}
                    >
                        <option value="">None</option>
                        <option value="gtk">gtk</option>
                        <option value="sdl">sdl</option>
                        <option value="vnc">vnc</option>
                        <option value="none">none</option>
                        <option value="curses">curses</option>
                        <option value="spice-app">spice-app</option>
                    </select>
                </div>

                <div className="tool-field">
                    <label>VGA Type (-vga)</label>
                    <select
                        value={vgaType}
                        onChange={(e) => setVgaType(e.target.value)}
                    >
                        <option value="">None</option>
                        <option value="std">std</option>
                        <option value="cirrus">cirrus</option>
                        <option value="vmware">vmware</option>
                        <option value="qxl">qxl</option>
                        <option value="virtio">virtio</option>
                        <option value="none">none</option>
                    </select>
                </div>

                

                <div className="tool-field">
                    <label>Extra Arguments</label>
                    <input
                        placeholder="-usb -device usb-mouse ..."
                        value={extraArgs}
                        onChange={(e) => setExtraArgs(e.target.value)}
                    />
                </div>
            </div>

            <div className="tool-options">
                <label>
                    <input
                        type="checkbox"
                        checked={enableKvm}
                        onChange={(e) => setEnableKvm(e.target.checked)}
                    />
                    Enable KVM (-enable-kvm)
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={snapshot}
                        onChange={(e) => setSnapshot(e.target.checked)}
                    />
                    Snapshot mode (-snapshot)
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={noGraphic}
                        onChange={(e) => setNoGraphic(e.target.checked)}
                    />
                    No Graphic (-nographic)
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
                    disabled={isRunning || !command}
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
                            toolName={tool?.tool_name || "QEMU"}
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

export default QemuParameters;