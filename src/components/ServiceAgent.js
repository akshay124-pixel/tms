import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Card,
  Button,
  Row,
  Col,
  Form,
  Modal,
  Spinner,
  Badge,
} from "react-bootstrap";
import axios from "axios";
import { useParams } from "react-router-dom";
import debounce from "lodash.debounce";
import "../App.css";
import { toast } from "react-toastify";
// Adjust the path as needed

const ServiceAgentDashboard = () => {
  const { agentId: paramAgentId } = useParams();
  const [tickets, setTickets] = useState([]);
  const [ticketDetails, setTicketDetails] = useState({});
  const [selectedTicket, setSelectedTicket] = useState({});
  const [showModal, setShowModal] = useState(false);
  // const [message, setMessage] = useState({ content: null, variant: null });
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [updatingTickets, setUpdatingTickets] = useState({});

  // Fetch tickets assigned to the agent
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const agentId = localStorage.getItem("agentId") || paramAgentId;
      if (!agentId) {
        toast.error("User not logged in or session expired.");

        return;
      }

      const response = await axios.get(
        `https://tms-server-saeo.onrender.com/tickets/assigned/${agentId}`,
        { withCredentials: true }
      );
      setTickets(response.data || []);
    } catch (error) {
      // toast.error("Failed to fetch tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [paramAgentId]);

  // Helper function to clear message after 3 seconds
  // const clearMessage = () => {
  //   setTimeout(() => {
  //     setMessage({ content: null, variant: null });
  //   }, 3000);
  // };

  // Handle updating ticket type
  const handleUpdateCall = async (ticketId, Type) => {
    try {
      await axios.put(
        `https://tms-server-saeo.onrender.com/tickets/update/${ticketId}`,
        {
          Type,
        }
      );
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket._id === ticketId ? { ...ticket, Type } : ticket
        )
      );
      toast.success("Type updated successfully!");
    } catch (error) {
      toast.error("Failed to update Type. Please try again.");
    }
  };

  const handleUpdateTicket = async (e, ticketId) => {
    e.preventDefault();

    // Set the ticket as updating
    setUpdatingTickets((prev) => ({ ...prev, [ticketId]: true }));

    const updatedTicketDetails = ticketDetails[ticketId];

    try {
      // Prepare payload
      const payload = {
        status: updatedTicketDetails.status || "Open", // Default to "Open" if no status is selected
        remarks: updatedTicketDetails.remarks,
        partName: updatedTicketDetails.partName,
      };

      // API call to update ticket
      const response = await axios.put(
        `https://tms-server-saeo.onrender.com/tickets/update/${ticketId}`,
        payload
      );

      if (response.status === 200) {
        // Update the tickets state with new remarks and status
        setTickets((prevTickets) =>
          prevTickets.map((ticket) =>
            ticket._id === ticketId
              ? {
                  ...ticket,
                  status: payload.status,
                  remarks: payload.remarks,
                  partName: payload.partName,
                }
              : ticket
          )
        );
        toast.success("Ticket updated successfully!");

        // Reset the ticket details state after update
        setTicketDetails((prevState) => ({
          ...prevState,
          [ticketId]: { status: payload.status, remarks: "", partName: "" }, // Reset remarks field
        }));
      } else {
        toast.error("Failed to update Ticket. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to update Ticket. Please try again.");
    } finally {
      // Set the ticket as not updating after the operation
      setUpdatingTickets((prev) => ({ ...prev, [ticketId]: false }));
    }
  };

  // Handle input changes for remarks or status
  const handleInputChange = (e, ticketId, field) => {
    const value = e.target.value;
    setTicketDetails((prevState) => ({
      ...prevState,
      [ticketId]: {
        ...prevState[ticketId],
        [field]: value,
      },
    }));
  };

  // Filter tickets based on search term

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.priority.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.trackingId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = debounce((term) => {
    setSearchTerm(term);
  }, 300); // Debounce search term updates with 300ms delay

  const handleShowDetails = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return (
    <Container className="mt-5">
      <div
        className="my-3"
        style={{
          background: "linear-gradient(90deg, #6a11cb, #2575fc)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          display: "flex",
          justifyContent: "center",
          textShadow: "2px 2px 8px rgba(0, 0, 0, 0.3)",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <h2 style={{ fontWeight: "700", fontSize: "2rem" }}>
          Service Agent Dashboard: Manage & Resolve Tickets
        </h2>
      </div>

      <div className="container py-3 my-3">
        <div
          className="input-group"
          style={{
            margin: "0 auto",
            border: "1px solid #ddd",
            borderRadius: "50px",
            maxWidth: "600px",
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Search Input */}
          <input
            type="text"
            className="form-control border-0"
            placeholder="🔍 Search by Ticket ID,Customer, Status, or Priority"
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              fontSize: "16px",
              border: "none",
              outline: "none",
              borderRadius: "50px 0 0 50px", // Left rounded pill shape
              paddingLeft: "20px",
            }}
          />

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchTickets}
            className="btn"
            onMouseEnter={() => setIsHovered(true)} // Set hover to true
            onMouseLeave={() => setIsHovered(false)} // Set hover to false
            style={{
              background: "linear-gradient(90deg, #6a11cb, #2575fc)", // Gradient background
              color: "white",
              border: "none",
              borderRadius: "0 50px 50px 0", // Right rounded pill shape
              padding: "8px 20px",
              cursor: "pointer",
              transition: "all 0.3s ease-in-out",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              className="refresh-icon bi bi-arrow-repeat"
              viewBox="0 0 16 16"
              style={{
                transition: "transform 0.6s ease-in-out", // Smooth rotation transition
                transform: isHovered ? "rotate(360deg)" : "rotate(0deg)", // Rotate on hover
              }}
            >
              <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"></path>
              <path
                fillRule="evenodd"
                d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"
              ></path>
            </svg>
          </button>
        </div>
      </div>
      {/* Refresh Button */}
      <Row>
        {loading ? (
          <Col className="text-center">
            <Spinner
              animation="border"
              variant="primary"
              style={{
                width: "3rem",
                height: "3rem",
                marginTop: "2rem",
              }}
            />
          </Col>
        ) : filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <Col md={4} key={ticket._id} className="mb-4">
              <Card
                className="shadow-lg "
                style={{
                  width: "100%",

                  borderLeft: `5px solid ${
                    ticket.priority === "High"
                      ? "red"
                      : ticket.priority === "Normal"
                      ? "orange"
                      : "green"
                  }`,
                }}
              >
                <Card.Body>
                  <p>{ticket.trackingId}</p>
                  <hr />
                  <Card.Text>
                    <strong>Customer Name:</strong> {ticket.customerName}
                  </Card.Text>
                  <Card.Text>
                    <strong>Description:</strong> {ticket.description}
                  </Card.Text>
                  <Card.Text>
                    <strong>Priority:</strong>{" "}
                    <Badge
                      bg={
                        ticket.priority === "High"
                          ? "danger"
                          : ticket.priority === "Normal"
                          ? "warning"
                          : "success"
                      }
                    >
                      {ticket.priority}
                    </Badge>
                  </Card.Text>
                  <Card.Text>
                    <strong>Type:</strong>{" "}
                    <Badge
                      bg={
                        ticket.Type === "Repair"
                          ? "primary" // Blue for "Repair"
                          : ticket.Type === "Replacement"
                          ? "info" // Light blue for "Replacement"
                          : ticket.Type === "Received"
                          ? "success" // Green for "Received"
                          : "secondary" // Default badge color if none of the above"
                      }
                      style={{
                        fontSize: "14px", // Slightly larger font for better readability
                        padding: "5px 10px", // Add some padding for better styling
                        borderRadius: "10px", // Rounded badge for modern look
                        marginLeft: "10px", // Add space after "Status"
                        textTransform: "capitalize", // Make the text properly cased
                      }}
                    >
                      {ticket.Type}
                    </Badge>
                  </Card.Text>
                  <Form.Group className="my-3">
                    <Form.Label className="fw-bold">
                      Select Call Type
                    </Form.Label>
                    <Form.Select
                      className="custom-dropdown"
                      aria-label="Update Call"
                      onChange={(e) =>
                        handleUpdateCall(ticket?._id, e.target.value)
                      }
                      value={ticket?.Type || ""}
                      disabled={!ticket?._id} // Disable dropdown if there's no ticket._id
                    >
                      <option value="" disabled>
                        -- Select Call Type --
                      </option>
                      <option value="Replacement">Replacement</option>
                      <option value="Repair">Repair</option>
                    </Form.Select>
                  </Form.Group>
                  <Form onSubmit={(e) => handleUpdateTicket(e, ticket._id)}>
                    {/* Status Update Dropdown */}
                    <Form.Select
                      className="my-2"
                      aria-label="Update Status"
                      onChange={(e) =>
                        handleInputChange(e, ticket._id, "status")
                      }
                      value={ticketDetails[ticket._id]?.status || ticket.status}
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </Form.Select>

                    {/* Remarks and Status Form */}
                    <div className="mb-3 my-3">
                      <input
                        type="text"
                        className="form-control my-2"
                        style={{
                          margin: "0 auto",
                          border: "1px solid #ddd",
                          borderRadius: "5px",
                        }}
                        placeholder="Enter Remarks"
                        value={ticketDetails[ticket._id]?.remarks || ""}
                        onChange={(e) =>
                          handleInputChange(e, ticket._id, "remarks")
                        }
                      />
                    </div>
                    {/* Part Name */}
                    <Form.Group className="my-3">
                      <Form.Label className="fw-bold">
                        Select Part Name
                      </Form.Label>
                      <Form.Select
                        className="custom-dropdown"
                        aria-label="Select Part Name"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "Other") {
                            // Show input field for custom part name
                            handleInputChange(e, ticket._id, "isOther", true);
                            handleInputChange(e, ticket._id, "partName", ""); // Reset partName
                          } else {
                            // Directly set the selected part name
                            handleInputChange(e, ticket._id, "isOther", false);
                            handleInputChange(e, ticket._id, "partName", value);
                          }
                        }}
                        value={
                          ticketDetails[ticket._id]?.isOther
                            ? "Other"
                            : ticketDetails[ticket._id]?.partName || ""
                        }
                        disabled={!ticket?._id} // Disable dropdown if there's no ticket._id
                      >
                        <option value="" disabled>
                          -- Select Part Name --
                        </option>
                        <option value="CMOS Battery">CMOS Battery</option>
                        <option value="DOC Board + LVDS Cable">
                          DOC Board + LVDS Cable
                        </option>
                        <option value="MotherBoard">MotherBoard</option>
                        <option value="OC Module">OC Module</option>
                        <option value="OPS">OPS</option>
                        <option value="Panel">Panel</option>
                        <option value="Power Board">Power Board</option>
                        <option value="Speaker">Speaker</option>
                        <option value="T-CON Board + LVDS Cable">
                          T-CON Board + LVDS Cable
                        </option>
                        <option value="Other">Other</option>
                      </Form.Select>

                      {/* Conditionally render input field if "Other" is selected */}
                      {ticketDetails[ticket._id]?.isOther && (
                        <Form.Group className="my-3">
                          <Form.Label className="fw-bold">
                            Specify Other Part Name
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter Part Name"
                            onChange={(e) =>
                              handleInputChange(
                                e,
                                ticket._id,
                                "partName",
                                e.target.value
                              )
                            }
                            value={ticketDetails[ticket._id]?.partName || ""}
                          />
                        </Form.Group>
                      )}
                    </Form.Group>

                    {/* Buttons Section */}
                    <div
                      className="d-flex flex-column justify-content-center gap-1"
                      style={{
                        width: "100%",
                        gap: "10px",
                      }}
                    >
                      {/* Update Ticket Button */}
                      <Button
                        variant="info"
                        type="submit"
                        className="mt-2"
                        style={{
                          width: "100%",
                          backgroundColor: "lightgreen",
                          border: "none",
                          color: "black",
                          borderRadius: "50px",
                          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)", // Subtle shadow
                          transition: "all 0.3s ease", // Smooth transition for hover effect
                        }}
                        disabled={updatingTickets[ticket._id]} // Disable button if this ticket is being updated
                        onMouseEnter={(e) =>
                          (e.target.style.backgroundColor = "#66bb6a")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.backgroundColor = "lightgreen")
                        }
                      >
                        {updatingTickets[ticket._id] ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          "Update Ticket"
                        )}
                      </Button>

                      {/* View Details Button */}
                      <Button
                        variant="info"
                        onClick={() => handleShowDetails(ticket)}
                        className="w-100 my-2"
                        style={{
                          width: "100%",
                          backgroundColor: "lightblue",
                          border: "none",
                          color: "black",
                          borderRadius: "50px",
                          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.backgroundColor = "#81d4fa")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.backgroundColor = "lightblue")
                        }
                      >
                        View Details
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col className="text-center">
            <p>No tickets found.</p>
          </Col>
        )}
      </Row>
      {/* Ticket Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Ticket Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTicket ? (
            <>
              <p>
                <strong>Tracking ID:</strong> {selectedTicket.trackingId}
              </p>
              <p>
                <strong>Created On:</strong>{" "}
                {new Date(selectedTicket.createdAt).toLocaleDateString()}
              </p>

              <p>
                <strong>Description:</strong> {selectedTicket.description}
              </p>
              <p>
                <strong>Customer Name:</strong> {selectedTicket.customerName}
              </p>
              <p>
                <strong>Contact:</strong> {selectedTicket.contactNumber}
              </p>
              <p>
                <strong>Address:</strong> {selectedTicket.address}
              </p>
              <p>
                <strong>Product Type:</strong> {selectedTicket.productType}
              </p>
              <p>
                <strong>Model Type:</strong> {selectedTicket.modelType}
              </p>

              <p>
                <strong>Part Name:</strong>{" "}
                {selectedTicket.partName || "Not Available"}
              </p>

              <p>
                <strong>Serial Number:</strong> {selectedTicket.serialNumber}
              </p>
              <p>
                <strong>Bill Image:</strong> {selectedTicket.billImage}
                <a
                  href={`https://tms-server-saeo.onrender.com/tickets/download/${selectedTicket.billImage.replace(
                    /^uploads[\\/]/,
                    ""
                  )}`}
                  download={selectedTicket.billImage.replace(
                    /^uploads[\\/]/,
                    ""
                  )}
                  className="enhanced-download-btn btn-sm mx-3"
                  style={{
                    background: "linear-gradient(135deg, #6a11cb, #2575fc)",
                  }}
                >
                  Download Bill
                </a>
              </p>
              <p>
                <strong>Call Type:</strong> {selectedTicket.call}
              </p>
              <p>
                <strong>Type:</strong> {selectedTicket.Type || "Not  Available"}
              </p>
              <p>
                <strong>Part Name:</strong>{" "}
                {selectedTicket.partName || "Not Available"}
              </p>
              <p>
                <strong>Status:</strong> {selectedTicket.status}
              </p>
              <p>
                <strong>Priority:</strong>{" "}
                <Badge
                  bg={
                    selectedTicket.priority === "High"
                      ? "danger"
                      : selectedTicket.priority === "Normal"
                      ? "warning"
                      : "success"
                  }
                >
                  {selectedTicket.priority}
                </Badge>
              </p>
              <p>
                <strong>Assigned Agent:</strong>{" "}
                {selectedTicket.assignedTo || "Not Assigned"}
              </p>
              <p>
                <strong>Remarks:</strong>{" "}
                {selectedTicket.remarks || "Not Available"}
              </p>
            </>
          ) : (
            <p>No ticket selected.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            style={{
              background: "linear-gradient(145deg, #6e7c7c, #4f5f5f)", // Gradient background
              border: "none", // Remove default border
              borderRadius: "50px", // Rounded edges for a sleek look
              color: "#fff", // White text for contrast
              fontWeight: "bold", // Bold text
              padding: "12px 30px", // Increase padding for a more prominent button
              boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)", // Soft shadow for depth
              transition: "all 0.3s ease", // Smooth transition effect
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")} // Slight zoom effect on hover
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")} // Reset zoom effect on hover out
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ServiceAgentDashboard;
