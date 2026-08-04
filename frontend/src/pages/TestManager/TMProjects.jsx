
// // // import { useEffect, useState } from "react";
// // // import { toast } from "react-toastify";

// // // import AssignTesterPopup from "./AssignTesterPopup";
// // // import "../Master/UIDesign.css";

// // // function TMProjects() {

// // //     const [projects, setProjects] = useState([]);
// // //     const [selectType, setSelectType] = useState("ALL");

// // //     const [rowsPerPage, setRowsPerPage] = useState(10);
// // //     const [currentPage, setCurrentPage] = useState(1);

// // //     const [showAssignPopup, setShowAssignPopup] = useState(false);
// // //     const [selectedProject, setSelectedProject] = useState(null);

// // //     useEffect(() => {
// // //         const token = sessionStorage.getItem("access");

// // //         fetch("http://127.0.0.1:8000/testmanager/projects/", {
// // //             headers: {
// // //                 Authorization: `Bearer ${token}`,
// // //                 "Content-Type": "application/json",
// // //             },
// // //         })
// // //         .then(async (res) => {
// // //             const data = await res.json();
// // //             if (!res.ok) {
// // //                 throw new Error(data.error || "Unable to fetch projects");
// // //             }
// // //             setProjects(Array.isArray(data) ? data : []);
// // //         })
// // //         .catch((err) => {
// // //             console.log(err);
// // //             toast.error("Unable to load projects.");
// // //         });
// // //     }, []);

// // //     const filteredProjects =
// // //         selectType === "ALL"
// // //             ? projects
// // //             : projects.filter(
// // //                   (project) => project.project_type === selectType
// // //               );

// // //     const totalRows = filteredProjects.length;
// // //     const totalPages = Math.ceil(totalRows / rowsPerPage);

// // //     const startIndex = (currentPage - 1) * rowsPerPage;
// // //     const endIndex = startIndex + rowsPerPage;

// // //     const currentProjects = filteredProjects.slice(
// // //         startIndex,
// // //         endIndex
// // //     );

// // //     return (
// // //     <div className="view-container">
// // //         <div className="table-header">
// // //             <h2>My Projects</h2>
// // //         </div>

// // //         <table className="user-table">
// // //             <thead>
// // //                 <tr>
// // //                     <th>Sr. No.</th>
// // //                     <th>Project ID</th>
// // //                     <th>Project Name</th>
// // //                     <th>Customer</th>
// // //                     <th>Suite</th>
// // //                     <th>Priority</th>
// // //                     <th>Start Date</th>
// // //                     <th>Deadline</th>
// // //                     <th>Status</th>
// // //                 </tr>
// // //             </thead>

// // //             <tbody>
// // //                 {currentProjects.length === 0 ? (
// // //                     <tr>
// // //                         <td
// // //                             colSpan="9"
// // //                             style={{
// // //                                 textAlign: "center",
// // //                                 padding: "20px",
// // //                             }}
// // //                         >
// // //                             No Projects Found
// // //                         </td>
// // //                     </tr>
// // //                 ) : (
// // //                     currentProjects.map((project, index) => (
// // //                         <tr key={project.project_id}>
// // //                             <td>{startIndex + index + 1}</td>
// // //                             <td>{project.project_id}</td>
// // //                             <td>{project.project_name}</td>
// // //                             <td>{project.customer}</td>
// // //                             <td>{project.project_type}</td>
// // //                             <td>{project.priority}</td>
// // //                             <td>{project.start_date}</td>
// // //                             <td>{project.deadline}</td>
// // //                             <td>
// // //                                 {project.status === "ASSIGNED_PENDING" ? (
// // //                                     <span
// // //                                         className="status-link"
// // //                                         onClick={() => {
// // //                                             setSelectedProject(project);
// // //                                             setShowAssignPopup(true);
// // //                                         }}
// // //                                     >
// // //                                         ASSIGNED_PENDING
// // //                                     </span>
// // //                                 ) : (
// // //                                     project.status
// // //                                 )}
// // //                             </td>
// // //                         </tr>
// // //                     ))
// // //                 )}
// // //             </tbody>
// // //         </table>

// // //         {showAssignPopup && (
// // //             <AssignTesterPopup
// // //                 project={selectedProject}
// // //                 close={() => setShowAssignPopup(false)}
// // //             />
// // //         )}

// // //         <div className="pagination-footer">
// // //             <div className="rows-section">
// // //                 <span>Rows per page:</span>

// // //                 <select
// // //                     value={rowsPerPage}
// // //                     onChange={(e) => {
// // //                         setRowsPerPage(Number(e.target.value));
// // //                         setCurrentPage(1);
// // //                     }}
// // //                 >
// // //                     <option value={5}>5</option>
// // //                     <option value={10}>10</option>
// // //                     <option value={15}>15</option>
// // //                     <option value={20}>20</option>
// // //                 </select>
// // //             </div>

