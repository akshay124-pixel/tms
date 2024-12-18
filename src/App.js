import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import "./App.css";
import Login from "./auth/Login";
import SignUp from "./auth/Signup";
import DashboardNavbar from "./components/Navbar";
import ClientDashboard from "./components/ClientDashboard";
import ViewMyTickets from "./components/ViewMyTickets";
import AdminDashboard from "./components/AdminDashboard";
import UserProfile from "./components/UserProfile";
import OpsManagerDashboard from "./components/OpsDashboard";
import ServiceAgentDashboard from "./components/ServiceAgent";

function App() {
  return (
    <BrowserRouter>
      <ConditionalNavbar />
      <Routes>
        {/* Default route to redirect to login */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/client" element={<ClientDashboard />} />
        <Route path="/view" element={<ViewMyTickets />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/ops-manager" element={<OpsManagerDashboard />} />

        {/* Dynamic route for service agents with different agent IDs */}
        <Route
          path="/service-agent/:agentId"
          element={<ServiceAgentDashboard />}
        />
      </Routes>
    </BrowserRouter>
  );
}

// Component to conditionally render the Navbar only on specific routes
const ConditionalNavbar = () => {
  const location = useLocation();

  // Determine if the current path is for authentication pages
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";

  return !isAuthPage ? <DashboardNavbar /> : null;
};

export default App;
