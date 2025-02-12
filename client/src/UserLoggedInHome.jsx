import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import wizardImage from './FlashWizardLogo1.png';
import Navbar from './Navbar';


const UserLoggedInHome = () => {
    const [errorText, setErrorText] = useState('');
    const navigate = useNavigate();  // Hook for navigation

      useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate('/');
            return;
        }

        try {
            const decodedToken = jwtDecode(token);
            if (decodedToken.exp * 1000 < Date.now()) {
              localStorage.removeItem("token");
              navigate('/');
              return;
          }
            
        } catch (error) {
            console.error("Invalid token:", error);
            localStorage.removeItem("token");
            navigate('/');
        }
    }, [navigate]);

    const handleLogout = () => {
      localStorage.removeItem("token"); // Clear the token
      navigate('/');
    };
    
  return (
    
    <div className="container">
      <Navbar />

      <div className="row min-vh-100 justify-content-center align-items-center">
          <div className="col-6">
              <img src={wizardImage} alt="Hippo Logo" />
              <h1 className="coiny-regular">Welcome</h1>
              <button type="submit" className="btn btn-pastel-cyan mx-2 my-1" onClick={() => navigate('/decks')}><b>My Flashcard Decks</b></button>
              <button type="submit" className="btn btn-pastel-cyan mx-2 my-1" onClick={() => navigate('/create-deck')}><b>Create New Flashcard Deck</b></button>
        </div>
      </div>
    </div>
  );
}

export default UserLoggedInHome;