// // //             <div className="page-info">
// // //                 {totalRows === 0
// // //                     ? "0-0 of 0"
// // //                     : `${startIndex + 1}-${Math.min(
// // //                         endIndex,
// // //                         totalRows
// // //                     )} of ${totalRows}`}
// // //             </div>

// // //             <div className="page-buttons">
// // //                 <button
// // //                     disabled={currentPage === 1}
// // //                     onClick={() => setCurrentPage(currentPage - 1)}
// // //                 >
// // //                     &#8249;
// // //                 </button>

// // //                 <button disabled={
// // //                         currentPage === totalPages ||
// // //                         totalPages === 0
// // //                     }
// // //                     onClick={() => setCurrentPage(currentPage + 1)}
// // //                 >
// // //                     &#8250;
// // //                 </button>
// // //             </div>
// // //         </div>
// // //     </div>
// // //     );
// // // }

// // // export default TMProjects;


// // import { useEffect, useState } from "react";
// // import { toast } from "react-toastify";
// // import AssignTesterPopup from "./AssignTesterPopup";
// // import "../Master/ProjectView.css";

// // function TMProjects() {

// //     const [projects, setProjects] = useState([]);
// //     const [selectType, setSelectType] = useState("ALL");

// //     const [rowsPerPage, setRowsPerPage] = useState(10);
// //     const [currentPage, setCurrentPage] = useState(1);

// //     const [showAssignPopup, setShowAssignPopup] = useState(false);
// //     const [selectedProject, setSelectedProject] = useState(null);

// //     // Helper to get project icon
// //     const getProjectIcon = (type) => {
// //         const icons = {
// //             WEBAPP: "🌐",
// //             NETWORK: "🔗",
// //             API: "⚡",
// //             MOBILE: "📱",
// //             CYBER: "🛡️",
// //             IOT: "📡"
// //         };
// //         return icons[type] || "📋";
// //     };

// //     const getPriorityClass = (priority) => {
// //         const classes = {
// //             HIGH: "priority-high",
// //             MEDIUM: "priority-medium",
// //             LOW: "priority-low"
// //         };
// //         return classes[priority] || "priority-medium";
// //     };

// //     const getStatusClass = (status) => {
// //         const classes = {
// //             "ASSIGNED_PENDING": "status-pending",
// //             "TESTER_ASSIGNED": "status-assigned",
// //             "COMPLETED": "status-completed",
// //             "IN_PROGRESS": "status-testing",
// //             "APPROVED": "status-approved"
// //         };
// //         return classes[status] || "status-pending";
// //     };

// //     const getStatusDisplay = (status) => {
// //         const names = {
// //             "ASSIGNED_PENDING": "⏳ Pending Assignment",
// //             "TESTER_ASSIGNED": "🧪 Tester Assigned",
// //             "COMPLETED": "✅ Completed",
// //             "IN_PROGRESS": "🔄 In Progress",
// //             "APPROVED": "✔️ Approved"
// //         };
// //         return names[status] || status;
// //     };

// //     useEffect(() => {
// //         const token = sessionStorage.getItem("access");

// //         fetch("http://127.0.0.1:8000/testmanager/projects/", {
// //             headers: {
// //                 Authorization: `Bearer ${token}`,
// //                 "Content-Type": "application/json",
// //             },
// //         })
// //         .then(async (res) => {
// //             const data = await res.json();
// //             if (!res.ok) {
// //                 throw new Error(data.error || "Unable to fetch projects");
// //             }
// //             setProjects(Array.isArray(data) ? data : []);
// //         })
// //         .catch((err) => {
// //             console.log(err);
// //             toast.error("Unable to load projects.");
// //         });
// //     }, []);

// //     const filteredProjects =
// //         selectType === "ALL"
// //             ? projects
// //             : projects.filter(
// //                   (project) => project.project_type === selectType
// //               );

// //     const totalRows = filteredProjects.length;
// //     const totalPages = Math.ceil(totalRows / rowsPerPage);

// //     const startIndex = (currentPage - 1) * rowsPerPage;
// //     const endIndex = startIndex + rowsPerPage;

// //     const currentProjects = filteredProjects.slice(
// //         startIndex,
// //         endIndex
// //     );

// //     const handleAssignClick = (project) => {
// //         setSelectedProject(project);
// //         setShowAssignPopup(true);
// //     };

// //     return (
// //         <div className="view-container">
// //             <div className="table-card">
// //                 {/* Header */}
// //                 <div className="table-header">
// //                     <h2>
// //                         <i className="fas fa-tasks"></i> My Projects
// //                     </h2>

