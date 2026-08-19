
// import { useEffect, useState } from "react";
// import StageHeader from "./StageHeader";
// import ToolParameters from "./ToolParameter/ToolParameters";
// import { useParams, useNavigate } from "react-router-dom";
// import "./Testing.css";

// function Testing() {
//     const { projectId, stage: urlStage } = useParams();
//     const navigate = useNavigate();

//     const API = "http://127.0.0.1:8000";
//     const token = sessionStorage.getItem("access");

//     const [project, setProject] = useState(null);

//     const [suites, setSuites] = useState([]);
//     const [stages, setStages] = useState([]);
//     const [tools, setTools] = useState([]);

//     const [suite, setSuite] = useState("");
//     const [selectedSuite, setSelectedSuite] = useState(null);

//     const [stage, setStage] = useState("");
//     const [tool, setTool] = useState(null);

//     const [parameters, setParameters] = useState({});
//     const [selectedTool, setSelectedTool] = useState("");

//     const normalize = (value) => {
//         return String(value ?? "")
//             .trim()
//             .toUpperCase();
//     };

//     useEffect(() => {
//         const fetchSuites = async () => {
//             try {
//                 const response = await fetch(
//                     `${API}/master/suites/`,
//                     {
//                         headers: {
//                             Authorization: `Bearer ${token}`,
//                             "Content-Type": "application/json",
//                         },
//                     }
//                 );

//                 const data = await response.json();

//                 if (!response.ok) {
//                     throw new Error(
//                         data.detail || "Failed to fetch suites"
//                     );
//                 }

//                 if (Array.isArray(data)) {
//                     setSuites(data);
//                 } else {
//                     setSuites([]);
//                 }
//             } catch (error) {
//                 console.error(
//                     "Error fetching suites:",
//                     error
//                 );
//                 setSuites([]);
//             }
//         };

//         fetchSuites();
//     }, []);

//     useEffect(() => {
//         if (!projectId) return;

//         const fetchProject = async () => {
//             try {
//                 const response = await fetch(
//                     `${API}/tester/projects/${projectId}/`,
//                     {
//                         headers: {
//                             Authorization: `Bearer ${token}`,
//                             "Content-Type": "application/json",
//                         },
//                     }
//                 );

//                 const data = await response.json();

//                 if (!response.ok) {
//                     throw data;
//                 }

//                 console.log("PROJECT DATA:", data);

//                 setProject(data);
//             } catch (error) {
//                 console.error(
//                     "Error fetching project:",
//                     error
//                 );
//             }
//         };

//         fetchProject();
//     }, [projectId]);

//     useEffect(() => {
//         if (!project || !suites.length) return;

//         const projectType = normalize(project.project_type);
//         const projectSuiteName = normalize(project.suite_name);
//         const projectSuiteId = normalize(project.suite_id);

//         console.log("=================================");
//         console.log("PROJECT TYPE:", projectType);
//         console.log("PROJECT SUITE NAME:", projectSuiteName);
//         console.log("PROJECT SUITE ID:", projectSuiteId);
//         console.log("AVAILABLE SUITES:", suites);

//         const matchedSuite = suites.find((item) => {
//             const suiteDatabaseId = normalize(item.id);
//             const suiteCode = normalize(item.suite_id);
//             const suiteName = normalize(item.suite_name);

//             return (
//                 // Best match if backend already sends suite information
//                 projectSuiteId &&
//                 projectSuiteId === suiteCode
//             ) ||
//             (
//                 projectSuiteName &&
//                 projectSuiteName === suiteName
//             ) ||
//             (
//                 projectType &&
//                 (
//                     projectType === suiteDatabaseId ||
//                     projectType === suiteCode ||
//                     projectType === suiteName
//                 )
//             );
//         });

//         if (matchedSuite) {
//             console.log("MATCHED SUITE:", matchedSuite);

//             /*
//              * IMPORTANT:
//              *
//              * suite = database ID
//              *
//              * This is used for:
//              * /master/stages/?suite=...
//              * /master/tools/?suite=...
//              *
//              * But UI displays:
//              * matchedSuite.suite_name
//              */

//             setSelectedSuite(matchedSuite);

//             setSuite(String(matchedSuite.id));
//         } else {
//             console.error(
//                 "NO SUITE FOUND FOR PROJECT:",
//                 project
//             );

//             setSelectedSuite(null);
//             setSuite("");
//         }
//     }, [project, suites]);

