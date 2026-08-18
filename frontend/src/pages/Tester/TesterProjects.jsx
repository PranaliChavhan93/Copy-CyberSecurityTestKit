
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../Master/ProjectView.css";

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

    const STAGE_MAP = {
        INFO: 0,
        SCAN: 1,
        VULN: 2,
        EXPLOIT: 3,
        POST: 4,
        COMPLETED: 5,

        ST001: 0,
        ST002: 1,
        ST003: 2,
        ST004: 3,
        ST005: 4,
        ST006: 5,
    };

    const getStageName = (stage) => {
        const stageMap = {
            INFO: "Information Gathering",
            SCAN: "Scanning & Enumeration",
            VULN: "Vulnerability Assessment",
            EXPLOIT: "Exploitation",
            POST: "Post Exploitation",
            COMPLETED: "Completed",

            ST001: "Information Gathering",
            ST002: "Scanning & Enumeration",
            ST003: "Vulnerability Assessment",
            ST004: "Exploitation",
            ST005: "Post Exploitation",
            ST006: "Completed",
        };

        return (
            stageMap[stage] ||
            stage ||
            "Not Started"
        );
    };

    const getStageCode = (stage) => {
        if (!stage) {
            return "INFO";
        }

        const stageCodeMap = {
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
        };

        return (
            stageCodeMap[stage] ||
            stage
        );
    };

    const normalize = (value) => {
        return String(value ?? "")
            .trim()
            .toUpperCase();
    };

    const [projects, setProjects] = useState([]);
    const [suites, setSuites] = useState([]);

    const [selectType, setSelectType] = useState("ALL");

    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [currentPage, setCurrentPage] = useState(1);

    const filteredProjects = selectType === "ALL"
            ? projects
            : projects.filter(
                  (project) =>
                      normalize( project.project_type ) === normalize(selectType)
              );

    const totalRows = filteredProjects.length;
    const totalPages = Math.ceil( totalRows / rowsPerPage );
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentProjects = filteredProjects.slice( startIndex, endIndex );

    useEffect(() => {
        const token =
            sessionStorage.getItem(
                "access"
            );

        const fetchProjects =
            async () => {
                try {
                    const response =
                        await fetch(
                            `${API}/tester/projects/`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    "Content-Type":
                                        "application/json",
                                },
                            }
                        );

                    if (!response.ok) {
                        const text =
                            await response.text();

                        throw new Error(
                            `HTTP ${response.status}: ${text}`
                        );
                    }

                    const data =
                        await response.json();

                    console.log(
                        "TESTER PROJECTS:",
                        data
                    );

                    setProjects(
                        Array.isArray(data)
                            ? data
                            : []
                    );
                } catch (error) {
                    console.error(
                        "Error fetching projects:",
                        error
                    );

                    toast.error(
                        "Failed to load projects"
                    );

                    setProjects([]);
                }
            };

        fetchProjects();
    }, []);

    // ============================================================
    // FETCH MASTER SUITES
    // ============================================================

    useEffect(() => {
        const token =
            sessionStorage.getItem(
                "access"
            );

        const fetchSuites =
            async () => {
                try {
                    const response =
                        await fetch(
                            `${API}/master/suites/`,
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
                        throw new Error(
                            data.detail ||
                                "Failed to fetch suites"
                        );
                    }

                    console.log(
                        "MASTER SUITES:",
                        data
                    );

                    setSuites(
                        Array.isArray(data)
                            ? data
                            : []
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

    // ============================================================
    // GET SUITE NAME
    //
    // Priority:
    //
    // 1. project.suite_name
    // 2. project.suite_id
    // 3. project.project_type mapping
    // 4. master suite lookup
    // 5. N/A
    // ============================================================

    const getSuiteName = (project) => {
        if (!project) {
            return "N/A";
        }

        // --------------------------------------------------------
        // 1. Backend already supplied suite name
        // --------------------------------------------------------

        if (
            project.suite_name &&
            String(
                project.suite_name
            ).trim()
        ) {
            return project.suite_name;
        }

        // --------------------------------------------------------
        // 2. Try suite_id
        // --------------------------------------------------------

        const projectSuiteId =
            normalize(
                project.suite_id
            );

        if (projectSuiteId) {
            const matchedById =
                suites.find(
                    (suite) => {
                        const id =
                            normalize(
                                suite.id
                            );

                        const code =
                            normalize(
                                suite.suite_id
                            );

                        const name =
                            normalize(
                                suite.suite_name
                            );

                        return (
                            projectSuiteId ===
                                id ||
                            projectSuiteId ===
                                code ||
                            projectSuiteId ===
                                name
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

        // --------------------------------------------------------
        // 3. PROJECT TYPE DIRECT MAPPING
        //
        // This solves WEBAPP -> Web Application
        // --------------------------------------------------------

        const projectType =
            normalize(
                project.project_type
            );

        if (
            SUITE_NAMES[
                projectType
            ]
        ) {
            return SUITE_NAMES[
                projectType
            ];
        }

        // --------------------------------------------------------
        // 4. Try matching project type with Master Suite
        // --------------------------------------------------------

        const possibleValues =
            SUITE_TYPE_MAP[
                projectType
            ] || [projectType];

        const matchedSuite =
            suites.find(
                (suite) => {
                    const id =
                        normalize(
                            suite.id
                        );

                    const code =
                        normalize(
                            suite.suite_id
                        );

                    const name =
                        normalize(
                            suite.suite_name
                        );

                    return possibleValues.some(
                        (value) => {
                            const normalizedValue =
                                normalize(
                                    value
                                );

                            return (
                                normalizedValue ===
                                    id ||
                                normalizedValue ===
                                    code ||
                                normalizedValue ===
                                    name
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

        // --------------------------------------------------------
        // 5. Nothing found
        // --------------------------------------------------------

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

    // ============================================================
    // PROJECT ICON
    // ============================================================

    const getProjectIcon = (type) => {
        return (
            PROJECT_TYPE_ICONS[
                normalize(type)
            ] || "📋"
        );
    };

    // ============================================================
    // OPEN TESTING
    // ============================================================

    const openTesting = (
        projectId,
        currentStage
    ) => {
        const stageCode =
            getStageCode(
                currentStage
            );

        console.log(
            "OPEN TESTING:",
            {
                projectId,
                currentStage,
                stageCode,
            }
        );

        navigate(
            `/tester/testing/${projectId}/${stageCode}`
        );
    };

    // ============================================================
    // RENDER STAGE DOTS
    // ============================================================

    const renderStageDots = (
        currentStage
    ) => {
        const stages = [
            {
                id: 0,
                name: "Information Gathering",
                key: "INFO",
            },
            {
                id: 1,
                name: "Scanning & Enumeration",
                key: "SCAN",
            },
            {
                id: 2,
                name: "Vulnerability Assessment",
                key: "VULN",
            },
            {
                id: 3,
                name: "Exploitation",
                key: "EXPLOIT",
            },
            {
                id: 4,
                name: "Post Exploitation",
                key: "POST",
            },
            {
                id: 5,
                name: "Completed",
                key: "COMPLETED",
            },
        ];

        const normalizedStage =
            normalize(
                currentStage
            );

        const currentStageIndex =
            STAGE_MAP[
                normalizedStage
            ] !== undefined
                ? STAGE_MAP[
                      normalizedStage
                  ]
                : -1;

        return stages.map(
            (item, index) => (
                <div
                    key={item.id}
                    className={`stage-dot ${
                        index <
                        currentStageIndex
                            ? "completed"
                            : index ===
                              currentStageIndex
                            ? "active"
                            : "pending"
                    }`}
                    title={
                        item.name
                    }
                />
            )
        );
    };

    // ============================================================
    // FILTER CHANGE
    // ============================================================

    const handleFilterChange = (
        event
    ) => {
        setSelectType(
            event.target.value
        );

        setCurrentPage(1);
    };

    // ============================================================
    // ROWS CHANGE
    // ============================================================

    const handleRowsChange = (
        event
    ) => {
        setRowsPerPage(
            Number(
                event.target.value
            )
        );

        setCurrentPage(1);
    };

    // ============================================================
    // UI
    // ============================================================

    return (
        <div className="view-container">

            <div className="table-card">

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="table-header">

                    <h2>

                        <i className="fas fa-tasks"></i>

                        {" "}
                        My Projects

                        <span
                            style={{
                                fontSize:
                                    "14px",
                                fontWeight:
                                    "normal",
                                color:
                                    "#6b7a9a",
                                marginLeft:
                                    "12px",
                            }}
                        >
                            (
                            {
                                filteredProjects.length
                            }{" "}
                            projects)
                        </span>

                    </h2>

                    <div className="header-actions">

                        <div className="select-role">

                            <label className="role-label">
                                Type
                            </label>

                            <select
                                value={
                                    selectType
                                }
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

                                <option value="CYBER">
                                    CyberSecurity
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

                {/* ==================================================
                    PROJECT GRID
                ================================================== */}

                <div className="project-grid">

                    {currentProjects.length === 0 ? (

                        <div
                            className="empty-state"
                            style={{
                                gridColumn:
                                    "1 / -1",
                            }}
                        >

                            <div className="empty-icon">

                                <i className="fas fa-folder-open"></i>

                            </div>

                            <h3>
                                No Projects Found
                            </h3>

                            <p>
                                You haven't
                                been assigned
                                any projects
                                yet
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

                                    {/* ==================================================
                                        CARD HEADER
                                    ================================================== */}

                                    <div className="card-header">

                                        <div className="project-name">

                                            {
                                                getProjectIcon(
                                                    project.project_type
                                                )
                                            }

                                            {" "}

                                            {
                                                project.project_name ||
                                                "Unnamed Project"
                                            }

                                        </div>

                                    </div>

                                    {/* ==================================================
                                        CARD BODY
                                    ================================================== */}

                                    <div className="card-body">

                                        <div className="project-type">

                                            <i className="fas fa-tag"></i>

                                            {" "}

                                            {
                                                getSuiteName(
                                                    project
                                                )
                                            }

                                        </div>

                                        <div className="deadline">

                                            <i className="fas fa-calendar-plus"></i>

                                            {" "}

                                            {
                                                project.start_date ||
                                                "-"
                                            }

                                        </div>

                                        <div className="deadline">

                                            <i className="fas fa-calendar"></i>

                                            {" "}

                                            {
                                                project.deadline ||
                                                "-"
                                            }

                                        </div>

                                        <div className="assigned-by">

                                            <i className="fas fa-user"></i>

                                            {" "}
                                            Assigned By:{" "}

                                            {
                                                project.assigned_by ||
                                                "N/A"
                                            }

                                        </div>

                                    </div>

                                    {/* ==================================================
                                        CARD FOOTER
                                    ================================================== */}

                                    <div className="card-footer">

                                        <span
                                            className={`priority priority-${(
                                                project.priority ||
                                                "medium"
                                            ).toLowerCase()}`}
                                        >
                                            {
                                                project.priority ||
                                                "MEDIUM"
                                            }
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
                                        >
                                        </span>

                                    </div>

                                    {/* ==================================================
                                        STAGE PROGRESS
                                    ================================================== */}

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

                                                {
                                                    getStageName(
                                                        project.current_stage
                                                    )
                                                }

                                            </span>

                                        </div>

                                        <div className="stage-progress">

                                            {
                                                renderStageDots(
                                                    project.current_stage
                                                )
                                            }

                                        </div>

                                    </div>

                                </div>

                            )
                        )

                    )}

                </div>

                {/* ==================================================
                    PAGINATION
                ================================================== */}

                <div className="pagination-footer">

                    <div className="rows-section">

                        <span>
                            Rows per page:
                        </span>

                        <select
                            value={
                                rowsPerPage
                            }
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

                        {totalRows ===
                        0
                            ? "0 of 0"
                            : `${startIndex + 1}-${Math.min(
                                  endIndex,
                                  totalRows
                              )} of ${totalRows}`}

                    </div>

                    <div className="page-buttons">

                        <button
                            disabled={
                                currentPage ===
                                1
                            }
                            onClick={() =>
                                setCurrentPage(
                                    currentPage -
                                        1
                                )
                            }
                        >
                            &#8249;
                        </button>

                        <button
                            disabled={
                                currentPage ===
                                    totalPages ||
                                totalPages ===
                                    0
                            }
                            onClick={() =>
                                setCurrentPage(
                                    currentPage +
                                        1
                                )
                            }
                        >
                            &#8250;
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default TesterProjects;

// import { useEffect, useState, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import "../Master/ProjectView.css";

// const PROJECT_TYPE_ICONS = {
//     WEBAPP: "🌐",
//     NETWORK: "🔗",
//     API: "⚡",
//     MOBILE: "📱",
//     CYBER: "🛡️",
//     IOT: "📡",
//     THICK: "💻",
//     SOURCE: "📄",
//     RADIO: "📻",
// };

// const SUITE_NAMES = {
//     WEBAPP: "Web Application",
//     NETWORK: "Network Testing",
//     API: "API Testing",
//     MOBILE: "Mobile Testing",
//     CYBER: "CyberSecurity",
//     IOT: "IoT",
//     THICK: "Thick Client",
//     SOURCE: "Source Code Analysis",
//     RADIO: "Radio & Wireless",
// };

// const STAGE_MAP = {
//     INFO: 0,
//     SCAN: 1,
//     VULN: 2,
//     EXPLOIT: 3,
//     POST: 4,
//     COMPLETED: 5,
//     ST001: 0,
//     ST002: 1,
//     ST003: 2,
//     ST004: 3,
//     ST005: 4,
//     ST006: 5,
// };

// const STAGE_LIST = [
//     { id: 0, name: "Information Gathering", key: "INFO" },
//     { id: 1, name: "Scanning & Enumeration", key: "SCAN" },
//     { id: 2, name: "Vulnerability Assessment", key: "VULN" },
//     { id: 3, name: "Exploitation", key: "EXPLOIT" },
//     { id: 4, name: "Post Exploitation", key: "POST" },
//     { id: 5, name: "Completed", key: "COMPLETED" },
// ];

// const getProjectIcon = (type) => PROJECT_TYPE_ICONS[type] || "📋";
// const getSuiteName = (type) => SUITE_NAMES[type] || type || "N/A";
// const getStageCode = (stage) => STAGE_MAP[stage] !== undefined ? stage : stage;

// function TesterProjects() {
//     const navigate = useNavigate();
//     const [projects, setProjects] = useState([]);
//     const [filterType, setFilterType] = useState("ALL");
//     const [rowsPerPage, setRowsPerPage] = useState(10);
//     const [currentPage, setCurrentPage] = useState(1);

//     const filteredProjects = useMemo(() => {
//         if (filterType === "ALL") return projects;
//         return projects.filter((p) => p.project_type === filterType);
//     }, [projects, filterType]);

//     const totalRows = filteredProjects.length;
//     const totalPages = Math.ceil(totalRows / rowsPerPage);
//     const startIndex = (currentPage - 1) * rowsPerPage;
//     const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
//     const currentProjects = filteredProjects.slice(startIndex, endIndex);

//     useEffect(() => {
//         const user = JSON.parse(sessionStorage.getItem("user"));
//         // if (!user) {
//         // toast.error("Please login to view projects");
//         // navigate("/login");
//         // return;
//         // }

//         const token = sessionStorage.getItem("access");
//         fetch("http://127.0.0.1:8000/tester/projects/", {
//         headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//         },
//         })
//         .then(async (res) => {
//             if (!res.ok) {
//             const text = await res.text();
//             throw new Error(`HTTP ${res.status}: ${text}`);
//             }
//             return res.json();
//         })
//         .then((data) => setProjects(data))
//         .catch((err) => {
//             console.error("Error fetching projects:", err);
//             toast.error("Failed to load projects");
//         });
//     }, [navigate]);

//     // Navigate to testing view
//     const openTesting = (projectId, stage) => {
//         const stageCode = getStageCode(stage);
//         navigate(`/tester/testing/${projectId}/${stageCode}`);
//     };

//     // Render stage dots
//     const renderStageDots = (currentStage) => {
//         const currentIndex = STAGE_MAP[currentStage] ?? -1;
//         return STAGE_LIST.map((stage, index) => (
//         <div
//             key={stage.id}
//             className={`stage-dot ${
//             index < currentIndex
//                 ? "completed"
//                 : index === currentIndex
//                 ? "active"
//                 : "pending"
//             }`}
//             title={stage.name}
//         />
//         ));
//     };

//     // Handle filter change
//     const handleFilterChange = (e) => {
//         setFilterType(e.target.value);
//         setCurrentPage(1);
//     };

//     // Handle rows per page change
//     const handleRowsChange = (e) => {
//         setRowsPerPage(Number(e.target.value));
//         setCurrentPage(1);
//     };

//     return (
//         <div className="view-container">
//         <div className="table-card">
//             {/* Header */}
//             <div className="table-header">
//             <h2>
//                 <i className="fas fa-tasks" /> My Projects
//                 <span className="project-count">({filteredProjects.length} projects)</span>
//             </h2>
//             <div className="header-actions">
//                 <div className="select-role">
//                 <label className="role-label">Type</label>
//                 <select value={filterType} onChange={handleFilterChange}>
//                     <option value="ALL">All</option>
//                     {Object.entries(SUITE_NAMES).map(([code, name]) => (
//                     <option key={code} value={code}>
//                         {name}
//                     </option>
//                     ))}
//                 </select>
//                 </div>
//             </div>
//             </div>

//             {/* Project Grid */}
//             <div className="project-grid">
//             {currentProjects.length === 0 ? (
//                 <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
//                 <div className="empty-icon">
//                     <i className="fas fa-folder-open" />
//                 </div>
//                 <h3>No Projects Found</h3>
//                 <p>
//                     {filterType !== "ALL"
//                     ? "Try changing your filters"
//                     : "You haven't been assigned any projects yet"}
//                 </p>
//                 </div>
//             ) : (
//                 currentProjects.map((project) => (
//                 <div className="project-card" key={project.project_id}>
//                     <div className="card-header">
//                     <div className="project-name">
//                         {getProjectIcon(project.project_type)} {project.project_name}
//                     </div>
//                     </div>

//                     <div className="card-body">
//                     <div className="project-type">
//                         <i className="fas fa-tag" /> {getSuiteName(project.project_type)}
//                     </div>
//                     <div className="deadline">
//                         <i className="fas fa-calendar-plus" /> {project.start_date || "-"}
//                     </div>
//                     <div className="deadline">
//                         <i className="fas fa-calendar" /> {project.deadline || "-"}
//                     </div>
//                     <div className="assigned-by">
//                         <i className="fas fa-user" /> Assigned By: {project.assigned_by || "N/A"}
//                     </div>
//                     </div>

//                     <div className="card-footer">
//                     <span className={`priority priority-${(project.priority || "medium").toLowerCase()}`}>
//                         {project.priority || "MEDIUM"}
//                     </span>
//                     {/* Status is not used, but kept for future extension */}
//                     </div>

//                     {/* Stage progress – clickable to open testing */}
//                     <div
//                     className="stage-section"
//                     onClick={() => openTesting(project.project_id, project.current_stage)}
//                     >
//                     <div className="stage-label">
//                         <span>Progress</span>
//                         <span>{project.current_stage || "N/A"}</span>
//                     </div>
//                     <div className="stage-progress">
//                         {renderStageDots(project.current_stage)}
//                     </div>
//                     </div>
//                 </div>
//                 ))
//             )}
//             </div>

//             {/* Pagination */}
//             <div className="pagination-footer">
//             <div className="rows-section">
//                 <span>Rows per page:</span>
//                 <select value={rowsPerPage} onChange={handleRowsChange}>
//                 {[5, 10, 15, 20].map((n) => (
//                     <option key={n} value={n}>
//                     {n}
//                     </option>
//                 ))}
//                 </select>
//             </div>

//             <div className="page-info">
//                 {totalRows === 0
//                 ? "0 of 0"
//                 : `${startIndex + 1}-${endIndex} of ${totalRows}`}
//             </div>

//             <div className="page-buttons">
//                 <button
//                 disabled={currentPage === 1}
//                 onClick={() => setCurrentPage(currentPage - 1)}
//                 >
//                 &#8249;
//                 </button>
//                 <button
//                 disabled={currentPage === totalPages || totalPages === 0}
//                 onClick={() => setCurrentPage(currentPage + 1)}
//                 >
//                 &#8250;
//                 </button>
//             </div>
//             </div>
//         </div>
//         </div>
//     );
// }

// export default TesterProjects;