// //                     <div className="header-actions">
// //                         <div className="select-role">
// //                             <label className="role-label">Type</label>
// //                             <select
// //                                 value={selectType}
// //                                 onChange={(e) => setSelectType(e.target.value)}
// //                             >
// //                                 <option value="ALL">All</option>
// //                                 <option value="WEBAPP">Web Application</option>
// //                                 <option value="NETWORK">Network Testing</option>
// //                                 <option value="API">API Testing</option>
// //                                 <option value="MOBILE">Mobile Testing</option>
// //                                 <option value="CYBER">CyberSecurity</option>
// //                             </select>
// //                         </div>
// //                     </div>
// //                 </div>

// //                 {/* Project Cards Grid */}
// //                 <div className="project-grid">
// //                     {currentProjects.length === 0 ? (
// //                         <div className="empty-state">
// //                             <div className="empty-icon">
// //                                 <i className="fas fa-folder-open"></i>
// //                             </div>
// //                             <h3>No Projects Found</h3>
// //                             <p>No projects have been assigned to you yet</p>
// //                         </div>
// //                     ) : (
// //                         currentProjects.map((project, index) => (
// //                             <div className="project-card" key={project.project_id}>
// //                                 <div className="card-header">
// //                                     <div className="project-name">
// //                                         {getProjectIcon(project.project_type)} {project.project_name}
// //                                     </div>
// //                                     <div className="project-icon">
// //                                         {getProjectIcon(project.project_type)}
// //                                     </div>
// //                                 </div>

// //                                 <div className="card-body">
// //                                     <div className="project-type">
// //                                         <i className="fas fa-tag"></i> {project.project_type || "N/A"}
// //                                     </div>
// //                                     <div className="project-customer">
// //                                         <i className="fas fa-user"></i> Customer: {project.customer || "N/A"}
// //                                     </div>
// //                                     <div className="project-suite">
// //                                         <i className="fas fa-layer-group"></i> Suite: {project.suite_name || project.project_type || "N/A"}
// //                                     </div>
// //                                     <div className="project-dates">
// //                                         <i className="fas fa-calendar-alt"></i> 
// //                                         {project.start_date && `Start: ${project.start_date} | `}
// //                                         Deadline: {project.deadline || "No deadline"}
// //                                     </div>
// //                                 </div>

// //                                 <div className="card-footer">
// //                                     <span className={`priority ${getPriorityClass(project.priority)}`}>
// //                                         {project.priority || "MEDIUM"}
// //                                     </span>
// //                                     <span className={`status ${getStatusClass(project.status)}`}>
// //                                         {getStatusDisplay(project.status)}
// //                                     </span>
// //                                 </div>

// //                                 {/* Assign Button for PENDING projects */}
// //                                 {project.status === "ASSIGNED_PENDING" && (
// //                                     <div className="project-actions" style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f0f2f8' }}>
// //                                         <button 
// //                                             className="btn-assign"
// //                                             onClick={() => handleAssignClick(project)}
// //                                             style={{
// //                                                 width: '100%',
// //                                                 padding: '10px',
// //                                                 background: '#4a6cf7',
// //                                                 color: '#fff',
// //                                                 border: 'none',
// //                                                 borderRadius: '8px',
// //                                                 fontSize: '14px',
// //                                                 fontWeight: '600',
// //                                                 cursor: 'pointer',
// //                                                 transition: '0.3s',
// //                                                 display: 'flex',
// //                                                 alignItems: 'center',
// //                                                 justifyContent: 'center',
// //                                                 gap: '8px'
// //                                             }}
// //                                             onMouseEnter={(e) => {
// //                                                 e.target.style.background = '#3b5de7';
// //                                                 e.target.style.transform = 'translateY(-2px)';
// //                                                 e.target.style.boxShadow = '0 4px 20px rgba(74,108,247,0.3)';
// //                                             }}
// //                                             onMouseLeave={(e) => {
// //                                                 e.target.style.background = '#4a6cf7';
// //                                                 e.target.style.transform = 'translateY(0)';
// //                                                 e.target.style.boxShadow = 'none';
// //                                             }}
// //                                         >
// //                                             <i className="fas fa-user-plus"></i> Assign Tester
// //                                         </button>
// //                                     </div>
// //                                 )}

// //                                 {/* Project ID badge */}
// //                                 <div className="project-id-badge" style={{
// //                                     position: 'absolute',
// //                                     top: '12px',
// //                                     right: '12px',
// //                                     fontSize: '10px',
// //                                     color: '#9ca3af',
// //                                     background: '#f0f2f8',
// //                                     padding: '2px 10px',
// //                                     borderRadius: '12px',
// //                                     fontWeight: '600'
// //                                 }}>
// //                                     #{project.project_id}
// //                                 </div>
// //                             </div>
// //                         ))
// //                     )}
// //                 </div>

