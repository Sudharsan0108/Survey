import React from "react";
import "./ThankYouPage.css";  
import thankYouIcon from "../image.png"; // Ensure the image is in the correct path
import Logo from '../../src/Logo-black.svg';

const ThankYouPage = () => {
  return (
    <div>
          <div className="logo">
          <img src={Logo} alt="Logo" className="logo-img" />
          </div>
    <div className="thank-you-container">
      <div className="thank-you-card">
        <div>
        <img src={thankYouIcon} alt="Thank You Icon" className="thank-you-icon" />
        </div>
        <h1 className="thank-you-title">Thank you for sharing your insights!</h1>
        <p className="thank-you-message">
          Your input helps us build better solutions for brands like yours.
          <br />
          We appreciate your time and look forward to enhancing your{" "}
          <strong>e-store experience</strong>.
        </p>
      </div>
    </div>
    </div>
  );
};

export default ThankYouPage;
