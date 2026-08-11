
import { useEffect, useState } from "react"; 
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../Master/ProjectView.css";

function TesterProjects() {

    const navigate = useNavigate();

    const getProjectIcon = (type) => {
        const icons = {
            WEBAPP: "🌐",
            NETWORK: "🔗",
            API: "⚡",
            MOBILE: "📱",
            CYBER: "🛡️",
            IOT: "📡",
            THICK: "💻",
            SOURCE: "📄",
            RADIO: "📻"
        };
        return icons[type] || "📋";
    };

    const getStageName = (stage) => {
        const stageMap = {
            "INFO": "Information Gathering",
            "SCAN": "Scanning & Enumeration",
            "VULN": "Vulnerability Assessment",
            "EXPLOIT": "Exploitation",
            "POST": "Post Exploitation",
            "COMPLETED": "Completed",
            "ST001": "Information Gathering",
            "ST002": "Scanning & Enumeration",
            "ST003": "Vulnerability Assessment",
            "ST004": "Exploitation",
            "ST005": "Post Exploitation",
            "ST006": "Completed"
        };
        return stageMap[stage] || stage || "Not Started";
    };

    const getStageCode = (stage) => {
        const codeMap = {
            "INFO": "INFO",
            "SCAN": "SCAN",
            "VULN": "VULN",
            "EXPLOIT": "EXPLOIT",
            "POST": "POST",
            "COMPLETED": "COMPLETED",
            "ST001": "INFO",
            "ST002": "SCAN",
            "ST003": "VULN",
            "ST004": "EXPLOIT",
            "ST005": "POST",
            "ST006": "COMPLETED"
        };
        return codeMap[stage] || stage;
    };

    const getStatusDisplay = (status) => {
        const names = {
            "CREATED": "🆕 Created",
            "ASSIGNED_PENDING": "⏳ Pending Assignment",
            "TESTER_ASSIGNED": "🧪 Testing Assigned",
            "TESTING": "🔍 Testing",
            "REPORT_PENDING": "📝 Report Pending",
            "APPROVED": "✅ Approved",
            "COMPLETED": "🎯 Completed"
        };
        return names[status] || status || "Pending";
    };

    const [project, setProject] = useState([]);
    const [selectType, setSelectType] = useState("ALL");

    const filterProject =
        selectType === "ALL"
            ? project
            : project.filter(user => user.project_type === selectType);

    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const totalRows = filterProject.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    const currentProject = filterProject.slice(startIndex, endIndex);

    useEffect(() => {
        const user = JSON.parse(sessionStorage.getItem("user"));

        if (!user) {
            toast.error("Please login to view projects");
            navigate("/login");
            return;
        }

        const token = sessionStorage.getItem("access");
        fetch("http://127.0.0.1:8000/tester/projects/", {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
        .then(async (res) => {
            if (!res.ok) {
                const text = await res.text();
                console.log(sessionStorage.getItem("access"));
                throw new Error(res.status);
            }
            return res.json();
        })
        .then(data => {
            // console.log("Projects Data:", data);
            setProject(data);
        })
        .catch(err => {
            console.error("Error fetching projects:", err);
            toast.error("Failed to load projects");
        });
    }, [navigate]);

    const openTesting = (projectId, stage) => {
        const stageCode = getStageCode(stage);
        navigate(`/tester/testing/${projectId}/${stageCode}`);
    };

    // const renderStageDots = (currentStage, projectId) => {
    //     const stages = [
    //         { id: 0, name: "Information Gathering", key: "INFO" },
    //         { id: 1, name: "Scanning & Enumeration", key: "SCAN" },
    //         { id: 2, name: "Vulnerability Assessment", key: "VULN" },
    //         { id: 3, name: "Exploitation", key: "EXPLOIT" },
    //         { id: 4, name: "Post Exploitation", key: "POST" },
    //         { id: 5, name: "Completed", key: "COMPLETED" }
    //     ];

    //     const stageMap = {
    //         "INFO": 0,
    //         "SCAN": 1,
    //         "VULN": 2,
    //         "EXPLOIT": 3,
    //         "POST": 4,
    //         "COMPLETED": 5,
    //         "ST001": 0,
    //         "ST002": 1,
    //         "ST003": 2,
    //         "ST004": 3,
    //         "ST005": 4,
    //         "ST006": 5
    //     };

    //     const currentStageIndex = stageMap[currentStage] !== undefined ? stageMap[currentStage] : -1;

    //     return stages.map((stage, index) => (
    //         <div 
    //             key={stage.id}
    //             className={`stage-dot ${index < currentStageIndex ? 'completed' : index === currentStageIndex ? 'active' : 'pending'}`}
    //             onClick={() => openTesting(projectId, stage.key)}
    //             title={stage.name}
    //         >
    //             {/* <span className="tooltip">{stage.name}</span> */}
    //         </div>
    //     ));
    // };

    const renderStageDots = (currentStage, projectId) => {
        const stages = [
            { id: 0, name: "Information Gathering", key: "INFO" },
            { id: 1, name: "Scanning & Enumeration", key: "SCAN" },
            { id: 2, name: "Vulnerability Assessment", key: "VULN" },
            { id: 3, name: "Exploitation", key: "EXPLOIT" },
            { id: 4, name: "Post Exploitation", key: "POST" },
            { id: 5, name: "Completed", key: "COMPLETED" }
        ];

        const stageMap = {
            "INFO": 0,
            "SCAN": 1,
            "VULN": 2,
            "EXPLOIT": 3,
            "POST": 4,
            "COMPLETED": 5,
            "ST001": 0,
            "ST002": 1,
            "ST003": 2,
            "ST004": 3,
            "ST005": 4,
            "ST006": 5
        };

        const currentStageIndex = stageMap[currentStage] !== undefined ? stageMap[currentStage] : -1;

        return stages.map((stage, index) => (
            <div 
                key={stage.id}
                className={`stage-dot ${index < currentStageIndex ? 'completed' : index === currentStageIndex ? 'active' : 'pending'}`}
                title={stage.name}
            >
                {/* <span className="tooltip">{stage.name}</span> */}
            </div>
        ));
    };

    return (
        <div className="view-container">
            <div className="table-card">
                {/* Header */}
                <div className="table-header">
                    <h2>
                        <i className="fas fa-tasks"></i> My Projects
                        <span style={{ fontSize: "14px", fontWeight: "normal", color: "#6b7a9a", marginLeft: "12px" }}>
                            ({filterProject.length} projects)
                        </span>
                    </h2>

                    <div className="header-actions">
                        <div className="select-role">
                            <label className="role-label">Type</label>
                            <select
                                value={selectType}
                                onChange={(e) => {
                                    setSelectType(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="ALL">All</option>
                                <option value="WEBAPP">Web Application</option>
                                <option value="NETWORK">Network Testing</option>
                                <option value="API">API Testing</option>
                                <option value="MOBILE">Mobile Testing</option>
                                <option value="CYBER">CyberSecurity</option>
                                <option value="IOT">IOT</option>
                                <option value="THICK">Thick Client</option>
                                <option value="SOURCE">Source Code Analysis</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Project Cards Grid */}
                <div className="project-grid">
                    {currentProject.length === 0 ? (
                        <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
                            <div className="empty-icon">
                                <i className="fas fa-folder-open"></i>
                            </div>
                            <h3>No Projects Found</h3>
                            <p>You haven't been assigned any projects yet</p>
                            <p style={{ fontSize: "13px", color: "#9ca3af" }}>
                                {selectType !== "ALL" ? 
                                    "Try changing your filters" : 
                                    "Check back later for new assignments"
                                }
                            </p>
                        </div>
                    ) : (
                        currentProject.map((project, index) => (
                            <div className="project-card" key={project.project_id}>
                                <div className="card-header">
                                    <div className="project-name">
                                        {getProjectIcon(project.project_type)} {project.project_name}
                                    </div>
                                </div>

                                <div className="card-body">
                                    <div className="project-type">
                                        <i className="fas fa-tag"></i> {project.project_type || "N/A"}
                                    </div>
                                    
                                    {/* Start Date */}
                                    <div className="deadline">
                                        <i className="fas fa-calendar-plus"></i>{project.start_date || "-"}
                                    </div>
                                    
                                    {/* Deadline */}
                                    <div className="deadline">
                                        <i className="fas fa-calendar"></i>{project.deadline || "-"}
                                    </div>
                                    
                                    {/* Assigned By */}
                                    <div className="assigned-by">
                                        <i className="fas fa-user"></i>Assigned By : {project.assigned_by || "N/A"}
                                    </div>
                                </div>

                                <div className="card-footer">
                                    <span className={`priority priority-${project.priority?.toLowerCase() || "medium"}`}>
                                        {project.priority || "MEDIUM"}
                                    </span>
                                    <span className={`status status-${project.status?.toLowerCase().replace(/\s/g, "-") || "pending"}`}>
                                        {/* {getStatusDisplay(project.status)} */}
                                    </span>
                                </div>

                                {/* <div className="stage-section">
                                    <div className="stage-label">
                                        <span>Progress</span>
                                        <span>{project.current_stage || "N/A"} </span>
                                    </div>
                                    <div className="stage-progress">
                                        {renderStageDots(project.current_stage, project.project_id)}
                                    </div>
                                </div> */}

                                 <div className="stage-section" onClick={() => openTesting(project.project_id, project.current_stage)}>
                                    <div className="stage-label">
                                        <span>Progress</span>
                                        <span>{project.current_stage || "N/A"} </span>
                                    </div>
                                    <div className="stage-progress">
                                        {renderStageDots(project.current_stage, project.project_id)}
                                    </div>
                                </div>

                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                <div className="pagination-footer">
                    <div className="rows-section">
                        <span>Rows per page:</span>
                        <select
                            value={rowsPerPage}
                            onChange={(e) => {
                                setRowsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                        </select>
                    </div>

                    <div className="page-info">
                        {totalRows === 0 ? (
                            "0 of 0"
                        ) : (
                            `${startIndex + 1}-${Math.min(endIndex, totalRows)} of ${totalRows}`
                        )}
                    </div>

                    <div className="page-buttons">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                        >
                            &#8249;
                        </button>

                        <button 
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage(currentPage + 1)}
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