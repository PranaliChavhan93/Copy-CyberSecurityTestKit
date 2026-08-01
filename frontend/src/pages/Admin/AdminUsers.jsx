import UserView from "../Master/UserView";

function AdminUsers()
{
    fetch('http://localhost:8000/admin/user/')
    return(
        <div>
            <h1><UserView /></h1>
        </div>
    )
}

export default AdminUsers;