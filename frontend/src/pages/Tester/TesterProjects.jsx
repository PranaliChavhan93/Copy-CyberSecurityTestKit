// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import "../Master/ProjectView.css";
// import StageProgress from "./StageProgress";

// function TesterProjects() {
//     const navigate = useNavigate();
//     const API = "http://127.0.0.1:8000";

//     const PROJECT_TYPE_ICONS = {
//         WEBAPP: "🌐",
//         NETWORK: "🔗",
//         API: "⚡",
//         MOBILE: "📱",
//         CYBER: "🛡️",
//         IOT: "📡",
//         THICK: "💻",
//         SOURCE: "📄",
//         RADIO: "📻",
//     };

//     const SUITE_NAMES = {
//         WEBAPP: "Web Application",
//         NETWORK: "Network Testing",
//         API: "API Testing",
//         MOBILE: "Mobile Testing",
//         CYBER: "CyberSecurity",
//         IOT: "IoT & Embedded",
//         THICK: "Thick Client",
//         SOURCE: "Source Code Analysis",
//         RADIO: "Radio & Wireless",
//     };

//     const SUITE_TYPE_MAP = {
//         WEBAPP: ["WEBAPP", "WEB", "WEB APPLICATION", "WEB APPLICATION TESTING"],
//         NETWORK: ["NETWORK", "NETWORK TESTING"],
//         API: ["API", "API TESTING"],
//         MOBILE: ["MOBILE", "MOBILE TESTING"],
//         CYBER: ["CYBER", "CYBERSECURITY", "CYBER SECURITY"],
//         IOT: ["IOT", "IOT & EMBEDDED", "IOT AND EMBEDDED", "IOT EMBEDDED"],
//         THICK: ["THICK", "THICK CLIENT", "THICK CLIENT TESTING"],
//         SOURCE: ["SOURCE", "SOURCE CODE", "SOURCE CODE ANALYSIS"],
//         RADIO: ["RADIO", "RADIO & WIRELESS", "RADIO AND WIRELESS", "WIRELESS"],
//     };

//     const STAGES = [
//         { 
//             code: "INFO", 
//             aliases: ["INFO", "ST001"], 
//             name: "Information Gathering" 
//         },
//         { 
//             code: "SCAN", 
//             aliases: ["SCAN", "ST002"], 
//             name: "Scanning & Enumeration" 
//         },
//         { code: 
//             "VULN", 
//             aliases: ["VULN", "ST003"], 
//             name: "Vulnerability Assessment" 
//         },
//         { code: 
//             "EXPLOIT", 
//             aliases: ["EXPLOIT", "ST004"], 
//             name: "Exploitation" 
//         },
//         { code: 
//             "POST", 
//             aliases: ["POST", "ST005"], 
//             name: "Post Exploitation" 
//         },
//     ];

//     const normalize = (value) => String(value ?? "").trim().toUpperCase();

//     const getStageCode = (stage) => {
//         const normalized = normalize(stage);

//         const stageMap = {
//             // Codes
//             INFO: "INFO",
//             SCAN: "SCAN",
//             VULN: "VULN",
//             EXPLOIT: "EXPLOIT",
//             POST: "POST",
//             COMPLETED: "COMPLETED",

//             // Database stage IDs
//             ST001: "INFO",
//             ST002: "SCAN",
//             ST003: "VULN",
//             ST004: "EXPLOIT",
//             ST005: "POST",
//             ST006: "COMPLETED",

//             // Full stage names
//             "INFORMATION GATHERING": "INFO",
//             "SCANNING & ENUMERATION": "SCAN",
//             "SCANNING AND ENUMERATION": "SCAN",
//             "VULNERABILITY ASSESSMENT": "VULN",
//             "EXPLOITATION": "EXPLOIT",
//             "POST EXPLOITATION": "POST",
//             "POST-EXPLOITATION": "POST",
//             "COMPLETED": "COMPLETED",
//         };

//         return stageMap[normalized] || "INFO";
//     };

//     const getStageName = (stage) => {
//         const normalized = getStageCode(stage);
//         if (normalized === "COMPLETED") 
//             return "Completed";
//         const found = STAGES.find(
//             (item) => item.code === normalized
//         );
//         return found?.name || "Not Started";
//     };

//     const [projects, setProjects] = useState([]);
//     const [suites, setSuites] = useState([]);
//     const [selectType, setSelectType] = useState("ALL");
//     const [rowsPerPage, setRowsPerPage] = useState(10);
//     const [currentPage, setCurrentPage] = useState(1);

