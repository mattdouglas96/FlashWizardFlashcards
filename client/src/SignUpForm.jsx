import React, { useState } from 'react';
import {useNavigate} from "react-router-dom";

const SignUpForm = () => {
    const [errorText, setErrorText] = useState('');
    const navigate = useNavigate();
     
    {/*Store the form data using a state hook*/}
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    {/*Update the state variable anytime the form data changes*/}
    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData((prevState) => ({...prevState, [name]:value}));
    };

    const checkEmailExists = async (email) => {
        try {
            const response = await fetch(
                `http://localhost:8081/users/${encodeURIComponent(email)}`
            );
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            return data.length > 0;

        } catch (error) {
            console.error("Error checking email:", error);
            return false; 
        }
    };

    {/*Submit form. Has some basic handling for passwords not matching, email already existing*/}
    const signUpSubmit = async (e) => {
        e.preventDefault();
        setErrorText('');

        if(formData.password !== formData.confirmPassword){
            setErrorText("Passwords don't match");
            return;
        }

        const emailExists = await checkEmailExists(formData.email);
        if(emailExists){
            setErrorText("Account already exists");
            return;
        }

            try {
                const response = await fetch('http://localhost:8081/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        EMAIL: formData.email,
                        PASSWORD: formData.password,
                        PREMIUM_MEMBER: 'N'
                    })
                });
    
                if (response.ok) {
                    setErrorText("Account created successfully!");
                } else {
                    setErrorText('Failed to create account');
                }
            } catch (error) {
                console.error('Error:', error);
                setErrorText('Error creating account');
            }
        
    };

  return (
    
    <div className="container">
        <div className="row min-vh-100 align-items-center justify-content-center">
            <div className="col-6">
    
            <h1 className="coiny-regular">Sign Up</h1>
            <form className="signup-form" onSubmit={signUpSubmit}>
                <div className="mb-3">
                <label htmlFor="emailField" className="form-label">Email address</label>
                <input type="email" className="form-control" name="email" onChange={handleInputChange} value={formData.email} id="emailField"/>
                </div>
                <div className="mb-3">
                <label htmlFor="passwordField" className="form-label">Password</label>
                <input type="password" className="form-control" name="password" onChange={handleInputChange} value={formData.password} id="passwordField"/>
                </div>
                <div className="mb-1">
                <label htmlFor="confirmPasswordField" className="form-label">Confirm Password</label>
                <input type="password" className="form-control" name="confirmPassword" onChange={handleInputChange} value={formData.confirmPassword} id="confirmPasswordField"/>
                </div>
                {errorText && <div id="errorMsg" className="text-info mb-1">{errorText}</div>}
                { errorText === 'Account created successfully!' ? <button type="submit" className="btn btn-pastel-cyan mt-1 my-1" onClick={() => navigate(`/login`)}><b>Login</b></button> : <button type="submit" className="btn btn-pastel-cyan mt-1"><b>Create Account</b></button> }
            </form>

            </div>
        </div>
    </div>
  );
}

export default SignUpForm;
