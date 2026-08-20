function StageProgress({ stage, onClick }) {
    const stages = [
        "INFO",
        "SCAN",
        "VULN",
        "EXPLOIT",
        "POST",
    ];

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

            // Stage names
            "INFORMATION GATHERING": "INFO",
            "SCANNING & ENUMERATION": "SCAN",
            "SCANNING AND ENUMERATION": "SCAN",
            "VULNERABILITY ASSESSMENT": "VULN",
            "EXPLOITATION": "EXPLOIT",
            "POST EXPLOITATION": "POST",
            "POST-EXPLOITATION": "POST",
        };

        return stageMap[normalized] || "INFO";
    };

    const normalizedStage = normalizeStage(stage);
    const currentIndex = stages.indexOf(normalizedStage);

    return (
        <>
            <div className="stage-progress">
                {stages.map((item, index) => {
                    let status = "pending";

                    // Previous stages = GREEN
                    if (index < currentIndex) {
                        status = "completed";
                    }

                    // Current stage = BLUE
                    else if (index === currentIndex) {
                        status = "current";
                    }

                    // Future stages = GREY
                    else {
                        status = "pending";
                    }

                    return (
                        <span
                            key={item}
                            className={`stage-dot ${status}`}
                            title={
                                index === currentIndex
                                    ? `${item} - Current Stage`
                                    : item
                            }
                            onClick={() => {
                                if (onClick) {
                                    onClick(item);
                                }
                            }}
                        />
                    );
                })}
            </div>

            <style>{`
                .stage-progress {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .stage-dot {
                    width: 12px;
                    height: 10px;
                    border-radius: 50%;
                    display: inline-block;
                    box-sizing: border-box;
                    background: #d1d5db;
                    transition: all 0.2s ease;
                }

                /* Previous stages */
                .stage-dot.completed {
                    background: #22c55e !important;
                    border-color: #22c55e !important;
                }

                /* CURRENT STAGE */
                .stage-dot.current {
                    background: #2563eb !important;
                    border: 2px solid #2563eb !important;
                }

                /* Opcomming stages */
                .stage-dot.pending {
                    background: #d1d5db !important;
                    border-color: #d1d5db !important;
                }
            `}</style>
        </>
    );
}

export default StageProgress;