//     const filteredProjects = selectType === "ALL"
//         ? projects
//         : projects.filter((project) => normalize(project.project_type) === normalize(selectType));

//     const totalRows = filteredProjects.length;
//     const totalPages = Math.ceil(totalRows / rowsPerPage);
//     const startIndex = (currentPage - 1) * rowsPerPage;
//     const endIndex = startIndex + rowsPerPage;
//     const currentProjects = filteredProjects.slice(startIndex, endIndex);

//     useEffect(() => {
//         const token = sessionStorage.getItem("access");
//         const fetchProjects = async () => {
//         try {
//             const response = await fetch(`${API}/tester/projects/`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     "Content-Type": "application/json",
//                 },
//             });
//             if (!response.ok) {
//                 const text = await response.text();
//                 throw new Error(`HTTP ${response.status}: ${text}`);
//             }
//             const data = await response.json();
//             setProjects(Array.isArray(data) ? data : []);
//         } catch (error) {
//             console.error("Error fetching projects:", error);
//             toast.error("Failed to load projects");
//             setProjects([]);
//         }
//         };
//         fetchProjects();
//     }, []);

//     useEffect(() => {
//         const token = sessionStorage.getItem("access");
//         const fetchSuites = async () => {
//         try {
//             const response = await fetch(`${API}/master/suites/`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     "Content-Type": "application/json",
//                 },
//             });
//             const data = await response.json();
//             if (!response.ok) {
//                 throw new Error(data.detail || "Failed to fetch suites");
//             }
//             setSuites(Array.isArray(data) ? data : []);
//         } catch (error) {
//             console.error("Error fetching suites:", error);
//             setSuites([]);
//         }
//         };
//         fetchSuites();
//     }, []);

//     const getSuiteName = (project) => {
//         if (!project) return "N/A";

//         if (project.suite_name && String(project.suite_name).trim()) {
//             return project.suite_name;
//         }

//         const projectSuiteId = normalize(project.suite_id);
//         if (projectSuiteId) {
//             const matchedById = suites.find((suite) => {
//                 const id = normalize(suite.id);
//                 const code = normalize(suite.suite_id);
//                 const name = normalize(suite.suite_name);
//                 return projectSuiteId === id || projectSuiteId === code || projectSuiteId === name;
//             });
//             if (matchedById) {
//                 return matchedById.suite_name || "N/A";
//             }
//         }

//         const projectType = normalize(project.project_type);
//         if (SUITE_NAMES[projectType]) {
//             return SUITE_NAMES[projectType];
//         }

//         const possibleValues = SUITE_TYPE_MAP[projectType] || [projectType];
//         const matchedSuite = suites.find((suite) => {
        
//             const id = normalize(suite.id);
//             const code = normalize(suite.suite_id);
//             const name = normalize(suite.suite_name);
            
//             return possibleValues.some((value) => {
//                 const normalizedValue = normalize(value);
//                 return normalizedValue === id || normalizedValue === code || normalizedValue === name;
//             });
//         });
//         if (matchedSuite) {
//         return matchedSuite.suite_name || "N/A";
//         }

//         console.warn("SUITE NOT FOUND FOR PROJECT:", {
//             project_id: project.project_id,
//             project_type: project.project_type,
//             suite_id: project.suite_id,
//             suite_name: project.suite_name,
//         });
//         return "N/A";
//     };

//     const getProjectIcon = (type) => PROJECT_TYPE_ICONS[normalize(type)] || "📋";
    
//     const openTesting = (projectId, currentStage) => {
//         const stageCode = getStageCode(currentStage);
//         navigate(`/tester/testing/${projectId}/${stageCode}`);
//     };

//     const renderStageDots = (currentStage) => {
//         const normalizedStage = getStageCode(currentStage);

//         let currentIndex = STAGES.findIndex(
//             (item) => item.code === normalizedStage
//         );

//         if (normalizedStage === "COMPLETED") {
//             currentIndex = STAGES.length;
//         }

//         return STAGES.map((item, index) => {
//             let status = "pending";

//             if (normalizedStage === "COMPLETED") {
//                 status = "completed";
//             } else if (index < currentIndex) {
//                 status = "completed";
//             } else if (index === currentIndex) {
//                 status = "current";
//             }

//             return (
//                 <span
//                     key={item.code}
//                     className={`stage-dot ${status}`}
//                     title={`${item.name}${status === "current" ? " - Current Stage" : ""}`}
//                 />
//             );
//         });
//     };

