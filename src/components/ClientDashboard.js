import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Card,
  Row,
  Col,
  Container,
  Alert,
  Badge,
  ListGroup,
} from "react-bootstrap";
import axios from "axios";
import "../App.css";
import { toast } from "react-toastify";
const ClientDashboard = () => {
  const [ticketData, setTicketData] = useState({
    customerName: "",
    description: "",
    contactNumber: "",
    billNumber: "",
    productType: "Product A",
    modelType: "Model A",
    address: "",
    serialNumber: "",
    state: "",
    city: "",
  });

  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userId, setUserId] = useState(""); // Store the logged-in user's ID
  const [viewTickets, setViewTickets] = useState(false); // State to toggle between "Raise Ticket" and "View My Tickets"
  const [historyVisible, setHistoryVisible] = useState({}); // Track which ticket's history is visible

  // Get the logged-in user's ID (assuming it's stored in localStorage)
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setUserId(user._id); // Store the user's ID
      setTicketData((prevData) => ({
        ...prevData,
        customerName: user.username, // Set the customer name from the logged-in user
      }));
    }
  }, []);

  // Toggle visibility of history for a specific ticket
  const toggleHistory = (ticketId) => {
    setHistoryVisible((prev) => ({
      ...prev,
      [ticketId]: !prev[ticketId], // Toggle history visibility for this ticket
    }));
  };

  // Function to generate unique tracking ID
  const generateTrackingId = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    return `TRACK-${timestamp}-${randomNum}`;
  };

  // Handle input changes for form fields
  const handleChange = (e) => {
    setTicketData({ ...ticketData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newTrackingId = generateTrackingId();
    const dataToSend = { ...ticketData, trackingId: newTrackingId };

    try {
      // Send the form data to the backend
      const response = await axios.post(
        "http://localhost:5000/tickets/create",
        dataToSend
      );

      // If ticket creation is successful, show success message
      setSuccess(`Ticket raised successfully! Tracking ID: ${newTrackingId}`);
      setError(null);

      // Reset the form after submission
      setTicketData({
        customerName: "",
        serialNumber: "",
        description: "",
        contactNumber: "",
        billNumber: "",
        productType: "Product A",
        modelType: "Model A",
        address: "",
        city: "",
        state: "",
      });

      // Optionally, refresh the page after ticket is raised
      window.location.reload();
    } catch (error) {
      console.error("Error while raising the ticket:", error);

      if (error.response) {
        console.log("Error Response:", error.response); // Log the full response for debugging

        if (error.response.data.errors) {
          // Display backend validation errors using toast
          error.response.data.errors.forEach((err) =>
            toast.error(`${err.message}`, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            })
          );
        } else {
          // Show a generic error message for other backend issues
          toast.error(
            error.response.data.error ||
              "Failed to raise ticket. Please try again.",
            {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            }
          );
        }
      } else {
        // Handle network errors
        toast.error(
          "Network error. Please check your connection and try again.",
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
      }

      setSuccess(null); // Ensure success message is cleared
    }
  };

  // Fetch all tickets raised by the logged-in customer
  const fetchTickets = async () => {
    try {
      const response = await axios.get("http://localhost:5000/tickets/ticket");
      // Filter tickets to only show the ones raised by the logged-in customer
      const customerTickets = response.data.filter(
        (ticket) => ticket.customerName === ticketData.customerName
      );
      setTickets(customerTickets);
      setError(null);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      // setError("Failed to fetch tickets. Please try again.");
    }
  };

  // Handle ticket deletion
  const handleDelete = async (ticketId) => {
    try {
      // Send delete request
      const response = await axios.delete(
        `http://localhost:5000/tickets/delete/${ticketId}`
      );

      // Check if deletion was successful
      if (response.status === 200) {
        setSuccess("Ticket deleted successfully!");
        setError(null);
        fetchTickets(); // Refresh tickets list after deletion

        // Clear the success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      }
    } catch (error) {
      console.error("Error deleting ticket:", error);

      // Handle 404 and 500 errors specifically
      if (error.response && error.response.status === 404) {
        setError("Ticket not found.");
      } else if (error.response && error.response.status === 500) {
        setError("Server error. Failed to delete ticket.");
      } else {
        setError("Failed to delete ticket. Please try again.");
      }

      setSuccess(null);
    }
  };

  // Fetch tickets on component mount
  useEffect(() => {
    fetchTickets();
  }, [ticketData.customerName, viewTickets]); // Fetch tickets again when the customer's name changes

  return (
    <Container className="mt-5">
      <h2
        className="mb-4 text-center"
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
        Your Dashboard: Track & Manage Tickets
      </h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="mb-4 shadow-lg">
        <Card.Body>
          {!viewTickets && (
            <>
              <h4
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
                Raise a New Ticket
              </h4>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formCustomerName">
                  <Form.Label>Customer Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="customerName"
                    value={ticketData.customerName}
                    onChange={handleChange}
                    placeholder="Enter customer name"
                    required
                    disabled
                  />
                </Form.Group>
                <Form.Group controlId="formSerialNumber">
                  <Form.Label>Serial Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="serialNumber"
                    value={ticketData.serialNumber}
                    onChange={handleChange}
                    placeholder="Enter serial number"
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formBillNumber">
                  <Form.Label>Bill Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="billNumber"
                    value={ticketData.billNumber}
                    onChange={handleChange}
                    placeholder="Enter serial number"
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formDescription">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="description"
                    value={ticketData.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe your issue"
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formContactNumber">
                  <Form.Label>Contact Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="contactNumber"
                    value={ticketData.contactNumber}
                    onChange={handleChange}
                    placeholder="Enter contact number"
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formEmailaddress">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={ticketData.email}
                    onChange={handleChange}
                    placeholder="Enter Your Email Here"
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formProductType">
                  <Form.Label>Product Type</Form.Label>
                  <Form.Control
                    as="select"
                    name="productType"
                    value={ticketData.productType}
                    onChange={handleChange}
                  >
                    <option value="Product A">Product A</option>
                    <option value="Product B">Product B</option>
                    <option value="Product C">Product C</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group controlId="formModalType">
                  <Form.Label>Model Type</Form.Label>
                  <Form.Control
                    as="select"
                    name="modelType"
                    value={ticketData.modelType}
                    onChange={handleChange}
                  >
                    <option value="Model A">Model A</option>
                    <option value="Model B">Model B</option>
                    <option value="Model C">Model C</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group controlId="formAddress">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={ticketData.address}
                    onChange={handleChange}
                    placeholder="Enter Your Address"
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formAddress">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    name="city"
                    value={ticketData.city}
                    onChange={handleChange}
                    placeholder="Enter Your City"
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formAddress">
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    type="text"
                    name="state"
                    value={ticketData.state}
                    onChange={handleChange}
                    placeholder="Enter Your State"
                    required
                  />
                </Form.Group>

                <button class="btn1 my-3" type="submit">
                  <span>
                    Submit
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <g stroke-width="0" id="SVGRepo_bgCarrier"></g>
                      <g
                        stroke-linejoin="round"
                        stroke-linecap="round"
                        id="SVGRepo_tracerCarrier"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        {" "}
                        <path
                          fill="#ffffff"
                          d="M20.33 3.66996C20.1408 3.48213 19.9035 3.35008 19.6442 3.28833C19.3849 3.22659 19.1135 3.23753 18.86 3.31996L4.23 8.19996C3.95867 8.28593 3.71891 8.45039 3.54099 8.67255C3.36307 8.89471 3.25498 9.16462 3.23037 9.44818C3.20576 9.73174 3.26573 10.0162 3.40271 10.2657C3.5397 10.5152 3.74754 10.7185 4 10.85L10.07 13.85L13.07 19.94C13.1906 20.1783 13.3751 20.3785 13.6029 20.518C13.8307 20.6575 14.0929 20.7309 14.36 20.73H14.46C14.7461 20.7089 15.0192 20.6023 15.2439 20.4239C15.4686 20.2456 15.6345 20.0038 15.72 19.73L20.67 5.13996C20.7584 4.88789 20.7734 4.6159 20.7132 4.35565C20.653 4.09541 20.5201 3.85762 20.33 3.66996ZM4.85 9.57996L17.62 5.31996L10.53 12.41L4.85 9.57996ZM14.43 19.15L11.59 13.47L18.68 6.37996L14.43 19.15Z"
                        ></path>{" "}
                      </g>
                    </svg>
                  </span>
                  <span>Sure ?</span>
                  <span>
                    Done !
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <g stroke-width="0" id="SVGRepo_bgCarrier"></g>
                      <g
                        stroke-linejoin="round"
                        stroke-linecap="round"
                        id="SVGRepo_tracerCarrier"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        {" "}
                        <path
                          stroke-linecap="round"
                          stroke-width="2"
                          stroke="#ffffff"
                          d="M8.00011 13L12.2278 16.3821C12.6557 16.7245 13.2794 16.6586 13.6264 16.2345L22.0001 6"
                        ></path>{" "}
                        <path
                          fill="#ffffff"
                          d="M11.1892 12.2368L15.774 6.63327C16.1237 6.20582 16.0607 5.5758 15.6332 5.22607C15.2058 4.87635 14.5758 4.93935 14.226 5.36679L9.65273 10.9564L11.1892 12.2368ZM8.02292 16.1068L6.48641 14.8263L5.83309 15.6248L2.6 13.2C2.15817 12.8687 1.53137 12.9582 1.2 13.4C0.868627 13.8419 0.95817 14.4687 1.4 14.8L4.63309 17.2248C5.49047 17.8679 6.70234 17.7208 7.381 16.8913L8.02292 16.1068Z"
                          clip-rule="evenodd"
                          fill-rule="evenodd"
                        ></path>{" "}
                      </g>
                    </svg>
                  </span>
                </button>
              </Form>
            </>
          )}

          {viewTickets && (
            <>
              <h4 className="mb-4">Your Tickets</h4>
              <Row>
                {tickets.length > 0 ? (
                  tickets.map((ticket) => (
                    <Col md={6} key={ticket._id} className="mb-4">
                      <Card className="shadow-lg ticket-card">
                        <Card.Body>
                          <Card.Title>
                            <strong>Tracking ID:</strong> {ticket.trackingId}
                          </Card.Title>
                          <hr />
                          <Card.Text>
                            {" "}
                            <strong>Name: </strong>
                            {ticket.customerName}
                          </Card.Text>
                          <Card.Text>
                            {" "}
                            <strong>Description: </strong>
                            {ticket.description}
                          </Card.Text>

                          <Card.Text>
                            <strong>Serial Number:</strong>{" "}
                            {ticket.serialNumber}
                          </Card.Text>
                          <Card.Text>
                            <strong>Bill Number:</strong> {ticket.billNumber}
                          </Card.Text>
                          <Card.Text>
                            <strong>Contact Number:</strong>{" "}
                            {ticket.contactNumber}
                          </Card.Text>
                          <Card.Text>
                            <strong>Email:</strong> {ticket.email}
                          </Card.Text>
                          <Card.Text>
                            <strong>Product Type:</strong> {ticket.productType}
                          </Card.Text>
                          <Card.Text>
                            <strong>Model Type:</strong> {ticket.modelType}
                          </Card.Text>
                          <Card.Text>
                            <strong>Address:</strong> {ticket.address}
                          </Card.Text>
                          <Card.Text>
                            <strong>City:</strong> {ticket.city}
                          </Card.Text>
                          <Card.Text>
                            <strong>State:</strong> {ticket.state}
                          </Card.Text>

                          <Card.Text>
                            <strong>Status:</strong>{" "}
                            <Badge
                              pill
                              bg={
                                ticket.status === "Resolved"
                                  ? "success"
                                  : ticket.status === "Closed"
                                  ? "dark"
                                  : "warning"
                              }
                            >
                              {ticket.status}
                            </Badge>
                          </Card.Text>
                          <Button
                            variant="danger"
                            onClick={() => handleDelete(ticket._id)}
                            style={{
                              background:
                                "linear-gradient(135deg, #ff4d4d, #ff3333)",
                              border: "none",
                              borderRadius: "20px",
                              color: "#fff",
                              fontWeight: "bold",
                              padding: "10px 20px",
                              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                              transition:
                                "transform 0.3s ease, box-shadow 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = "scale(1.05)";
                              e.target.style.boxShadow =
                                "0 6px 8px rgba(0, 0, 0, 0.2)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = "scale(1)";
                              e.target.style.boxShadow =
                                "0 4px 6px rgba(0, 0, 0, 0.1)";
                            }}
                          >
                            <i className="fas fa-trash-alt"></i> Remove Ticket
                          </Button>

                          <Button
                            variant="info"
                            onClick={() => toggleHistory(ticket._id)}
                            style={{
                              background:
                                "linear-gradient(90deg, #6a11cb, #2575fc)",

                              border: "none",
                              borderRadius: "20px",
                              color: "#fff",
                              fontWeight: "bold",
                              padding: "10px 20px",
                              marginLeft: "10px",
                              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                              transition:
                                "transform 0.3s ease, box-shadow 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = "scale(1.05)";
                              e.target.style.boxShadow =
                                "0 6px 8px rgba(0, 0, 0, 0.2)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = "scale(1)";
                              e.target.style.boxShadow =
                                "0 4px 6px rgba(0, 0, 0, 0.1)";
                            }}
                          >
                            <i className="fas fa-history"></i>{" "}
                            {historyVisible[ticket._id]
                              ? "Hide History"
                              : "View History"}
                          </Button>

                          {/* Display Ticket History */}
                          {historyVisible[ticket._id] && (
                            <ListGroup className="mt-3">
                              {ticket.history?.map((historyItem, index) => (
                                <ListGroup.Item key={index}>
                                  <div style={{ flex: 1 }}>
                                    <strong>Status:</strong>{" "}
                                    {historyItem.status}
                                    <br />
                                    <small>
                                      {new Date(
                                        historyItem.date
                                      ).toLocaleString()}
                                    </small>
                                  </div>
                                </ListGroup.Item>
                              ))}
                            </ListGroup>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  ))
                ) : (
                  <Col md={12}>
                    <p className="text-center">
                      No tickets found. Please raise a new ticket.
                    </p>
                  </Col>
                )}
              </Row>
            </>
          )}
        </Card.Body>
      </Card>

      <div className="text-center">
        <button
          type="button"
          style={{ background: "linear-gradient(90deg, #6a11cb, #2575fc)" }}
          onClick={() => setViewTickets(!viewTickets)}
          className="button my-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-arrow-left-right"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M2 8a.5.5 0 0 1 .5-.5H12.707l-2.854-2.854a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L12.707 8H2.5A.5.5 0 0 1 2 8z"
            />
          </svg>
          {viewTickets ? "Raise New Ticket" : "View My Tickets"}
        </button>
      </div>
    </Container>
  );
};

export default ClientDashboard;
