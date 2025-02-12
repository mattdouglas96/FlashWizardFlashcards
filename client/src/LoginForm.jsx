import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; 

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const navigate = useNavigate();

  //when input changes, update the formData state hook with the new values
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  //on login submit, submit the login info and either proceed to logged in home page or alert user that login info was incorrect, or process failed
  const loginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      
      const response = await fetch('http://localhost:8081/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      console.log('Response status:', response.status); // Debug log
      
      const rawText = await response.text();
      
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        console.error('JSON parsing error:', e);
        throw new Error('Server response was not valid JSON');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        const decodedToken = jwtDecode(data.token);
        navigate('/home');
      }

      setError('Login successful!');
      
    } catch (error) {
      setError(error.message);
      console.error('Login error:', error);
    }
  };

  return (
    <div className="container">
      <div className="row min-vh-100 align-items-center justify-content-center">
        <div className="col-6">

            <h1 className="coiny-regular">Login</h1>
            <form className="login-form" onSubmit={loginSubmit}>
              <div className="mb-3">
                <label htmlFor="emailField" className="form-label">Email address</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  onChange={handleInputChange}
                  value={formData.email}
                  id="emailField"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="passwordField" className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  onChange={handleInputChange}
                  value={formData.password}
                  id="passwordField"
                />
              </div>
              {error && <div className={`alert ${error.includes('successful') ? 'alert-success' : 'alert-danger'}`}>{error}</div>}
              <div className="mt-3">
                <button type="submit" className="btn btn-pastel-cyan mx-1 my-1"><b>Login</b></button>
                <button type="submit" className="btn btn-pastel-cyan mx-1 my-1" onClick={() => navigate(`/signup`)}><b>Sign Up</b></button>
              </div>
            </form>

        </div>
      </div>
    </div>
  );
};

export default LoginForm;