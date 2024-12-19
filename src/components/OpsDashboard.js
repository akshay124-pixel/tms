import React, { useState, useEffect, useRef } from "react";
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
  Table,
} from "react-bootstrap";
import { Drawer } from "@mui/material";
import CountUp from "react-countup";
import debounce from "lodash.debounce";
import axios from "axios";
import "../App.css";
import { FaEye } from "react-icons/fa";
import ReactStars from "react-rating-stars-component";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { toast } from "react-toastify";
ChartJS.register(ArcElement, Tooltip, Legend);

const OpsManagerDashboard = () => {
  const [isSticky, setIsSticky] = useState(false);

  //Automtaiclly Closeing

  const closeCard = () => setShowCard(false);
  const cardRef = useRef();
  // Close the card when clicked outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        closeCard(); // Close the card if click is outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener when the component unmounts
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  //Automtaiclly CloseingEnd

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
    closed: 0,
    pending: 0,
  });
  const [assignResolveStats, setAssignResolveStats] = useState({
    assigned: 0,
    notAssigned: 0,
    resolved: 0,
  });
  const [repairReplacementStats, setRepairReplacementStats] = useState({
    repair: 0,
    replacement: 0,
  });
  // Ticket and Service Agent States
  const [tickets, setTickets] = useState([]);
  const [serviceAgents, setServiceAgents] = useState([]);
  const [filter, setFilter] = useState({
    status: "",
    priority: "",
    call: "",
    assignedTo: "",
    ageInDays: "",
    Type: "",
    tat: "",
  });
  const resetFilters = () => {
    setFilter({
      status: "",
      priority: "",
      call: "",
      ageInDays: "",
    });
    console.log("Filters reset.");
  };

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  // const [message, setMessage] = useState({ content: null, variant: null });
  const [historyVisible, setHistoryVisible] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [updatingTickets, setUpdatingTickets] = useState({}); // Store updating status for each ticket

  const [ticketDetails, setTicketDetails] = useState({});

  // Debounced search handler
  const handleSearch = debounce((term) => setSearchTerm(term), 300);

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

  // State to control whether the card is visible or not
  const [showCard, setShowCard] = useState(false);
  const handleShowCard = (ticket) => {
    setSelectedTicket(ticket);
    setShowCard(true);
  };

  const handleCloseCard = () => {
    setShowCard(false);
    setSelectedTicket(null);
  };

  // Function to toggle the card visibility

  // Delete ticket and update UI
  // const handleDelete = async (ticketId) => {
  //   try {
  //     await axios.delete(
  //       `https://tms-server-saeo.onrender.com/tickets/delete/${ticketId}`
  //     );
  //     setTickets((prevTickets) =>
  //       prevTickets.filter((ticket) => ticket._id !== ticketId)
  //     );
  //     toast.success("Ticket deleted successfully!");
  //   } catch (error) {
  //     toast.error("Failed to delete ticket. Please try again.");
  //   }
  // };

  // End Tat Filtering
  // Helper function to clear message after 3 seconds
  // const clearMessage = () => {
  //   setTimeout(() => {
  //     setMessage({ content: null, variant: null });
  //   }, 3000);
  // };

  const [feedback, setFeedback] = useState(null);

  // Fetch feedback when modal opens
  useEffect(() => {
    if (selectedTicket && selectedTicket._id) {
      axios
        .get(
          `https://tms-server-saeo.onrender.com/tickets/${selectedTicket._id}/feedback`
        )
        .then((res) => setFeedback(res.data))
        .catch((err) => {
          console.error("Error fetching feedback:", err);
          setFeedback(null);
        });
    } else {
      console.log("Invalid or missing ticketId.");
    }
  }, [selectedTicket]);

  const handleUpdateTicket = async (e, ticketId) => {
    e.preventDefault();

    // Set the ticket as updating
    setUpdatingTickets((prev) => ({ ...prev, [ticketId]: true }));

    const updatedTicketDetails = ticketDetails[ticketId];

    // Check if the ticket details are available before making the update
    if (!updatedTicketDetails) {
      toast.error("Ticket details not found.");
      return;
    }

    try {
      // Prepare payload based on the current ticket details
      const payload = {
        Type: updatedTicketDetails.Type || "Repair", // Default "Repair" if no Type selected
        call: updatedTicketDetails.call || "Hardware Call", // Default "Hardware Call" if no call selected
        assignedTo:
          updatedTicketDetails.assignedTo !== undefined &&
          updatedTicketDetails.assignedTo !== null
            ? updatedTicketDetails.assignedTo
            : selectedTicket.assignedTo || "", // Retain previous value if not updated
        status: updatedTicketDetails.status || "Open", // Default to "Open" if no status selected
        remarks: updatedTicketDetails.remarks || "", // Remarks field from ticketDetails
      };

      // API call to update ticket
      const response = await axios.put(
        `https://tms-server-saeo.onrender.com/tickets/update/${ticketId}`,
        payload
      );

      if (response.status === 200) {
        // Update the tickets state with new ticket details after successful update
        setTickets((prevTickets) =>
          prevTickets.map((ticket) =>
            ticket._id === ticketId
              ? {
                  ...ticket,
                  status: payload.status,
                  remarks: payload.remarks,
                  call: payload.call,
                  Type: payload.Type,
                  assignedTo: payload.assignedTo,
                }
              : ticket
          )
        );

        // Show success toast
        toast.success("Ticket updated successfully!");

        // Reset the ticket details state after update (if needed)
        setTicketDetails((prevState) => ({
          ...prevState,
          [ticketId]: { ...updatedTicketDetails, remarks: "" }, // Reset only the remarks
        }));
      } else {
        toast.error("Failed to update ticket. Please try again.");
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast.error("Failed to update ticket. Please try again.");
    } finally {
      // Set the ticket as not updating after the operation is complete
      setUpdatingTickets((prev) => ({ ...prev, [ticketId]: false }));
    }
  };

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
  // Function to calculate ticket age in days
  const calculateTicketAge = (createdAt) => {
    if (!createdAt) return "N/A"; // Handle cases where createdAt is missing
    const createdDate = new Date(createdAt); // Parse the createdAt date
    const today = new Date(); // Get today's date
    const diffTime = today.getTime() - createdDate.getTime(); // Time difference in milliseconds
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24))); // Convert to days and ensure non-negative
  };
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
        if (!ticket.createdAt) return false; // Skip tickets without createdAt field
        const currentDate = new Date();
        const createdAt = new Date(ticket.createdAt);
        const ageInDays = Math.ceil(
          (currentDate - createdAt) / (1000 * 60 * 60 * 24)
        );

        switch (filter.tat) {
          case "0-2Days":
            return ageInDays >= 0 && ageInDays <= 2;
          case "3-4Days":
            return ageInDays >= 3 && ageInDays <= 4;
          case "5-8Days":
            return ageInDays >= 5 && ageInDays <= 8;
          case "8-14Days":
            return ageInDays >= 8 && ageInDays <= 14;
          case ">14Days":
            return ageInDays > 14;
          default:
            return true;
        }
      };

      const matchesSearchTerm =
        searchTerm &&
        (ticket.customerName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
          ticket.billNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.contactNumber
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          ticket.trackingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.state?.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesAgeInDays = filter.ageInDays
        ? (() => {
            if (!ticket.createdAt) return false;
            const currentDate = new Date();
            const createdAt = new Date(ticket.createdAt);
            const ageInDays = Math.ceil(
              (currentDate - createdAt) / (1000 * 60 * 60 * 24)
            );
            return ageInDays === Number(filter.ageInDays);
          })()
        : true;

      return (
        matchesStatus &&
        matchesPriority &&
        matchesAssigned &&
        matchesType &&
        matchesCall &&
        matchesTAT() &&
        matchesAgeInDays &&
        (!searchTerm || matchesSearchTerm)
      );
    });
  };

  // Function to handle filter changes (and reset other filters when a new one is clicked)
  // const handleFilterChange = (filterType, value) => {
  //   setFilter((prevFilter) => {
  //     const newFilter = { ...prevFilter };

  //     // Reset all filters and apply the new one
  //     Object.keys(newFilter).forEach((key) => {
  //       if (key !== filterType) {
  //         newFilter[key] = ""; // Reset all other filters
  //       }
  //     });

  //     newFilter[filterType] = value; // Set the selected filter
  //     return newFilter;
  //   });
  // };
  // State for open calls
  const [openCalls, setOpenCalls] = useState({
    hardware: { "0-2Days": 0, "3-7Days": 0, "8-14Days": 0, ">14Days": 0 },
    software: { "0-2Days": 0, "3-7Days": 0, "8-14Days": 0, ">14Days": 0 },
  });

  // State for closed calls
  const [closedCalls, setClosedCalls] = useState({
    hardware: { "0-2Days": 0, "3-7Days": 0, "8-14Days": 0, ">14Days": 0 },
    software: { "0-2Days": 0, "3-7Days": 0, "8-14Days": 0, ">14Days": 0 },
  });

  useEffect(() => {
    if (!tickets || tickets.length === 0) {
      setOpenCalls({
        hardware: { "0-2Days": 0, "3-7Days": 0, "8-14Days": 0, ">14Days": 0 },
        software: { "0-2Days": 0, "3-7Days": 0, "8-14Days": 0, ">14Days": 0 },
      });
      setClosedCalls({
        hardware: { "0-2Days": 0, "3-7Days": 0, "8-14Days": 0, ">14Days": 0 },
        software: { "0-2Days": 0, "3-7Days": 0, "8-14Days": 0, ">14Days": 0 },
      });
      return;
    }

    const calculateAgeInDays = (createdAt) => {
      const createdDate = new Date(createdAt);
      return isNaN(createdDate)
        ? Number.MAX_SAFE_INTEGER
        : Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24));
    };

    const calculateCallStats = (tickets, call, validStatuses) => {
      const result = {
        "0-2Days": 0,
        "3-7Days": 0,
        "8-14Days": 0,
        ">14Days": 0,
      };
      tickets.forEach((ticket) => {
        if (ticket.call === call && validStatuses.includes(ticket.status)) {
          const ageInDays = calculateAgeInDays(ticket.createdAt);
          if (ageInDays <= 2) result["0-2Days"]++;
          else if (ageInDays <= 7) result["3-7Days"]++;
          else if (ageInDays <= 14) result["8-14Days"]++;
          else result[">14Days"]++;
        }
      });
      return result;
    };

    // Accumulate "Open," "In Progress," and "Resolved" for openCalls
    setOpenCalls({
      hardware: calculateCallStats(tickets, "Hardware Call", [
        "Open",
        "In Progress",
        "Resolved",
      ]),
      software: calculateCallStats(tickets, "Software Call", [
        "Open",
        "In Progress",
        "Resolved",
      ]),
    });

    // Only include "Closed" tickets for closedCalls
    setClosedCalls({
      hardware: calculateCallStats(tickets, "Hardware Call", ["Closed"]),
      software: calculateCallStats(tickets, "Software Call", ["Closed"]),
    });
  }, [tickets]);

  // Old  Calculation
  useEffect(() => {
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
  // Old  Calculation End

  // // Pie chart data for Closed vs Pending vs Resolved
  const closedPendingData = {
    labels: ["Closed", "Pending", "Resolved", "In Progress"],
    datasets: [
      {
        data: [
          closedPendingStats.closed,
          closedPendingStats.pending,
          closedPendingStats.resolved,
          closedPendingStats.inprogress,
        ],
        backgroundColor: ["#6CCF70", "#FFC658", "#5BA4FF", "#FF6E6E"], // Softer yet vibrant colors
        hoverBackgroundColor: ["#8FE89A", "#FFD88A", "#85C1FF", "#FF9191"], // Subtle pastel-like transitions
        borderColor: "transparent", // Make border transparent
        borderWidth: 2, // Optional: Adjust border thickness
      },
    ],
  };

  // Pie chart data for Repair, Replacement, Received, Not Received
  const RepairReplacementData = {
    labels: ["Replacement", "Repair", "Received", "Not Received"],
    datasets: [
      {
        data: [
          repairReplacementStats.replacement,
          repairReplacementStats.repair,
          repairReplacementStats.received,
          repairReplacementStats.notReceived,
        ],
        backgroundColor: [
          "#FFB84D", // Replacement (Warm Gold)
          "#00B5B8", // Repair (Teal)
          "#00D84A", // Received (Vibrant Lime Green)
          "#D9534F", // Not Received (Rich Red)
        ],
        hoverBackgroundColor: [
          "#FF9A00", // Hover for Replacement (Darker Gold)
          "#00A2A3", // Hover for Repair (Darker Teal)
          "#00B033", // Hover for Received (Darker Lime Green)
          "#C9302C", // Hover for Not Received (Darker Red)
        ],
        borderColor: "transparent", // Make border transparent
        borderWidth: 2, // Optional: Adjust border thickness
      },
    ],
  };

  // Pie chart data for Assigned vs Not Assigned
  const assignResolveData = {
    labels: ["Assigned", "Not Assigned"],
    datasets: [
      {
        data: [assignResolveStats.assigned, assignResolveStats.notAssigned],
        backgroundColor: ["#FF6F61", "#A2DFF7"], // Warm coral and light sky blue
        hoverBackgroundColor: ["#FF9F89", "#72C7D4"], // Soft peach and pastel blue
        borderColor: "transparent", // Make border transparent
        borderWidth: 2, // Optional: Adjust border thickness
      },
    ],
  };

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
          fontSize: "1.7rem",
        }}
      >
        Ops Manager: Streamline Ticket Management
      </h2>

      {/* {message.content && (
        <Alert variant={message.variant}>{message.content}</Alert>
      )}{" "} */}
      {/* Hero Section */}
      <div
        className="dashboard-container"
        style={{
          background: "linear-gradient(90deg, #6a11cb, #2575fc)",
          padding: "1.5rem",
          borderRadius: "12px",

          color: "white",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Header Section */}
        <div className="text-center ">
          <h5 style={{ fontWeight: "700" }}>Dashboard Overview</h5>
          {/* <p>
            Analyze and monitor ticket statistics by categories and age ranges.
          </p> */}
        </div>

        {/* Open Calls Section */}
        <div className="section mb-5">
          <h3 style={{ fontWeight: "600", marginBottom: "0.5rem" }}>
            Open Calls
            <span
              style={{
                marginLeft: "10px",
                fontSize: "1.2rem",
                fontWeight: "600",
              }}
            >
              Total :
              <CountUp
                style={{ marginLeft: "5px" }}
                end={
                  openCalls.hardware["0-2Days"] +
                  openCalls.hardware["3-7Days"] +
                  openCalls.hardware["8-14Days"] +
                  openCalls.hardware[">14Days"] +
                  openCalls.software["0-2Days"] +
                  openCalls.software["3-7Days"] +
                  openCalls.software["8-14Days"] +
                  openCalls.software[">14Days"]
                }
                duration={2}
              />
            </span>
          </h3>
          <div className="d-flex flex-wrap justify-content-between">
            {/* 0-2Days */}
            <div className="metric-section">
              <h4
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                0–2 Days
              </h4>
              <div className="d-flex">
                <div className="summary-card text-center ">
                  <p>Hardware Calls</p>
                  <h4>
                    <CountUp end={openCalls.hardware["0-2Days"]} duration={2} />
                  </h4>
                </div>
                <div className="summary-card text-center ">
                  <p>Software Calls</p>
                  <h4>
                    <CountUp end={openCalls.software["0-2Days"]} duration={2} />
                  </h4>
                </div>
              </div>
            </div>

            {/* 3-7Days */}
            <div className="metric-section">
              <h4
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                3–7 Days
              </h4>
              <div className="d-flex">
                <div className="summary-card text-center ">
                  <p>Hardware Calls</p>
                  <h4>
                    <CountUp end={openCalls.hardware["3-7Days"]} duration={2} />
                  </h4>
                </div>
                <div className="summary-card text-center ">
                  <p>Software Calls</p>
                  <h4>
                    <CountUp end={openCalls.software["3-7Days"]} duration={2} />
                  </h4>
                </div>
              </div>
            </div>

            {/* 8-14Days */}
            <div className="metric-section">
              <h4
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                8–14 Days
              </h4>
              <div className="d-flex">
                <div className="summary-card text-center ">
                  <p>Hardware Calls</p>
                  <h4>
                    <CountUp
                      end={openCalls.hardware["8-14Days"]}
                      duration={2}
                    />
                  </h4>
                </div>
                <div className="summary-card text-center ">
                  <p>Software Calls</p>
                  <h4>
                    <CountUp
                      end={openCalls.software["8-14Days"]}
                      duration={2}
                    />
                  </h4>
                </div>
              </div>
            </div>

            {/* >14Days */}
            <div className="metric-section">
              <h4
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                14 Days
              </h4>
              <div className="d-flex">
                <div className="summary-card text-center ">
                  <p>Hardware Calls</p>
                  <h4>
                    <CountUp end={openCalls.hardware[">14Days"]} duration={2} />
                  </h4>
                </div>
                <div className="summary-card text-center ">
                  <p>Software Calls</p>
                  <h4>
                    <CountUp end={openCalls.software[">14Days"]} duration={2} />
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Closed Calls Section */}
        <div className="section" style={{ marginTop: "-30px" }}>
          <h3 style={{ fontWeight: "600", marginBottom: "0.5rem" }}>
            Closed Calls
            <span
              style={{
                marginLeft: "10px",

                fontSize: "1.2rem",
                fontWeight: "600",
              }}
            >
              Total :
              <CountUp
                style={{ marginLeft: "5px" }}
                end={
                  closedCalls.hardware["0-2Days"] +
                  closedCalls.hardware["3-7Days"] +
                  closedCalls.hardware["8-14Days"] +
                  closedCalls.hardware[">14Days"] +
                  closedCalls.software["0-2Days"] +
                  closedCalls.software["3-7Days"] +
                  closedCalls.software["8-14Days"] +
                  closedCalls.software[">14Days"]
                }
                duration={2}
              />
            </span>
          </h3>
          <div className="d-flex flex-wrap justify-content-between">
            {/* 0-2Days */}
            <div className="metric-section">
              <h4
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                0–2 Days
              </h4>
              <div className="d-flex">
                <div className="summary-card text-center ">
                  <p>Hardware Calls</p>
                  <h4>
                    <CountUp
                      end={closedCalls.hardware["0-2Days"]}
                      duration={2}
                    />
                  </h4>
                </div>
                <div className="summary-card text-center ">
                  <p>Software Calls</p>
                  <h4>
                    <CountUp
                      end={closedCalls.software["0-2Days"]}
                      duration={2}
                    />
                  </h4>
                </div>
              </div>
            </div>

            {/* 3-7Days */}
            <div className="metric-section">
              <h4
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {" "}
                3–7 Days
              </h4>
              <div className="d-flex">
                <div className="summary-card text-center">
                  <p>Hardware Calls</p>
                  <h4>
                    <CountUp
                      end={closedCalls.hardware["3-7Days"]}
                      duration={2}
                    />
                  </h4>
                </div>
                <div className="summary-card text-center ">
                  <p>Software Calls</p>
                  <h4>
                    <CountUp
                      end={closedCalls.software["3-7Days"]}
                      duration={2}
                    />
                  </h4>
                </div>
              </div>
            </div>

            {/* 8-14Days */}
            <div className="metric-section">
              <h4
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                8–14 Days
              </h4>
              <div className="d-flex">
                <div className="summary-card text-center ">
                  <p>Hardware Calls</p>
                  <h4>
                    <CountUp
                      end={closedCalls.hardware["8-14Days"]}
                      duration={2}
                    />
                  </h4>
                </div>
                <div className="summary-card text-center ">
                  <p>Software Calls</p>
                  <h4>
                    <CountUp
                      end={closedCalls.software["8-14Days"]}
                      duration={2}
                    />
                  </h4>
                </div>
              </div>
            </div>

            {/* >14Days */}
            <div className="metric-section">
              <h4
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {" "}
                14 Days
              </h4>
              <div className="d-flex">
                <div className="summary-card text-center ">
                  <p>Hardware Calls</p>
                  <h4>
                    <CountUp
                      end={closedCalls.hardware[">14Days"]}
                      duration={2}
                    />
                  </h4>
                </div>
                <div className="summary-card text-center ">
                  <p>Software Calls</p>
                  <h4>
                    <CountUp
                      end={closedCalls.software[">14Days"]}
                      duration={2}
                    />
                  </h4>
                </div>
              </div>
            </div>
            {/* Total Tickets Section */}
          </div>
          <div
            className="total-summary "
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              // padding: "0.5rem",
              marginTop: "10px",
              textAlign: "center",
              color: "white",
            }}
          >
            <h3 style={{ fontWeight: "700" }}>Total Tickets :</h3>
            <h4 style={{ marginLeft: "10px" }}>
              <CountUp
                end={
                  // Total number of tickets (open + closed)
                  openCalls.hardware["0-2Days"] +
                  openCalls.hardware["3-7Days"] +
                  openCalls.hardware["8-14Days"] +
                  openCalls.hardware[">14Days"] +
                  openCalls.software["0-2Days"] +
                  openCalls.software["3-7Days"] +
                  openCalls.software["8-14Days"] +
                  openCalls.software[">14Days"] +
                  closedCalls.hardware["0-2Days"] +
                  closedCalls.hardware["3-7Days"] +
                  closedCalls.hardware["8-14Days"] +
                  closedCalls.hardware[">14Days"] +
                  closedCalls.software["0-2Days"] +
                  closedCalls.software["3-7Days"] +
                  closedCalls.software["8-14Days"] +
                  closedCalls.software[">14Days"]
                }
                duration={2}
              />
            </h4>
          </div>
        </div>

        <>
          <div>
            <button className="piebutton" onClick={() => setDrawerOpen(true)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
                />
              </svg>
              <div className="pietext">
                <strong>Charts</strong>
              </div>
            </button>
          </div>
        </>
      </div>
      {/* Hero Section End */}
      {/* Hero Section  End Here*/}
      {/* Pies */}
      <div
        className="mt-5 d-flex"
        style={{ background: " linear-gradient(135deg, #6a11cb, #2575fc)" }}
      >
        <Drawer
          anchor="right"
          open={isDrawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          <div
            style={{
              width: "400px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background: " linear-gradient(135deg, #6a11cb, #2575fc)",
            }}
          >
            <Card
              className="w-100 border-0 rounded-3 mt-3"
              style={{
                background: " linear-gradient(135deg, #6a11cb, #2575fc)",
                color: "white",
              }}
            >
              <Card.Body>
                <div
                  className="d-flex flex-wrap justify-content-center"
                  style={{
                    background: " linear-gradient(135deg, #6a11cb, #2575fc)",
                  }}
                >
                  <div
                    className="pie-chart-container col-12 col-md-6 mb-4"
                    style={{
                      backgroundColor: "transparent",
                    }}
                  >
                    <div
                      className="chart-wrapper mx-auto"
                      style={{
                        backgroundColor: "transparent",
                      }}
                    >
                      <Pie
                        data={closedPendingData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: true,
                              position: "bottom", // Position the legend below the chart
                              labels: {
                                color: "#FFFFFF", // White text for legend labels
                              },
                            },
                          },
                        }}
                        height={300}
                      />
                    </div>
                  </div>

                  <div
                    className="pie-chart-container col-12 col-md-6 mb-2 mx-1"
                    style={{
                      backgroundColor: "transparent",
                    }}
                  >
                    <div
                      className="chart-wrapper mx-auto"
                      style={{
                        backgroundColor: "transparent",
                      }}
                    >
                      <Pie
                        data={assignResolveData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: true,
                              position: "bottom", // Position the legend below the chart
                              labels: {
                                color: "#FFFFFF", // White text for legend labels
                              },
                            },
                            tooltip: {
                              enabled: true, // Keep tooltips enabled as default
                            },
                          },
                        }}
                        height={300}
                      />
                    </div>
                  </div>

                  <div
                    className="pie-chart-container col-12 col-md-6 mb-4"
                    style={{
                      backgroundColor: "transparent",
                    }}
                  >
                    <div
                      className="chart-wrapper mx-auto"
                      style={{
                        backgroundColor: "transparent",
                      }}
                    >
                      <Pie
                        data={RepairReplacementData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: true,
                              position: "bottom", // Position the legend below the chart
                              labels: {
                                color: "#FFFFFF", // White text for legend labels
                              },
                            },
                            tooltip: {
                              enabled: true, // Keep tooltips enabled
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
          </div>
        </Drawer>
      </div>
      {/* Pies */}
      {/* Forms */}
      <Form className="mb-4">
        <Row>
          <div
            className={`search-bar-container ${isSticky ? "sticky" : ""}`}
            style={{
              position: isSticky ? "fixed" : "relative",
              top: 0,
              left: 0,
              zIndex: 1000,
              width: "100vw",
              backgroundColor: isSticky
                ? "rgba(255, 255, 255, 0.7)"
                : "transparent",
              transition: "background-color 0.3s ease, box-shadow 0.3s ease",
              backdropFilter: isSticky ? "blur(10px)" : "none",
              padding: isSticky ? "10px 15px" : "15px 0",
              boxShadow: isSticky ? "0 4px 15px rgba(0, 0, 0, 0.1)" : "none",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div className="container-fluid">
              <div className="row align-items-center">
                {/* Search Input */}
                <div className="col-12 col-lg-4 mb-3 mb-lg-0">
                  <Form.Control
                    type="text"
                    placeholder="🔍 Search by Tracking ID, Customer Name, Customer No., or Bill No., Address, City, State. "
                    onChange={(e) => handleSearch(e.target.value)}
                    style={{
                      borderRadius: "50px",
                      padding: "10px 20px",
                      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
                    }}
                  />
                </div>

                {/* Filter by Status */}
                <div className="col-6 col-lg-2">
                  <Form.Select
                    onChange={(e) =>
                      setFilter({ ...filter, status: e.target.value })
                    }
                    value={filter.status}
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
                <div className="col-6 col-lg-2">
                  <Form.Select
                    onChange={(e) =>
                      setFilter({ ...filter, priority: e.target.value })
                    }
                    value={filter.priority}
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

                {/* Filter by Call Type */}
                <div className="col-6 col-lg-2">
                  <Form.Select
                    onChange={(e) =>
                      setFilter({ ...filter, call: e.target.value })
                    }
                    value={filter.call}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "30px",
                      padding: "10px 20px",
                      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
                    }}
                  >
                    <option value="">Filter by Call Type</option>
                    <option value="Hardware Call">Hardware Call</option>
                    <option value="Software Call">Software Call</option>
                  </Form.Select>
                </div>

                {/* Filter by Age in Days */}
                <div className="col-6 col-lg-2">
                  <Form.Control
                    type="number"
                    placeholder="Age in Days"
                    value={filter.ageInDays || ""}
                    onChange={(e) => {
                      // Only update the state if the value is a valid non-negative number
                      const value = e.target.value;
                      if (value >= 0 || value === "") {
                        setFilter({ ...filter, ageInDays: value });
                      }
                    }}
                    min="0" // Ensure the minimum value is 0
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "30px",
                      padding: "10px 20px",
                      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
                    }}
                  />
                </div>
              </div>
            </div>{" "}
            {/* Reset Filters Button */}
            <div className="col-8 col-lg-1 d-flex justify-content-center">
              <Button
                onClick={resetFilters}
                className="reset-button"
                style={{
                  borderRadius: "30px",
                  padding: "10px 20px",
                  backgroundColor: "transparent",
                  color: "#fff",
                  border: "none",
                  transition: "all 0.3s ease",
                }}
              >
                <svg
                  className="svg-icon"
                  style={{
                    width: "1.8em",
                    height: "1.8em",
                    verticalAlign: "middle",
                    fill: "currentColor",
                    overflow: "hidden",
                    transition: "transform 0.6s ease", // Smooth transition for rotation
                  }}
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M683.6 288.4l-21.2 26.2c-12 14.8-2.6 36.9 16.3 38.7l165.9 15.4c21.9 2 38.8-18.8 32.3-39.8l-49.6-159c-5.7-18.2-29.3-22.7-41.2-7.9l-32.9 40.6c-85.1-62.9-194.4-89.5-305.7-67.7C290 165.7 166.1 295.6 142.7 454.4c-35.4 239.2 149.1 444.7 381.5 444.7 159.8 0 301.2-98 358.9-243.9 9.3-23.4 4.8-51.5-15.1-66.9-31.2-24.2-73.4-10.4-86.3 23.3-48.2 126.3-183.8 203.5-325.3 169.1C352.3 755.3 271 668 252.8 562.4c-30-173.9 103.1-324.7 271.4-324.7 58.2-0.1 113.5 18.1 159.4 50.7z"
                    fill="#3259CE"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </Row>
      </Form>

      {/* Forms End */}
      <div>
        {/* Table */}
        <Row>
          {loading ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "50vh" }}
            >
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <Card className="mb-4 shadow-lg">
              <Card.Body>
                <Col md={12}>
                  <Table
                    responsive
                    striped
                    bordered
                    hover
                    className="text-center"
                  >
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th style={{ width: "120px" }}>Tracking ID</th>
                        <th>Customer</th>
                        <th>Product</th>
                        <th style={{ width: "8%" }}>Age</th>
                        <th>Priorty</th>
                        <th>Status</th>
                        <th>Assigned</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filterTickets().length > 0 ? (
                        filterTickets().map((ticket) => (
                          <tr key={ticket._id}>
                            {/* Date */}
                            <td>
                              {new Date(ticket.createdAt).toLocaleDateString()}
                            </td>
                            {/* Tracking ID */}
                            <td
                              style={{
                                width: "120px", // Fixed width
                                maxWidth: "120px", // Prevents growing beyond this width
                                overflowX: "auto", // Enables horizontal scrolling
                                // whiteSpace: "nowrap", // Prevents text from wrapping
                              }}
                            >
                              {ticket.trackingId}
                            </td>
                            {/* Customer Name */}
                            <td>{ticket.customerName}</td>
                            {/* Product Type */}
                            <td>{ticket.productType}</td>
                            {/* Age of Ticket */}
                            <td style={{ width: "8%" }}>
                              {calculateTicketAge(ticket.createdAt)} Days
                            </td>
                            <td>
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
                                    : "secondary"
                                }
                              >
                                {ticket.status}
                              </Badge>
                            </td>{" "}
                            <td>{ticket.assignedTo || "Not Assigned"}</td>
                            <td>
                              <Row>
                                {/* View Details  */}{" "}
                                <Col className="d-flex justify-content-between">
                                  <Button
                                    variant="primary"
                                    className="mx"
                                    style={{
                                      width: "40px",
                                      height: "40px",
                                      borderRadius: "22px",
                                    }}
                                    onClick={() => {
                                      setSelectedTicket(ticket);
                                      setShowModal(true);
                                    }}
                                  >
                                    <FaEye style={{ marginBottom: "3px" }} />
                                  </Button>
                                  {/* View Details End */}{" "}
                                  {/* View card Button */}
                                  <button
                                    className="editBtn mx-2"
                                    onClick={() => handleShowCard(ticket)}
                                  >
                                    <svg height="1em" viewBox="0 0 512 512">
                                      <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"></path>
                                    </svg>
                                  </button>
                                  {/* View card Buttons End */}
                                  {/* Delete Button */}
                                  {/* <button
                                    className="bin-button mx"
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
                                      <mask
                                        id="path-1-inside-1_8_19"
                                        fill="white"
                                      >
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
                                  </button> */}
                                </Col>
                              </Row>
                              {/* End Delete Button */}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="12">
                            No tickets found for the selected criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Col>
              </Card.Body>{" "}
            </Card>
          )}
        </Row>

        {/* Table End */}

        {/* Floating Card (Popup Effect) */}
        {showCard && selectedTicket && (
          <div className="popup-card my-5">
            <div className="popup-card-content" ref={cardRef}>
              <Button
                variant="outline-danger"
                onClick={handleCloseCard}
                className="close-btn "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="45"
                  height="45"
                  viewBox="0 0 48 48"
                >
                  <path
                    fill="#f44336"
                    d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z"
                  ></path>
                  <path
                    fill="#fff"
                    d="M29.656,15.516l2.828,2.828l-14.14,14.14l-2.828-2.828L29.656,15.516z"
                  ></path>
                  <path
                    fill="#fff"
                    d="M32.484,29.656l-2.828,2.828l-14.14-14.14l2.828-2.828L32.484,29.656z"
                  ></path>
                </svg>
              </Button>
              <div>
                <h4>
                  <strong style={{ color: "green" }}>Customer Name: </strong>
                  {selectedTicket.customerName}
                </h4>
                <hr />
                <p>
                  <strong>Description: </strong>
                  {selectedTicket.description}
                </p>
                <p>
                  <strong>Assigned Agent:</strong>{" "}
                  {selectedTicket.assignedTo || "Not Assigned"}
                </p>
                <p>
                  <strong>Priority:</strong>{" "}
                  <Badge
                    bg={
                      selectedTicket.priority === "High"
                        ? "danger"
                        : selectedTicket.priority === "Normal"
                        ? "warning"
                        : "info"
                    }
                  >
                    {selectedTicket.priority}
                  </Badge>
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <Badge
                    bg={
                      selectedTicket.status === "Open"
                        ? "primary"
                        : selectedTicket.status === "In Progress"
                        ? "info"
                        : selectedTicket.status === "Resolved"
                        ? "success"
                        : "secondary"
                    }
                  >
                    {selectedTicket.status}
                  </Badge>
                </p>
                <p>
                  <strong>Type:</strong>{" "}
                  <Badge
                    bg={
                      selectedTicket.Type === "Repair"
                        ? "primary"
                        : selectedTicket.Type === "Replacement"
                        ? "info"
                        : selectedTicket.Type === "Received"
                        ? "success"
                        : "secondary"
                    }
                  >
                    {selectedTicket.Type}
                  </Badge>
                </p>
                {/* Dropdowns and Form */}
                <Form.Select
                  className="custom-dropdown"
                  aria-label="Update Replacement"
                  onChange={(e) =>
                    handleInputChange(e, selectedTicket._id, "Type")
                  }
                  value={
                    ticketDetails[selectedTicket._id]?.Type ||
                    selectedTicket.Type
                  }
                >
                  <option value="" disabled>
                    -- Select If Replacement --
                  </option>
                  <option value="Not Received">Not Received</option>
                  <option value="Received">Received</option>
                </Form.Select>
                <Form.Select
                  className="my-2"
                  aria-label="Update Call Type"
                  onChange={(e) =>
                    handleInputChange(e, selectedTicket._id, "call")
                  }
                  value={
                    ticketDetails[selectedTicket._id]?.call ||
                    selectedTicket.call
                  }
                >
                  <option value="" disabled>
                    -- Select Call Type --
                  </option>
                  <option value="Hardware Call">Hardware Call</option>
                  <option value="Software Call">Software Call</option>
                </Form.Select>
                <Form.Select
                  aria-label="Select Service Agent"
                  onChange={(e) =>
                    handleInputChange(e, selectedTicket._id, "assignedTo")
                  }
                  value={
                    ticketDetails[selectedTicket._id]?.assignedTo ||
                    selectedTicket?.assignedTo ||
                    ""
                  }
                  className="mt-2"
                >
                  <option value="">Assign Service Agent</option>
                  {serviceAgents.map((agent) => (
                    <option key={agent._id} value={agent.username}>
                      {agent.username}
                    </option>
                  ))}
                </Form.Select>

                <Form.Select
                  className="my-2"
                  aria-label="Update Status"
                  onChange={(e) => {
                    handleInputChange(e, selectedTicket._id, "status");
                  }}
                  value={
                    ticketDetails[selectedTicket._id]?.status ||
                    selectedTicket.status
                  }
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </Form.Select>

                <form
                  onSubmit={(e) => {
                    if (
                      !ticketDetails[selectedTicket._id]?.remarks ||
                      ticketDetails[selectedTicket._id]?.remarks.trim() === ""
                    ) {
                      e.preventDefault();
                      toast.error(
                        "Remarks are required when updating the status."
                      );
                      return;
                    }
                    handleUpdateTicket(e, selectedTicket._id);
                  }}
                >
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control my-2"
                      placeholder="Enter Remarks"
                      value={ticketDetails[selectedTicket._id]?.remarks || ""}
                      onChange={(e) =>
                        handleInputChange(e, selectedTicket._id, "remarks")
                      }
                    />
                  </div>
                  <div className="d-flex flex-column justify-content-center gap-1">
                    <Button
                      variant="info"
                      type="submit"
                      style={{
                        background:
                          "linear-gradient(to right, #00c6ff, #0072ff)", // Gradient effect
                        border: "none", // Remove default border
                        color: "#fff", // White text color
                        padding: "10px 20px", // Adjust padding for better size
                        fontSize: "16px", // Increase font size
                        fontWeight: "600", // Bold text for emphasis
                        borderRadius: "50px", // Rounded corners for modern look
                        boxShadow: "0 4px 12px rgba(0, 123, 255, 0.2)", // Soft shadow for depth
                        transition: "all 0.3s ease-in-out", // Smooth transition for hover effects
                      }}
                      className="mb-2"
                      onMouseOver={(e) =>
                        (e.target.style.transform = "scale(1.05)")
                      } // Hover scale effect
                      onMouseOut={(e) =>
                        (e.target.style.transform = "scale(1)")
                      }
                    >
                      Update Ticket
                    </Button>

                    <Button
                      variant="warning"
                      onClick={() =>
                        updateTicketAssignment(selectedTicket._id, "")
                      }
                      style={{
                        background:
                          "linear-gradient(to right, #f39c12, #e67e22)", // Gradient effect
                        border: "none", // Remove default border
                        color: "#fff", // White text color
                        padding: "10px 20px", // Adjust padding for better size
                        fontSize: "16px", // Increase font size
                        fontWeight: "600", // Bold text for emphasis
                        borderRadius: "50px", // Rounded corners for modern look
                        boxShadow: "0 4px 12px rgba(230, 126, 34, 0.3)", // Soft shadow for depth
                        transition: "all 0.3s ease-in-out", // Smooth transition for hover effects
                      }}
                      className="mb"
                      onMouseOver={(e) =>
                        (e.target.style.transform = "scale(1.05)")
                      } // Hover scale effect
                      onMouseOut={(e) =>
                        (e.target.style.transform = "scale(1)")
                      }
                    >
                      Unassign Agent
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        {/* Floating Card End */}
      </div>
      {/* Modal for showing detailed ticket information */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="l"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title
            style={{ fontWeight: "bold", fontSize: "24px", color: "#007bff" }}
          >
            Ticket Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTicket ? (
            <div>
              {/* Ticket Information */}
              <div style={{ marginBottom: "20px" }}>
                <p>
                  <strong>Tracking ID:</strong> {selectedTicket.trackingId}
                </p>
                <p>
                  <strong>Created On:</strong>{" "}
                  {new Date(selectedTicket.createdAt).toLocaleDateString()}
                </p>
                <p>
                  <strong>Customer Name:</strong> {selectedTicket.customerName}
                </p>
                <p>
                  <strong>Organization:</strong> {selectedTicket.organization}
                </p>
                <p>
                  <strong>Customer Issue:</strong> {selectedTicket.description}
                </p>
                <p>
                  <strong>Contact:</strong> {selectedTicket.contactNumber}
                </p>
                <p>
                  <strong>Address:</strong> {selectedTicket.address}
                </p>
                <p>
                  <strong>City:</strong> {selectedTicket.city}
                </p>
                <p>
                  <strong>State:</strong> {selectedTicket.state}
                </p>
                <p>
                  <strong>Product Type:</strong> {selectedTicket.productType}
                </p>
                <p>
                  <strong>Model Type:</strong> {selectedTicket.modelType}
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
                  <strong>Call Type:</strong>{" "}
                  {selectedTicket.call || "Not specified"}
                </p>
                <p>
                  <strong>Part name if changes:</strong>{" "}
                  {selectedTicket.partName || "No part changes reported"}
                </p>
                <p>
                  <strong>Type:</strong>{" "}
                  {selectedTicket.Type || "Type not available"}
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
                    style={{ fontSize: "14px", padding: "5px 10px" }}
                  >
                    {selectedTicket.priority}
                  </Badge>
                </p>
                <p>
                  <strong>Remarks:</strong>{" "}
                  {selectedTicket.remarks || "No remarks provided"}
                </p>
                <p>
                  <strong>Assigned Agent:</strong>{" "}
                  {selectedTicket.assignedTo || "Not Assigned"}
                </p>
              </div>
              {/* Feedback Section */}
              <div>
                <h5 style={{ fontWeight: "bold", color: "#007bff" }}>
                  Feedback
                </h5>
                {feedback ? (
                  <div style={{ marginTop: "10px" }}>
                    <p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "15px",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "16px",
                            fontWeight: "bold",
                            margin: "0",
                            color: "#333",
                          }}
                        >
                          Rating:
                        </p>
                        <div style={{ marginLeft: "10px" }}>
                          <ReactStars
                            count={5}
                            value={feedback.rating}
                            size={24}
                            edit={false}
                            activeColor="#ffd700"
                          />
                        </div>
                      </div>
                      <p>
                        <strong>Comment:</strong>{" "}
                        {feedback.comments || "No comments provided"}
                      </p>
                    </p>
                  </div>
                ) : (
                  <p>No feedback submitted yet.</p>
                )}
              </div>

              {/* Ticket History Section */}
              <div style={{ marginBottom: "20px" }}>
                <h5 style={{ fontWeight: "bold", color: "#007bff" }}>
                  Ticket History
                </h5>
                <button
                  type="button"
                  onClick={() => toggleHistory(selectedTicket._id)}
                  className="button "
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
                        <strong>Updated By:</strong>{" "}
                        {entry.username || "OPS Manager"} <br />
                        <strong>Remarks:</strong>{" "}
                        {entry.remarks || "No remarks provided"}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
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

export default OpsManagerDashboard;
