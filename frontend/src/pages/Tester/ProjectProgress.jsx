
function ProjectProgress({currentStage}){
    const stages=[
        {
            id:"INFO",
            name:"Information Gathering"
        },
        {
            id:"SCAN",
            name:"Scanning"
        },
        {
            id:"VULN",
            name:"Vulnerability"
        },
        {
            id:"EXPLOIT",
            name:"Exploitation"
        },
        {
            id:"POST",
            name:"Post Exploitation"
        }
    ];

    const currentIndex =
    stages.findIndex(
        s=>s.id===currentStage
    );

return(
    <div className="progress-container">
    { 
        stages.map((stage,index)=>{
            let status="pending";
            if(index < currentIndex)
                status="completed";

            if(index === currentIndex)
                status="active";

            return(
                <div
                    className="progress-item"
                    key={stage.id}
                >
                    <div
                        className={`dot ${status}`}
                    >
                    </div>

                    <span>
                        {stage.name}
                    </span>
                </div>
            )
        })
    }
    </div>
    )
}

export default ProjectProgress;