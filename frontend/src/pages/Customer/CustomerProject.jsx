import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "../Master/ProjectView.css";

function CustomerProjects() {
    const [projects, setProjects] = useState([]);
    const [selectType, setSelectType] = useState("ALL");
    const [selectStatus, setSelectStatus] = useState("ALL");
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        const token = sessionStorage.getItem("access");
        
        setLoading(true);
        fetch("http://127.0.0.1:8000/customer/projects/", {
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
            toast.error("Unable to load projects.");
        })
        .finally(() => {
            setLoading(false);
        });
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
    const currentProjects = filteredProjects.slice(startIndex, endIndex);

    if (loading) {
        return (
            <div className="view-container">
                <div className="table-card" style={{ padding: "40px", textAlign: "center" }}>
                    <div className="loading-spinner">Loading projects...</div>
                </div>
            </div>
        );
    }

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
                                {/* <option value="CREATED">Created</option> */}
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
                            <p>No projects have been created for your organization yet</p>
                            <p style={{ fontSize: "13px", color: "#9ca3af" }}>
                                {selectType !== "ALL" || selectStatus !== "ALL" ? 
                                    "Try changing your filters" : 
                                    "Contact your test manager to create a project"
                                }
                            </p>
                        </div>
                    ) : (
                        currentProjects.map((project) => (
                            <div className="project-card" key={project.project_id}>
                                <div className="card-header">
                                    <div className="project-name">
                                        {getProjectIcon(project.project_type)} {project.project_name}
                                    </div>
                                </div>

                                <div className="card-body">
                                    <div className="deadline">
                                        <i className="fas fa-tag"></i> {project.project_type || "N/A"}
                                    </div>
                                    
                                    <div className="deadline">
                                        <i className="fas fa-user-tie"></i> Tester: {project.assigned_to?.name || "Not Assigned"}
                                    </div>

                                    <div className="deadline">
                                        <i className="fas fa-user-tie"></i> Manager: {project.manager?.name || "Not Assigned"}
                                    </div>

                                    <div className="deadline">
                                        <i className="fas fa-calendar-alt"></i> Start: {project.start_date || "-"}
                                    </div>

                                    <div className="deadline">
                                        <i className="fas fa-calendar-alt"></i> Deadline: {project.deadline || "-"}
                                    </div>

                                    <div className="deadline">
                                        {/* <i className="fas fa-chart-line"></i> Progress: {project.progress || 0}% */}
                                    </div>

                                    <div className="deadline">
                                        <i className="fas fa-layer-group"></i> Current Stage: {getStageName(project.current_stage)}
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

                                {/* Progress Bar */}
                                <div style={{ 
                                    marginTop: '12px', 
                                    paddingTop: '12px', 
                                    borderTop: '1px solid #f0f2f8' 
                                }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        fontSize: '12px', 
                                        color: '#6b7a9a',
                                        marginBottom: '4px'
                                    }}>
                                        <span>Progress</span>
                                        <span>{project.progress || 0}%</span>
                                    </div>
                                    <div style={{
                                        width: '100%',
                                        height: '6px',
                                        background: '#f0f2f8',
                                        borderRadius: '4px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${project.progress || 0}%`,
                                            height: '100%',
                                            background: project.progress >= 100 ? '#10b981' : '#4a6cf7',
                                            borderRadius: '4px',
                                            transition: 'width 0.3s ease'
                                        }} />
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

export default CustomerProjects;