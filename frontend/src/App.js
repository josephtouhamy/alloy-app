import React, { useState } from "react";

function App() {
  const [formData, setFormData] = useState({
    name_first: "",
    name_last: "",
    business_name: "", 
    email_address: "",
    phone_number: "",
    document_ssn: "",
    birth_date: "",
    address_line_1: "",
    address_city: "",
    address_state: "",
    address_postal_code: "",
    address_country_code: "US", // Default to US 
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    let { name, value } = e.target;
  
    // Ensure date is formatted as YYYY-MM-DD
    if (name === "birth_date") {
      const date = new Date(value);
      value = date.toISOString().split("T")[0]; // Converts to YYYY-MM-DD
    }

    // Ensure SSN is exactly 9 digits (no dashes)
    if (name === "document_ssn") {
      value = value.replace(/\D/g, "").slice(0, 9); // Remove non-digits, limit to 9
    }

    // Ensure State is two-letter format
    if (name === "address_state") {
      value = value.toUpperCase().slice(0, 2); // Convert to uppercase, limit to 2 letters
    }
  
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:5000/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) { 
        throw new Error("Network response was not ok"); 
      }
  
      const data = await response.json();
      console.log("Received data:", data);
      
      setResult(data.outcome);
  
      // For debugging
      console.log("Full Alloy response:", data.full_response);
    } catch (error) {
      console.error("Fetch error:", error);
      setResult("Error submitting form");
    }
  };

  const renderDecision = () => {
    if (!result) return null;
    switch(result) {
      case "Approved":
        return <h2>Success! Your account has been created.</h2>;
      case "Denied":
        return <h2>Sorry, your application was not successful.</h2>;
      case "Manual Review":
        return <h2>Thanks for submitting your application, we'll be in touch shortly.</h2>;
      default:
        return <h2>Decision: {result}</h2>;
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Alloy API Client</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name_first" placeholder="First Name" onChange={handleChange} required /><br />
        <input type="text" name="name_last" placeholder="Last Name" onChange={handleChange} required /><br />
        <input type="text" name="business_name" placeholder="Business Name (Optional)" onChange={handleChange} /><br />
        <input type="email" name="email_address" placeholder="Email" onChange={handleChange} required /><br />
        
        <input type="text" name="phone_number" 
          placeholder="Phone Number" 
          pattern="\d{10}" 
          title="Enter a valid 10-digit phone number" 
          onChange={handleChange} required /><br />

        <input type="text" name="document_ssn" 
          placeholder="SSN (9 digits)" 
          pattern="\d{9}" 
          title="Enter a 9-digit SSN (no dashes)" 
          onChange={handleChange} required /><br />

        <input type="date" name="birth_date" 
          placeholder="Birth Date (YYYY-MM-DD)" 
          onChange={handleChange} required /><br />

        <input type="text" name="address_line_1" placeholder="Address Line 1" onChange={handleChange} required /><br />
        <input type="text" name="address_city" placeholder="City" onChange={handleChange} required /><br />

        <input type="text" name="address_state" 
          placeholder="State (NY, CA, etc.)" 
          pattern="[A-Z]{2}" 
          title="Enter a valid 2-letter state code (e.g., NY, CA)" 
          onChange={handleChange} required /><br />

        <input type="text" name="address_postal_code" 
          placeholder="Postal Code (5 digits)" 
          pattern="\d{5}" 
          title="Enter a valid 5-digit postal code" 
          onChange={handleChange} required /><br />

        <label>Country Code:{'  '}</label>
        <select name="address_country_code" onChange={handleChange} value={formData.address_country_code} required>
          <option value="US">United States (US)</option>
        </select>
        <br />

        <button type="submit">Submit</button>
      </form>

      {renderDecision()}
    </div>
  );
}

export default App;
