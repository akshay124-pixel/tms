import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Badge,
  Row,
  Spinner,
  Col,
} from "react-bootstrap";
import CountUp from "react-countup";
import axios from "axios";
// import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { FaEye } from "react-icons/fa"; // Import icons
import "../App.css";
import { toast } from "react-toastify";
// Register required chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title);
const AdminDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false); // State for details modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [status, setStatus] = useState("Open");
  const [opsManager, setOpsManager] = useState("");
  const [priority, setPriority] = useState("Normal");
  const operationsManagers = ["OPS Manager"];
  const [historyVisible, setHistoryVisible] = useState({});
  const [loading, setLoading] = useState(false);
  const [closedPendingStats, setClosedPendingStats] = useState({
    closed: 0,
    pending: 0,
  });
  const [assignResolveStats, setAssignResolveStats] = useState({
    assigned: 0,
    notAssigned: 0,
    resolved: 0,
  });
  const [tatStats, setTatStats] = useState({
    threeToFour: 0,
    fiveToEight: 0,
    fourteenPlus: 0,
  });
  const [filter, setFilter] = useState({
    status: "",
    priority: "",
    call: "",
    assignedTo: "",
    Type: "",
    tat: "",
  });
  // Pie Chart States

  const [repairReplacementStats, setRepairReplacementStats] = useState({
    // repair: 0,
    // replacement: 0,
  });
  // Fetch all tickets from the API
  const fetchTickets = async () => {
    try {
      const response = await axios.get(
        "https://tms-server-saeo.onrender.com/tickets/ticket"
      );
      setTickets(response.data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };
  // Toggle visibility of history for a specific ticket
  const toggleHistory = (ticketId) => {
    setHistoryVisible((prev) => ({
      ...prev,
      [ticketId]: !prev[ticketId], // Toggle history visibility for this ticket
    }));
  };
  // Calculate ticket statistics
  const calculateStatistics = () => {
    const totalTickets = tickets.length;
    const pendingTickets = tickets.filter(
      (ticket) => ticket.status === "Open"
    ).length;
    const closedTickets = tickets.filter(
      (ticket) => ticket.status === "Closed"
    ).length;
    const assignedTickets = tickets.filter(
      (ticket) => ticket.assignedTo
    ).length;

    return [
      {
        name: "Pending",
        value: pendingTickets,
        label: `${pendingTickets} Pending`,
      },
      {
        name: "Closed",
        value: closedTickets,
        label: `${closedTickets} Closed`,
      },
      {
        name: "Assigned",
        value: assignedTickets,
        label: `${assignedTickets} Assigned`,
      },
      {
        name: "Total Tickets",
        value: totalTickets,
        label: `${totalTickets} Total`,
      },
    ];
  };

  // Calculate resolved and pending statistics for the second pie chart
  const calculateResolvePendingStatistics = () => {
    const resolvedTickets = tickets.filter(
      (ticket) => ticket.status === "Resolved"
    ).length;
    const pendingTickets = tickets.filter(
      (ticket) => ticket.status === "Open" || ticket.status === "In Progress"
    ).length;

    return [
      {
        name: "Resolved",
        value: resolvedTickets,
        label: `${resolvedTickets} Resolved`,
      },
      {
        name: "Pending",
        value: pendingTickets,
        label: `${pendingTickets} Pending`,
      },
    ];
  };

  // Open modal for updating ticket
  const handleShow = (ticket) => {
    setSelectedTicket(ticket);
    setStatus(ticket.status);
    setOpsManager(ticket.assignedTo || "");
    setPriority(ticket.priority || "Normal");
    setShowModal(true);
  };
  // Delete ticket
  const handleDelete = async (ticketId) => {
    try {
      await axios.delete(
        `https://tms-server-saeo.onrender.com/tickets/delete/${ticketId}`
      );
      toast.success("Ticket deleted successfully!");

      fetchTickets();
    } catch (error) {
      toast.error("Failed to delete ticket. Please try again.");
    }
  };
  // Handle ticket status update
  const handleUpdate = async () => {
    if (!selectedTicket) return;
    try {
      await axios.put(
        `https://tms-server-saeo.onrender.com/tickets/update/${selectedTicket._id}`,
        {
          status,
          assignedTo: opsManager,
          priority,
        }
      );
      toast.success("Ticket updated successfully!");
      setShowModal(false);
      fetchTickets();
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  };
  // Filtering
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

      return (
        matchesStatus &&
        matchesPriority &&
        matchesAssigned &&
        matchesType &&
        matchesCall &&
        matchesTAT()
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
  // // Handle ticket closure
  // const handleCloseTicket = async (ticketId) => {
  //   try {
  //     await axios.put(`https://tms-server-saeo.onrender.com/tickets/update/${ticketId}`, {
  //       status: "Closed",
  //       assignedTo: "",
  //     });
  //     alert("Ticket closed successfully!");
  //     fetchTickets();
  //   } catch (error) {
  //     console.error("Error closing ticket:", error);
  //   }
  // };

  // View Ticket Details
  const handleViewDetails = (ticket) => {
    setSelectedTicket(ticket);
    setShowDetailsModal(true);
  };

  useEffect(() => {
    fetchTickets();
  }, []);
  // Updating statistics whenever tickets change
  // Updating statistics whenever tickets change
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
  // // Pie chart data for Closed vs Pending
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
  //       backgroundColor: ["#F7A072", "#91C483", "#6E85B7", "#FFC75F"], // Energetic and vibrant palette
  //       hoverBackgroundColor: ["#FABE94", "#A8D6A2", "#8BA3D1", "#FFD98E"], // Softer hover effects
  //     },
  //   ],
  // };

  // // Pie chart data for Assigned, Not Assigned, Resolved
  // const assignResolveData = {
  //   labels: ["Assigned", "Not Assigned"],
  //   datasets: [
  //     {
  //       data: [assignResolveStats.assigned, assignResolveStats.notAssigned],
  //       backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
  //       hoverBackgroundColor: ["#FF8099", "#64B5F6", "#FFE082"],
  //     },
  //   ],
  // };

  // Data for the pie charts
  const data = calculateStatistics();
  const resolvePendingData = calculateResolvePendingStatistics();

  // Sort tickets by priority
  const sortedTickets = [...tickets].sort((a, b) => {
    const priorityOrder = { Low: 1, Normal: 2, High: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

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
        }}
      >
        Admin Dashboard: Manage Everything Seamlessly
      </h2>

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
      {/* Ticket Statistics Section */}
      <Card className="mb-4 shadow-sm no-border">
        <Card.Body>
          <Row>
            {/* Pies */}

            {/* <div className="mt-4 d-flex justify-content-center">
              <Card className="w-100 border-0 rounded-3">
                <Card.Body>
                  <Card.Title
                    className="text-center mb-4"
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                    }}
                  ></Card.Title>
                  <div className="row g-4 justify-content-between">
                  
                    <div className="col-12 col-md-6 text-center">
                      <div className="w-75 mx-auto">
                        <Pie data={closedPendingData} />
                      </div>
                    </div>

                   
                    <div className="col-12 col-md-6 text-center">
                      <div className="w-75 mx-auto">
                        <Pie data={assignResolveData} />
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div> */}

            {/* Pies */}
          </Row>
        </Card.Body>
      </Card>

      <Card className="mb-4 shadow-lg">
        <Card.Body>
          <h4>All Customer Tickets</h4>
          <Table responsive striped bordered hover className="text-center">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Description</th>
                <th>Product Type</th>
                <th>Serial Number</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Actions</th> {/* Actions Column */}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center">
                    <Spinner animation="border" variant="primary" />
                  </td>
                </tr>
              ) : filterTickets().length > 0 ? (
                filterTickets().map((ticket) => (
                  <tr key={ticket._id}>
                    <td>{ticket.customerName}</td>
                    <td>{ticket.description}</td>
                    <td>{ticket.productType}</td>
                    <td>{ticket.serialNumber}</td>
                    <td>
                      <Badge
                        pill
                        bg={
                          ticket.priority === "Low"
                            ? "info"
                            : ticket.priority === "Normal"
                            ? "warning"
                            : "danger"
                        }
                      >
                        {ticket.priority}
                      </Badge>
                    </td>
                    <td>
                      <Badge
                        bg={
                          ticket.status === "Open"
                            ? "primary"
                            : ticket.status === "In Progress"
                            ? "info"
                            : ticket.status === "Resolved"
                            ? "success"
                            : ticket.status === "Closed"
                            ? "secondary"
                            : "dark"
                        }
                        style={{
                          fontSize: "14px",
                          padding: "5px 10px",
                          borderRadius: "10px",
                          textTransform: "capitalize",
                        }}
                      >
                        {ticket.status}
                      </Badge>
                    </td>
                    <td>{ticket.assignedTo || "Not Assigned"}</td>
                    <td>
                      <Row>
                        <Col className="d-flex justify-content-between">
                          {/* View Button */}
                          <Button
                            variant="primary"
                            className="mx-2"
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "22px",
                            }}
                            onClick={() => handleViewDetails(ticket)}
                          >
                            <FaEye style={{ marginBottom: "3px" }} />
                          </Button>

                          {/* Edit Button */}
                          <button
                            className="editBtn"
                            onClick={() => handleShow(ticket)}
                          >
                            <svg height="1em" viewBox="0 0 512 512">
                              <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"></path>
                            </svg>
                          </button>

                          {/* Delete Button */}
                          <button
                            className="bin-button mx-2"
                            onClick={() => handleDelete(ticket._id)}
                          >
                            <svg
                              class="bin-top"
                              viewBox="0 0 39 7"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <line
                                y1="5"
                                x2="39"
                                y2="5"
                                stroke="white"
                                stroke-width="4"
                              ></line>
                              <line
                                x1="12"
                                y1="1.5"
                                x2="26.0357"
                                y2="1.5"
                                stroke="white"
                                stroke-width="3"
                              ></line>
                            </svg>
                            <svg
                              class="bin-bottom"
                              viewBox="0 0 33 39"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <mask id="path-1-inside-1_8_19" fill="white">
                                <path d="M0 0H33V35C33 37.2091 31.2091 39 29 39H4C1.79086 39 0 37.2091 0 35V0Z"></path>
                              </mask>
                              <path
                                d="M0 0H33H0ZM37 35C37 39.4183 33.4183 43 29 43H4C-0.418278 43 -4 39.4183 -4 35H4H29H37ZM4 43C-0.418278 43 -4 39.4183 -4 35V0H4V35V43ZM37 0V35C37 39.4183 33.4183 43 29 43V35V0H37Z"
                                fill="white"
                                mask="url(#path-1-inside-1_8_19)"
                              ></path>
                              <path
                                d="M12 6L12 29"
                                stroke="white"
                                stroke-width="4"
                              ></path>
                              <path
                                d="M21 6V29"
                                stroke="white"
                                stroke-width="4"
                              ></path>
                            </svg>
                          </button>
                        </Col>
                      </Row>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center text-muted">
                    No tickets available.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal for Viewing Ticket Details */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Ticket Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTicket && (
            <div>
              <h5>Ticket ID: {selectedTicket.trackingId}</h5>
              <hr />
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
                <strong>Serial Number:</strong> {selectedTicket.serialNumber}
              </p>
              <p>
                <strong>Call Type:</strong>{" "}
                {selectedTicket.call || "Not  Available"}
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
                  className="button mx-2"
                  style={{
                    height: "40px",
                    padding: "8px 20px",
                    background: "linear-gradient(90deg, #6a11cb, #2575fc)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50px",
                    fontSize: "14px",
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
              </p>{" "}
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
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDetailsModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for Editing Ticket */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTicket && (
            <Form>
              <Form.Group controlId="formStatus">
                <Form.Label>Status</Form.Label>
                <Form.Control
                  as="select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option>Open</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                  <option>Closed</option>
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="formOpsManager">
                <Form.Label>Assign Ops Manager</Form.Label>
                <Form.Control
                  as="select"
                  value={opsManager}
                  onChange={(e) => setOpsManager(e.target.value)}
                >
                  <option value="Not Assigned">Select Ops Manager</option>
                  {operationsManagers.map((manager, index) => (
                    <option key={index} value={manager}>
                      {manager}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="formPriority">
                <Form.Label>Priority</Form.Label>
                <Form.Control
                  as="select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option>Low</option>
                  <option>Normal</option>
                  <option>High</option>
                </Form.Control>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;
