import { createBrowserRouter, RouterProvider } from "react-router-dom"
//import Navbar from "./components/shared/Navbar"
import Login from "./components/auth/Login"
import Signup from "./components/auth/Signup"
import Home from "./components/Home"
import Jobs from "./components/Jobs"
import Browse from "./components/Browse"
import Profile from "./components/Profile"
import JobDescription from "./components/JobDescription"
import Companies from "./components/admin/Companies"
import CompanyCreate from "./components/admin/CompanyCreate"
import CompanySetup from "./components/admin/CompanySetup"
import AdminJobs from "./components/admin/AdminJobs"
import PostJob from "./components/admin/PostJob"
import Applicants from "./components/admin/Applicants"
import ProtectedRoute from "./components/admin/ProtectedRoute"
import AIChatbotWidget from "./components/ai/AIChatbotWidget"
import ResumeAnalyzer from "./components/ai/ResumeAnalyzer"
import ResumeBuilder from "./components/ai/ResumeBuilder"
import MockInterview from "./components/ai/MockInterview"
import MainAdminDashboard from "./components/admin/main/MainAdminDashboard"
import ManageUsers from "./components/admin/main/ManageUsers"
import ManageRecruiters from "./components/admin/main/ManageRecruiters"
import ManageJobs from "./components/admin/main/ManageJobs"
import ManageApplications from "./components/admin/main/ManageApplications"

const appRouter = createBrowserRouter([
  {
    path:"/",
    element:<Home/>
  },
  {
    path:"/login",
    element:<Login />
  },
  {
    path:"/signup",
    element:<Signup/>
  },
  {
    path:"/jobs",
    element:<Jobs/>
  },
  {
    path:"/description/:id",
    element:<JobDescription/>
  },
  {
    path:"/browse",
    element:<Browse/>
  },
  {
    path:"/profile",
    element:<Profile/>
  },
  {
    path:"/ai/resume-analyzer",
    element:<ResumeAnalyzer />
  },
  {
    path:"/ai/resume-builder",
    element:<ResumeBuilder />
  },
  {
    path:"/ai/mock-interview",
    element:<MockInterview />
  },
  
{
    path:"/admin/companies",
    element:<ProtectedRoute><Companies/></ProtectedRoute>
  },
  {
    path:"/admin/companies/create",
    element:<ProtectedRoute><CompanyCreate/></ProtectedRoute>
  },
  {
    path:"/admin/companies/:id",
    element:<ProtectedRoute><CompanySetup/></ProtectedRoute>
  },
  {
    path:"/admin/jobs",
    element:<ProtectedRoute><AdminJobs/></ProtectedRoute>
  },
  {
    path:"admin/jobs/create",
    element:<ProtectedRoute><PostJob/></ProtectedRoute>
  },
  {
    path:"admin/jobs/:id/applicants",
    element:<ProtectedRoute><Applicants/></ProtectedRoute>
  },
  // Main Admin Routes
  {
    path: "/admin/dashboard",
    element: <ProtectedRoute allowedRoles={["admin"]}><MainAdminDashboard /></ProtectedRoute>
  },
  {
    path: "/admin/main/users",
    element: <ProtectedRoute allowedRoles={["admin"]}><ManageUsers /></ProtectedRoute>
  },
  {
    path: "/admin/main/recruiters",
    element: <ProtectedRoute allowedRoles={["admin"]}><ManageRecruiters /></ProtectedRoute>
  },
  {
    path: "/admin/main/jobs",
    element: <ProtectedRoute allowedRoles={["admin"]}><ManageJobs /></ProtectedRoute>
  },
  {
    path: "/admin/main/applications",
    element: <ProtectedRoute allowedRoles={["admin"]}><ManageApplications /></ProtectedRoute>
  },



])


function App() {

  return (
    <>
  <RouterProvider router={appRouter}/>
  <AIChatbotWidget />
     </>
  )
}

export default App