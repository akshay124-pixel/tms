import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import "../App.css";
import { toast } from "react-toastify";
import "../styles/Navbar.css";

import "react-toastify/dist/ReactToastify.css";

const DashboardNavbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    setIsAuthenticated(!!token);
    setUserName(user?.username || "User");
    setUserRole(user?.role || "");

    const handleStorageChange = () => {
      const updatedUser = JSON.parse(localStorage.getItem("user") || "{}");
      setIsAuthenticated(!!localStorage.getItem("token"));
      setUserName(updatedUser?.username || "User");
      setUserRole(updatedUser?.role || "");
    };

    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    // Remove user-related data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Reset authentication state and user details
    setIsAuthenticated(false);
    setUserName("User");
    setUserRole("");

    // Navigate to the login page
    navigate("/login");

    // Show a toast notification for successful logout
    toast.success("Logged out successfully! See you soon 👋", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      icon: "👋", // Optional: Add an icon
    });
  };

  const renderNavLinks = () => {
    switch (userRole) {
      case "admin":
        return (
          <>
            {/* <Nav.Link as={Link} to="/admin" className="nav-item-custom mx-2">
              Admin
            </Nav.Link> */}
            {/* <Nav.Link as={Link} to="/view" className="nav-item-custom mx-2">
              View Tickets
            </Nav.Link> */}
            {/* <Nav.Link as={Link} to="/profile" className="nav-item-custom mx-2">
              Profile
            </Nav.Link> */}
          </>
        );
      case "client":
        return (
          <>
            {/* <Nav.Link as={Link} to="/client" className="nav-item-custom mx-2">
              Customer
            </Nav.Link> */}
            {/* <Nav.Link as={Link} to="/view" className="nav-item-custom mx-2">
              View Tickets
            </Nav.Link> */}
            {/* <Nav.Link as={Link} to="/profile" className="nav-item-custom mx-2">
              Profile
            </Nav.Link> */}
          </>
        );
      case "opsManager":
        return (
          <>
            {/* <Nav.Link
              as={Link}
              to="/ops-manager"
              className="nav-item-custom mx-2"
            >
              Ops Manager
            </Nav.Link> */}
            {/* <Nav.Link as={Link} to="/view" className="nav-item-custom mx-2">
              View Tickets
            </Nav.Link> */}
            {/* <Nav.Link as={Link} to="/profile" className="nav-item-custom mx-2">
              Profile
            </Nav.Link> */}
          </>
        );
      case "serviceAgent":
        return (
          <>
            {/* <Nav.Link
              as={Link}
              to={`/service-agent/${userName}`}
              className="nav-item-custom mx-2"
            >
              Service Agent
            </Nav.Link> */}
            {/* <Nav.Link as={Link} to="/profile" className="nav-item-custom mx-2">
              Profile
            </Nav.Link> */}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Navbar expand="lg" className="flagship-navbar">
      <Container>
        <Navbar.Brand as={Link} to="/" className="navbar-brand">
          <div className="brand-logo">
            <i className="fas fa-ticket-alt"></i>
            <span>TMS</span>
          </div>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav">
          <i className="fas fa-bars"></i>
        </Navbar.Toggle>

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {renderNavLinks()}
            {isAuthenticated && (
              <>
                <div className="nav-user-info">
                  <i className="fas fa-user-circle"></i>
                  <span>{userName}</span>
                </div>
                <button className="logout-button" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Logout</span>
                </button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default DashboardNavbar;
