
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./UIDesign.css";

function UserCreate() {
    const [form, setForm] = useState({
        role: "",
        user_id:"",
        first_name: "",
        last_name: "",

        // Customer Only
        org_email:"",
        contact_person:"",
        contact_person_email:"",
        designation:"",

        email: "",
        contact: "",
        organization: "",
        location: "",
        department: "",
        account_status: "ACTIVE"
    });

    const navigate = useNavigate();
    const [errors, setErrors] = useState({});

    const validateField = (name, value, currentRole = form.role) => {
        if (name === "role") 
            return value 
                ? "" 
                : "* Please Select a Role";

        if (currentRole === "CUSTOMER") {
            switch (name) {
                case "organization":
                    if (!value.trim()) 
                        return "* Please Enter Organization";
                
                    return /^[A-Za-z ]+$/.test(value) ? "" : "* Only Alphabets are allowed";
                
                case "email":
                    if (!value.trim()) 
                        return "* Please Enter Organization Email";
                    
                    return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(value)
                        ? ""
                        : "* Enter A Valid Email Address";
                
                case "location":
                    if (!value.trim()) 
                        return "* Please Enter Location";
                    
                    return /^[A-Za-z ]+$/.test(value) 
                        ? "" 
                        : "* Only Alphabets are allowed";
                
                case "contact_person":
                    if (!value.trim()) 
                        return "* Please Enter Contact Person Name";
                    
                    return /^[A-Za-z ]+$/.test(value) 
                        ? "" 
                        : "* Only Alphabets are allowed";
                
                case "contact_person_email":
                    if (!value.trim()) 
                        return "* Please Enter Contact Person Email";
                    
                    return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(value)
                        ? ""
                        : "* Enter A Valid Email Address";
                
                default:
                    return "";
            }
        }

        if (currentRole !== "CUSTOMER") {
            switch (name) {
                case "first_name":
                    if (!value.trim()) 
                        return "* Please Enter First Name";
                
                    return /^[A-Za-z]+$/.test(value) 
                        ? "" 
                        : "* Only Alphabets are allowed";
                
                case "last_name":
                    if (!value.trim()) 
                        return "* Please Enter Last Name";
                
                    return /^[A-Za-z]+$/.test(value) 
                        ? "" 
                        : "* Only Alphabets are allowed";
                
                case "email":
                    if (!value.trim()) 
                        return "* Please Enter Email";
                
                    return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(value)
                        ? ""
                        : "* Enter A Valid Email Address";
                
                case "contact":
                    if (!value) 
                        return "* Please Enter Contact Number";
                    
                    return /^[6-9][0-9]{9}$/.test(value)
                        ? ""
                        : "* Enter A Valid 10-digit Contact Number";
            
                case "organization":
                    if (!value.trim()) 
                        return "* Please Enter Organization";
                
                    return /^[A-Za-z ]+$/.test(value) 
                        ? "" 
                        : "* Only Alphabets are allowed";
                
                case "location":
                    if (!value.trim()) 
                        return "* Please Enter Location";
                
                    return /^[A-Za-z ]+$/.test(value) 
                        ? ""   
                        : "* Only Alphabets are allowed";
                
                case "department":
                    return value 
                        ? "" 
                        : "* Please Select Department";
                
                default:
                    return "";
            }
        }
        return "";
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: validateField(
                name, value, 
                name === "role" 
                    ? value 
                    : form.role)
            })
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

       const newErrors = {};
        Object.keys(form).forEach((key) => {
            const error = validateField(key, form[key]);
            if (error) {
                newErrors[key] = error;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please Fill All The Details.");
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/user/create/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            });

            if (response.ok) {
                toast.success("User created successfully!");
                navigate("/user/view/");
            } else {
                const errorText = await response.text();
                toast.error("Failed to create user");
            }
        } 
        catch (err) {
            toast.error("Server connection failed. Please try again.");
        }
    };

    return (
        <div className="user-create-container">
            <form className="user-form-container" onSubmit={handleSubmit}>
                <h2>Create User</h2>
                <hr />
                <br />

                <div className="form-row">
                    <div></div>
                    <div className="form-group">
                        <label>Role</label>
                        <select name="role" value={form.role} onChange={handleChange}>
                            <option value="">Select Role</option>
                            <option value="ADMIN">Admin</option>
                            <option value="TEST_MANAGER">Test Manager</option>
                            <option value="TESTER">Tester</option>
                            <option value="CUSTOMER">Customer</option>
                        </select>
                        {errors.role && <p className="error-text">{errors.role}</p>}
                    </div>
                </div>

                {/* Non-Customer View */}
                { form.role !== "CUSTOMER" && (
                <div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>First Name</label>
                            <input
                                name="first_name"
                                placeholder="Enter First Name"
                                value={form.first_name}
                                onChange={handleChange}
                            />
                            {errors.first_name && <p className="error-text">{errors.first_name}</p>}
                        </div>

                        <div className="form-group">
                            <label>Last Name</label>
                            <input
                                name="last_name"
                                placeholder="Enter Last Name"
                                value={form.last_name}
                                onChange={handleChange}
                            />
                            {errors.last_name && <p className="error-text">{errors.last_name}</p>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                name="email"
                                placeholder="Enter Email ID"
                                value={form.email}
                                onChange={handleChange}
                            />
                            {errors.email && <p className="error-text">{errors.email}</p>}
                        </div>

                        <div className="form-group">
                            <label>Contact No.</label>
                            <input
                                name="contact"
                                placeholder="Enter Contact No."
                                value={form.contact}
                                onChange={handleChange}
                                maxLength="10" minLength="10"
                            />
                            {errors.contact && <p className="error-text">{errors.contact}</p>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Organization</label>
                            <input
                                name="organization"
                                placeholder="Enter Organization Name"
                                value={form.organization}
                                onChange={handleChange}
                            />
                            {errors.organization && <p className="error-text">{errors.organization}</p>}
                        </div>

                        <div className="form-group">
                            <label>Location</label>
                            <input
                                name="location"
                                placeholder="Enter Location"
                                value={form.location}
                                onChange={handleChange}
                            />
                            {errors.location && <p className="error-text">{errors.location}</p>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Department</label>
                            <select name="department" value={form.department} onChange={handleChange}>
                                <option value="">Select Department</option>
                                <option value="PRODUCT_OWNER">Product Owner</option>
                                <option value="MANAGEMENT">Management</option>
                                <option value="TESTING">Testing</option>
                                <option value="CUSTOMER">Customer</option>
                            </select>
                            {errors.department && <p className="error-text">{errors.department}</p>}
                        </div>

                        <div className="form-group">
                            <label>Status</label>
                            <input name="account_status" value="ACTIVE" readOnly />
                        </div>
                    </div>
                </div>
                )}

                {/* Customer-Only View */}
                {form.role === "CUSTOMER" && (
                <div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Organization</label>
                            <input
                                name="organization"
                                placeholder="Enter Organization Name"
                                value={form.organization}
                                onChange={handleChange}
                            />
                            {errors.organization && <p className="error-text">{errors.organization}</p>}
                        </div>

                        <div className="form-group">
                            <label>Organization Email</label>
                            <input
                                name="email"
                                placeholder="Enter Org Email"
                                value={form.email}
                                onChange={handleChange}
                            />
                            {errors.email && <p className="error-text">{errors.org_email}</p>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Location</label>
                            <input
                            name="location"
                            placeholder="Enter Location"
                            value={form.location}
                            onChange={handleChange}
                            />
                            {errors.location && <p className="error-text">{errors.location}</p>}
                        </div>

                        <div className="form-group">
                            <label>Contact Person</label>
                            <input
                            name="contact_person"
                            placeholder="Enter Contact Person Name"
                            value={form.contact_person}
                            onChange={handleChange}
                            />
                            {errors.contact_person && <p className="error-text">{errors.contact_person}</p>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Contact Person Email</label>
                            <input
                                name="contact_person_email"
                                placeholder="Enter Contact Person Email"
                                value={form.contact_person_email}
                                onChange={handleChange}
                            />
                            {errors.contact_person_email && (
                            <p className="error-text">{errors.contact_person_email}</p>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Status</label>
                            <input name="account_status" value="ACTIVE" readOnly />
                        </div>
                    </div>
                </div>
                )}

                <div className="button-group">
                    <button type="button" className="cancel-btn" onClick={() => navigate("/user/view/")}>
                        Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                        Create
                    </button>
                </div>
            </form>
        </div>
    );
}

export default UserCreate;