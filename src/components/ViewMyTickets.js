import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Container,
  Alert,
  ListGroup,
  Badge,
  Button,
} from "react-bootstrap";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const ViewMyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState(null);

  // Fetch user tickets from the API
  const fetchMyTickets = async () => {
    try {
      const response = await axios.get(
        "https://tms-server-saeo.onrender.com/tickets/ticket"
      );
      setTickets(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setError("Failed to fetch tickets. Please try again.");
    }
  };

  // Fetch tickets on component mount and set an interval for real-time updates
  useEffect(() => {
    fetchMyTickets();
    const intervalId = setInterval(fetchMyTickets, 5000); // Fetch every 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, []);

  // Toggle history visibility
  const toggleHistory = (index) => {
    setTickets((prevTickets) =>
      prevTickets.map((ticket, i) => {
        if (i === index) {
          return { ...ticket, showHistory: !ticket.showHistory };
        }
        return ticket;
      })
    );
  };

  return (
    <Container className="mt-5">
      <h2 className="mb-4 text-center" style={{ color: "purple" }}>
        My Tickets
      </h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        {tickets.length > 0 ? (
          tickets.map((ticket, index) => (
            <Col md={6} key={ticket._id} className="mb-4">
              <Card className="shadow-sm border-info">
                <Card.Body>
                  {/* Display Tracking ID */}
                  <Card.Text className="font-weight-bold text-muted">
                    Tracking ID: {ticket.trackingId}
                  </Card.Text>{" "}
                  <hr />
                  <Card.Title>
                    <strong>Customer Name : </strong>
                    {ticket.customerName}
                  </Card.Title>
                  <hr />
                  {/* Display additional ticket details */}
                  <Card.Text>
                    <strong>Contact Number:</strong> {ticket.contactNumber}
                  </Card.Text>
                  <Card.Text>
                    <strong>Address:</strong> {ticket.address}
                  </Card.Text>
                  <Card.Text>
                    <strong>Description:</strong> {ticket.description}
                  </Card.Text>
                  <Card.Text>
                    <strong>Product Type:</strong> {ticket.productType}
                  </Card.Text>
                  {/* Display creation date */}
                  <Card.Text>
                    <strong>Created on:</strong>{" "}
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </Card.Text>
                  {/* Display serial number */}
                  <Card.Text>
                    <strong>Serial Number:</strong> {ticket.serialNumber}
                  </Card.Text>
                  {ticket.serialNumberImage && (
                    <img
                      src={`https://tms-server-saeo.onrender.com/uploads/${ticket.serialNumberImage}`}
                      alt="Serial Number"
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                        borderRadius: "5px",
                      }}
                    />
                  )}
                  <p>
                    <strong>Assigned Agent:</strong>{" "}
                    {ticket.assignedTo || "Not Assigned"}
                  </p>
                  {/* Display status */}
                  <Card.Text>
                    <strong>Status: </strong>
                    <Badge
                      pill
                      bg={
                        ticket.status === "Resolved"
                          ? "success"
                          : ticket.status === "Closed"
                          ? "dark"
                          : ticket.status === "In Progress"
                          ? "warning"
                          : "info"
                      }
                    >
                      {ticket.status}
                    </Badge>
                  </Card.Text>
                  {/* Button to toggle ticket history */}
                  <Button
                    variant="info"
                    onClick={() => toggleHistory(index)}
                    className="mb-2"
                  >
                    {ticket.showHistory ? "Hide History" : "Show History"}
                  </Button>
                  {/* Display ticket history as a timeline */}
                  {ticket.showHistory && (
                    <>
                      <h5 className="mt-4">Ticket History</h5>
                      <ListGroup variant="flush">
                        {ticket.history
                          .filter(
                            (historyItem, historyIndex, self) =>
                              historyIndex ===
                              self.findIndex(
                                (h) => h.status === historyItem.status
                              )
                          )
                          .map((historyItem, historyIndex) => (
                            <ListGroup.Item
                              key={historyIndex}
                              className="d-flex align-items-center"
                              style={{
                                borderLeft: "3px solid #007bff",
                                paddingLeft: "1rem",
                                marginBottom: "10px",
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <strong>Status:</strong> {historyItem.status}
                              </div>
                              <small className="text-muted">
                                {new Date(historyItem.date).toLocaleString()}
                              </small>
                            </ListGroup.Item>
                          ))}
                      </ListGroup>
                    </>
                  )}
                  {/* Conditionally show alerts for Resolved or Closed */}
                  {ticket.status === "Resolved" && (
                    <Alert variant="success" className="mt-3">
                      <FaCheckCircle /> This ticket has been resolved!
                    </Alert>
                  )}
                  {ticket.status === "Closed" && (
                    <Alert variant="dark" className="mt-3">
                      <FaTimesCircle /> This ticket has been closed!
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col md={12}>
            <p className="text-center">No tickets found.</p>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default ViewMyTickets;
