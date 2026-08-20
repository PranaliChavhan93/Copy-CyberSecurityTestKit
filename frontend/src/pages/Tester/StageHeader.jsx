import "./Testing.css";

function StageHeader({ stages = [], currentStage }) {
    const normalizeStage = (value) => {
        const normalized = String(value ?? "")
            .trim()
            .toUpperCase();

        const stageMap = {
            // Stage codes
            INFO: "INFO",
            SCAN: "SCAN",
            VULN: "VULN",
            EXPLOIT: "EXPLOIT",
            POST: "POST",

            // Database stage IDs
            ST001: "INFO",
            ST002: "SCAN",
            ST003: "VULN",
            ST004: "EXPLOIT",
            ST005: "POST",

            // Full stage names
            "INFORMATION GATHERING": "INFO",
            "SCANNING & ENUMERATION": "SCAN",
            "SCANNING AND ENUMERATION": "SCAN",
            "VULNERABILITY ASSESSMENT": "VULN",
            "EXPLOITATION": "EXPLOIT",
            "POST EXPLOITATION": "POST",
            "POST-EXPLOITATION": "POST",
        };

        return stageMap[normalized] || normalized;
    };

    const normalizedCurrentStage =
        normalizeStage(currentStage);

    /*
     * Find the current stage using either:
     * stage_id or normalized stage code.
     */
    const currentIndex = stages.findIndex((stage) => {
        const stageId = normalizeStage(
            stage.stage_id
        );

        const stageCode = normalizeStage(
            stage.stage_code
        );

        const stageName = normalizeStage(
            stage.stage_name
        );

        return (
            stageId === normalizedCurrentStage ||
            stageCode === normalizedCurrentStage ||
            stageName === normalizedCurrentStage
        );
    });

    return (
        <div className="stage-header">
            {stages.map((stage, index) => {
                const stageId = normalizeStage(
                    stage.stage_id
                );

                const stageCode = normalizeStage(
                    stage.stage_code
                );

                const stageName = normalizeStage(
                    stage.stage_name
                );

                const active =
                    stageId ===
                        normalizedCurrentStage ||
                    stageCode ===
                        normalizedCurrentStage ||
                    stageName ===
                        normalizedCurrentStage ||
                    index === currentIndex;

                const completed =
                    currentIndex !== -1 &&
                    index < currentIndex;

                return (
                    <div
                        key={
                            stage.id ||
                            stage.stage_id ||
                            stage.stage_code ||
                            index
                        }
                        className="stage-item"
                    >
                        <div
                            className={
                                completed
                                    ? "circle completed"
                                    : active
                                    ? "circle active"
                                    : "circle"
                            }
                        >
                            {index + 1}
                        </div>

                        <span>
                            {stage.stage_name}
                        </span>

                        {index !==
                            stages.length - 1 && (
                            <div className="line"></div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default StageHeader;