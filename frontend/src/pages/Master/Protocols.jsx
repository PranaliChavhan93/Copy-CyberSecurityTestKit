import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./UIDesign.css";

function Protocols() {

    const navigate = useNavigate();

    const [protocols, setProtocols] = useState([]);
    const [loading, setLoading] = useState(true);

    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const totalRows = protocols.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalRows);

    const currentProtocols = protocols.slice(startIndex, endIndex);

    const truncate = (str, n) => {
        return str?.length > n
            ? str.substring(0, n - 1) + "..."
            : str || "N/A";
    };

    useEffect(() => {
        fetch("http://127.0.0.1:8000/master/protocols/")
            .then(async (res) => {
                if (!res.ok) {
                    const text = await res.text();
                    console.error("Server Error:", text);
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                console.log("Protocols:", data);
                setProtocols(data);
            })
            .catch(err => {
                console.error("Protocols Fetch Error:", err);
                toast.error("Failed to load protocols");
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
                        Protocol Management 
                        <span className="count-badge">
                            ({protocols.length} protocols)
                        </span>
                    </h2>

                    <div className="header-actions">
                        <button
                            className="create-btn"
                            onClick={() => navigate("/master/protocols/create/")}
                        >
                            + Add Protocol
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="table-wrapper">
                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>SR. NO.</th>
                                <th>PROTOCOL NAME</th>
                                <th>CATEGORY</th>
                                <th>TYPE</th>
                                <th>OSI LAYER</th>
                                <th>COMMUNICATION MODEL</th>
                                <th>DESCRIPTION</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center">
                                        Loading...
                                    </td>
                                </tr>
                            ) : currentProtocols.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center">
                                        No Protocols Found
                                    </td>
                                </tr>
                            ) : (
                                currentProtocols.map((protocol, index) => (
                                    <tr key={protocol.protocol_id}>
                                        <td>{startIndex + index + 1}</td>
                                        <td>{protocol.protocol_name}</td>
                                        <td>{protocol.protocol_category || 'N/A'}</td>
                                        <td>{protocol.protocol_type || 'N/A'}</td>
                                        <td>{protocol.osi_layer || 'N/A'}</td>
                                        <td>{protocol.communication_model || 'N/A'}</td>
                                        <td>{truncate(protocol.protocol_desc, 50)}</td>
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

export default Protocols;