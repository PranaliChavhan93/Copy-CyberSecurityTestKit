// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import "./ProjectView.css";

// function ProjectView() {

//     const getProjectIcon = (type) => {
//         const icons = {
//             WEBAPP: "🌐",
//             NETWORK: "🔗",
//             API: "⚡",
//             MOBILE: "📱",
//             CYBER: "🛡️",
//             IOT: "📡"
//         };
//         return icons[type] || "📋";
//     };

//     const navigate = useNavigate();

//     const [project, setProject] = useState([]);
//     const [selectType, setSelectType] = useState("ALL");


//     const filterProject =
//         selectType === "ALL"
//             ? project
//             : project.filter(user => user.project_type === selectType);

//     const [rowsPerPage, setRowsPerPage] = useState(10);
//     const [currentPage, setCurrentPage] = useState(1);

//     const totalRows = filterProject.length;
//     const totalPages = Math.ceil(totalRows / rowsPerPage);

//     const startIndex = (currentPage - 1) * rowsPerPage;
//     const endIndex = startIndex + rowsPerPage;

//     const currentProject = filterProject.slice(startIndex, endIndex);

//     useEffect(() => {
//         fetch("http://127.0.0.1:8000/projects/")
//             .then(async (res) => {
//                 if (!res.ok) {
//                     const text = await res.text();
//                     // console.error(text);
//                     throw new Error(`HTTP ${res.status}`);
//                 }
//                 return res.json();
//             })
//             .then(data => setProject(data))
//             .catch(err => console.log(err));
//     }, []);


//     return (

//         <div className="view-container">
//             <div className="table-card">
//             <div className="table-header">
//                 <h2>Project Management</h2>

//                 <div className="header-actions">
//                     <div className="select-role">
//                         <label className="role-label">Type</label>
//                         <select
//                             value={selectType}
//                             onChange={(e) => setSelectType(e.target.value)}
//                         >
//                             <option value="ALL">All</option>
//                             <option value="WEBAPP">Web Application</option>
//                             <option value="NETWORK">Network Testing</option>
//                             <option value="API">API Testing</option>
//                             <option value="MOBILE">Mobile Testing</option>
//                             <option value="CYBER">CyberSecurity</option>
//                         </select>
//                     </div>

//                     {/* <button
//                         className="create-btn"
//                         onClick={() => navigate("/projects/create")}
//                     >
//                         + Create Project
//                     </button> */}
//                 </div>
//             </div>

//             <table>

//                 <div className="project-grid">
//                     {currentProject.length === 0 ? (
//                         <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
//                             <div className="empty-icon"><i className="fas fa-folder-open"></i></div>
//                             <h3>No Projects Found</h3>
//                             <p>Click "Create Project" to get started</p>
//                         </div>
//                     ) : (
//                         currentProject.map((project, index) => (
//                             <div className="project-card" key={project.project_id}>
//                                 <div className="card-header">
//                                     <div className="project-name">
//                                         {getProjectIcon(project.project_type)} {project.project_name}
//                                     </div>
//                                     <div className="project-icon">
//                                         {/* {getProjectIcon(project.project_type)} */}
//                                     </div>
//                                 </div>
//                                 <div className="card-body">
//                                     <div className="type">
//                                         <i className="fas fa-tag"></i> {project.project_type || "N/A"}
//                                     </div>
//                                     <div className="deadline">
//                                         <i className="fas fa-calendar"></i> {project.deadline || "No deadline"}
//                                     </div>
//                                 </div>
//                                 <div className="card-footer">
//                                     <span className={`priority priority-${project.priority?.toLowerCase() || "medium"}`}>
//                                         {project.priority || "MEDIUM"}
//                                     </span>
                                    
//                                     <span className={`status status-${project.status?.toLowerCase().replace(/\s/g, "-") || "pending"}`}>
//                                         {project.status || "Pending"}
//                                     </span>
//                                 </div>
                                
//                                 {/* <div className="report-status-indicator">
//                                     <span className={`dot ${hasReport(project) ? 'green' : 'yellow'}`}></span>
//                                     {hasReport(project) ? 'Report Available' : 'Report Pending'}
//                                 </div> */}
//                             </div>
//                         ))
//                     )}
                    
//                     {/* Create New Card */}
//                     <div className="create-card" onClick={() => navigate("/projects/create")}>
//                         <div className="plus-icon"><i className="fas fa-plus-circle"></i></div>
//                         <div className="create-text">Create New Project</div>
//                         <div className="create-sub">Click to add</div>
//                     </div>
//                 </div>
//             </table>

