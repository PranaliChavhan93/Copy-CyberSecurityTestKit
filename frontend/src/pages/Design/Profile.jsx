// import { useEffect, useState } from "react";
// import { FaUserCircle } from "react-icons/fa";
// import { Eye, EyeOff } from "lucide-react";

// import { toast } from "react-toastify";
// import "./Profile.css";

// function Profile() {

//     const [profile, setProfile] = useState({});
//     const [editOpen, setEditOpen] = useState(false);
//     const [passwordOpen, setPasswordOpen] = useState(false);

//     const [role, setRole] = useState("");

//     const [showPass, setShowPass] = useState({
//         current: false,
//         new: false,
//         confirm: false,
//     });

//     const [form, setForm] = useState({
       
//         first_name: "",
//         last_name: "",
//         email: "",
//         contact: "",
//         organization: "",
//         location: "",
//         department: "",

//         current_password: "",
//         new_password: "",
//         confirm_password: "",
//     });

    
//     const [errors, setErrors] = useState({
//         first_name: "",
//         last_name: "",
//         email: "",
//         contact: "",
//     });


//     useEffect(() => {
//         const token = sessionStorage.getItem("access");

//         if (!token) {
//             toast.error("Login session not found");
//             return;
//         }

//         fetch("http://127.0.0.1:8000/profile/", {
//             headers: {
//                 Authorization: `Bearer ${token}`,
//             },
//         })
//             .then(async (res) => {
//                 const data = await res.json();

//                 if (!res.ok) {
//                     throw new Error(data.detail || "Unable to load profile");
//                 }
//                 return data;
//             })
//             .then((data) => {
//                 setProfile(data);
//                 setRole(data.role);

//                 setForm((prev) => ({
//                     ...prev,
//                     ...data,
//                 }));
//             })
//             .catch((err) => {
//                 // console.log("Profile Error:", err);
//                 toast.error(err.message);
//             });

//     }, []);

//     const handleChange = (e) => {
//         setForm({
//             ...form,
//             [e.target.name]: e.target.value,
//         });
//     };

//     const updateProfile = async (e) => {
//         e.preventDefault();

//         const newErrors = {};

//         if (!/^[A-Za-z]+$/.test(form.first_name)) {
//             newErrors.first_name = "Only Alphabets are allowed";
//         }

//         if (!/^[A-Za-z]+$/.test(form.last_name)) {
//             newErrors.last_name = "Only Alphabets are allowed";
//         }

//         if (!/^[A-Za-z ]+$/.test(form.department)) {
//             newErrors.department = "Only Alphabets are allowed";
//         }

//         if (!/^[6-9][0-9]{9}$/.test(form.contact)) {
//             newErrors.contact = "Enter a valid 10-digit contact number";
//         }

//         if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(form.email) ) {
//             newErrors.email = "Enter a valid email address";
//         }

//         if (Object.keys(newErrors).length > 0) {
//             setErrors(newErrors);
//             return;
//         }

//         setErrors({});

//         const res = await fetch(
//             "http://127.0.0.1:8000/profile/update/",
//             {
//                 method: "PUT",
//                 headers: {
//                     "Content-Type": "application/json",
//                     Authorization: `Bearer ${sessionStorage.getItem("access")}`,
//                 },
//                 body: JSON.stringify(form),
//             }
//         );

//         if (res.ok) {
//             toast.success("Profile updated successfully");
//             setEditOpen(false);
//         } else {
//             toast.error("Update failed");
//         }
//     };

//     const changePassword = async (e)=>{
//         e.preventDefault();

//         if(
//             form.new_password !== 
//             form.confirm_password
//         ){
//             toast.error( "Passwords do not match" );
//             return;
//         }

//         const res = await fetch(
//             "http://127.0.0.1:8000/profile/change_password/",
//             {
//                 method:"PUT",
//                 headers:{
//                     "Content-Type":"application/json",
//                     Authorization:
//                     `Bearer ${sessionStorage.getItem("access")}`,
//                 },
//                 body:JSON.stringify({
//                     current_password:
//                     form.current_password,

//                     new_password:
//                     form.new_password,

//                     confirm_password:
//                     form.confirm_password,
//                 }),
//             }
//         );

//         if(res.ok){
//             toast.success( "Password changed successfully" );
//             setForm({
//                 ...form,
//                 current_password:"",
//                 new_password:"",
//                 confirm_password:"",
//             });
//             setPasswordOpen(false);
//         }
//         else{
//             const data = await res.json();
//             toast.error( data.error || "Password change failed" );
//         }
//     };

//     return (
//         <div className="profile-container">

