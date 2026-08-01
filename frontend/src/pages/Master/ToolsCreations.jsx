
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import "./UIDesign.css";
// import Suites from "./Suites";

// function ToolsCreation(){
//     const navigate = useNavigate();
//     const [form,setForm] = useState({
//         tool_name:"",
//         tool_category:"",
//         tool_desc:"",
//         suite:"",
//         stage:"",
//         tool_status:true
//     });

//     const [suites,setSuites] = useState([]);
//     const [stages,setStages] = useState([]);

//     const [errors,setErrors]=useState({});

//     useEffect(()=>{
//         const loadData = async()=>{
//             try{
//                 const [suiteRes,stageRes] = await Promise.all([
//                     fetch( "http://127.0.0.1:8000/master/suites/" )
//                     .then(res=>res.json()),
//                     fetch( "http://127.0.0.1:8000/master/stages/" )
//                     .then(res=>res.json())
//                 ]);

//                 setSuites(suiteRes);
//                 setStages(stageRes);
//             }
//             catch(error){
//                 console.log(error);
//                 toast.error(
//                     "Unable To Load Data"
//                 );
//             }
//         };
//         loadData();
//     },[]);

//     const handleChange = (e) => {
//         const { name, value } = e.target;

//         setForm(prev => ({
//             ...prev,
//             [name]: value
//         }));

//         setErrors(prev => ({
//             ...prev,
//             [name]: ""
//         }));
//     };

//     const validateForm=()=>{
//         let error={};

//         if(!form.tool_name)
//             error.tool_name="*Please Enter Tool Name";

//         if(!form.tool_category)
//             error.tool_category="*Please Select Tool Category";

//         if(!form.suite)
//             error.suite="*Please Select Suite";

//         if(!form.stage)
//             error.stage="*Please Select Stage";

//          if(!form.tool_desc)
//             error.tool_desc="*Please Enter Tool Description";

//         return error;
//     };

//     const handleSubmit=(e)=>{
//         e.preventDefault();
//         const validation=validateForm();
//         if(Object.keys(validation).length){
//             setErrors(validation);
//             return;
//         }

//         fetch( "http://127.0.0.1:8000/master/tools/create/",
//         {
//             method:"POST",
//             headers:{
//                 "Content-Type":"application/json"
//             },
//             body:JSON.stringify(form)
//         })
//         .then(res=>{
//             if(!res.ok)
//                 throw Error();

//             return res.json();
//         })
//         .then(()=>{
//             toast.success( "Tool Added Successfully" );

//             navigate("/master/tools");
//         })
//         .catch(()=>{
//             toast.error( "Unable To Add Tool" );
//         });
//     };


//     return(
//         <div className="user-create-container">
//             <form className="user-form-container" onSubmit={handleSubmit} >
//                 <h2>Add Tool</h2>
//                 <hr/>

//                 <div className="form-row">
//                     <div className="form-group">
//                         <label>Tool Name</label>
//                         <input
//                             type="text"
//                             name="tool_name"
//                             value={form.tool_name}
//                             onChange={handleChange}
//                         />
//                             <p className="error-text">
//                             {errors.tool_name}
//                             </p>
//                     </div>

//                     <div className="form-group">
//                         <label> Tool Category </label>
//                         <select
//                             name="tool_category"
//                             value={form.tool_category}
//                             onChange={handleChange}
//                         >
//                             <option value=""> Select Category </option>
//                             <option value="SOFTWARE"> Software Tool </option>
//                             <option value="HARDWARE"> Hardware Tool </option>
//                         </select>

//                         <p className="error-text">
//                             {errors.tool_category}
//                         </p>
//                     </div>
//                 </div>

//                 <div className="form-row">
//                     <div className="form-group">
//                         <label>Suite</label>
//                         <select
//                             name="suite"
//                             value={form.suite}
//                             onChange={handleChange}
//                         >
//                             <option value=""> Select Suite </option>
//                             { suites.map(item=>(
//                                 <option
//                                     key={item.id}
//                                     value={item.id}
//                                 >
//                                 {item.suite_name}
//                                 </option>
//                             ))
//                         }
//                         </select>

//                         <p className="error-text">
//                             {errors.suite}
//                         </p>
//                     </div>

//                     <div className="form-group">
//                         <label>Stage</label>
//                         <select
//                             name="stage"
//                             value={form.stage}
//                             onChange={handleChange}
//                         >
//                             <option value="">Select Stage</option>
//                             {
//                                 stages.map(item=>(
//                                 <option
//                                     key={item.id}
//                                     value={item.id}
//                                 >
//                                     {item.stage_name}
//                                 </option>
//                                 ))
//                             }
//                         </select>
//                         <p className="error-text">
//                             {errors.stage}
//                         </p>
//                     </div>
//                 </div>

//                 <div className="form-group">
//                     <label>Tool Description</label>

//                     <textarea
//                         name="tool_desc"
//                         rows="6"
//                         value={form.tool_desc}
//                         onChange={handleChange}
//                     />
//                     <p className="error-text">
//                         {errors.tool_desc}
//                     </p>
//                 </div>

