import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { getUsers, getUser, addUser, getUserByEmail, getCollectionName, addNewCollection, getUserCollections, getAllFlashcardsInACollection, addFlashcardToCollection, updateFlashcardFront, updateFlashcardBack, deleteFlashcard, verifyCollectionAccess, verifyFlashcardAccess, getCollectionByID } from "./database.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const JWT_SECRET = process.env.JWT_SECRET || "secret-key";  

const corsOptions = {
    origin: process.env.FRONTEND_URL
}

app.use(cors(corsOptions));

//Token authentication
const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1]; // Extract Bearer token
    if (!token) return res.status(401).json({ message: "Access Denied" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid Token" });

        // Check token expiry
        const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
        if (user.exp && user.exp < currentTime) {
            return res.status(401).json({ message: "Token Expired" });
        }

        req.user = user;
        next();
    });
};

//Ensure the user trying to access or edit a collection is the owner
const verifyCollectionOwnership = async (req, res, next) => {
    try {
        const userId = req.user.id; // From JWT token
        const collectionId = req.params.COLLECTION_ID || req.query.COLLECTION_ID || req.body.COLLECTION_ID;
        
        if (!collectionId) {
            return res.status(400).json({ message: "Collection ID is required" });
        }

        const hasAccess = await verifyCollectionAccess(userId, collectionId);
        if (!hasAccess) {
            return res.status(403).json({ message: "Access denied to this collection" });
        }
        next();
    } catch (error) {
        console.error("Error verifying collection access:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

//Ensure the user trying to access or edit a flashcard is the owner
const verifyFlashcardOwnership = async (req, res, next) => {
    try {
        const userId = req.user.id; // From JWT token
        const flashcardId = req.params.FLASHCARD_ID || req.body.FLASHCARD_ID;
        
        if (!flashcardId) {
            return res.status(400).json({ message: "Flashcard ID is required" });
        }

        const hasAccess = await verifyFlashcardAccess(userId, flashcardId);
        if (!hasAccess) {
            return res.status(403).json({ message: "Access denied to this flashcard" });
        }
        next();
    } catch (error) {
        console.error("Error verifying flashcard access:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


app.get("/protected", authenticateToken, (req, res) => {
    res.json({ message: "You have access to protected data!", user: req.user });
});

//get all users
app.get("/users", async (req, res) => {
    const users = await getUsers();
    res.send(users);
})

//get user by their email address (see if that email address is already being used by a user)
app.get("/users/:email", async (req, res) => {
    const email = req.params.email;
    const user = await getUserByEmail(email);
    res.send(user);
});

//get user by their id
app.get("/users/:id", async (req, res) => {
    const id = req.params.id;
    const user = await getUser(id);
    res.send(user);
})

//Get a collection using the user_id and collection_name (other users might have the same collection name in their private collections)
app.get("/collections/:id/:name", authenticateToken, async (req, res) => {
    try {
        const userId = req.params.id;
        const collectionName = req.params.name;

        // Query the database to check for an existing collection
        const collections = await getCollectionName(userId, collectionName);

        //check if the collection exists
        const collectionExists = collections.length > 0;

        // Extract the collection ID if it exists
        const collectionId = collectionExists ? collections[0].COLLECTION_ID : null;

        // Return a clear response object indicating if collection exists
        res.json({
            exists: collectionExists,
            collection_id: collectionId,
            collections: collections
        });
    } catch (error) {
        console.error("Error checking collection:", error);
        res.status(500).json({ 
            error: "Failed to check collection name",
            details: error.message 
        });
    }
});

//Add a new user to the database, hashing the password.
app.post("/users", async (req, res) => {
    try {
        const { EMAIL, PASSWORD, PREMIUM_MEMBER } = req.body;

        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(PASSWORD, 10);
        } catch (error) {
            console.error("Error hashing password:", error);
            return res.status(500).json({ message: "Failed to hash password" });
        }

        //make sure the user name is not already in use
        const userExists = await getUserByEmail(EMAIL);
        if (userExists && userExists.length > 0) {
            return res.status(409).json({ message: 'Email already in use' });
        }

        const user = await addUser(EMAIL, hashedPassword, PREMIUM_MEMBER || 'N');
        res.status(201).send(user);
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ message: 'Failed to create user' });
    }
});

//create a new collection as an authenticated user
app.post("/newCollection", authenticateToken, async (req, res) => {
    try{
        console.log("Received request to /newCollection");
        const { USER_ID, COLLECTION_NAME, COLLECTION_DESCRIPTION } = req.body; 

        if (!USER_ID || !COLLECTION_NAME || !COLLECTION_DESCRIPTION) {
            return res.status(400).json({ message: "Missing required fields" }); 
        }

        const newCollection = await addNewCollection(USER_ID, COLLECTION_NAME, COLLECTION_DESCRIPTION);
        res.status(201).send(newCollection);
    }catch(error){
        console.log('Error adding new collection: ', error);
        res.status(500).json({message: 'Failed to create collection'});
    }
});

//get a user's flashcard collections
app.get("/userCollections", authenticateToken, async (req, res) => {
    try{
        console.log("Received request to /userCollections");
        const {USER_ID} = req.query;
        if(!USER_ID){
            return res.status(400).json({ message: "Missing a USER_ID to search by" }); 
        }

        const getCollections = await getUserCollections(USER_ID);

        if (getCollections.length === 0) {
            //return res.status(404).json({ message: "No collections found for this user" });
            return res.status(200).json([]);  // Return empty array with 200 OK status
        }

        //res.status(201).send(getCollections);
        res.status(200).json(getCollections);  // Use 200 status code for successful retrieval
    }catch(error){
        console.log('Error getting the collections: ', error);
        res.status(500).json({message: 'Failed to get the collections for the user'})
    }
});

//used to get all cards in a collection
app.get("/collectionCards", authenticateToken, verifyCollectionOwnership, async (req, res) => {
    try {
        const { COLLECTION_ID } = req.query;
        const getFlashcards = await getAllFlashcardsInACollection(COLLECTION_ID);

        // ✅ Return empty array instead of 404
        if (getFlashcards.length === 0) {
            return res.status(200).json([]); 
        }

        res.status(200).json(getFlashcards);
    } catch (error) {
        console.error('Error getting the flashcards: ', error);
        res.status(500).json({ message: 'Failed to get the flashcards for this collection' });
    }
});

//Get a collection name by using its ID 
app.get("/collectionName", authenticateToken, verifyCollectionOwnership, async (req, res) => {
    try {
        const { COLLECTION_ID } = req.query;
        const getFlashcards = await getCollectionByID(COLLECTION_ID);

        
        if (getFlashcards.length === 0) {
            return res.status(200).json([]); 
        }

        res.status(200).json(getFlashcards);
    } catch (error) {
        console.error('Error getting the flashcards: ', error);
        res.status(500).json({ message: 'Failed to get the flashcards for this collection' });
    }
});


//create a new flashcard in an existing collection
app.post("/newFlashcard", authenticateToken, verifyCollectionOwnership, async (req, res) => {
    try {
        const { COLLECTION_ID, FRONT_CONTENT, BACK_CONTENT } = req.body;
        const newFlashcard = await addFlashcardToCollection(COLLECTION_ID, FRONT_CONTENT, BACK_CONTENT);
        res.status(201).send(newFlashcard);
    } catch (error) {
        console.error('Error adding new flashcard: ', error);
        res.status(500).json({ message: 'Failed to create flashcard' });
    }
});

//update the front text of a flashcard
app.patch("/updateFlashcardFront", authenticateToken, verifyFlashcardOwnership, async (req, res) => {
    try {
        const { FRONT_CONTENT, FLASHCARD_ID } = req.body;
        const result = await updateFlashcardFront(FRONT_CONTENT, FLASHCARD_ID);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Flashcard not found" });
        }

        res.status(200).json({ message: "Flashcard front content updated successfully" });
    } catch (error) {
        console.error('Error updating flashcard front content:', error);
        res.status(500).json({ message: 'Failed to update flashcard front content' });
    }
});

//update the back text of a flashcard
app.patch("/updateFlashcardBack", authenticateToken, verifyFlashcardOwnership, async (req, res) => {
    try {
        const { BACK_CONTENT, FLASHCARD_ID } = req.body;
        const result = await updateFlashcardBack(BACK_CONTENT, FLASHCARD_ID);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Flashcard not found" });
        }

        res.status(200).json({ message: "Flashcard back content updated successfully" });
    } catch (error) {
        console.error('Error updating flashcard back content:', error);
        res.status(500).json({ message: 'Failed to update flashcard back content' });
    }
});

//delete a flashcard by ID
app.delete("/deleteFlashcard/:FLASHCARD_ID", authenticateToken, verifyFlashcardOwnership, async (req, res) => {
    try {
        const { FLASHCARD_ID } = req.params;
        const result = await deleteFlashcard(FLASHCARD_ID);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Flashcard not found" });
        }
        
        res.status(200).json({ message: "Deleted Flashcard" });
    } catch (error) {
        console.error('Error deleting flashcard:', error);
        res.status(500).json({ message: 'Failed to delete flashcard' });
    }
});

//login endpoint
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Login attempt for email:", email);
        
        // Get user from database
        const users = await getUserByEmail(email);
        const user = users[0]; // Since getUserByEmail returns an array
        console.log(user);
        
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Compare password to the stored hashed password
        const isValidPassword = await bcrypt.compare(password, user.PASSWORD);
        
        if (!isValidPassword) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate JWT if the user has entered the correct password. Expires in 60 minutes
        const token = jwt.sign({ id: user.USER_ID, email: user.EMAIL }, JWT_SECRET, { expiresIn: "1h" });

        return res.status(200).json({ message: "Login successful", token });

    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

app.listen(8081, () => {
    console.log("server started on port 8081");
});