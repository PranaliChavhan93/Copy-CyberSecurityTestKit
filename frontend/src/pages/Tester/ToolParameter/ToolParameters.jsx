import AmassParameters from "./AmassParameters";
import Netdiscover from "./Netdiscover";
import ReconParameter from "./ReconParameter";
import OwaspParameter from "./OwaspParameter";
import NmapParameter from "./NmapParameter";

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