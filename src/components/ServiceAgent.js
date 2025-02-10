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
      <div className="table-container">
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Tracking ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Status</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr key={ticket._id}>
                  <td>{ticket.trackingId}</td>
                  <td>{ticket.customerName}</td>
                  <td>{ticket.productType}</td>
                  <td>
                    <Badge
                      className={`status-badge status-${ticket.status.toLowerCase()}`}
                    >
                      {ticket.status}
                    </Badge>
                  </td>
                  <td>{ticket.Type || "Not Specified"}</td>
                  <td>
                    <div className="action-buttons">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={(e) => handleUpdateTicket(e, ticket._id)}
                      >
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => handleShowDetails(ticket)}
                      >
                        <i className="fas fa-eye"></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
                <div className="detail-group">
                  <div className="detail-item">
                    <i className="fas fa-user me-2"></i>
                    <span className="detail-label">Customer:</span>
                    <span className="detail-value">
                      {selectedTicket.customerName}
                    </span>
                  </div>

                  <div className="detail-item">
                    <i className="fas fa-phone me-2"></i>
                    <span className="detail-label">Contact:</span>
                    <span className="detail-value">
                      {selectedTicket.contactNumber}
                    </span>
                  </div>

                  <div className="detail-item">
                    <i className="fas fa-envelope me-2"></i>
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedTicket.email}</span>
                  </div>

                  <div className="detail-item">
                    <i className="fas fa-building me-2"></i>
                    <span className="detail-label">Organization:</span>
                    <span className="detail-value">
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
                <div className="detail-group">
                  <div className="detail-item">
                    <i className="fas fa-box me-2"></i>
                    <span className="detail-label">Product Type:</span>
                    <span className="detail-value">
                      {selectedTicket.productType}
                    </span>
                  </div>

                  <div className="detail-item">
                    <i className="fas fa-cog me-2"></i>
                    <span className="detail-label">Model Type:</span>
                    <span className="detail-value">
                      {selectedTicket.modelType}
                    </span>
                  </div>

                  <div className="detail-item">
                    <i className="fas fa-barcode me-2"></i>
                    <span className="detail-label">Serial Number:</span>
                    <span className="detail-value">
                      {selectedTicket.serialNumber}
                    </span>
                  </div>

                  <div className="detail-item">
                    <i className="fas fa-tools me-2"></i>
                    <span className="detail-label">Part Name:</span>
                    <span className="detail-value">
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
                <div className="detail-group">
                  <div className="detail-item">
                    <i className="fas fa-map-marker-alt me-2"></i>
                    <span className="detail-label">Address:</span>
                    <span className="detail-value">
                      {selectedTicket.address}
                    </span>
                  </div>

                  <div className="detail-item">
                    <i className="fas fa-city me-2"></i>
                    <span className="detail-label">City:</span>
                    <span className="detail-value">{selectedTicket.city}</span>
                  </div>

                  <div className="detail-item">
                    <i className="fas fa-map me-2"></i>
                    <span className="detail-label">State:</span>
                    <span className="detail-value">{selectedTicket.state}</span>
                  </div>
                </div>
              </div>

              {/* Service Details Section */}
              <div className="detail-section">
                <h5 className="section-title">
                  <i className="fas fa-cogs me-2"></i>
                  Service Details
                </h5>
                <div className="detail-group">
                  <div className="detail-item">
                    <i className="fas fa-wrench me-2"></i>
                    <span className="detail-label">Service Type:</span>
                    <span className="detail-value">
                      {selectedTicket.Type || "Not Specified"}
                    </span>
                  </div>

                  <div className="detail-item">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    <span className="detail-label">Priority:</span>
                    <span className="detail-value">
                      {selectedTicket.priority}
                    </span>
                  </div>

                  <div className="detail-item">
                    <i className="fas fa-phone-alt me-2"></i>
                    <span className="detail-label">Call Type:</span>
                    <span className="detail-value">
                      {selectedTicket.call || "Not Specified"}
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
                <div className="detail-item description">
                  <span className="detail-value">
                    {selectedTicket.description}
                  </span>
                </div>
              </div>

              {/* History Section */}
              <div className="detail-section">
                <h5 className="section-title">
                  <i className="fas fa-history me-2"></i>
                  Ticket History
                </h5>
                <div className="history-section">
                  {selectedTicket.history.map((entry, index) => (
                    <div key={index} className="history-item">
                      <div className="history-status">
                        <i className="fas fa-circle me-2"></i>
                        {entry.status}
                      </div>
                      <small className="text-muted">
                        {new Date(entry.date).toLocaleString()}
                      </small>
                      <div className="history-details">
                        <p>
                          <strong>Updated By:</strong>{" "}
                          {entry.username || "Service Agent"}
                        </p>
                        <p>
                          <strong>Remarks:</strong>{" "}
                          {entry.remarks || "No remarks provided"}
                        </p>
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
