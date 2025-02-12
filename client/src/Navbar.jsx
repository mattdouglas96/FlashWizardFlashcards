import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token"); // Clear the token
        navigate('/');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light" style={{ backgroundColor: 'transparent' }}>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
                <button type="submit" className="btn btn-primary mx-2" onClick={() => navigate('/home')}>
                    <i className="bi bi-house-heart-fill"></i>
                </button>
                <button type="submit" className="btn btn-danger mx-2" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-left"></i>
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
