import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Navbar from './Navbar';

const EditDeck = () => {
    const [errorText, setErrorText] = useState('');
    const [collection, setCollection] = useState([]);
    const [frontContent, setFrontContent] = useState('');
    const [backContent, setBackContent] = useState('');
    const [newFrontContent, setNewFrontContent] = useState('');
    const [newBackContent, setNewBackContent] = useState('');
    const { collection_id } = useParams();
    const navigate = useNavigate();
    const [refresh, setRefresh] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [isEditingFront, setIsEditingFront] = useState(false);
    const [isEditingBack, setIsEditingBack] = useState(false);
    const [collectionName, setCollectionName] = useState('');

    useEffect(() => {
        //validate token when the component loads!
        const token = localStorage.getItem("token");
        if (!token) {
            navigate('/');
            return;
        }

        try {
            jwtDecode(token); // Just ensuring it's a valid JWT
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
        
        //get the name of the collection that is to be displayed. Use the collection id to access it. 
        const fetchName = async () => {
            try {
                const response = await fetch(`http://localhost:8081/collectionName?COLLECTION_ID=${encodeURIComponent(collection_id)}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    }
                });
        
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
        
                const data = await response.json();
                // The response will be an array with one object containing collection_name
                if (data && data.length > 0) {
                    setCollectionName(data[0].collection_name);
                } else {
                    setCollectionName("Untitled Collection");
                }
            } catch (error) {
                console.error("Error fetching collection name:", error);
                setErrorText("Failed to fetch collection name. Please try again.");
            }
        };


        //Fetch the cards so they can be displayed to the user.
        const fetchCards = async () => {
            try {
                const response = await fetch(`http://localhost:8081/collectionCards?COLLECTION_ID=${encodeURIComponent(collection_id)}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    }
                });

                if (!response.ok) {
                    
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setCollection(data);
            } catch (error) {
                console.error("Error fetching collection:", error);
                setErrorText("Failed to fetch collection. Please try again.");
            }
        };

        fetchName();
        fetchCards();
    }, [collection_id, refresh, navigate]);

    //Allow user to add new cards to their collection 
    const addToCollection = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        if (!token) {
            setErrorText('User is not authenticated.');
            return;
        }

        //ensure the token is still valid!
        const decodedToken = jwtDecode(token);
            if (decodedToken.exp * 1000 < Date.now()) {
                localStorage.removeItem("token");
                navigate('/');
                return;
            }

        try {
            const response = await fetch('http://localhost:8081/newFlashcard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Include the token in the Authorization header
                },
                body: JSON.stringify({
                    COLLECTION_ID: collection_id,
                    FRONT_CONTENT: frontContent,
                    BACK_CONTENT: backContent
                })
            });

            if (response.ok) {
                
                setErrorText("Flashcard added to your deck!");
                setFrontContent('');
                setBackContent('');
                setRefresh(!refresh);
            } else {
                setErrorText('Failed to add flashcard.');
            }
        } catch (error) {
            console.error('Error:', error);
            setErrorText('Error creating flashcard');
        }
    };

    //allow the user to delete individual flashcards
    const deleteFlashcard = async (flashcard_id) => {
        const token = localStorage.getItem("token");

        if (!token) {
            setErrorText('User is not authenticated.');
            return;
        }

        const decodedToken = jwtDecode(token);
            if (decodedToken.exp * 1000 < Date.now()) {
                localStorage.removeItem("token");
                navigate('/');
                return;
            }

        try {
            const response = await fetch(`http://localhost:8081/deleteFlashcard/${flashcard_id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                
                setRefresh(prev => !prev); // Refresh collection after deletion
            } else {
                console.error('Failed to delete flashcard');
            }
        } catch (error) {
            console.error('Error deleting flashcard:', error);
        }
    };

    return (
        <div className="container">
            <Navbar />
            <div className="row justify-content-center align-items-center">
                <div className="col-12">
                    {/* Display the name of the current collection being edited*/}
                    <h1 className="coiny-regular mt-4">{collectionName || "Loading..."}</h1>
                    <form>
                        <div className="row">
                            <div className="col-6">
                                <div className="mb-3">
                                    <label htmlFor="frontContentInput" className="form-label"><b>Term</b></label>
                                    {/*Set the desired front content */}
                                    <input type="text" className="form-control" id="frontContent" value={frontContent} onChange={(e) => setFrontContent(e.target.value)} />
                                </div>
                            </div>

                            <div className="col-6">
                                <div className="mb-3">
                                    <label htmlFor="backContentInput" className="form-label"><b>Definition</b></label>
                                    {/*Set the desired back content */}
                                    <input type="text" className="form-control" id="backContent" value={backContent} onChange={(e) => setBackContent(e.target.value)} />
                                </div>
                            </div>

                            <div className="mb-3 my-auto">
                                {/*If front or back content fields are blank, submit button is disabled */}
                                <button type="submit" disabled={!frontContent || !backContent} className="btn btn-pastel-cyan mx-2 mb-2" onClick={(e) => addToCollection(e)}>Add Flashcard</button>
                                {/* If the collection is not empty, enable button to navigate to the collection to allow the user to start studying */}
                                <button type="submit" disabled={!collection.length > 0} className="btn btn-success mx-2 mb-2" onClick={() => navigate(`/decks/${collection_id}`)}>Start Studying</button>
                            </div>
                        </div>
                    </form>

                </div>
            </div>
            <h3 className="coiny-regular mt-4">Edit Deck</h3>
        <div className="row">
            
                {/*Use .map() function to iterate through the collection, displaying front and back content and delete button for each card */}
                {collection.map((card) => (
                <React.Fragment key={card.FLASHCARD_ID}>
                        
                <div className="col-lg-5 col-sm-4 border p-2 my-2" style={{ cursor: "pointer" }} type="submit" 
                
                onClick={() => {
                {/*Allow user to edit front and back content by clicking on the fields */}
                setEditingCard(card.FLASHCARD_ID);
                setNewFrontContent('');
                setIsEditingFront(true);
                setIsEditingBack(false);}}>
                {/*Allow user to edit one side of one card at a time by conditionally rendering input field on click*/}
                {editingCard === card.FLASHCARD_ID && isEditingFront ? (
                <input
                  type="text"
                  className="form-control w-100"
                  value={newFrontContent}
                  onChange={(e) => setNewFrontContent(e.target.value)}
                  onBlur={async () => {
                    const token = localStorage.getItem("token");
                    const decodedToken = jwtDecode(token);
                        if (decodedToken.exp * 1000 < Date.now()) {
                            localStorage.removeItem("token");
                            navigate('/');
                            return;
                        }
                    if ((newFrontContent !== card.FRONT_CONTENT) && newFrontContent) {
                        {/*If the new front content is different from the old front content, try updating it in the database */}
                      try {
                        const response = await fetch('http://localhost:8081/updateFlashcardFront', {
                          method: 'PATCH',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                          body: JSON.stringify({
                            FLASHCARD_ID: card.FLASHCARD_ID,
                            FRONT_CONTENT: newFrontContent,
                          })
                        });
                  
                        if (response.ok) {
                          

                          setRefresh(prev => !prev);
                          // Reset editing states
                          setEditingCard(null);
                          setIsEditingFront(false);
                        } else {
                          console.error('Failed to update flashcard');
                        }
                      } catch (error) {
                        console.error('Error updating flashcard:', error);
                      }
                    }
                    setIsEditingFront(false); // Exit editing mode
                  }}
                />
                ) : ( <b>{card.FRONT_CONTENT}</b> )}
                </div>

                {/*Same editing logic and UI applies for the back sides of the flashcards */}
                <div className="col-lg-5 col-sm-4 border p-2 my-2" style={{ cursor: "pointer" }} type="submit" 
                onClick={() => {
                  setEditingCard(card.FLASHCARD_ID);
                  setNewBackContent('');
                  setIsEditingBack(true);
                  setIsEditingFront(false);}}>
                  {editingCard === card.FLASHCARD_ID && isEditingBack ? (
                  <input
                    type="text"
                    className="form-control w-100"
                    value={newBackContent}
                    onChange={(e) => setNewBackContent(e.target.value)}
                    onBlur={async () => {
                      const token = localStorage.getItem("token");
                      const decodedToken = jwtDecode(token);
                        if (decodedToken.exp * 1000 < Date.now()) {
                            localStorage.removeItem("token");
                            navigate('/');
                            return;
                        }
                      if ((newBackContent !== card.BACK_CONTENT) && newBackContent) {
                        try {
                          const response = await fetch('http://localhost:8081/updateFlashcardBack', {
                            method: 'PATCH',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                          },
                            body: JSON.stringify({
                              FLASHCARD_ID: card.FLASHCARD_ID,
                              BACK_CONTENT: newBackContent,
                            })
                          });
                    
                          if (response.ok) {
                            
                            setRefresh(prev => !prev);
                            // Reset editing states
                            setEditingCard(null);
                            setIsEditingBack(false);
                          } else {
                            console.error('Failed to update flashcard');
                          }
                        } catch (error) {
                          console.error('Error updating flashcard:', error);
                        }
                      }
                      setIsEditingBack(false); // Exit editing mode
                    }}
                />
                ) : ( <b>{card.BACK_CONTENT}</b> )}
                </div>


                {/* Delete flashcard on click */}
                <div className="col-lg-1 btn btn-danger my-2" type="submit" onClick={() => {deleteFlashcard(card.FLASHCARD_ID)}}><i className="bi bi-trash3-fill"></i></div>
                </React.Fragment>
                ))}   
             
        </div> 
        </div>
    );
}

export default EditDeck;
