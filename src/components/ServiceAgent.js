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
import "../styles/ServiceAgent.css";
// Adjust the path as needed

const ServiceAgentDashboard = () => {
  const { agentId: paramAgentId } = useParams();
  const [tickets, setTickets] = useState([]);
  const [ticketDetails, setTicketDetails] = useState({});
  const [selectedTicket, setSelectedTicket] = useState(null);
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
      toast.error("Failed to fetch tickets. Please try again.");
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
        { Type }
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
    setUpdatingTickets((prev) => ({ ...prev, [ticketId]: true }));

    const updatedTicketDetails = ticketDetails[ticketId];
    try {
      const payload = {
        status: updatedTicketDetails?.status || "Open",
        remarks: updatedTicketDetails?.remarks,
        partName: updatedTicketDetails?.partName,
      };

      const response = await axios.put(
        `https://tms-server-saeo.onrender.com/tickets/update/${ticketId}`,
        payload
      );

      if (response.status === 200) {
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
        setTicketDetails((prevState) => ({
          ...prevState,
          [ticketId]: { status: payload.status, remarks: "", partName: "" },
        }));
      }
    } catch (error) {
      toast.error("Failed to update ticket. Please try again.");
    } finally {
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
      ticket.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.priority?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.trackingId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = debounce((term) => {
    setSearchTerm(term);
  }, 300);

  const handleShowDetails = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return (
    <Container fluid className="service-agent-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2 className="dashboard-title">
            <i className="fas fa-headset me-2"></i>
            Service Agent Dashboard
          </h2>
          <p className="dashboard-subtitle">
            Manage and resolve customer tickets efficiently
          </p>
        </div>
      </div>

      {/* Search and Refresh Section */}
      <div className="search-section">
        <div className="search-container">
          <div className="search-box">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="Search tickets by ID, customer, status..."
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <button
            className="refresh-button"
            onClick={fetchTickets}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <i className={`fas fa-sync-alt ${isHovered ? "rotate" : ""}`}></i>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Tickets Grid */}
      <div className="tickets-container">
        {loading ? (
          <div className="loading-container">
            <div className="loader">
              <Spinner animation="border" variant="primary" />
            </div>
            <p>Loading tickets...</p>
          </div>
        ) : (
          <Row className="tickets-grid">
            {filteredTickets.length > 0 ? (
              filteredTickets.map((ticket) => (
                <Col
                  lg={4}
                  md={6}
                  sm={12}
                  key={ticket._id}
                  className="ticket-col"
                >
                  <Card className="ticket-card">
                    <div className="ticket-header">
                      <div className="ticket-id">#{ticket.trackingId}</div>
                      <Badge
                        className={`status-badge status-${ticket.status.toLowerCase()}`}
                      >
                        {ticket.status}
                      </Badge>
                    </div>

                    <Card.Body className="ticket-body">
                      <div className="customer-info">
                        <div className="info-item">
                          <i className="fas fa-user"></i>
                          <span>{ticket.customerName}</span>
                        </div>
                        <div className="info-item">
                          <i className="fas fa-box"></i>
                          <span>{ticket.productType}</span>
                        </div>
                      </div>

                      <div className="ticket-description">
                        <p>{ticket.description}</p>
                      </div>

                      <Form
                        onSubmit={(e) => handleUpdateTicket(e, ticket._id)}
                        className="update-form"
                      >
                        <Form.Group className="mb-3">
                          <Form.Label className="form-label">
                            Update Status
                          </Form.Label>
                          <Form.Select
                            className="status-select"
                            onChange={(e) =>
                              handleInputChange(e, ticket._id, "status")
                            }
                            value={
                              ticketDetails[ticket._id]?.status || ticket.status
                            }
                          >
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                          </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label className="form-label">
                            Service Type
                          </Form.Label>
                          <Form.Select
                            className="type-select"
                            onChange={(e) =>
                              handleUpdateCall(ticket._id, e.target.value)
                            }
                            value={ticket?.Type || ""}
                          >
                            <option value="" disabled>
                              Select Service Type
                            </option>
                            <option value="Replacement">Replacement</option>
                            <option value="Repair">Repair</option>
                          </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label className="form-label">
                            Part Name
                          </Form.Label>
                          <Form.Select
                            className="part-select"
                            onChange={(e) =>
                              handleInputChange(e, ticket._id, "partName")
                            }
                            value={ticketDetails[ticket._id]?.partName || ""}
                          >
                            <option value="">Select Part</option>
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
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label className="form-label">
                            Remarks
                          </Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            placeholder="Enter your remarks..."
                            value={ticketDetails[ticket._id]?.remarks || ""}
                            onChange={(e) =>
                              handleInputChange(e, ticket._id, "remarks")
                            }
                            className="remarks-input"
                          />
                        </Form.Group>

                        <div className="button-group">
                          <Button
                            type="submit"
                            className="update-button"
                            disabled={updatingTickets[ticket._id]}
                          >
                            {updatingTickets[ticket._id] ? (
                              <>
                                <Spinner size="sm" /> Updating...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-save me-2"></i>
                                Update Ticket
                              </>
                            )}
                          </Button>

                          <Button
                            className="details-button"
                            onClick={() => handleShowDetails(ticket)}
                          >
                            <i className="fas fa-eye me-2"></i>
                            View Details
                          </Button>
                        </div>
                      </Form>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <div className="no-tickets">
                <i className="fas fa-ticket-alt"></i>
                <p>No tickets found</p>
              </div>
            )}
          </Row>
        )}
      </div>

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
              {/* Header with Tracking ID and Status */}
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

              {/* Main Details Grid */}
              <div className="details-grid">
                {/* Customer Information */}
                <div className="detail-section">
                  <h5 className="section-title">
                    <i className="fas fa-user-circle me-2"></i>
                    Customer Information
                  </h5>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Name:</span>
                      <span className="value">
                        {selectedTicket.customerName}
                      </span>
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

                {/* Product Information */}
                <div className="detail-section">
                  <h5 className="section-title">
                    <i className="fas fa-box me-2"></i>
                    Product Details
                  </h5>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Product Type:</span>
                      <span className="value">
                        {selectedTicket.productType}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">Model Type:</span>
                      <span className="value">{selectedTicket.modelType}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Serial Number:</span>
                      <span className="value">
                        {selectedTicket.serialNumber}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div className="detail-section">
                  <h5 className="section-title">
                    <i className="fas fa-map-marker-alt me-2"></i>
                    Location Details
                  </h5>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Address:</span>
                      <span className="value">{selectedTicket.address}</span>
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

                {/* Service Details */}
                <div className="detail-section">
                  <h5 className="section-title">
                    <i className="fas fa-cogs me-2"></i>
                    Service Details
                  </h5>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Service Type:</span>
                      <span className="value">
                        {selectedTicket.Type || "Not Specified"}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">Priority:</span>
                      <span className="value">{selectedTicket.priority}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Part Name:</span>
                      <span className="value">
                        {selectedTicket.partName || "Not Available"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description Section - Full Width */}
                <div className="detail-section description-section">
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
