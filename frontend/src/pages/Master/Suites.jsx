
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./UIDesign.css";

// function Suites() {

//     const navigate = useNavigate();

//     const [suite, setSuite] = useState([]);
//     const [loading, setLoading] = useState(true);

//     const [rowsPerPage, setRowsPerPage] = useState(10);
//     const [currentPage, setCurrentPage] = useState(1);

//     const totalRows = suite.length;
//     const totalPages = Math.ceil(totalRows / rowsPerPage);

//     const startIndex = (currentPage - 1) * rowsPerPage;
//     const endIndex = startIndex + rowsPerPage;

//     const currentSuite = suite.slice(
//         startIndex,
//         endIndex
//     );

//     const truncate = (str, n) => {
//         return str?.length > n
//             ? str.substring(0, n - 1) + "..."
//             : str;
//     };

//     useEffect(() => {
//         fetch("http://127.0.0.1:8000/master/suites/")
//         .then(async (res) => {
//             if (!res.ok) {
//                 const text = await res.text();
//                 console.error(
//                     "Server Error:",
//                     text
//                 );
//                 throw new Error(
//                     `HTTP ${res.status}`
//                 );
//             }
//             return res.json();
//         })
//         .then((data) => {
//             console.log(
//                 "Suites:",
//                 data
//             );
//             setSuite(data);
//         })
//         .catch((err)=>{
//             console.error(
//                 "Suite Fetch Error:",
//                 err
//             );
//         })
//         .finally(()=>{
//             setLoading(false);
//         });
//     }, []);

//     useEffect(()=>{
//         if(currentPage > totalPages){
//             setCurrentPage(
//                 totalPages || 1
//             );
//         }
//     },[
//         totalPages,
//         currentPage
//     ]);

//     return (
//         <div className="view-container">
//             <div className="table-header">
//                 <h2>Suites Management</h2>
//                 <div className="header-actions">
//                     <button
//                         className="create-btn"
//                         onClick={()=>navigate(
//                             "/master/suites/create/"
//                         )}
//                     >
//                         + Create Suite
//                     </button>
//                 </div>
//             </div>

//             <table className="user-table">
//                 <thead>
//                     <tr>
//                         <th>Sr. No.</th>
//                         <th>Suite Name</th>
//                         <th>Suite Code</th>
//                         <th>Standard Follows</th>
//                         <th> Description</th>
//                     </tr>
//                 </thead>

//                 <tbody>
//                 { loading ?
//                     (
//                         <tr>
//                             <td
//                                 colSpan="5"
//                                 style={{
//                                     textAlign:"center",
//                                     padding:"20px"
//                                 }}
//                             >
//                                 Loading...
//                             </td>
//                         </tr>
//                     )
//                     :
//                     currentSuite.length === 0 ?
//                     (
//                         <tr>
//                             <td
//                                 colSpan="5"
//                                 style={{
//                                     textAlign:"center",
//                                     padding:"20px"
//                                 }}
//                             >
//                                 No Suites Found
//                             </td>
//                         </tr>
//                     ) : (
//                     currentSuite.map(
//                         (item,index)=>(
//                             <tr
//                                 key={
//                                     item.id ||
//                                     item.suite_id
//                                 }
//                             >
//                                 <td>{ startIndex + index + 1 } </td>
//                                 <td>{item.suite_name}</td>
//                                 <td>{item.suite_code}</td>
//                                 <td>{item.std_follows}</td>
//                                 <td>{truncate(item.suite_desc,50)}</td>
//                             </tr>
//                         )
//                     )
//                     )
//                 }
//                 </tbody>
//             </table>

//             <div className="pagination-footer">
//                 <div className="rows-section">
//                     <span>
//                         Rows per page:
//                     </span>
//                     <select
//                         value={
//                             rowsPerPage
//                         }
//                         onChange={(e)=>{
//                             setRowsPerPage(
//                                 Number(
//                                     e.target.value
//                                 )
//                             );
//                             setCurrentPage(1);
//                         }}
//                     >
//                         <option value={10}>10</option>
//                         <option value={15}>15</option>
//                         <option value={20}>20</option>
//                     </select>
//                 </div>

//                 <div className="page-info">
//                     {
//                         totalRows === 0
//                         ?
//                         "0-0 of 0"
//                         :
//                         `${startIndex + 1}-${Math.min(
//                             endIndex,
//                             totalRows
//                         )} of ${totalRows}`
//                     }
//                 </div>

//                 <div className="page-buttons">
//                     <button
//                         disabled={
//                             currentPage === 1
//                         }
//                         onClick={()=>setCurrentPage(
//                             currentPage - 1
//                         )}
//                     >
//                         &#8249;
//                     </button>

//                     <button
//                         disabled={
//                             currentPage === totalPages ||
//                             totalPages === 0
//                         }
//                         onClick={()=>setCurrentPage(
//                             currentPage + 1
//                         )}
//                     >
//                         &#8250;
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default Suites;


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UIDesign.css";

function Suites() {

    const navigate = useNavigate();

    const [suite, setSuite] = useState([]);
    const [loading, setLoading] = useState(true);

    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const totalRows = suite.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalRows);

    const currentSuite = suite.slice(startIndex, endIndex);

    const truncate = (str, n) => {
        return str?.length > n
            ? str.substring(0, n - 1) + "..."
            : str || "N/A";
    };

    useEffect(() => {
        fetch("http://127.0.0.1:8000/master/suites/")
            .then(async (res) => {
                if (!res.ok) {
                    const text = await res.text();
                    console.error("Server Error:", text);
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                console.log("Suites:", data);
                setSuite(data);
            })
            .catch((err) => {
                console.error("Suite Fetch Error:", err);
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
                {/* Header */}
                <div className="table-header">
                    <h2>
                        <i className="fas fa-layer-group"></i> Suites Management
                        <span className="count-badge">
                            ({suite.length} suites)
                        </span>
                    </h2>

                    <div className="header-actions">
                        <button
                            className="create-btn"
                            onClick={() => navigate("/master/suites/create/")}
                        >
                            <i className="fas fa-plus"></i> 
                            + Create Suite
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="table-wrapper">
                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>SR. NO.</th>
                                <th>SUITE NAME</th>
                                <th>SUITE CODE</th>
                                <th>STANDARD FOLLOWS</th>
                                <th>DESCRIPTION</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center">
                                        <i className="fas fa-spinner fa-spin"></i> Loading...
                                    </td>
                                </tr>
                            ) : currentSuite.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center">
                                        No Suites Found
                                    </td>
                                </tr>
                            ) : (
                                currentSuite.map((item, index) => (
                                    <tr key={item.id || item.suite_id}>
                                        <td>{startIndex + index + 1}</td>
                                        <td>
                                            <div className="suite-name-cell">
                                                <i className="fas fa-cubes" style={{ color: '#8b5cf6', marginRight: '8px' }}></i>
                                                {item.suite_name}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="suite-code-badge">
                                                {item.suite_code || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="standards-cell">
                                                {item.std_follows ? (
                                                    item.std_follows.split(',').map((std, idx) => (
                                                        <span key={idx} className="standard-tag">
                                                            {std.trim()}
                                                        </span>
                                                    ))
                                                ) : (
                                                    'N/A'
                                                )}
                                            </div>
                                        </td>
                                        <td>{truncate(item.suite_desc, 50)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && suite.length > 0 && (
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
                )}
            </div>
        </div>
    );
}

export default Suites;