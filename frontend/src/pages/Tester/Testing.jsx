
// import { useEffect, useState } from "react";
// import StageHeader from "./StageHeader";
// import ToolParameters from "./ToolParameter/ToolParameters";

// import {useParams} from "react-router-dom";

// import "./Testing.css";

// function Testing() {
//     const {projectId}=useParams();

//     const [project,setProject] = useState(null);

//     const [suites,setSuites] = useState([]);
//     const [stages,setStages] = useState([]);
//     const [tools,setTools] = useState([]);

//     const [suite,setSuite] = useState("");
//     const [stage,setStage] = useState("");
//     const [tool,setTool] = useState(null);

//     const [parameters,setParameters] = useState({});

//     const API = "http://127.0.0.1:8000";

//     useEffect(()=>{
//         if(!projectId)
//             return;

//         const token=sessionStorage.getItem("access");
//         fetch(
//             `${API}/tester/projects/${projectId}/`,
//             {
//                 headers:{
//                     Authorization:`Bearer ${token}`,
//                     "Content-Type":"application/json"
//                 }
//             }
//         )
//         .then(async (res) => {
//         const text = await res.text();

//         // console.log("Status:", res.status);
//         // console.log("Response:", text);

//         if (!res.ok) {
//             throw new Error(text);
//         }

//         return JSON.parse(text);
//     })
//     .then((data) => {
//         // console.log("PROJECT DATA:", data);
//         setProject(data);
//         setSuite(data.suite_id);
//     })
//     .catch((err) => {
//         // console.log("ERROR:", err);
//     });
//     },[projectId]);

//     useEffect(()=>{
//         if(!project)
//             return;

//         fetch(
//             `${API}/master/suites/?name=${project.project_type}`
//         )
//         .then(res=>res.json())
//         .then(data=>{
//             // console.log("SUITE RESPONSE:",data);
//             if(data.length){
//                 setSuites(data);
//                 setSuite(data[0].id);
//             }
//         })
//         .catch(err=>{
//             console.log("Suite Fetch Error:",err);
//         });
//     },[project]);

//     useEffect(()=>{
//         if(!suite)
//             return;

//         fetch(
//             `${API}/master/stages/?suite=${suite}`
//         )
//         .then(res=>res.json())
//         .then(data=>{
//             // console.log("STAGES RESPONSE:",data);
//             setStages(data);
//             if(data.length){
//                 setStage(data[0].id);
//             }
//         })
//         .catch(err=>{
//             console.log("Stage Fetch Error:",err);
//         });
//     },[suite]);

//     useEffect(()=>{
//         if(!suite || !stage)
//             return;

//         fetch(
//             `${API}/master/tools/?suite=${suite}&stage=${stage}`
//         )
//         .then(res=>res.json())
//         .then(data=>{
//             // console.log("TOOLS RESPONSE:",data);
//             setTools(data);

//             if(data.length){
//                 setTool(data[0]);
//             }
//             else{
//                 setTool(null);
//             }
//         })
//         .catch(err=>{
//             console.log("Tool Fetch Error:",err);
//         });
//     },[suite,stage]);

//     useEffect(()=>{
//         if(!tool)
//             return;

//         fetch(
//             `${API}/tester/tool-parameters/?tool=${tool.id}`
//         )
//         .then(res=>res.json())
//         .then(data=>{
//             // console.log("PARAMETER RESPONSE:",data);
//             setParameters(data);
//         })
//         .catch(err=>{
//             console.log("Parameter Fetch Error:",err);
//         });
//     },[tool]);

//     const updateStage = async (newStage) => {
//         const token = sessionStorage.getItem("access");