// //                 {/* Pagination */}
// //                 <div className="pagination-footer">
// //                     <div className="rows-section">
// //                         <span>Rows per page:</span>
// //                         <select
// //                             value={rowsPerPage}
// //                             onChange={(e) => {
// //                                 setRowsPerPage(Number(e.target.value));
// //                                 setCurrentPage(1);
// //                             }}
// //                         >
// //                             <option value={5}>5</option>
// //                             <option value={10}>10</option>
// //                             <option value={15}>15</option>
// //                             <option value={20}>20</option>
// //                         </select>
// //                     </div>

// //                     <div className="page-info">
// //                         {totalRows === 0
// //                             ? "0-0 of 0"
// //                             : `${startIndex + 1}-${Math.min(
// //                                 endIndex,
// //                                 totalRows
// //                             )} of ${totalRows}`}
// //                     </div>

// //                     <div className="page-buttons">
// //                         <button
// //                             disabled={currentPage === 1}
// //                             onClick={() => setCurrentPage(currentPage - 1)}
// //                         >
// //                             &#8249;
// //                         </button>

// //                         <button
// //                             disabled={currentPage === totalPages || totalPages === 0}
// //                             onClick={() => setCurrentPage(currentPage + 1)}
// //                         >
// //                             &#8250;
// //                         </button>
// //                     </div>
// //                 </div>
// //             </div>

// //             {/* Assign Tester Popup */}
// //             {showAssignPopup && (
// //                 <AssignTesterPopup
// //                     project={selectedProject}
// //                     close={() => {
// //                         setShowAssignPopup(false);
// //                         // Refresh projects after assignment
// //                         const token = sessionStorage.getItem("access");
// //                         fetch("http://127.0.0.1:8000/testmanager/projects/", {
// //                             headers: {
// //                                 Authorization: `Bearer ${token}`,
// //                                 "Content-Type": "application/json",
// //                             },
// //                         })
// //                         .then(async (res) => {
// //                             const data = await res.json();
// //                             if (!res.ok) {
// //                                 throw new Error(data.error || "Unable to fetch projects");
// //                             }
// //                             setProjects(Array.isArray(data) ? data : []);
// //                         })
// //                         .catch((err) => {
// //                             console.log(err);
// //                             toast.error("Unable to refresh projects.");
// //                         });
// //                     }}
// //                 />
// //             )}
// //         </div>
// //     );
// // }

// // export default TMProjects;



// import { useEffect, useState } from "react";
// import { toast } from "react-toastify";
// import AssignTesterPopup from "./AssignTesterPopup";
// import "../Master/ProjectView.css";

// function TMProjects() {

//     const [projects, setProjects] = useState([]);
//     const [selectType, setSelectType] = useState("ALL");
//     const [selectStatus, setSelectStatus] = useState("ALL");
//     const [loading, setLoading] = useState(true);

//     const [rowsPerPage, setRowsPerPage] = useState(10);
//     const [currentPage, setCurrentPage] = useState(1);

//     const [showAssignPopup, setShowAssignPopup] = useState(false);
//     const [selectedProject, setSelectedProject] = useState(null);

//     // Helper to get project icon
//     const getProjectIcon = (type) => {
//         const icons = {
//             WEBAPP: "🌐",
//             NETWORK: "🔗",
//             API: "⚡",
//             MOBILE: "📱",
//             CYBER: "🛡️",
//             IOT: "📡",
//             THICK: "💻",
//             SOURCE: "📄",
//             RADIO: "📻"
//         };
//         return icons[type] || "📋";
//     };

//     const getPriorityClass = (priority) => {
//         const classes = {
//             CRITICAL: "priority-critical",
//             HIGH: "priority-high",
//             MEDIUM: "priority-medium",
//             LOW: "priority-low"
//         };
//         return classes[priority] || "priority-medium";
//     };

//     const getStatusClass = (status) => {
//         const classes = {
//             "CREATED": "status-created",
//             "ASSIGNED_PENDING": "status-pending",
//             "TESTER_ASSIGNED": "status-assigned",
//             "TESTING": "status-testing",
//             "REPORT_PENDING": "status-report-pending",
//             "APPROVED": "status-approved",
//             "COMPLETED": "status-completed"
//         };
//         return classes[status] || "status-pending";
//     };

//     const getStatusDisplay = (status) => {
//         const names = {
//             "CREATED": "🆕 Created",
//             "ASSIGNED_PENDING": "⏳ Pending Assignment",
//             "TESTER_ASSIGNED": "🧪 Tester Assigned",
//             "TESTING": "🔍 Testing",
//             "REPORT_PENDING": "📝 Report Pending",
//             "APPROVED": "✅ Approved",
//             "COMPLETED": "🎯 Completed"
//         };
//         return names[status] || status || "Pending";
//     };

//     const getStageName = (stage) => {
//         const stageMap = {
//             "INFO": "Information Gathering",
//             "SCAN": "Scanning & Enumeration",
//             "VULN": "Vulnerability Assessment",
//             "EXPLOIT": "Exploitation",
//             "POST": "Post Exploitation",
//             "COMPLETED": "Completed"
//         };
//         return stageMap[stage] || stage || "Not Started";
//     };

