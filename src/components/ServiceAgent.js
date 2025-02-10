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
import ReactStars from "react-rating-stars-component";
import "../styles/TicketModal.css";
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
                  <Form
                    onSubmit={(e) => {
                      if (
                        !ticketDetails[ticket._id]?.remarks ||
                        ticketDetails[ticket._id]?.remarks.trim() === ""
                      ) {
                        e.preventDefault();
                        toast.error(
                          "Remarks are required when updating the status."
                        );
                        return;
                      }
                      handleUpdateTicket(e, ticket._id);
                    }}
                  >
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
                        className="mt-2 "
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
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
        className="ticket-detail-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title className="modal-title-custom">
            <i className="fas fa-ticket-alt me-2"></i>
            Ticket Information
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          {selectedTicket ? (
            <div className="ticket-detail-container">
              {/* Tracking ID and Status Section */}
              <div className="ticket-header-section">
                <div className="tracking-id-container">
                  <span className="label">Tracking ID:</span>
                  <span className="value">{selectedTicket.trackingId}</span>
                </div>
                <Badge
                  className={`status-badge-lg status-${selectedTicket.status
                    .toLowerCase()
                    .replace(" ", "-")}`}
                >
                  {selectedTicket.status}
                </Badge>
              </div>

              {/* Customer Information Section */}
              <div className="detail-section">
                <h5 className="section-title">
                  <i className="fas fa-user-circle me-2"></i>
                  Customer Information
                </h5>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Customer Name:</span>
                    <span className="value">{selectedTicket.customerName}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Contact:</span>
                    <span className="value">
                      {selectedTicket.contactNumber}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Email:</span>
                    <span className="value">{selectedTicket.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Organization:</span>
                    <span className="value">
                      {selectedTicket.organization || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Information Section */}
              <div className="detail-section">
                <h5 className="section-title">
                  <i className="fas fa-box me-2"></i>
                  Product Details
                </h5>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Product Type:</span>
                    <span className="value">{selectedTicket.productType}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Model Type:</span>
                    <span className="value">{selectedTicket.modelType}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Serial Number:</span>
                    <span className="value">{selectedTicket.serialNumber}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Call Type:</span>
                    <span className="value">
                      {selectedTicket.call || "Not Specified"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Part Name:</span>
                    <span className="value">
                      {selectedTicket.partName || "Not Available"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Location Information Section */}
              <div className="detail-section">
                <h5 className="section-title">
                  <i className="fas fa-map-marker-alt me-2"></i>
                  Location Details
                </h5>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Address:</span>
                    <span className="value address-value">
                      {selectedTicket.address}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">City:</span>
                    <span className="value">{selectedTicket.city}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">State:</span>
                    <span className="value">{selectedTicket.state}</span>
                  </div>
                </div>
              </div>

              {/* Bill Download Section */}
              <div className="detail-section">
                <h5 className="section-title">
                  <i className="fas fa-file-invoice me-2"></i>
                  Bill Information
                </h5>
                <div className="bill-download-container">
                  <div className="bill-info">
                    <span className="bill-name">
                      {selectedTicket.billImage.replace(/^uploads[\\/]/, "")}
                    </span>
                    <a
                      href={`https://tms-server-saeo.onrender.com/tickets/download/${selectedTicket.billImage.replace(
                        /^uploads[\\/]/,
                        ""
                      )}`}
                      download
                      className="download-button"
                    >
                      <i className="fas fa-download me-2"></i>
                      Download Bill
                    </a>
                  </div>
                </div>
              </div>

              {/* Service Details Section */}
              <div className="detail-section">
                <h5 className="section-title">
                  <i className="fas fa-cogs me-2"></i>
                  Service Details
                </h5>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Service Type:</span>
                    <span className="value">
                      <Badge
                        className={`type-badge type-${selectedTicket.Type?.toLowerCase()}`}
                      >
                        {selectedTicket.Type || "Not Specified"}
                      </Badge>
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Priority:</span>
                    <span className="value">
                      <Badge
                        className={`priority-badge priority-${selectedTicket.priority?.toLowerCase()}`}
                      >
                        {selectedTicket.priority || "Normal"}
                      </Badge>
                    </span>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="detail-section">
                <h5 className="section-title">
                  <i className="fas fa-comment-alt me-2"></i>
                  Issue Description
                </h5>
                <div className="description-box">
                  {selectedTicket.description}
                </div>
              </div>

              {/* Feedback Section */}
              <div className="detail-section">
                <h5 className="section-title">
                  <i className="fas fa-star me-2"></i>
                  Customer Feedback
                </h5>
                {selectedTicket.feedback ? (
                  <div className="feedback-container">
                    <div className="rating-display">
                      <span className="rating-label">Rating:</span>
                      <div className="stars-container">
                        <ReactStars
                          count={5}
                          value={selectedTicket.feedback.rating}
                          size={24}
                          edit={false}
                          activeColor="#ffd700"
                        />
                        <span className="rating-value">
                          ({selectedTicket.feedback.rating}/5)
                        </span>
                      </div>
                    </div>
                    <div className="feedback-comment">
                      <span className="comment-label">Comment:</span>
                      <p className="comment-text">
                        {selectedTicket.feedback.comment ||
                          "No comments provided"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="no-feedback">
                    <i className="fas fa-comment-alt"></i>
                    <p>No feedback submitted yet</p>
                  </div>
                )}
              </div>

              {/* History Section */}
              <div className="detail-section">
                <h5 className="section-title">
                  <i className="fas fa-history me-2"></i>
                  Ticket History
                </h5>
                <div className="history-timeline">
                  {selectedTicket.history.map((entry, index) => (
                    <div key={index} className="timeline-item">
                      <div className="timeline-icon">
                        <i className="fas fa-circle"></i>
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <span className="status">{entry.status}</span>
                          <span className="date">
                            {new Date(entry.date).toLocaleString()}
                          </span>
                        </div>
                        <div className="timeline-body">
                          <p className="mb-1">
                            <strong>Updated By:</strong>{" "}
                            {entry.username || "Service Agent"}
                          </p>
                          <p className="mb-0">
                            <strong>Remarks:</strong>{" "}
                            {entry.remarks || "No remarks provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="no-ticket-selected">
              <i className="fas fa-ticket-alt"></i>
              <p>No ticket selected</p>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ServiceAgentDashboard;
