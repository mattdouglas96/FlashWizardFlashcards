import React from 'react';
import { Link } from "react-router-dom";
import wizardImage from './FlashWizardLogo1.png';



const LoginOrRegisterForm = () => {


  return (
    <div className="container">
        <div className="row min-vh-100 justify-content-center align-items-center">
              <div className="col-12 col-md-6" /* style={{ border: "1px solid red" }}*/>
                  <img src={wizardImage} alt="wizard Logo" />
                  <h1 className="coiny-regular text-center">FlashWizard</h1>
                  <Link to="/login" className="btn btn-pastel-cyan mx-2 my-1"><b>Login</b></Link>
                  <Link to="/signup" className="btn btn-pastel-cyan mx-2 my-1"><b>Sign Up</b></Link>
                  
              </div>
        </div>
    </div>
    
);
}

export default LoginOrRegisterForm;