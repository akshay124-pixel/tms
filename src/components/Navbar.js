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
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand className="font-weight-bold">
          <img
            src="/logo.png"
            alt="TMS Logo"
            width="120"
            height="42"
            className="d-inline-block align-top"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = process.env.PUBLIC_URL + "/logo2.png";
              console.log("Logo load error, trying fallback path");
            }}
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto">{renderNavLinks()}</Nav>

          <div className="d-flex align-items-center">
            {isAuthenticated ? (
              <>
                <div className="d-flex align-items-center text-light me-3">
                  <span>Hello,</span>
                  <Nav.Link as={Link} to="/profile" className="ms-1 text-light">
                    {userName}!
                  </Nav.Link>
                </div>

                <button class="Btn" onClick={handleLogout}>
                  <div class="sign">
                    <svg viewBox="0 0 512 512">
                      <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
                    </svg>
                  </div>

                  <div class="text">Logout</div>
                </button>
              </>
            ) : (
              <>
                <Button
                  as={Link}
                  to="/login"
                  variant="outline-light"
                  className="mx-2"
                  style={{
                    borderRadius: "20px",
                    padding: "5px 15px",
                    fontWeight: "bold",
                    minWidth: "100px",
                    height: "38px",
                  }}
                >
                  Login
                </Button>
                <Button
                  as={Link}
                  to="/signup"
                  variant="outline-warning"
                  style={{
                    borderRadius: "20px",
                    padding: "5px 15px",
                    fontWeight: "bold",
                    minWidth: "100px",
                    height: "38px",
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default DashboardNavbar;
