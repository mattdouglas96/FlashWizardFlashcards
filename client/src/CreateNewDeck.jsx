import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";


const CreateNewDeck = ({user}) => {
    const [errorText, setErrorText] = useState('');
    const navigate = useNavigate();
    const [userId, setUserId] = useState(null);

    //check that token is valid. Navigate user to home if token has expired or is invalid
    useEffect(() => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate('/');
                return;
            }
    
            try {
                jwtDecode(token);
                const decodedToken = jwtDecode(token);
                            if (decodedToken.exp * 1000 < Date.now()) {
                              localStorage.removeItem("token");
                              navigate('/');
                              return;
                          }
            
            setUserId(decodedToken.id);
            } catch (error) {
                console.error("Invalid token:", error);
                localStorage.removeItem("token");
                navigate('/');
            }
        }, [navigate]);
        
        // Clear the token on logout
        const handleLogout = () => {
            localStorage.removeItem("token"); 
            navigate('/');
        };
    
    //state hook to store the data entered in the form
    const [formData, setFormData] = useState({
            name: '',
            description: ''
        });

    //any updates to the form fields are reflected in the formData state hook
    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData((prevState) => ({...prevState, [name]:value}));
    };

    //check to see if the collection already exists. Don't allow user to create more than one collection with the same name.
    const checkCollectionExists = async (user_id, collection_name) => {
        try {
            const token = localStorage.getItem("token");
            if (!user_id || !collection_name) {
                console.error("Missing user_id or collection_name");
                return { exists: false, collection_id: null };
            }
    
            const response = await fetch(
                `http://localhost:8081/collections/${encodeURIComponent(user_id)}/${encodeURIComponent(collection_name)}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    }
                }
            );
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
            
            // Check the exists flag from updated API response
            return{
            exists: data.exists,
            collection_id: data.collection_id
            };

        } catch (error) {
            console.error("Error checking for collection name:", error);
            setErrorText("Failed to check if collection exists. Please try again.");
            return { exists: false, collection_id: null };
        }
    };
    
    //submit the new deck, having confirmed that the collection name doesn't already exist
    const newDeckSubmit = async (e) => {
        const token = localStorage.getItem("token");
        e.preventDefault();
        setErrorText('');

        //ensure token is still valid, otherwise log the user out and navigate to homepage
        const decodedToken = jwtDecode(token);
        if (decodedToken.exp * 1000 < Date.now()) {
            localStorage.removeItem("token");
            navigate('/');
            return;
        }

        //make sure user has set both a name and description
        if(!formData.name.trim() || !formData.description.trim()){
            setErrorText("Please include both a name and a description for your deck");
            return;
        }

        try {
            const collectionExists = await checkCollectionExists(userId, formData.name);
            
            //prevent duplicate deck names
            if (collectionExists.exists) {
                setErrorText("A deck with this name already exists. Please choose a different name.");
                return;
            }
    
            const response = await fetch('http://localhost:8081/newCollection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    //USER_ID: user.id,
                    USER_ID: userId,
                    COLLECTION_NAME: formData.name.trim(),
                    COLLECTION_DESCRIPTION: formData.description.trim()
                })
            });

            if (response.ok) {

                setErrorText("Collection created successfully!");

                    // get the id of the collection that was just created, so we can redirect to new collection for them to start adding cards
                    try {
                        const newCollection = await checkCollectionExists(userId, formData.name);
                        if (newCollection.collection_id) {
                            navigate(`/edit-deck/${newCollection.collection_id}`);
                        } else {
                            setErrorText("Collection created but could not retrieve collection ID.");
                        }
                    } catch (error) {
                        console.error("Error retrieving new collection ID:", error);
                        setErrorText("Collection created, but an error occurred while retrieving its ID.");
                    }
                

            } else {
                setErrorText('Failed to create Collection');
            }
            
        } catch (error) {
            console.error("Error during deck creation:", error);
            setErrorText("An error occurred while creating the deck. Please try again.");
        }
    };



  return (
    
    <div className="container">
        <div className="row min-vh-100 justify-content-center align-items-center">
            <div className="col-8" >

                <h1 className="coiny-regular">Create a New Deck</h1>
                <button type="submit" className="btn btn-primary mx-2 mb-1" onClick={() => navigate('/home')}><i className="bi bi-house-heart-fill"></i></button>
                <button type="submit" className="btn btn-danger mx-2 mb-1" onClick={handleLogout}><i className="bi bi-box-arrow-left"></i></button>
                
                    <form className="newDeck-form" onSubmit={newDeckSubmit}>
                        <div className="mb-3">
                        <label htmlFor="deckNameField" className="form-label"><b>Enter a name for your deck</b></label>
                        <input type="text" className="form-control" name="name" onChange={handleInputChange} value={formData.name} id="nameField"/>
                        </div>
                        <div className="mb-3">
                        <label htmlFor="deckDescriptionField" className="form-label"><b>Enter a short description for your deck</b></label>
                        <input type="text" className="form-control" name="description" onChange={handleInputChange} value={formData.description} id="descriptionField"/>
                        </div>
                        {errorText && <div id="errorMsg" className="text-info mb-1">{errorText}</div>}
                        <button type="submit" className="btn btn-success mt-1" /* onClick={() => handleFormType('login') } */ >Create</button>
                    </form>
                

            </div>
        </div>
    </div>
  );
}

export default CreateNewDeck;