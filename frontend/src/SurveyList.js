import React from "react";
import { Link } from "react-router-dom";

const SurveyList = ({ surveys }) => {
    return (
        <div>
            <h2>Survey List</h2>
            {surveys.length > 0 ? (
                <ul>
                    {surveys.map((survey) => (
                        <li key={survey.survey_id}>
                            <Link to={`/survey/${survey.survey_id}`}>{survey.title}</Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No surveys available</p>
            )}
        </div>
    );
};

export default SurveyList;