//     const getDaysRemaining = (deadline) => {
//         if (!deadline) return null;
//         const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
//         return days;
//     };

//     useEffect(() => {
//         fetchAllData();
//     }, []);

//     const fetchAllData = async () => {
//         const token = sessionStorage.getItem("access");
//         setLoading(true);

//         try {
//             // Fetch projects data
//             const projectsResponse = await fetch("http://127.0.0.1:8000/testmanager/projects/", {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     "Content-Type": "application/json",
//                 },
//             });

//             if (!projectsResponse.ok) {
//                 const text = await projectsResponse.text();
//                 throw new Error(`Projects API error: ${projectsResponse.status} - ${text}`);
//             }

//             const projectsData = await projectsResponse.json();
            
//             // Try to fetch suites data (optional)
//             let suitesData = [];
//             try {
//                 const suitesResponse = await fetch("http://127.0.0.1:8000/master/suites/", {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                         "Content-Type": "application/json",
//                     },
//                 });
//                 if (suitesResponse.ok) {
//                     suitesData = await suitesResponse.json();
//                 }
//             } catch (err) {
//                 console.log("Suites data not available:", err);
//             }

//             // Try to fetch stages data (optional)
//             let stagesData = [];
//             try {
//                 const stagesResponse = await fetch("http://127.0.0.1:8000/master/stages/", {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                         "Content-Type": "application/json",
//                     },
//                 });
//                 if (stagesResponse.ok) {
//                     stagesData = await stagesResponse.json();
//                 }
//             } catch (err) {
//                 console.log("Stages data not available:", err);
//             }

//             // Try to fetch tools data (optional)
//             let toolsData = [];
//             try {
//                 const toolsResponse = await fetch("http://127.0.0.1:8000/master/tools/", {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                         "Content-Type": "application/json",
//                     },
//                 });
//                 if (toolsResponse.ok) {
//                     toolsData = await toolsResponse.json();
//                 }
//             } catch (err) {
//                 console.log("Tools data not available:", err);
//             }

//             console.log("Projects Data:", projectsData);
//             console.log("Suites Data:", suitesData);
//             console.log("Stages Data:", stagesData);
//             console.log("Tools Data:", toolsData);

//             // Map the data to include all related information
//             const mappedProjects = projectsData.map(project => ({
//                 ...project,
//                 // Project details
//                 project_id: project.project_id,
//                 project_name: project.project_name,
//                 project_type: project.project_type,
//                 project_desc: project.project_desc,
//                 priority: project.priority,
//                 status: project.status,
//                 start_date: project.start_date,
//                 deadline: project.deadline,
//                 progress: project.progress || 0,
//                 current_stage: project.current_stage,
//                 testing_stage: project.testing_stage,

//                 // Customer details
//                 customer: project.customer || null,
//                 customer_name: project.customer?.organization || project.customer || "N/A",
                
//                 // Manager details
//                 manager: project.manager || null,
//                 manager_name: project.manager ? `${project.manager.first_name} ${project.manager.last_name}` : "N/A",
                
//                 // Tester assignments
//                 assignments: project.assignments || [],
//                 assigned_testers: project.assignments?.map(a => a.tester) || [],
                
//                 // Report details
//                 report: project.report || null,
//                 report_status: project.report?.report_status || "PENDING",
//                 report_id: project.report?.report_id || null,
                
//                 // Suite details (mapped from project_type)
//                 suite: suitesData.find(s => s.suite_name === project.project_type) || null,
//                 suite_name: suitesData.find(s => s.suite_name === project.project_type)?.suite_name || project.project_type || "N/A",
//                 suite_code: suitesData.find(s => s.suite_name === project.project_type)?.suite_code || "N/A",
//                 std_follows: suitesData.find(s => s.suite_name === project.project_type)?.std_follows || "N/A",
                
//                 // Stages
//                 stages: stagesData || [],
//                 current_stage_name: getStageName(project.current_stage),
                
//                 // Tools (mapped through suite-stage-tool mapping)
//                 tools: toolsData || [],
                
//                 // Vulnerabilities (if available)
//                 vulnerabilities: project.vulnerabilities || [],
//                 vulnerability_count: project.vulnerabilities?.length || 0,
                
//                 // Scope (if available)
//                 scope: project.scope || null,
                
//                 // Additional computed fields
//                 hasReport: project.report && 
//                           (project.report.report_status === "COMPLETED" || 
//                            project.report.report_status === "APPROVED"),
//                 isOverdue: project.deadline ? new Date(project.deadline) < new Date() : false,
//                 daysRemaining: getDaysRemaining(project.deadline),
//                 isPendingAssignment: project.status === "ASSIGNED_PENDING",
//                 isTesting: project.status === "TESTING",
//                 isCompleted: project.status === "COMPLETED",
//                 isApproved: project.status === "APPROVED"
//             }));