//     const handleFilterChange = (event) => {
//         setSelectType(event.target.value);
//         setCurrentPage(1);
//     };

//     // const handleRowsChange = (event) => {
//     //     setRowsPerPage(Number(event.target.value));
//     //     setCurrentPage(1);
//     // };

//     return (
//         <div className="view-container">
//             <div className="table-card">
//                 <div className="table-header">
//                 <h2>
//                     <i className="fas fa-tasks"></i> My Projects
//                     <span 
//                         style={{ 
//                             fontSize: "14px", 
//                             fontWeight: "normal", 
//                             color: "#6b7a9a", 
//                             marginLeft: "12px" 
//                         }}>
//                         ({filteredProjects.length} projects)
//                     </span>
//                 </h2>
//                 <div className="header-actions">
//                     <div className="select-role">
                    
//                         <label className="role-label">Type</label>
//                         <select 
//                             value={selectType} 
//                             onChange={handleFilterChange}
//                         >
//                             <option value="ALL">All</option>
//                             <option value="WEBAPP">Web Application</option>
//                             <option value="NETWORK">Network Testing</option>
//                             <option value="API">API Testing</option>
//                             <option value="MOBILE">Mobile Testing</option>
//                             <option value="IOT">IoT</option>
//                             <option value="THICK">Thick Client</option>
//                             <option value="SOURCE">Source Code Analysis</option>
//                             <option value="RADIO">Radio & Wireless</option>
//                         </select>
//                     </div>
//                 </div>
//             </div>

//             <div className="project-grid">
//                 {currentProjects.length === 0 ? (
//                     <div className="empty-state" style=
//                     {{ 
//                         gridColumn: "1 / -1" 
//                     }}
//                     >
//                         <h3>No Projects Found</h3>
//                         <p>You haven't been assigned any projects yet</p>
//                         <p style=
//                             {{ 
//                                 fontSize: "13px", 
//                                 color: "#9ca3af" 
//                             }}>
//                             {
//                                 selectType !== "ALL" ? "Try changing your filters" : "Check back later for new assignments"
//                             }
//                         </p>
//                     </div>
//                 ) : (
//                     currentProjects.map((project) => (
//                     <div className="project-card" key={project.project_id}>
//                         <div className="card-header">
//                             <div className="project-name">
//                                 {getProjectIcon(project.project_type)} {project.project_name || "Unnamed Project"}
//                             </div>
//                         </div>

//                         <div className="card-body">
//                             <div className="project-type">
//                                 <i className="fas fa-tag"></i> {getSuiteName(project)}
//                             </div>
//                             <div className="deadline">
//                                 <i className="fas fa-calendar-plus"></i> {project.start_date || "-"}
//                             </div>
//                             <div className="deadline">
//                                 <i className="fas fa-calendar"></i> {project.deadline || "-"}
//                             </div>
//                             <div className="assigned-by">
//                                 <i className="fas fa-user"></i> Assigned By: {project.assigned_by || "N/A"}
//                             </div>
//                         </div>

//                         <div className="card-footer">
//                             <span className={`priority priority-${(project.priority || "medium").toLowerCase()}`}>
//                                 {project.priority || "MEDIUM"}
//                             </span>
//                             <span className={`status status-${(project.status || "pending").toLowerCase().replace(/\s/g, "-")}`}></span>
//                         </div>

//                         <div
//                             className="stage-section"
//                             onClick={() => openTesting(project.project_id, project.current_stage)}
//                         >
//                             <div className="stage-label">
//                                 <span>Progress</span>
//                                 <span>{getStageName(project.current_stage)}</span>
//                             </div>
//                             <div className="stage-progress">
//                                 {renderStageDots(project.current_stage)}
//                             </div>
//                         </div>
//                     </div>
//                     ))
//                 )}
//                 </div>

//                 {/* PAGINATION */}
//                 {/* <div className="pagination-footer">
//                 <div className="rows-section">
//                     <span>Rows per page:</span>
//                     <select value={rowsPerPage} onChange={handleRowsChange}>
//                     <option value={5}>5</option>
//                     <option value={10}>10</option>
//                     <option value={15}>15</option>
//                     <option value={20}>20</option>
//                     </select>
//                 </div>
//                 <div className="page-info">
//                     {totalRows === 0
//                     ? "0 of 0"
//                     : `${startIndex + 1}-${Math.min(endIndex, totalRows)} of ${totalRows}`}
//                 </div>
//                 <div className="page-buttons">
//                     <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
//                     &#8249;
//                     </button>
//                     <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(currentPage + 1)}>
//                     &#8250;
//                     </button>
//                 </div>
//                 </div> */}
//             </div>
//         </div>
//     );
// }

