import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Flashcard from './Flashcard';
import Navbar from './Navbar';

const ViewSingleDeck = () => {
    const [errorText, setErrorText] = useState('');
    const [collection, setCollection] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { collection_id } = useParams();
    const navigate = useNavigate();

    // Handle empty deck navigation
    useEffect(() => {
        if (!isLoading && errorText && (!collection || collection.length === 0)) {
            navigate(`/edit-deck/${collection_id}`);
        }
    }, [errorText, collection, isLoading, navigate, collection_id]);

    // Token validation
    useEffect(() => {
        const validateToken = () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate('/');
                return false;
            }

            try {
                const decodedToken = jwtDecode(token);
                if (decodedToken.exp * 1000 < Date.now()) {
                    localStorage.removeItem("token");
                    navigate('/');
                    return false;
                }
                return true;
            } catch (error) {
                console.error("Invalid token:", error);
                localStorage.removeItem("token");
                navigate('/');
                return false;
            }
        };

        const isValidToken = validateToken();
        if (!isValidToken) return;

        const fetchCards = async () => {
            setIsLoading(true);
            setErrorText('');

            const token = localStorage.getItem("token");
            
            try {
                const response = await fetch(
                    `http://localhost:8081/collectionCards?COLLECTION_ID=${encodeURIComponent(collection_id)}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (response.status === 403) {
                    console.log("Unauthorized access attempt detected");
                    navigate('/decks');
                    return;
                }

                if (response.status === 404) {
                    setErrorText("This deck is currently empty. Edit your deck to add cards!");
                    setCollection([]);
                    setIsLoading(false);
                    return;
                }

                if (!response.ok) {
                    console.error("Server error:", response.status);
                    navigate('/decks');
                    return;
                }

                const data = await response.json();

                if (!Array.isArray(data)) {
                    console.error("Invalid data format received");
                    navigate('/decks');
                    return;
                }

                setCollection(data);
                if (data.length === 0) {
                    setErrorText("This deck is currently empty. Edit your deck to add cards!");
                }

            } catch (error) {
                console.error("Error fetching collection:", error);
                navigate('/decks');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCards();
    }, [collection_id, navigate]);

    // Render loading state
    if (isLoading) {
        return (
            <div className="container">
                <Navbar />
                <div className="row min-vh-100 justify-content-center align-items-center">
                    <div className="col-10">
                        <div className="d-flex justify-content-center">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main render
    return (
        <div className="container">
            <Navbar />
            <div className="row min-vh-100 justify-content-center align-items-center">
                <div className="col-12 col-md-8">
                    {collection && collection.length > 0 && (
                        <Flashcard 
                            cards={collection} 
                            navigate={navigate} 
                            collection_id={collection_id}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewSingleDeck;