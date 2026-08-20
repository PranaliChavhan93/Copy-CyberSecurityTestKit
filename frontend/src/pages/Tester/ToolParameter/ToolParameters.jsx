import AmassParameters from "./Amass";
import Netdiscover from "./Netdiscover";
import ReconParameter from "./Recon";
import OwaspParameter from "./Owasp";
import NmapParameter from "./Nmap";
import Enum4LinuxParameters from "./Enum4Linux";
import MetasploitParameters from "./Metasploit";
import BurpSuiteParameters from "./Burpsuite";
import Radare2Parameters from "./Radare2";
import WapitiParameters from "./Wapiti";
import NiktoParameters from "./Nikto";
import OwaspZapParameters from "./OwaspZap";
import WhatWebParameters from "./Whatweb";
import DirsearchParameters from "./Dirsearch";
import MasscanParameters from "./Masscan";
import WiresharkParameters from "./Wireshark";
import SQLmapParamaters from "./SQLmap";
import NucleiParameters from "./Nuclei";
import ResponderParameters from "./Responder";
import BinwalkParameters from "./Binwalk";
import GNURadioParameters from "./GNURadio";
import KismetParameters from "./Kismet";
import AircrackngParameters from "./Aircrackng";
import AirodumpParameters from "./Airodump";
import LynisParameters from "./Lynis";
import QemuParameters from "./Qemu";
import OpenOCDParameters from "./OpenOCD";
import GitleaksParameters from "./Gitleaks";
import TruffleHogParameters from "./TruffleHog";
import SyftParameters from "./Syft";
import SocatParameters from "./Socat";
import TcpdumpParameters from "./Tcpdump";
import CrackMapExecParameters from "./CrackMapExec";
import DieParameters from "./DIE";
import PsParameters from "./Ps";
import RopperParameters from "./Ropper";

function ToolParameters({ tool, parameters, setParameters, stageCode, onAdvanceStage }) {
    if(tool?.tool_name === "Amass")
    {
        return (
            <AmassParameters
                tool={tool}
                parameters={parameters}
                setParameters={setParameters}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        );
    }

    if(tool?.tool_name === "Masscan")
    {
        return (
            <MasscanParameters
                tool={tool}
                parameters={parameters}
                setParameters={setParameters}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        );
    }

    if(tool?.tool_name === "Netdiscover")
    {
        return (
            <Netdiscover
                tool={tool}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        );
    }

    if(tool?.tool_name === "Ropper")
    {
        return (
            <RopperParameters
                tool={tool}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        );
    }

    if(tool?.tool_name === "Lynis")
    {
        return (
            <LynisParameters
                tool={tool}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        );
    }

    if(tool?.tool_name === "Wireshark")
    {
        return (
            <WiresharkParameters
                tool={tool}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        );
    }

    if(tool?.tool_name === "SQLmap")
    {
        return (
            <SQLmapParamaters
                tool={tool}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        );
    }

    if(tool?.tool_name === "Nuclei")
    {
        return (
            <NucleiParameters
                tool={tool}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        );
    }

    if(tool?.tool_name === "QEMU")
    {
        return (
            <QemuParameters
                tool={tool}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        );
    }

    if(tool?.tool_name === "OpenOCD")
    {
        return (
            <OpenOCDParameters
                tool={tool}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        );
    }

    if(tool?.tool_name === "GitLeaks")
    {
        return (
            <GitleaksParameters
                tool={tool}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        );
    }

    if(tool?.tool_name === "TruffleHog")
    {
        return (
            <TruffleHogParameters
                tool={tool}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        );
    }

    if(tool?.tool_name === "Syft")
    {
        return (
            <SyftParameters
                tool={tool}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        );
    }

    if(tool?.tool_name === "Socat")
    {
        return (
            <SocatParameters
                tool={tool}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        );
    }

    if(tool?.tool_name === "tcpdump")
    {
        return (
            <TcpdumpParameters
                tool={tool}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        );
    }

    if(tool?.tool_name === "CrackMapExec")
    {
        return (
            <CrackMapExecParameters
                tool={tool}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        );
    }

    if(tool?.tool_name === "Detect It Easy")
    {
        return (
            <DieParameters
                tool={tool}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        );
    }

    if(tool?.tool_name === "ps")
    {
        return (
            <PsParameters
                tool={tool}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        );
    }

    if(tool?.tool_name === "Responder")
    {
        return (
            <ResponderParameters
                tool={tool}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        );
    }

    if(tool?.tool_name === "Binwalk")
    {
        return (
            <BinwalkParameters
                tool={tool}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        );
    }

    if(tool?.tool_name === "Recon-ng")
    {
        return (
            <ReconParameter
                tool={tool}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        );
    }

    if(tool?.tool_name === "OWASP ZWAP")
    {
        return(
            <OwaspParameter
                tool={tool}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        )
    }

    if(tool?.tool_name === "OWASP ZAP")
    {
        return(
            <OwaspZapParameters
                tool={tool}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        )
    }

    if(tool?.tool_name === "Radare2")
    {
        return(
            <Radare2Parameters
                tool={tool}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        )
    }

    if(tool?.tool_name === "WhatWeb")
    {
        return(
            <WhatWebParameters
                tool={tool}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        )
    }

    if(tool?.tool_name === "Wapiti")
    {
        return(
            <WapitiParameters
                tool={tool}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        )
    }

    if(tool?.tool_name === "GNU Radio")
    {
        return(
            <GNURadioParameters
                tool={tool}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        )
    }

    if(tool?.tool_name === "Kismet")
    {
        return(
            <KismetParameters
                tool={tool}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        )
    }

    if(tool?.tool_name === "Airodump-ng")
    {
        return(
            <AirodumpParameters
                tool={tool}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        )
    }

    if(tool?.tool_name === "Aircrack-ng")
    {
        return(
            <AircrackngParameters
                tool={tool}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        )
    }

    if(tool?.tool_name === "Dirsearch")
    {
        return(
            <DirsearchParameters
                tool={tool}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        )
    }

    if(tool?.tool_name === "Nikto")
    {
        return(
            <NiktoParameters
                tool={tool}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        )
    }

    if(tool?.tool_name === "Nmap")
    {
        return(
            <NmapParameter
                tool={tool}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        )
    }

    if(tool?.tool_name === "Netdiscover")
    {
        return(
            <Netdiscover
                tool={tool}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        )
    }

    if(tool?.tool_name === "Burp Suite Community Edition")
    {
        return(
            <BurpSuiteParameters
                tool={tool}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        )
    }

    if(tool?.tool_name === "Enum4linux")
    {
        return(
            <Enum4LinuxParameters
                tool={tool}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        )
    }
    
    if(tool?.tool_name === "Metasploit Framework")
    {
        return(
            <MetasploitParameters
                tool={tool}
                stageCode={stageCode}
                onAdvanceStage={onAdvanceStage}
            />
        )
    }

    return (
        <div className="tool-parameter-box">
            <h3> {tool?.tool_name} Configuration </h3>
            { Object.keys(parameters || {}).length === 0 ?
                ( <p> Pending... </p> )
                :
                (
                    <div className="parameter-grid">
                    {
                        Object.keys(parameters).map((key)=>(
                            <div
                                className="parameter-field"
                                key={key}
                            >
                                <label>{key}</label>
                                { typeof parameters[key] === "boolean"
                                    ?
                                    (
                                        <input
                                            type="checkbox"
                                            checked={
                                                parameters[key]
                                            }
                                            onChange={(e)=>{
                                                setParameters({
                                                    ...parameters,
                                                    [key]:
                                                    e.target.checked
                                                });
                                            }}
                                        />
                                    )
                                    :
                                    (
                                        <input
                                            type="text"
                                            value={
                                                parameters[key] || ""
                                            }
                                            onChange={(e)=>{
                                                setParameters({
                                                    ...parameters,
                                                    [key]:
                                                    e.target.value
                                                });
                                            }}
                                        />
                                    )
                                }
                            </div>
                        ))
                    }
                    </div>
                )
            }
        </div>
    );
}

export default ToolParameters;