//                 <div className="button-group">
//                     <button
//                         type="button"
//                         className="cancel-btn"
//                         onClick={()=>navigate("/master/tools")}
//                     >
//                         Cancel
//                     </button>

//                     <button
//                         type="submit"
//                         className="submit-btn"
//                     >
//                         Add Tool
//                     </button>
//                 </div>
//             </form>
//         </div>
//     )
// }

// export default ToolsCreation;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./UIDesign.css";
import Suites from "./Suites";

function ToolsCreation(){
    const navigate = useNavigate();
    const [form,setForm] = useState({
        tool_name:"",
        tool_category:"",
        tool_desc:"",
        suite:"",
        stage:"",
        tool_status:true
    });

    const [suites,setSuites] = useState([]);
    const [stages,setStages] = useState([]);

    const [errors,setErrors]=useState({});

    useEffect(()=>{
        const loadData = async()=>{
            try{
                const token = sessionStorage.getItem("access");
                const authHeaders = { "Authorization": `Bearer ${token}` };

                const [suiteRes,stageRes] = await Promise.all([
                    fetch( "http://127.0.0.1:8000/master/suites/", { headers: authHeaders } )
                    .then(res=>res.json()),
                    fetch( "http://127.0.0.1:8000/master/stages/", { headers: authHeaders } )
                    .then(res=>res.json())
                ]);

                setSuites(suiteRes);
                setStages(stageRes);
            }
            catch(error){
                console.log(error);
                toast.error(
                    "Unable To Load Data"
                );
            }
        };
        loadData();
    },[]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));

        setErrors(prev => ({
            ...prev,
            [name]: ""
        }));
    };

    const validateForm=()=>{
        let error={};

        if(!form.tool_name)
            error.tool_name="*Please Enter Tool Name";

        if(!form.tool_category)
            error.tool_category="*Please Select Tool Category";

        if(!form.suite)
            error.suite="*Please Select Suite";

        if(!form.stage)
            error.stage="*Please Select Stage";

         if(!form.tool_desc)
            error.tool_desc="*Please Enter Tool Description";

        return error;
    };

    const handleSubmit=(e)=>{
        e.preventDefault();
        const validation=validateForm();
        if(Object.keys(validation).length){
            setErrors(validation);
            return;
        }

        const token = sessionStorage.getItem("access");

        fetch( "http://127.0.0.1:8000/master/tools/create/",
        {
            method:"POST",
            headers:{
                "Authorization": `Bearer ${token}`,
                "Content-Type":"application/json"
            },
            body:JSON.stringify(form)
        })
        .then(res=>{
            if(!res.ok)
                throw Error();

            return res.json();
        })
        .then(()=>{
            toast.success( "Tool Added Successfully" );

            navigate("/master/tools");
        })
        .catch(()=>{
            toast.error( "Unable To Add Tool" );
        });
    };


    return(
        <div className="user-create-container">
            <form className="user-form-container" onSubmit={handleSubmit} >
                <h2>Add Tool</h2>
                <hr/>

                <div className="form-row">
                    <div className="form-group">
                        <label>Tool Name</label>
                        <input
                            type="text"
                            name="tool_name"
                            value={form.tool_name}
                            onChange={handleChange}
                        />
                            <p className="error-text">
                            {errors.tool_name}
                            </p>
                    </div>

                    <div className="form-group">
                        <label> Tool Category </label>
                        <select
                            name="tool_category"
                            value={form.tool_category}
                            onChange={handleChange}
                        >
                            <option value=""> Select Category </option>
                            <option value="SOFTWARE"> Software Tool </option>
                            <option value="HARDWARE"> Hardware Tool </option>
                        </select>

                        <p className="error-text">
                            {errors.tool_category}
                        </p>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Suite</label>
                        <select
                            name="suite"
                            value={form.suite}
                            onChange={handleChange}
                        >
                            <option value=""> Select Suite </option>
                            { suites.map(item=>(
                                <option
                                    key={item.id}
                                    value={item.id}
                                >
                                {item.suite_name}
                                </option>
                            ))
                        }
                        </select>

                        <p className="error-text">
                            {errors.suite}
                        </p>
                    </div>

                    <div className="form-group">
                        <label>Stage</label>
                        <select
                            name="stage"
                            value={form.stage}
                            onChange={handleChange}
                        >
                            <option value="">Select Stage</option>
                            {
                                stages.map(item=>(
                                <option
                                    key={item.id}
                                    value={item.id}
                                >
                                    {item.stage_name}
                                </option>
                                ))
                            }
                        </select>
                        <p className="error-text">
                            {errors.stage}
                        </p>
                    </div>
                </div>

                <div className="form-group">
                    <label>Tool Description</label>

                    <textarea
                        name="tool_desc"
                        rows="6"
                        value={form.tool_desc}
                        onChange={handleChange}
                    />
                    <p className="error-text">
                        {errors.tool_desc}
                    </p>
                </div>

                <div className="button-group">
                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={()=>navigate("/master/tools")}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="submit-btn"
                    >
                        Add Tool
                    </button>
                </div>
            </form>
        </div>
    )
}

export default ToolsCreation;