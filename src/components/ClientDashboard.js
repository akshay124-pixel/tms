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
  Collapse,
} from "react-bootstrap";
import axios from "axios";
import "../App.css";
import ReactStars from "react-rating-stars-component";
import { toast } from "react-toastify";
import "../styles/ClientDashboard.css";

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
  const [selectedFileName, setSelectedFileName] = useState("");
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
    const file = e.target.files[0];
    if (file) {
      setBillImage(file);
      setSelectedFileName(file.name);
      // Show success toast
      toast.success("Bill uploaded successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
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
    "Andhra Pradesh": [
      "Visakhapatnam",
      "Jaganathpuram",
      "Vijayawada",
      "Guntur",
      "Tirupati",
      "Kurnool",
      "Rajahmundry",
      "Nellore",
      "Anantapur",
      "Kadapa",
      "Srikakulam",
      "Eluru",
      "Ongole",
      "Chittoor",
      "Proddatur",
      "Machilipatnam",
    ],
    "Arunachal Pradesh": [
      "Itanagar",
      "Tawang",
      "Ziro",
      "Pasighat",
      "Bomdila",
      "Naharlagun",
      "Roing",
      "Aalo",
      "Tezu",
      "Changlang",
      "Khonsa",
      "Yingkiong",
      "Daporijo",
      "Seppa",
    ],
    Assam: [
      "Agartala",
      "Tripura",
      "Guwahati",
      "Dibrugarh",
      "Jorhat",
      "Silchar",
      "Tezpur",
      "Tinsukia",
      "Nagaon",
      "Sivasagar",
      "Barpeta",
      "Goalpara",
      "Karimganj",
      "Lakhimpur",
      "Diphu",
      "Golaghat",
      "Kamrup",
    ],
    Bihar: [
      "Patna",
      "Mirzapur",
      "Jehanabad",
      "Mithapur",
      "Gaya",
      "Bhagalpur",
      "Muzaffarpur",
      "Darbhanga",
      "Purnia",
      "Ara",
      "Begusarai",
      "Katihar",
      "Munger",
      "Chapra",
      "Sasaram",
      "Hajipur",
      "Bihar Sharif",
      "Sitamarhi",
    ],
    Chhattisgarh: [
      "Raipur",
      "Bilaspur",
      "Durg",
      "Korba",
      "Bhilai",
      "Rajnandgaon",
      "Jagdalpur",
      "Ambikapur",
      "Raigarh",
      "Dhamtari",
      "Kawardha",
      "Mahasamund",
      "Kondagaon",
      "Bijapur",
    ],
    Goa: [
      "Panaji",
      "Margao",
      "Vasco da Gama",
      "Mapusa",
      "Ponda",
      "Bicholim",
      "Sanguem",
      "Canacona",
      "Quepem",
      "Valpoi",
      "Sanquelim",
      "Curchorem",
    ],
    Gujarat: [
      "Ahmedabad",
      "Surat",
      "Vadodara",
      "Rajkot",
      "Bhavnagar",
      "Jamnagar",
      "Junagadh",
      "Gandhinagar",
      "Anand",
      "Morbi",
      "Nadiad",
      "Porbandar",
      "Mehsana",
      "Bharuch",
      "Navsari",
      "Surendranagar",
    ],
    Haryana: [
      "Bahadurgarh",
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
      "Nagrota Surian",
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
    Jharkhand: [
      "Ranchi",
      "Jamshedpur",
      "Dhanbad",
      "Bokaro",
      "Deoghar",
      "Hazaribagh",
      "Giridih",
      "Ramgarh",
      "Chaibasa",
      "Palamu",
      "Gumla",
      "Lohardaga",
      "Dumka",
      "Chatra",
      "Pakur",
      "Jamtara",
      "Simdega",
      "Sahibganj",
      "Godda",
      "Latehar",
      "Khunti",
    ],
    Karnataka: [
      "Bengaluru",
      "Mysuru",
      "Mangaluru",
      "Hubballi",
      "Belagavi",
      "Kalaburagi",
      "Ballari",
      "Davangere",
      "Shivamogga",
      "Tumakuru",
      "Udupi",
      "Vijayapura",
      "Chikkamagaluru",
      "Hassan",
      "Mandya",
      "Raichur",
      "Bidar",
      "Bagalkot",
      "Chitradurga",
      "Kolar",
      "Gadag",
      "Yadgir",
      "Haveri",
      "Dharwad",
      "Ramanagara",
      "Chikkaballapur",
      "Kodagu",
      "Koppal",
    ],
    Kerala: [
      "Thiruvananthapuram",
      "Kochi",
      "Kozhikode",
      "Kannur",
      "Alappuzha",
      "Thrissur",
      "Kottayam",
      "Palakkad",
      "Ernakulam",
      "Malappuram",
      "Pathanamthitta",
      "Idukki",
      "Wayanad",
      "Kollam",
      "Kasaragod",
      "Punalur",
      "Varkala",
      "Changanassery",
      "Kayani",
      "Kizhakkambalam",
      "Perumbavoor",
      "Muvattupuzha",
      "Attingal",
      "Vypin",
      "North Paravur",
      "Adoor",
      "Cherthala",
      "Mattancherry",
      "Fort Kochi",
      "Munroe Island",
    ],
    "Madhya Pradesh": [
      "Bhopal",
      "Indore",
      "Gwalior",
      "Jabalpur",
      "Ujjain",
      "Sagar",
      "Ratlam",
      "Satna",
      "Dewas",
      "Murwara (Katni)",
      "Chhindwara",
      "Rewa",
      "Burhanpur",
      "Khandwa",
      "Bhind",
      "Shivpuri",
      "Vidisha",
      "Sehore",
      "Hoshangabad",
      "Itarsi",
      "Neemuch",
      "Chhatarpur",
      "Betul",
      "Mandsaur",
      "Damoh",
      "Singrauli",
      "Guna",
      "Ashok Nagar",
      "Datia",
      "Mhow",
      "Pithampur",
      "Shahdol",
      "Seoni",
      "Mandla",
      "Tikamgarh",
      "Raisen",
      "Narsinghpur",
      "Morena",
      "Barwani",
      "Rajgarh",
      "Khargone",
      "Anuppur",
      "Umaria",
      "Dindori",
      "Sheopur",
      "Alirajpur",
      "Jhabua",
      "Sidhi",
      "Harda",
      "Balaghat",
      "Agar Malwa",
    ],
    Maharashtra: [
      "Mumbai",
      "Pune",
      "Nagpur",
      "Nashik",
      "Aurangabad",
      "Solapur",
      "Kolhapur",
      "Thane",
      "Satara",
      "Latur",
      "Chandrapur",
      "Jalgaon",
      "Bhiwandi",
      "Shirdi",
      "Akola",
      "Parbhani",
      "Raigad",
      "Washim",
      "Buldhana",
      "Nanded",
      "Yavatmal",
      "Beed",
      "Amravati",
      "Kalyan",
      "Dombivli",
      "Ulhasnagar",
      "Nagothane",
      "Vasai",
      "Virar",
      "Mira-Bhayandar",
      "Dhule",
      "Sangli",
      "Wardha",
      "Ahmednagar",
      "Pandharpur",
      "Malegaon",
      "Osmanabad",
      "Gondia",
      "Baramati",
      "Jalna",
      "Hingoli",
      "Sindhudurg",
      "Ratnagiri",
      "Palghar",
      "Ambarnath",
      "Badlapur",
      "Taloja",
      "Alibaug",
      "Murbad",
      "Karjat",
      "Pen",
      "Newasa",
    ],
    Manipur: [
      "Imphal",
      "Churachandpur",
      "Thoubal",
      "Bishnupur",
      "Kakching",
      "Senapati",
      "Ukhrul",
      "Tamenglong",
      "Jiribam",
      "Moreh",
      "Noney",
      "Pherzawl",
      "Kangpokpi",
    ],
    Meghalaya: [
      "Shillong",
      "Tura",
      "Nongpoh",
      "Cherrapunjee",
      "Jowai",
      "Baghmara",
      "Williamnagar",
      "Mawkyrwat",
      "Resubelpara",
      "Mairang",
    ],
    Mizoram: [
      "Aizawl",
      "Lunglei",
      "Champhai",
      "Serchhip",
      "Kolasib",
      "Saiha",
      "Lawngtlai",
      "Mamit",
      "Hnahthial",
      "Khawzawl",
      "Saitual",
    ],
    Nagaland: [
      "Kohima",
      "Dimapur",
      "Mokokchung",
      "Tuensang",
      "Wokha",
      "Mon",
      "Zunheboto",
      "Phek",
      "Longleng",
      "Kiphire",
      "Peren",
    ],
    Odisha: [
      "Bhubaneswar",
      "Cuttack",
      "Rourkela",
      "Puri",
      "Sambalpur",
      "Berhampur",
      "Balasore",
      "Baripada",
      "Bhadrak",
      "Jeypore",
      "Angul",
      "Dhenkanal",
      "Keonjhar",
      "Kendrapara",
      "Jagatsinghpur",
      "Paradeep",
      "Bargarh",
      "Rayagada",
      "Koraput",
      "Nabarangpur",
      "Kalahandi",
      "Nuapada",
      "Phulbani",
      "Balangir",
      "Sundargarh",
    ],
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
      "Balachaur",
    ],
    Rajasthan: [
      "Newai",
      "Gaganagar",
      "Suratgarh",
      "Jaipur",
      "Udaipur",
      "Jodhpur",
      "Kota",
      "Ajmer",
      "Bikaner",
      "Alwar",
      "Bharatpur",
      "Sikar",
      "Pali",
      "Nagaur",
      "Jhunjhunu",
      "Chittorgarh",
      "Tonk",
      "Barmer",
      "Jaisalmer",
      "Dholpur",
      "Bhilwara",
      "Hanumangarh",
      "Sawai Madhopur",
    ],
    Sikkim: [
      "Gangtok",
      "Namchi",
      "Pelling",
      "Geyzing",
      "Mangan",
      "Rangpo",
      "Jorethang",
      "Yuksom",
      "Ravangla",
      "Lachen",
      "Lachung",
    ],
    "Tamil Nadu": [
      "Chennai",
      "Coimbatore",
      "Madurai",
      "Tiruchirappalli",
      "Salem",
      "Erode",
      "Tirunelveli",
      "Vellore",
      "Thanjavur",
      "Tuticorin",
      "Dindigul",
      "Cuddalore",
      "Kancheepuram",
      "Nagercoil",
      "Kumbakonam",
      "Karur",
      "Sivakasi",
      "Namakkal",
      "Tiruppur",
    ],
    Telangana: [
      "Hyderabad",
      "Warangal",
      "Nizamabad",
      "Karimnagar",
      "Khammam",
      "Mahbubnagar",
      "Ramagundam",
      "Siddipet",
      "Adilabad",
      "Nalgonda",
      "Mancherial",
      "Kothagudem",
      "Zaheerabad",
      "Miryalaguda",
      "Bhongir",
      "Jagtial",
    ],
    Tripura: [
      "Agartala",
      "Udaipur",
      "Dharmanagar",
      "Kailashahar",
      "Belonia",
      "Kamalpur",
      "Ambassa",
      "Khowai",
      "Sabroom",
      "Sonamura",
      "Melaghar",
    ],
    "Uttar Pradesh": [
      "Shikohabad ",
      "Lucknow",
      "Matbarganj",
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
    Uttarakhand: [
      "Dehradun",
      "Haridwar",
      "Nainital",
      "Rishikesh",
      "Mussoorie",
      "Almora",
      "Pithoragarh",
      "Haldwani",
      "Rudrapur",
      "Bageshwar",
      "Champawat",
      "Uttarkashi",
      "Roorkee",
      "Tehri",
      "Lansdowne",
    ],
    "West Bengal": [
      "Kolkata",
      "Darjeeling",
      "Siliguri",
      "Howrah",
      "Asansol",
      "Durgapur",
      "Malda",
      "Cooch Behar",
      "Haldia",
      "Kharagpur",
      "Raiganj",
      "Bardhaman",
      "Jalpaiguri",
      "Chandannagar",
      "Kalimpong",
      "Alipurduar",
    ],
    "Andaman and Nicobar Islands": [
      "Port Blair",
      "Havelock Island",
      "Diglipur",
      "Neil Island",
      "Car Nicobar",
      "Little Andaman",
      "Long Island",
      "Mayabunder",
      "Campbell Bay",
      "Rangat",
      "Wandoor",
    ],
    Chandigarh: [
      "Sector 1",
      "Sector 2",
      "Sector 3",
      "Sector 4",
      "Sector 5",
      "Sector 6",
      "Sector 7",
      "Sector 8",
      "Sector 9",
      "Sector 10",
      "Sector 11",
      "Sector 12",
      "Sector 13", // Note: Sector 13 does not exist in Chandigarh.
      "Sector 14",
      "Sector 15",
      "Sector 16",
      "Sector 17",
      "Sector 18",
      "Sector 19",
      "Sector 20",
      "Sector 21",
      "Sector 22",
      "Sector 23",
      "Sector 24",
      "Sector 25",
      "Sector 26",
      "Sector 27",
      "Sector 28",
      "Sector 29",
      "Sector 30",
      "Sector 31",
      "Sector 32",
      "Sector 33",
      "Sector 34",
      "Sector 35",
      "Sector 36",
      "Sector 37",
      "Sector 38",
      "Sector 39",
      "Sector 40",
      "Sector 41",
      "Sector 42",
      "Sector 43",
      "Sector 44",
      "Sector 45",
      "Sector 46",
      "Sector 47",
    ],
    "Dadra and Nagar Haveli and Daman and Diu": [
      "Daman",
      "Diu",
      "Silvassa",
      "Amli",
      "Kachigam",
      "Naroli",
      "Vapi",
      "Marwad",
      "Samarvarni",
      "Kawant",
    ],
    Delhi: [
      "New Delhi",
      "Old Delhi",
      "Dwarka",
      "Rohini",
      "Karol Bagh",
      "Lajpat Nagar",
      "Saket",
      "Vasant Kunj",
      "Janakpuri",
      "Mayur Vihar",
      "Shahdara",
      "Preet Vihar",
      "Pitampura",
      "Chanakyapuri",
      "Narela",
      "Mehrauli",
      "Najafgarh",
      "Okhla",
      "Tilak Nagar",
    ],
    "Jammu and Kashmir": [
      "Srinagar",
      "Jammu",
      "Anantnag",
      "Baramulla",
      "Pulwama",
      "Kupwara",
      "Udhampur",
      "Kathua",
      "Poonch",
      "Kulgam",
      "Budgam",
      "Bandipora",
      "Ganderbal",
      "Rajouri",
      "Reasi",
      "Doda",
      "Miran sahib",
    ],
    Ladakh: [
      "Leh",
      "Kargil",
      "Diskit",
      "Padum",
      "Nubra",
      "Tangtse",
      "Sankoo",
      "Zanskar",
      "Nyoma",
      "Turtuk",
      "Hanle",
    ],
    Lakshadweep: [
      "Kavaratti",
      "Agatti",
      "Minicoy",
      "Amini",
      "Andrott",
      "Kalpeni",
      "Kadmat",
      "Chetlat",
      "Bitra",
      "Bangaram",
    ],
    Puducherry: [
      "Puducherry",
      "Karaikal",
      "Mahe",
      "Yanam",
      "Villianur",
      "Bahour",
      "Oulgaret",
      "Ariyankuppam",
      "Nettapakkam",
    ],
  };
  // End New

  // Fetch tickets on component mount
  useEffect(() => {
    fetchTickets();
  }, [ticketData.customerName, viewTickets]); // Fetch tickets again when the customer's name changes

  return (
    <Container fluid className="dashboard-container py-4 px-3">
      <h2 className="dashboard-title text-center mb-5">
        <span className="gradient-text">Your Service Dashboard</span>
        <small className="d-block mt-2 text-muted fs-6">
          Track & Manage Your Support Tickets
        </small>
      </h2>

      {error && (
        <Alert variant="danger" className="animate__animated animate__fadeIn">
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="animate__animated animate__fadeIn">
          {success}
        </Alert>
      )}

      <Card className="main-card border-0 mb-4">
        <Card.Body className="p-md-4 p-3">
          {!viewTickets ? (
            <>
              <div className="form-header mb-4">
                <h4 className="gradient-text text-center">
                  <i className="fas fa-ticket-alt me-2"></i>
                  Create Support Ticket
                </h4>
                <p className="text-muted text-center">
                  Fill in the details below to submit your support request
                </p>
              </div>

              <Form onSubmit={handleSubmit} className="ticket-form">
                <Row>
                  <Col md={6}>
                    <Form.Group className="form-group mb-4">
                      <Form.Label className="fw-bold">
                        <i className="fas fa-user me-2"></i>Customer Name
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="customerName"
                        value={ticketData.customerName}
                        onChange={handleChange}
                        className="form-control-modern"
                        disabled
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="form-group mb-4">
                      <Form.Label className="fw-bold">
                        <i className="fas fa-building me-2"></i>Organization
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="organization"
                        value={ticketData.organization}
                        onChange={handleChange}
                        className="form-control-modern"
                        placeholder="Enter organization name"
                      />
                    </Form.Group>
                  </Col>
                </Row>

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
                  />
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
                    type="text" // Changed to "text" to avoid spinner buttons
                    name="contactNumber"
                    value={ticketData.contactNumber}
                    onChange={(e) => {
                      const value = e.target.value;

                      // Allow only digits and restrict length to 10
                      if (/^\d*$/.test(value) && value.length <= 10) {
                        handleChange(e); // Update state only if valid
                      }
                    }}
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
                    <option value="Kiosk">Kiosk</option>
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
                    <option value="SKW">SKW</option>
                    <option value="RS">RS</option>
                    <option value="A3">A3</option>
                    <option value="DLS">DLS</option>
                    <option value="M22">M22</option>
                    <option value="RK">RK</option>
                    <option value="OKV">OKV</option>
                    <option value="PRO AT">PRO AT</option>
                    <option value="Q Series">Q Series</option>
                    <option value="RSP">RSP</option>
                    <option value="T9">T9</option>
                    <option value="T9H">T9H</option>
                    <option value="ESP">ESP</option>
                    <option value="CH BUNKA">BUNKA</option>
                    <option value="KONKA">KONKA</option>
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

                <div className="file-upload-container mb-4">
                  <Form.Group controlId="formFile">
                    <Form.Label className="fw-bold">
                      <i className="fas fa-file-invoice me-2"></i>Upload Bill
                    </Form.Label>
                    <div className="custom-file-upload">
                      <input
                        type="file"
                        name="billImage"
                        onChange={handleFileChange}
                        className="form-control"
                        id="file-upload"
                        accept=".jpg,.jpeg,.png,.pdf"
                      />
                      <label
                        htmlFor="file-upload"
                        className="file-upload-label"
                      >
                        <i className="fas fa-cloud-upload-alt me-2"></i>
                        {selectedFileName || "Choose File"}
                      </label>
                      {selectedFileName && (
                        <div className="file-info mt-2">
                          <div className="selected-file">
                            <i className="fas fa-file-alt me-2"></i>
                            {selectedFileName}
                            <button
                              type="button"
                              className="remove-file-btn"
                              onClick={() => {
                                setBillImage(null);
                                setSelectedFileName("");
                              }}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </Form.Group>
                </div>

                <button type="submit" className="submit-button w-100">
                  <span className="button-content">
                    <i className="fas fa-paper-plane me-2"></i>
                    Submit Ticket
                  </span>
                </button>
              </Form>
            </>
          ) : (
            <>
              <div className="tickets-header mb-4">
                <h4 className="gradient-text text-center">
                  <i className="fas fa-clipboard-list me-2"></i>
                  Your Support Tickets
                </h4>
                <p className="text-muted text-center">
                  Track and manage your existing support requests
                </p>
              </div>

              <Row className="g-4">
                {tickets.length > 0 ? (
                  tickets.map((ticket) => (
                    <Col lg={6} key={ticket._id}>
                      <Card className="ticket-card h-100 border-0 shadow-sm">
                        <Card.Header className="bg-transparent border-0 pt-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <Badge
                              className={`status-badge status-${ticket.status.toLowerCase()}`}
                            >
                              {ticket.status}
                            </Badge>
                            <small className="text-muted">
                              {new Date(ticket.createdAt).toLocaleDateString()}
                            </small>
                          </div>
                          <h5 className="mt-2 tracking-id">
                            #{ticket.trackingId}
                          </h5>
                        </Card.Header>

                        <Card.Body>
                          <div className="ticket-details">
                            <div className="detail-group">
                              <div className="detail-item">
                                <i className="fas fa-user me-2"></i>
                                <span className="detail-label">Customer:</span>
                                <span className="detail-value">
                                  {ticket.customerName}
                                </span>
                              </div>

                              <div className="detail-item">
                                <i className="fas fa-building me-2"></i>
                                <span className="detail-label">
                                  Organization:
                                </span>
                                <span className="detail-value">
                                  {ticket.organization || "N/A"}
                                </span>
                              </div>

                              <div className="detail-item">
                                <i className="fas fa-box me-2"></i>
                                <span className="detail-label">
                                  Product Type:
                                </span>
                                <span className="detail-value">
                                  {ticket.productType}
                                </span>
                              </div>

                              <div className="detail-item">
                                <i className="fas fa-cog me-2"></i>
                                <span className="detail-label">
                                  Model Type:
                                </span>
                                <span className="detail-value">
                                  {ticket.modelType}
                                </span>
                              </div>

                              <div className="detail-item">
                                <i className="fas fa-barcode me-2"></i>
                                <span className="detail-label">
                                  Serial Number:
                                </span>
                                <span className="detail-value">
                                  {ticket.serialNumber || "N/A"}
                                </span>
                              </div>

                              <div className="detail-item">
                                <i className="fas fa-phone me-2"></i>
                                <span className="detail-label">Contact:</span>
                                <span className="detail-value">
                                  {ticket.contactNumber}
                                </span>
                              </div>

                              <div className="detail-item">
                                <i className="fas fa-envelope me-2"></i>
                                <span className="detail-label">Email:</span>
                                <span className="detail-value">
                                  {ticket.email}
                                </span>
                              </div>

                              <div className="detail-item">
                                <i className="fas fa-map-marker-alt me-2"></i>
                                <span className="detail-label">Address:</span>
                                <span className="detail-value">
                                  {ticket.address}
                                </span>
                              </div>

                              <div className="detail-item">
                                <i className="fas fa-city me-2"></i>
                                <span className="detail-label">City:</span>
                                <span className="detail-value">
                                  {ticket.city}
                                </span>
                              </div>

                              <div className="detail-item">
                                <i className="fas fa-map me-2"></i>
                                <span className="detail-label">State:</span>
                                <span className="detail-value">
                                  {ticket.state}
                                </span>
                              </div>

                              <div className="detail-item description">
                                <i className="fas fa-comment-alt me-2"></i>
                                <span className="detail-label">
                                  Description:
                                </span>
                                <span className="detail-value">
                                  {ticket.description}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="ticket-actions mt-3">
                            <Button
                              variant="outline-primary"
                              className="history-button"
                              onClick={() => toggleHistory(ticket._id)}
                            >
                              <i className="fas fa-history me-2"></i>
                              {historyVisible[ticket._id]
                                ? "Hide History"
                                : "View History"}
                            </Button>
                          </div>

                          {/* Ticket History Section */}
                          <Collapse in={historyVisible[ticket._id]}>
                            <div className="history-section mt-3">
                              <ListGroup variant="flush">
                                {ticket.history?.map((item, index) => (
                                  <ListGroup.Item
                                    key={index}
                                    className="history-item"
                                  >
                                    <div className="history-status">
                                      <i className="fas fa-circle me-2"></i>
                                      {item.status}
                                    </div>
                                    <small
                                      className="text-muted"
                                      style={{ color: "black" }}
                                    >
                                      {new Date(item.date).toLocaleString()}
                                    </small>
                                  </ListGroup.Item>
                                ))}
                              </ListGroup>
                            </div>
                          </Collapse>

                          {/* Feedback Section */}
                          {ticket.status === "Closed" &&
                            !isFeedbackSubmitted[ticket._id] && (
                              <div className="feedback-section mt-4">
                                <h6 className="feedback-title">
                                  <i className="fas fa-star me-2"></i>
                                  Rate Your Experience
                                </h6>
                                <ReactStars
                                  count={5}
                                  value={feedbacks[ticket._id]?.rating || 0}
                                  onChange={(rating) =>
                                    handleFeedbackChange(ticket._id, rating)
                                  }
                                  size={24}
                                  activeColor="#ffd700"
                                />
                                <Form.Control
                                  as="textarea"
                                  placeholder="Share your experience..."
                                  className="feedback-textarea mt-2"
                                  value={feedbacks[ticket._id]?.comment || ""}
                                  onChange={(e) =>
                                    handleCommentChange(
                                      ticket._id,
                                      e.target.value
                                    )
                                  }
                                />
                                <Button
                                  className="submit-feedback-btn mt-2"
                                  onClick={() => submitFeedback(ticket._id)}
                                >
                                  <i className="fas fa-paper-plane me-2"></i>
                                  Submit Feedback
                                </Button>
                              </div>
                            )}
                        </Card.Body>
                      </Card>
                    </Col>
                  ))
                ) : (
                  <Col className="text-center py-5">
                    <div className="no-tickets">
                      <i className="fas fa-ticket-alt fa-3x mb-3"></i>
                      <p>No tickets available</p>
                    </div>
                  </Col>
                )}
              </Row>
            </>
          )}
        </Card.Body>
      </Card>

      <div className="text-center">
        <button
          className="toggle-view-button"
          onClick={() => setViewTickets(!viewTickets)}
        >
          <i className={`fas fa-${viewTickets ? "plus" : "list"} me-2`}></i>
          {viewTickets ? "Create New Ticket" : "View My Tickets"}
        </button>
      </div>
    </Container>
  );
};

export default ClientDashboard;