//             setProjects(mappedProjects);
//             setLoading(false);
//         } catch (err) {
//             console.error("Error fetching data:", err);
//             toast.error("Unable to load projects.");
//             setLoading(false);
//         }
//     };

//     // Filter projects by type and status
//     const filteredProjects = projects.filter(project => {
//         const typeMatch = selectType === "ALL" || project.project_type === selectType;
//         const statusMatch = selectStatus === "ALL" || project.status === selectStatus;
//         return typeMatch && statusMatch;
//     });

//     const totalRows = filteredProjects.length;
//     const totalPages = Math.ceil(totalRows / rowsPerPage);

//     const startIndex = (currentPage - 1) * rowsPerPage;
//     const endIndex = startIndex + rowsPerPage;

//     const currentProjects = filteredProjects.slice(
//         startIndex,
//         endIndex
//     );

//     const handleAssignClick = (project) => {
//         setSelectedProject(project);
//         setShowAssignPopup(true);
//     };

//     const handleAssignClose = () => {
//         setShowAssignPopup(false);
//         fetchAllData(); // Refresh all data after assignment
//     };

//     if (loading) {
//         return (
//             <div className="view-container">
//                 <div className="table-card">
//                     <div className="loading-state" style={{ textAlign: "center", padding: "60px 20px" }}>
//                         <div className="loading-spinner" style={{ fontSize: "48px" }}>⏳</div>
//                         <h3>Loading Projects...</h3>
//                         <p>Please wait while we fetch your data</p>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="view-container">
//             <div className="table-card">
//                 {/* Header */}
//                 <div className="table-header">
//                     <h2>
//                         <i className="fas fa-tasks"></i> My Projects
//                         <span style={{ fontSize: "14px", fontWeight: "normal", color: "#6b7a9a", marginLeft: "12px" }}>
//                             ({filteredProjects.length} projects)
//                         </span>
//                     </h2>

//                     <div className="header-actions">
//                         <div className="select-role">
//                             <label className="role-label">Type</label>
//                             <select
//                                 value={selectType}
//                                 onChange={(e) => {
//                                     setSelectType(e.target.value);
//                                     setCurrentPage(1);
//                                 }}
//                             >
//                                 <option value="ALL">All Types</option>
//                                 <option value="WEBAPP">Web Application</option>
//                                 <option value="MOBILE">Mobile</option>
//                                 <option value="NETWORK">Network</option>
//                                 <option value="IOT">IOT</option>
//                                 <option value="THICK">Thick Client</option>
//                                 <option value="SOURCE">Source Code Analysis</option>
//                                 <option value="RADIO">Radio</option>
//                             </select>
//                         </div>

//                         <div className="select-role">
//                             <label className="role-label">Status</label>
//                             <select
//                                 value={selectStatus}
//                                 onChange={(e) => {
//                                     setSelectStatus(e.target.value);
//                                     setCurrentPage(1);
//                                 }}
//                             >
//                                 <option value="ALL">All Status</option>
//                                 <option value="CREATED">Created</option>
//                                 <option value="ASSIGNED_PENDING">Pending Assignment</option>
//                                 <option value="TESTER_ASSIGNED">Tester Assigned</option>
//                                 <option value="TESTING">Testing</option>
//                                 <option value="REPORT_PENDING">Report Pending</option>
//                                 <option value="APPROVED">Approved</option>
//                                 <option value="COMPLETED">Completed</option>
//                             </select>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Project Cards Grid */}
//                 <div className="project-grid">
//                     {currentProjects.length === 0 ? (
//                         <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
//                             <div className="empty-icon">
//                                 <i className="fas fa-folder-open"></i>
//                             </div>
//                             <h3>No Projects Found</h3>
//                             <p>No projects have been assigned to you yet</p>
//                             <p style={{ fontSize: "13px", color: "#9ca3af" }}>
//                                 {selectType !== "ALL" || selectStatus !== "ALL" ? 
//                                     "Try changing your filters" : 
//                                     "Check back later for new projects"
//                                 }
//                             </p>
//                         </div>
//                     ) : (
//                         currentProjects.map((project, index) => (
//                             <div className="project-card" key={project.project_id}>
//                                 <div className="card-header">
//                                     <div className="project-name">
//                                         {getProjectIcon(project.project_type)} {project.project_name}
//                                     </div>
//                                     <div className="project-icon">
//                                         <span className="project-type-badge" style={{
//                                             fontSize: "11px",
//                                             padding: "2px 8px",
//                                             borderRadius: "12px",
//                                             background: "#f0f2f8",
//                                             color: "#4a6cf7"
//                                         }}>
//                                             {project.project_type}
//                                         </span>
//                                     </div>
//                                 </div>

//                                 <div className="card-body">
//                                     <div className="project-type">
//                                         <i className="fas fa-tag"></i> Type: {project.project_type || "N/A"}
//                                     </div>
                                    
