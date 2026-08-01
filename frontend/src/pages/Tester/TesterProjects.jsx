// // // import { useEffect, useState } from "react"; 
// // // import { useNavigate } from "react-router-dom";
// // // import { toast } from "react-toastify";
// // // import "../Master/ProjectView.css";
// // // import StageProgress from "./StageProgress";

// // // function TesterProjects() {

// // //     const navigate = useNavigate();

// // //     const getProjectIcon = (type) => {
// // //         const icons = {
// // //             WEBAPP: "🌐",
// // //             NETWORK: "🔗",
// // //             API: "⚡",
// // //             MOBILE: "📱",
// // //             CYBER: "🛡️",
// // //             IOT: "📡"
// // //         };
// // //         return icons[type] || "📋";
// // //     };

// // //     const openTesting = (projectId, stage) => {
// // //         navigate(`/tester/testing/${projectId}/${stage}`);
// // //     };

// // //     const [project, setProject] = useState([]);
// // //     const [selectType, setSelectType] = useState("ALL");

// // //     const filterProject =
// // //         selectType === "ALL"
// // //             ? project
// // //             : project.filter(user => user.project_type === selectType);

// // //     const [rowsPerPage, setRowsPerPage] = useState(10);
// // //     const [currentPage, setCurrentPage] = useState(1);

// // //     const totalRows = filterProject.length;
// // //     const totalPages = Math.ceil(totalRows / rowsPerPage);

// // //     const startIndex = (currentPage - 1) * rowsPerPage;
// // //     const endIndex = startIndex + rowsPerPage;

// // //     const currentProject = filterProject.slice(startIndex, endIndex);

// // //     useEffect(() => {
// // //         const user = JSON.parse(sessionStorage.getItem("user"));

// // //         if (!user) {
// // //             return;
// // //         }

// // //         const token = sessionStorage.getItem("access");
// // //         fetch("http://127.0.0.1:8000/tester/projects/", {
// // //             headers: {
// // //                 Authorization: `Bearer ${token}`,
// // //                 "Content-Type": "application/json",
// // //             },
// // //         })
// // //         .then(async (res) => {
// // //             if (!res.ok) {
// // //                 const text = await res.text();
// // //                 console.log(sessionStorage.getItem("access"));
// // //                 throw new Error(res.status);
// // //             }
// // //             return res.json();
// // //         })
// // //         .then(data => {
// // //             setProject(data);
// // //         })
// // //         .catch(err => console.log(err));
// // //     }, []);

// // //     const renderStageDots = (currentStage, projectId) => {
// // //         const stages = [
// // //             { id: 0, name: "Information Gathering" },
// // //             { id: 1, name: "Scanning & Enumeration" },
// // //             { id: 2, name: "Vulnerability Assessment" },
// // //             { id: 3, name: "Exploitation" },
// // //             { id: 4, name: "Post Exploitation" }
// // //         ];

// // //         const stageMap = {
// // //             "INFORMATION_GATHERING": 0,
// // //             "SCANNING_ENUMERATION": 1,
// // //             "VULNERABILITY_ASSESSMENT": 2,
// // //             "EXPLOITATION": 3,
// // //             "POST_EXPLOITATION": 4
// // //         };

// // //         const currentStageIndex = stageMap[currentStage] !== undefined ? stageMap[currentStage] : -1;

// // //         return stages.map((stage, index) => (
// // //             <div 
// // //                 key={stage.id}
// // //                 className={`stage-dot ${index < currentStageIndex ? 'completed' : index === currentStageIndex ? 'active' : 'pending'}`}
// // //                 onClick={() => openTesting(projectId, stage.name)}
// // //                 // title={`${stage.name} ${index < currentStageIndex ? '✅' : index === currentStageIndex ? '▶️' : '⏳'}`}
// // //             >
// // //                 {/* <span className="tooltip">{stage.name}</span> */}
// // //             </div>
// // //         ));
// // //     };

