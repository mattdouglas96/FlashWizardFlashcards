import mysql from 'mysql2'
import dotenv from 'dotenv'
dotenv.config()

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,   
    password: process.env.MYSQL_PASSWORD,  
    database: process.env.MYSQL_DATABASE
}).promise()

//function to retrieve a single user by their id from the users table
export async function getUser(USER_ID){
    const [rows] = await pool.query(`SELECT * FROM users
        WHERE USER_ID = ?`, [USER_ID]);
    return rows;
}

//retrieve a single user by their email address from the users table
export async function getUserByEmail(EMAIL){
    const [rows] = await pool.query(`SELECT * FROM users
        WHERE EMAIL = ?`, [EMAIL]);
    return rows;
}

//function to retrieve all the rows from users table
export async function getUsers() {
    const [rows] = await pool.query("SELECT * FROM users");
    return rows;
}

//add a new user to the db
export async function addUser(EMAIL, PASSWORD, PREMIUM_MEMBER){
    const currentTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const [result] = await pool.query(`INSERT INTO USERS (EMAIL, PASSWORD, PREMIUM_MEMBER, CREATED_AT, UPDATED_AT)
    VALUES (?, ?, ?, ?, ?)`, [EMAIL, PASSWORD, PREMIUM_MEMBER, currentTimestamp, currentTimestamp]);
    
    const newlyAddedUser = await getUser(result.insertId);
    return newlyAddedUser[0];
}

//get collection cards by specifying the user and the collection_name
export async function getCollectionName(USER_ID, COLLECTION_NAME){
    const [rows] = await pool.query(`SELECT * FROM FLASHCARD_COLLECTION WHERE USER_ID = ? AND COLLECTION_NAME = ?;`,
    [USER_ID, COLLECTION_NAME]
    );

    return rows;
}

//get a collection name by using its ID
export async function getCollectionByID(COLLECTION_ID){
    const [rows] = await pool.query(`select collection_name from flashcard_collection where COLLECTION_ID = ?;`,
    [COLLECTION_ID]
    );

    return rows;
}

//get all collections belonging to a user
export async function getUserCollections(USER_ID) {
    const [rows] = await pool.query(
        `SELECT 
            c.COLLECTION_ID, 
            c.COLLECTION_NAME,
            c.COLLECTION_DESCRIPTION,
            c.CREATED_AT, 
            COUNT(f.FLASHCARD_ID) AS flashcard_count
        FROM FLASHCARD_COLLECTION c
        LEFT JOIN FLASHCARD f ON c.COLLECTION_ID = f.COLLECTION_ID
        WHERE c.USER_ID = ?
        GROUP BY c.COLLECTION_ID;`,
        [USER_ID]
    );

    return rows;
}

//Add a new collection for a user, using their ID and the desired collection name  and description
export async function addNewCollection(USER_ID, COLLECTION_NAME, COLLECTION_DESCRIPTION){
    const [rows] = await pool.query(`INSERT INTO FLASHCARD_COLLECTION (USER_ID, COLLECTION_NAME, COLLECTION_DESCRIPTION, CREATED_AT, UPDATED_AT)
        VALUES (?, ?, ?, NOW(), NOW())`, [USER_ID, COLLECTION_NAME, COLLECTION_DESCRIPTION]);
        
    return rows;
}

//Get all the flashcards in a collection
export async function getAllFlashcardsInACollection(COLLECTION_ID){

    const [rows] = await pool.query(`SELECT f.FLASHCARD_ID, f.COLLECTION_ID, f.FRONT_CONTENT, f.BACK_CONTENT, f.STILL_LEARNING, f.CREATED_AT, f.UPDATED_AT,
fc.COLLECTION_NAME, fc.COLLECTION_DESCRIPTION
FROM FLASHCARD f INNER JOIN FLASHCARD_COLLECTION fc
ON f.COLLECTION_ID = fc.COLLECTION_ID
WHERE f.COLLECTION_ID = ?;`,
            [COLLECTION_ID]);
    
    
    return rows;
}

//Add a new flashcard to an existing collection
export async function addFlashcardToCollection(COLLECTION_ID, FRONT_CONTENT, BACK_CONTENT){
    const [rows] = await pool.query(`INSERT INTO FLASHCARD (COLLECTION_ID, FRONT_CONTENT, BACK_CONTENT, STILL_LEARNING, CREATED_AT, UPDATED_AT)
VALUES (?, ?, ?, 'Y', NOW(), NOW())`, [COLLECTION_ID, FRONT_CONTENT, BACK_CONTENT]);

    return rows;
}


//Update the front side of a flashcard, using the flashcard_id to specify the card
export async function updateFlashcardFront(FRONT_CONTENT, FLASHCARD_ID){
    const [rows] = await pool.query(
        `UPDATE FLASHCARD SET FRONT_CONTENT = ? WHERE FLASHCARD_ID = ?`,
        [FRONT_CONTENT, FLASHCARD_ID]
    );
    return rows;
}

//Update the back side of a flashcard, using the flashcard_id to specify the card
export async function updateFlashcardBack(BACK_CONTENT, FLASHCARD_ID){
    const [rows] = await pool.query(
        `UPDATE FLASHCARD SET BACK_CONTENT = ? WHERE FLASHCARD_ID = ?`,
        [BACK_CONTENT, FLASHCARD_ID]
    );
    return rows;
}

//delete an individual flashcard by passing its flashcard_id
export async function deleteFlashcard(FLASHCARD_ID){
    const [rows] = await pool.query(
        `DELETE FROM FLASHCARD WHERE FLASHCARD_ID = ?`,
        [FLASHCARD_ID]
    );
    return rows;
}

//verify that a collection belongs to a given user
export async function verifyCollectionAccess(userId, collectionId) {
    const [rows] = await pool.query(
        `SELECT 1 FROM FLASHCARD_COLLECTION 
         WHERE COLLECTION_ID = ? AND USER_ID = ?`,
        [collectionId, userId]
    );
    return rows.length > 0;
}

//verify that a flashcard belongs to a given user
export async function verifyFlashcardAccess(userId, flashcardId) {
    const [rows] = await pool.query(
        `SELECT 1 FROM FLASHCARD f
         JOIN FLASHCARD_COLLECTION fc ON f.COLLECTION_ID = fc.COLLECTION_ID
         WHERE f.FLASHCARD_ID = ? AND fc.USER_ID = ?`,
        [flashcardId, userId]
    );
    return rows.length > 0;
} 

