import React, { useState } from "react";
import "../App.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle input changes
  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prevForm) => ({ ...prevForm, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email || !formData.password) {
      toast.error("Please fill in both fields.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/auth/login",
        formData
      );

      if (response.status === 200) {
        const { token, user } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Show success toast
        toast.success("Login successful! Redirecting...", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });

        // Redirect based on user role
        switch (user.role) {
          case "admin":
            navigate("/admin");
            break;
          case "client":
            navigate("/client");
            break;
          case "opsManager":
            navigate("/ops-manager");
            break;
          case "serviceAgent":
            navigate(`/service-agent/${user.username}`);
            break;
          default:
            navigate("/");
            break;
        }
      } else {
        toast.error("Unexpected response status: " + response.status, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
      }
    } catch (error) {
      console.error("Error while logging in:", error);
      toast.error("Login failed. Please check your credentials.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div className="form-box">
        <form className="form" onSubmit={handleSubmit}>
          <h2 className="title">Login</h2>
          <p className="subtitle">Access your account.</p>

          <div className="form-container">
            <input
              autoComplete="off"
              className="input"
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInput}
              required
              aria-label="Email Address"
            />
            <input
              className="input"
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInput}
              required
              aria-label="Password"
            />
          </div>

          <button
            type="submit"
            className="button1"
            disabled={loading}
            aria-label="Login"
            style={{ background: "linear-gradient(90deg, #6a11cb, #2575fc)" }}
          >
            {loading ? <Spinner animation="border" size="sm" /> : "Login"}
          </button>
        </form>

        <div className="form-section">
          <p>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
