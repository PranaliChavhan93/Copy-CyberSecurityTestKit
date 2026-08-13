
function StageProgress({ stage, onClick }) {
    const stages = [
        "INFO",
        "SCAN",
        "VULN",
        "EXPLOIT",
        "POST"
    ];

    const currentIndex = stages.indexOf(stage);

    return (
        <>
            <div className="stage-progress">
                {stages.map((item, index) => {
                    let status = "pending";

                    if (index < currentIndex) {
                        status = "completed";
                    } else if (index === currentIndex) {
                        status = "current";
                    }

                    return (
                        <span
                            key={item}
                            className={`stage-dot ${status}`}
                            title={item}
                            onClick={() => onClick(item)}
                        ></span>
                    );
                })}
            </div>

            <style>{`
                .stage-progress{
                    display:flex;
                    gap:15px;
                    align-items:center;
                    padding:15px 0;
                }

                .stage-dot{
                    width:18px;
                    height:18px;
                    border-radius:50%;
                    display:block;
                    cursor:pointer;
                }

                .stage-dot.completed{
                    background:#00c853;
                }

                .stage-dot.current{
                    background:#1976d2;
                }

                .stage-dot.pending{
                    background:#bdbdbd;
                }
            `}</style>
        </>
    );
}

export default StageProgress;