//             <div className="pagination-footer">
//                     <div className="rows-section">
//                         <span>Rows per page:</span>

//                         <select
//                             value={rowsPerPage}
//                             onChange={(e) => {
//                                 setRowsPerPage(Number(e.target.value));
//                                 setCurrentPage(1);
//                             }}
//                         >
//                             <option value={5}>5</option>
//                             <option value={10}>10</option>
//                             <option value={15}>15</option>
//                             <option value={20}>20</option>
//                         </select>
//                     </div>

//                     <div className="page-info">
//                         {startIndex + 1}-{Math.min(endIndex, totalRows)} of {totalRows}
//                     </div>

//                     <div className="page-buttons">
//                         <button disabled={currentPage === 1}
//                         onClick={() => setCurrentPage(currentPage - 1)}
//                         >
//                             &#8249;
//                         </button>

//                         <button disabled={currentPage === totalPages}
//                             onClick={() => setCurrentPage(currentPage + 1)}
//                         >
//                             &#8250;
//                         </button>

//                         </div>

//                     </div>
//             </div>
//         </div>
//     );
// }

// export default ProjectView;


// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import "./ProjectView.css";

// function ProjectView() {

//     const getProjectIcon = (type) => {
//         const icons = {
//             WEBAPP: "🌐",
//             NETWORK: "🔗",
//             API: "⚡",
//             MOBILE: "📱",
//             CYBER: "🛡️",
//             IOT: "📡"
//         };
//         return icons[type] || "📋";
//     };

//     const navigate = useNavigate();

//     const [project, setProject] = useState([]);
//     const [selectType, setSelectType] = useState("ALL");


//     const filterProject =
//         selectType === "ALL"
//             ? project
//             : project.filter(user => user.project_type === selectType);

//     const [rowsPerPage, setRowsPerPage] = useState(10);
//     const [currentPage, setCurrentPage] = useState(1);

//     const totalRows = filterProject.length;
//     const totalPages = Math.ceil(totalRows / rowsPerPage);

//     const startIndex = (currentPage - 1) * rowsPerPage;
//     const endIndex = startIndex + rowsPerPage;

//     const currentProject = filterProject.slice(startIndex, endIndex);

//     useEffect(() => {
//         fetch("http://127.0.0.1:8000/projects/")
//             .then(async (res) => {
//                 if (!res.ok) {
//                     const text = await res.text();
//                     throw new Error(`HTTP ${res.status}`);
//                 }
//                 return res.json();
//             })
//             .then(data => setProject(data))
//             .catch(err => console.log(err));
//     }, []);


//     return (

//         <div className="view-container">
//             <div className="table-card">
//                 <div className="table-header">
//                     <h2>
//                         <i className="fas fa-folder-open"></i> Project Management
//                         <span style={{ fontSize: "14px", fontWeight: "normal", color: "#6b7a9a", marginLeft: "12px" }}>
//                             ({filterProject.length} projects)
//                         </span>
//                     </h2>

//                     <div className="header-actions">
//                         <div className="select-role">
//                             <label className="role-label">Type</label>
//                             <select
//                                 value={selectType}
//                                 onChange={(e) => setSelectType(e.target.value)}
//                             >
//                                 <option value="ALL">All</option>
//                                 <option value="WEBAPP">Web Application</option>
//                                 <option value="NETWORK">Network Testing</option>
//                                 <option value="API">API Testing</option>
//                                 <option value="MOBILE">Mobile Testing</option>
//                                 <option value="CYBER">CyberSecurity</option>
//                             </select>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="project-grid">
//                     {currentProject.length === 0 ? (
//                         <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
//                             <div className="empty-icon">
//                                 <i className="fas fa-folder-open"></i>
//                             </div>
//                             <h3>No Projects Found</h3>
//                             <p>Click "Create Project" to get started</p>
//                         </div>
//                     ) : (
//                         currentProject.map((project, index) => (
//                             <div className="project-card" key={project.project_id}>
//                                 <div className="card-header">
//                                     <div className="project-name">
//                                         {getProjectIcon(project.project_type)} {project.project_name}
//                                     </div>
//                                 </div>