//     // ============================================================
//     // 4. Fetch Stages For Selected Suite
//     // ============================================================
//     useEffect(() => {
//         if (!suite) return;

//         const fetchStages = async () => {
//             try {
//                 const response = await fetch(
//                     `${API}/master/stages/?suite=${suite}`,
//                     {
//                         headers: {
//                             Authorization: `Bearer ${token}`,
//                             "Content-Type": "application/json",
//                         },
//                     }
//                 );

//                 const data = await response.json();

//                 if (!response.ok) {
//                     throw data;
//                 }

//                 if (!Array.isArray(data)) {
//                     setStages([]);
//                     setStage("");
//                     return;
//                 }

//                 setStages(data);

//                 // ------------------------------------------------
//                 // First priority: Stage from URL
//                 // ------------------------------------------------
//                 if (urlStage) {
//                     const stageFromUrl = data.find(
//                         (s) =>
//                             normalize(s.stage_id) ===
//                             normalize(urlStage)
//                     );

//                     if (stageFromUrl) {
//                         console.log(
//                             "STAGE FROM URL:",
//                             stageFromUrl
//                         );

//                         setStage(stageFromUrl.id);
//                         return;
//                     }
//                 }

//                 // ------------------------------------------------
//                 // Second priority: Project current stage
//                 // ------------------------------------------------
//                 if (project?.current_stage) {
//                     const currentStage = data.find(
//                         (s) =>
//                             normalize(s.stage_id) ===
//                             normalize(project.current_stage)
//                     );

//                     if (currentStage) {
//                         setStage(currentStage.id);
//                         return;
//                     }
//                 }

//                 // ------------------------------------------------
//                 // Third priority: First stage
//                 // ------------------------------------------------
//                 if (data.length > 0) {
//                     setStage(data[0].id);
//                 } else {
//                     setStage("");
//                 }
//             } catch (error) {
//                 console.error(
//                     "Error fetching stages:",
//                     error
//                 );

//                 setStages([]);
//                 setStage("");
//             }
//         };

//         fetchStages();
//     }, [suite, project, urlStage]);

//     // ============================================================
//     // 5. Fetch Tools According To Suite + Stage
//     // ============================================================
//     useEffect(() => {
//         if (!suite || !stage) return;

//         const fetchTools = async () => {
//             try {
//                 const response = await fetch(
//                     `${API}/master/tools/?suite=${suite}&stage=${stage}`,
//                     {
//                         headers: {
//                             Authorization: `Bearer ${token}`,
//                             "Content-Type": "application/json",
//                         },
//                     }
//                 );

//                 const data = await response.json();

//                 if (!response.ok) {
//                     throw data;
//                 }

//                 if (Array.isArray(data)) {
//                     setTools(data);

//                     if (data.length > 0) {
//                         setTool(data[0]);
//                         setSelectedTool(data[0].id);
//                     } else {
//                         setTool(null);
//                         setSelectedTool("");
//                     }
//                 } else {
//                     setTools([]);
//                     setTool(null);
//                     setSelectedTool("");
//                 }
//             } catch (error) {
//                 console.error(
//                     "Error fetching tools:",
//                     error
//                 );

//                 setTools([]);
//                 setTool(null);
//                 setSelectedTool("");
//             }
//         };

//         fetchTools();
//     }, [suite, stage]);

//     // ============================================================
//     // 6. Fetch Tool Parameters
//     // ============================================================
//     useEffect(() => {
//         if (!tool) return;

//         const fetchParameters = async () => {
//             try {
//                 const response = await fetch(
//                     `${API}/tester/tool-parameters/?tool=${tool.id}`,
//                     {
//                         headers: {
//                             Authorization: `Bearer ${token}`,
//                             "Content-Type": "application/json",
//                         },
//                     }
//                 );

//                 const data = await response.json();

//                 if (!response.ok) {
//                     throw data;
//                 }

//                 setParameters(data);
//             } catch (error) {
//                 console.error(
//                     "Error fetching tool parameters:",
//                     error
//                 );

//                 setParameters({});
//             }
//         };

//         fetchParameters();
//     }, [tool]);

//     // ============================================================
//     // 7. Update Project Stage
//     // ============================================================
//     const updateStage = async (newStage) => {
//         try {
//             const response = await fetch(
//                 `${API}/tester/projects/${projectId}/stage/`,
//                 {
//                     method: "PUT",
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                         "Content-Type": "application/json",
//                     },
//                     body: JSON.stringify({
//                         stage: newStage,
//                     }),
//                 }
//             );