//                                     {/* Customer Info */}
//                                     <div className="project-customer">
//                                         <i className="fas fa-building"></i> Customer: {project.customer_name}
//                                     </div>
                                    
//                                     {/* Manager Info */}
//                                     <div className="project-manager">
//                                         <i className="fas fa-user-tie"></i> Manager: {project.manager_name}
//                                     </div>
                                    
//                                     {/* Suite Info */}
//                                     <div className="project-suite">
//                                         <i className="fas fa-layer-group"></i> Suite: {project.suite_name}
//                                         {project.std_follows && project.std_follows !== "N/A" && (
//                                             <span style={{ marginLeft: "8px", fontSize: "11px", color: "#9ca3af" }}>
//                                                 ({project.std_follows})
//                                             </span>
//                                         )}
//                                     </div>

//                                     {/* Dates */}
//                                     <div className="project-dates">
//                                         <i className="fas fa-calendar-alt"></i> 
//                                         {project.start_date && `Start: ${project.start_date} | `}
//                                         Deadline: {project.deadline || "No deadline"}
//                                         {project.daysRemaining !== null && project.daysRemaining > 0 && (
//                                             <span style={{ 
//                                                 marginLeft: "8px",
//                                                 fontSize: "12px",
//                                                 color: project.daysRemaining < 7 ? "#dc2626" : "#22c55e"
//                                             }}>
//                                                 ({project.daysRemaining} days left)
//                                             </span>
//                                         )}
//                                         {project.isOverdue && (
//                                             <span style={{ marginLeft: "8px", color: "#dc2626", fontSize: "12px" }}>
//                                                 ⚠️ Overdue
//                                             </span>
//                                         )}
//                                     </div>

//                                     {/* Current Stage */}
//                                     {project.current_stage && (
//                                         <div className="project-stage">
//                                             <i className="fas fa-flag"></i> Stage: {project.current_stage_name}
//                                         </div>
//                                     )}

//                                     {/* Assigned Testers */}
//                                     {project.assigned_testers && project.assigned_testers.length > 0 && (
//                                         <div className="project-testers">
//                                             <i className="fas fa-users"></i> Testers: 
//                                             {project.assigned_testers.map((tester, idx) => (
//                                                 <span key={tester.id || idx} style={{ marginLeft: "4px" }}>
//                                                     {tester.first_name} {tester.last_name}
//                                                     {idx < project.assigned_testers.length - 1 && ", "}
//                                                 </span>
//                                             ))}
//                                         </div>
//                                     )}

//                                     {/* Progress Bar */}
//                                     <div className="progress-section" style={{ marginTop: "8px" }}>
//                                         <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#6b7a9a" }}>
//                                             <span>Progress</span>
//                                             <span>{project.progress || 0}%</span>
//                                         </div>
//                                         <div style={{
//                                             width: "100%",
//                                             height: "6px",
//                                             background: "#e8ecf4",
//                                             borderRadius: "4px",
//                                             marginTop: "4px"
//                                         }}>
//                                             <div style={{
//                                                 width: `${project.progress || 0}%`,
//                                                 height: "100%",
//                                                 background: project.progress >= 80 ? "#22c55e" : 
//                                                            project.progress >= 50 ? "#eab308" : "#4a6cf7",
//                                                 borderRadius: "4px",
//                                                 transition: "width 0.3s ease"
//                                             }} />
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className="card-footer">
//                                     <span className={`priority ${getPriorityClass(project.priority)}`}>
//                                         {project.priority || "MEDIUM"}
//                                     </span>
//                                     <span className={`status ${getStatusClass(project.status)}`}>
//                                         {getStatusDisplay(project.status)}
//                                     </span>
//                                 </div>

//                                 {/* Report Status Indicator */}
//                                 <div className="report-status-indicator">
//                                     <span className={`dot ${project.hasReport ? 'green' : 'yellow'}`}></span>
//                                     {project.hasReport ? (
//                                         <span>✅ Report Available ({project.report_status})</span>
//                                     ) : (
//                                         <span>📝 Report Pending</span>
//                                     )}
//                                     {project.report && (
//                                         <span style={{ marginLeft: "8px", fontSize: "11px", color: "#9ca3af" }}>
//                                             ID: {project.report.report_id}
//                                         </span>
//                                     )}
//                                 </div>