//             <div className="profile-card">
//                 <h2><FaUserCircle /> My Profile </h2>

//                 <table className="profile-table">
//                     <tbody>
//                     { Object.entries(profile).map (( [key,value] ) => (
//                             <tr key={key}>
//                                 <th>{key}</th>
//                                 <td>{value}</td>
//                             </tr>
//                         ))
//                     }
//                     </tbody>
//                 </table>
                
              
//                 <table className="profile-table">
//                     <tbody>
//                     { Object.entries(profile).map (( [key,value] ) => (
//                             <tr key={key}>
//                                 <th>{key}</th>
//                                 <td>{value}</td>
//                             </tr>
//                         ))
//                     }
//                     </tbody>
//                 </table>
              
//                 <div className="btn-group">
//                     <button
//                         onClick={() =>
//                             setEditOpen(true)
//                         }
//                     >
//                         Update Profile
//                     </button>

//                     <button
//                         onClick={() =>
//                             setPasswordOpen(true)
//                         }
//                     >
//                         Change Password
//                     </button>
//                 </div>
//             </div>

//             {editOpen && (
//             <div className="modal">
//             <form
//                 className="modal-box"
//                 onSubmit={updateProfile}
//             >
//                 <h3>
//                     Edit Profile
//                 </h3>

//                 <input
//                     name="first_name"
//                     value={form.first_name}
//                     onChange={handleChange}
//                     placeholder="First Name"
//                 />
//                 {errors.first_name && (
//                     <p className="error-text">{errors.first_name}</p>
//                 )}

//                 <input
//                     name="last_name"
//                     value={form.last_name}
//                     onChange={handleChange}
//                     placeholder="Last Name"
//                 />
//                 {errors.last_name && (
//                     <p className="error-text">{errors.last_name}</p>
//                 )}

//                 <input
//                     name="email"
//                     value={form.email}
//                     onChange={handleChange}
//                     placeholder="Email"
//                 />
//                 {errors.email && (
//                     <p className="error-text">{errors.email}</p>
//                 )}

//                 <input
//                     name="contact"
//                     value={form.contact}
//                     onChange={handleChange}
//                     placeholder="Contact"
//                     maxLength='10' minLength='10'
//                 />
//                 {errors.contact && (
//                     <p className="error-text">{errors.contact}</p>
//                 )}
  
//                 <input
//                     name="organization"
//                     value={form.organization}
//                     onChange={handleChange}
//                     placeholder="Organization"
//                 />

//                 <input
//                     name="location"
//                     value={form.location}
//                     onChange={handleChange}
//                     placeholder="Location"
//                 />
//                 {errors.location && (
//                     <p className="error-text">{errors.location}</p>
//                 )}

//                 <input
//                     name="department"
//                     value={form.department}
//                     onChange={handleChange}
//                     placeholder="Department"
//                 />
//                 {errors.department && (
//                     <p className="error-text">{errors.department}</p>
//                 )}

//                 <div className="modal-actions">
//                     <button
//                         type="button"
//                         onClick={() =>
//                             setEditOpen(false)
//                         }
//                     >
//                         Cancel
//                     </button>

//                     <button type="submit">
//                         Save
//                     </button>

//                 </div>
//             </form>
//             </div>
//             )}

//             {passwordOpen && (
//             <div className="modal">
//             <form
//                 className="modal-box"
//                 onSubmit={changePassword}
//             >
//                 <h3>
//                     Change Password
//                 </h3>

//                 <div className="pass-field">
//                     <input
//                         type={ showPass.current ? "text" : "password"}
//                         name="current_password"
//                         value={ form.current_password }
//                         onChange={handleChange}
//                         placeholder="Current Password"
//                         required
//                     />

//                     <span onClick={()=>
//                         setShowPass({
//                             ...showPass,
//                             current : !showPass.current
//                         })
//                     }
//                     >
//                     { showPass.current ? <EyeOff size={15} /> : <Eye size={15} /> }
//                     </span>
//                 </div>

//                 <div className="pass-field">
//                     <input
//                         type={ showPass.new ? "text" : "password" }
//                         name="new_password"
//                         value={ form.new_password }
//                         onChange={handleChange}
//                         placeholder="New Password"
//                         required
//                     />

//                     <span
//                     onClick={()=>
//                         setShowPass({
//                             ...showPass,
//                             new : !showPass.new
//                         })
//                     }
//                     >
//                     { showPass.new ? <EyeOff size={15} /> : <Eye size={15} /> }
//                     </span>
//                 </div>
//                 <div className="pass-field">
//                     <input
//                         type={ showPass.confirm ? "text" : "password"  }
//                         name="confirm_password"
//                         value={ form.confirm_password }
//                         onChange={handleChange}
//                         placeholder="Confirm Password"
//                         required
//                     />

