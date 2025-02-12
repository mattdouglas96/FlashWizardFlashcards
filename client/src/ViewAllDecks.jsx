import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Navbar from './Navbar';

const ViewAllDecks = () => {
    const [collections, setCollections] = useState([]);
    const navigate = useNavigate();  // Hook for navigation

    //On page load, fetch the user's decks
    useEffect(() => {
      const fetchCollections = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            navigate('/');  // Redirect if no token is found
            return;
          }

          const decodedToken = jwtDecode(token);
            if (decodedToken.exp * 1000 < Date.now()) {
              localStorage.removeItem("token");
              navigate('/');  // Redirect if token is expired
              return;
          }
          const userId = decodedToken.id;

          const response = await fetch(
            `http://localhost:8081/userCollections?USER_ID=${encodeURIComponent(userId)}`,
            {
              headers: {
                'Authorization': `Bearer ${token}` // Add token to request
              }
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          setCollections(data);
          
          if (data.length === 0) {
            navigate('/create-deck');  // Navigate to CreateNewDeck if no collections
          }
        } catch (error) {
          console.error("Error fetching collections:", error);
          if (error.name === 'InvalidTokenError') {
            localStorage.removeItem("token");
            navigate('/');  // Redirect if token is invalid
          }
        }
      };

      fetchCollections();
    }, [navigate]);  

  return (
    <div className="container">
      <Navbar />
        <div className="row min-vh-100 justify-content-center align-items-center">
          <div className="col-12 col-md-8">
            <h1 className="coiny-regular">My Flashcard Decks</h1>
                <div className="mt-2 d-flex flex-column">
                  {/*Either map through and display the collections with some name, description and card count info, OR redirect to create a first deck*/}
                {collections.length > 0 ? (
                  collections.map((collection) => (
                    <div 
                      key={collection.COLLECTION_ID} 
                      className="card my-2" 
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/decks/${collection.COLLECTION_ID}`)}
                    >
                      <div className="card-body">
                        <h5 className="card-title">{collection.COLLECTION_NAME}</h5>
                        <p className="card-text">"{collection.COLLECTION_DESCRIPTION}"</p>
                        <p className="card-text">{collection.flashcard_count} cards</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No collections found. Redirecting to create a new deck...</p>
                )}
                </div>
          </div>
        </div>
    </div>
  );
}

export default ViewAllDecks;

