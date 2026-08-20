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
    const [selectedSuite, setSelectedSuite] = useState(null);

    const [stage, setStage] = useState("");
    const [tool, setTool] = useState(null);

    const [parameters, setParameters] = useState({});
    const [selectedTool, setSelectedTool] = useState("");

    // ============================================================
    // NORMALIZE
    // ============================================================

    const normalize = (value) => {
        return String(value ?? "")
            .trim()
            .toUpperCase();
    };

    // ============================================================
    // STAGE NORMALIZATION
    //
    // ST001 -> INFO
    // ST002 -> SCAN
    // ST003 -> VULN
    // ST004 -> EXPLOIT
    // ST005 -> POST
    // ST006 -> COMPLETED
    // ============================================================

    const getStageCode = (value) => {
        const normalized = normalize(value);

        const stageMap = {
            INFO: "INFO",
            SCAN: "SCAN",
            VULN: "VULN",
            EXPLOIT: "EXPLOIT",
            POST: "POST",
            COMPLETED: "COMPLETED",

            ST001: "INFO",
            ST002: "SCAN",
            ST003: "VULN",
            ST004: "EXPLOIT",
            ST005: "POST",
            ST006: "COMPLETED",
        };

        return stageMap[normalized] || normalized;
    };

    // ============================================================
    // 1. FETCH SUITES
    // ============================================================

    useEffect(() => {
        const fetchSuites = async () => {
            try {
                const response = await fetch(
                    `${API}/master/suites/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.detail || "Failed to fetch suites"
                    );
                }

                if (Array.isArray(data)) {
                    setSuites(data);
                } else {
                    setSuites([]);
                }
            } catch (error) {
                console.error(
                    "Error fetching suites:",
                    error
                );

                setSuites([]);
            }
        };

        fetchSuites();
    }, []);

    // ============================================================
    // 2. FETCH PROJECT
    // ============================================================

    useEffect(() => {
        if (!projectId) return;

        const fetchProject = async () => {
            try {
                const response = await fetch(
                    `${API}/tester/projects/${projectId}/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw data;
                }

                setProject(data);
            } catch (error) {
                console.error(
                    "Error fetching project:",
                    error
                );

                setProject(null);
            }
        };

        fetchProject();
    }, [projectId]);

    // ============================================================
    // 3. MATCH SUITE FROM PROJECT
    // ============================================================

    useEffect(() => {
        if (!project || !suites.length) return;

        const projectType = normalize(
            project.project_type
        );

        const projectSuiteName = normalize(
            project.suite_name
        );

        const projectSuiteId = normalize(
            project.suite_id
        );

        const matchedSuite = suites.find((item) => {
            const suiteDatabaseId = normalize(item.id);
            const suiteCode = normalize(item.suite_id);
            const suiteName = normalize(item.suite_name);

            return (
                (
                    projectSuiteId &&
                    (
                        projectSuiteId === suiteDatabaseId ||
                        projectSuiteId === suiteCode
                    )
                ) ||
                (
                    projectSuiteName &&
                    projectSuiteName === suiteName
                ) ||
                (
                    projectType &&
                    (
                        projectType === suiteDatabaseId ||
                        projectType === suiteCode ||
                        projectType === suiteName
                    )
                )
            );
        });

        if (matchedSuite) {
            setSelectedSuite(matchedSuite);
            setSuite(String(matchedSuite.id));
        } else {
            setSelectedSuite(null);
            setSuite("");
        }
    }, [project, suites]);

    // ============================================================
    // 4. FETCH STAGES FOR SELECTED SUITE
    // ============================================================

    useEffect(() => {
        if (!suite) {
            setStages([]);
            setStage("");
            return;
        }

        const fetchStages = async () => {
            try {
                const response = await fetch(
                    `${API}/master/stages/?suite=${suite}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw data;
                }

                if (!Array.isArray(data)) {
                    setStages([]);
                    setStage("");
                    return;
                }

                setStages(data);

                // ------------------------------------------------
                // 1. STAGE FROM URL
                // ------------------------------------------------

                if (urlStage) {
                    const normalizedUrlStage =
                        getStageCode(urlStage);

                    const stageFromUrl = data.find(
                        (item) =>
                            getStageCode(item.stage_id) ===
                                normalizedUrlStage ||
                            normalize(item.id) ===
                                normalize(urlStage)
                    );

                    if (stageFromUrl) {
                        setStage(stageFromUrl.id);
                        return;
                    }
                }

                // ------------------------------------------------
                // 2. PROJECT CURRENT STAGE
                // ------------------------------------------------

                if (project?.current_stage) {
                    const normalizedProjectStage =
                        getStageCode(
                            project.current_stage
                        );

                    const currentStage = data.find(
                        (item) =>
                            getStageCode(item.stage_id) ===
                            normalizedProjectStage
                    );

                    if (currentStage) {
                        setStage(currentStage.id);
                        return;
                    }
                }

                // ------------------------------------------------
                // 3. FIRST STAGE BY ORDER
                // ------------------------------------------------

                if (data.length > 0) {
                    const orderedStages = [...data].sort(
                        (a, b) =>
                            (a.stage_order ?? 0) -
                            (b.stage_order ?? 0)
                    );

                    setStage(orderedStages[0].id);
                } else {
                    setStage("");
                }
            } catch (error) {
                console.error(
                    "Error fetching stages:",
                    error
                );

                setStages([]);
                setStage("");
            }
        };

        fetchStages();
    }, [suite, project, urlStage]);

    // ============================================================
    // 5. FETCH TOOLS FOR SUITE + STAGE
    // ============================================================

    useEffect(() => {
        if (!suite || !stage) {
            setTools([]);
            setTool(null);
            setSelectedTool("");
            return;
        }

        const fetchTools = async () => {
            try {
                const response = await fetch(
                    `${API}/master/tools/?suite=${suite}&stage=${stage}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw data;
                }

                if (!Array.isArray(data)) {
                    setTools([]);
                    setTool(null);
                    setSelectedTool("");
                    return;
                }

                setTools(data);

                if (data.length > 0) {
                    setTool(data[0]);
                    setSelectedTool(data[0].id);
                } else {
                    setTool(null);
                    setSelectedTool("");
                }
            } catch (error) {
                console.error(
                    "Error fetching tools:",
                    error
                );

                setTools([]);
                setTool(null);
                setSelectedTool("");
            }
        };

        fetchTools();
    }, [suite, stage]);

    // ============================================================
    // 6. FETCH TOOL PARAMETERS
    // ============================================================

    useEffect(() => {
        if (!tool?.id) {
            setParameters({});
            return;
        }

        const fetchParameters = async () => {
            try {
                const response = await fetch(
                    `${API}/tester/tool-parameters/?tool=${tool.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw data;
                }

                setParameters(data);
            } catch (error) {
                console.error(
                    "Error fetching tool parameters:",
                    error
                );

                setParameters({});
            }
        };

        fetchParameters();
    }, [tool]);

    // ============================================================
    // 7. UPDATE PROJECT STAGE
    // ============================================================

    const updateStage = async (newStage) => {
        if (!projectId || !newStage) {
            return false;
        }

        try {
            const normalizedStage =
                getStageCode(newStage);

            const response = await fetch(
                `${API}/tester/projects/${projectId}/stage/`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        stage: normalizedStage,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.error(
                    "Stage update failed:",
                    response.status,
                    data
                );

                return false;
            }

            setProject((prev) => ({
                ...prev,
                current_stage: normalizedStage,
            }));

            navigate(
                `/tester/testing/${projectId}/${normalizedStage}`,
                {
                    replace: true,
                }
            );

            return true;
        } catch (error) {
            console.error(
                "Error updating stage:",
                error
            );

            return false;
        }
    };

    // ============================================================
    // 8. BACK TO PROJECTS
    // ============================================================

    const handleBackToProjects = () => {
        navigate("/tester/testing");
    };

    // ============================================================
    // 9. ADVANCE TO NEXT STAGE
    // ============================================================

    const advanceStage = async () => {
        if (!stage || !stages.length) {
            return;
        }

        /*
         * Only the five actual testing stages are used.
         *
         * ST006 / COMPLETED is not treated as a sixth
         * progress dot.
         */
        const testingStages = stages
            .filter((item) => {
                const code = getStageCode(
                    item.stage_id
                );

                return [
                    "INFO",
                    "SCAN",
                    "VULN",
                    "EXPLOIT",
                    "POST",
                ].includes(code);
            })
            .sort(
                (a, b) =>
                    (a.stage_order ?? 0) -
                    (b.stage_order ?? 0)
            );

        const currentIndex =
            testingStages.findIndex(
                (item) =>
                    String(item.id) ===
                    String(stage)
            );

        if (currentIndex === -1) {
            console.error(
                "CURRENT STAGE NOT FOUND:",
                stage
            );

            return;
        }

        if (
            currentIndex >=
            testingStages.length - 1
        ) {
            console.log(
                "Already at final testing stage"
            );

            return;
        }

        const nextStage =
            testingStages[currentIndex + 1];

        const nextStageCode =
            getStageCode(
                nextStage.stage_id
            );

        const success =
            await updateStage(
                nextStageCode
            );

        if (success) {
            setStage(nextStage.id);
        }
    };

    // ============================================================
    // 10. CURRENT STAGE
    // ============================================================

    const currentStageObject = stages.find(
        (item) =>
            String(item.id) ===
            String(stage)
    );

    const currentStageCode = getStageCode(
        currentStageObject?.stage_id ||
            project?.current_stage ||
            urlStage ||
            "INFO"
    );

    // ============================================================
    // 11. HANDLE MANUAL STAGE CHANGE
    // ============================================================

    const handleStageChange = async (event) => {
        const selectedValue =
            event.target.value;

        const selectedStage =
            stages.find(
                (item) =>
                    String(item.id) ===
                    String(selectedValue)
            );

        if (!selectedStage) {
            return;
        }

        const selectedStageCode =
            getStageCode(
                selectedStage.stage_id
            );

        /*
         * Do not allow COMPLETED/ST006 to be
         * selected as a normal testing stage.
         */
        if (
            selectedStageCode ===
            "COMPLETED"
        ) {
            return;
        }

        const success =
            await updateStage(
                selectedStageCode
            );

        if (success) {
            setStage(selectedStage.id);
        }
    };

    // ============================================================
    // 12. HANDLE TOOL CHANGE
    // ============================================================

    const handleToolChange = (event) => {
        const selectedValue =
            event.target.value;

        const selected =
            tools.find(
                (item) =>
                    String(item.id) ===
                    String(selectedValue)
            );

        if (!selected) {
            setSelectedTool("");
            setTool(null);
            return;
        }

        setSelectedTool(selected.id);
        setTool(selected);
    };

    // ============================================================
    // 13. UI
    // ============================================================

    return (
        <div className="testing-page">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="testing-header">
                <h2>Testing Workspace</h2>

                <button
                    className="back-to-list-btn"
                    onClick={
                        handleBackToProjects
                    }
                >
                    ← Back to Projects
                </button>
            </div>

            {/* ==================================================
                PROJECT INFORMATION
            ================================================== */}

            {project && (
                <div className="project-info-box">
                    <h3>
                        Project Information
                    </h3>

                    <div className="project-details">

                        <div className="info-row">
                            <label>
                                Project ID
                            </label>

                            <span>
                                {
                                    project.project_id ||
                                    "N/A"
                                }
                            </span>
                        </div>

                        <div className="info-row">
                            <label>
                                Project Name
                            </label>

                            <span>
                                {
                                    project.project_name ||
                                    "N/A"
                                }
                            </span>
                        </div>

                        <div className="info-row">
                            <label>
                                Customer
                            </label>

                            <span>
                                {
                                    project.customer ||
                                    "N/A"
                                }
                            </span>
                        </div>

                        <div className="info-row">
                            <label>
                                Project Type
                            </label>

                            <span>
                                {
                                    selectedSuite?.suite_name ||
                                    project.suite_name ||
                                    "N/A"
                                }
                            </span>
                        </div>

                        <div className="info-row">
                            <label>
                                Priority
                            </label>

                            <span>
                                {
                                    project.priority ||
                                    "N/A"
                                }
                            </span>
                        </div>

                        <div className="info-row">
                            <label>
                                Deadline
                            </label>

                            <span>
                                {
                                    project.deadline ||
                                    "N/A"
                                }
                            </span>
                        </div>

                        <div className="info-row">
                            <label>
                                Current Stage
                            </label>

                            <span className="stage-badge">
                                {
                                    currentStageCode ||
                                    "N/A"
                                }
                            </span>
                        </div>

                    </div>
                </div>
            )}

            {/* ==================================================
                STAGE HEADER
            ================================================== */}

            <StageHeader
                stages={stages}
                currentStage={
                    currentStageCode
                }
            />

            {/* ==================================================
                SUITE / STAGE / TOOL CONTROLS
            ================================================== */}

            <div className="tool-control-box">

                {/* Suite */}

                <div className="field">
                    <label>
                        Suite
                    </label>

                    <select
                        value={suite}
                        disabled
                    >
                        {selectedSuite ? (
                            <option
                                value={String(
                                    selectedSuite.id
                                )}
                            >
                                {
                                    selectedSuite.suite_name
                                }
                            </option>
                        ) : (
                            <option value="">
                                Select Suite
                            </option>
                        )}
                    </select>
                </div>

                {/* Stage */}

                <div className="field">
                    <label>
                        Stage
                    </label>

                    <select
                        value={
                            stage || ""
                        }
                        onChange={
                            handleStageChange
                        }
                        disabled={
                            stages.length === 0
                        }
                    >
                        {stages.length === 0 ? (
                            <option value="">
                                No Stages Available
                            </option>
                        ) : (
                            stages
                                .filter(
                                    (item) =>
                                        getStageCode(
                                            item.stage_id
                                        ) !==
                                        "COMPLETED"
                                )
                                .map(
                                    (item) => (
                                        <option
                                            key={
                                                item.id
                                            }
                                            value={
                                                item.id
                                            }
                                        >
                                            {
                                                item.stage_name
                                            }
                                        </option>
                                    )
                                )
                        )}
                    </select>
                </div>

                {/* Tool */}

                <div className="field">
                    <label>
                        Tool
                    </label>

                    <select
                        value={
                            selectedTool ||
                            ""
                        }
                        onChange={
                            handleToolChange
                        }
                        disabled={
                            tools.length === 0
                        }
                    >
                        {tools.length === 0 ? (
                            <option value="">
                                No Tools Available
                            </option>
                        ) : (
                            <>
                                <option value="">
                                    Select Tool
                                </option>

                                {tools.map(
                                    (item) => (
                                        <option
                                            key={
                                                item.id
                                            }
                                            value={
                                                item.id
                                            }
                                        >
                                            {
                                                item.tool_name
                                            }
                                        </option>
                                    )
                                )}
                            </>
                        )}
                    </select>
                </div>

            </div>

        
            {tool && (
                <ToolParameters
                    tool={tool}
                    parameters={
                        parameters
                    }
                    setParameters={
                        setParameters
                    }
                    stageCode={
                        currentStageCode
                    }
                    onAdvanceStage={
                        advanceStage
                    }
                />
            )}

        </div>
    );
}

export default Testing;