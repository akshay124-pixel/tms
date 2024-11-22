import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Button,
  Alert,
  Spinner,
  ListGroup,
  Row,
  Col,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";
import axios from "axios";
import { FaUserCircle, FaEnvelope, FaUser, FaHome } from "react-icons/fa";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.user) {
        setUser(response.data.user);
      } else {
        setError("No user data available.");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setError("Session expired. Please log in again.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        setError("Failed to fetch user data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserData();
    } else {
      setError("No token found. Please log in.");
      window.location.href = "/login";
    }
  }, [token]);

  const renderTooltip = (message) => (
    <Tooltip id="button-tooltip">{message}</Tooltip>
  );

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
        minHeight: "100vh",
        paddingTop: "60px",
      }}
    >
      <Container>
        {/* Hero Section */}
        <div
          className="text-center mb-5"
          style={{
            background: "linear-gradient(90deg, #6a11cb, #2575fc)",
            padding: "40px 20px",
            borderRadius: "20px",
            color: "white",
            boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)",
          }}
        >
          <h1
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              fontSize: "2.5rem",
            }}
          >
            Welcome, {user ? user.username : "Guest"}!
          </h1>
          <p className="mt-3" style={{ fontSize: "1.2rem", opacity: 0.9 }}>
            Welcome to your profile!
          </p>
        </div>

        {/* Profile Section */}
        {error && (
          <Alert variant="danger" className="text-center">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : user ? (
          <Card
            className="shadow-lg border-0 rounded-lg"
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "20px",
              boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)",
            }}
          >
            <Card.Body>
              <Row className="align-items-center">
                {/* Profile Image */}
                <Col md={4} className="text-center">
                  <div
                    className="d-inline-block p-4"
                    style={{
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #2575fc, #6a11cb)",
                      boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    <FaUserCircle size={150} color="#ffffff" />
                  </div>
                  <h3
                    className="mt-4 text-dark"
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: "24px",
                      fontWeight: 600,
                    }}
                  >
                    {user.username}
                  </h3>
                </Col>

                {/* Profile Details */}
                <Col md={8}>
                  <Card.Title
                    className="text-primary mb-4"
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: "22px",
                      fontWeight: 700,
                    }}
                  >
                    Profile Information
                  </Card.Title>
                  <ListGroup variant="flush" className="mb-4">
                    <ListGroup.Item
                      className="d-flex justify-content-between align-items-center border-0"
                      style={{ padding: "15px 10px" }}
                    >
                      <OverlayTrigger
                        placement="top"
                        overlay={renderTooltip("Your full name")}
                      >
                        <span className="d-flex align-items-center">
                          <FaUser className="me-2 text-primary" />
                          <strong>Name:</strong>
                        </span>
                      </OverlayTrigger>
                      <span>{user.username}</span>
                    </ListGroup.Item>
                    <ListGroup.Item
                      className="d-flex justify-content-between align-items-center border-0"
                      style={{ padding: "15px 10px" }}
                    >
                      <OverlayTrigger
                        placement="top"
                        overlay={renderTooltip("Your email address")}
                      >
                        <span className="d-flex align-items-center">
                          <FaEnvelope className="me-2 text-info" />
                          <strong>Email:</strong>
                        </span>
                      </OverlayTrigger>
                      <span>{user.email}</span>
                    </ListGroup.Item>
                  </ListGroup>
                  <div className="text-center">
                    <Button
                      variant="outline-primary"
                      onClick={() => window.history.back()}
                      className="px-4 py-2 rounded-pill shadow-sm"
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      Go Back
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        ) : (
          <p className="text-center text-muted">No user data available.</p>
        )}
      </Container>
    </div>
  );
};

export default UserProfile;
