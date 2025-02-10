import React, { useState, useEffect, useRef, useCallback } from "react";
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
import Papa from "papaparse";
import debounce from "lodash.debounce";
import axios from "axios";
import "../App.css";
import { FaEye } from "react-icons/fa";
import ReactStars from "react-rating-stars-component";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { toast } from "react-toastify";
import "../styles/TicketModal.css";
ChartJS.register(ArcElement, Tooltip, Legend);

const OpsManagerDashboard = () => {
  const [isSticky, setIsSticky] = useState(false);

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
    // Reset filters
    setFilter({
      status: "",
      priority: "",
      call: "",
      ageInDays: "",
    });

    // Reset search term (clearing the search bar)
    setSearchTerm("");

    console.log("Filters and search term reset.");
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

  // Debounced function to handle intensive operations
  const handleSearchDebounced = useCallback(
    debounce((term) => {
      // Perform the debounced operation here, e.g., API call
      console.log("Debounced Search Term:", term);
    }, 300),
    []
  );

  // Immediate input handler
  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value); // Update state immediately
    handleSearchDebounced(value); // Apply debounced operation
  };

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
  // Exports
  const handleExport = async () => {
    try {
      // Send request using Axios
      const response = await axios.get(
        "https://tms-server-saeo.onrender.com/tickets/export",
        {
          responseType: "text", // Ensure we get the CSV as text
        }
      );

      // Log the response data for debugging
      console.log(response.data);

      // Parse CSV string to JSON objects using PapaParse
      const parsedData = Papa.parse(response.data, {
        header: true, // Automatically use the first row as headers
        skipEmptyLines: true, // Skip any empty lines
      });

      // If parsing fails, show an alert
      if (parsedData.errors.length > 0) {
        alert("Error parsing CSV data.");
        return;
      }

      const tickets = parsedData.data; // This is now an array of objects

      // If no tickets found, show an alert
      if (tickets.length === 0) {
        alert("No tickets available to export!");
        return;
      }

      // Generate CSV string from tickets array (if needed for export)
      const csvString = Papa.unparse(tickets);

      // Create a Blob from the CSV string
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });

      // Create a temporary download link and trigger the download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "tickets.csv";
      link.click();

      // Clean up
      URL.revokeObjectURL(url); // Free up memory
    } catch (error) {
      console.error("Error exporting tickets:", error);
      alert("An error occurred while exporting tickets.");
    }
  };
  // Exports End
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
  const safeToLowerCase = (value) => {
    return value ? String(value).toLowerCase() : "";
  };

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

      // TAT filter logic
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

      // Age in Days filter logic
      const matchesAgeInDays = filter.ageInDays
        ? (() => {
            if (!ticket.createdAt) return false;
            const currentDate = new Date();
            const createdAt = new Date(ticket.createdAt);
            const ageInDays = Math.ceil(
              (currentDate - createdAt) / (1000 * 60 * 60 * 24)
            );

            switch (filter.ageInDays) {
              case "0-2":
                return ageInDays >= 0 && ageInDays <= 2;
              case "3-7":
                return ageInDays >= 3 && ageInDays <= 7;
              case "8-14":
                return ageInDays >= 8 && ageInDays <= 14;
              case ">14":
                return ageInDays > 14;
              default:
                return true;
            }
          })()
        : true;

      // Search Term filter logic
      const matchesSearchTerm =
        searchTerm &&
        (safeToLowerCase(ticket.customerName).includes(
          searchTerm.toLowerCase()
        ) ||
          safeToLowerCase(ticket.contactNumber).includes(
            searchTerm.toLowerCase()
          ) ||
          safeToLowerCase(ticket.trackingId).includes(
            searchTerm.toLowerCase()
          ) ||
          safeToLowerCase(ticket.address).includes(searchTerm.toLowerCase()) ||
          safeToLowerCase(ticket.city).includes(searchTerm.toLowerCase()) ||
          safeToLowerCase(ticket.state).includes(searchTerm.toLowerCase()) ||
          safeToLowerCase(ticket.organization).includes(
            searchTerm.toLowerCase()
          ) ||
          safeToLowerCase(ticket.productType).includes(
            searchTerm.toLowerCase()
          ) ||
          safeToLowerCase(ticket.modelType).includes(
            searchTerm.toLowerCase()
          ) ||
          safeToLowerCase(ticket.serialNumber).includes(
            searchTerm.toLowerCase()
          ));

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
          // Categorize the ticket based on ageInDays
          if (ageInDays >= 0 && ageInDays <= 1) {
            result["0-2Days"]++;
          } else if (ageInDays >= 2 && ageInDays <= 7) {
            result["3-7Days"]++;
          } else if (ageInDays >= 8 && ageInDays <= 14) {
            result["8-14Days"]++;
          } else if (ageInDays > 14) {
            result[">14Days"]++;
          }
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
        style={{
          background: "linear-gradient(135deg, #6a11cb, #2575fc)", // Purple-blue gradient for body
          padding: "2rem 3rem", // Adjusted padding
          borderRadius: "15px",
          color: "white",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)", // Softer shadow for a more refined look
          textAlign: "center",
          fontFamily: "'Roboto', sans-serif",
        }}
      >
        {/* Dashboard Header */}
        <div style={{ marginBottom: "1rem" }}>
          <h2
            style={{
              fontWeight: "700",
              fontSize: "1.2rem", // Slightly smaller size
              letterSpacing: "1px",
              color: "#fff",
              textTransform: "uppercase",
              textShadow: "0 3px 10px rgba(0, 0, 0, 0.15)", // Lighter text shadow
            }}
          >
            Dashboard Overview
          </h2>
        </div>

        {/* Table for Open and Closed Calls */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "2.5rem",
          }}
        >
          <thead>
            <tr
              style={{
                background: "transparent", // Fully transparent background
              }}
            >
              <th
                style={{
                  padding: "1.5rem",
                  borderBottom: "3px solid rgba(255, 255, 255, 0.2)",
                  fontSize: "1rem",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "#fff",
                  fontWeight: "600",
                }}
              >
                Call Type
              </th>
              <th
                style={{
                  padding: "1.5rem",
                  borderBottom: "3px solid rgba(255, 255, 255, 0.2)",
                  fontSize: "1rem",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "#fff",
                  fontWeight: "600",
                }}
              >
                Category
              </th>
              <th
                style={{
                  padding: "1.5rem",
                  borderBottom: "3px solid rgba(255, 255, 255, 0.2)",
                  fontSize: "1rem",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "#fff",
                  fontWeight: "600",
                }}
              >
                0-2 Days
              </th>
              <th
                style={{
                  padding: "1.5rem",
                  borderBottom: "3px solid rgba(255, 255, 255, 0.2)",
                  fontSize: "1rem",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "#fff",
                  fontWeight: "600",
                }}
              >
                3-7 Days
              </th>
              <th
                style={{
                  padding: "1.5rem",
                  borderBottom: "3px solid rgba(255, 255, 255, 0.2)",
                  fontSize: "1rem",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "#fff",
                  fontWeight: "600",
                }}
              >
                8-14 Days
              </th>
              <th
                style={{
                  padding: "1.5rem",
                  borderBottom: "3px solid rgba(255, 255, 255, 0.2)",
                  fontSize: "1rem",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "#fff",
                  fontWeight: "600",
                }}
              >
                &gt;14 Days
              </th>
            </tr>
          </thead>

          <tbody>
            {/* Open Calls */}
            <tr
              style={{
                background: "transparent", // Fully transparent background

                borderBottom: "2px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <td
                rowSpan={2}
                style={{
                  padding: "1.5rem",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  background: "transparent", // Fully transparent
                  color: "#fff",
                  backdropFilter: "blur(10px)",
                }}
              >
                Open Calls
              </td>
              <td
                style={{
                  padding: "1.5rem",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  fontSize: "1rem",
                  backgroundColor: "transparent", // Fully transparent
                  color: "#fff",
                }}
              >
                Hardware
              </td>
              {["0-2Days", "3-7Days", "8-14Days", ">14Days"].map(
                (ageInDays) => (
                  <td
                    key={`open-hardware-${ageInDays}`}
                    style={{
                      padding: "1.5rem",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      fontSize: "1rem",
                      background: "transparent", // Fully transparent
                    }}
                  >
                    <CountUp end={openCalls.hardware[ageInDays]} duration={2} />
                  </td>
                )
              )}
            </tr>

            <tr
              style={{
                background: "transparent", // Fully transparent background

                borderBottom: "2px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <td
                style={{
                  padding: "1.5rem",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  fontSize: "1rem",
                  backgroundColor: "transparent", // Fully transparent
                  color: "#fff",
                }}
              >
                Software
              </td>
              {["0-2Days", "3-7Days", "8-14Days", ">14Days"].map(
                (ageInDays) => (
                  <td
                    key={`open-software-${ageInDays}`}
                    style={{
                      padding: "1.5rem",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      fontSize: "1rem",
                      background: "transparent", // Fully transparent
                    }}
                  >
                    <CountUp end={openCalls.software[ageInDays]} duration={2} />
                  </td>
                )
              )}
            </tr>

            {/* Closed Calls */}
            <tr
              style={{
                background: "transparent", // Fully transparent background

                borderBottom: "2px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <td
                rowSpan={2}
                style={{
                  padding: "1.5rem",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  background: "transparent", // Fully transparent
                  color: "#fff",
                  backdropFilter: "blur(10px)",
                }}
              >
                Closed Calls
              </td>
              <td
                style={{
                  padding: "1.5rem",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  fontSize: "1rem",
                  backgroundColor: "transparent", // Fully transparent
                  color: "#fff",
                }}
              >
                Hardware
              </td>
              {["0-2Days", "3-7Days", "8-14Days", ">14Days"].map(
                (ageInDays) => (
                  <td
                    key={`closed-hardware-${ageInDays}`}
                    style={{
                      padding: "1.5rem",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      fontSize: "1rem",
                      background: "transparent", // Fully transparent
                    }}
                  >
                    <CountUp
                      end={closedCalls.hardware[ageInDays]}
                      duration={2}
                    />
                  </td>
                )
              )}
            </tr>

            <tr
              style={{
                background: "transparent", // Fully transparent background

                borderBottom: "2px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <td
                style={{
                  padding: "1.5rem",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  fontSize: "1rem",
                  backgroundColor: "transparent", // Fully transparent
                  color: "#fff",
                }}
              >
                Software
              </td>
              {["0-2Days", "3-7Days", "8-14Days", ">14Days"].map(
                (ageInDays) => (
                  <td
                    key={`closed-software-${ageInDays}`}
                    style={{
                      padding: "1.5rem",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      fontSize: "1rem",
                      background: "transparent", // Fully transparent
                    }}
                  >
                    <CountUp
                      end={closedCalls.software[ageInDays]}
                      duration={2}
                    />
                  </td>
                )
              )}
            </tr>
          </tbody>
        </table>
        <div style={{ textAlign: "center", marginTop: "-1.5rem" }}>
          <h3 style={{ fontWeight: "bold" }}>
            Total Tickets:{" "}
            <CountUp
              end={
                Object.values(openCalls.hardware).reduce(
                  (sum, val) => sum + val,
                  0
                ) +
                Object.values(openCalls.software).reduce(
                  (sum, val) => sum + val,
                  0
                ) +
                Object.values(closedCalls.hardware).reduce(
                  (sum, val) => sum + val,
                  0
                ) +
                Object.values(closedCalls.software).reduce(
                  (sum, val) => sum + val,
                  0
                )
              }
              duration={2}
            />
          </h3>
        </div>

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
                    placeholder="🔍 Search by ID, name, or anything – let's track it down!"
                    value={searchTerm}
                    onChange={handleSearch}
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
                  <Form.Select
                    value={filter.ageInDays || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFilter({ ...filter, ageInDays: value });
                    }}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "30px",
                      padding: "10px 20px",
                      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
                    }}
                  >
                    <option value="">Select Age in Days</option>
                    <option value="0-2">0-2 Days</option>
                    <option value="3-7">3-7 Days</option>
                    <option value="8-14">8-14 Days</option>
                    <option value=">14">&gt;14 Days</option>
                  </Form.Select>
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
            <Card
              className="mb-4 shadow-lg"
              style={{ height: "500px", overflow: "hidden" }}
            >
              <button
                className="piebutton"
                onClick={handleExport}
                style={{
                  color: "#2575fc",
                  marginBottom: "-10px",
                  marginLeft: "-10px",
                }}
              >
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
                  <strong>Export</strong>
                </div>
              </button>
              <Card.Body
                style={{ height: "100%", overflowY: "auto", padding: "10px" }}
              >
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
                                height: "50px", // Fixed height
                                maxHeight: "50px", // Prevents growing beyond this height
                                overflowX: "auto", // Enables horizontal scrolling for content
                                overflowY: "hidden", // Prevents vertical scrolling
                                textAlign: "center", // Aligns content horizontally
                                verticalAlign: "middle", // Aligns content vertically
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

              {/* Feedback Section */}
              <div className="detail-section">
                <h5 className="section-title">
                  <i className="fas fa-star me-2"></i>
                  Customer Feedback
                </h5>
                {feedback ? (
                  <div className="feedback-container">
                    <div className="rating-display">
                      <span className="rating-label">Rating:</span>
                      <div className="stars-container">
                        <ReactStars
                          count={5}
                          value={feedback.rating}
                          size={24}
                          edit={false}
                          activeColor="#ffd700"
                        />
                        <span className="rating-value">
                          ({feedback.rating}/5)
                        </span>
                      </div>
                    </div>
                    <div className="feedback-comment">
                      <span className="comment-label">Comment:</span>
                      <p className="comment-text">
                        {feedback.comments || "No comments provided"}
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
                            {entry.username || "OPS Manager"}
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

export default OpsManagerDashboard;
