// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Pencil, Trash2 } from "lucide-react";
// import { toast } from "react-toastify";
// import "./UIDesign.css";

// function UserView() {

//     const navigate = useNavigate();

//     const [users, setUsers] = useState([]);
//     const [selectRole, setSelectSuit] = useState("ALL");
//     const customers = users.filter(user => user.role === "CUSTOMER");

//     const [showEditModal, setShowEditModal] = useState(false);
//     const [showCustomerEditModal, setShowCustomerEditModal] = useState(false);

//     const [editUser, setEditUser] = useState({
//         user_id: null,
//         first_name: "",
//         last_name: "",
//         contact: "",
//         email: ""
//     });
//     const [editCustomer, setEditCustomer] = useState({
//         user_id: null,
//         organization: "",
//         email: "",
//         contact_person: "",
//         contact_person_email: "",
//         location: "",
//     });

//     const [rowsPerPage, setRowsPerPage] = useState(10);
//     const [currentPage, setCurrentPage] = useState(1);

//     // Get all non-customer users
//     const nonCustomers = users.filter(user => user.role !== "CUSTOMER");

//     // Group users by role
//     const groupUsersByRole = (userList) => {
//         const groups = {};
//         userList.forEach(user => {
//             const role = user.role || "UNKNOWN";
//             if (!groups[role]) {
//                 groups[role] = [];
//             }
//             groups[role].push(user);
//         });
//         return groups;
//     };

//     // Sort roles in a specific order
//     const getRoleOrder = () => {
//         return ["MASTER", "ADMIN", "SUPPORTADMIN", "TEST_MANAGER", "TESTER", "UNKNOWN"];
//     };

//     // Get role display name
//     const getRoleDisplayName = (role) => {
//         const names = {
//             MASTER: "Master",
//             ADMIN: "Admin",
//             SUPPORTADMIN: "Support Admin",
//             TEST_MANAGER: "Test Manager",
//             TESTER: "Tester",
//             CUSTOMER: "Customer",
//             UNKNOWN: "Unknown"
//         };
//         return names[role] || role;
//     };

//     // Get role icon
//     const getRoleIcon = (role) => {
//         const icons = {
//             MASTER: "fa-crown",
//             ADMIN: "fa-user-shield",
//             SUPPORTADMIN: "fa-headset",
//             TEST_MANAGER: "fa-user-tie",
//             TESTER: "fa-user-cog",
//             CUSTOMER: "fa-building",
//             UNKNOWN: "fa-user"
//         };
//         return icons[role] || "fa-user";
//     };

//     // Filter users based on selected role
//     const filteredUsers = selectRole === "ALL" 
//         ? nonCustomers 
//         : nonCustomers.filter(user => user.role === selectRole);

//     // Group filtered users by role
//     const groupedUsers = groupUsersByRole(filteredUsers);
//     const roleOrder = getRoleOrder();

//     // Pagination for filtered users (for the footer)
//     const totalRows = filteredUsers.length;
//     const totalPages = Math.ceil(totalRows / rowsPerPage);
//     const startIndex = (currentPage - 1) * rowsPerPage;
//     const endIndex = startIndex + rowsPerPage;

//     // Get paginated users for the footer display
//     const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

//     // Get avatar class based on role
//     const getAvatarClass = (role) => {
//         const roleMap = {
//             ADMIN: 'admin',
//             TEST_MANAGER: 'test-manager',
//             TESTER: 'tester',
//             MASTER: 'master',
//             SUPPORTADMIN: 'support-admin',
//             CUSTOMER: 'customer'
//         };
//         return roleMap[role] || 'default';
//     };

//     // Get role badge class
//     const getRoleBadgeClass = (role) => {
//         return role?.toLowerCase().replace(/_/g, '-') || 'default';
//     };

//     // Get initials
//     const getInitials = (firstName, lastName) => {
//         return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
//     };

//     useEffect(() => {
//         fetch("http://127.0.0.1:8000/user/")
//             .then(res => res.json())
//             .then(data => {
//                 setUsers(data);
//             })
//             .catch(err => console.log(err));
//     }, []);

//     const handleEditChange = (e) => {
//         setEditUser({
//             ...editUser,
//             [e.target.name]: e.target.value
//         });
//     };

//     const handleCustomerEditChange = (e) => {
//         setEditCustomer({
//             ...editCustomer,
//             [e.target.name]: e.target.value,
//         });
//     };

//     const updateUser = async () => {
//         const response = await fetch(
//             `http://127.0.0.1:8000/user/update/${editUser.user_id}/`,
//             {
//                 method: "PUT",
//                 headers: {
//                     "Content-Type": "application/json"
//                 },
//                 body: JSON.stringify(editUser)
//             }
//         );

//         if (response.ok) {
//             toast.success("User updated successfully");
//             setShowEditModal(false);

//             const res = await fetch("http://127.0.0.1:8000/user/");
//             const data = await res.json();
//             setUsers(data);
//         } else {
//             toast.error("Update Failed");
//         }
//     };

//     const updateCustomer = async () => {
//         const response = await fetch(
//             `http://127.0.0.1:8000/user/update/${editCustomer.user_id}/`,
//             {
//                 method: "PUT",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify(editCustomer),
//             }
//         );

//         if (response.ok) {
//             toast.success("Customer updated successfully");
//             setShowCustomerEditModal(false);

//             const res = await fetch("http://127.0.0.1:8000/user/");
//             const data = await res.json();
//             setUsers(data);
//         } else {
//             toast.error("Update Failed");
//         }
//     };

//     const deleteUser = async (id) => {
//         const confirmDelete = window.confirm("Are you sure you want to delete this user ?");

//         if (!confirmDelete) return;

//         const response = await fetch(
//             `http://127.0.0.1:8000/user/delete/${id}/`,
//             {
//                 method: "DELETE",
//             }
//         );

//         if (response.ok) {
//             toast.success("User deleted successfully");

//             const res = await fetch("http://127.0.0.1:8000/user/");
//             const data = await res.json();
//             setUsers(data);
//         } else {
//             toast.error("Delete Failed");
//         }
//     };

//     // Render user card
//     const renderUserCard = (user) => (
//         <div className="user-card" key={user.user_id}>
//             <div className="card-header">
//                 <div className={`avatar ${getAvatarClass(user.role)}`}>
//                     {getInitials(user.first_name, user.last_name)}
//                 </div>
//                 <div className="user-info">
//                     <div className="name">
//                         {user.first_name} {user.last_name}
//                     </div>
//                     <div>
//                         <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
//                             {getRoleDisplayName(user.role)}
//                         </span>
//                         {user.organization && (
//                             <span className="org-badge" style={{ marginLeft: '6px' }}>
//                                 <i className="fas fa-building"></i> {user.organization}
//                             </span>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             <div className="card-body">
//                 <div className="detail-row">
//                     <i className="fas fa-envelope"></i>
//                     <span className="label">Email:</span>
//                     <span className="value">{user.email || 'N/A'}</span>
//                 </div>
//                 <div className="detail-row">
//                     <i className="fas fa-phone"></i>
//                     <span className="label">Phone:</span>
//                     <span className="value">{user.contact || 'N/A'}</span>
//                 </div>
//             </div>

//             <div className="card-footer">
//                 <span className={`status status-${user.account_status?.toLowerCase() || 'active'}`}>
//                     ● {user.account_status || 'ACTIVE'}
//                 </span>
//                 <div className="actions">
//                     <button 
//                         className="edit-btn"
//                         onClick={() => {
//                             setEditUser({
//                                 user_id: user.user_id,
//                                 first_name: user.first_name || "",
//                                 last_name: user.last_name || "",
//                                 contact: user.contact || "",
//                                 email: user.email || ""
//                             });
//                             setShowEditModal(true);
//                         }}
//                     >
//                         <Pencil size={15} />
//                     </button>

//                     <button 
//                         className="delete-btn"
//                         onClick={() => deleteUser(user.user_id)}
//                     >
//                         <Trash2 size={15} />
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );

//     // Render a role section
//     const renderRoleSection = (role, usersInRole) => {
//         if (!usersInRole || usersInRole.length === 0) return null;

//         return (
//             <div className="role-section" key={role}>
//                 <div className="role-section-header">
//                     <div className={`role-icon ${getAvatarClass(role)}`}>
//                         <i className={`fas ${getRoleIcon(role)}`}></i>
//                     </div>
//                     <span className="role-title">{getRoleDisplayName(role)}</span>
//                     <span className="role-count">{usersInRole.length} user{usersInRole.length > 1 ? 's' : ''}</span>
//                 </div>

//                 <div className="user-grid">
//                     {usersInRole.map(user => renderUserCard(user))}
//                 </div>
//             </div>
//         );
//     };

//     return (
//         <div className="view-container">
//             {/* Header */}
//             <div className="table-header">
//                 <h2>
//                     <i className="fas fa-users"></i> User Management
//                 </h2>

//                 <div className="header-actions">
//                     <div className="select-role">
//                         <label className="role-label">Filter by Role</label>
//                         <select
//                             value={selectRole}
//                             onChange={(e) => setSelectSuit(e.target.value)}
//                         >
//                             <option value="ALL">All Roles</option>
//                             <option value="MASTER">Master</option>
//                             <option value="ADMIN">Admin</option>
//                             <option value="SUPPORTADMIN">Support Admin</option>
//                             <option value="TEST_MANAGER">Test Manager</option>
//                             <option value="TESTER">Tester</option>
//                         </select>
//                     </div>

//                     <button
//                         className="create-btn"
//                         onClick={() => navigate("/user/create")}
//                     >
//                         + Create User
//                     </button>
//                 </div>
//             </div>

//             {/* Role Grouped Users */}
//             {filteredUsers.length === 0 ? (
//                 <div className="empty-state">
//                     <div className="empty-icon">
//                         <i className="fas fa-users-slash"></i>
//                     </div>
//                     <h3>No Users Found</h3>
//                     <p>Create a new user to get started</p>
//                 </div>
//             ) : (
//                 // Render each role section in order
//                 roleOrder.map(role => {
//                     const usersInRole = groupedUsers[role] || [];
//                     return renderRoleSection(role, usersInRole);
//                 })
//             )}

//             {/* Customers Section */}
//             {customers.length > 0 && (
//                 <>
//                     <div className="role-section" style={{ marginTop: '40px' }}>
//                         <div className="role-section-header">
//                             <div className="role-icon customer">
//                                 <i className="fas fa-building"></i>
//                             </div>
//                             <span className="role-title">Customers</span>
//                             <span className="role-count">{customers.length} customer{customers.length > 1 ? 's' : ''}</span>
//                         </div>

//                         <div className="customer-grid">
//                             {customers.map((customer) => (
//                                 <div className="customer-card" key={customer.user_id}>
//                                     <div className="card-header">
//                                         <div className="org-name">
//                                             <i className="fas fa-building" style={{ color: '#22c55e', marginRight: '8px' }}></i>
//                                             {customer.organization}
//                                         </div>
//                                         <div className="org-icon">
//                                             <i className="fas fa-store"></i>
//                                         </div>
//                                     </div>

//                                     <div className="card-body">
//                                         <div className="detail-row">
//                                             <i className="fas fa-map-marker-alt"></i>
//                                             <span className="label">Location:</span>
//                                             <span className="value">{customer.location || 'N/A'}</span>
//                                         </div>
//                                         <div className="detail-row">
//                                             <i className="fas fa-envelope"></i>
//                                             <span className="label">Email:</span>
//                                             <span className="value">{customer.email || 'N/A'}</span>
//                                         </div>
//                                         <div className="detail-row">
//                                             <i className="fas fa-user"></i>
//                                             <span className="label">Contact Person:</span>
//                                             <span className="value">{customer.contact_person || 'N/A'}</span>
//                                         </div>
//                                         <div className="detail-row">
//                                             <i className="fas fa-envelope"></i>
//                                             <span className="label">Contact Email:</span>
//                                             <span className="value">{customer.contact_person_email || 'N/A'}</span>
//                                         </div>
//                                     </div>

//                                     <div className="card-footer">
//                                         <span className={`status status-${customer.account_status?.toLowerCase() || 'active'}`}>
//                                             ● {customer.account_status || 'ACTIVE'}
//                                         </span>
//                                         <div className="actions">
//                                             <button 
//                                                 className="edit-btn"
//                                                 onClick={() => {
//                                                     setEditCustomer({
//                                                         user_id: customer.user_id,
//                                                         organization: customer.organization || "",
//                                                         email: customer.email || "",
//                                                         location: customer.location || "",
//                                                         contact_person: customer.contact_person || "",
//                                                         contact_person_email: customer.contact_person_email || ""
//                                                     });
//                                                     setShowCustomerEditModal(true);
//                                                 }}
//                                             >
//                                                 <Pencil size={15} />
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </>
//             )}

//             {/* Pagination */}
//             <div className="pagination-footer">
//                 <div className="rows-section">
//                     <span>Rows per page:</span>
//                     <select
//                         value={rowsPerPage}
//                         onChange={(e) => {
//                             setRowsPerPage(Number(e.target.value));
//                             setCurrentPage(1);
//                         }}
//                     >
//                         <option value={10}>10</option>
//                         <option value={15}>15</option>
//                         <option value={20}>20</option>
//                     </select>
//                 </div>

//                 <div className="page-info">
//                     {startIndex + 1}-{Math.min(endIndex, totalRows)} of {totalRows}
//                 </div>

//                 <div className="page-buttons">
//                     <button
//                         disabled={currentPage === 1}
//                         onClick={() => setCurrentPage(currentPage - 1)}
//                     >
//                         &#8249;
//                     </button>

//                     <button
//                         disabled={currentPage === totalPages}
//                         onClick={() => setCurrentPage(currentPage + 1)}
//                     >
//                         &#8250;
//                     </button>
//                 </div>
//             </div>

//             {/* Edit User Modal */}
//             {showEditModal && (
//                 <div className="modal-overlay">
//                     <div className="edit-modal">
//                         <h2><i className="fas fa-user-edit"></i> Edit User</h2>

//                         <div className="form-row">
//                             <div className="form-group">
//                                 <label>First Name</label>
//                                 <input
//                                     name="first_name"
//                                     value={editUser.first_name || ""}
//                                     onChange={handleEditChange}
//                                 />
//                             </div>

//                             <div className="form-group">
//                                 <label>Last Name</label>
//                                 <input
//                                     name="last_name"
//                                     value={editUser.last_name || ""}
//                                     onChange={handleEditChange}
//                                 />
//                             </div>
//                         </div>

//                         <div className="form-row">
//                             <div className="form-group">
//                                 <label>Contact</label>
//                                 <input
//                                     name="contact"
//                                     value={editUser.contact || ""}
//                                     onChange={handleEditChange}
//                                     minLength='10' maxLength='10'
//                                 />
//                             </div>
//                             <div className="form-group">
//                                 <label>Email</label>
//                                 <input
//                                     name="email"
//                                     value={editUser.email || ""}
//                                     onChange={handleEditChange}
//                                 />
//                             </div>
//                         </div>

//                         <div className="button-group">
//                             <button className="cancel-btn" onClick={() => setShowEditModal(false)}>
//                                 Cancel
//                             </button>

//                             <button className="submit-btn" onClick={updateUser}>
//                                 Update
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Edit Customer Modal */}
//             {showCustomerEditModal && (
//                 <div className="modal-overlay">
//                     <div className="edit-modal">
//                         <h2><i className="fas fa-building"></i> Edit Customer Details</h2>

//                         <div className="form-row">
//                             <div className="form-group">
//                                 <label>Organization Name</label>
//                                 <input
//                                     name="organization"
//                                     value={editCustomer.organization || ""}
//                                     onChange={handleCustomerEditChange}
//                                     readOnly
//                                 />
//                             </div>

//                             <div className="form-group">
//                                 <label>Organization Email</label>
//                                 <input
//                                     name="email"
//                                     value={editCustomer.email || ""}
//                                     onChange={handleCustomerEditChange}
//                                 />
//                             </div>
//                         </div>

//                         <div className="form-row">
//                             <div className="form-group">
//                                 <label>Location</label>
//                                 <input
//                                     name="location"
//                                     value={editCustomer.location || ""}
//                                     onChange={handleCustomerEditChange}
//                                 />
//                             </div>

//                             <div className="form-group">
//                                 <label>Contact Person</label>
//                                 <input
//                                     name="contact_person"
//                                     value={editCustomer.contact_person || ""}
//                                     onChange={handleCustomerEditChange}
//                                 />
//                             </div>
//                         </div>

//                         <div className="form-row">
//                             <div className="form-group">
//                                 <label>Contact Person Email</label>
//                                 <input
//                                     name="contact_person_email"
//                                     value={editCustomer.contact_person_email || ""}
//                                     onChange={handleCustomerEditChange}
//                                 />
//                             </div>
//                         </div>

//                         <div className="button-group">
//                             <button className="cancel-btn" onClick={() => setShowCustomerEditModal(false)}>
//                                 Cancel
//                             </button>

//                             <button className="submit-btn" onClick={updateCustomer}>
//                                 Update
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

// export default UserView;


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import "./UserView.css";