//         await fetch(
//             `http://127.0.0.1:8000/projects/${projectId}/stage/`,
//             {
//                 method: "PUT",
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({
//                     stage: newStage,
//                 }),
//             }
//         );

//         setProject((prev) => ({
//             ...prev,
//             current_stage: newStage,
//         }));
// };

//     return(
//         <div className="testing-page">
//             <h2>Testing Workspace</h2>
    
//             { project &&
//                 <div className="project-info-box">
//                     <h3>Project Information</h3>

//                     <div className="project-details">
//                         <div className="info-row">
//                             <label>Project ID</label>
//                             <span>{project.project_id}</span>
//                         </div>

//                         <div className="info-row">
//                             <label>Project Name</label>
//                             <span>{project.project_name}</span>
//                         </div>

//                         <div className="info-row">
//                             <label>Customer</label>
//                             <span>{project.customer}</span>
//                         </div>

//                         {/* <div className="info-row">
//                             <label>Assign By</label>
//                             <span>{project.manager}</span>
//                         </div> */}

//                         <div className="info-row">
//                             <label>Project Type</label>
//                             <span>{project.project_type}</span>
//                         </div>

//                         <div className="info-row">
//                             <label>Priority</label>
//                             <span>{project.priority}</span>
//                         </div>

//                         {/* <div className="info-row">
//                             <label>Status</label>
//                             <span>{project.status}</span>
//                         </div> */}

//                         <div className="info-row">
//                             <label>Deadline</label>
//                             <span>{project.deadline}</span>
//                         </div>
//                     </div>
//                 </div>
//             }

//             <StageHeader
//                 stages={stages}
//                 currentStage={
//                     stages.find(
//                         s=>s.id == stage
//                     )?.stage_id
//                 }
//             />

//             <div className="tool-control-box">
//                 <div className="field">
//                 <label>Suite</label>
//                 <select
//                     value={suite}
//                     disabled
//                 >
//                 {
//                     suites.map(item=>(
//                         <option
//                             key={item.id}
//                             value={item.id}
//                         >
//                         {item.suite_name}
//                         </option>
//                     ))
//                 }
//                 </select>
//             </div>

//             <div className="field">
//                 <label>Stage</label>
//                 <select
//                     value={stage}
//                     onChange={(e)=>{
//                         const selectedStage = Number(e.target.value);
//                         setStage(selectedStage);
//                         setTool(null);
//                         const stageData = stages.find
//                         (
//                                 s=>s.id === selectedStage
//                         );
//                         fetch(
//                             `${API}/tester/projects/${projectId}/stage/`,
//                             {
//                                 method:"PUT",
//                                 headers:{
//                                     "Content-Type":"application/json",
//                                     Authorization:
//                                     `Bearer ${sessionStorage.getItem("access")}`
//                                 },
//                                 body:JSON.stringify({
//                                     stage:
//                                     stageData.stage_id
//                                 })
//                             }
//                         );
//                     }}
//                 >
//                 {
//                     stages.map(item=>(
//                         <option
//                             key={item.id}
//                             value={item.id}
//                         >
//                         {item.stage_name}
//                         </option>
//                     ))
//                 }
//                 </select>
//             </div>

//             <div className="field">
//                 <label>Tool</label>
//                 <select
//                     value={
//                         tool?.id || ""
//                     }
//                     onChange={(e)=>{
//                         const selected =
//                         tools.find(
//                             t=>t.id == e.target.value
//                         );
//                         setTool(selected);
//                     }}
//                 >
//                 {
//                     tools.map(item=>(
//                         <option
//                             key={item.id}
//                             value={item.id}
//                         >
//                         {item.tool_name}
//                         </option>
//                     ))
//                 }
//                 </select>
//             </div>
//         </div>
        
//         { tool &&
//             <ToolParameters
//                 tool={tool}
//                 parameters={parameters}
//                 setParameters={setParameters}
//             />
//         }
//     </div>
//     )
// }

// export default Testing;



// import { useEffect, useState } from "react";
// import StageHeader from "./StageHeader";
// import ToolParameters from "./ToolParameter/ToolParameters";

// import {useParams} from "react-router-dom";

// import "./Testing.css";

// function Testing() {
    // const {projectId}=useParams();

    // const [project,setProject] = useState(null);

    // const [suites,setSuites] = useState([]);
    // const [stages,setStages] = useState([]);
    // const [tools,setTools] = useState([]);

    // const [suite,setSuite] = useState("");
    // const [stage,setStage] = useState("");
    // const [tool,setTool] = useState(null);

    // const [parameters,setParameters] = useState({});

    // // const [tools, setTools] = useState([]);
    // const [selectedTool, setSelectedTool] = useState("");


    // const API = "http://127.0.0.1:8000";

    // useEffect(()=>{
    //     if(!projectId)
    //         return;
    //     const token=sessionStorage.getItem("access");
    //     fetch(
    //         `${API}/tester/projects/${projectId}/`,
    //         {
    //             headers:{
    //                 Authorization:`Bearer ${token}`,
    //                 "Content-Type":"application/json"
    //             }
    //         }
    //     )
    //     .then(async (res) => {
    //     const text = await res.text();

    //     // console.log("Status:", res.status);
    //     // console.log("Response:", text);

    //     if (!res.ok) {
    //         throw new Error(text);
    //     }

    //     return JSON.parse(text);
    // })
    // .then((data) => {
    //     // console.log("PROJECT DATA:", data);
    //     setProject(data);
    //     setSuite(data.suite_id);
    // })
    // .catch((err) => {
    //     // console.log("ERROR:", err);
    // });
    // },[projectId]);

    // useEffect(()=>{
    //     if(!project)
    //         return;

    //     fetch(
    //         `${API}/master/suites/?name=${project.project_type}`
    //     )
    //     .then(res=>res.json())
    //     .then(data=>{
    //         // console.log("SUITE RESPONSE:",data);
    //         if(data.length){
    //             setSuites(data);
    //             setSuite(data[0].id);
    //         }
    //     })
    //     .catch(err=>{
    //         console.log("Suite Fetch Error:",err);
    //     });
    // },[project]);

   
    // useEffect(() => {
    //     if (!project) return;

    //     fetch(
    //         `http://127.0.0.1:8000/master/tools/?suite=${project.suite}&stage=${project.stage}`,
    //         {
    //             headers: {
    //                 Authorization: `Bearer ${localStorage.getItem("access")}`,
    //             },
    //         }
    //     )
    //         .then(res => res.json())
    //         .then(data => setTools(data));
    // }, [project]);

    // const [project, setProject] = useState(null);
    // const [tools, setTools] = useState([]);

    // useEffect(() => {
    //     if (!project) return;

    //     fetch(
    //         `http://127.0.0.1:8000/master/tools/?suite=${project.suite}&stage=${project.current_stage}`,
    //         {
    //             headers: {
    //                 Authorization: `Bearer ${localStorage.getItem("access")}`,
    //             },
    //         }
    //     )
    //         .then(res => res.json())
    //         .then(data => setTools(data));
    // }, [project]);

    // useEffect(()=>{
    //     if(!suite)
    //         return;

    //     fetch(
    //         `${API}/master/stages/?suite=${suite}`
    //     )
    //     .then(res=>res.json())
    //     .then(data=>{
    //         // console.log("STAGES RESPONSE:",data);
    //         setStages(data);
    //         if(data.length){
    //             setStage(data[0].id);
    //         }
    //     })
    //     .catch(err=>{
    //         console.log("Stage Fetch Error:",err);
    //     });
    // },[suite]);

    // useEffect(()=>{
    //     if(!suite || !stage)
    //         return;

    //     fetch(
    //         `${API}/master/tools/?suite=${suite}&stage=${stage}`
    //     )
    //     .then(res=>res.json())
    //     .then(data=>{
    //         console.log("TOOLS RESPONSE:",data);
    //         setTools(data);

    //         if(data.length){
    //             setTool(data[0]);
    //         }
    //         else{
    //             setTool(null);
    //         }
    //     })
    //     .catch(err=>{
    //         console.log("Tool Fetch Error:",err);
    //     });
    // },[suite,stage]);

    // useEffect(()=>{
    //     if(!tool)
    //         return;

    //     fetch(
    //         `${API}/tester/tool-parameters/?tool=${tool.id}`
    //     )
    //     .then(res=>res.json())
    //     .then(data=>{
    //         console.log("PARAMETER RESPONSE:",data);
    //         setParameters(data);
    //     })
    //     .catch(err=>{
    //         console.log("Parameter Fetch Error:",err);
    //     });
    // },[tool]);

    // const updateStage = async (newStage) => {
    //     const token = sessionStorage.getItem("access");

    //     await fetch(
    //         `http://127.0.0.1:8000/projects/${projectId}/stage/`,
    //         {
    //             method: "PUT",
    //             headers: {
    //                 Authorization: `Bearer ${token}`,
    //                 "Content-Type": "application/json",
    //             },
    //             body: JSON.stringify({
    //                 stage: newStage,
    //             }),
    //         }
    //     );

    //     setProject((prev) => ({
    //         ...prev,
    //         current_stage: newStage,
    //     }));
    // };

//     return(
//         <div className="testing-page">
//             <h2>Testing Workspace</h2>
    
//             { project &&
//                 <div className="project-info-box">
//                     <h3>Project Information</h3>

//                     <div className="project-details">
//                         <div className="info-row">
//                             <label>Project ID</label>
//                             <span>{project.project_id}</span>
//                         </div>

//                         <div className="info-row">
//                             <label>Project Name</label>
//                             <span>{project.project_name}</span>
//                         </div>

//                         <div className="info-row">
//                             <label>Customer</label>
//                             <span>{project.customer}</span>
//                         </div>

//                         {/* <div className="info-row">
//                             <label>Assign By</label>
//                             <span>{project.manager}</span>
//                         </div> */}

//                         <div className="info-row">
//                             <label>Project Type</label>
//                             <span>{project.project_type}</span>
//                         </div>

//                         <div className="info-row">
//                             <label>Priority</label>
//                             <span>{project.priority}</span>
//                         </div>

//                         {/* <div className="info-row">
//                             <label>Status</label>
//                             <span>{project.status}</span>
//                         </div> */}

//                         <div className="info-row">
//                             <label>Deadline</label>
//                             <span>{project.deadline}</span>
//                         </div>
//                     </div>
//                 </div>
//             }

//             <StageHeader
//                 stages={stages}
//                 currentStage={
//                     stages.find(
//                         s=>s.id == stage
//                     )?.stage_id
//                 }
//             />

//             <div className="tool-control-box">
//                 <div className="field">
//                 <label>Suite</label>
//                 <select
//                     value={suite}
//                     disabled
//                 >
//                 {
//                     suites.map(item=>(
//                         <option
//                             key={item.id}
//                             value={item.id}
//                         >
//                         {item.suite_name}
//                         </option>
//                     ))
//                 }
//                 </select>
//                 <input
//                     type="text"
//                     value={project?.suite || ""}
//                     readOnly
//                 />
//             </div>

//             <div className="field">
//                 <label>Stage</label>
//                 <select
//                     value={stage}
//                     onChange={(e)=>{
//                         const selectedStage = Number(e.target.value);
//                         setStage(selectedStage);
//                         setTool(null);
//                         const stageData = stages.find
//                         (
//                                 s=>s.id === selectedStage
//                         );
//                         fetch(
//                             `${API}/tester/projects/${projectId}/stage/`,
//                             {
//                                 method:"PUT",
//                                 headers:{
//                                     "Content-Type":"application/json",
//                                     Authorization:
//                                     `Bearer ${sessionStorage.getItem("access")}`
//                                 },
//                                 body:JSON.stringify({
//                                     stage:
//                                     stageData.stage_id
//                                 })
//                             }
//                         );
//                     }}
//                 >
//                 {
//                     stages.map(item=>(
//                         <option
//                             key={item.id}
//                             value={item.id}
//                         >
//                         {item.stage_name}
//                         </option>
//                     ))
//                 }
//                 </select>
//             </div>

//             <div className="field">
//                 <label>Tool</label>
//                 {/* <select
//                     value={
//                         tool?.id || ""
//                     }
//                     onChange={(e)=>{
//                         const selected =
//                         tools.find(
//                             t=>t.id == e.target.value
//                         );
//                         setTool(selected);
//                     }}
//                 >
//                 {
//                     tools.map(item=>(
//                         <option
//                             key={item.id}
//                             value={item.id}
//                         >
//                         {item.tool_name}
//                         </option>
//                     ))
//                 }
//                 </select> */}

//                 <select
//                     value={selectedTool}
//                     onChange={(e) => setSelectedTool(e.target.value)}
//                 >
//                     <option value="">Select Tool</option>

//                     {tools.map(tool => (
//                         <option key={tool.id} value={tool.id}>
//                             {tool.tool_name}
//                         </option>
//                     ))}
//                 </select>
//             </div>
//         </div>
        
//         { tool &&
//             <ToolParameters
//                 tool={tool}
//                 parameters={parameters}
//                 setParameters={setParameters}
//             />
//         }
//     </div>
//     )
// }

// export default Testing;


  
import { useEffect, useState } from "react";
import StageHeader from "./StageHeader";
import ToolParameters from "./ToolParameter/ToolParameters";

import {useParams} from "react-router-dom";

import "./Testing.css";

function Testing() {
    const { projectId } = useParams();

    const API = "http://127.0.0.1:8000";
    const token = sessionStorage.getItem("access");

    const [project, setProject] = useState(null);

    const [suites, setSuites] = useState([]);
    const [stages, setStages] = useState([]);
    const [tools, setTools] = useState([]);

    const [suite, setSuite] = useState("");
    const [stage, setStage] = useState("");
    const [tool, setTool] = useState(null);

    const [parameters, setParameters] = useState({});
    const [selectedTool, setSelectedTool] = useState("");

    // ---------------- PROJECT ----------------

    useEffect(() => {
        if (!projectId) return;

        fetch(`${API}/tester/projects/${projectId}/`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
            .then(async (res) => {
                const data = await res.json();

                if (!res.ok) throw data;

                return data;
            })
            .then((data) => {
                // console.log("PROJECT:", data);

                setProject(data);

                // if backend returns suite_id
                if (data.suite_id) {
                    setSuite(data.suite_id);
                }
            })
            .catch((err) => console.log(err));
    }, [projectId]);

    // ---------------- SUITE ----------------

    useEffect(() => {
        if (!project) return;

        fetch(
            `${API}/master/suites/?name=${project.project_type}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
            .then((res) => res.json())
            .then((data) => {
                // console.log("SUITES:", data);

                if (Array.isArray(data)) {
                    setSuites(data);

                    if (!suite && data.length > 0) {
                        setSuite(data[0].id);
                    }
                } else {
                    setSuites([]);
                }
            })
            .catch((err) => console.log(err));
    }, [project]);

    // ---------------- STAGES ----------------

    useEffect(() => {
        if (!suite) return;

        fetch(
            `${API}/master/stages/?suite=${suite}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
            .then((res) => res.json())
            .then((data) => {
                // console.log("STAGES:", data);

                if (Array.isArray(data)) {
                    setStages(data);

                    if (project?.current_stage) {
                        const current = data.find(
                            (s) => s.stage_id === project.current_stage
                        );

                        if (current) {
                            setStage(current.id);
                            return;
                        }
                    }

                    if (data.length > 0) {
                        setStage(data[0].id);
                    }
                } else {
                    setStages([]);
                }
            })
            .catch((err) => console.log(err));
    }, [suite, project]);

    // ---------------- TOOLS ----------------

    useEffect(() => {
        if (!suite || !stage) return;

        fetch(
            `${API}/master/tools/?suite=${suite}&stage=${stage}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
            .then((res) => res.json())
            .then((data) => {
                // console.log("TOOLS:", data);

                if (Array.isArray(data)) {
                    setTools(data);

                    if (data.length > 0) {
                        setTool(data[0]);
                        setSelectedTool(data[0].id);
                    } else {
                        setTool(null);
                    }
                } else {
                    setTools([]);
                    setTool(null);
                }
            })
            .catch((err) => console.log(err));
    }, [suite, stage]);

    // ---------------- PARAMETERS ----------------

    useEffect(() => {
        if (!tool) return;

        fetch(
            `${API}/tester/tool-parameters/?tool=${tool.id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
            .then((res) => res.json())
            .then((data) => {
                // console.log("PARAMETERS:", data);
                setParameters(data);
            })
            .catch((err) => console.log(err));
    }, [tool]);

    // ---------------- UPDATE STAGE ----------------

    const updateStage = async (newStage) => {
        await fetch(
            `${API}/projects/${projectId}/stage/`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    stage: newStage,
                }),
            }
        );

        setProject((prev) => ({
            ...prev,
            current_stage: newStage,
        }));
    };

    return (
        <div className="testing-page">
            <h2>Testing Workspace</h2>

            {project && (
                <div className="project-info-box">
                    <h3>Project Information</h3>

                    <div className="project-details">
                        <div className="info-row">
                            <label>Project ID</label>
                            <span>{project.project_id}</span>
                        </div>

                        <div className="info-row">
                            <label>Project Name</label>
                            <span>{project.project_name}</span>
                        </div>

                        <div className="info-row">
                            <label>Customer</label>
                            <span>{project.customer}</span>
                        </div>

                        <div className="info-row">
                            <label>Project Type</label>
                            <span>{project.project_type}</span>
                        </div>

                        <div className="info-row">
                            <label>Priority</label>
                            <span>{project.priority}</span>
                        </div>

                        <div className="info-row">
                            <label>Deadline</label>
                            <span>{project.deadline}</span>
                        </div>
                    </div>
                </div>
            )}

            <StageHeader
                stages={stages}
                currentStage={
                    stages.find((s) => s.id === stage)?.stage_id
                }
            />

            <div className="tool-control-box">

                <div className="field">
                    <label>Suite</label>
                
                    <select value={suite} disabled>
                        {suites.map((item) => (
                            <option
                                key={item.id}
                                value={item.id}
                            >
                                {item.suite_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="field">
                    <label>Stage</label>

                    <select
                        value={stage}
                        onChange={(e) => {
                            const selectedStage = Number(e.target.value);
                            setStage(selectedStage);
                            const stageData = stages.find(
                                s => s.id === selectedStage
                            );
                            if (stageData) {
                                updateStage(stageData.stage_id);
                            }
                        }}
                    >
                        {stages.map((item) => (
                            <option
                                key={item.id}
                                value={item.id}
                            >
                                {item.stage_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="field">
                    <label>Tool</label>

                    <select
                        value={selectedTool}
                        onChange={(e) => {
                            const id = Number(e.target.value);
                            setSelectedTool(id);
                            const selected = tools.find(
                                t => t.id === id
                            );
                            setTool(selected);
                        }}
                    >
                        <option value="">
                            Select Tool
                        </option>

                        {tools.map((item) => (
                            <option
                                key={item.id}
                                value={item.id}
                            >
                                {item.tool_name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {tool && (
                <ToolParameters
                    tool={tool}
                    parameters={parameters}
                    setParameters={setParameters}
                />
            )}
        </div>
    );
}

export default Testing;