//                                 {/* Tools Used (if available) */}
//                                 {project.tools && project.tools.length > 0 && (
//                                     <div className="tools-section" style={{ 
//                                         marginTop: "12px",
//                                         paddingTop: "8px",
//                                         borderTop: "1px solid #f0f2f8"
//                                     }}>
//                                         <div style={{ fontSize: "11px", color: "#6b7a9a", marginBottom: "4px" }}>
//                                             <i className="fas fa-tools"></i> Available Tools:
//                                         </div>
//                                         <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
//                                             {project.tools.slice(0, 4).map(tool => (
//                                                 <span key={tool.tool_id} style={{
//                                                     fontSize: "10px",
//                                                     padding: "2px 8px",
//                                                     borderRadius: "12px",
//                                                     background: "#f8faff",
//                                                     color: "#4a6cf7"
//                                                 }}>
//                                                     {tool.tool_name}
//                                                 </span>
//                                             ))}
//                                             {project.tools.length > 4 && (
//                                                 <span style={{ fontSize: "10px", color: "#9ca3af" }}>
//                                                     +{project.tools.length - 4} more
//                                                 </span>
//                                             )}
//                                         </div>
//                                     </div>
//                                 )}

//                                 {/* Vulnerabilities Count */}
//                                 {project.vulnerability_count > 0 && (
//                                     <div className="vulnerabilities-summary" style={{
//                                         marginTop: "8px",
//                                         padding: "6px 12px",
//                                         borderRadius: "8px",
//                                         background: "#fef2f2",
//                                         fontSize: "12px",
//                                         display: "flex",
//                                         justifyContent: "space-between"
//                                     }}>
//                                         <span>🔒 Vulnerabilities Found</span>
//                                         <span style={{ fontWeight: "600", color: "#dc2626" }}>
//                                             {project.vulnerability_count}
//                                         </span>
//                                     </div>
//                                 )}

//                                 {/* Assign Button for PENDING projects */}
//                                 {project.isPendingAssignment && (
//                                     <div className="project-actions" style={{ 
//                                         marginTop: '12px', 
//                                         paddingTop: '12px', 
//                                         borderTop: '1px solid #f0f2f8' 
//                                     }}>
//                                         <button 
//                                             className="btn-assign"
//                                             onClick={() => handleAssignClick(project)}
//                                             style={{
//                                                 width: '100%',
//                                                 padding: '10px',
//                                                 background: '#4a6cf7',
//                                                 color: '#fff',
//                                                 border: 'none',
//                                                 borderRadius: '8px',
//                                                 fontSize: '14px',
//                                                 fontWeight: '600',
//                                                 cursor: 'pointer',
//                                                 transition: '0.3s',
//                                                 display: 'flex',
//                                                 alignItems: 'center',
//                                                 justifyContent: 'center',
//                                                 gap: '8px'
//                                             }}
//                                             onMouseEnter={(e) => {
//                                                 e.target.style.background = '#3b5de7';
//                                                 e.target.style.transform = 'translateY(-2px)';
//                                                 e.target.style.boxShadow = '0 4px 20px rgba(74,108,247,0.3)';
//                                             }}
//                                             onMouseLeave={(e) => {
//                                                 e.target.style.background = '#4a6cf7';
//                                                 e.target.style.transform = 'translateY(0)';
//                                                 e.target.style.boxShadow = 'none';
//                                             }}
//                                         >
//                                             <i className="fas fa-user-plus"></i> Assign Tester
//                                         </button>
//                                     </div>
//                                 )}

//                                 {/* Project ID badge */}
//                                 <div className="project-id-badge" style={{
//                                     position: 'absolute',
//                                     top: '12px',
//                                     right: '12px',
//                                     fontSize: '10px',
//                                     color: '#9ca3af',
//                                     background: '#f0f2f8',
//                                     padding: '2px 10px',
//                                     borderRadius: '12px',
//                                     fontWeight: '600'
//                                 }}>
//                                     #{project.project_id}
//                                 </div>
//                             </div>
//                         ))
//                     )}
//                 </div>

//                 {/* Pagination */}
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
//                             <option value={50}>50</option>
//                         </select>
//                     </div>

//                     <div className="page-info">
//                         {totalRows === 0 ? (
//                             "0 of 0"
//                         ) : (
//                             `${startIndex + 1}-${Math.min(endIndex, totalRows)} of ${totalRows}`
//                         )}
//                     </div>

//                     <div className="page-buttons">
//                         <button
//                             disabled={currentPage === 1}
//                             onClick={() => setCurrentPage(currentPage - 1)}
//                         >
//                             &#8249;
//                         </button>

//                         <button
//                             disabled={currentPage === totalPages || totalPages === 0}
//                             onClick={() => setCurrentPage(currentPage + 1)}
//                         >
//                             &#8250;
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {/* Assign Tester Popup */}
//             {showAssignPopup && (
//                 <AssignTesterPopup
//                     project={selectedProject}
//                     close={handleAssignClose}
//                 />
//             )}
//         </div>
//     );
// }

// export default TMProjects;


import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AssignTesterPopup from "./AssignTesterPopup";
import "../Master/ProjectView.css";

function TMProjects() {

    const [projects, setProjects] = useState([]);
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

    useEffect(() => {
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
            toast.error("Unable to load projects.");
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
                                        <i className="fas fa-tag"></i> {project.project_type || "N/A"}
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
