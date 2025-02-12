import React from "react";
import "../styles.css";

const Sidebar = ({ currentSection, setCurrentSection, sections, completedSections }) => {
  return (
    <aside className="sidebar">
      <h2>Overview</h2>
      
      <ul className="steps">
        {sections.map((section, index) => {
          const isActive = currentSection === index + 1;
          const isCompleted = completedSections.includes(index + 1);
          const isLocked = !isCompleted && currentSection !== index + 1;

          return (
            <li
              key={index}
              className={`step ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""} ${isLocked ? "locked" : ""}`}
              onClick={() => isCompleted && setCurrentSection(index + 1)}
            >
              <span className="circle">{index + 1}</span>
              <div className="text-container">
                <p className="text">{section}</p>
              </div>

              {index < sections.length - 1 && (
                <div className={`line ${isCompleted ? "completed-line" : ""} ${isActive ? "active-line" : ""}`}></div>
              )}
            </li>
          );
        })}
      </ul>
      <p className="text1">{sections[currentSection - 1]}</p>
    </aside>
    
  );
};

export default Sidebar;
