
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../Master/ProjectView.css";

function TMReport() {

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

    const getStatusDisplay = (status) => {
        const names = {
            "PENDING": "⏳ Pending",
            "GENERATED": "📄 Generated",
            "REVIEW": "🔍 Under Review",
            "APPROVED": "✅ Approved",
            "COMPLETED": "🎯 Completed",
            "REJECTED": "❌ Rejected"
        };
        return names[status] || status || "Pending";
    };

    const [project, setProject] = useState([]);
    const [reports, setReports] = useState([]);
    const [selectStatus, setSelectStatus] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState("ALL");

    // Ensure reports is always an array
    const projectsWithReports = Array.isArray(project) ? project.map(proj => {
        const report = Array.isArray(reports) ? reports.find(r => r.project_id === proj.project_id) : null;
        return {
            ...proj,
            report_status: report ? report.report_status : "PENDING",
            report_id: report ? report.report_id : null,
            report_data: report || null
        };
    }) : [];

    // Apply filters
    let filteredProjects = projectsWithReports;
    
    if (selectStatus !== "ALL") {
        filteredProjects = filteredProjects.filter(project => project.report_status === selectStatus);
    }
    
    if (filterType !== "ALL") {
        filteredProjects = filteredProjects.filter(project => project.project_type === filterType);
    }

    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const totalRows = filteredProjects.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    const currentProject = filteredProjects.slice(startIndex, endIndex);

    useEffect(() => {
        const user = JSON.parse(sessionStorage.getItem("user"));
        
        if (!user) {
            toast.error("Please login to view reports");
            navigate("/login");
            return;
        }

        // Check if user has test manager role
        const userRole = user.role || user.user_type;
        const allowedRoles = ["TEST_MANAGER", "testmanager", "MANAGER", "manager"];
        if (!allowedRoles.includes(userRole)) {
            toast.error("Access denied. Test Manager privileges required.");
            navigate("/testmanager");
            return;
        }

        const token = sessionStorage.getItem("access");
        if (!token) {
            toast.error("Authentication required");
            navigate("/login");
            return;
        }

        // Fetch test manager's projects
        fetch("http://127.0.0.1:8000/testmanager/projects/", {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
        .then(async (res) => {
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`HTTP ${res.status}: ${text}`);
            }
            return res.json();
        })
        .then(data => {
            setProject(Array.isArray(data) ? data : []);
            setLoading(false);
        })
        .catch(err => {
            console.error("Error fetching projects:", err);
            toast.error("Failed to load projects");
            setProject([]);
            setLoading(false);
        });

        fetch("http://127.0.0.1:8000/testmanager/reports/", {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
        .then(async (res) => {
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`HTTP ${res.status}: ${text}`);
            }
            return res.json();
        })
        .then(data => {
            setReports(Array.isArray(data) ? data : []);
        })
        .catch(err => {
            console.error("Error fetching reports:", err);
            setReports([]);
        });
    }, [navigate]);

    const handleGenerateReport = (projectId) => {
        const token = sessionStorage.getItem("access");
        if (!token) {
            toast.error("Please login again");
            navigate("/login");
            return;
        }

        toast.info(`Generating report for project...`);
        
        fetch(`http://127.0.0.1:8000/testmanager/reports/generate/${projectId}/`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
        .then(async (res) => {
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`HTTP ${res.status}: ${text}`);
            }
            return res.json();
        })
        .then(data => {
            toast.success("Report generated successfully!");
            // Refresh the reports list
            fetch("http://127.0.0.1:8000/testmanager/reports/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })
            .then(res => res.json())
            .then(data => {
                setReports(Array.isArray(data) ? data : []);
            })
            .catch(err => console.error("Error refreshing reports:", err));
        })
        .catch(err => {
            console.error("Error generating report:", err);
            toast.error("Failed to generate report. Please try again.");
        });
    };

    const handleApproveReport = (projectId) => {
        const token = sessionStorage.getItem("access");
        if (!token) {
            toast.error("Please login again");
            navigate("/login");
            return;
        }

        toast.info("Approving report...");
        
        fetch(`http://127.0.0.1:8000/testmanager/reports/approve/${projectId}/`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
        .then(async (res) => {
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`HTTP ${res.status}: ${text}`);
            }
            return res.json();
        })
        .then(data => {
            toast.success("Report approved successfully!");
            // Refresh the reports list
            fetch("http://127.0.0.1:8000/testmanager/reports/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })
            .then(res => res.json())
            .then(data => {
                setReports(Array.isArray(data) ? data : []);
            })
            .catch(err => console.error("Error refreshing reports:", err));
        })
        .catch(err => {
            console.error("Error approving report:", err);
            toast.error("Failed to approve report. Please try again.");
        });
    };

    const handleRejectReport = (projectId) => {
        const token = sessionStorage.getItem("access");
        if (!token) {
            toast.error("Please login again");
            navigate("/login");
            return;
        }

        const reason = prompt("Please provide a reason for rejection:");
        if (!reason) {
            toast.info("Rejection cancelled");
            return;
        }

        toast.info("Rejecting report...");
        
        fetch(`http://127.0.0.1:8000/testmanager/reports/reject/${projectId}/`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ reason: reason }),
        })
        .then(async (res) => {
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`HTTP ${res.status}: ${text}`);
            }
            return res.json();
        })
        .then(data => {
            toast.success("Report rejected successfully!");
            // Refresh the reports list
            fetch("http://127.0.0.1:8000/testmanager/reports/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })
            .then(res => res.json())
            .then(data => {
                setReports(Array.isArray(data) ? data : []);
            })
            .catch(err => console.error("Error refreshing reports:", err));
        })
        .catch(err => {
            console.error("Error rejecting report:", err);
            toast.error("Failed to reject report. Please try again.");
        });
    };

    const handleViewReport = (projectId) => {
        const token = sessionStorage.getItem("access");
        if (!token) {
            toast.error("Please login again");
            // navigate("/login");
            return;
        }

        // Navigate to report view page
        navigate(`/testmanager/reports/${projectId}`);
    };

    const handleDownloadReport = (projectId) => {
        const token = sessionStorage.getItem("access");
        if (!token) {
            toast.error("Please login again");
            navigate("/login");
            return;
        }

        toast.info("Downloading report...");
        
        fetch(`http://127.0.0.1:8000/testmanager/reports/download/${projectId}/`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
        .then(async (res) => {
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`HTTP ${res.status}: ${text}`);
            }
            
            // Handle file download
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `report_${projectId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            
            toast.success("Report downloaded successfully!");
        })
        .catch(err => {
            console.error("Error downloading report:", err);
            toast.error("Failed to download report. Please try again.");
        });
    };

    const hasReport = (project) => {
        return project.report_status === "GENERATED" || 
               project.report_status === "REVIEW" || 
               project.report_status === "APPROVED" || 
               project.report_status === "COMPLETED";
    };

    const isApproved = (project) => {
        return project.report_status === "APPROVED" || project.report_status === "COMPLETED";
    };

    const isPending = (project) => {
        return project.report_status === "PENDING" || project.report_status === "GENERATED";
    };

    if (loading) {
        return (
            <div className="view-container">
                <div className="table-card">
                    <div className="loading-state" style={{ textAlign: "center", padding: "50px" }}>
                        <i className="fas fa-spinner fa-spin" style={{ fontSize: "40px", color: "#6b7a9a" }}></i>
                        <p style={{ marginTop: "20px", color: "#6b7a9a" }}>Loading reports...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="view-container">
            <div className="table-card">
                <div className="table-header">
                    <h2>
                        <i className="fas fa-file-alt"></i> Report Management
                        <span style={{ fontSize: "14px", fontWeight: "normal", color: "#6b7a9a", marginLeft: "12px" }}>
                            ({filteredProjects.length} projects)
                        </span>
                    </h2>

                    <div className="header-actions">
                        <div className="select-role">
                            <label className="role-label">Type</label>
                            <select
                                value={filterType}
                                onChange={(e) => {
                                    setFilterType(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="ALL">All Types</option>
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
                                <option value="PENDING">Pending</option>
                                <option value="GENERATED">Generated</option>
                                <option value="REVIEW">Under Review</option>
                                <option value="APPROVED">Approved</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="project-grid">
                    { currentProject.length === 0 ? (
                        <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
                            <div className="empty-icon">
                                <i className="fas fa-file-alt"></i>
                            </div>
                            <h3>No Reports Found</h3>
                            <p>No reports available for your projects</p>
                            <p style={{ fontSize: "13px", color: "#9ca3af" }}>
                                {selectStatus !== "ALL" || filterType !== "ALL" ? 
                                    "Try changing your filters" : 
                                    "Projects will appear here when reports are generated"
                                }
                            </p>
                        </div>
                    ) : (
                        currentProject.map((project, index) => (
                            <div className="project-card" key={project.project_id || index}>
                                <div className="card-header">
                                    <div className="project-name">
                                        {getProjectIcon(project.project_type)} {project.project_name || "Unnamed Project"}
                                    </div>
                                </div>

                                <div className="card-body">
                                    <div className="project-type">
                                        <i className="fas fa-tag"></i> {project.project_type || "N/A"}
                                    </div>
                                    <div className="deadline">
                                        <i className="fas fa-calendar"></i> {project.deadline || "No deadline"}
                                    </div>
                                    <div className="assigned-by">
                                        <i className="fas fa-user-tie"></i> Assigned To: {project.assigned_to || "N/A"}
                                    </div>
                                    {/* <div className="assigned-by">
                                        <i className="fas fa-user"></i> Assigned By: {project.assigned_by || "N/A"}
                                    </div> */}
                                </div>

                                <div className="card-footer">
                                    <span className={`priority priority-${project.priority?.toLowerCase() || "medium"}`}>
                                        {project.priority || "MEDIUM"}
                                    </span>
                                    <span className={`status status-${project.report_status?.toLowerCase().replace(/\s/g, "-") || "pending"}`}>
                                        {getStatusDisplay(project.report_status)}
                                    </span>
                                </div>

                                <div className="report-status-indicator">
                                    <span className={`dot ${isApproved(project) ? 'green' : isPending(project) ? 'yellow' : 'red'}`}></span>
                                    {isApproved(project) ? 'Report Approved' : 
                                     isPending(project) ? 'Report Pending' : 
                                     'Report Rejected'}
                                </div>

                                <div className="report-actions">
                                    {hasReport(project) ? (
                                        <>
                                            <button 
                                                className="btn-report view"
                                                onClick={() => handleViewReport(project.project_id)}
                                            >
                                                <i className="fas fa-eye"></i> View
                                            </button>
                                            <button 
                                                className="btn-report download"
                                                onClick={() => handleDownloadReport(project.project_id)}
                                            >
                                                <i className="fas fa-download"></i> Download
                                            </button>
                                            {!isApproved(project) && project.report_status !== "REJECTED" && (
                                                <>
                                                    <button 
                                                        className="btn-report approve"
                                                        onClick={() => handleApproveReport(project.project_id)}
                                                    >
                                                        <i className="fas fa-check"></i> Approve
                                                    </button>
                                                    <button 
                                                        className="btn-report reject"
                                                        onClick={() => handleRejectReport(project.project_id)}
                                                    >
                                                        <i className="fas fa-times"></i> Reject
                                                    </button>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <button 
                                            className="btn-report generate"
                                            onClick={() => handleGenerateReport(project.project_id)}
                                        >
                                            <i className="fas fa-file-pdf"></i> Generate Report
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* <div className="pagination-footer">
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
                            disabled={currentPage === 1 || totalRows === 0}
                            onClick={() => setCurrentPage(currentPage - 1)}
                        >
                            &#8249;
                        </button>

                        <button 
                            disabled={currentPage === totalPages || totalRows === 0}
                            onClick={() => setCurrentPage(currentPage + 1)}
                        >
                            &#8250;
                        </button>
                    </div>
                </div> */}
            </div>
        </div>
    );
}

export default TMReport;