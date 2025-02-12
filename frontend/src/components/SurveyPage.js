import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Questionnaire from "../components/Questionnaire";
import "../styles.css";
import Logo from "../Logo-black.svg";

const SurveyPage = () => {
  const [currentSection, setCurrentSection] = useState(1);
  const [completedSections, setCompletedSections] = useState([]);

  const sections = [
    "Business & Sales Channels",
    "Customer Buying Behaviour",
    "Brand Data Ownership & Customer Insights",
    "Post-Purchase Experience & Customer Engagement",
    "Expectations for a Customer Experience Platform",
    "lll"
  ];

  return (
    <div>
      <img src={Logo} alt="Logo" className="img" />
      <div className="container">
        <Sidebar
          currentSection={currentSection}
          completedSections={completedSections}
          sections={sections}
        />
        <Questionnaire
          currentSection={currentSection}
          sections={sections}
          setCurrentSection={setCurrentSection}
          setCompletedSections={setCompletedSections}
        />
      </div>
    </div>
  );
};

export default SurveyPage;
