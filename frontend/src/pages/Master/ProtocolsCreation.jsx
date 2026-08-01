
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./UIDesign.css";

function ProtocolCreation() {

    const navigate = useNavigate();
    
    const [form, setForm] = useState({
        protocol_id: "",
        protocol_name: "",
        protocol_category: "",
        protocol_type: "",
        protocol_desc: "",

        osi_layer: "",
        transport_protocol: "",
        default_ports: "",
        secure_ports: "",

        // Communication Details
        communication_model: "",
        used_in: "",
        used_by:"",
        purpose: "",
        // devices_using_it: "",

        // Technical Details
        data_format: "",
        packet_structure: "",
        protocol_authentication: "",
        encryption: "",
        standard_rfc: ""
    });

    const [errors, setErrors] = useState({
        protocol_name: "",
        // protocol_full_name: "",
        protocol_category: "",
        protocol_type: "",
        protocol_desc: "",

        osi_layer: "",
        transport_protocol: "",
        default_ports: "",
        secure_ports: "",

        communication_model: "",
        used_in: "",
        used_by: "",
        purpose: "",
        // devices_using_it: "",

        data_format: "",
        // packet_structure: "",
        protocol_authentication: "",
        encryption: "",
        standard_rfc: ""
    });

    const [protocolCategories, setProtocolCategories] = useState([]);
    const [protocolTypes, setProtocolTypes] = useState([]);
    const [osiLayers, setOsiLayers] = useState([]);
    const [transportProtocols, setTransportProtocols] = useState([]);
    const [communicationModels, setCommunicationModels] = useState([]);
    const [used_in, setused_in] = useState([]);
    const [used_by, setused_by] = useState([]);
    const [default_ports, setdefault_ports] = useState([]);
    const [protocolAuthentication, setProtocolAuthentication] = useState([]);
    const [encryption, setEncryption] = useState([]);
    const [standardRFC, setStandardRFC] = useState([]);

    const [protocolList, setProtocolList] = useState([]);

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [ categories, types, layers, transports, communication, used_in, used_by, format, authentication, encryption, standard ] = await Promise.all([

                    fetch("http://127.0.0.1:8000/master/protocols/categories/")
                    .then(res => res.json()),

                    fetch("http://127.0.0.1:8000/master/protocols/types/" )
                    .then(res => res.json()),

                    fetch("http://127.0.0.1:8000/master/protocols/osi-layers/" )
                    .then(res => res.json()),

                    fetch("http://127.0.0.1:8000/master/protocols/transport-protocols/" )
                    .then(res => res.json()),

                    fetch("http://127.0.0.1:8000/master/protocols/communication-models/" )
                    .then(res => res.json()),

                    fetch("http://127.0.0.1:8000/master/protocols/used-in/" )
                    .then(res => res.json()),

                    fetch("http://127.0.0.1:8000/master/protocols/used-by/" )
                    .then(res => res.json()),

                    fetch("http://127.0.0.1:8000/master/protocols/data-format/" )
                    .then(res => res.json()),

                    fetch("http://127.0.0.1:8000/master/protocols/protocol-authentication/" )
                    .then(res => res.json()),

                    fetch("http://127.0.0.1:8000/master/protocols/encryption/" )
                    .then(res => res.json()),

                    fetch("http://127.0.0.1:8000/master/protocols/standard-rfc/" )
                    .then(res => res.json())
                ]);

                setProtocolCategories(categories);
                setProtocolTypes(types);
                setOsiLayers(layers);
                setTransportProtocols(transports);
                setCommunicationModels(communication);
                setused_in(used_in);
                setused_by(used_by);
                setdefault_ports(format);
                setProtocolAuthentication(authentication);
                setEncryption(encryption);
                setStandardRFC(standard);
            }
            catch(error){
                console.log(
                    "Dropdown Loading Error:",
                    error
                );
                toast.error(
                    "Unable To Load Protocol Options"
                );
            }
        };
        fetchDropdownData();
    }, []);

    const validateField = (name, value) => {
        switch(name){
            case "protocol_name":
                if(!value.trim()){return "*Please Enter Protocol Name"}

                if(!/^[A-Za-z0-9 ]+$/.test(value.trim())){
                    return "*Only alphabets, numbers and spaces are allowed";
                }
                return "";

            case "protocol_category":
                return value
                    ? ""
                    : "*Please Select Protocol Category";

            case "protocol_type":
                return value
                    ? ""
                    : "*Please Select Protocol Type";

            case "osi_layer":
                return value
                    ? ""
                    : "*Please Select OSI Layer";

            case "transport_protocol":
                return value.trim()
                    ? ""
                    : "*Please Select Transport Protocol";

            case "default_ports":
                return value.trim()
                    ? ""
                    : "*Please Enter Default Port";

            case "protocol_desc":
                return value.trim()
                    ? ""
                    : "*Please Enter Protocol Description";

            default:
                return "";
        }
    };

    const handleChange = async (e) => {
        const { name, value } = e.target;
        let updatedForm = {
            ...form,
            [name]: value
        };

        if (name === "protocol_category") {
            const res = await fetch(
                `http://127.0.0.1:8000/master/protocols/by-category/?category=${value}`
            );
            const data = await res.json();
            setProtocolList(data);
            updatedForm.protocol_name = "";
        }
        setForm(updatedForm);
        setErrors(prev => ({
            ...prev,
            [name]: validateField(name, value)
        }));
    };

    const handleProtocolChange = async (e) => {
        const id = e.target.value;
        const res = await fetch(
            `http://127.0.0.1:8000/master/protocols/details/${id}/`
        );
        const protocol = await res.json();

        setForm({
            ...form,
            protocol_name: protocol.protocol_name,
            protocol_category: protocol.protocol_category,
            protocol_type: protocol.protocol_type,
            protocol_desc: protocol.protocol_desc,

            osi_layer: protocol.osi_layer,
            transport_protocol: protocol.transport_protocol,
            default_ports: protocol.default_ports,
            secure_ports: protocol.secure_ports,

            communication_model: protocol.communication_model,
            used_in: protocol.used_in,
            purpose: protocol.purpose,
            // devices_using_it: protocol.devices_using_it,

            data_format: protocol.data_format,
            packet_structure: protocol.packet_structure,
            protocol_authentication: protocol.protocol_authentication,
            encryption: protocol.encryption,
            standard_rfc: protocol.standard_rfc

        });
    };

    const validateForm = () => {
        const newErrors = {};

        Object.keys(form).forEach((key)=>{
            if(key === "protocol_id"){
                return;
            }

            const error = validateField(
                key,
                form[key]
            );

            if(error){
                newErrors[key] = error;
            }
        });
        return newErrors;
    };

    const handleSubmit = (e)=>{
        e.preventDefault();
        const newErrors = validateForm();

        if(Object.keys(newErrors).length > 0){
            setErrors(newErrors);
            return;
        }

        fetch( "http://127.0.0.1:8000/master/protocols/create/",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify(form)
            }
        )
        .then(res=>{
            if(!res.ok){
                throw new Error(
                    "Failed To Create Protocol"
                );
            }
            return res.json();
        })
        .then(()=>{
            toast.success(
                "Protocol Created Successfully"
            );
            navigate(
                "/master/protocols"
            );
        })
        .catch(error=>{
            console.log(error);
            toast.error(
                "Unable To Create Protocol"
            );
        });
    };
        
    return (
        <div className="user-create-container">
            <form className="user-form-container" onSubmit={handleSubmit} >
                <h2>Add Protocol</h2>
                <hr />

                <div className="form-row">
                    <div className="form-group">
                        <label>Protocol Name</label>
                        <input
                            type="text"
                            name="protocol_name"
                            value={form.protocol_name}
                            onChange={handleChange}
                        />
                        { errors.protocol_name &&
                            <p className="error-text">
                                {errors.protocol_name}
                            </p>
                        }
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Protocol Category</label>
                        <select
                            name="protocol_category"
                            value={form.protocol_category}
                            onChange={handleChange}
                        >
                            <option value="">Select Category</option>
                            {
                                protocolCategories.map(item=>(
                                    <option
                                        key={item.id}
                                        value={item.value}
                                        >
                                        {item.name}
                                    </option>
                                ))
                            }
                        </select>
                        { errors.protocol_category &&
                            <p className="error-text">
                                {errors.protocol_category}
                            </p>
                        }
                    </div>

                    <div className="form-group">
                        <label>Protocol Type</label>
                        <select
                            name="protocol_type"
                            value={form.protocol_type}
                            onChange={handleChange}
                        >
                            <option value="">Select Type</option>
                            { protocolTypes.map(item=>(
                                    <option
                                        key={item.id}
                                        value={item.value}
                                    >
                                        {item.name}
                                    </option>
                                ))
                            }
                        </select>
                        { errors.protocol_type &&
                            <p className="error-text">
                                {errors.protocol_type}
                            </p>
                        }
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>OSI Layer</label>
                        <select
                            name="osi_layer"
                            value={form.osi_layer}
                            onChange={handleChange}
                        >
                            <option value="">Select OSI Layer</option>
                            { osiLayers.map(item => (
                                    <option key={item.id} value={item.value} >
                                        {item.name}
                                    </option>
                                ))
                            }
                        </select>
                        { errors.osi_layer && 
                            <p className="error-text">
                                {errors.osi_layer}
                            </p>
                        }
                    </div>

                    <div className="form-group">
                        <label>Transport Protocol</label>
                        <select
                            name="transport_protocol"
                            value={form.transport_protocol}
                            onChange={handleChange}
                        >
                            <option value="">Select Transport Protocol</option>
                            { transportProtocols.map(item=>(
                                    <option key={item.id} value={item.value} >
                                        {item.name}
                                    </option>
                                ))
                            }
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Default Port(s)</label>
                        <input
                            type="text"
                            name="default_ports"
                            value={form.default_ports}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Secure Port(s)</label>
                        <input
                            type="text"
                            name="secure_ports"
                            value={form.secure_ports}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Communication Model</label>
                        <select
                            name="communication_model"
                            value={form.communication_model}
                            onChange={handleChange}
                        >
                            <option value=""> Select Communication Model </option>
                            { communicationModels.map ( item => (
                                    <option key={item.id} value={item.value} >
                                        {item.name}
                                    </option>
                                ))
                            }
                        </select>
                    </div>

                        <div className="form-group">
                            <label>Used In</label>
                            <select
                                name="used_in"
                                value={form.used_in}
                                onChange={handleChange}
                            >
                                <option value=""> Select Used In </option>
                                { used_in.map ( item => (
                                        <option key={item.id} value={item.value} >
                                            {item.name}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">

                            <label>Used By</label>
                            <select
                                name="used_by"
                                value={form.used_by}
                                onChange={handleChange}
                            >
                                <option value=""> Select Used By </option>
                                { used_by.map ( item => (
                                        <option key={item.id} value={item.value} >
                                            {item.name}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>

                        <div className="form-group">
                        <label>Data Format</label>
                        <select
                            name="standard_rfc"
                            value={form.standard_rfc}
                            onChange={handleChange}
                        >
                            {default_ports.map(item=>(
                                <option
                                key={item.id}
                                value={item.value}
                                >
                                {item.name}
                                </option>
                                ))
                            }
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Authentication</label>
                        <input
                            type="text"
                            name="protocol_authentication"
                            value={form.protocol_authentication}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Encryption</label>
                        <input
                            type="text"
                            name="encryption"
                            value={form.encryption}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Standard / RFC</label>
                        <input
                            type="text"
                            name="standard_rfc"
                            value={form.standard_rfc}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Protocol Description</label>

                    <textarea
                        name="protocol_desc"
                        rows="6"
                        value={form.protocol_desc}
                        onChange={handleChange}
                    />
                    { errors.protocol_desc &&
                        <p className="error-text">
                            {errors.protocol_desc}
                        </p>
                    }
                </div>

                <div className="button-group">
                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={() =>
                            navigate("/master/protocols")
                        }
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="submit-btn"
                    >
                        Create Protocol
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ProtocolCreation;