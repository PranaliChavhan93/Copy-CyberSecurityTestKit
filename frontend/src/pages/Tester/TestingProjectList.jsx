// TestingProjectList.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Testing.css";

function TestingProjectList() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProject, setSelectedProject] = useState("");

    const API = "http://127.0.0.1:8000";
    const token = sessionStorage.getItem("access");

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API}/tester/projects/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Session expired. Please login again.");
                }
                throw new Error("Failed to fetch projects");
            }

            const data = await response.json();
            
            // Fetch current stage for each project
            const projectsWithStage = await Promise.all(
                data.map(async (project) => {
                    try {
                        const stageResponse = await fetch(`${API}/tester/projects/${project.project_id}/`, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                            },
                        });
                        if (stageResponse.ok) {
                            const stageData = await stageResponse.json();
                            return {
                                ...project,
                                current_stage: stageData.current_stage || 'SCAN' // Default to SCAN if not set
                            };
                        }
                        return {
                            ...project,
                            current_stage: 'SCAN'
                        };
                    } catch (error) {
                        return {
                            ...project,
                            current_stage: 'SCAN'
                        };
                    }
                })
            );

            setProjects(projectsWithStage);
            setError(null);
        } catch (err) {
            console.error("Error fetching projects:", err);
            setError(err.message || "Failed to load projects");
        } finally {
            setLoading(false);
        }
    };

    const handleProjectSelect = (e) => {
        const projectId = e.target.value;
        setSelectedProject(projectId);
    };

    const handleStartTesting = () => {
        if (selectedProject) {
            // Find the selected project to get its current stage
            const project = projects.find(p => p.project_id === selectedProject);
            const stage = project?.current_stage || 'SCAN';
            
            // Navigate with project ID and stage
            navigate(`/tester/testing/${selectedProject}/${stage}`);
        }
    };

    if (error) {
        return (
            <div className="testing-project-list">
                <div className="error-container">
                    <p className="error-text">{error}</p>
                    <button onClick={fetchProjects} className="retry-btn">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="testing-project-list">
            <div className="project-select-card">
                <h2>Select Project for Testing</h2>
                <p className="subtitle">
                    Choose a project to start testing
                </p>

                {projects.length === 0 ? (
                    <div className="no-projects">
                        <p>No projects assigned to you.</p>
                        <p className="sub-text">Please contact your manager for project assignments.</p>
                    </div>
                ) : (
                    <>
                        <div className="form-group">
                            <label htmlFor="projectSelect">Project</label>
                            <select
                                id="projectSelect"
                                value={selectedProject}
                                onChange={handleProjectSelect}
                                className="project-select"
                            >
                                <option value="">-- Select a Project --</option>
                                {projects.map((project) => (
                                    <option 
                                        key={project.project_id} 
                                        value={project.project_id}
                                    >
                                        {project.project_name} - {project.project_id}
                                        {project.priority && ` (${project.priority})`}
                                        {project.current_stage && ` | Stage: ${project.current_stage}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={handleStartTesting}
                            className="start-testing-btn"
                            disabled={!selectedProject}
                        >
                            Start Testing
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default TestingProjectList;