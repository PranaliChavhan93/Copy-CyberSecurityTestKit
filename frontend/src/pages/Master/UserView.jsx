import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import "./UserView.css";

function UserView() {
    const navigate = useNavigate();

    const roleConfig = {
        MASTER: { icon: "👤",label: "Master", color: "#dc2626" },
        ADMIN: { icon: "👤", label: "Admin", color: "#4a6cf7" },
        SUPPORTADMIN: { icon: "👤", label: "Support Admin", color: "#d97706" },
        TEST_MANAGER: { icon: "👤", label: "Test Manager", color: "#7c3aed" },
        TESTER: { icon: "👤", label: "Tester", color: "#0891b2" },
        CUSTOMER: { icon: "👥", label: "Customer", color: "#22c55e" },
    };

    const statusConfig = {
        ACTIVE: { label: "Active", class: "status-active" },
        INACTIVE: { label: "Inactive", class: "status-inactive" },
        SUSPENDED: { label: "Suspended", class: "status-suspended" },
        PENDING: { label: "Pending", class: "status-pending" }
    };

    const [users, setUsers] = useState([]);
    const [selectRole, setSelectRole] = useState("ALL");
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCustomerEditModal, setShowCustomerEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteUserId, setDeleteUserId] = useState(null);
    const [deleteUserName, setDeleteUserName] = useState("");
    const [loading, setLoading] = useState(false);
    const [editUser, setEditUser] = useState({ 
        user_id: null, 
        first_name: "", 
        last_name: "", 
        contact: "", 
        email: "" 
    });
    const [editCustomer, setEditCustomer] = useState({ 
        user_id: null, 
        organization: "", 
        email: "", 
        location: "", 
        contact_person: "", 
        contact_person_email: "" 
    });
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const nonCustomers = users.filter(
        user => user.role !== "CUSTOMER"
    );
    const customers = users.filter(
        user => user.role === "CUSTOMER"
    );
    
    const filteredUsers = selectRole === "ALL" 
        ? nonCustomers 
        : nonCustomers.filter(user => user.role === selectRole);

    const totalRows = filteredUsers.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
    const currentUsers = filteredUsers.slice(startIndex, endIndex);

    const fetchUsers = async () => {
        try {
            const res = await fetch("http://127.0.0.1:8000/user/view/");
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            console.log(err);
            toast.error("Failed to fetch users");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const updateUser = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("access");
            
            if (!token) {
                toast.error("No authentication token found. Please login again.");
                setLoading(false);
                return;
            }

            const response = await fetch(
                `http://127.0.0.1:8000/user/update/${editUser.user_id}/`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(editUser)
                }
            );

            if (response.status === 401) {
                toast.error("Authentication failed. Please login again to continue.");
                setLoading(false);
                return;
            }

            if (response.ok) {
                toast.success("User updated successfully");
                setShowEditModal(false);
                await fetchUsers();
            } else {
                const error = await response.json().catch(() => ({}));
                console.log("Update error:", error);
                toast.error(error.detail || error.message || "Update Failed");
            }
        } catch (err) {
            console.error("Error in updateUser:", err);
            toast.error("Update Failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const updateCustomer = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("access");
            
            if (!token) {
                toast.error("No authentication token found. Please login again.");
                setLoading(false);
                return;
            }

            const response = await fetch(
                `http://127.0.0.1:8000/user/update/${editCustomer.user_id}/`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(editCustomer)
                }
            );

            if (response.status === 401) {
                toast.error("Authentication failed. Please login again to continue.");
                setLoading(false);
                return;
            }

            if (response.ok) {
                toast.success("Customer updated successfully");
                setShowCustomerEditModal(false);
                await fetchUsers();
            } else {
                const error = await response.json().catch(() => ({}));
                console.log("Update customer error:", error);
                toast.error(error.detail || error.message || "Update Failed");
            }
        } catch (err) {
            console.error("Error in updateCustomer:", err);
            toast.error("Update Failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (user) => {
        setDeleteUserId(user.user_id);
        setDeleteUserName(`${user.first_name} ${user.last_name}`);
        setShowDeleteModal(true);
    };

    const deleteUser = async () => {
        if (!deleteUserId) return;

        try {
            setLoading(true);
            const token = localStorage.getItem("access");
            
            if (!token) {
                toast.error("No authentication token found. Please login again.");
                setLoading(false);
                setShowDeleteModal(false);
                return;
            }

            const response = await fetch(`http://127.0.0.1:8000/user/delete/${deleteUserId}/`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
        } catch (err) {
            console.error("Error in deleteUser:", err);
            toast.error("Delete Failed");
        } finally {
            setLoading(false);
        }
    };

    const UserCard = ({ user }) => {
        const role = roleConfig[user.role] || roleConfig.UNKNOWN;
        const status = statusConfig[user.account_status] || statusConfig.ACTIVE;

        return (
            <div className="user-card">
                <div className="card-header">
                    <div className="user-icon">
                        {role.icon}
                    </div>
                    <div className="user-info">
                        <div className="name">{user.first_name} {user.last_name}</div>
                        <div className="role-tag" style={{ color: role.color }}>
                            {role.label}
                        </div>
                    </div>
                </div>

                <div className="card-body">
                    <div className="detail-row">
                        <i className="fas fa-envelope"></i>
                        <span className="label">Email : {user.email || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                        <i className="fas fa-phone"></i>
                        <span className="label">Phone : {user.contact || 'N/A'}</span>
                    </div>
                    {user.organization && (
                        <div className="detail-row">
                            <i className="fas fa-building"></i>
                            <span className="label">Organization : {user.organization}</span>
                        </div>
                    )}
                </div>

                <div className="card-footer">
                    <span className={`status ${status.class}`}>
                        {status.icon} {status.label}
                    </span>
                    <div className="actions">
                        <button 
                            className="edit-btn" 
                            onClick={() => {
                                setEditUser({
                                    user_id: user.user_id,
                                    first_name: user.first_name || "",
                                    last_name: user.last_name || "",
                                    contact: user.contact || "",
                                    email: user.email || ""
                                });
                                setShowEditModal(true);
                            }}
                            disabled={loading}
                        >
                            <Pencil size={15} />
                        </button>
                        <button 
                            className="delete-btn" 
                            onClick={() => confirmDelete(user)}
                            disabled={loading}
                        >
                            <Trash2 size={15} />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const CustomerCard = ({ customer }) => {
        const status = statusConfig[customer.account_status] || statusConfig.ACTIVE;

        return (
            <div className="customer-card">
                <div className="card-header">
                    <div className="org-name">🏢 {customer.organization}</div>
                    <div className="org-icon"><i className="fas fa-store"></i></div>
                </div>

                <div className="card-body">
                    <div className="detail-row">
                        <i className="fas fa-map-marker-alt"></i>
                        <span className="label">Location : {customer.location || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                        <i className="fas fa-envelope"></i>
                        <span className="label">Email : {customer.email || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                        <i className="fas fa-user"></i>
                        <span className="label">Contact Person : {customer.contact_person || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                        <i className="fas fa-envelope"></i>
                        <span className="label">Contact Email : {customer.contact_person_email || 'N/A'}</span>
                    </div>
                </div>

                <div className="card-footer">
                    <span className={`status ${status.class}`}>
                        {status.icon} {status.label}
                    </span>
                    <div className="actions">
                        <button 
                            className="edit-btn" 
                            onClick={() => {
                                setEditCustomer({
                                    user_id: customer.user_id,
                                    organization: customer.organization || "",
                                    email: customer.email || "",
                                    location: customer.location || "",
                                    contact_person: customer.contact_person || "",
                                    contact_person_email: customer.contact_person_email || ""
                                });
                                setShowCustomerEditModal(true);
                            }}
                            disabled={loading}
                        >
                            <Pencil size={15} />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="view-container">
            <div className="table-card">
                {/* Header */}
                <div className="table-header">
                    <h2>
                        <i className="fas fa-users"></i> User Management
                        <span className="count-badge">({filteredUsers.length} users)</span>
                    </h2>

                    <div className="header-actions">
                        <div className="select-role">
                            <label className="role-label">Filter by Role</label>
                            <select value={selectRole} onChange={(e) => setSelectRole(e.target.value)}>
                                <option value="ALL">All Roles</option>
                                {Object.entries(roleConfig).map(([key, val]) => (
                                    key !== 'CUSTOMER' && key !== 'UNKNOWN' && (
                                        <option key={key} value={key}>{val.icon} {val.label}</option>
                                    )
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* User Grid */}
                <div className="user-grid">
                    
                    {currentUsers.length === 0 ? (
                        
                        <div className="empty-state">
                            <div className="empty-icon"><i className="fas fa-users-slash"></i></div>
                            <h3>No Users Found</h3>
                            <p>Click "Create User" to get started</p>
                        </div>
                    ) : (
                        currentUsers.map(user => <UserCard key={user.user_id} user={user} />)
                    )}

                    {/* Create New Card */}
                    <div className="create-card" onClick={() => navigate("/user/create")}>
                        <div className="plus-icon"><i className="fas fa-user-plus"></i></div>
                        <div className="create-text">Create New User</div>
                        <div className="create-sub">Click to add</div>
                    </div>
                </div>

                {customers.length > 0 && (
                    <div className="customer-section">
                        <div className="customer-section-header">
                            <span className="customer-title">🏢 Customers</span>
                            <span className="customer-count">{customers.length} customer{customers.length > 1 ? 's' : ''}</span>
                        </div>

                        <div className="customer-grid">
                            {customers.map(customer => <CustomerCard key={customer.user_id} customer={customer} />)}
                        </div>
                    </div>
                )}

                {/* Pagination */}
                <div className="pagination-footer">
                    <div className="rows-section">
                        <span>Rows per page:</span>
                        <select value={rowsPerPage} onChange={(e) => {
                            setRowsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}>
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                        </select>
                    </div>

                    <div className="page-info">
                        {startIndex + 1}-{endIndex} of {totalRows}
                    </div>

                    <div className="page-buttons">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                            &#8249;
                        </button>
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                            &#8250;
                        </button>
                    </div>
                </div>
            </div>

            {showEditModal && (
                <div className="modal-overlay">
                    <div className="edit-modal">
                        <h2><i className="fas fa-user-edit"></i> Edit User</h2>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>First Name</label>
                                <input 
                                    name="first_name" 
                                    value={editUser.first_name} 
                                    onChange={(e) => setEditUser({...editUser, first_name: e.target.value})}
                                    disabled={loading}
                                />
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input 
                                    name="last_name" 
                                    value={editUser.last_name} 
                                    onChange={(e) => setEditUser({...editUser, last_name: e.target.value})}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Contact</label>
                                <input 
                                    name="contact" 
                                    value={editUser.contact} 
                                    onChange={(e) => setEditUser({...editUser, contact: e.target.value})}
                                    disabled={loading}
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input 
                                    name="email" 
                                    value={editUser.email} 
                                    onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="button-group">
                            <button 
                                className="cancel-btn" 
                                onClick={() => setShowEditModal(false)}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button 
                                className="submit-btn" 
                                onClick={updateUser}
                                disabled={loading}
                            >
                                {loading ? "Updating..." : "Update"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showCustomerEditModal && (
                <div className="modal-overlay">
                    <div className="edit-modal">
                        <h2><i className="fas fa-building"></i> Edit Customer</h2>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Organization</label>
                                <input 
                                    name="organization" 
                                    value={editCustomer.organization} 
                                    readOnly 
                                    disabled={loading}
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input 
                                    name="email" 
                                    value={editCustomer.email} 
                                    onChange={(e) => setEditCustomer({...editCustomer, email: e.target.value})}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Location</label>
                                <input 
                                    name="location" 
                                    value={editCustomer.location} 
                                    onChange={(e) => setEditCustomer({...editCustomer, location: e.target.value})}
                                    disabled={loading}
                                />
                            </div>
                            <div className="form-group">
                                <label>Contact Person</label>
                                <input 
                                    name="contact_person" 
                                    value={editCustomer.contact_person} 
                                    onChange={(e) => setEditCustomer({...editCustomer, contact_person: e.target.value})}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Contact Person Email</label>
                                <input 
                                    name="contact_person_email" 
                                    value={editCustomer.contact_person_email} 
                                    onChange={(e) => setEditCustomer({...editCustomer, contact_person_email: e.target.value})}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="button-group">
                            <button 
                                className="cancel-btn" 
                                onClick={() => setShowCustomerEditModal(false)}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button 
                                className="submit-btn" 
                                onClick={updateCustomer}
                                disabled={loading}
                            >
                                {loading ? "Updating..." : "Update"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="delete-modal-header">
                            <h2>
                                <i className="fas fa-exclamation-triangle" style={{ color: "#dc2626" }}></i>
                                Confirm Delete
                            </h2>
                        </div>
                        
                        <div className="delete-modal-body">
                            <p>Are you sure you want to delete this user ?</p>
                        </div>

                        <div className="delete-modal-footer">
                            <button 
                                className="cancel-btn" 
                                onClick={() => setShowDeleteModal(false)}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button 
                                className="delete-btn-confirm" 
                                onClick={deleteUser}
                                disabled={loading}
                            >
                                {loading ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserView;