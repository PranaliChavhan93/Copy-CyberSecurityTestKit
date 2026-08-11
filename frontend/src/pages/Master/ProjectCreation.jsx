// // import { useEffect, useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { toast } from "react-toastify";
// // import "./UIDesign.css";

// // function ProjectCreation() {

// //     const navigate = useNavigate();

// //     const [customers, setCustomers] = useState([]);
// //     const [managers, setManagers] = useState([]);

// //     const [form, setForm] = useState({
// //         project_name: "",
// //         project_type: "",
// //         customer: "",
// //         manager: "",
// //         project_desc: "",
// //         priority: "MEDIUM",
// //         status: "CREATED",
// //         start_date: "",
// //         deadline: "",
// //         progress: 0,
// //     });

// //     const [errors, setErrors] = useState({});

// //     useEffect(() => {
// //         fetch("http://127.0.0.1:8000/customers/")
// //             .then(res => res.json())
// //             .then(data => 
// //                 // console.log("Customer API"),
// //                 setCustomers(data))
// //             .catch(err => console.log(err));

// //         fetch("http://127.0.0.1:8000/testmanagers/")
// //             .then(res => res.json())
// //             .then(data => setManagers(data))
// //             .catch(err => console.log(err));
// //     }, []);

// //     const validateField = (name, value, formData) => {
// //         switch (name) {
// //             case "project_name":
// //                 if (!value.trim()) {
// //                     return "*Please Enter Project Name";
// //                 }
// //                 if (!/^[A-Za-z0-9 ]+$/.test(value.trim())) {
// //                     return "*Only letters and numbers are allowed";
// //                 }
// //                 return "";

// //             case "project_type":
// //                 return value ? "" : "*Please Select Project Type";

// //             case "customer":
// //                 return value ? "" : "*Please Select Customer";

// //             case "manager":
// //                 return value ? "" : "*Please Select Test Manager";

// //             case "priority":
// //                 return value ? "" : "*Please Select Priority";

// //             case "status":
// //                 return value ? "" : "*Please Select Status";

// //             case "start_date":
// //                 if (!value) {
// //                     return "*Please Select Start Date";
// //                 }
// //                 if (
// //                     formData.deadline &&
// //                     new Date(value) > new Date(formData.deadline)
// //                 ) {
// //                     return "*Start Date must be before Deadline";
// //                 }
// //                 return "";

// //             case "deadline":
// //                 if (!value) {
// //                     return "*Please Select Deadline";
// //                 }
// //                 if (
// //                     formData.start_date &&
// //                     new Date(value) < new Date(formData.start_date)
// //                 ) {
// //                     return "*Deadline must be after Start Date";
// //                 }
// //                 return "";

// //             case "project_desc":
// //                 return value.trim() ? "" : "*Please Enter Project Description";

// //             default:
// //                 return "";
// //         }
// //     };

// //     const validateForm = () => {
// //         const newErrors = {};

// //         Object.keys(form).forEach((key) => {

// //             if (key === "progress") return;

// //             const error = validateField(key, form[key], form);

// //             if (error) {
// //                 newErrors[key] = error;
// //             }
// //         });

// //         return newErrors;
// //     };

// //     const handleChange = (e) => {
// //         const { name, value } = e.target;
// //         const updatedForm = {
// //             ...form,
// //             [name]: value,
// //         };
// //         setForm(updatedForm);
// //         setErrors((prev) => ({
// //             ...prev,
// //             [name]: validateField(name, value, updatedForm),
// //         }));
// //     };

// //     // const handleSubmit = (e) => {
// //     //     e.preventDefault();
// //     //     const newErrors = validateForm();
// //     //     if (Object.keys(newErrors).length > 0) {
// //     //         setErrors(newErrors);
// //     //         return;
// //     //     }     
// //     //     setErrors({});
// //     //     fetch("http://127.0.0.1:8000/testmanager/projects/", {
// //     //         headers:{
// //     //             "Authorization":
// //     //             `Bearer ${sessionStorage.getItem("access")}`
// //     //         }
// //     //     })
// //     //     .then(res=>res.json())
// //     //     .then(data=>{
// //     //         setProjects(data);
// //     //     })
// //     //     .catch(err => {
// //     //         console.log(err);
// //     //         toast.error("Unable to create project.");
// //     //         navigate("/projects");

// //     //     });
// //     // };

// //     const handleSubmit = (e) => {
// //         e.preventDefault();

// //         const newErrors = validateForm();

// //         if (Object.keys(newErrors).length > 0) {
// //             setErrors(newErrors);
// //             return;
// //         }

// //         setErrors({});
// //         const token = sessionStorage.getItem("access");

// //         console.log({
// //             customer: form.customer,
// //             manager: form.manager
// //         });

// //         fetch("http://127.0.0.1:8000/projects/create/", {
// //             method:"POST",
// //             headers:{
// //                 "Authorization":`Bearer ${token}`,
// //                 "Content-Type":"application/json"
// //             },
// //             body:JSON.stringify({
// //                 project_name: form.project_name,
// //                 project_type: form.project_type,
// //                 customer: form.customer,
// //                 manager: form.manager,
// //                 project_desc: form.project_desc,
// //                 priority: form.priority,
// //                 status:"ASSIGNED_PENDING",
// //                 start_date: form.start_date,
// //                 deadline: form.deadline,
// //                 progress:0
// //             })
// //         })

// //         .then(async(res)=>{
// //             const data = await res.json();
// //             console.log("CREATE RESPONSE:",data);
// //             if(!res.ok){
// //                 throw new Error(JSON.stringify(data));
// //             }
// //             toast.success("Project Created Successfully");
// //             navigate("/projects");
// //         })
// //         .catch(err=>{
// //             console.log("CREATE ERROR:",err);
// //             toast.error(
// //                 "Unable to create project"
// //             );
// //         });
// //     };

// //     return (
// //         <div className="user-create-container">
// //             <form className="user-form-container" onSubmit={handleSubmit} >

// //                 <h2>Create Project</h2>

// //                 <hr />

// //                 <div className="form-row">
// //                     <div className="form-group">
// //                         <label>Project Name</label>
// //                         <input
// //                             type="text"
// //                             name="project_name"
// //                             value={form.project_name}
// //                             onChange={handleChange}
// //                         />
// //                         { errors.project_name && (
// //                             <p className="error-text">{errors.project_name}</p>
// //                         )}
// //                     </div>

// //                     <div className="form-group">
// //                         <label>Project Type</label>
// //                         <select
// //                             name="project_type"
// //                             value={form.project_type}
// //                             onChange={handleChange}
// //                         >
// //                             <option value="">Select Type</option>
// //                             <option value="WEBAPP">Web Application</option>
// //                             <option value="MOBILE">Mobile</option>
// //                             <option value="NETWORK">Network</option>
// //                             <option value="IOT">IOT</option>
// //                             <option value="RADIO">Radio</option>
// //                             <option value="THICK">Thick Client</option>
// //                             <option value="SOURCE">Source Code Analysis</option>
// //                         </select>
// //                         { errors.project_type && (
// //                             <p className="error-text">{errors.project_type}</p>
// //                         )}
// //                     </div>
// //                 </div>

// //                 <div className="form-row">
// //                     <div className="form-group">
// //                         <label>Customer</label>
// //                         <select
// //                             name="customer"
// //                             value={form.customer}
// //                             onChange={handleChange}
// //                         >
// //                             <option value="">Select Customer</option>
// //                             {customers.map(customer => (
// //                                 <option key={customer.id} value={customer.id}>
// //                                     {customer.organization}
// //                                 </option>
// //                             ))}
// //                         </select>
// //                         { errors.customer && (
// //                             <p className="error-text">{errors.customer}</p>
// //                         )}
// //                     </div>

// //                     <div className="form-group">
// //                         <label>Test Manager</label>
// //                         <select
// //                             name="manager"
// //                             value={form.manager}
// //                             onChange={handleChange}
// //                         >
// //                             <option value="">Select Manager</option>
// //                             {managers.map(manager => (
// //                                 <option key={manager.id} value={manager.id} >
// //                                     {manager.first_name} {manager.last_name}
// //                                 </option>
// //                             ))}
// //                         </select>
// //                         { errors.manager && (
// //                             <p className="error-text">{errors.manager}</p>
// //                         )}
// //                     </div>
// //                 </div>

// //                 <div className="form-row">
// //                     <div className="form-group">
// //                         <label>Priority</label>
// //                         <select
// //                             name="priority"
// //                             value={form.priority}
// //                             onChange={handleChange}
// //                         >
// //                             <option value="CRITICAL">Critical</option>
// //                             <option value="HIGH">High</option>
// //                             <option value="MEDIUM">Medium</option>
// //                             <option value="LOW">Low</option>
// //                         </select>
// //                         { errors.priority && (
// //                             <p className="error-text">{errors.priority}</p>
// //                         )}
// //                     </div>

// //                     <div className="form-group">
// //                         <label>Status</label>
// //                         <select
// //                             name="status"
// //                             value={form.status}
// //                             onChange={handleChange}
// //                         >
// //                             <option value="CREATED">Created</option>
// //                             <option value="ASSIGNED">Assigned</option>
// //                         </select>
// //                         { errors.status && (
// //                             <p className="error-text">{errors.status}</p>
// //                         )}
// //                     </div>
// //                 </div>

// //                 <div className="form-row">
// //                     <div className="form-group">
// //                         <label>Start Date</label>
// //                         <input
// //                             type="date"
// //                             name="start_date"
// //                             value={form.start_date}
// //                             onChange={handleChange}
// //                         />
// //                         { errors.start_date && (
// //                             <p className="error-text">{errors.start_date}</p>
// //                         )}
// //                     </div>

// //                     <div className="form-group">
// //                         <label>Deadline</label>
// //                         <input
// //                             type="date"
// //                             name="deadline"
// //                             value={form.deadline}
// //                             onChange={handleChange}
// //                         />
// //                         { errors.deadline && (
// //                             <p className="error-text">{errors.deadline}</p>
// //                         )}
// //                     </div>
// //                 </div>

// //                 <div className="form-group">

// //                     <label>Project Description</label>

// //                     <textarea
// //                         name="project_desc"
// //                         rows="6"
// //                         value={form.project_desc}
// //                         onChange={handleChange}
                        
// //                     />
// //                     { errors.project_desc && (
// //                         <p className="error-text">{errors.project_desc}</p>
// //                     )}

// //                 </div>

// //                 <div className="button-group">

// //                     <button
// //                         type="button"
// //                         className="cancel-btn"
// //                         onClick={() => navigate("/projects")}
// //                     >
// //                         Cancel
// //                     </button>

// //                     <button
// //                         type="submit"
// //                         className="submit-btn"
// //                     >
// //                         Create Project
// //                     </button>

// //                 </div>

// //             </form>

// //         </div>

// //     );

// // }

// // export default ProjectCreation;



// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import "./UIDesign.css";

// function ProjectCreation() {

//     const navigate = useNavigate();

//     const [customers, setCustomers] = useState([]);
//     const [managers, setManagers] = useState([]);
//     const [projectTypes, setProjectTypes] = useState([]);

//     const [form, setForm] = useState({
//         project_name: "",
//         project_type: "",
//         customer: "",
//         manager: "",
//         project_desc: "",
//         priority: "MEDIUM",
//         status: "CREATED",
//         start_date: "",
//         deadline: "",
//         progress: 0,
//     });

//     const [errors, setErrors] = useState({});

//     useEffect(() => {
//         fetch("http://127.0.0.1:8000/customers/")
//             .then(res => res.json())
//             .then(data => setCustomers(data))
//             .catch(err => console.log(err));

//         fetch("http://127.0.0.1:8000/testmanagers/")
//             .then(res => res.json())
//             .then(data => setManagers(data))
//             .catch(err => console.log(err));

//         fetch("http://127.0.0.1:8000/project-types/")
//             .then(async (res) => {
//                 if (!res.ok) {
//                     const text = await res.text();
//                     throw new Error(`HTTP ${res.status}`);
//                 }
//                 return res.json();
//             })
//             .then(data => setProjectTypes(data))
//             .catch(err => {
//                 console.log("Error fetching project types:", err);
                
//                 setProjectTypes([
//                     { id: "WEBAPP", name: "Web Application" },
//                     { id: "MOBILE", name: "Mobile" },
//                     { id: "NETWORK", name: "Network" },
//                     { id: "IOT", name: "IOT" },
//                     // { id: "RADIO", name: "Radio" },
//                     { id: "THICK", name: "Thick Client" },
//                     { id: "SOURCE", name: "Source Code Analysis" }
//                 ]);
//             });
//     }, []);

//     const validateField = (name, value, formData) => {
//         switch (name) {
//             case "project_name":
//                 if (!value.trim()) {
//                     return "*Please Enter Project Name";
//                 }
//                 if (!/^[A-Za-z0-9 ]+$/.test(value.trim())) {
//                     return "*Only letters and numbers are allowed";
//                 }
//                 return "";

//             case "project_type":
//                 return value ? "" : "*Please Select Project Type";

//             case "customer":
//                 return value ? "" : "*Please Select Customer";

//             case "manager":
//                 return value ? "" : "*Please Select Test Manager";

//             case "priority":
//                 return value ? "" : "*Please Select Priority";

//             case "status":
//                 return value ? "" : "*Please Select Status";

//             case "start_date":
//                 if (!value) {
//                     return "*Please Select Start Date";
//                 }
//                 if (
//                     formData.deadline &&
//                     new Date(value) > new Date(formData.deadline)
//                 ) {
//                     return "*Start Date must be before Deadline";
//                 }
//                 return "";

//             case "deadline":
//                 if (!value) {
//                     return "*Please Select Deadline";
//                 }
//                 if (
//                     formData.start_date &&
//                     new Date(value) < new Date(formData.start_date)
//                 ) {
//                     return "*Deadline must be after Start Date";
//                 }
//                 return "";

//             case "project_desc":
//                 return value.trim() ? "" : "*Please Enter Project Description";

//             default:
//                 return "";
//         }
//     };

//     const validateForm = () => {
//         const newErrors = {};

//         Object.keys(form).forEach((key) => {

//             if (key === "progress") return;

//             const error = validateField(key, form[key], form);

//             if (error) {
//                 newErrors[key] = error;
//             }
//         });