//                     <span
//                     onClick={()=>
//                         setShowPass({
//                             ...showPass,
//                             confirm : !showPass.confirm
//                         })
//                     }
//                     >
//                     { showPass.confirm ? <EyeOff size={15} /> : <Eye size={15} /> }
//                     </span>
//                 </div>

//                 <div className="modal-actions">
//                 <button
//                     type="button"
//                     onClick={()=>
//                         setPasswordOpen(false)
//                     }
//                 >
//                     Cancel
//                 </button>

//                 <button type="submit">
//                     Change Password
//                 </button>
//                 </div>
//             </form>
//             </div>
//             )}
//         </div>
//     );
// }

// export default Profile;


import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react";

import { toast } from "react-toastify";
import "./Profile.css";

function Profile() {
    const [profile, setProfile] = useState({});
    const [role, setRole] = useState("");

    const [editOpen, setEditOpen] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);

    const [showPass, setShowPass] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        contact: "",

        organization: "",
        email: "",
        contact_person: "",
        contact_person_email: "",

        location: "",
        department: "",

        current_password: "",
        new_password: "",
        confirm_password: "",
    });

    const [errors, setErrors] = useState({
        first_name: "",
        last_name: "",
        email: "",
        contact: "",
    });

    useEffect(() => {
        const token = sessionStorage.getItem("access");
        if (!token) {
            toast.error("Login session not found");
            return;
        }

        fetch("http://127.0.0.1:8000/profile/", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then(async (res)=>{
            const data = await res.json();
            if(!res.ok){
                throw new Error(
                    data.detail || "Unable to load profile"
                );
            }
            return data;
        })

        .then((data)=>{
            setProfile(data);
            setRole(data.role);
            setForm((prev)=>({
                ...prev,
                ...data,
            }));
        })

        .catch((err)=>{
            toast.error(err.message);
        });
    }, []);

    const handleChange = (e)=>{
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const updateProfile = async(e)=>{
        e.preventDefault();
        const newErrors={};

        if(role !== "CUSTOMER"){
            if (!/^[A-Za-z]+$/.test(form.first_name)) {
                newErrors.first_name = "Only Alphabets are allowed";
            }

            if (!/^[A-Za-z]+$/.test(form.last_name)) {
                newErrors.last_name = "Only Alphabets are allowed";
            }

            if (!/^[A-Za-z ]+$/.test(form.department)) {
                newErrors.department = "Only Alphabets are allowed";
            }

            if (!/^[6-9][0-9]{9}$/.test(form.contact)) {
                newErrors.contact = "Enter a valid 10-digit contact number";
            }

            if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(form.email)) {
                newErrors.email = "Enter a valid email address";
            }
        }

        if(Object.keys(newErrors).length > 0){
            setErrors(newErrors);
            return;
        }
        setErrors({});

        const res = await fetch(
            "http://127.0.0.1:8000/profile/update/",
            {
                method:"PUT",
                headers:{
                    "Content-Type":"application/json", Authorization:
                    `Bearer ${sessionStorage.getItem("access")

                    }`,
            },
            body:JSON.stringify(form),
            }
        );

        if(res.ok){
            toast.success(
                "Profile updated successfully"
            );
            setEditOpen(false);
        }

        else{
            toast.error( "Update failed" );
        }
    };

    const changePassword = async(e)=>{
        e.preventDefault();
        if( form.new_password !== form.confirm_password
            ){
            toast.error( "Passwords do not match" );
            return;
        }

        const res = await fetch(
            "http://127.0.0.1:8000/profile/change_password/",
            {
                method:"PUT",
                headers:{
                    "Content-Type" : "application/json",
                    Authorization : `Bearer ${sessionStorage.getItem("access") }`,
                },
                body:JSON.stringify({
                    current_password : form.current_password,
                    new_password : form.new_password,
                    confirm_password : form.confirm_password,
                }),
            }
        );

        if(res.ok){
            toast.success(
                "Password changed successfully"
            );
            setForm({
                ...form,
                current_password:"",
                new_password:"",
                confirm_password:"",
            });
            setPasswordOpen(false);
        }
        else{
            const data = await res.json();
            toast.error( data.error || "Password change failed" );
        }
    };
    return (
        <div className="profile-container">
            <div className="profile-card">
                <h2><FaUserCircle /> My Profile </h2>

                <table className="profile-table">
                    <tbody>
                    { role === "CUSTOMER" ? 
                    <>
                        <tr>
                            <th>Organization</th>
                            <td>{profile.organization}</td>
                        </tr>
                        <tr>
                            <th>Organization Email</th>
                            <td>{profile.email}</td>
</tr>
                        <tr>
                        
                            <th>Contact Person</th>
                            <td>{profile.contact_person}</td>
                        </tr>
                        <tr>
                            
                            <th>Contact Person Email</th>
                            <td>{profile.contact_person_email}</td>

                        </tr>
                        
                        <tr>
                        </tr>
                    </>
                    :

                    Object.entries(profile).map(([key,value])=>(
                        <tr key={key}>
                            <th>{key}</th>
                            <td>{value}</td>
                        </tr>
                        ))
                    }
                </tbody>
            </table>

            <div className="btn-group">
                <button onClick={()=>setEditOpen(true)} >
                    Update Profile
                </button>

                <button onClick={()=>setPasswordOpen(true)} >
                    Change Password
                </button>
            </div>
        </div>

    { editOpen &&

        <div className="modal">
            <form className="modal-box" onSubmit={updateProfile}>
                <h3>Edit Profile</h3>
                { role !== "CUSTOMER" &&
                <>
                    <input

name="first_name"

value={form.first_name}

onChange={handleChange}

placeholder="First Name"

/>


{errors.first_name &&
<p className="error-text">
{errors.first_name}
</p>
}




<input

name="last_name"

value={form.last_name}

onChange={handleChange}

placeholder="Last Name"

/>


{errors.last_name &&
<p className="error-text">
{errors.last_name}
</p>
}




<input

name="email"

value={form.email}

onChange={handleChange}

placeholder="Email"

/>


{errors.email &&
<p className="error-text">
{errors.email}
</p>
}




<input

name="contact"

value={form.contact}

onChange={handleChange}

placeholder="Contact"

maxLength="10"

minLength="10"

/>


{errors.contact &&
<p className="error-text">
{errors.contact}
</p>
}





<input

name="location"

value={form.location}

onChange={handleChange}

placeholder="Location"

/>





<input

name="department"

value={form.department}

onChange={handleChange}

placeholder="Department"

/>


{errors.department &&
<p className="error-text">
{errors.department}
</p>
}



</>

}





{
role === "CUSTOMER" &&

<>

<input

name="organization"

value={form.organization}

onChange={handleChange}

placeholder="Organization"

/>




<input

name="email"

value={form.email}

onChange={handleChange}

placeholder="Organization Email"

/>




<input

name="contact_person"

value={form.contact_person}

onChange={handleChange}

placeholder="Contact Person"

/>




<input

name="contact_person_email"

value={form.contact_person_email}

onChange={handleChange}

placeholder="Contact Person Email"

/>



</>

}





<div className="modal-actions">


<button

type="button"

onClick={()=>setEditOpen(false)}

>

Cancel

</button>




<button type="submit">

Save

</button>



</div>



</form>


</div>

}







{
passwordOpen &&


<div className="modal">


<form

className="modal-box"

onSubmit={changePassword}

>


<h3>
Change Password
</h3>




<div className="pass-field">


<input

type={
showPass.current
?
"text"
:
"password"
}

name="current_password"

value={form.current_password}

onChange={handleChange}

placeholder="Current Password"

required

/>



<span

onClick={()=>setShowPass({

...showPass,

current:
!showPass.current

})}

>


{
showPass.current
?
<EyeOff size={15}/>
:
<Eye size={15}/>
}

</span>


</div>





<div className="pass-field">


<input

type={
showPass.new
?
"text"
:
"password"
}

name="new_password"

value={form.new_password}

onChange={handleChange}

placeholder="New Password"

required

/>



<span

onClick={()=>setShowPass({

...showPass,

new:
!showPass.new

})}

>


{
showPass.new
?
<EyeOff size={15}/>
:
<Eye size={15}/>
}


</span>


</div>






<div className="pass-field">


<input

type={
showPass.confirm
?
"text"
:
"password"
}

name="confirm_password"

value={form.confirm_password}

onChange={handleChange}

placeholder="Confirm Password"

required

/>



<span

onClick={()=>setShowPass({

...showPass,

confirm:
!showPass.confirm

})}

>


{
showPass.confirm
?
<EyeOff size={15}/>
:
<Eye size={15}/>
}


</span>


</div>






<div className="modal-actions">


<button

type="button"

onClick={()=>setPasswordOpen(false)}

>

Cancel

</button>




<button type="submit">

Change Password

</button>



</div>


</form>


</div>

}



</div>

);

}

export default Profile;