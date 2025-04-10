import React, { useEffect, useState } from "react";
import { getFingerprint } from "./utils/fingerprint";
import { errorToast, successToast } from './Toaster';
import "./App.css";
import PDFViewer from "./PDFViewer";


const App = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [company, setCompany] = useState("");
  const [designation, setDesignation] = useState("");
  const [error, setError] = useState("");
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fingerprint = localStorage.getItem("fingerprint");
    if (fingerprint) {
      setAlreadySubmitted(true);
    }else {
      setAlreadySubmitted(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && ['s', 'p'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    });
  },[])


  // Regex to match company emails (must have a domain name with at least one dot)
  const companyEmailRegex = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

  // List of blocked public domains
  const blockedDomains = [
    "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", 
    "orkut.com", "aol.com", "icloud.com", "zoho.com", 
    "protonmail.com", "gmx.com", "yandex.com"
  ];

  const handleEmailChange = (e) => {
    const inputEmail = e.target.value;
    setEmail(inputEmail);

    // Extract domain from email
    const domain = inputEmail.split("@")[1];

    // Check if the domain is blocked or does not match the regex
    if (!companyEmailRegex.test(inputEmail) || (domain && blockedDomains.includes(domain))) {
      setError("Please enter a valid company email.");
    } else {
      setError(""); // Clear error if valid
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (error) {
      alert("Fix the error before submitting.");
      return;
    }
      
    const fingerprint = await getFingerprint();
    localStorage.setItem("fingerprint", fingerprint);    
    

    const data = {
      name,
      email,
      location,
      company,
      designation,
    };

    fetch('https://domo-snowflake-event.onrender.com/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(() => {
      setLoading(false);
      setAlreadySubmitted(true);
      successToast("Registration submitted successfully.");
      setName("");
      setEmail("");
      setLocation("");
      setCompany("");
      setDesignation("");
    })
    .catch((error) => {
      setLoading(false);
      errorToast("Registration failed. Please try again.");
      console.error('Error:', error);
    })
  };

  const handleLogout = () => {
    localStorage.removeItem("fingerprint");
    setAlreadySubmitted(false);
  }

  // const pdfFile = '/assets/book/gwc_book.pdf';
  return (
    <>
    {
      alreadySubmitted ? (
        <div className="container-wrapper" style={{ backgroundImage: `url('/assets/bg-registration-form-2.jpg')` }}>
          <div className="px-4">
            <div className="flex items-center justify-between py-4">
              <img
                src="/assets/gwc.svg"
                alt="Company Logo"
                className=""
                style={{ maxWidth: "150px" }}
              />
              <button onClick={handleLogout} type="button" className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2">Logout</button>
            </div>
            <div>
              <PDFViewer />
            </div>
          </div>
        </div>
      ) : (
        <div className="container-wrapper" style={{ backgroundImage: `url('/assets/bg-registration-form-2.jpg')` }}>
          <div className="max-w-screen-sm mx-auto px-4 pt-10">
            <div className="flex items-center justify-center">
              <img
                src="/assets/gwc.svg"
                alt="Company Logo"
                className=""
                style={{ maxWidth: "150px" }}
              />
            </div>
                <form onSubmit={handleSubmit} className="mb-5">
                  <h3 className="text-center text-xl font-medium uppercase my-5">Registration Form</h3>
                  
                  <div className="mb-5">
                    <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-900">Full Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      id="name"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                    
                  <div className="mb-5">
                    <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-900">Company Email <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      id="email"
                      placeholder="Enter your company email"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      required
                    />
                    {error && <p style={{ color: "red", fontSize: "12px" }}>{error}</p>}
                  </div>

                  <div className="mb-5">
                    <label htmlFor="company" className="block mb-1 text-sm font-medium text-gray-900">Company <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      id="company"
                      placeholder="Enter your company name"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      required
                    />
                  </div>

                  <div className="mb-5">
                    <label htmlFor="Designation" className="block mb-1 text-sm font-medium text-gray-900">Designation <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      id="designation"
                      placeholder="Enter your role"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      required
                    />
                  </div>

                  <div className="mb-5">
                    <label htmlFor="location" className="block mb-1 text-sm font-medium text-gray-900">Location <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      id="location"
                      placeholder="Enter your Location"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      required
                    />
                  </div>
                  {
                    loading ? (
                      <button type="button" className="register-button" disabled>Loading...</button>
                    ) : (
                      <button type="submit" className="register-button">Register Now</button>
                    )
                  }
                </form>
          </div> 
        </div>
      )
    }
      
    </>
  );
};

export default App;