//         return newErrors;
//     };

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         const updatedForm = {
//             ...form,
//             [name]: value,
//         };
//         setForm(updatedForm);
//         setErrors((prev) => ({
//             ...prev,
//             [name]: validateField(name, value, updatedForm),
//         }));
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();

//         const newErrors = validateForm();

//         if (Object.keys(newErrors).length > 0) {
//             setErrors(newErrors);
//             return;
//         }

//         setErrors({});
//         const token = sessionStorage.getItem("access");

//         console.log({
//             customer: form.customer,
//             manager: form.manager
//         });

//         fetch("http://127.0.0.1:8000/projects/create/", {
//             method: "POST",
//             headers: {
//                 "Authorization": `Bearer ${token}`,
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({
//                 project_name: form.project_name,
//                 project_type: form.project_type,
//                 customer: form.customer,
//                 manager: form.manager,
//                 project_desc: form.project_desc,
//                 priority: form.priority,
//                 status: "ASSIGNED_PENDING",
//                 start_date: form.start_date,
//                 deadline: form.deadline,
//                 progress: 0
//             })
//         })

//             .then(async (res) => {
//                 const data = await res.json();
//                 // console.log("CREATE RESPONSE:", data);
//                 if (!res.ok) {
//                     throw new Error(JSON.stringify(data));
//                 }
//                 toast.success("Project Created Successfully");
//                 navigate("/projects");
//             })
//             .catch(err => {
//                 // console.log("CREATE ERROR:", err);
//                 toast.error(
//                     "Unable to create project"
//                 );
//             });
//     };

//     return (
//         <div className="user-create-container">
//             <form className="user-form-container" onSubmit={handleSubmit} >

//                 <h2>Create Project</h2>

//                 <hr />

//                 <div className="form-row">
//                     <div className="form-group">
//                         <label>Project Name</label>
//                         <input
//                             type="text"
//                             name="project_name"
//                             value={form.project_name}
//                             onChange={handleChange}
//                         />
//                         {errors.project_name && (
//                             <p className="error-text">{errors.project_name}</p>
//                         )}
//                     </div>

//                     <div className="form-group">
//                         <label>Project Type</label>
//                         <select
//                             name="project_type"
//                             value={form.project_type}
//                             onChange={handleChange}
//                         >
//                             <option value="">Select Type</option>
//                             {projectTypes.map(type => (
//                                 <option key={type.id} value={type.id}>
//                                     {type.name || type.id}
//                                 </option>
//                             ))}
//                         </select>
//                         {errors.project_type && (
//                             <p className="error-text">{errors.project_type}</p>
//                         )}
//                     </div>
//                 </div>

//                 <div className="form-row">
//                     <div className="form-group">
//                         <label>Customer</label>
//                         <select
//                             name="customer"
//                             value={form.customer}
//                             onChange={handleChange}
//                         >
//                             <option value="">Select Customer</option>
//                             {customers.map(customer => (
//                                 <option key={customer.id} value={customer.id}>
//                                     {customer.organization}
//                                 </option>
//                             ))}
//                         </select>
//                         {errors.customer && (
//                             <p className="error-text">{errors.customer}</p>
//                         )}
//                     </div>

//                     <div className="form-group">
//                         <label>Test Manager</label>
//                         <select
//                             name="manager"
//                             value={form.manager}
//                             onChange={handleChange}
//                         >
//                             <option value="">Select Manager</option>
//                             {managers.map(manager => (
//                                 <option key={manager.id} value={manager.id} >
//                                     {manager.first_name} {manager.last_name}
//                                 </option>
//                             ))}
//                         </select>
//                         {errors.manager && (
//                             <p className="error-text">{errors.manager}</p>
//                         )}
//                     </div>
//                 </div>

//                 <div className="form-row">
//                     <div className="form-group">
//                         <label>Priority</label>
//                         <select
//                             name="priority"
//                             value={form.priority}
//                             onChange={handleChange}
//                         >
//                             <option value="CRITICAL">Critical</option>
//                             <option value="HIGH">High</option>
//                             <option value="MEDIUM">Medium</option>
//                             <option value="LOW">Low</option>
//                         </select>
//                         {errors.priority && (
//                             <p className="error-text">{errors.priority}</p>
//                         )}
//                     </div>

//                     <div className="form-group">
//                         <label>Status</label>
//                         <select
//                             name="status"
//                             value={form.status}
//                             onChange={handleChange}
//                         >
//                             <option value="CREATED">Created</option>
//                             <option value="ASSIGNED">Assigned</option>
//                         </select>
//                         {errors.status && (
//                             <p className="error-text">{errors.status}</p>
//                         )}
//                     </div>
//                 </div>

//                 <div className="form-row">
//                     <div className="form-group">
//                         <label>Start Date</label>
//                         <input
//                             type="date"
//                             name="start_date"
//                             value={form.start_date}
//                             onChange={handleChange}
//                         />
//                         {errors.start_date && (
//                             <p className="error-text">{errors.start_date}</p>
//                         )}
//                     </div>

//                     <div className="form-group">
//                         <label>Deadline</label>
//                         <input
//                             type="date"
//                             name="deadline"
//                             value={form.deadline}
//                             onChange={handleChange}
//                         />
//                         {errors.deadline && (
//                             <p className="error-text">{errors.deadline}</p>
//                         )}
//                     </div>
//                 </div>

//                 <div className="form-group">

//                     <label>Project Description</label>

//                     <textarea
//                         name="project_desc"
//                         rows="6"
//                         value={form.project_desc}
//                         onChange={handleChange}

//                     />
//                     {errors.project_desc && (
//                         <p className="error-text">{errors.project_desc}</p>
//                     )}

//                 </div>

//                 <div className="button-group">

//                     <button
//                         type="button"
//                         className="cancel-btn"
//                         onClick={() => navigate("/projects")}
//                     >
//                         Cancel
//                     </button>

//                     <button
//                         type="submit"
//                         className="submit-btn"
//                     >
//                         Create Project
//                     </button>

//                 </div>

//             </form>

//         </div>

//     );

// }

// export default ProjectCreation;


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./UIDesign.css";

function ProjectCreation() {
    const navigate = useNavigate();

    const [customers, setCustomers] = useState([]);
    const [managers, setManagers] = useState([]);
    const [projectTypes, setProjectTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        project_name: "",
        project_type: "",
        customer: "",
        manager: "",
        project_desc: "",
        priority: "MEDIUM",
        status: "CREATED",
        start_date: "",
        deadline: "",
        progress: 0,
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        const token = sessionStorage.getItem("access");
        
        if (!token) {
            toast.error("Please login first");
            navigate("/login");
            return;
        }

        setLoading(true);

        try {
            // Fetch customers with authentication
            const customersResponse = await fetch("http://127.0.0.1:8000/customers/", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            });

            if (customersResponse.ok) {
                const customersData = await customersResponse.json();
                setCustomers(Array.isArray(customersData) ? customersData : []);
            } else {
                console.error("Failed to fetch customers:", customersResponse.status);
                setCustomers([]);
            }

            // Fetch managers with authentication
            const managersResponse = await fetch("http://127.0.0.1:8000/testmanagers/", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            });

            if (managersResponse.ok) {
                const managersData = await managersResponse.json();
                setManagers(Array.isArray(managersData) ? managersData : []);
            } else {
                console.error("Failed to fetch managers:", managersResponse.status);
                setManagers([]);
            }

            // Use hardcoded project types since endpoint doesn't exist
            setProjectTypes([
                { id: "WEBAPP", name: "Web Application" },
                { id: "MOBILE", name: "Mobile" },
                { id: "NETWORK", name: "Network" },
                { id: "IOT", name: "IOT" },
                { id: "THICK", name: "Thick Client" },
                { id: "SOURCE", name: "Source Code Analysis" }
            ]);

        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load form data");
        } finally {
            setLoading(false);
        }
    };

    const validateField = (name, value, formData) => {
        switch (name) {
            case "project_name":
                if (!value.trim()) {
                    return "Please Enter Project Name";
                }
                if (!/^[A-Za-z0-9 ]+$/.test(value.trim())) {
                    return "Only letters and numbers are allowed";
                }
                return "";

            case "project_type":
                return value ? "" : "Please Select Project Type";

            case "customer":
                return value ? "" : "Please Select Customer";

            case "manager":
                return value ? "" : "Please Select Test Manager";

            case "priority":
                return value ? "" : "Please Select Priority";

            case "status":
                return value ? "" : "Please Select Status";

            case "start_date":
                if (!value) {
                    return "Please Select Start Date";
                }
                if (
                    formData.deadline &&
                    new Date(value) > new Date(formData.deadline)
                ) {
                    return "Start Date must be before Deadline";
                }
                return "";

            case "deadline":
                if (!value) {
                    return "Please Select Deadline";
                }
                if (
                    formData.start_date &&
                    new Date(value) < new Date(formData.start_date)
                ) {
                    return "Deadline must be after Start Date";
                }
                return "";

            case "project_desc":
                return value.trim() ? "" : "Please Enter Project Description";

            default:
                return "";
        }
    };

    const validateForm = () => {
        const newErrors = {};

        Object.keys(form).forEach((key) => {
            if (key === "progress") return;
            const error = validateField(key, form[key], form);
            if (error) {
                newErrors[key] = error;
            }
        });

        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedForm = {
            ...form,
            [name]: value,
        };
        setForm(updatedForm);
        setErrors((prev) => ({
            ...prev,
            [name]: validateField(name, value, updatedForm),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        const token = sessionStorage.getItem("access");

        if (!token) {
            toast.error("Please login first");
            navigate("/login");
            return;
        }

        // Prepare the data for submission
        const projectData = {
            project_name: form.project_name,
            project_type: form.project_type,
            customer: parseInt(form.customer),
            manager: parseInt(form.manager),
            project_desc: form.project_desc,
            priority: form.priority,
            status: "ASSIGNED_PENDING",
            start_date: form.start_date,
            deadline: form.deadline,
            progress: 0
        };

        console.log("Submitting project data:", projectData);

        try {
            const response = await fetch("http://127.0.0.1:8000/projects/create/", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(projectData)
            });

            const data = await response.json();
            console.log("Server response:", data);

            if (!response.ok) {
                // Handle validation errors from backend
                if (data && typeof data === 'object') {
                    const errorMessages = Object.values(data).flat().join('\n');
                    throw new Error(errorMessages || data.error || "Failed to create project");
                }
                throw new Error("Failed to create project");
            }

            toast.success("Project Created Successfully!");
            navigate("/projects");
            
        } catch (error) {
            console.error("Create project error:", error);
            toast.error(error.message || "Unable to create project. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="user-create-container">
                <div className="user-form-container" style={{ textAlign: "center", padding: "60px" }}>
                    <h3>Loading form data...</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="user-create-container">
            <form className="user-form-container" onSubmit={handleSubmit}>
                <h2>Create Project</h2>
                <hr />

                <div className="form-row">
                    <div className="form-group">
                        <label>Project Name</label>
                        <input
                            type="text"
                            name="project_name"
                            value={form.project_name}
                            onChange={handleChange}
                            placeholder="Enter project name"
                        />
                        {errors.project_name && (
                            <p className="error-text">{errors.project_name}</p>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Project Type</label>
                        <select
                            name="project_type"
                            value={form.project_type}
                            onChange={handleChange}
                        >
                            <option value="">Select Type</option>
                            {projectTypes.map(type => (
                                <option key={type.id} value={type.id}>
                                    {type.name || type.id}
                                </option>
                            ))}
                        </select>
                        {errors.project_type && (
                            <p className="error-text">{errors.project_type}</p>
                        )}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Customer *</label>
                        <select
                            name="customer"
                            value={form.customer}
                            onChange={handleChange}
                        >
                            <option value="">Select Customer</option>
                            {Array.isArray(customers) && customers.map(customer => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.organization || customer.username || customer.id }
                                </option>
                            ))}
                        </select>
                        {errors.customer && (
                            <p className="error-text">{errors.customer}</p>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Test Manager *</label>
                        <select
                            name="manager"
                            value={form.manager}
                            onChange={handleChange}
                        >
                            <option value="">Select Manager</option>
                            {Array.isArray(managers) && managers.map(manager => (
                                <option key={manager.id} value={manager.id}>
                                    {manager.first_name} {manager.last_name}
                                </option>
                            ))}
                        </select>
                        {errors.manager && (
                            <p className="error-text">{errors.manager}</p>
                        )}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Priority *</label>
                        <select
                            name="priority"
                            value={form.priority}
                            onChange={handleChange}
                        >
                            <option value="CRITICAL">Critical</option>
                            <option value="HIGH">High</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="LOW">Low</option>
                        </select>
                        {errors.priority && (
                            <p className="error-text">{errors.priority}</p>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Status *</label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                        >
                            <option value="CREATED">Created</option>
                            {/* <option value="ASSIGNED_PENDING">Pending Assignment</option> */}
                        </select>
                        {errors.status && (
                            <p className="error-text">{errors.status}</p>
                        )}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Start Date *</label>
                        <input
                            type="date"
                            name="start_date"
                            value={form.start_date}
                            onChange={handleChange}
                        />
                        {errors.start_date && (
                            <p className="error-text">{errors.start_date}</p>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Deadline *</label>
                        <input
                            type="date"
                            name="deadline"
                            value={form.deadline}
                            onChange={handleChange}
                        />
                        {errors.deadline && (
                            <p className="error-text">{errors.deadline}</p>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label>Project Description *</label>
                    <textarea
                        name="project_desc"
                        rows="6"
                        value={form.project_desc}
                        onChange={handleChange}
                        placeholder="Enter project description"
                    />
                    {errors.project_desc && (
                        <p className="error-text">{errors.project_desc}</p>
                    )}
                </div>

                <div className="button-group">
                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => navigate("/projects")}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="submit-btn"
                    >
                        Create Project
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ProjectCreation;