import { useNavigate } from "react-router-dom";
import './IntroPage.css';  
import Logo from '../../src/Logo-black.svg';

const IntroPage = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div className="logo">
      <img src={Logo} alt="Logo" className="logo-img" />
      </div>
    <div className="intro-container">
      <h1 className="intro-title">
        Research on Brand-Customer<br></br> Relationships on E-Stores
      </h1>
      <p className="intro-description">
        This questionnaire is designed to validate the challenges faced by brands selling through their own e-commerce stores and marketplaces.
      </p>
      <p className="intro-goal">
        The goal is to understand brand pain points, challenges, and needs.
      </p>
      <button
        className="intro-button"
        onClick={() => navigate("/survey")}
      >
        Let’s Start
      </button>
    </div>
    </div>
    

  );
};

export default IntroPage;
