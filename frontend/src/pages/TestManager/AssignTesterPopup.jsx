// import {useEffect,useState} from "react";
// import {toast} from "react-toastify";
// import { apiFetch } from "./api";

// function AssignTesterPopup({project,close}){
//     const [testers,setTesters]=useState([]);
//     const [selectedTester,setSelectedTester]=useState("");

//     useEffect(() => {
//         const token = sessionStorage.getItem("access");

//         fetch("http://127.0.0.1:8000/testers/", {
//             headers: {
//                 Authorization: `Bearer ${token}`,
//                 "Content-Type": "application/json",
//             },
//         })
//         .then(async (res) => {
//             const data = await res.json();
//             if (!res.ok) {
//                 throw new Error(data.detail || "Unable to fetch testers");
//             }

//             setTesters(Array.isArray(data) ? data : []);
//         })
//         .catch((err) => {
//             console.log(err);
//             toast.error("Unable to load testers.");
//             setTesters([]);
//         });
//     }, []);

//     const assignTester = () => {
//         const token = sessionStorage.getItem("access");
//         apiFetch(
//             `http://127.0.0.1:8000/testmanager/projects/${project.project_id}/assign/`,
//             {
//                 method: "PUT",
//                 headers: {
//                     "Authorization": `Bearer ${token}`,
//                     "Content-Type": "application/json"
//                 },
//                 body: JSON.stringify({
//                     tester: selectedTester
//                 })
//             }
//         )
//         .then(async (res) => {
//             const text = await res.text();

//             let data;
//             try {
//                 data = JSON.parse(text);
//             }
//             catch {
//                 throw new Error(text);
//             }
//             if (!res.ok) {
//                 throw new Error(data.error || "Assignment failed");
//             }
//             toast.success("Tester Assigned Successfully");
//             close();
//         })
//         .catch(err => {
//             // console.log("ASSIGN ERROR:", err);
//             toast.error("Assignment Failed");
//         });
//     };

//     return (
//         <div className="popup-overlay">
//             <div className="assign-popup">
//                 <h2>Assign Tester</h2>
//                 <p>
//                     Project : 
//                     <b>{project.project_name}</b>
//                 </p>
//                 <select
//                     value={selectedTester}
//                     onChange={(e)=>setSelectedTester(e.target.value)}
//                 >
//                 <option value=""> Select Tester </option>
//                 {
//                     testers.map(tester=>(
//                         <option
//                             key={tester.id}
//                             value={tester.id}
//                         >
//                             {tester.first_name} {tester.last_name}
//                         </option>
//                     ))
//                 }
//                 </select>

//                 <div className="popup-buttons">
//                     <button
//                         onClick={assignTester}
//                         className="submit-btn"
//                     >
//                         Assign
//                     </button>

//                     <button
//                         onClick={close}
//                         className="cancel-btn"
//                     >
//                         Cancel
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default AssignTesterPopup;


import {useEffect, useState} from "react";
import {toast} from "react-toastify";

function AssignTesterPopup({project, close}) {
    const [testers, setTesters] = useState([]);
    const [selectedTester, setSelectedTester] = useState("");
    const [loading, setLoading] = useState(false);
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        fetchTesters();
    }, []);

    const fetchTesters = () => {
        const token = sessionStorage.getItem("access");

        if (!token) {
            toast.error("Please login again");
            close();
            return;
        }

        fetch("http://127.0.0.1:8000/testers/", {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
        .then(async (res) => {
            if (!res.ok) {
                throw new Error("Unable to fetch testers");
            }
            return res.json();
        })
        .then((data) => {
            setTesters(Array.isArray(data) ? data : []);
            if (Array.isArray(data) && data.length === 0) {
                toast.info("No testers available");
            }
        })
        .catch((err) => {
            console.error("Error fetching testers:", err);
            toast.error("Unable to load testers.");
            setTesters([]);
        });
    };

    const assignTester = () => {
        if (!selectedTester) {
            toast.error("Please select a tester");
            return;
        }

        const token = sessionStorage.getItem("access");

        if (!token) {
            toast.error("Please login again");
            close();
            return;
        }

        setAssigning(true);

        const assignUrl = `http://127.0.0.1:8000/testmanager/projects/${project.project_id}/assign/`;

        console.log("Assigning tester with URL:", assignUrl);
        console.log("Selected tester ID:", selectedTester);

        fetch(assignUrl, {
            method: "POST",  // Use POST method
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                tester: selectedTester  // Use 'tester' field name to match backend
            })
        })
        .then(async (res) => {
            let data;
            const text = await res.text();
            try {
                data = JSON.parse(text);
            } catch {
                data = { message: text };
            }

            if (!res.ok) {
                if (res.status === 401) {
                    toast.error("Session expired. Please login again.");
                    sessionStorage.removeItem("access");
                    sessionStorage.removeItem("user");
                    close();
                    setTimeout(() => {
                        window.location.href = "/login";
                    }, 1500);
                    return;
                }
                if (res.status === 404) {
                    toast.error("Assignment endpoint not found.");
                    return;
                }
                if (res.status === 400) {
                    toast.error(data.error || "Invalid request");
                    return;
                }
                throw new Error(data.error || data.message || "Assignment failed");
            }

            toast.success("Tester Assigned Successfully!");
            setAssigning(false);
            close();
        })
        .catch(err => {
            console.error("ASSIGN ERROR:", err);
            toast.error(err.message || "Assignment Failed");
            setAssigning(false);
        });
    };

    return (
        <div className="popup-overlay">
            <div className="assign-popup">
                <h2>Assign Tester</h2>
                <p>
                    Project: <b>{project?.project_name || "Unknown"}</b>
                </p>
                
                <select
                    value={selectedTester}
                    onChange={(e) => setSelectedTester(e.target.value)}
                    disabled={loading || assigning}
                >
                    <option value="">Select Tester</option>
                    {testers.map((tester) => (
                        <option key={tester.id || tester.user_id} value={tester.id || tester.user_id}>
                            {tester.first_name} {tester.last_name} 
                            {tester.email ? ` (${tester.email})` : ""}
                        </option>
                    ))}
                </select>

                {testers.length === 0 && !loading && (
                    <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                        No testers available. Please add testers first.
                    </p>
                )}

                <div className="popup-buttons">
                    <button
                        onClick={assignTester}
                        className="submit-btn"
                        disabled={!selectedTester || assigning || loading}
                    >
                        {assigning ? "Assigning..." : "Assign"}
                    </button>

                    <button
                        onClick={close}
                        className="cancel-btn"
                        disabled={assigning}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AssignTesterPopup;