//             const data = await response.json();

//             if (!response.ok) {
//                 console.error(
//                     "Stage update failed:",
//                     response.status,
//                     data
//                 );

//                 return false;
//             }

//             setProject((prev) => ({
//                 ...prev,
//                 current_stage: newStage,
//             }));

//             navigate(
//                 `/tester/testing/${projectId}/${newStage}`,
//                 {
//                     replace: true,
//                 }
//             );

//             return true;
//         } catch (error) {
//             console.error(
//                 "Error updating stage:",
//                 error
//             );

//             return false;
//         }
//     };

//     // ============================================================
//     // 8. Back To Projects
//     // ============================================================
//     const handleBackToProjects = () => {
//         navigate("/tester/testing");
//     };

//     // ============================================================
//     // 9. Advance To Next Stage
//     // ============================================================
//     const advanceStage = async () => {
//         const current = stages.find(
//             (s) => s.id === stage
//         );

//         if (!current) return;

//         const ordered = [...stages].sort(
//             (prev, next) =>
//                 (prev.stage_order ?? 0) -
//                 (next.stage_order ?? 0)
//         );

//         const currentIndex = ordered.findIndex(
//             (s) => s.id === current.id
//         );

//         if (
//             currentIndex === -1 ||
//             currentIndex === ordered.length - 1
//         ) {
//             return;
//         }

//         const next = ordered[currentIndex + 1];

//         const success = await updateStage(
//             next.stage_id
//         );

//         if (success) {
//             setStage(next.id);
//         }
//     };

//     // ============================================================
//     // 10. Current Stage Code
//     // ============================================================
//     const currentStageCode = stages.find(
//         (prev) => prev.id === stage
//     )?.stage_id;

//     // ============================================================
//     // UI
//     // ============================================================
//     return (
//         <div className="testing-page">

//             {/* ==================================================
//                 Header
//             ================================================== */}
//             <div className="testing-header">
//                 <h2>Testing Workspace</h2>

//                 <button
//                     className="back-to-list-btn"
//                     onClick={handleBackToProjects}
//                 >
//                     ← Back to Projects
//                 </button>
//             </div>

//             {project && (
//                 <div className="project-info-box">

//                     <h3>Project Information</h3>

//                     <div className="project-details">

//                         <div className="info-row">
//                             <label>Project ID</label>
//                             <span>
//                                 {project.project_id}
//                             </span>
//                         </div>

//                         <div className="info-row">
//                             <label>Project Name</label>
//                             <span>
//                                 {project.project_name}
//                             </span>
//                         </div>

//                         <div className="info-row">
//                             <label>Customer</label>
//                             <span>
//                                 {project.customer}
//                             </span>
//                         </div>

//                         <div className="info-row">
//                             <label>Project Type</label>

//                             <span>
//                                 {selectedSuite?.suite_name ||
//                                     project.suite_name ||
//                                     "N/A"}
//                             </span>
//                         </div>

//                         <div className="info-row">
//                             <label>Priority</label>

//                             <span>
//                                 {project.priority}
//                             </span>
//                         </div>

//                         <div className="info-row">
//                             <label>Deadline</label>

//                             <span>
//                                 {project.deadline}
//                             </span>
//                         </div>

//                         <div className="info-row">
//                             <label>Current Stage</label>

//                             <span className="stage-badge">
//                                 {stages.find(
//                                     (s) => s.id === stage
//                                 )?.stage_id || "N/A"}
//                             </span>
//                         </div>

//                     </div>
//                 </div>
//             )}

//             <StageHeader
//                 stages={stages}
//                 currentStage={
//                     stages.find(
//                         (s) => s.id === stage
//                     )?.stage_id
//                 }
//             />

//             {/* ==================================================
//                 Suite / Stage / Tool Controls
//             ================================================== */}
//             <div className="tool-control-box">

//                 {/* ==================================================
//                     SUITE
//                 ================================================== */}
//                 <div className="field">

//                     <label>Suite</label>

//                     <select
//                         value={suite}
//                         disabled
//                     >
//                         {selectedSuite ? (
//                             <option
//                                 value={String(
//                                     selectedSuite.id
//                                 )}
//                             >
//                                 {selectedSuite.suite_name}
//                             </option>
//                         ) : (
//                             <option value="">
//                                 Select Suite
//                             </option>
//                         )}
//                     </select>

//                 </div>

//                 {/* ==================================================
//                     STAGE
//                 ================================================== */}
//                 <div className="field">

