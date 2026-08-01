import ProjectView from "../Master/ProjectView";

function AdminProjects()
{
    fetch('http://localhost:8000/admin/projects/')

    
    return(
        <div>
            <h1><ProjectView /></h1>
        </div>
    )
}

export default AdminProjects;