// export default TesterProjects;


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../Master/ProjectView.css";
import StageProgress from "./StageProgress";

function TesterProjects() {
    const navigate = useNavigate();
    const API = "http://127.0.0.1:8000";

    const PROJECT_TYPE_ICONS = {
        WEBAPP: "🌐",
        NETWORK: "🔗",
        API: "⚡",
        MOBILE: "📱",
        CYBER: "🛡️",
        IOT: "📡",
        THICK: "💻",
        SOURCE: "📄",
        RADIO: "📻",
    };

    const SUITE_NAMES = {
        WEBAPP: "Web Application",
        NETWORK: "Network Testing",
        API: "API Testing",
        MOBILE: "Mobile Testing",
        CYBER: "CyberSecurity",
        IOT: "IoT & Embedded",
        THICK: "Thick Client",
        SOURCE: "Source Code Analysis",
        RADIO: "Radio & Wireless",
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
        ],
        API: [
            "API",
            "API TESTING",
        ],
        MOBILE: [
            "MOBILE",
            "MOBILE TESTING",
        ],
        CYBER: [
            "CYBER",
            "CYBERSECURITY",
            "CYBER SECURITY",
        ],
        IOT: [
            "IOT",
            "IOT & EMBEDDED",
            "IOT AND EMBEDDED",
            "IOT EMBEDDED",
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

    const STAGES = [
        {
            code: "INFO",
            aliases: ["INFO", "ST001"],
            name: "Information Gathering",
        },
        {
            code: "SCAN",
            aliases: ["SCAN", "ST002"],
            name: "Scanning & Enumeration",
        },
        {
            code: "VULN",
            aliases: ["VULN", "ST003"],
            name: "Vulnerability Assessment",
        },
        {
            code: "EXPLOIT",
            aliases: ["EXPLOIT", "ST004"],
            name: "Exploitation",
        },
        {
            code: "POST",
            aliases: ["POST", "ST005"],
            name: "Post Exploitation",
        },
    ];

    const normalize = (value) => String(value ?? "")
            .trim()
            .toUpperCase();

    const getStageCode = (stage) => {
        const normalized = normalize(stage);

        const stageMap = {
            INFO: "INFO",
            SCAN: "SCAN",
            VULN: "VULN",
            EXPLOIT: "EXPLOIT",
            POST: "POST",
            COMPLETED: "COMPLETED",

            ST001: "INFO",
            ST002: "SCAN",
            ST003: "VULN",
            ST004: "EXPLOIT",
            ST005: "POST",
            ST006: "COMPLETED",

            "INFORMATION GATHERING": "INFO",
            "SCANNING & ENUMERATION": "SCAN",
            "SCANNING AND ENUMERATION": "SCAN",
            "VULNERABILITY ASSESSMENT": "VULN",
            "EXPLOITATION": "EXPLOIT",
            "POST EXPLOITATION": "POST",
            "POST-EXPLOITATION": "POST",
        };
        return stageMap[normalized] || "INFO";
    };

    const getStageName = (stage) => {
        const normalized = getStageCode(stage);

        if (normalized === "COMPLETED") {
            return "Completed";
        }
        const found = STAGES.find(
            (item) => item.code === normalized
        );
        return found?.name || "Not Started";
    };

    const [projects, setProjects] = useState([]);
    const [suites, setSuites] = useState([]);
    const [selectType, setSelectType] = useState("ALL");
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const filteredProjects =
        selectType === "ALL"
            ? projects
            : projects.filter(
                  (project) =>
                      normalize(project.project_type) ===
                      normalize(selectType)
              );

    const totalRows = filteredProjects.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    const currentProjects = filteredProjects.slice(
        startIndex,
        endIndex
    );

    useEffect(() => {
        const token = sessionStorage.getItem("access");
        const fetchProjects = async () => {
            try {
                const response = await fetch(
                    `${API}/tester/projects/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(
                        `HTTP ${response.status}: ${text}`
                    );
                }

                const data = await response.json();
                setProjects(
                    Array.isArray(data) ? data : []
                );
            } catch (error) {
                console.error( "Error fetching projects:", error );
                toast.error("Failed to load projects" );
                setProjects([]);
            }
        };

        fetchProjects();
    }, []);

    /*
     * Fetch suites
     */
    useEffect(() => {
        const token = sessionStorage.getItem("access");

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

                setSuites(
                    Array.isArray(data) ? data : []
                );
            } catch (error) {
                console.error(
                    "Error fetching suites:",
                    error
                );

                setSuites([]);
            }
        };

        fetchSuites();
    }, []);

    /*
     * Resolve suite name
     */
    const getSuiteName = (project) => {
        if (!project) {
            return "N/A";
        }

        /*
         * 1. Direct suite_name
         */
        if (
            project.suite_name &&
            String(project.suite_name).trim()
        ) {
            return project.suite_name;
        }

        /*
         * 2. Match using suite_id
         */
        const projectSuiteId = normalize(
            project.suite_id
        );

        if (projectSuiteId) {
            const matchedById = suites.find(
                (suite) => {
                    const id = normalize(suite.id);
                    const code = normalize(
                        suite.suite_id
                    );
                    const name = normalize(
                        suite.suite_name
                    );

                    return (
                        projectSuiteId === id ||
                        projectSuiteId === code ||
                        projectSuiteId === name
                    );
                }
            );

            if (matchedById) {
                return (
                    matchedById.suite_name ||
                    "N/A"
                );
            }
        }

        /*
         * 3. Match using project type
         */
        const projectType = normalize(
            project.project_type
        );

        if (SUITE_NAMES[projectType]) {
            return SUITE_NAMES[projectType];
        }

        /*
         * 4. Fallback suite matching
         */
        const possibleValues =
            SUITE_TYPE_MAP[projectType] ||
            [projectType];

        const matchedSuite = suites.find(
            (suite) => {
                const id = normalize(suite.id);
                const code = normalize(
                    suite.suite_id
                );
                const name = normalize(
                    suite.suite_name
                );

                return possibleValues.some(
                    (value) => {
                        const normalizedValue =
                            normalize(value);

                        return (
                            normalizedValue === id ||
                            normalizedValue === code ||
                            normalizedValue === name
                        );
                    }
                );
            }
        );

        if (matchedSuite) {
            return (
                matchedSuite.suite_name ||
                "N/A"
            );
        }

        console.warn(
            "SUITE NOT FOUND FOR PROJECT:",
            {
                project_id:
                    project.project_id,
                project_type:
                    project.project_type,
                suite_id:
                    project.suite_id,
                suite_name:
                    project.suite_name,
            }
        );

        return "N/A";
    };

    const getProjectIcon = (type) =>
        PROJECT_TYPE_ICONS[
            normalize(type)
        ] || "📋";

    /*
     * Open Testing page at the project's
     * current stage.
     */
    const openTesting = (
        projectId,
        currentStage
    ) => {
        const stageCode =
            getStageCode(currentStage);

        navigate(
            `/tester/testing/${projectId}/${stageCode}`
        );
    };

    const handleFilterChange = (event) => {
        setSelectType(
            event.target.value
        );

        setCurrentPage(1);
    };

    /*
     * Rows-per-page functionality kept
     * unchanged for future use.
     */
    // const handleRowsChange = (event) => {
    //     setRowsPerPage(Number(event.target.value));
    //     setCurrentPage(1);
    // };

    return (
        <div className="view-container">
            <div className="table-card">

                {/* HEADER */}
                <div className="table-header">
                    <h2>
                        <i className="fas fa-tasks"></i>{" "}
                        My Projects

                        <span
                            style={{
                                fontSize: "14px",
                                fontWeight: "normal",
                                color: "#6b7a9a",
                                marginLeft: "12px",
                            }}
                        >
                            ({filteredProjects.length}{" "}
                            projects)
                        </span>
                    </h2>

                    <div className="header-actions">
                        <div className="select-role">

                            <label className="role-label">
                                Type
                            </label>

                            <select
                                value={selectType}
                                onChange={
                                    handleFilterChange
                                }
                            >
                                <option value="ALL">
                                    All
                                </option>

                                <option value="WEBAPP">
                                    Web Application
                                </option>

                                <option value="NETWORK">
                                    Network Testing
                                </option>

                                <option value="API">
                                    API Testing
                                </option>

                                <option value="MOBILE">
                                    Mobile Testing
                                </option>

                                <option value="IOT">
                                    IoT
                                </option>

                                <option value="THICK">
                                    Thick Client
                                </option>

                                <option value="SOURCE">
                                    Source Code Analysis
                                </option>

                                <option value="RADIO">
                                    Radio & Wireless
                                </option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* PROJECT GRID */}
                <div className="project-grid">

                    {currentProjects.length === 0 ? (
                        <div
                            className="empty-state"
                            style={{
                                gridColumn:
                                    "1 / -1",
                            }}
                        >
                            <h3>
                                No Projects Found
                            </h3>

                            <p>
                                You haven't been
                                assigned any
                                projects yet
                            </p>

                            <p
                                style={{
                                    fontSize:
                                        "13px",
                                    color:
                                        "#9ca3af",
                                }}
                            >
                                {selectType !==
                                "ALL"
                                    ? "Try changing your filters"
                                    : "Check back later for new assignments"}
                            </p>
                        </div>
                    ) : (
                        currentProjects.map(
                            (project) => (
                                <div
                                    className="project-card"
                                    key={
                                        project.project_id
                                    }
                                >

                                    {/* CARD HEADER */}
                                    <div className="card-header">
                                        <div className="project-name">
                                            {getProjectIcon(
                                                project.project_type
                                            )}{" "}
                                            {project.project_name ||
                                                "Unnamed Project"}
                                        </div>
                                    </div>

                                    {/* CARD BODY */}
                                    <div className="card-body">

                                        <div className="project-type">
                                            <i className="fas fa-tag"></i>{" "}
                                            {getSuiteName(
                                                project
                                            )}
                                        </div>

                                        <div className="deadline">
                                            <i className="fas fa-calendar-plus"></i>{" "}
                                            {project.start_date ||
                                                "-"}
                                        </div>

                                        <div className="deadline">
                                            <i className="fas fa-calendar"></i>{" "}
                                            {project.deadline ||
                                                "-"}
                                        </div>

                                        <div className="assigned-by">
                                            <i className="fas fa-user"></i>{" "}
                                            Assigned By:{" "}
                                            {project.assigned_by ||
                                                "N/A"}
                                        </div>

                                    </div>

                                    {/* CARD FOOTER */}
                                    <div className="card-footer">

                                        <span
                                            className={`priority priority-${(
                                                project.priority ||
                                                "medium"
                                            )
                                                .toLowerCase()}`}
                                        >
                                            {project.priority ||
                                                "MEDIUM"}
                                        </span>

                                        <span
                                            className={`status status-${(
                                                project.status ||
                                                "pending"
                                            )
                                                .toLowerCase()
                                                .replace(
                                                    /\s/g,
                                                    "-"
                                                )}`}
                                        ></span>

                                    </div>

                                    {/* STAGE */}
                                    <div
                                        className="stage-section"
                                        onClick={() =>
                                            openTesting(
                                                project.project_id,
                                                project.current_stage
                                            )
                                        }
                                    >

                                        <div className="stage-label">
                                            <span>
                                                Progress
                                            </span>

                                            <span>
                                                {getStageName(
                                                    project.current_stage
                                                )}
                                            </span>
                                        </div>

                                        {/* 
                                         * Use the shared StageProgress
                                         * component.
                                         *
                                         * Current stage = BLUE
                                         * Previous stages = GREEN
                                         * Future stages = GREY
                                         */}
                                        <StageProgress
                                            stage={
                                                project.current_stage
                                            }
                                        />

                                    </div>

                                </div>
                            )
                        )
                    )}

                </div>

                {/* PAGINATION */}
                {/* 
                <div className="pagination-footer">

                    <div className="rows-section">
                        <span>
                            Rows per page:
                        </span>

                        <select
                            value={rowsPerPage}
                            onChange={
                                handleRowsChange
                            }
                        >
                            <option value={5}>
                                5
                            </option>

                            <option value={10}>
                                10
                            </option>

                            <option value={15}>
                                15
                            </option>

                            <option value={20}>
                                20
                            </option>
                        </select>
                    </div>

                    <div className="page-info">
                        {totalRows === 0
                            ? "0 of 0"
                            : `${startIndex + 1}-${Math.min(
                                  endIndex,
                                  totalRows
                              )} of ${totalRows}`}
                    </div>

                    <div className="page-buttons">

                        <button
                            disabled={
                                currentPage === 1
                            }
                            onClick={() =>
                                setCurrentPage(
                                    currentPage - 1
                                )
                            }
                        >
                            &#8249;
                        </button>

                        <button
                            disabled={
                                currentPage ===
                                    totalPages ||
                                totalPages === 0
                            }
                            onClick={() =>
                                setCurrentPage(
                                    currentPage + 1
                                )
                            }
                        >
                            &#8250;
                        </button>

                    </div>

                </div>
                */}

            </div>
        </div>
    );
}

export default TesterProjects;