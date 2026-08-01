// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Pencil, Trash2 } from "lucide-react";
// import { toast } from "react-toastify";
// import "./UIDesign.css";

// function Tools() {

//     const navigate = useNavigate();

//     const [tools, setTools] = useState([]);
//     const [loading, setLoading] = useState(true);

//     const [rowsPerPage, setRowsPerPage] = useState(10);
//     const [currentPage, setCurrentPage] = useState(1);

//     const totalRows = tools.length;
//     const totalPages = Math.ceil(totalRows / rowsPerPage);

//     const startIndex = (currentPage - 1) * rowsPerPage;
//     const endIndex = Math.min(startIndex + rowsPerPage, totalRows);

//     const currentTools = tools.slice(startIndex, endIndex);

//     const getStatusClass = (status) => {
//         return status ? 'status-active' : 'status-inactive';
//     };

//     const getStatusDisplay = (status) => {
//         return status ? 'Active' : 'Inactive';
//     };

//     useEffect(() => {
//         fetch("http://127.0.0.1:8000/master/tools/")
//             .then(async (res) => {
//                 if (!res.ok) {
//                     const text = await res.text();
//                     console.error("Server Error:", text);
//                     throw new Error(`HTTP ${res.status}`);
//                 }
//                 return res.json();
//             })
//             .then(data => {
//                 console.log("Tools:", data);
//                 setTools(data);
//             })
//             .catch(err => {
//                 console.error("Tools Fetch Error:", err);
//                 toast.error("Failed to load tools");
//             })
//             .finally(() => {
//                 setLoading(false);
//             });
//     }, []);

//     useEffect(() => {
//         if (currentPage > totalPages) {
//             setCurrentPage(totalPages || 1);
//         }
//     }, [totalPages, currentPage]);

//     return (
//         <div className="view-container">
//             <div className="table-card">
//                 <div className="table-header">
//                     <h2>
//                         Tools Management
//                         <span className="count-badge">
//                             ({tools.length} tools)
//                         </span>
//                     </h2>

//                     <div className="header-actions">
//                         <button
//                             className="create-btn"
//                             onClick={() => navigate("/master/tools/create/")}
//                         >
//                             + Add Tool
//                         </button>
//                     </div>
//                 </div>

//                 <div className="table-wrapper">
//                     <table className="user-table">
//                         <thead>
//                             <tr>
//                                 <th>SR. NO.</th>
//                                 <th>TOOL NAME</th>
//                                 <th>CATEGORY</th>
//                                 <th>SUITE</th>
//                                 <th>STAGE</th>
//                                 <th>STATUS</th>
//                             </tr>
//                         </thead>

//                         <tbody>
//                             {loading ? (
//                                 <tr>
//                                     <td colSpan="6" className="text-center">
//                                         Loading tools...
//                                     </td>
//                                 </tr>
//                             ) : currentTools.length === 0 ? (
//                                 <tr>
//                                     <td colSpan="6" className="empty-table-state">
//                                         <div className="empty-state-content">
//                                             <div className="empty-icon">
//                                                 <i className="fas fa-tools"></i>
//                                             </div>
//                                             <h3>No Tools Found</h3>
//                                             <p>Click "Add Tool" to get started</p>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ) : (
//                                 currentTools.map((tool, index) => (
//                                     <tr key={tool.id || tool.tool_id}>
//                                         <td>{startIndex + index + 1}</td>
//                                         <td>{tool.tool_name}</td>
//                                         <td>{tool.tool_category || 'N/A'}</td>
//                                         <td>{tool.suite || 'N/A'}</td>
//                                         <td>{tool.stage || 'N/A'}</td>
//                                         <td>
//                                             <span className={`status ${getStatusClass(tool.tool_status)}`}>
//                                                 ● {getStatusDisplay(tool.tool_status)}
//                                             </span>
//                                         </td>
//                                     </tr>
//                                 ))
//                             )}
//                         </tbody>
//                     </table>
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
//                             <option value={10}>10</option>
//                             <option value={15}>15</option>
//                             <option value={20}>20</option>
//                         </select>
//                     </div>

//                     <div className="page-info">
//                         {totalRows === 0
//                             ? "0-0 of 0"
//                             : `${startIndex + 1}-${Math.min(endIndex, totalRows)} of ${totalRows}`}
//                     </div>

//                     <div className="page-buttons">
//                         <button
//                             disabled={currentPage === 1 || totalRows === 0}
//                             onClick={() => setCurrentPage(currentPage - 1)}
//                         >
//                             &#8249;
//                         </button>
//                         <button
//                             disabled={currentPage === totalPages || totalPages === 0 || totalRows === 0}
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

// export default Tools;


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import "./UIDesign.css";

function Tools() {

    const navigate = useNavigate();

    const [tools, setTools] = useState([]);
    const [loading, setLoading] = useState(true);

    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const totalRows = tools.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalRows);

    const currentTools = tools.slice(startIndex, endIndex);

    const getStatusClass = (status) => {
        return status ? 'status-active' : 'status-inactive';
    };

    const getStatusDisplay = (status) => {
        return status ? 'Active' : 'Inactive';
    };

    useEffect(() => {
        const token = sessionStorage.getItem("access");

        fetch("http://127.0.0.1:8000/master/tools/", {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        })
            .then(async (res) => {
                if (!res.ok) {
                    const text = await res.text();
                    console.error("Server Error:", text);
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                console.log("Tools:", data);
                setTools(data);
            })
            .catch(err => {
                console.error("Tools Fetch Error:", err);
                toast.error("Failed to load tools");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages || 1);
        }
    }, [totalPages, currentPage]);

    return (
        <div className="view-container">
            <div className="table-card">
                <div className="table-header">
                    <h2>
                        Tools Management
                        <span className="count-badge">
                            ({tools.length} tools)
                        </span>
                    </h2>

                    <div className="header-actions">
                        <button
                            className="create-btn"
                            onClick={() => navigate("/master/tools/create/")}
                        >
                            + Add Tool
                        </button>
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>SR. NO.</th>
                                <th>TOOL NAME</th>
                                <th>CATEGORY</th>
                                <th>SUITE</th>
                                <th>STAGE</th>
                                <th>STATUS</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center">
                                        Loading tools...
                                    </td>
                                </tr>
                            ) : currentTools.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="empty-table-state">
                                        <div className="empty-state-content">
                                            <div className="empty-icon">
                                                <i className="fas fa-tools"></i>
                                            </div>
                                            <h3>No Tools Found</h3>
                                            <p>Click "Add Tool" to get started</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentTools.map((tool, index) => (
                                    <tr key={tool.id || tool.tool_id}>
                                        <td>{startIndex + index + 1}</td>
                                        <td>{tool.tool_name}</td>
                                        <td>{tool.tool_category || 'N/A'}</td>
                                        <td>{tool.suite || 'N/A'}</td>
                                        <td>{tool.stage || 'N/A'}</td>
                                        <td>
                                            <span className={`status ${getStatusClass(tool.tool_status)}`}>
                                                ● {getStatusDisplay(tool.tool_status)}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
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
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                        </select>
                    </div>

                    <div className="page-info">
                        {totalRows === 0
                            ? "0-0 of 0"
                            : `${startIndex + 1}-${Math.min(endIndex, totalRows)} of ${totalRows}`}
                    </div>

                    <div className="page-buttons">
                        <button
                            disabled={currentPage === 1 || totalRows === 0}
                            onClick={() => setCurrentPage(currentPage - 1)}
                        >
                            &#8249;
                        </button>
                        <button
                            disabled={currentPage === totalPages || totalPages === 0 || totalRows === 0}
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

export default Tools;