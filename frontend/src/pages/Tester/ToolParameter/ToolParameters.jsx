import AmassParameters from "./AmassParameters";
import Netdiscover from "./Netdiscover";
import ReconParameter from "./ReconParameter";
import OwaspParameter from "./OwaspParameter";
import NmapParameter from "./NmapParameter";

function ToolParameters({ tool, parameters, setParameters }) {
    if(tool?.tool_name === "Amass")
    {
        return (
            <AmassParameters />
        );
    }

    if(tool?.tool_name === "Sublist3r")
    {
        return (
            <Netdiscover />
        );
    }

    if(tool?.tool_name === "Recon-ng")
    {
        return (
            <ReconParameter />
        );
    }

    if(tool?.tool_name === "OWASP ZWAP")
    {
        return(
            <OwaspParameter />
        )
    }

    if(tool?.tool_name === "Nmap")
    {
        return(
            <NmapParameter />
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