// // //     return (
// // //         <div className="view-container">
// // //             <div className="table-card">
// // //                 {/* Header */}
// // //                 <div className="table-header">
// // //                     <h2>
// // //                         <i className="fas fa-tasks"></i> My Projects
// // //                     </h2>

// // //                     <div className="header-actions">
// // //                         <div className="select-role">
// // //                             <label className="role-label">Type</label>
// // //                             <select
// // //                                 value={selectType}
// // //                                 onChange={(e) => setSelectType(e.target.value)}
// // //                             >
// // //                                 <option value="ALL">All</option>
// // //                                 <option value="WEBAPP">Web Application</option>
// // //                                 <option value="NETWORK">Network Testing</option>
// // //                                 <option value="API">API Testing</option>
// // //                                 <option value="MOBILE">Mobile Testing</option>
// // //                                 <option value="CYBER">CyberSecurity</option>
// // //                             </select>
// // //                         </div>
// // //                     </div>
// // //                 </div>

// // //                 {/* Project Cards Grid */}
// // //                 <div className="project-grid">
// // //                     {currentProject.length === 0 ? (
// // //                         <div className="empty-state">
// // //                             <div className="empty-icon">
// // //                                 <i className="fas fa-folder-open"></i>
// // //                             </div>
// // //                             <h3>No Projects Found</h3>
// // //                             <p>You haven't been assigned any projects yet</p>
// // //                         </div>
// // //                     ) : (
// // //                         currentProject.map((project, index) => (
// // //                             <div className="project-card" key={project.project_id}>
// // //                                 <div className="card-header">
// // //                                     <div className="project-name">
// // //                                         {getProjectIcon(project.project_type)} {project.project_name}
// // //                                     </div>
// // //                                     <div className="project-icon">
// // //                                         {/* {getProjectIcon(project.project_type)} */}
// // //                                     </div>
// // //                                 </div>

// // //                                 <div className="card-body">
// // //                                     <div className="project-type">
// // //                                         <i className="fas fa-tag"></i> {project.project_type || ""}
// // //                                     </div>
// // //                                     <div className="assigned-by">
// // //                                     </div>
// // //                                      <div className="deadline">
// // //                                         <i className="fas fa-calendar"></i>{project.start_date || "-"}
// // //                                     </div>
// // //                                     <div className="deadline">
// // //                                         <i className="fas fa-calendar"></i>{project.deadline || "-"}
// // //                                     </div>
// // //                                     <div className="deadline">
// // //                                         <i className="fas fa-user"></i> Assigned by : {project.assigned_by || "N/A"}
// // //                                     </div>
// // //                                 </div>

// // //                                 <div className="card-footer">
// // //                                     <span className={`priority priority-${project.priority?.toLowerCase() || "medium"}`}>
// // //                                         {project.priority || "MEDIUM"}
// // //                                     </span>
// // //                                 </div>

// // //                                 {/* Stage Progress */}
// // //                                 <div className="stage-section">
// // //                                     <div className="stage-label">
// // //                                         <span>Progress</span>
// // //                                         <span className="current-stage">
// // //                                             {project.current_stage || "Not Started"}
// // //                                             {/* {project.current_stage} */}
// // //                                         </span>
// // //                                     </div>
// // //                                     <div className="stage-progress">
// // //                                         {renderStageDots(project.current_stage, project.project_id)}
// // //                                     </div>
// // //                                 </div>
// // //                             </div>
// // //                         ))
// // //                     )}
// // //                 </div>

// // //                 {/* Pagination */}
// // //                 <div className="pagination-footer">
// // //                     <div className="rows-section">
// // //                         <span>Rows per page:</span>
// // //                         <select
// // //                             value={rowsPerPage}
// // //                             onChange={(e) => {
// // //                                 setRowsPerPage(Number(e.target.value));
// // //                                 setCurrentPage(1);
// // //                             }}
// // //                         >
// // //                             <option value={5}>5</option>
// // //                             <option value={10}>10</option>
// // //                             <option value={15}>15</option>
// // //                             <option value={20}>20</option>
// // //                         </select>
// // //                     </div>

