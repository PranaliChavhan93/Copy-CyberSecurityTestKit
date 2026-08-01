import "./Testing.css";

function StageHeader({ stages, currentStage }) {
    return (
        <div className="stage-header">
            {
                stages.map((stage, index) => {
                    const active =
                        stage.stage_id === currentStage;
                    const currentIndex =
                        stages.findIndex(
                            s => s.stage_id === currentStage
                        );
                    const completed =
                        index < currentIndex;

                    return (
                        <div
                            key={stage.id}
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

                            {
                                index !== stages.length - 1 &&
                                (
                                    <div className="line"></div>
                                )
                            }
                        </div>
                    );
                })
            }
        </div>
    );
}

export default StageHeader;