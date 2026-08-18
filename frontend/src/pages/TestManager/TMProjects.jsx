
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AssignTesterPopup from "./AssignTesterPopup";
import "../Master/ProjectView.css";

function TMProjects() {

    const [projects, setProjects] = useState([]);
    const [suites, setSuites] = useState([]);
    const [selectType, setSelectType] = useState("ALL");
    const [selectStatus, setSelectStatus] = useState("ALL");

    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const [showAssignPopup, setShowAssignPopup] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

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

    const getPriorityClass = (priority) => {
        const classes = {
            CRITICAL: "priority-critical",
            HIGH: "priority-high",
            MEDIUM: "priority-medium",
            LOW: "priority-low"
        };
        return classes[priority] || "priority-medium";
    };

    const getStatusClass = (status) => {
        const classes = {
            "CREATED": "status-created",
            "ASSIGNED_PENDING": "status-pending",
            "TESTER_ASSIGNED": "status-assigned",
            "TESTING": "status-testing",
            "REPORT_PENDING": "status-report-pending",
            "APPROVED": "status-approved",
            "COMPLETED": "status-completed"
        };
        return classes[status] || "status-pending";
    };

    const getStatusDisplay = (status) => {
        const names = {
            "CREATED": "🆕 Created",
            "ASSIGNED_PENDING": "⏳ Pending Assignment",
            "TESTER_ASSIGNED": "🧪 Tester Assigned",
            "TESTING": "🔍 Testing",
            "REPORT_PENDING": "📝 Report Pending",
            "APPROVED": "✅ Approved",
            "COMPLETED": "🎯 Completed"
        };
        return names[status] || status || "Pending";
    };

    const getStageName = (stage) => {
        const stageMap = {
            "INFO": "Information Gathering",
            "SCAN": "Scanning & Enumeration",
            "VULN": "Vulnerability Assessment",
            "EXPL": "Exploitation",
            "POST": "Post Exploitation",
            "COMP": "Completed"
        };
        return stageMap[stage] || stage || "Not Started";
    };

    const getSuiteName = (projectType) => {
        if (!projectType) return "N/A";

        const type = String(projectType).trim().toUpperCase();

        const matchedSuite = suites.find((suite) => {
            const suiteId = String(suite.id ?? "").trim().toUpperCase();
            const suiteCode = String(suite.suite_id ?? "").trim().toUpperCase();
            const suiteName = String(suite.suite_name ?? "").trim().toUpperCase();

            return (
                type === suiteId ||
                type === suiteCode ||
                type === suiteName
            );
        });

        return matchedSuite?.suite_name || projectType;
    };

    useEffect(() => {
        const token = sessionStorage.getItem("access");

        const fetchProjectsAndSuites = async () => {
            try {
                // Fetch projects
                const projectResponse = await fetch(
                    "http://127.0.0.1:8000/testmanager/projects/",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                const projectData = await projectResponse.json();

                if (!projectResponse.ok) {
                    throw new Error(
                        projectData.error || "Unable to fetch projects"
                    );
                }

                // Fetch suites
                const suiteResponse = await fetch(
                    "http://127.0.0.1:8000/master/suites/",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                const suiteData = await suiteResponse.json();

                if (!suiteResponse.ok) {
                    throw new Error(
                        suiteData.error || "Unable to fetch suites"
                    );
                }

                console.log("TM PROJECTS:", projectData);
                console.log("SUITES:", suiteData);

                setProjects(
                    Array.isArray(projectData)
                        ? projectData
                        : []
                );

                setSuites(
                    Array.isArray(suiteData)
                        ? suiteData
                        : []
                );

            } catch (err) {
                console.error(err);
                toast.error("Unable to load projects.");
            }
        };

        fetchProjectsAndSuites();
    }, []);

    const filteredProjects = projects.filter(project => {
        const typeMatch = selectType === "ALL" || project.project_type === selectType;
        const statusMatch = selectStatus === "ALL" || project.status === selectStatus;
        return typeMatch && statusMatch;
    });

    const totalRows = filteredProjects.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    const currentProjects = filteredProjects.slice(
        startIndex,
        endIndex
    );

    const handleAssignClick = (project) => {
        setSelectedProject(project);
        setShowAssignPopup(true);
    };

    const handleAssignClose = () => {
        setShowAssignPopup(false);
        
        const token = sessionStorage.getItem("access");
        fetch("http://127.0.0.1:8000/testmanager/projects/", {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Unable to fetch projects");
            }
            setProjects(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
            console.log(err);
            toast.error("Unable to refresh projects.");
        });
    };

    return (
        <div className="view-container">
            <div className="table-card">
                {/* Header */}
                <div className="table-header">
                    <h2>
                        <i className="fas fa-tasks"></i> My Projects
                        <span style={{ fontSize: "14px", fontWeight: "normal", color: "#6b7a9a", marginLeft: "12px" }}>
                            ({filteredProjects.length} projects)
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

                        <div className="select-role">
                            <label className="role-label">Status</label>
                            <select
                                value={selectStatus}
                                onChange={(e) => {
                                    setSelectStatus(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="ALL">All</option>
                                <option value="CREATED">Created</option>
                                <option value="ASSIGNED_PENDING">Pending Assignment</option>
                                <option value="TESTER_ASSIGNED">Tester Assigned</option>
                                <option value="TESTING">Testing</option>
                                <option value="REPORT_PENDING">Report Pending</option>
                                <option value="APPROVED">Approved</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Project Cards Grid */}
                <div className="project-grid">
                    {currentProjects.length === 0 ? (
                        <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
                            <div className="empty-icon">
                                <i className="fas fa-folder-open"></i>
                            </div>
                            <h3>No Projects Found</h3>
                            <p>No projects have been assigned to you yet</p>
                            <p style={{ fontSize: "13px", color: "#9ca3af" }}>
                                {selectType !== "ALL" || selectStatus !== "ALL" ? 
                                    "Try changing your filters" : 
                                    "Check back later for new projects"
                                }
                            </p>
                        </div>
                    ) : (
                        currentProjects.map((project, index) => (
                            <div className="project-card" key={project.project_id}>
                                <div className="card-header">
                                    <div className="project-name">
                                        {getProjectIcon(project.project_type)} {project.project_name}
                                    </div>
                                </div>

                                <div className="card-body">
                                    <div className="deadline">
                                        <i className="fas fa-layer-group"></i>{" "} {getSuiteName(project.project_type)}
                                    </div>
                                    
                                    <div className="deadline">
                                        <i className="fas fa-building"></i>{project.customer || "N/A"}
                                    </div>
                                    
                                    <div className="deadline">
                                        {/* <i className="fas fa-layer-group"></i> Suite: {project.suite_name || project.project_type || "N/A"} */}
                                    </div>

                                    <div className="deadline">
                                        <i className="fas fa-calendar-alt"></i> 
                                        {project.start_date || "-"}
                                    </div>

                                    <div className="deadline">
                                        <i className="fas fa-calendar-alt"></i> 
                                        {project.deadline || "-"}
                                    </div>
                                </div>

                                <div className="card-footer">
                                    <span className={`priority ${getPriorityClass(project.priority)}`}>
                                        {project.priority || "MEDIUM"}
                                    </span>
                                    <span className={`status ${getStatusClass(project.status)}`}>
                                        {getStatusDisplay(project.status)}
                                    </span>
                                </div>

                                {/* Assign Button for PENDING projects */}
                                {project.status === "ASSIGNED_PENDING" && (
                                    <div className="project-actions" style={{ 
                                        marginTop: '12px', 
                                        paddingTop: '12px', 
                                        borderTop: '1px solid #f0f2f8' 
                                    }}>
                                        <button 
                                            className="btn-assign"
                                            onClick={() => handleAssignClick(project)}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                background: '#4a6cf7',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: '0.3s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.background = '#3b5de7';
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = '0 4px 20px rgba(74,108,247,0.3)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.background = '#4a6cf7';
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        >
                                            {/* <i className="fas fa-user-plus"></i>  */}
                                            Assign Tester
                                        </button>
                                    </div>
                                )}
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

            {/* Assign Tester Popup */}
            {showAssignPopup && (
                <AssignTesterPopup
                    project={selectedProject}
                    close={handleAssignClose}
                />
            )}
        </div>
    );
}

export default TMProjects;