// // //                     <div className="page-info">
// // //                         {startIndex + 1}-{Math.min(endIndex, totalRows)} of {totalRows}
// // //                     </div>

// // //                     <div className="page-buttons">
// // //                         <button 
// // //                             disabled={currentPage === 1}
// // //                             onClick={() => setCurrentPage(currentPage - 1)}
// // //                         >
// // //                             &#8249;
// // //                         </button>

// // //                         <button 
// // //                             disabled={currentPage === totalPages}
// // //                             onClick={() => setCurrentPage(currentPage + 1)}
// // //                         >
// // //                             &#8250;
// // //                         </button>
// // //                     </div>
// // //                 </div>
// // //             </div>
// // //         </div>
// // //     );
// // // }

// // // export default TesterProjects;


// // import { useEffect, useState } from "react"; 
// // import { useNavigate } from "react-router-dom";
// // import { toast } from "react-toastify";
// // import "../Master/ProjectView.css";

// // function TesterProjects() {

// //     const navigate = useNavigate();

// //     const getProjectIcon = (type) => {
// //         const icons = {
// //             WEBAPP: "🌐",
// //             NETWORK: "🔗",
// //             API: "⚡",
// //             MOBILE: "📱",
// //             CYBER: "🛡️",
// //             IOT: "📡",
// //             THICK: "💻",
// //             SOURCE: "📄",
// //             RADIO: "📻"
// //         };
// //         return icons[type] || "📋";
// //     };

// //     const getStageName = (stage) => {
// //         const stageMap = {
// //             "INFO": "Information Gathering",
// //             "SCAN": "Scanning & Enumeration",
// //             "VULN": "Vulnerability Assessment",
// //             "EXPLOIT": "Exploitation",
// //             "POST": "Post Exploitation",
// //             "COMPLETED": "Completed"
// //         };
// //         // console.log(stage);
// //         // console.log(stageMap[stage]);
// //         return stageMap[stage] || stage || "Not Started";
// //     };

// //     const [project, setProject] = useState([]);
// //     const [selectType, setSelectType] = useState("ALL");

// //     const filterProject =
// //         selectType === "ALL"
// //             ? project
// //             : project.filter(user => user.project_type === selectType);

// //     const [rowsPerPage, setRowsPerPage] = useState(10);
// //     const [currentPage, setCurrentPage] = useState(1);

// //     const totalRows = filterProject.length;
// //     const totalPages = Math.ceil(totalRows / rowsPerPage);

// //     const startIndex = (currentPage - 1) * rowsPerPage;
// //     const endIndex = startIndex + rowsPerPage;

// //     const currentProject = filterProject.slice(startIndex, endIndex);

// //     useEffect(() => {
// //         const user = JSON.parse(sessionStorage.getItem("user"));

// //         if (!user) {
// //             toast.error("Please login to view projects");
// //             navigate("/login");
// //             return;
// //         }

// //         const token = sessionStorage.getItem("access");
// //         fetch("http://127.0.0.1:8000/tester/projects/", {
// //             headers: {
// //                 Authorization: `Bearer ${token}`,
// //                 "Content-Type": "application/json",
// //             },
// //         })
// //         .then(async (res) => {
// //             if (!res.ok) {
// //                 const text = await res.text();
// //                 console.log(sessionStorage.getItem("access"));
// //                 throw new Error(res.status);
// //             }
// //             return res.json();
// //         })
// //         .then(data => {
// //             console.log("Projects Data:", data);
// //             setProject(data);
// //         })
// //         .catch(err => {
// //             console.error("Error fetching projects:", err);
// //             toast.error("Failed to load projects");
// //         });
// //     }, [navigate]);

