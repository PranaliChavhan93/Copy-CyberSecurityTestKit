import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./UIDesign.css";

function SuitesCreation() {

    const navigate = useNavigate();

      const standardsList = [
        "OWASP",
        "PTES",
        "NIST",
        "OSSTMM",
        "IEC 62443",
        "ISO 21434",
        "ISO 27001",
        "NIST SP 800-53",
        "CIS Controls",
        "PCI DSS",
        "HIPAA"
    ];

   const [form, setForm] = useState({
        suite_id: "",
        suite_name: "",
        suite_code: "",
        std_follows: [],
        suite_desc: ""
    });

    const [errors, setErrors] = useState({
        suite_id: "",
        suite_name: "",
        suite_code: "",
        std_follows: [],
        suite_desc: ""
    });

    const validateField = (name, value, formData) => {
        switch (name) {
            case "suite_name":
                if (!value.trim()) {
                    return "*Please Enter Protocol Name";
                }
                if (!/^[A-Z_ ]+$/.test(value.trim())) {
                    return "*Only Capitals And Underscore Are Allowed";
                }
                return "";

            case "suite_code":
               if (!value.trim()) {
                    return "*Please Enter Protocol Name";
                }
                if (!/^[A-Z_ ]+$/.test(value.trim())) {
                    return "*Only Capitals And Underscore Are Allowed";
                }
                return "";

            case "std_follows":
                return value.length > 0
                    ? ""
                    : "*Please Select At Least One Standard";

            case "suite_desc":
                return value.trim()
                    ? ""
                    : "*Please Enter Suite Description";

            default:
                return "";
        }
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

    const validateForm = () => {
        const newErrors = {};

        Object.keys(form).forEach((key) => {
            if (key === "suite_id") return;

            const error = validateField(key, form[key], form);

            if (error) {
                newErrors[key] = error;
            }
        });

        return newErrors;
    };

    const handleStandardChange = (standard) => {

        const updatedStandards = form.std_follows.includes(standard)
            ? form.std_follows.filter(item => item !== standard)
            : [...form.std_follows, standard];

        const updatedForm = {
            ...form,
            std_follows: updatedStandards,
        };

        setForm(updatedForm);

        setErrors(prev => ({
            ...prev,
            std_follows: validateField(
                "std_follows",
                updatedStandards,
                updatedForm
            ),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = validateForm();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        fetch("http://127.0.0.1:8000/master/suites/create/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(form),
        })
        .then(res => {
            if (!res.ok) {
                throw new Error("Failed to create suite");
            }
            return res.json();
        })
        .then(() => {
            toast.success("Suite Created Successfully");
            navigate("/master/suites");
        })
        .catch(err => {
            console.log(err);
            toast.error("Unable to create suite.");
        });
    };

    return (
        <div className="user-create-container">
            <form className="user-form-container" onSubmit={handleSubmit}>

                <h2>Create Suite</h2>

                <hr />

                <div className="form-row">

                    <div className="form-group">
                        <label>Suite Name</label>
                        <input
                            type="text"
                            name="suite_name"
                            value={form.suite_name}
                            onChange={handleChange}
                        />
                        {errors.suite_name && (
                            <p className="error-text">{errors.suite_name}</p>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Suite Code</label>
                        <input
                            type="text"
                            name="suite_code"
                            value={form.suite_code}
                            onChange={handleChange}
                        />
                        {errors.suite_code && (
                            <p className="error-text">{errors.suite_code}</p>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <div className="form-group standard-section">
                        <label>Standards Followed</label>
                        <div className="checkbox-grid">

                            {standardsList.map((item) => (
                                <div className="checkbox-item" key={item}>
                                    <input
                                        type="checkbox"
                                        id={item}
                                        checked={form.std_follows.includes(item)}
                                        onChange={() => handleStandardChange(item)}
                                    />
                                    <label htmlFor={item}>
                                        {item}
                                    </label>
                                </div>
                            ))}
                        </div>
                        {errors.std_follows && (
                            <p className="error-text">{errors.std_follows}</p>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label>Suite Description</label>

                    <textarea
                        name="suite_desc"
                        rows="6"
                        value={form.suite_desc}
                        onChange={handleChange}
                    />
                    {errors.suite_desc && (
                         <p className="error-text">{errors.suite_desc}</p>
                    )}
                </div>

                <div className="button-group">

                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => navigate("/master/suites")}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="submit-btn"
                    >
                        Create Suite
                    </button>

                </div>

            </form>
        </div>
    );
}

export default SuitesCreation;