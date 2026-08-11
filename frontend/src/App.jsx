
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage/LoginPage.jsx";
import SetupMFA from "./pages/LoginPage/SetupMFA.jsx";

import Layout from "./pages/Design/Layout.jsx";
import Profile from "./pages/Design/Profile.jsx";

import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";

import TestManager from "./pages/TestManager/TestManagerDashboard.jsx";
import SupportAdmin from "./pages/SupportAdmin/SupportAdminDashboard.jsx";
import Tester from "./pages/Tester/TesterDashboard.jsx";
import Customer from "./pages/Customer/CustomerDashboard.jsx";
import Master from "./pages/Master/MasterDashboard.jsx";

import UserCreate from "./pages/Master/UserCreation.jsx";
import UserView from "./pages/Master/UserView.jsx";
import ProjectCreation from "./pages/Master/ProjectCreation.jsx";
import ProjectView from "./pages/Master/ProjectView.jsx";

import Suites from "./pages/Master/Suites.jsx";
import SuitesCreation from "./pages/Master/SuitesCreation.jsx";
import Protocols from "./pages/Master/Protocols.jsx";
import ProtocolCreation from "./pages/Master/ProtocolsCreation.jsx";
import Reports from "./pages/Master/Reports.jsx";

import Tools from "./pages/Master/Tools.jsx";
import ToolsCreations from "./pages/Master/ToolsCreations.jsx";
import Testing from "./pages/Tester/Testing.jsx";

import TesterProjects from "./pages/Tester/TesterProjects.jsx";
import Evidance from "./pages/Tester/Evidance.jsx";
import TestingProjectList from "./pages/Tester/TestingProjectList.jsx";
import TMProjects from "./pages/TestManager/TMProjects.jsx";
import CustomerProjects from "./pages/Customer/CustomerProject.jsx";

import TesterReport from "./pages/Tester/TesterReport.jsx";
import TMReport from "./pages/TestManager/TMReport.jsx";

function App() {

  const isLoggedIn = false;

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/setup-mfa" element={<SetupMFA />} />
        
        <Route path="/profile" element={
          <Layout>
            <Profile />
          </Layout>
        } />

        <Route path="/admin" element={
          <Layout>
            <AdminDashboard />
          </Layout>
        } />

        <Route path="/admin/user" element={
          <Layout>
            <UserView />
          </Layout>
        } />

        <Route path="/admin/projects" element={
          <Layout>
            <ProjectView />
          </Layout>
        } />

        <Route path="/admin/projects/create" element={
          <Layout>
            <ProjectCreation />
          </Layout>
        } />

        <Route path="/admin/support-admin" element={
          <Layout>
            <SupportAdmin />
          </Layout>
        } />

        <Route path="/admin/reports" element={
          <Layout>
            <Reports />
          </Layout>
        } />

        <Route path="/master" element={
          <Layout>
            <Master />
          </Layout>
        } />

        <Route path="/user/view" element={
          <Layout>
            <UserView />
          </Layout>
        } />

        <Route path="/user/create" element={
          <Layout>
            <UserCreate />
          </Layout>
        } />

        <Route path="/projects" element={
          <Layout>
            <ProjectView />
          </Layout>
        } />

        <Route path="/projects/create" element={
          <Layout>
            <ProjectCreation />
          </Layout>
        } />

        <Route path="/master/suites" element={
          <Layout>
            <Suites />
          </Layout>
        } />

        <Route path="/master/suites/create" element={
          <Layout>
            <SuitesCreation />
          </Layout>
        } />

        <Route path="/master/protocols" element={
          <Layout>
            <Protocols />
          </Layout>
        } />

        <Route path="/master/protocols/create" element={
          <Layout>
            <ProtocolCreation />
          </Layout>
        } />

        <Route path="/master/reports" element={
          <Layout>
            <Reports />
          </Layout>
        } />

        <Route path="/master/tools" element={
          <Layout>
            <Tools />
          </Layout>
        } />

        <Route path="/master/tools/create" element={
          <Layout>
            <ToolsCreations />
          </Layout>
        } />

        <Route path="/support-admin" element={
          <Layout>
            <SupportAdmin />
          </Layout>
        } />

        <Route path="/testmanager" element={
          <Layout>
            <TestManager />
          </Layout>
        } />

        <Route path="/testmanager/projects" element={
          <Layout>
            <TMProjects />
          </Layout>
        } />

         <Route path="/testmanager/reports" element={
          <Layout>
            <TMReport />
          </Layout>
        } />

        <Route path="/tester" element={
          <Layout>
            <Tester />
          </Layout>
        } />

        <Route path="/tester/projects" element={
          <Layout>
            <TesterProjects />
          </Layout>
        } />

        <Route path="/tester/testing" element={
          <Layout>
            <TestingProjectList />
          </Layout>
        } />

        <Route path="/tester/testing/:projectId/:stage" element={
            <Layout>
                <Testing />
            </Layout>
        } />

        <Route path="/tester/evidence" element={
          <Layout>
            <Evidance />
          </Layout>
        } />

        <Route path="/tester/reports" element={
          <Layout>
            <TesterReport />
          </Layout>
        } />

        <Route path="/customer" element={
          <Layout>
            <Customer />
          </Layout>
        } />

        <Route path="/tester/testing/:projectId/:stage" element={
          <Layout>
            <Testing />
          </Layout>
        } />

        <Route path="/admin/reports" element={
          <Layout>
            <Reports />
          </Layout>
        } />

        <Route path="/customer/projects" element={
          <Layout>
            <CustomerProjects />
          </Layout>
        } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;