//                                 <div className="card-body">
//                                     <div className="project-type">
//                                         <i className="fas fa-tag"></i> {project.project_type || "N/A"}
//                                     </div>
//                                     <div className="deadline">
//                                         <i className="fas fa-calendar"></i> {project.start_date || "-"}
//                                     </div>
//                                     <div className="deadline">
//                                         <i className="fas fa-calendar"></i> {project.deadline || "-"}
//                                     </div>
//                                     <div className="deadline">
//                                         <i className="fas fa-calendar"></i>Assigned By : {project.assigned_by || "-"}
//                                     </div>
//                                 </div>
                                
//                                 <div className="card-footer">
//                                     <span className={`priority priority-${project.priority?.toLowerCase() || "medium"}`}>
//                                         {project.priority || "MEDIUM"}
//                                     </span>
                                    
//                                     <span className={`status status-${project.status?.toLowerCase().replace(/\s/g, "-") || "pending"}`}>
//                                     {/* <span className={`status status-${project.status?.toLowerCase().replace(/\s/g, "-")}`}> */}

//                                         {project.status || ""}
//                                     </span>
//                                 </div>
//                             </div>
//                         ))
//                     )}
                    
//                     {/* Create New Card */}
//                     <div className="create-card" onClick={() => navigate("/projects/create")}>
//                         <div className="plus-icon"><i className="fas fa-plus-circle"></i></div>
//                         <div className="create-text">Create New Project</div>
//                         <div className="create-sub">Click to add</div>
//                     </div>
//                 </div>

//                 <div className="pagination-footer">
//                     <div className="rows-section">
//                         <span>Rows per page:</span>

//                         <select
//                             value={rowsPerPage}
//                             onChange={(e) => {
//                                 setRowsPerPage(Number(e.target.value));
//                                 setCurrentPage(1);
//                             }}
//                         >
//                             <option value={5}>5</option>
//                             <option value={10}>10</option>
//                             <option value={15}>15</option>
//                             <option value={20}>20</option>
//                         </select>
//                     </div>

//                     <div className="page-info">
//                         {startIndex + 1}-{Math.min(endIndex, totalRows)} of {totalRows}
//                     </div>

//                     <div className="page-buttons">
//                         <button 
//                             disabled={currentPage === 1}
//                             onClick={() => setCurrentPage(currentPage - 1)}
//                         >
//                             &#8249;
//                         </button>

//                         <button 
//                             disabled={currentPage === totalPages}
//                             onClick={() => setCurrentPage(currentPage + 1)}
//                         >
//                             &#8250;
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default ProjectView;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./ProjectView.css";

function ProjectView() {

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

    const navigate = useNavigate();

    // Helper to get status display name with emoji
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

    // Helper to get status class
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
    }, []);

    return (
        <div className="view-container">
            <div className="table-card">
                <div className="table-header">
                    <h2>
                        <i className="fas fa-folder-open"></i> Project Management
                        <span style={{ fontSize: "14px", fontWeight: "normal", color: "#6b7a9a", marginLeft: "12px" }}>
                            ({filterProject.length} projects)
                        </span>
                    </h2>

                    <div className="header-actions">
                        <div className="select-role">
                            <label className="role-label">Type</label>
                            <select
                                value={selectType}
                                onChange={(e) => setSelectType(e.target.value)}
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

                <div className="project-grid">
                    {currentProject.length === 0 ? (
                        <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
                            <div className="empty-icon">
                                <i className="fas fa-folder-open"></i>
                            </div>
                            <h3>No Projects Found</h3>
                            <p>Click "Create Project" to get started</p>
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
                                    <div className="deadline">
                                        <i className="fas fa-calendar"></i>{project.start_date || "-"}
                                    </div>
                                    <div className="deadline">
                                        <i className="fas fa-calendar"></i>{project.deadline || "-"}
                                    </div>
                                    <div className="deadline">
                                        <i className="fas fa-user"></i> Assigned To : {project.assigned_by || "-"}
                                    </div>
                                </div>
                                
                                <div className="card-footer">
                                    <span className={`priority priority-${project.priority?.toLowerCase() || "medium"}`}>
                                        {project.priority || "MEDIUM"}
                                    </span>
                                    
                                    <span className={`status ${getStatusClass(project.status)}`}>
                                        {getStatusDisplay(project.status)}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                    
                    {/* Create New Card */}
                    <div className="create-card" onClick={() => navigate("/projects/create")}>
                        <div className="plus-icon"><i className="fas fa-plus-circle"></i></div>
                        <div className="create-text">Create New Project</div>
                        <div className="create-sub">Click to add</div>
                    </div>
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

export default ProjectView;