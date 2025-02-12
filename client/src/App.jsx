import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode';
import './App.css'
import LoginOrRegisterForm from './LoginOrRegisterForm';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import UserLoggedInHome from './UserLoggedInHome';
import ViewAllDecks from './ViewAllDecks';
import ViewSingleDeck from './ViewSingleDeck';
import CreateNewDeck from './CreateNewDeck';
import Flashcard from './Flashcard';
import EditDeck from './EditDeck';

const App = () => {
  const [currentForm, setCurrentForm] = useState('loginOrRegisterForm');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUser(decodedToken);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  // Only runs when user state changes
  useEffect(() => {
    if (user) {
      
    }
  }, [user]); 

  return (
      
    <Router>
        <Routes>
          <Route path="/" element={<LoginOrRegisterForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignUpForm />} />
          <Route path="/home" element={<UserLoggedInHome />} />
          <Route path="/decks" element={<ViewAllDecks />} />
          <Route path="/decks/:collection_id" element={<ViewSingleDeck />} />
          <Route path="/flashcard" element={<Flashcard />} />
          <Route path="/create-deck" element={<CreateNewDeck user={user} />} />
          <Route path="/edit-deck/:collection_id" element={<EditDeck user={user} />} />
        </Routes>
    </Router>  
  )
}

export default App
