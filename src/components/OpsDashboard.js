import React, { useState, useEffect } from "react";
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
import CountUp from "react-countup";
import debounce from "lodash.debounce";
import axios from "axios";
import "../App.css";
// import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { toast } from "react-toastify";
ChartJS.register(ArcElement, Tooltip, Legend);

const OpsManagerDashboard = () => {
  const [isSticky, setIsSticky] = useState(false);

  // Scroll event listener to toggle sticky state
  useEffect(() => {
    const onScroll = () => {
      setIsSticky(window.scrollY > 50);
    };

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Pie Chart States
  const [closedPendingStats, setClosedPendingStats] = useState({
    // closed: 0,
    // pending: 0,
  });
  const [assignResolveStats, setAssignResolveStats] = useState({
    // assigned: 0,
    // notAssigned: 0,
    // resolved: 0,
  });
  const [repairReplacementStats, setRepairReplacementStats] = useState({
    // repair: 0,
    // replacement: 0,
  });
  // Ticket and Service Agent States
  const [tickets, setTickets] = useState([]);
  const [serviceAgents, setServiceAgents] = useState([]);
  const [filter, setFilter] = useState({
    status: "",
    priority: "",
    call: "",
    assignedTo: "",
    Type: "",
    tat: "",
  });
  const [tatStats, setTatStats] = useState({
    threeToFour: 0,
    fiveToEight: 0,
    fourteenPlus: 0,
  });

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  // const [message, setMessage] = useState({ content: null, variant: null });
  const [historyVisible, setHistoryVisible] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const [updatingTickets, setUpdatingTickets] = useState({}); // Store updating status for each ticket

  const [ticketDetails, setTicketDetails] = useState({});

  // Debounced search handler
  const handleSearch = debounce((term) => setSearchTerm(term), 300);

  // // Utility function to set messages and auto-clear after 3 seconds
  // const showMessage = (content, variant = "success") => {
  //   setMessage({ content, variant });
  //   setTimeout(() => setMessage({ content: null, variant: null }), 3000);
  // };

  // Toggle visibility of history for a specific ticket
  const toggleHistory = (ticketId) => {
    setHistoryVisible((prev) => ({
      ...prev,
      [ticketId]: !prev[ticketId], // Toggle history visibility for this ticket
    }));
  };
  // Fetch tickets assigned to the operations manager
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://tms-server-saeo.onrender.com/tickets/ticket",
        {
          params: { opsManagerId: "ops@gmail.com" },
        }
      );
      setTickets(response.data);
    } catch (error) {
      toast.error("Failed to fetch tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch service agents
  const fetchServiceAgents = async () => {
    try {
      const response = await axios.get(
        "https://tms-server-saeo.onrender.com/tickets/role/serviceAgent",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setServiceAgents(response.data);
    } catch (error) {
      toast.error("Failed to fetch service agents. Please try again.");
    }
  };

  // Assign or unassign agent and update UI
  const updateTicketAssignment = async (ticketId, userId = null) => {
    try {
      await axios.put(
        `https://tms-server-saeo.onrender.com/tickets/update/${ticketId}`,
        {
          assignedTo: userId,
        }
      );
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket._id === ticketId
            ? { ...ticket, assignedTo: userId || "Not Assigned" }
            : ticket
        )
      );
      toast.success(
        userId
          ? "Agent assigned successfully!"
          : "Agent unassigned successfully!"
      );
    } catch (error) {
      toast.error("Failed to update assignment. Please try again.");
    }
  };

  // Update ticket call status
  const handleUpdateCall = async (ticketId, call) => {
    try {
      await axios.put(
        `https://tms-server-saeo.onrender.com/tickets/update/${ticketId}`,
        {
          call,
        }
      );
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket._id === ticketId ? { ...ticket, call } : ticket
        )
      );
      toast.success("Call updated successfully!");
    } catch (error) {
      toast.error("Failed to update call. Please try again.");
    }
  };

  // Handle updating ticket type
  const handleUpdateType = async (ticketId, Type) => {
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

  // Delete ticket and update UI
  const handleDelete = async (ticketId) => {
    try {
      await axios.delete(
        `https://tms-server-saeo.onrender.com/tickets/delete/${ticketId}`
      );
      setTickets((prevTickets) =>
        prevTickets.filter((ticket) => ticket._id !== ticketId)
      );
      toast.success("Ticket deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete ticket. Please try again.");
    }
  };

  // New

  // End
  // Filter tickets based on status, priority, and search term
  const filterTickets = () => {
    return tickets.filter((ticket) => {
      const matchesStatus = filter.status
        ? ticket.status === filter.status
        : true;
      const matchesPriority = filter.priority
        ? ticket.priority === filter.priority
        : true;
      const matchesAssigned = filter.assignedTo
        ? ticket.assignedTo === filter.assignedTo
        : true;
      const matchesType = filter.Type ? ticket.Type === filter.Type : true;
      const matchesCall = filter.call ? ticket.call === filter.call : true;

      // Apply TAT filter
      const matchesTAT = () => {
        const currentDate = new Date();
        const createdAt = new Date(ticket.createdAt); // Ensure ticket has createdAt field
        const ageInDays = Math.ceil(
          (currentDate - createdAt) / (1000 * 60 * 60 * 24)
        );

        if (filter.tat === "3-4 Days") return ageInDays >= 3 && ageInDays <= 4;
        if (filter.tat === "5-8 Days") return ageInDays >= 5 && ageInDays <= 8;
        if (filter.tat === "14+ Days") return ageInDays >= 14;
        return true; // Default: No TAT filter applied
      };

      const matchesSearchTerm =
        searchTerm &&
        (ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.contactNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          ticket.trackingId.toLowerCase().includes(searchTerm.toLowerCase()));

      return (
        matchesStatus &&
        matchesPriority &&
        matchesAssigned &&
        matchesType &&
        matchesCall &&
        matchesTAT() && // Apply TAT filter here
        (!searchTerm || matchesSearchTerm)
      );
    });
  };

  // Function to handle filter changes (and reset other filters when a new one is clicked)
  const handleFilterChange = (filterType, value) => {
    setFilter((prevFilter) => {
      const newFilter = { ...prevFilter };

      // Reset all filters and apply the new one
      Object.keys(newFilter).forEach((key) => {
        if (key !== filterType) {
          newFilter[key] = ""; // Reset all other filters
        }
      });

      newFilter[filterType] = value; // Set the selected filter
      return newFilter;
    });
  };

  // End Tat Filtering
  // Helper function to clear message after 3 seconds
  // const clearMessage = () => {
  //   setTimeout(() => {
  //     setMessage({ content: null, variant: null });
  //   }, 3000);
  // };

  // Update
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
                }
              : ticket
          )
        );

        toast.success("Ticket updated successfully!");

        // Reset the ticket details state after update
        setTicketDetails((prevState) => ({
          ...prevState,
          [ticketId]: { status: payload.status, remarks: "" }, // Reset remarks field
        }));
      } else {
        toast.error("Failed to update ticket. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to update ticket. Please try again.");
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

  // Fetch tickets and service agents on mount
  useEffect(() => {
    fetchTickets();
    fetchServiceAgents();
  }, []); // Empty dependency array ensures this effect runs only once

  useEffect(() => {
    if (!tickets || tickets.length === 0) {
      // Reset stats if tickets are empty
      setClosedPendingStats({
        closed: 0,
        pending: 0,
        resolved: 0,
        inprogress: 0,
      });
      setAssignResolveStats({ assigned: 0, notAssigned: 0 });
      setRepairReplacementStats({
        repair: 0,
        replacement: 0,
        received: 0,
        notReceived: 0,
      });
      setTatStats({ threeToFour: 0, fiveToEight: 0, fourteenPlus: 0 }); // Reset TAT stats
      return;
    }

    const currentDate = new Date();

    // Calculate TAT statistics
    const threeToFour = tickets.filter((ticket) => {
      const createdAt = new Date(ticket.createdAt); // Ensure `createdAt` exists
      const ageInDays = Math.ceil(
        (currentDate - createdAt) / (1000 * 60 * 60 * 24)
      );
      return ageInDays >= 3 && ageInDays <= 4;
    }).length;

    const fiveToEight = tickets.filter((ticket) => {
      const createdAt = new Date(ticket.createdAt);
      const ageInDays = Math.ceil(
        (currentDate - createdAt) / (1000 * 60 * 60 * 24)
      );
      return ageInDays >= 5 && ageInDays <= 8;
    }).length;

    const fourteenPlus = tickets.filter((ticket) => {
      const createdAt = new Date(ticket.createdAt);
      const ageInDays = Math.ceil(
        (currentDate - createdAt) / (1000 * 60 * 60 * 24)
      );
      return ageInDays >= 14;
    }).length;

    // Update TAT stats
    setTatStats({
      threeToFour,
      fiveToEight,
      fourteenPlus,
    });

    // Calculate Closed and Pending stats
    const closed = tickets.filter(
      (ticket) => ticket.status === "Closed"
    ).length;
    const pending = tickets.filter((ticket) => ticket.status === "Open").length;
    const inprogress = tickets.filter(
      (ticket) => ticket.status === "In Progress"
    ).length;
    const resolved = tickets.filter(
      (ticket) => ticket.status === "Resolved"
    ).length;

    // Update Closed vs Pending stats
    setClosedPendingStats({
      closed,
      pending,
      resolved,
      inprogress,
    });

    // Update statistics for Repair and Replacement
    const repair = tickets.filter((ticket) => ticket.Type === "Repair").length;
    const replacement = tickets.filter(
      (ticket) => ticket.Type === "Replacement"
    ).length;
    const received = tickets.filter(
      (ticket) => ticket.Type === "Received"
    ).length; // Fixed the Type check
    const notReceived = tickets.filter(
      (ticket) => ticket.Type === "Not Received"
    ).length; // Fixed the Type check

    setRepairReplacementStats({ repair, replacement, received, notReceived });

    const assigned = tickets.filter(
      (ticket) => ticket.assignedTo && ticket.assignedTo !== "Not Assigned"
    ).length;

    const notAssigned = tickets.filter(
      (ticket) => ticket.assignedTo === "Not Assigned"
    ).length;
    const softwareCalls = tickets.filter(
      (ticket) => ticket.call === "Software Call"
    ).length;
    const hardwareCalls = tickets.filter(
      (ticket) => ticket.call === "Hardware Call"
    ).length;

    // Update Assigned vs Not Assigned stats
    setAssignResolveStats({
      assigned,
      notAssigned,
      softwareCalls,
      hardwareCalls,
    });
  }, [tickets]);

  // // Pie chart data for Closed vs Pending vs Resolved
  // const closedPendingData = {
  //   labels: ["Closed", "Pending", "Resolved", "In Progress"],
  //   datasets: [
  //     {
  //       data: [
  //         closedPendingStats.closed,
  //         closedPendingStats.pending,
  //         closedPendingStats.resolved,
  //         closedPendingStats.inprogress,
  //       ],
  //       backgroundColor: ["#6CCF70", "#FFC658", "#5BA4FF", "#FF6E6E"], // Softer yet vibrant colors
  //       hoverBackgroundColor: ["#8FE89A", "#FFD88A", "#85C1FF", "#FF9191"], // Subtle pastel-like transitions
  //     },
  //   ],
  // };

  // // Pie chart data for Repair, Replacement, Received, Not Received
  // const RepairReplacementData = {
  //   labels: ["Replacement", "Repair", "Received", "Not Received"],
  //   datasets: [
  //     {
  //       data: [
  //         repairReplacementStats.replacement,
  //         repairReplacementStats.repair,
  //         repairReplacementStats.received,
  //         repairReplacementStats.notReceived,
  //       ],
  //       backgroundColor: [
  //         "#FFB84D", // Replacement (Warm Gold)
  //         "#00B5B8", // Repair (Teal)
  //         "#00D84A", // Received (Vibrant Lime Green)
  //         "#D9534F", // Not Received (Rich Red)
  //       ],
  //       hoverBackgroundColor: [
  //         "#FF9A00", // Hover for Replacement (Darker Gold)
  //         "#00A2A3", // Hover for Repair (Darker Teal)
  //         "#00B033", // Hover for Received (Darker Lime Green)
  //         "#C9302C", // Hover for Not Received (Darker Red)
  //       ],
  //     },
  //   ],
  // };

  // // Pie chart data for Assigned vs Not Assigned
  // const assignResolveData = {
  //   labels: ["Assigned", "Not Assigned"],
  //   datasets: [
  //     {
  //       data: [assignResolveStats.assigned, assignResolveStats.notAssigned],
  //       backgroundColor: ["#FF6F61", "#A2DFF7"], // Warm coral and light sky blue
  //       hoverBackgroundColor: ["#FF9F89", "#72C7D4"], // Soft peach and pastel blue
  //     },
  //   ],
  // };

  return (
    <Container className="mt-5">
      <h2
        className="mb-4"
        style={{
          background: "linear-gradient(90deg, #6a11cb, #2575fc)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          display: "flex",
          justifyContent: "center",
          textShadow: "2px 2px 8px rgba(0, 0, 0, 0.3)",
          fontFamily: "'Poppins', sans-serif",
          fontWeight: "bold",
          fontSize: "2.5rem",
        }}
      >
        Ops Manager: Streamline Ticket Management
      </h2>

      {/* {message.content && (
        <Alert variant={message.variant}>{message.content}</Alert>
      )}{" "} */}
      {/* Hero Section */}
      <div
        className="d-flex flex-wrap justify-content-between align-items-center mb-4"
        style={{
          background: "linear-gradient(90deg, #6a11cb, #2575fc)",
          padding: "1.5rem",
          borderRadius: "12px",
          color: "white",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Header Section */}
        <div className="col-md-12 mb-3">
          <h3
            style={{
              fontWeight: "600",
              fontSize: "1.5rem",
              marginBottom: "0.5rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            Dashboard Overview
          </h3>
          <p
            style={{
              fontSize: "0.9rem",
              color: "white",
              marginBottom: "0",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            Monitor ticket statistics and trends at a glance.
          </p>
        </div>

        {/* Metrics Section */}
        <div className="col-md-12 d-flex flex-wrap justify-content-around">
          {/* Ticket Statistics */}
          <div className="metric-section">
            <h4
              className="section-title"
              // style={{
              //   display: "flex",
              //   justifyContent: "center",
              //   alignItems: "center",
              // }}
            >
              Ticket Statistics
            </h4>
            <div className="d-flex flex-wrap justify-content-around">
              <div
                className="summary-card text-center"
                onClick={() => handleFilterChange(tickets.length)}
              >
                <p
                  className="metric-title "
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  Total Tickets
                </p>
                <h4 className="metric-value">
                  <CountUp end={tickets.length} duration={2} />
                </h4>
              </div>
              <div
                className="summary-card text-center"
                onClick={() => handleFilterChange("status", "Closed")}
              >
                <p
                  className="metric-title "
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  Closed Tickets
                </p>
                <h4 className="metric-value">
                  <CountUp end={closedPendingStats.closed} duration={2} />
                </h4>
              </div>
              <div
                className="summary-card text-center"
                onClick={() => handleFilterChange("status", "Open")}
              >
                <p
                  className="metric-title mb-1"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  Pending Tickets
                </p>
                <h4 className="metric-value">
                  <CountUp end={closedPendingStats.pending} duration={2} />
                </h4>
              </div>
            </div>
          </div>

          {/* Call Types */}
          <div className="metric-section">
            <h4
              className="section-title"
              // style={{
              //   display: "flex",
              //   justifyContent: "center",
              //   alignItems: "center",
              // }}
            >
              Call Types
            </h4>
            <div className="d-flex flex-wrap justify-content-around">
              <div
                className="summary-card text-center"
                onClick={() => handleFilterChange("call", "Software Call")}
              >
                <p
                  className="metric-title "
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  Software Calls
                </p>
                <h4 className="metric-value">
                  <CountUp
                    end={assignResolveStats.softwareCalls}
                    duration={2}
                  />
                </h4>
              </div>
              <div
                className="summary-card text-center"
                onClick={() => handleFilterChange("call", "Hardware Call")}
              >
                <p
                  className="metric-title mb-1"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  Hardware Calls
                </p>
                <h4 className="metric-value">
                  <CountUp
                    end={assignResolveStats.hardwareCalls}
                    duration={2}
                  />
                </h4>
              </div>
            </div>
          </div>

          {/* Assignment Status */}
          <div className="metric-section">
            <h4
              className="section-title"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              Assignment Status
            </h4>
            <div className="d-flex flex-wrap justify-content-around">
              <div
                className="summary-card text-center"
                onClick={() => handleFilterChange(assignResolveStats.assigned)}
              >
                <p
                  className="metric-title mb-1"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  Assigned Tickets
                </p>
                <h4>
                  <CountUp end={assignResolveStats.assigned} duration={2} />
                </h4>
              </div>
              <div
                className="summary-card text-center"
                onClick={() =>
                  handleFilterChange(assignResolveStats.notAssigned)
                }
              >
                <p
                  className="metric-title mb-1"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  Not Assigned Tickets
                </p>
                <h4 className="metric-value">
                  <CountUp end={assignResolveStats.notAssigned} duration={2} />
                </h4>
              </div>
            </div>
          </div>

          {/* Repair/Replacement Status */}
          <div className="metric-section">
            <h4
              className="section-title"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              Repair & Replacement
            </h4>
            <div className="d-flex flex-wrap justify-content-around">
              <div
                className="summary-card text-center"
                onClick={() => handleFilterChange("Type", "Repair")}
              >
                <p
                  className="metric-title mb-1"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  Repair Requests
                </p>
                <h4 className="metric-value">
                  <CountUp end={repairReplacementStats.repair} duration={2} />
                </h4>
              </div>
              <div
                className="summary-card text-center"
                onClick={() => handleFilterChange("Type", "Replacement")}
              >
                <p
                  className="metric-title mb-1"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  Replacement Requests
                </p>
                <h4 className="metric-value">
                  <CountUp
                    end={repairReplacementStats.replacement}
                    duration={2}
                  />
                </h4>
              </div>
            </div>
          </div>

          {/* Receiving Status */}
          <div className="col-md-14 d-flex flex-wrap justify-content-around">
            <div className="metric-section">
              <h4
                className="section-title"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                Receiving Status
              </h4>
              <div className="d-flex flex-wrap justify-content-around">
                <div
                  className="summary-card text-center"
                  onClick={() => handleFilterChange("Type", "Received")}
                >
                  <p
                    className="metric-title mb-1"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    Received Tickets
                  </p>
                  <h4 className="metric-value">
                    <CountUp
                      end={repairReplacementStats.received}
                      duration={2}
                    />
                  </h4>
                </div>
                <div
                  className="summary-card text-center"
                  onClick={() => handleFilterChange("Type", "Not Received")}
                >
                  <p
                    className="metric-title mb-1"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    Not Received Tickets
                  </p>
                  <h4 className="metric-value">
                    <CountUp
                      end={repairReplacementStats.notReceived}
                      duration={2}
                    />
                  </h4>
                </div>
              </div>
            </div>
            <div className="metric-section">
              <h4
                className="section-title"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                Ticket Age Metrics
              </h4>

              <div className="d-flex flex-wrap justify-content-around">
                {/* 3–4 Days Filter */}
                <div
                  className="summary-card text-center"
                  onClick={() => handleFilterChange("tat", "3-4 Days")}
                >
                  <p className="metric-title">3–4 Days</p>
                  <h4 className="metric-value">
                    <CountUp end={tatStats.threeToFour} duration={2} />
                  </h4>
                </div>

                {/* 5–8 Days Filter */}
                <div
                  className="summary-card text-center"
                  onClick={() => handleFilterChange("tat", "5-8 Days")}
                >
                  <p className="metric-title">5–8 Days</p>
                  <h4 className="metric-value">
                    <CountUp end={tatStats.fiveToEight} duration={2} />
                  </h4>
                </div>

                {/* 14 Days or More Filter */}
                <div
                  className="summary-card text-center"
                  onClick={() => handleFilterChange("tat", "14+ Days")}
                >
                  <p className="metric-title mb-1">14 Days or More</p>
                  <h4 className="metric-value">
                    <CountUp end={tatStats.fourteenPlus} duration={2} />
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section End */}
      {/* Hero Section  End Here*/}
      {/* Pies */}
      {/* <div className="mt-5 d-flex justify-content-center">
        <Card className="w-100 border-0 rounded-3">
          <Card.Body>
            <Card.Title className="text-center fs-4 mb-4 font-weight-bold">
           
            </Card.Title>
            <div className="d-flex flex-wrap justify-content-between align-items-center">
         
              <div className="pie-chart-container col-14 col-sm-6 col-md-4 col-lg-4 mb-4">
                <div className="chart-wrapper mx-auto">
                  <Pie
                    data={closedPendingData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        tooltip: {
                          enabled: true,
                        },
                      },
                    }}
                    height={300} 
                  />
                </div>
              </div>

              <div className="pie-chart-container col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
                <div className="chart-wrapper mx-auto">
                  <Pie
                    data={assignResolveData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        tooltip: {
                          enabled: true,
                        },
                      },
                    }}
                    height={300} 
                  />
                </div>
              </div>

          
              <div className="pie-chart-container col-12 col-sm-6 col-md-4 col-lg-4 mb-4">
                <div className="chart-wrapper mx-auto">
                  <Pie
                    data={RepairReplacementData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        tooltip: {
                          enabled: true,
                        },
                      },
                    }}
                    height={300} 
                  />
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div> */}
      {/* Pies */}
      {/* Forms */}
      <Form className="mb-4 ">
        <Row>
          <div
            className={`search-bar-container ${isSticky ? "sticky" : ""}`}
            style={{
              position: isSticky ? "fixed" : "relative",
              top: 0,
              left: 0, // Ensures the sticky element spans from the left edge
              zIndex: 1000,
              width: "100vw", // Full width of the viewport
              backgroundColor: isSticky
                ? "rgba(255, 255, 255, 0.7)"
                : "transparent",
              transition: "background-color 0.3s ease",
              backdropFilter: isSticky ? "blur(10px)" : "none",
              padding: "15px 0",
              boxShadow: isSticky ? "0 4px 15px rgba(0, 0, 0, 0.1)" : "none",
              display: "flex", // Flexbox for alignment
              justifyContent: "center", // Center contents horizontally
              alignItems: "center", // Center contents vertically if needed
            }}
          >
            <div className="container-fluid">
              <div className="row align-items-center">
                {/* Search Input */}
                <div className="col-12 col-lg-6 mb-3 mb-lg-0">
                  <Form.Control
                    type="text"
                    placeholder="🔍 Search by Tracking ID, Customer Name, Customer No. or Bill No."
                    onChange={(e) => handleSearch(e.target.value)}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "50px",
                      padding: "10px 20px",
                      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
                      maxWidth: "100%", // Ensures the search bar takes full width within its column
                    }}
                  />
                </div>

                {/* Filter by Status */}
                <div className="col-6 col-lg-3">
                  <Form.Select
                    onChange={(e) =>
                      setFilter({ ...filter, status: e.target.value })
                    }
                    value={filter.status}
                    aria-label="Filter by Status"
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "30px",
                      padding: "10px 20px",
                      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
                    }}
                  >
                    <option value="">Filter by Status</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </Form.Select>
                </div>

                {/* Filter by Priority */}
                <div className="col-6 col-lg-3">
                  <Form.Select
                    onChange={(e) =>
                      setFilter({ ...filter, priority: e.target.value })
                    }
                    value={filter.priority}
                    aria-label="Filter by Priority"
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "30px",
                      padding: "10px 20px",
                      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
                    }}
                  >
                    <option value="">Filter by Priority</option>
                    <option value="High">High</option>
                    <option value="Normal">Normal</option>
                    <option value="Low">Low</option>
                  </Form.Select>
                </div>
              </div>
            </div>
          </div>
        </Row>
      </Form>
      {/* Forms End */}
      <Row>
        {loading ? (
          <Spinner animation="border" variant="primary" />
        ) : filterTickets().length > 0 ? (
          filterTickets().map((ticket) => (
            <Col md={4} key={ticket._id} className="mb-4">
              <Card className="shadow-lg">
                <Card.Body>
                  <Card.Title>
                    <strong>Customer Name: </strong>
                    {ticket.customerName}
                    <div
                      style={{
                        position: "absolute",
                        top: "9px", // Adjust the top position as needed
                        right: "0", // Fix the div to the right side
                        marginRight: "6px",
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                      }}
                    >
                      {" "}
                      {/* DELETE */}
                      <>
                        <button
                          className="deleteButton"
                          onClick={() => handleDelete(ticket._id)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 50 59"
                            className="bin"
                          >
                            <path
                              fill="#B5BAC1"
                              d="M0 7.5C0 5.01472 2.01472 3 4.5 3H45.5C47.9853 3 50 5.01472 50 7.5V7.5C50 8.32843 49.3284 9 48.5 9H1.5C0.671571 9 0 8.32843 0 7.5V7.5Z"
                            />
                            <path
                              fill="#B5BAC1"
                              d="M17 3C17 1.34315 18.3431 0 20 0H29.3125C30.9694 0 32.3125 1.34315 32.3125 3V3H17V3Z"
                            />
                            <path
                              fill="#B5BAC1"
                              d="M2.18565 18.0974C2.08466 15.821 3.903 13.9202 6.18172 13.9202H43.8189C46.0976 13.9202 47.916 15.821 47.815 18.0975L46.1699 55.1775C46.0751 57.3155 44.314 59.0002 42.1739 59.0002H7.8268C5.68661 59.0002 3.92559 57.3155 3.83073 55.1775L2.18565 18.0974ZM18.0003 49.5402C16.6196 49.5402 15.5003 48.4209 15.5003 47.0402V24.9602C15.5003 23.5795 16.6196 22.4602 18.0003 22.4602C19.381 22.4602 20.5003 23.5795 20.5003 24.9602V47.0402C20.5003 48.4209 19.381 49.5402 18.0003 49.5402ZM29.5003 47.0402C29.5003 48.4209 30.6196 49.5402 32.0003 49.5402C33.381 49.5402 34.5003 48.4209 34.5003 47.0402V24.9602C34.5003 23.5795 33.381 22.4602 32.0003 22.4602C30.6196 22.4602 29.5003 23.5795 29.5003 24.9602V47.0402Z"
                              clipRule="evenodd"
                              fillRule="evenodd"
                            />
                            <path
                              fill="#B5BAC1"
                              d="M2 13H48L47.6742 21.28H2.32031L2 13Z"
                            />
                          </svg>
                          <span className="tooltip">Delete</span>
                        </button>
                      </>
                      {/* DELETE */}
                    </div>
                  </Card.Title>
                  <hr />
                  <Card.Text>
                    <strong>Description: </strong>
                    {ticket.description}
                  </Card.Text>
                  <Card.Text>
                    <strong>Assigned Agent:</strong>{" "}
                    {ticket.assignedTo || "Not Assigned"}
                  </Card.Text>
                  <Card.Text>
                    <strong>Priority:</strong>{" "}
                    <Badge
                      bg={
                        ticket.priority === "High"
                          ? "danger"
                          : ticket.priority === "Normal"
                          ? "warning"
                          : "info"
                      }
                    >
                      {ticket.priority}
                    </Badge>
                  </Card.Text>
                  <Card.Text>
                    <strong>Status:</strong>{" "}
                    <Badge
                      bg={
                        ticket.status === "Open"
                          ? "primary" // Blue for "Open"
                          : ticket.status === "In Progress"
                          ? "info" // Light blue for "In Progress"
                          : ticket.status === "Resolved"
                          ? "success" // Green for "Resolved"
                          : ticket.status === "Closed"
                          ? "secondary" // Grey for "Closed"
                          : "dark" // Fallback color
                      }
                      style={{
                        fontSize: "14px", // Slightly larger font for better readability
                        padding: "5px 10px", // Add some padding for better styling
                        borderRadius: "10px", // Rounded badge for modern look
                        marginLeft: "10px", // Add space after "Status"
                        textTransform: "capitalize", // Make the text properly cased
                      }}
                    >
                      {ticket.status}
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

                  {/* Call Update Dropdown */}

                  <Form.Select
                    className="custom-dropdown"
                    aria-label="Update Call"
                    onChange={(e) =>
                      handleUpdateType(ticket?._id, e.target.value)
                    }
                    value={ticket?.Type || ""}
                    disabled={!ticket?._id} // Disable dropdown if there's no ticket._id
                  >
                    <option value="" disabled>
                      -- Select If Replacement --
                    </option>
                    <option value="Not Received">Not Received</option>
                    <option value="Received">Received</option>
                  </Form.Select>
                  <Form.Select
                    className="my-2"
                    aria-label="Update Call"
                    onChange={(e) =>
                      handleUpdateCall(ticket._id, e.target.value)
                    }
                    value={ticket.call}
                  >
                    <option value="" disabled>
                      -- Select Call Type --
                    </option>
                    <option value="Hardware Call">Hardware Call</option>
                    <option value="Software Call">Software Call</option>
                  </Form.Select>

                  {/* Assign/Unassign Agent */}
                  <Form.Select
                    aria-label="Select Service Agent"
                    onChange={(e) =>
                      updateTicketAssignment(ticket._id, e.target.value)
                    }
                    value={ticket.assignedTo || ""}
                    className="mt-2"
                  >
                    <option value="">Assign Service Agent</option>
                    {serviceAgents.map((agent) => (
                      <option key={agent._id} value={agent.username}>
                        {agent.username}
                      </option>
                    ))}
                  </Form.Select>
                  {/* Status Update Dropdown */}
                  <Form.Select
                    className="my-2"
                    aria-label="Update Status"
                    onChange={(e) => handleInputChange(e, ticket._id, "status")}
                    value={ticketDetails[ticket._id]?.status || ticket.status}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </Form.Select>

                  {/* Remarks and status Form */}

                  <form onSubmit={(e) => handleUpdateTicket(e, ticket._id)}>
                    <div className="mb-3">
                      <input
                        type="text"
                        className="form-control my-2"
                        style={{
                          margin: "0 auto",
                          border: "1px solid #ddd", // Soft grey solid border
                          borderRadius: "5px", // Slightly rounded corners
                        }}
                        placeholder="Enter Remarks"
                        value={ticketDetails[ticket._id]?.remarks || ""}
                        onChange={(e) =>
                          handleInputChange(e, ticket._id, "remarks")
                        }
                      />
                    </div>

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

                      {/* Unassign Button */}
                      <Button
                        variant="warning"
                        onClick={() => updateTicketAssignment(ticket._id, "")}
                        className="mt-2"
                        style={{
                          width: "100%",
                          backgroundColor: "#ffc107",
                          color: "black",
                          borderRadius: "50px",
                          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)", // Subtle shadow
                          transition: "all 0.3s ease", // Smooth transition for hover effect
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.backgroundColor = "#ff9800")
                        } // Hover background color
                        onMouseLeave={(e) =>
                          (e.target.style.backgroundColor = "#ffc107")
                        } // Reset background color
                      >
                        Unassign Agent
                      </Button>

                      {/* View Details Button */}
                      <Button
                        variant="info"
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setShowModal(true);
                        }}
                        className="mt-2"
                        style={{
                          width: "100%",
                          backgroundColor: "lightblue",
                          border: "none",
                          color: "black",
                          borderRadius: "50px",
                          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)", // Subtle shadow
                          transition: "all 0.3s ease", // Smooth transition for hover effect
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.backgroundColor = "#81d4fa")
                        } // Hover background color
                        onMouseLeave={(e) =>
                          (e.target.style.backgroundColor = "lightblue")
                        } // Reset background color
                      >
                        View Details
                      </Button>
                    </div>
                  </form>

                  {/* End Buttons */}
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col md={12}>
            <p>No tickets found for the selected criteria.</p>
          </Col>
        )}
      </Row>
      {/* Modal for showing detailed ticket information */}
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
                <strong>Bill Number:</strong> {selectedTicket.billNumber}
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
              <p>
                <strong>History:</strong>{" "}
                <button
                  type="button"
                  onClick={() => toggleHistory(selectedTicket._id)}
                  className="button mx-2 "
                  style={{
                    height: "40px",
                    padding: "8px 20px",
                    background: "linear-gradient(90deg, #6a11cb, #2575fc)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    fontSize: "14px",
                    borderRadius: "50px",
                    transition: "background-color 0.3s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#0056b3")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "#007bff")
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-arrow-repeat"
                    viewBox="0 0 16 16"
                    style={{ marginRight: "8px" }}
                  >
                    <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"></path>
                    <path
                      fillRule="evenodd"
                      d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"
                    ></path>
                  </svg>
                  {historyVisible[selectedTicket._id]
                    ? "Hide History"
                    : "Show History"}
                </button>
              </p>
              {/* Ticket History */}

              {/* Ticket History */}
              {historyVisible[selectedTicket._id] && (
                <ul
                  style={{
                    marginTop: "10px",
                    padding: "10px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {selectedTicket.history.map((entry, index) => (
                    <li
                      key={index}
                      style={{
                        padding: "8px 12px",
                        borderBottom: "1px solid #ddd",
                        fontSize: "14px",
                        color: "#333",
                        lineHeight: "1.6",
                        transition: "background-color 0.3s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = "#f1f1f1")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = "#fff")
                      }
                    >
                      <strong>Status:</strong> {entry.status} <br />
                      <strong>Date:</strong>{" "}
                      {new Date(entry.date).toLocaleDateString()}{" "}
                      {new Date(entry.date).toLocaleTimeString()} <br />
                      <strong>Updated By:</strong> {entry.username || "Unknown"}{" "}
                      <br />
                      <strong>Remarks:</strong>{" "}
                      {entry.remarks || "No remarks provided"}
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p>Loading ticket details...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default OpsManagerDashboard;
