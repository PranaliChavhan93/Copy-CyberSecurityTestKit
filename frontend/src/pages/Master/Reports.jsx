
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProjectView.css";

function ReportView() {

    const navigate = useNavigate();

    const getProjectIcon = (type) => {
        const icons = {
            WEBAPP: "🌐",
            NETWORK: "🔗",
            API: "⚡",
            MOBILE: "📱",
            CYBER: "🛡️",
            IOT: "📡"
        };
        return icons[type] || "📋";
    };

    const [project, setProject] = useState([]);
    const [reports, setReports] = useState([]);
    const [selectStatus, setSelectStatus] = useState("ALL");

    const projectsWithReports = project.map(proj => {
        const report = reports.find(r => r.project_id === proj.project_id);
        return {
            ...proj,
            report_status: report ? report.report_status : "PENDING"
        };
    });

    const filterProject =
        selectStatus === "ALL"
            ? projectsWithReports
            : projectsWithReports.filter(project => project.report_status === selectStatus);

    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const totalRows = filterProject.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    const currentProject = filterProject.slice(startIndex, endIndex);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/projects/")
            .then(async (res) => {
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then(data => setProject(data))
            .catch(err => console.log(err));

        fetch("http://127.0.0.1:8000/master/reports/")
            .then(async (res) => {
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then(data => setReports(data))
            .catch(err => console.log(err));
    }, []);

    const handleGenerateReport = (projectId) => {
        console.log(`Generating report for project ${projectId}`);
    };

    const handleViewReport = (projectId) => {
        console.log(`Viewing report for project ${projectId}`);
        navigate(`/reports/${projectId}`);
    };

    const handleDownloadReport = (projectId) => {
        console.log(`Downloading report for project ${projectId}`);
    };

    const hasReport = (project) => {
        return project.report_status === "COMPLETED" || project.report_status === "APPROVED";
    };

    return (
        <div className="view-container">
            <div className="table-card">
                <div className="table-header">
                    <h2>
                        <i className="fas fa-file-alt"></i> Report Management
                    </h2>

                    <div className="header-actions">
                        <div className="select-role">
                            <label className="role-label">Status</label>
                            <select
                                value={selectStatus}
                                onChange={(e) => setSelectStatus(e.target.value)}
                            >
                                <option value="ALL">All</option>
                                <option value="PENDING">Pending</option>
                                <option value="APPROVED">Approved</option>
                                <option value="COMPLETED">Completed</option>
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
                            <p>Generate reports from your projects</p>
                        </div>
                    ) : (
                        currentProject.map((project, index) => (
                            <div className="project-card" key={project.project_id}>
                                <div className="card-header">
                                    <div className="project-name">
                                        {getProjectIcon(project.project_type)} {project.project_name}
                                    </div>
                                    <div className="project-icon">
                                        {/* {getProjectIcon(project.project_type)} */}
                                    </div>
                                </div>

                                <div className="card-body">
                                    <div className="project-type">
                                        <i className="fas fa-tag"></i> {project.project_type || "N/A"}
                                    </div>
                                    <div className="deadline">
                                        <i className="fas fa-calendar"></i> {project.deadline || "No deadline"}
                                    </div>
                                </div>

                                <div className="card-footer">
                                    <span className={`priority priority-${project.priority?.toLowerCase() || "medium"}`}>
                                        {project.priority || "MEDIUM"}
                                    </span>
                                    <span className={`status status-${project.report_status?.toLowerCase().replace(/\s/g, "-") || "pending"}`}>
                                        {project.report_status || "Pending"}
                                    </span>
                                </div>

                                {/* Report Status */}
                                <div className="report-status-indicator">
                                    <span className={`dot ${hasReport(project) ? 'green' : 'yellow'}`}></span>
                                    {hasReport(project) ? 'Report Available' : 'Report Pending'}
                                </div>

                                {/* Report Actions */}
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
                        {startIndex + 1}-{Math.min(endIndex, totalRows)} of {totalRows}
                    </div>

                    <div className="page-buttons">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                        >
                            &#8249;
                        </button>

                        <button 
                            disabled={currentPage === totalPages}
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

export default ReportView;