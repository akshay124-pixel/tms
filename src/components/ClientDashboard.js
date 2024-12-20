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
import ReactStars from "react-rating-stars-component";
import { toast } from "react-toastify";
const ClientDashboard = () => {
  const [ticketData, setTicketData] = useState({
    customerName: "",
    organization: "",
    description: "",
    contactNumber: "",
    billImage: "",
    productType: "",
    modelType: "",
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
  const [selectedState, setSelectedState] = useState(ticketData.state || "");
  const [selectedCity, setSelectedCity] = useState(ticketData.city || "");
  const [billImage, setBillImage] = useState(null);
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
  const handleFileChange = (e) => {
    setBillImage(e.target.files[0]); // Update billImage state with the selected file
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if a file is uploaded
    if (!billImage) {
      toast.error("Please upload a bill image!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    const newTrackingId = generateTrackingId();

    // Create a FormData object
    const data = new FormData();
    Object.keys(ticketData).forEach((key) => {
      data.append(key, ticketData[key]);
    });
    data.append("billImage", billImage); // Add the uploaded file
    data.append("trackingId", newTrackingId); // Include tracking ID in the request

    try {
      // Send the form data to the backend
      const response = await axios.post(
        "https://tms-server-saeo.onrender.com/tickets/create",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Ensure proper content type
          },
        }
      );

      // If ticket creation is successful, show success message
      setSuccess(`Ticket raised successfully! Tracking ID: ${newTrackingId}`);
      setError(null);

      // Reset the form after submission
      setTicketData({
        customerName: "",
        organization: "",
        serialNumber: "",
        description: "",
        contactNumber: "",
        productType: "",
        modelType: "",
        address: "",
        city: "",
        state: "",
      });
      setBillImage(null); // Reset the file input
      toast.success("Successfully raised ticket", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      // Optionally, refresh the required UI elements
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
      const response = await axios.get(
        "https://tms-server-saeo.onrender.com/tickets/ticket"
      );
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

  // // Handle ticket deletion
  // const handleDelete = async (ticketId) => {
  //   try {
  //     // Send delete request
  //     const response = await axios.delete(
  //       `https://tms-server-saeo.onrender.com/tickets/delete/${ticketId}`
  //     );

  //     // Check if deletion was successful
  //     if (response.status === 200) {
  //       setSuccess("Ticket deleted successfully!");
  //       setError(null);
  //       fetchTickets(); // Refresh tickets list after deletion

  //       // Clear the success message after 3 seconds
  //       setTimeout(() => {
  //         setSuccess(null);
  //       }, 3000);
  //     }
  //   } catch (error) {
  //     console.error("Error deleting ticket:", error);

  //     // Handle 404 and 500 errors specifically
  //     if (error.response && error.response.status === 404) {
  //       setError("Ticket not found.");
  //     } else if (error.response && error.response.status === 500) {
  //       setError("Server error. Failed to delete ticket.");
  //     } else {
  //       setError("Failed to delete ticket. Please try again.");
  //     }

  //     setSuccess(null);
  //   }
  // };

  // FeedBack
  const [feedbacks, setFeedbacks] = useState({}); // Store feedback for each ticket
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState({}); // Track if feedback is already submitted

  // Load feedback data from localStorage on mount
  useEffect(() => {
    const storedFeedback = JSON.parse(localStorage.getItem("feedbacks"));
    const storedSubmissionStatus = JSON.parse(
      localStorage.getItem("isFeedbackSubmitted")
    );

    if (storedFeedback) {
      setFeedbacks(storedFeedback);
    }
    if (storedSubmissionStatus) {
      setIsFeedbackSubmitted(storedSubmissionStatus);
    }
  }, []);

  // Save feedback data to localStorage whenever feedback state changes
  useEffect(() => {
    if (Object.keys(feedbacks).length > 0) {
      localStorage.setItem("feedbacks", JSON.stringify(feedbacks));
    }
    if (Object.keys(isFeedbackSubmitted).length > 0) {
      localStorage.setItem(
        "isFeedbackSubmitted",
        JSON.stringify(isFeedbackSubmitted)
      );
    }
  }, [feedbacks, isFeedbackSubmitted]);

  const handleFeedbackChange = (ticketId, rating) => {
    setFeedbacks((prevFeedbacks) => ({
      ...prevFeedbacks,
      [ticketId]: { ...prevFeedbacks[ticketId], rating },
    }));
  };

  const handleCommentChange = (ticketId, comment) => {
    setFeedbacks((prevFeedbacks) => ({
      ...prevFeedbacks,
      [ticketId]: { ...prevFeedbacks[ticketId], comment },
    }));
  };

  const submitFeedback = async (ticketId) => {
    const feedback = feedbacks[ticketId];
    console.log("Submitting Feedback for Ticket ID:", ticketId, feedback);

    try {
      const feedbackData = {
        ticketId: ticketId,
        rating: feedback.rating,
        comments: feedback.comment, // Ensure backend field matches
      };

      const response = await axios.post(
        `https://tms-server-saeo.onrender.com/tickets/${ticketId}/feedback`, // Make sure this URL matches
        feedbackData
      );

      toast.success("Feedback submitted successfully!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Mark feedback as submitted for this ticket
      setIsFeedbackSubmitted((prev) => ({
        ...prev,
        [ticketId]: true, // Ticket feedback has been submitted
      }));

      // Save feedback submission status to localStorage
      localStorage.setItem(
        "isFeedbackSubmitted",
        JSON.stringify({
          ...isFeedbackSubmitted,
          [ticketId]: true,
        })
      );
    } catch (error) {
      console.error("Error while submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  // End FeedBack

  // New
  // Handle state selection
  const handleStateChange = (e) => {
    const state = e.target.value;
    setSelectedState(state);
    setSelectedCity(""); // Reset city when state changes
    setTicketData((prev) => ({
      ...prev,
      state,
      city: "", // Clear the city when state changes
    }));
  };

  // Handle city selection
  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
    setTicketData((prev) => ({
      ...prev,
      city,
    }));
  };
  const statesAndCities = {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati"],
    "Arunachal Pradesh": ["Itanagar", "Tawang", "Ziro", "Pasighat"],
    Assam: ["Guwahati", "Dibrugarh", "Jorhat", "Silchar"],
    Bihar: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur"],
    Chhattisgarh: ["Raipur", "Bilaspur", "Durg", "Korba"],
    Goa: ["Panaji", "Margao", "Vasco da Gama", "Mapusa"],
    Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
    Haryana: [
      "Gurugram",
      "Faridabad",
      "Panipat",
      "Ambala",
      "Hisar",
      "Rohtak",
      "Karnal",
      "Bhiwani",
      "Kaithal",
      "Kurukshetra",
      "Sonipat",
      "Jhajjar",
      "Jind",
      "Fatehabad",
      "Pehowa",
      "Pinjore",
      "Rewari",
      "Yamunanagar",
      "Sirsa",
      "Dabwali",
      "Narwana",
    ],
    "Himachal Pradesh": [
      "Shimla",
      "Dharamshala",
      "Solan",
      "Mandi",
      "Hamirpur",
      "Kullu",
      "Manali",
      "Nahan",
      "Palampur",
      "Baddi",
      "Sundarnagar",
      "Paonta Sahib",
      "Bilaspur",
      "Chamba",
      "Una",
      "Kangra",
      "Parwanoo",
      "Nalagarh",
      "Rohru",
      "Keylong",
    ],
    Jharkhand: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro"],
    Karnataka: ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi"],
    Kerala: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Kannur"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur"],
    Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik"],
    Manipur: ["Imphal", "Churachandpur", "Thoubal", "Bishnupur"],
    Meghalaya: ["Shillong", "Tura", "Nongpoh", "Cherrapunjee"],
    Mizoram: ["Aizawl", "Lunglei", "Champhai", "Serchhip"],
    Nagaland: ["Kohima", "Dimapur", "Mokokchung", "Tuensang"],
    Odisha: ["Bhubaneswar", "Cuttack", "Rourkela", "Puri"],
    Punjab: [
      "Amritsar",
      "Mohali",
      "Ludhiana",
      "Patiala",
      "Jalandhar",
      "Gurdaspur",
      "Bathinda",
      "Ropar (Rupnagar)",
      "Kharar",
      "Khanna",
      "Zirakpur",
      "Samrala",
      "Anandpur Sahib",
      "Mansa",
      "Sirhind",
      "Ferozepur",
      "Fazilka",
      "Morinda",
      "Makatsar",
      "Bassi Pathana",
      "Sangrur",
      "Khamano",
      "Chunni Kalan",
    ],
    Rajasthan: ["Jaipur", "Udaipur", "Jodhpur", "Kota"],
    Sikkim: ["Gangtok", "Namchi", "Pelling", "Geyzing"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"],
    Telangana: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"],
    Tripura: ["Agartala", "Udaipur", "Dharmanagar", "Kailashahar"],
    "Uttar Pradesh": [
      "Lucknow",
      "Kasganj",
      "Kanpur",
      "Varanasi",
      "Agra",
      "Prayagraj (Allahabad)",
      "Ghaziabad",
      "Noida",
      "Meerut",
      "Aligarh",
      "Bareilly",
      "Moradabad",
      "Saharanpur",
      "Gorakhpur",
      "Firozabad",
      "Jhansi",
      "Muzaffarnagar",
      "Mathura-Vrindavan",
      "Budaun",
      "Rampur",
      "Shahjahanpur",
      "Farrukhabad-Fatehgarh",
      "Ayodhya",
      "Unnao",
      "Jaunpur",
      "Lakhimpur",
      "Hathras",
      "Banda",
      "Pilibhit",
      "Barabanki",
      "Khurja",
      "Gonda",
      "Mainpuri",
      "Lalitpur",
      "Sitapur",
      "Etah",
      "Deoria",
      "Ghazipur",
    ],
    Uttarakhand: ["Dehradun", "Haridwar", "Nainital", "Rishikesh"],
    "West Bengal": ["Kolkata", "Darjeeling", "Siliguri", "Howrah"],
    "Andaman and Nicobar Islands": [
      "Port Blair",
      "Havelock Island",
      "Diglipur",
    ],
    Chandigarh: ["Chandigarh"],
    "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
    Delhi: ["New Delhi"],
    "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla"],
    Ladakh: ["Leh", "Kargil"],
    Lakshadweep: ["Kavaratti", "Agatti", "Minicoy"],
    Puducherry: ["Puducherry", "Karaikal", "Mahe", "Yanam"],
  };

  // End New

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
                  <Form.Label>
                    <strong>Customer Name</strong>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="customerName"
                    value={ticketData.customerName}
                    onChange={handleChange}
                    placeholder="Enter customer name (individual, business, or institution)"
                    required
                    disabled
                  />
                </Form.Group>
                <Form.Group controlId="formOrganization">
                  <Form.Label>
                    <strong>Organization</strong>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="organization"
                    value={ticketData.organization}
                    onChange={handleChange}
                    placeholder="Enter the organization, college, or company name"
                  />
                </Form.Group>
                <Form.Group controlId="formSerialNumber">
                  <Form.Label>
                    <strong>Serial Number</strong>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="serialNumber"
                    value={ticketData.serialNumber}
                    onChange={handleChange}
                    placeholder="Enter serial number"
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formFile" className="mb-3">
                  <Form.Label>
                    <strong>Upload Bill</strong>
                  </Form.Label>
                  <div className="input-group">
                    <Form.Control
                      type="file"
                      name="billImage"
                      onChange={handleFileChange}
                      className="form-control"
                    />
                  </div>
                </Form.Group>
                <Form.Group controlId="formDescription">
                  <Form.Label>
                    <strong>Description</strong>
                  </Form.Label>
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
                  <Form.Label>
                    <strong>Contact Number</strong>
                  </Form.Label>
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
                  <Form.Label>
                    <strong>Email</strong>
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={ticketData.email}
                    onChange={handleChange}
                    placeholder="Enter Your Email Here"
                    required
                  />
                </Form.Group>
                <Form.Group className="my-3" controlId="formProductType">
                  <Form.Label className="fw-bold">
                    Select Product Type
                  </Form.Label>
                  <Form.Select
                    className="custom-dropdown"
                    aria-label="Select Product Type"
                    name="productType"
                    value={ticketData.productType}
                    onChange={handleChange}
                  >
                    <option value="">-- Select Product Type --</option>
                    <option value="Audio Podium">Audio Podium</option>
                    <option value="Digital Podium">Digital Podium</option>
                    <option value="IFPD">IFPD</option>
                    <option value="Mike">Mike</option>
                    <option value="OPS">OPS</option>
                    <option value="PTZ Camera">PTZ Camera</option>
                    <option value="UPS">UPS</option>
                    <option value="Shutter">Shutter</option>
                    <option value="Web Camera">Web Camera</option>
                    <option value="IWB">IWB</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="my-3" controlId="formModelType">
                  <Form.Label className="fw-bold">Select Model Type</Form.Label>
                  <Form.Select
                    className="custom-dropdown"
                    aria-label="Select Model Type"
                    name="modelType"
                    value={ticketData.modelType}
                    onChange={handleChange}
                  >
                    <option value="">-- Select Model Type --</option>
                    <option value="HKC">HKC</option>
                    <option value="OKV">OKV</option>
                    <option value="PRO AT">PRO AT</option>
                    <option value="Q Series">Q Series</option>
                    <option value="RSP">RSP</option>
                    <option value="T9">T9</option>
                    <option value="T9H">T9H</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group controlId="formAddress">
                  <Form.Label>
                    <strong>Address</strong>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={ticketData.address}
                    onChange={handleChange}
                    placeholder="Enter Your Address"
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formState">
                  <Form.Label>
                    <strong>State </strong>
                  </Form.Label>
                  <Form.Select
                    value={selectedState}
                    onChange={handleStateChange}
                  >
                    <option value="">-- Select State --</option>
                    {Object.keys(statesAndCities).map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group controlId="formCity" className="mt">
                  <Form.Label>
                    <strong>City</strong>
                  </Form.Label>
                  <Form.Select
                    value={selectedCity}
                    onChange={handleCityChange}
                    disabled={!selectedState} // Disable city dropdown if no state is selected
                  >
                    <option value="">-- Select City --</option>
                    {selectedState &&
                      statesAndCities[selectedState].map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>

                <button className="btn1 my-3" type="submit">
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
              <h4
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
                Your Tickets
              </h4>
              <Row>
                {tickets.length > 0 ? (
                  tickets.map((ticket) => (
                    <Col md={6} key={ticket._id} className="mb-4">
                      <Card className="shadow-lg ticket-card">
                        <Card.Body>
                          {/* Ticket Details */}
                          <Card.Title>
                            <strong style={{ color: "green" }}>
                              Tracking ID:
                            </strong>{" "}
                            {ticket.trackingId}
                          </Card.Title>
                          <hr />
                          <Card.Text>
                            <strong>Customer Name:</strong>{" "}
                            {ticket.customerName}
                          </Card.Text>{" "}
                          <Card.Text>
                            <strong>Organization:</strong> {ticket.organization}
                          </Card.Text>
                          <Card.Text>
                            <strong>Description:</strong> {ticket.description}
                          </Card.Text>
                          <Card.Text>
                            <strong>Serial Number:</strong>{" "}
                            {ticket.serialNumber}
                          </Card.Text>
                          <Card.Text>
                            <strong>Bill Image:</strong> {ticket.billImage}
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
                          {/* Ticket History */}
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
                              marginBottom: "10px",
                              transition:
                                "transform 0.3s ease, box-shadow 0.3s ease",
                            }}
                          >
                            <i className="fas fa-history"></i>{" "}
                            {historyVisible[ticket._id]
                              ? "Hide History"
                              : "View History"}
                          </Button>
                          {historyVisible[ticket._id] && (
                            <ListGroup className="mt-3">
                              {ticket.history?.map((historyItem, index) => (
                                <ListGroup.Item key={index}>
                                  <strong>Status:</strong> {historyItem.status}
                                  <br />
                                  <small>
                                    {new Date(
                                      historyItem.date
                                    ).toLocaleString()}
                                  </small>
                                </ListGroup.Item>
                              ))}
                            </ListGroup>
                          )}
                          {ticket.status === "Closed" &&
                            !isFeedbackSubmitted[ticket._id] && (
                              <div className="feedback-section mt-3">
                                <h5>
                                  <strong>Feedback</strong>
                                </h5>
                                {/* Star Rating */}
                                <ReactStars
                                  count={5}
                                  value={feedbacks[ticket._id]?.rating || 0}
                                  onChange={(rating) =>
                                    handleFeedbackChange(ticket._id, rating)
                                  }
                                  size={24}
                                  activeColor="#ffd700"
                                />
                                {/* Comment Box */}
                                <textarea
                                  className="form-control mt-2"
                                  placeholder="Leave your comments here..."
                                  rows="3"
                                  value={feedbacks[ticket._id]?.comment || ""}
                                  onChange={(e) =>
                                    handleCommentChange(
                                      ticket._id,
                                      e.target.value
                                    )
                                  }
                                />
                                {/* Submit Feedback Button */}
                                <Button
                                  variant="primary"
                                  className="mt-2"
                                  onClick={() => submitFeedback(ticket._id)}
                                  style={{
                                    background:
                                      "linear-gradient(90deg, #11998e, #38ef7d)",
                                    border: "none",
                                    borderRadius: "20px",
                                    fontWeight: "bold",
                                    color: "#fff",
                                  }}
                                >
                                  Submit Feedback
                                </Button>
                              </div>
                            )}
                          {isFeedbackSubmitted[ticket._id] && (
                            <p>Feedback already submitted for this ticket.</p>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  ))
                ) : (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <p>No tickets available.</p>
                  </div>
                )}
              </Row>
            </>
          )}
        </Card.Body>
      </Card>

      <div className="text-center">
        <button
          type="button"
          style={{
            background: "linear-gradient(90deg, #6a11cb, #2575fc)",
            fontWeight: "bold",
          }}
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