//                     <label>Stage</label>

//                     <select
//                         value={stage}
//                         onChange={async (e) => {

//                             const selectedStage =
//                                 Number(
//                                     e.target.value
//                                 );

//                             const stageData =
//                                 stages.find(
//                                     (s) =>
//                                         s.id ===
//                                         selectedStage
//                                 );

//                             if (!stageData) return;

//                             const success =
//                                 await updateStage(
//                                     stageData.stage_id
//                                 );

//                             if (success) {
//                                 setStage(
//                                     selectedStage
//                                 );
//                             }
//                         }}
//                     >

//                         {stages.map((item) => (
//                             <option
//                                 key={item.id}
//                                 value={item.id}
//                             >
//                                 {item.stage_name}
//                             </option>
//                         ))}

//                     </select>

//                 </div>

//                 {/* ==================================================
//                     TOOL
//                 ================================================== */}
//                 <div className="field">

//                     <label>Tool</label>

//                     <select
//                         value={selectedTool}
//                         onChange={(e) => {

//                             const id =
//                                 Number(
//                                     e.target.value
//                                 );

//                             setSelectedTool(id);

//                             const selected =
//                                 tools.find(
//                                     (t) =>
//                                         t.id === id
//                                 );

//                             setTool(selected);
//                         }}
//                     >

//                         <option value="">
//                             Select Tool
//                         </option>

//                         {tools.map((item) => (
//                             <option
//                                 key={item.id}
//                                 value={item.id}
//                             >
//                                 {item.tool_name}
//                             </option>
//                         ))}

//                     </select>

//                 </div>

//             </div>

//             {/* ==================================================
//                 Tool Parameters
//             ================================================== */}
//             {tool && (
//                 <ToolParameters
//                     tool={tool}
//                     parameters={parameters}
//                     setParameters={setParameters}
//                     stageCode={currentStageCode}
//                     onAdvanceStage={advanceStage}
//                 />
//             )}

//         </div>
//     );
// }

// export default Testing;


import { useEffect, useState } from "react";
import StageHeader from "./StageHeader";
import ToolParameters from "./ToolParameter/ToolParameters";
import { useParams, useNavigate } from "react-router-dom";
import "./Testing.css";

