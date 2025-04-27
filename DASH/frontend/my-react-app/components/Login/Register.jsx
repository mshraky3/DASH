import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom"; // Import useNavigate
import "./Login.css";

const Register = () => {
    const location = useLocation(); // Get the location object
    const navigate = useNavigate(); // Initialize navigate for redirection
    const [message, setMessage] = useState(null); // State to hold temporary messages
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        password: "",
        confirm_password: "",
        location: "",
        phone_number: "",
        email: "",
        website_url: "",
        description: "",
        account_type: "company",
        logo_image: null,
    });
    const [error, setError] = useState(""); 

    useEffect(() => {

        if (location.state?.message) {
            setMessage(location.state.message); 
            const timer = setTimeout(() => {
                setMessage(null); // Clear the message after 2 seconds
            }, 2000);

            return () => clearTimeout(timer); 
        }
    }, [location]);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;

        // Handle file input separately
        if (type === "file") {
            setFormData((prevData) => ({
                ...prevData,
                [name]: files[0], // Store the file object
            }));
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value, // Update other fields
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name);
        formDataToSend.append("username", formData.username);
        formDataToSend.append("password", formData.password);
        formDataToSend.append("location", formData.location);
        formDataToSend.append("phone_number", formData.phone_number);
        formDataToSend.append("email", formData.email);
        formDataToSend.append("website_url", formData.website_url);
        formDataToSend.append("description", formData.description);
        formDataToSend.append("account_type", formData.account_type);
        formDataToSend.append("logo_image", formData.logo_image); // File field
    
        try {
            const response = await axios.post("http://localhost:3000/api/register", formDataToSend);
    
            if (response.status === 200) {
                navigate("/login", { state: { message: response.data.message } });
            }
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.mseeg) {
                setError(err.response.data.mseeg); 
            } else {
                setError("An error occurred during registration.");
            }
        }
    };
    return (
        <div className="register-container">
            <h2>Register</h2>
            {message && (
                <div className="message">
                    <p>{message}</p>
                </div>
            )}
            {error && (
                <div className="error-message">
                    <p>{error}</p>
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Account Name</label>
                    <input
                        type="text"
                        className="form-control"
                        name="name"
                        placeholder="Enter name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="username">Username/Email</label>
                    <input
                        type="text"
                        className="form-control"
                        name="username"
                        placeholder="Enter username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        name="password"
                        id="password"
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="confirm_password">Confirm Password</label>
                    <input
                        type="password"
                        className="form-control"
                        name="confirm_password"
                        id="confirm_password"
                        placeholder="Confirm password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="logo_image">Account Logo</label>
                    <input
                        type="file"
                        className="form-control-file"
                        name="logo_image"
                        accept=".jpg,.jpeg,.png,.gif"
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="location">Company Location</label>
                    <input
                        type="text"
                        className="form-control"
                        name="location"
                        placeholder="The company location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="phone_number">Hotline Number to Communicate with Customers</label>
                    <input
                        type="text"
                        className="form-control"
                        name="phone_number"
                        placeholder="Enter phone number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email to Communicate with Customers</label>
                    <input
                        type="email"
                        className="form-control"
                        name="email"
                        placeholder="Enter email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="website_url">Website URL</label>
                    <input
                        type="url"
                        className="form-control"
                        name="website_url"
                        placeholder="Enter website URL"
                        value={formData.website_url}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Company / Account Description</label>
                    <textarea
                        className="form-control"
                        name="description"
                        rows="3"
                        placeholder="Enter description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    ></textarea>
                </div>
                <div className="form-group">
                    <label htmlFor="account_type">Account Type</label>
                    <select
                        className="form-control"
                        name="account_type"
                        value={formData.account_type}
                        onChange={handleChange}
                        required
                    >
                        <option value="company">Company</option>
                        <option value="user">User</option>
                    </select>
                </div>
                <button type="submit" className="btn btn-primary">
                    Register
                </button>
            </form>
        </div>
    );
};

export default Register;