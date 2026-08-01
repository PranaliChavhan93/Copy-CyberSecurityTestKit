import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { menuConfig } from "./MenuConfig";
import "./Sidebar.css";

function Sidebar( { collapsed } ) {
  const role = sessionStorage.getItem("role");
  const menu = menuConfig[role] || [];
  const navigate = useNavigate();

  const [openIndex, setOpenIndex] = useState(null);

  const toggleSubmenu = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const renderMenu = (items) => {
    return items.map((item, index) => (
      <div key={index}>

        <div
          className="menu-item"
          onClick={() => {
            if (item.children) {
              toggleSubmenu(index);
            } 
            else if (item.path) {
              navigate(item.path);
            }
          }}
        >

          {item.icon}

          {!collapsed && (
            <span>{item.label}</span>
          )}

        </div>


        {item.children && openIndex === index && !collapsed && (
          <div className="submenu">
            {renderMenu(item.children)}
          </div>
        )}

      </div>
    ));
  };

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>

      <div className="sidebar-top">

        <div className="logo">
          {!collapsed && <h2>Cybersecurity TestKit</h2>}
        </div>


        <div className="menu">
          {renderMenu(menu)}
        </div>


      </div>


      <div className="logout">
        <button
          onClick={() => {
            sessionStorage.clear();
            window.location.href = "/";
          }}
        >
          {collapsed ? "⏻" : "Logout"}
        </button>
      </div>


    </div>
  );
}

export default Sidebar;