function Testing() {
    const { projectId, stage: urlStage } = useParams();
    const navigate = useNavigate();

    const API = "http://127.0.0.1:8000";
    const token = sessionStorage.getItem("access");
    const [project, setProject] = useState(null);

    const [suites, setSuites] = useState([]);
    const [stages, setStages] = useState([]);
    const [tools, setTools] = useState([]);

    const [suite, setSuite] = useState("");
    const [selectedSuite, setSelectedSuite] = useState(null);

    const [stage, setStage] = useState("");
    const [tool, setTool] = useState(null);

    const [parameters, setParameters] = useState({});
    const [selectedTool, setSelectedTool] = useState("");

    const normalize = (value) => {
        return String(value ?? "")
            .trim()
            .toUpperCase();
    };

    const SUITE_TYPE_MAP = {
        WEBAPP: [
            "WEBAPP",
            "WEB",
            "WEB APPLICATION",
            "WEB APPLICATION TESTING",
        ],

        NETWORK: [
            "NETWORK",
            "NETWORK TESTING",
            "NETWORK SECURITY",
        ],

        API: [
            "API",
            "API TESTING",
            "API SECURITY",
        ],

        MOBILE: [
            "MOBILE",
            "MOBILE TESTING",
            "MOBILE APPLICATION",
        ],

        IOT: [
            "IOT",
            "IOT & EMBEDDED",
            "IOT AND EMBEDDED",
            "IOT EMBEDDED",
        ],

        CYBER: [
            "CYBER",
            "CYBERSECURITY",
            "CYBER SECURITY",
        ],

        THICK: [
            "THICK",
            "THICK CLIENT",
            "THICK CLIENT TESTING",
        ],

        SOURCE: [
            "SOURCE",
            "SOURCE CODE",
            "SOURCE CODE ANALYSIS",
        ],

        RADIO: [
            "RADIO",
            "RADIO & WIRELESS",
            "RADIO AND WIRELESS",
            "WIRELESS",
        ],
    };

    const isProjectSuiteMatch = ( projectType, suiteDatabaseId, suiteCode, suiteName ) => {
        const normalizedProjectType = normalize(projectType);

        const possibleValues =
            SUITE_TYPE_MAP[normalizedProjectType] || [
                normalizedProjectType,
            ];

        return possibleValues.some((value) => {
            const normalizedValue = normalize(value);

            return (
                normalizedValue === suiteDatabaseId ||
                normalizedValue === suiteCode ||
                normalizedValue === suiteName
            );
        });
    };

    useEffect(() => {
        const fetchSuites = async () => {
            try {
                const response = await fetch(
                    `${API}/master/suites/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.detail ||
                            "Failed to fetch suites"
                    );
                }

                if (Array.isArray(data)) {
                    // console.table(
                    //     data.map((item) => ({
                    //         id: item.id,
                    //         suite_id: item.suite_id,
                    //         suite_name:
                    //             item.suite_name,
                    //     }))
                    // );
                    setSuites(data);
                } else {
                    setSuites([]);
                }
            } catch (error) {
                console.error( "Error fetching suites:", error );
                setSuites([]);
            }
        };

        fetchSuites();
    }, []);

    useEffect(() => {
        if (!projectId) return;

        const fetchProject = async () => {
            try {
                const response = await fetch( `${API}/tester/projects/${projectId}/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                const data = await response.json();
                if (!response.ok) {
                    throw data;
                }
                setProject(data);
            } catch (error) {
                console.error( "Error fetching project:", error );
                setProject(null);
            }
        };

        fetchProject();
    }, [projectId]);

    // ============================================================
    // 3. MATCH PROJECT WITH SUITE
    // ============================================================

    useEffect(() => {
        if (!project || suites.length === 0) {
            return;
        }

        const projectType = normalize(
            project.project_type
        );

        const projectSuiteName = normalize(
            project.suite_name
        );

        const projectSuiteId = normalize(
            project.suite_id
        );

        console.log(
            "================================="
        );

        console.log(
            "PROJECT TYPE:",
            projectType
        );

        console.log(
            "PROJECT SUITE NAME:",
            projectSuiteName
        );

        console.log(
            "PROJECT SUITE ID:",
            projectSuiteId
        );

        console.log(
            "AVAILABLE SUITES:",
            suites
        );

        // --------------------------------------------------------
        // First: Try explicit suite_id
        // --------------------------------------------------------

        let matchedSuite = null;

        if (projectSuiteId) {
            matchedSuite = suites.find(
                (item) => {
                    const databaseId =
                        normalize(item.id);

                    const suiteCode =
                        normalize(item.suite_id);

                    return (
                        projectSuiteId ===
                            databaseId ||
                        projectSuiteId ===
                            suiteCode
                    );
                }
            );
        }

        // --------------------------------------------------------
        // Second: Try explicit suite_name
        // --------------------------------------------------------

        if (
            !matchedSuite &&
            projectSuiteName
        ) {
            matchedSuite = suites.find(
                (item) => {
                    const suiteName =
                        normalize(
                            item.suite_name
                        );

                    return (
                        projectSuiteName ===
                        suiteName
                    );
                }
            );
        }

        // --------------------------------------------------------
        // Third: Match project_type
        // --------------------------------------------------------

        if (!matchedSuite && projectType) {
            matchedSuite = suites.find(
                (item) => {
                    const suiteDatabaseId =
                        normalize(item.id);

                    const suiteCode =
                        normalize(item.suite_id);

                    const suiteName =
                        normalize(
                            item.suite_name
                        );

                    return isProjectSuiteMatch(
                        projectType,
                        suiteDatabaseId,
                        suiteCode,
                        suiteName
                    );
                }
            );
        }

        // --------------------------------------------------------
        // Suite found
        // --------------------------------------------------------

        if (matchedSuite) {
            console.log(
                "MATCHED SUITE:",
                matchedSuite
            );

            setSelectedSuite(
                matchedSuite
            );

            /*
             * IMPORTANT:
             *
             * The API expects the database ID
             * for:
             *
             * /master/stages/?suite=ID
             *
             * and:
             *
             * /master/tools/?suite=ID
             */

            setSuite(
                String(matchedSuite.id)
            );

            return;
        }

        // --------------------------------------------------------
        // Suite not found
        // --------------------------------------------------------

        console.error(
            "NO SUITE FOUND FOR PROJECT:",
            project
        );

        console.error(
            "PROJECT TYPE:",
            projectType
        );

        console.error(
            "PROJECT SUITE ID:",
            projectSuiteId
        );

        console.error(
            "PROJECT SUITE NAME:",
            projectSuiteName
        );

        console.table(
            suites.map((item) => ({
                id: item.id,
                suite_id: item.suite_id,
                suite_name:
                    item.suite_name,
            }))
        );

        setSelectedSuite(null);
        setSuite("");
    }, [project, suites]);

    // ============================================================
    // 4. FETCH STAGES FOR SELECTED SUITE
    // ============================================================

    useEffect(() => {
        if (!suite) {
            setStages([]);
            setStage("");
            return;
        }

        const fetchStages = async () => {
            try {
                console.log(
                    "FETCHING STAGES FOR SUITE:",
                    suite
                );

                const response = await fetch(
                    `${API}/master/stages/?suite=${suite}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type":
                                "application/json",
                        },
                    }
                );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw data;
                }

                console.log(
                    "STAGES:",
                    data
                );

                if (!Array.isArray(data)) {
                    setStages([]);
                    setStage("");
                    return;
                }

                setStages(data);

                // ------------------------------------------------
                // Priority 1: URL stage
                // ------------------------------------------------

                if (urlStage) {
                    const normalizedUrlStage =
                        normalize(urlStage);

                    const stageFromUrl =
                        data.find(
                            (item) =>
                                normalize(
                                    item.stage_id
                                ) ===
                                    normalizedUrlStage ||
                                normalize(
                                    item.id
                                ) ===
                                    normalizedUrlStage
                        );

                    if (stageFromUrl) {
                        console.log(
                            "STAGE FROM URL:",
                            stageFromUrl
                        );

                        setStage(
                            stageFromUrl.id
                        );

                        return;
                    }
                }

                // ------------------------------------------------
                // Priority 2: Project current stage
                // ------------------------------------------------

                if (
                    project?.current_stage
                ) {
                    const currentStage =
                        data.find(
                            (item) =>
                                normalize(
                                    item.stage_id
                                ) ===
                                    normalize(
                                        project.current_stage
                                    ) ||
                                normalize(
                                    item.id
                                ) ===
                                    normalize(
                                        project.current_stage
                                    )
                        );

                    if (currentStage) {
                        console.log(
                            "CURRENT PROJECT STAGE:",
                            currentStage
                        );

                        setStage(
                            currentStage.id
                        );

                        return;
                    }
                }

                // ------------------------------------------------
                // Priority 3: First stage
                // ------------------------------------------------

                if (data.length > 0) {
                    const orderedStages =
                        [...data].sort(
                            (a, b) =>
                                (a.stage_order ??
                                    0) -
                                (b.stage_order ??
                                    0)
                        );

                    setStage(
                        orderedStages[0].id
                    );
                } else {
                    setStage("");
                }
            } catch (error) {
                console.error(
                    "Error fetching stages:",
                    error
                );

                setStages([]);
                setStage("");
            }
        };

        fetchStages();
    }, [suite, project, urlStage]);

    // ============================================================
    // 5. FETCH TOOLS
    // ============================================================

    useEffect(() => {
        if (!suite || !stage) {
            setTools([]);
            setTool(null);
            setSelectedTool("");
            return;
        }

        const fetchTools = async () => {
            try {
                console.log(
                    "FETCHING TOOLS:",
                    {
                        suite,
                        stage,
                    }
                );

                const response = await fetch(
                    `${API}/master/tools/?suite=${suite}&stage=${stage}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type":
                                "application/json",
                        },
                    }
                );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw data;
                }

                console.log(
                    "TOOLS:",
                    data
                );

                if (!Array.isArray(data)) {
                    setTools([]);
                    setTool(null);
                    setSelectedTool("");
                    return;
                }

                setTools(data);

                // ------------------------------------------------
                // Keep first tool selected
                // ------------------------------------------------

                if (data.length > 0) {
                    const firstTool =
                        data[0];

                    setTool(firstTool);

                    setSelectedTool(
                        firstTool.id
                    );
                } else {
                    setTool(null);
                    setSelectedTool("");
                }
            } catch (error) {
                console.error(
                    "Error fetching tools:",
                    error
                );

                setTools([]);
                setTool(null);
                setSelectedTool("");
            }
        };

        fetchTools();
    }, [suite, stage]);

    // ============================================================
    // 6. FETCH TOOL PARAMETERS
    // ============================================================

    useEffect(() => {
        if (!tool?.id) {
            setParameters({});
            return;
        }

        const fetchParameters = async () => {
            try {
                console.log(
                    "FETCHING PARAMETERS FOR TOOL:",
                    tool.id
                );

                const response = await fetch(
                    `${API}/tester/tool-parameters/?tool=${tool.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type":
                                "application/json",
                        },
                    }
                );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw data;
                }

                console.log(
                    "TOOL PARAMETERS:",
                    data
                );

                setParameters(data);
            } catch (error) {
                console.error(
                    "Error fetching tool parameters:",
                    error
                );

                setParameters({});
            }
        };

        fetchParameters();
    }, [tool]);

    // ============================================================
    // 7. UPDATE PROJECT STAGE
    // ============================================================

    const updateStage = async (
        newStage
    ) => {
        if (!projectId || !newStage) {
            return false;
        }

        try {
            console.log(
                "UPDATING PROJECT STAGE:",
                newStage
            );

            const response = await fetch(
                `${API}/tester/projects/${projectId}/stage/`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        stage: newStage,
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                console.error(
                    "Stage update failed:",
                    response.status,
                    data
                );

                return false;
            }

            console.log(
                "STAGE UPDATED:",
                data
            );

            // Update local project
            setProject((prev) => {
                if (!prev) return prev;

                return {
                    ...prev,
                    current_stage:
                        newStage,
                };
            });

            // Navigate using stage code
            navigate(
                `/tester/testing/${projectId}/${newStage}`,
                {
                    replace: true,
                }
            );

            return true;
        } catch (error) {
            console.error(
                "Error updating stage:",
                error
            );

            return false;
        }
    };

    // ============================================================
    // 8. BACK TO PROJECTS
    // ============================================================

    const handleBackToProjects =
        () => {
            navigate(
                "/tester/testing"
            );
        };

    // ============================================================
    // 9. ADVANCE TO NEXT STAGE
    // ============================================================

    const advanceStage =
        async () => {
            if (!stage || !stages.length) {
                return;
            }

            const currentStage =
                stages.find(
                    (item) =>
                        String(item.id) ===
                        String(stage)
                );

            if (!currentStage) {
                console.error(
                    "CURRENT STAGE NOT FOUND:",
                    stage
                );

                return;
            }

            const orderedStages =
                [...stages].sort(
                    (a, b) =>
                        (a.stage_order ??
                            0) -
                        (b.stage_order ??
                            0)
                );

            const currentIndex =
                orderedStages.findIndex(
                    (item) =>
                        String(item.id) ===
                        String(
                            currentStage.id
                        )
                );

            if (
                currentIndex === -1 ||
                currentIndex ===
                    orderedStages.length - 1
            ) {
                console.log(
                    "Already at final stage"
                );

                return;
            }

            const nextStage =
                orderedStages[
                    currentIndex + 1
                ];

            console.log(
                "ADVANCING STAGE:",
                {
                    current:
                        currentStage,
                    next: nextStage,
                }
            );

            const success =
                await updateStage(
                    nextStage.stage_id
                );

            if (success) {
                setStage(
                    nextStage.id
                );
            }
        };

    // ============================================================
    // 10. CURRENT STAGE
    // ============================================================

    const currentStageObject =
        stages.find(
            (item) =>
                String(item.id) ===
                String(stage)
        );

    const currentStageCode =
        currentStageObject?.stage_id ||
        "";

    // ============================================================
    // 11. HANDLE MANUAL STAGE CHANGE
    // ============================================================

    const handleStageChange =
        async (event) => {
            const selectedValue =
                event.target.value;

            const selectedStage =
                stages.find(
                    (item) =>
                        String(item.id) ===
                        String(
                            selectedValue
                        )
                );

            if (!selectedStage) {
                return;
            }

            const success =
                await updateStage(
                    selectedStage.stage_id
                );

            if (success) {
                setStage(
                    selectedStage.id
                );
            }
        };

    // ============================================================
    // 12. HANDLE TOOL CHANGE
    // ============================================================

    const handleToolChange =
        (event) => {
            const selectedValue =
                event.target.value;

            const selected =
                tools.find(
                    (item) =>
                        String(item.id) ===
                        String(
                            selectedValue
                        )
                );

            if (!selected) {
                setSelectedTool("");
                setTool(null);
                return;
            }

            setSelectedTool(
                selected.id
            );

            setTool(selected);
        };

    // ============================================================
    // UI
    // ============================================================

    return (
        <div className="testing-page">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="testing-header">
                <h2>
                    Testing Workspace
                </h2>

                <button
                    className="back-to-list-btn"
                    onClick={
                        handleBackToProjects
                    }
                >
                    ← Back to Projects
                </button>
            </div>

            {/* ==================================================
                PROJECT INFORMATION
            ================================================== */}

            {project && (
                <div className="project-info-box">

                    <h3>
                        Project Information
                    </h3>

                    <div className="project-details">

                        {/* Project ID */}

                        <div className="info-row">
                            <label>
                                Project ID
                            </label>

                            <span>
                                {project.project_id ||
                                    "N/A"}
                            </span>
                        </div>

                        {/* Project Name */}

                        <div className="info-row">
                            <label>
                                Project Name
                            </label>

                            <span>
                                {project.project_name ||
                                    "N/A"}
                            </span>
                        </div>

                        {/* Customer */}

                        <div className="info-row">
                            <label>
                                Customer
                            </label>

                            <span>
                                {project.customer ||
                                    "N/A"}
                            </span>
                        </div>

                        {/* Project Type / Suite */}

                        <div className="info-row">
                            <label>
                                Project Type
                            </label>

                            <span>
                                {selectedSuite?.suite_name ||
                                    project.suite_name ||
                                    "N/A"}
                            </span>
                        </div>

                        {/* Priority */}

                        <div className="info-row">
                            <label>
                                Priority
                            </label>

                            <span>
                                {project.priority ||
                                    "N/A"}
                            </span>
                        </div>

                        {/* Deadline */}

                        <div className="info-row">
                            <label>
                                Deadline
                            </label>

                            <span>
                                {project.deadline ||
                                    "N/A"}
                            </span>
                        </div>

                        {/* Current Stage */}

                        <div className="info-row">
                            <label>
                                Current Stage
                            </label>

                            <span className="stage-badge">
                                {currentStageCode ||
                                    project.current_stage ||
                                    "N/A"}
                            </span>
                        </div>

                    </div>
                </div>
            )}

            {/* ==================================================
                STAGE HEADER
            ================================================== */}

            <StageHeader
                stages={stages}
                currentStage={
                    currentStageCode
                }
            />

            {/* ==================================================
                SUITE / STAGE / TOOL
            ================================================== */}

            <div className="tool-control-box">

                {/* ==================================================
                    SUITE
                ================================================== */}

                <div className="field">

                    <label>
                        Suite
                    </label>

                    <select
                        value={suite}
                        disabled
                    >
                        {selectedSuite ? (
                            <option
                                value={String(
                                    selectedSuite.id
                                )}
                            >
                                {
                                    selectedSuite.suite_name
                                }
                            </option>
                        ) : (
                            <option value="">
                                Select Suite
                            </option>
                        )}
                    </select>

                </div>

                {/* ==================================================
                    STAGE
                ================================================== */}

                <div className="field">

                    <label>
                        Stage
                    </label>

                    <select
                        value={
                            stage || ""
                        }
                        onChange={
                            handleStageChange
                        }
                        disabled={
                            stages.length === 0
                        }
                    >
                        {stages.length ===
                        0 ? (
                            <option value="">
                                No Stages Available
                            </option>
                        ) : (
                            stages.map(
                                (item) => (
                                    <option
                                        key={
                                            item.id
                                        }
                                        value={
                                            item.id
                                        }
                                    >
                                        {
                                            item.stage_name
                                        }
                                    </option>
                                )
                            )
                        )}
                    </select>

                </div>

                {/* ==================================================
                    TOOL
                ================================================== */}

                <div className="field">

                    <label>
                        Tool
                    </label>

                    <select
                        value={
                            selectedTool ||
                            ""
                        }
                        onChange={
                            handleToolChange
                        }
                        disabled={
                            tools.length === 0
                        }
                    >

                        {tools.length ===
                        0 ? (
                            <option value="">
                                No Tools Available
                            </option>
                        ) : (
                            <>
                                <option value="">
                                    Select Tool
                                </option>

                                {tools.map(
                                    (item) => (
                                        <option
                                            key={
                                                item.id
                                            }
                                            value={
                                                item.id
                                            }
                                        >
                                            {
                                                item.tool_name
                                            }
                                        </option>
                                    )
                                )}
                            </>
                        )}

                    </select>

                </div>

            </div>

            {/* ==================================================
                TOOL PARAMETERS
            ================================================== */}

            {tool && (
                <ToolParameters
                    tool={tool}
                    parameters={
                        parameters
                    }
                    setParameters={
                        setParameters
                    }
                    stageCode={
                        currentStageCode
                    }
                    onAdvanceStage={
                        advanceStage
                    }
                />
            )}

        </div>
    );
}

export default Testing;