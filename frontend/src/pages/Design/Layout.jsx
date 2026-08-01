import Sidebar from "./Sidebar";
import "./Layout.css";

import { useNavigate } from "react-router-dom";
import { CircleUserRound } from "lucide-react";
import { useState } from "react";

function Layout({ children }) {

  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false)

  const username = sessionStorage.getItem("username") || "";
  const role = sessionStorage.getItem("role");

  return (
    <div className={`layout ${collapsed ? "collapsed" : ""}`}>
      
      <Sidebar 
        collapsed = {collapsed}
        setCollapsed = {setCollapsed} 
      />

      <div className="main-content">
        <div className="top-navbar">
           <button
              className="menu-toggle"
              onClick={() => setCollapsed(!collapsed)}
          >
            ☰
          </button>

          <div className="profile-section">

            <div className="welcome-text">
              <p>Welcome,</p>
              <h4>{username}</h4>
              <span className="role-badge">{role}</span>
            </div>

            <div
              className="profile-logo"
              onClick={() => navigate("/profile")}
            >
              <i className="bi bi-person-fill"></i>
            </div>
          </div>
        </div>

        <div className="content">
          {children}
        </div>

      </div>

    </div>
  );
}

export default Layout;