import { useEffect, useState } from "react";
import StageHeader from "./StageHeader";
import ToolParameters from "./ToolParameter/ToolParameters";
import { useParams, useNavigate } from "react-router-dom";
import "./Testing.css";

function Testing() {
    const { projectId, stage: urlStage } = useParams();
    const navigate = useNavigate();

    const API = "http://127.0.0.1:8000";
    const token = sessionStorage.getItem("access");

    const [project, setProject] = useState(null);

    const [suites, setSuites] = useState([]);
    const [stages, setStages] = useState([]);
    const [tools, setTools] = useState([]);

    const [suite, setSuite] = useState("");
    const [stage, setStage] = useState("");
    const [tool, setTool] = useState(null);

    const [parameters, setParameters] = useState({});
    const [selectedTool, setSelectedTool] = useState("");

    useEffect(() => {
        if (!projectId) return;

        fetch(`${API}/tester/projects/${projectId}/`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
            .then(async (res) => {
                const data = await res.json();

                if (!res.ok) throw data;

                return data;
            })
            .then((data) => {
                setProject(data);

                if (data.suite_id) {
                    setSuite(data.suite_id);
                }
            })
            .catch((err) => console.log(err));
    }, [projectId]);

    useEffect(() => {
        if (!project) return;

        fetch(
            `${API}/master/suites/?name=${project.project_type}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setSuites(data);

                    if (!suite && data.length > 0) {
                        setSuite(data[0].id);
                    }
                } else {
                    setSuites([]);
                }
            })
            .catch((err) => console.log(err));
    }, [project]);

    useEffect(() => {
        if (!suite) return;

        fetch(
            `${API}/master/stages/?suite=${suite}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setStages(data);

                    if (urlStage) {
                        const stageFromUrl = data.find(
                            (s) => s.stage_id === urlStage
                        );
                        if (stageFromUrl) {
                            setStage(stageFromUrl.id);
                            return;
                        }
                    }

                    if (project?.current_stage) {
                        const current = data.find(
                            (s) => s.stage_id === project.current_stage
                        );
                        if (current) {
                            setStage(current.id);
                            return;
                        }
                    }

                    if (data.length > 0) {
                        setStage(data[0].id);
                    }
                } else {
                    setStages([]);
                }
            })
            .catch((err) => console.log(err));
    }, [suite, project, urlStage]);

    useEffect(() => {
        if (!suite || !stage) return;

        fetch(
            `${API}/master/tools/?suite=${suite}&stage=${stage}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setTools(data);

                    if (data.length > 0) {
                        setTool(data[0]);
                        setSelectedTool(data[0].id);
                    } else {
                        setTool(null);
                    }
                } else {
                    setTools([]);
                    setTool(null);
                }
            })
            .catch((err) => console.log(err));
    }, [suite, stage]);

    useEffect(() => {
        if (!tool) return;

        fetch(
            `${API}/tester/tool-parameters/?tool=${tool.id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
            .then((res) => res.json())
            .then((data) => {
                console.log(tool);
                setParameters(data);
            })
            .catch((err) => console.log(err));
    }, [tool]);

    const updateStage = async (newStage) => {
        try {
            await fetch(
                `${API}/projects/${projectId}/stage/`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        stage: newStage,
                    }),
                }
            );

            setProject((prev) => ({
                ...prev,
                current_stage: newStage,
            }));

            navigate(`/tester/testing/${projectId}/${newStage}`, { replace: true });

        } catch (error) {
            console.error("Error updating stage:", error);
        }
    };

    const handleBackToProjects = () => {
        navigate('/tester/testing');
    };

    const advanceStage = () => {
        const current = stages.find((s) => s.id === stage);
        if (!current) return;

        const ordered = [...stages].sort(
            (prev, next) => (prev.stage_order ?? 0) - (next.stage_order ?? 0)
        );
        const currentIndex = ordered.findIndex((s) => s.id === current.id);

        if (currentIndex === -1 || currentIndex === ordered.length - 1) {
            return;
        }

        const next = ordered[currentIndex + 1];
        setStage(next.id);
        updateStage(next.stage_id);
    };

    const currentStageCode = stages.find((prev) => prev.id === stage)?.stage_id;

    return (
        <div className="testing-page">
            <div className="testing-header">
                <h2>Testing Workspace</h2>
                <button 
                    className="back-to-list-btn"
                    onClick={handleBackToProjects}
                >
                    ← Back to Projects
                </button>
            </div>

            {project && (
                <div className="project-info-box">
                    <h3>Project Information</h3>

                    <div className="project-details">
                        <div className="info-row">
                            <label>Project ID</label>
                            <span>{project.project_id}</span>
                        </div>

                        <div className="info-row">
                            <label>Project Name</label>
                            <span>{project.project_name}</span>
                        </div>

                        <div className="info-row">
                            <label>Customer</label>
                            <span>{project.customer}</span>
                        </div>

                        <div className="info-row">
                            <label>Project Type</label>
                            <span>{project.project_type}</span>
                        </div>

                        <div className="info-row">
                            <label>Priority</label>
                            <span>{project.priority}</span>
                        </div>

                        <div className="info-row">
                            <label>Deadline</label>
                            <span>{project.deadline}</span>
                        </div>

                        {/* NEW: Added current stage display */}
                        <div className="info-row">
                            <label>Current Stage</label>
                            <span className="stage-badge">
                                {stages.find((s) => s.id === stage)?.stage_id || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <StageHeader
                stages={stages}
                currentStage={
                    stages.find((s) => s.id === stage)?.stage_id
                }
            />

            <div className="tool-control-box">

                <div className="field">
                    <label>Suite</label>
                
                    <select value={suite} disabled>
                        {suites.map((item) => (
                            <option
                                key={item.id}
                                value={item.id}
                            >
                                {item.suite_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="field">
                    <label>Stage</label>

                    <select
                        value={stage}
                        onChange={(e) => {
                            const selectedStage = Number(e.target.value);
                            setStage(selectedStage);
                            const stageData = stages.find(
                                s => s.id === selectedStage
                            );
                            if (stageData) {
                                updateStage(stageData.stage_id);
                            }
                        }}
                    >
                        {stages.map((item) => (
                            <option
                                key={item.id}
                                value={item.id}
                            >
                                {item.stage_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="field">
                    <label>Tool</label>

                    <select
                        value={selectedTool}
                        onChange={(e) => {
                            const id = Number(e.target.value);
                            setSelectedTool(id);
                            const selected = tools.find(
                                t => t.id === id
                            );
                            setTool(selected);
                        }}
                    >
                        <option value="">
                            Select Tool
                        </option>

                        {tools.map((item) => (
                            <option
                                key={item.id}
                                value={item.id}
                            >
                                {item.tool_name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {tool && (
                <ToolParameters
                    tool={tool}
                    parameters={parameters}
                    setParameters={setParameters}
                    stageCode={currentStageCode}
                    onAdvanceStage={advanceStage}
                />
            )}
        </div>
    );
}

export default Testing;