function UserView() {
    const navigate = useNavigate();

    // Role configurations
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
        }
        const response = await userAPI.getAll();
        if (response.ok) {
            const data = await response.json();
            setUsers(data);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const updateUser = async () => {
        const response = await fetch(`http://127.0.0.1:8000/user/update/${editUser.user_id}/`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editUser)
        });

        if (response.ok) {
            toast.success("User updated successfully");
            setShowEditModal(false);
            fetchUsers();
        } else {
            toast.error("Update Failed");
        }
    };

    const updateCustomer = async () => {
        const response = await fetch(`http://127.0.0.1:8000/user/update/${editCustomer.user_id}/`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editCustomer)
        });

        if (response.ok) {
            toast.success("Customer updated successfully");
            setShowCustomerEditModal(false);
            fetchUsers();
        } else {
            toast.error("Update Failed");
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        const response = await fetch(`http://127.0.0.1:8000/user/delete/${id}/`, {
            method: "DELETE"
        });

        if (response.ok) {
            toast.success("User deleted successfully");
            fetchUsers();
        } else {
            toast.error("Delete Failed");
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
                        {/* <span className="value">{user.email || 'N/A'}</span> */}
                    </div>
                    <div className="detail-row">
                        <i className="fas fa-phone"></i>
                        <span className="label">Phone : {user.contact || 'N/A'}</span>
                        {/* <span className="value">{user.contact || 'N/A'}</span> */}
                    </div>
                    {user.organization && (
                        <div className="detail-row">
                            <i className="fas fa-building"></i>
                            <span className="label">Organization : {user.organization}</span>
                            {/* <span className="value">{user.organization}</span> */}
                        </div>
                    )}
                </div>

                <div className="card-footer">
                    <span className={`status ${status.class}`}>
                        {status.icon} {status.label}
                    </span>
                    <div className="actions">
                        <button className="edit-btn" onClick={() => {
                            setEditUser({
                                user_id: user.user_id,
                                first_name: user.first_name || "",
                                last_name: user.last_name || "",
                                contact: user.contact || "",
                                email: user.email || ""
                            });
                            setShowEditModal(true);
                        }}>
                            <Pencil size={15} />
                        </button>
                        <button className="delete-btn" onClick={() => 
                            deleteUser(user.user_id)}
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
                        {/* <span className="value">{customer.location || 'N/A'}</span> */}
                    </div>
                    <div className="detail-row">
                        <i className="fas fa-envelope"></i>
                        <span className="label">Email : {customer.email || 'N/A'}</span>
                        {/* <span className="value">{customer.email || 'N/A'}</span> */}
                    </div>
                    <div className="detail-row">
                        <i className="fas fa-user"></i>
                        <span className="label">Contact Person : {customer.contact_person || 'N/A'}</span>
                        {/* <span className="value">{customer.contact_person || 'N/A'}</span> */}
                    </div>
                    <div className="detail-row">
                        <i className="fas fa-envelope"></i>
                        <span className="label">Contact Email : {customer.contact_person_email || 'N/A'}</span>
                        {/* <span className="value">{customer.contact_person_email || 'N/A'}</span> */}
                    </div>
                </div>

                <div className="card-footer">
                    <span className={`status ${status.class}`}>
                        {status.icon} {status.label}
                    </span>
                    <div className="actions">
                        <button className="edit-btn" onClick={() => {
                            setEditCustomer({
                                user_id: customer.user_id,
                                organization: customer.organization || "",
                                email: customer.email || "",
                                location: customer.location || "",
                                contact_person: customer.contact_person || "",
                                contact_person_email: customer.contact_person_email || ""
                            });
                            setShowCustomerEditModal(true);
                        }}>
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

                {/* Customers Section */}
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
                            <option value={5}>5</option>
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

            {/* Edit User Modal */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="edit-modal">
                        <h2><i className="fas fa-user-edit"></i> Edit User</h2>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>First Name</label>
                                <input name="first_name" value={editUser.first_name} onChange={(e) => setEditUser({...editUser, first_name: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input name="last_name" value={editUser.last_name} onChange={(e) => setEditUser({...editUser, last_name: e.target.value})} />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Contact</label>
                                <input name="contact" value={editUser.contact} onChange={(e) => setEditUser({...editUser, contact: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input name="email" value={editUser.email} onChange={(e) => setEditUser({...editUser, email: e.target.value})} />
                            </div>
                        </div>

                        <div className="button-group">
                            <button className="cancel-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
                            <button className="submit-btn" onClick={updateUser}>Update</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Customer Modal */}
            {showCustomerEditModal && (
                <div className="modal-overlay">
                    <div className="edit-modal">
                        <h2><i className="fas fa-building"></i> Edit Customer</h2>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Organization</label>
                                <input name="organization" value={editCustomer.organization} readOnly />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input name="email" value={editCustomer.email} onChange={(e) => setEditCustomer({...editCustomer, email: e.target.value})} />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Location</label>
                                <input name="location" value={editCustomer.location} onChange={(e) => setEditCustomer({...editCustomer, location: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Contact Person</label>
                                <input name="contact_person" value={editCustomer.contact_person} onChange={(e) => setEditCustomer({...editCustomer, contact_person: e.target.value})} />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Contact Person Email</label>
                                <input name="contact_person_email" value={editCustomer.contact_person_email} onChange={(e) => setEditCustomer({...editCustomer, contact_person_email: e.target.value})} />
                            </div>
                        </div>

                        <div className="button-group">
                            <button className="cancel-btn" onClick={() => setShowCustomerEditModal(false)}>Cancel</button>
                            <button className="submit-btn" onClick={updateCustomer}>Update</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserView;