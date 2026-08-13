import AmassParameters from "./Amass";
import Netdiscover from "./Netdiscover";
import ReconParameter from "./Recon";
import OwaspParameter from "./Owasp";
import NmapParameter from "./Nmap";
import Burpsuite from "./Burpsuite";
import Enum4LinuxParameters from "./Enum4Linux";
import MetasploitParameters from "./Metasploit";
import BurpSuiteParameters from "./Burpsuite";
import Radare2Parameters from "./Radare2";
import WapitiParameters from "./Wapiti";
import NiktoParameters from "./Nikto";
import OwaspZapParameters from "./OwaspZap";
import WhatWebParameters from "./Whatweb";
import DirsearchParameters from "./Dirsearch";

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

    if(tool?.tool_name === "Sublist3r")
    {
        return (
            <Netdiscover
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
            <NmapParameter
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