// //     const openTesting = (projectId, stage) => {
// //         navigate(`/tester/testing/${projectId}/${stage}`);
// //     };

// //     // FIXED: Proper stage mapping with short codes
// //     const renderStageDots = (currentStage, projectId) => {
// //         const stages = [
// //             { id: 0, name: "Information Gathering", key: "INFO" },
// //             { id: 1, name: "Scanning & Enumeration", key: "SCAN" },
// //             { id: 2, name: "Vulnerability Assessment", key: "VULN" },
// //             { id: 3, name: "Exploitation", key: "EXPLOIT" },
// //             { id: 4, name: "Post Exploitation", key: "POST" },
// //             { id: 5, name: "Completed", key: "COMPLETED" }
// //         ];

// //         // FIXED: Use short codes that match your backend data
// //         const stageMap = {
// //             "INFO": 0,
// //             "SCAN": 1,
// //             "VULN": 2,
// //             "EXPLOIT": 3,
// //             "POST": 4,
// //             "COMPLETED": 5
// //         };

// //         // Get the index based on the current stage
// //         const currentStageIndex = stageMap[currentStage] !== undefined ? stageMap[currentStage] : -1;

// //         return stages.map((stage, index) => (
// //             <div 
// //                 key={stage.id}
// //                 className={`stage-dot ${index < currentStageIndex ? 'completed' : index === currentStageIndex ? 'active' : 'pending'}`}
// //                 onClick={() => {
// //                     if (index <= currentStageIndex) {
// //                         openTesting(projectId, stage.key);
// //                     }
// //                 }}
// //                 style={{ 
// //                     cursor: index <= currentStageIndex ? 'pointer' : 'not-allowed',
// //                     opacity: index <= currentStageIndex ? 1 : 0.4
// //                 }}
// //                 title={stage.name}
// //             >
// //                 <span className="tooltip">{stage.name}</span>
// //             </div>
// //         ));
// //     };

// //     return (
// //         <div className="view-container">
// //             <div className="table-card">
// //                 {/* Header */}
// //                 <div className="table-header">
// //                     <h2>
// //                         <i className="fas fa-tasks"></i> My Projects
// //                         <span style={{ fontSize: "14px", fontWeight: "normal", color: "#6b7a9a", marginLeft: "12px" }}>
// //                             ({filterProject.length} projects)
// //                         </span>
// //                     </h2>

// //                     <div className="header-actions">
// //                         <div className="select-role">
// //                             <label className="role-label">Type</label>
// //                             <select
// //                                 value={selectType}
// //                                 onChange={(e) => {
// //                                     setSelectType(e.target.value);
// //                                     setCurrentPage(1);
// //                                 }}
// //                             >
// //                                 <option value="ALL">All</option>
// //                                 <option value="WEBAPP">Web Application</option>
// //                                 <option value="NETWORK">Network Testing</option>
// //                                 <option value="API">API Testing</option>
// //                                 <option value="MOBILE">Mobile Testing</option>
// //                                 <option value="CYBER">CyberSecurity</option>
// //                                 <option value="IOT">IOT</option>
// //                                 <option value="THICK">Thick Client</option>
// //                                 <option value="SOURCE">Source Code Analysis</option>
// //                             </select>
// //                         </div>
// //                     </div>
// //                 </div>

// //                 {/* Project Cards Grid */}
// //                 <div className="project-grid">
// //                     {currentProject.length === 0 ? (
// //                         <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
// //                             <div className="empty-icon">
// //                                 <i className="fas fa-folder-open"></i>
// //                             </div>
// //                             <h3>No Projects Found</h3>
// //                             <p>You haven't been assigned any projects yet</p>
// //                             <p style={{ fontSize: "13px", color: "#9ca3af" }}>
// //                                 {selectType !== "ALL" ? 
// //                                     "Try changing your filters" : 
// //                                     "Check back later for new assignments"
// //                                 }
// //                             </p>
// //                         </div>
// //                     ) : (
// //                         currentProject.map((project, index) => (
// //                             <div className="project-card" key={project.project_id}>
// //                                 <div className="card-header">
// //                                     <div className="project-name">
// //                                         {getProjectIcon(project.project_type)} {project.project_name}
// //                                     </div>
// //                                 </div>

// //                                 <div className="card-body">
// //                                     <div className="project-type">
// //                                         <i className="fas fa-tag"></i>{project.project_type || "N/A"}
// //                                     </div>
                                    
// //                                     {/* Start Date */}
// //                                     <div className="deadline">
// //                                         <i className="fas fa-calendar-plus"></i> Start : {project.start_date || "-"}
// //                                     </div>
                                    
// //                                     {/* Deadline */}
// //                                     <div className="deadline">
// //                                         <i className="fas fa-calendar"></i> Deadline : {project.deadline || "-"}
// //                                     </div>
                                    
// //                                     {/* Assigned By */}
// //                                     <div className="assigned-by">
// //                                         <i className="fas fa-user"></i> Assigned By : {project.assigned_by || "N/A"}
// //                                     </div>
// //                                 </div>

// //                                 <div className="card-footer">
// //                                     <span className={`priority priority-${project.priority?.toLowerCase() || "medium"}`}>
// //                                         {project.priority || "MEDIUM"}
// //                                     </span>
// //                                     <span className={`status status-${project.status?.toLowerCase().replace(/\s/g, "-") || "pending"}`}>
// //                                         {project.status || "Pending"}
// //                                     </span>
// //                                 </div>

// //                                 {/* Stage Progress */}
// //                                 <div className="stage-section">
// //                                     <div className="stage-label">
// //                                         <span>Progress</span>
// //                                         <span className="current-stage">
// //                                             {getStageName(project.current_stage)}
// //                                         </span>
// //                                     </div>
// //                                     <div className="stage-progress">
// //                                         {renderStageDots(project.current_stage, project.project_id)}
// //                                     </div>
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
// //                         {totalRows === 0 ? (
// //                             "0 of 0"
// //                         ) : (
// //                             `${startIndex + 1}-${Math.min(endIndex, totalRows)} of ${totalRows}`
// //                         )}
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
// //         </div>
// //     );
// // }

// // export default TesterProjects;


// import { useEffect, useState } from "react"; 
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import "../Master/ProjectView.css";

// function TesterProjects() {

//     const navigate = useNavigate();

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

//     // FIXED: Handle both stage codes and stage IDs
//     const getStageName = (stage) => {
//         // Stage code to name mapping
//         const stageMap = {
//             "INFO": "Information Gathering",
//             "SCAN": "Scanning & Enumeration",
//             "VULN": "Vulnerability Assessment",
//             "EXPLOIT": "Exploitation",
//             "POST": "Post Exploitation",
//             "COMPLETED": "Completed"
//         };
        
//         // Stage ID to name mapping (for cases where backend returns ST001, ST002, etc.)
//         const stageIdMap = {
//             "ST001": "Information Gathering",
//             "ST002": "Scanning & Enumeration",
//             "ST003": "Vulnerability Assessment",
//             "ST004": "Exploitation",
//             "ST005": "Post Exploitation",
//             "ST006": "Completed"
//         };
        
//         // Try to map from stage code first, then from stage ID
//         if (stageMap[stage]) {
//             return stageMap[stage];
//         }
//         if (stageIdMap[stage]) {
//             return stageIdMap[stage];
//         }
        
//         return stage || "Not Started";
//     };

//     // Helper to get stage code from either stage code or stage ID
//     const getStageCode = (stage) => {
//         const codeMap = {
//             "INFO": "INFO",
//             "SCAN": "SCAN",
//             "VULN": "VULN",
//             "EXPLOIT": "EXPLOIT",
//             "POST": "POST",
//             "COMPLETED": "COMPLETED",
//             "ST001": "INFO",
//             "ST002": "SCAN",
//             "ST003": "VULN",
//             "ST004": "EXPLOIT",
//             "ST005": "POST",
//             "ST006": "COMPLETED"
//         };
//         return codeMap[stage] || stage;
//     };

//     // Get status display with emoji
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
//         const user = JSON.parse(sessionStorage.getItem("user"));

//         if (!user) {
//             toast.error("Please login to view projects");
//             navigate("/login");
//             return;
//         }

//         const token = sessionStorage.getItem("access");
//         fetch("http://127.0.0.1:8000/tester/projects/", {
//             headers: {
//                 Authorization: `Bearer ${token}`,
//                 "Content-Type": "application/json",
//             },
//         })
//         .then(async (res) => {
//             if (!res.ok) {
//                 const text = await res.text();
//                 console.log(sessionStorage.getItem("access"));
//                 throw new Error(res.status);
//             }
//             return res.json();
//         })
//         .then(data => {
//             console.log("Projects Data:", data);
//             setProject(data);
//         })
//         .catch(err => {
//             console.error("Error fetching projects:", err);
//             toast.error("Failed to load projects");
//         });
//     }, [navigate]);

//     const openTesting = (projectId, stage) => {
//         // Get the stage code for the URL
//         const stageCode = getStageCode(stage);
//         navigate(`/tester/testing/${projectId}/${stageCode}`);
//     };

//     // FIXED: Proper stage mapping with support for both stage codes and stage IDs
//     const renderStageDots = (currentStage, projectId) => {
//         const stages = [
//             { id: 0, name: "Information Gathering", key: "INFO" },
//             { id: 1, name: "Scanning & Enumeration", key: "SCAN" },
//             { id: 2, name: "Vulnerability Assessment", key: "VULN" },
//             { id: 3, name: "Exploitation", key: "EXPLOIT" },
//             { id: 4, name: "Post Exploitation", key: "POST" },
//             { id: 5, name: "Completed", key: "COMPLETED" }
//         ];

//         // Map both stage codes and stage IDs to indices
//         const stageMap = {
//             "INFO": 0,
//             "SCAN": 1,
//             "VULN": 2,
//             "EXPLOIT": 3,
//             "POST": 4,
//             "COMPLETED": 5,
//             "ST001": 0,
//             "ST002": 1,
//             "ST003": 2,
//             "ST004": 3,
//             "ST005": 4,
//             "ST006": 5
//         };

//         // Get the index based on the current stage
//         const currentStageIndex = stageMap[currentStage] !== undefined ? stageMap[currentStage] : -1;

//         return stages.map((stage, index) => (
//             <div 
//                 key={stage.id}
//                 className={`stage-dot ${index < currentStageIndex ? 'completed' : index === currentStageIndex ? 'active' : 'pending'}`}
//                 onClick={() => {
//                     if (index <= currentStageIndex) {
//                         openTesting(projectId, stage.key);
//                     }
//                 }}
//                 style={{ 
//                     cursor: index <= currentStageIndex ? 'pointer' : 'not-allowed',
//                     opacity: index <= currentStageIndex ? 1 : 0.4
//                 }}
//                 title={stage.name}
//             >
//                 {/* <span className="tooltip">{stage.name}</span> */}
//             </div>
//         ));
//     };

//     return (
//         <div className="view-container">
//             <div className="table-card">
//                 {/* Header */}
//                 <div className="table-header">
//                     <h2>
//                         <i className="fas fa-tasks"></i> My Projects
//                         <span style={{ fontSize: "14px", fontWeight: "normal", color: "#6b7a9a", marginLeft: "12px" }}>
//                             ({filterProject.length} projects)
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
//                                 <option value="ALL">All</option>
//                                 <option value="WEBAPP">Web Application</option>
//                                 <option value="NETWORK">Network Testing</option>
//                                 <option value="API">API Testing</option>
//                                 <option value="MOBILE">Mobile Testing</option>
//                                 <option value="CYBER">CyberSecurity</option>
//                                 <option value="IOT">IOT</option>
//                                 <option value="THICK">Thick Client</option>
//                                 <option value="SOURCE">Source Code Analysis</option>
//                             </select>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Project Cards Grid */}
//                 <div className="project-grid">
//                     {currentProject.length === 0 ? (
//                         <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
//                             <div className="empty-icon">
//                                 <i className="fas fa-folder-open"></i>
//                             </div>
//                             <h3>No Projects Found</h3>
//                             <p>You haven't been assigned any projects yet</p>
//                             <p style={{ fontSize: "13px", color: "#9ca3af" }}>
//                                 {selectType !== "ALL" ? 
//                                     "Try changing your filters" : 
//                                     "Check back later for new assignments"
//                                 }
//                             </p>
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
                                    
//                                     {/* Start Date */}
//                                     <div className="deadline">
//                                         <i className="fas fa-calendar-plus"></i> Start : {project.start_date || "-"}
//                                     </div>
                                    
//                                     {/* Deadline */}
//                                     <div className="deadline">
//                                         <i className="fas fa-calendar"></i> Deadline : {project.deadline || "-"}
//                                     </div>
                                    
//                                     {/* Assigned By */}
//                                     <div className="assigned-by">
//                                         <i className="fas fa-user"></i> Assigned By : {project.assigned_by || "N/A"}
//                                     </div>
//                                 </div>

//                                 <div className="card-footer">
//                                     <span className={`priority priority-${project.priority?.toLowerCase() || "medium"}`}>
//                                         {project.priority || "MEDIUM"}
//                                     </span>
//                                     {/* FIXED: Status styled like priority badge */}
//                                     <span className={`status status-${project.status?.toLowerCase().replace(/\s/g, "-") || "pending"}`}>
//                                         {getStatusDisplay(project.status)}
//                                     </span>
//                                 </div>

//                                 {/* Stage Progress */}
//                                 <div className="stage-section">
//                                     <div className="stage-label">
//                                         <span>Progress</span>
//                                         <span className="current-stage">
//                                             {getStageName(project.current_stage)}
//                                         </span>
//                                     </div>
//                                     <div className="stage-progress">
//                                         {renderStageDots(project.current_stage, project.project_id)}
//                                     </div>
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
//         </div>
//     );
// }

// export default TesterProjects;



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

    // Handle both stage codes and stage IDs
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

    // Get stage code from either stage code or stage ID
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

    // Get status display with emoji
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
            console.log("Projects Data:", data);
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

    // Render stage dots - REMOVED restriction and duplicate labels
    const renderStageDots = (currentStage, projectId) => {
        const stages = [
            { id: 0, name: "Information Gathering", key: "INFO" },
            { id: 1, name: "Scanning & Enumeration", key: "SCAN" },
            { id: 2, name: "Vulnerability Assessment", key: "VULN" },
            { id: 3, name: "Exploitation", key: "EXPLOIT" },
            { id: 4, name: "Post Exploitation", key: "POST" },
            { id: 5, name: "Completed", key: "COMPLETED" }
        ];

        // Map both stage codes and stage IDs to indices
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
                onClick={() => openTesting(projectId, stage.key)}
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
                                    {/* <div className="project-icon">
                                        <span className="project-type-badge" style={{
                                            fontSize: "11px",
                                            padding: "2px 8px",
                                            borderRadius: "12px",
                                            background: "#f0f2f8",
                                            color: "#4a6cf7"
                                        }}>
                                            {project.project_type}
                                        </span>
                                    </div> */}
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

                                {/* Stage Progress - REMOVED duplicate stage name */}
                                <div className="stage-section">
                                    <div className="stage-label">
                                        <span>Progress</span>
                                        {/* REMOVED the current-stage span that was showing duplicate name */}
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