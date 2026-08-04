export const menuConfig = {
  
  MASTER : [
    { label : "Dashboard", path : "/master" },
    {
      label: "Master",
      children: [
        { label : "Master Roles", path : "/user/view" },
        { label : "Master Projects", path : "/projects" }, 
        { label : "Master Suites", path : "/master/suites" },
        { label : "Master Tools", path : "/master/tools" },
        { label : "Master Protocol", path : "/master/protocols" },
        { label : "Master Report", path : "/master/reports" },
      ],
    },
  ],

  ADMIN : [
    { label : "Dashboard", path : "/admin" },
    { label : "Role Management", path : "/admin/user" },
    { label : "Projects", path : "/admin/projects" },
    { label : "Support Admin", path : "/admin/support-admin" },
    { label : "Reports", path : "/admin/reports" },
  ],

  TESTER : [
      { label: "Dashboard", path : "/tester" },
      { label: "Projects", path : "/tester/projects" },
      { label: "Testing", path : "/tester/testing" },  // ← This shows the project list
      { label: "Evidence", path : "/tester/evidence" },
      { label: "Reports", path : "/tester/reports" },
  ],
  
  TEST_MANAGER : [
    { label: "Dashboard", path : "/testmanager" },
    { label: "Projects", path : "/testmanager/projects" },
    { label: "Test Assignment", path : "/testmanager/project/assign-tester" },
    { label: "Reports", path : "/project/report" },
  ],

  CUSTOMER : [
    { label : "Dashboard", path : "/customer" },
    { label : "Projects", path : "/customer/project" },
    { label : "Project Tracking", path : "/customer/project/tracking" },
  ],

  SUPPORTADMIN : [
    { label : "Dashboard", path : "/support-admin" },
  ],

};