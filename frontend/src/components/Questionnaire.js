import React, { useState, useEffect } from "react";
import axios from "axios";
import "../components/question.css";
import { useNavigate } from "react-router-dom";

const Questionnaire = ({ currentSection, sections, setCurrentSection, setCompletedSections }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [questions, setQuestions] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const motivationText = {
    1: "Your voice matters! Let’s go! 🚀",
    2: "Great start! Keep going! 🎯",
    3: "You're halfway done! 🛤️",
    4: "You're in the final stretch! 🏃‍♂️💨",
    5: "Almost there! Don’t stop now! ⏳",
    6: "You did it! 🎉"
  };

  

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5001/get-survey-questions");

        if (!response.data.questions || !Array.isArray(response.data.questions)) {
          console.error("❌ Invalid API Response Format:", response.data);
          return;
        }

        const transformedQuestions = response.data.questions.reduce((acc, question) => {
          const sectionId = question.section_id;
          if (!acc[sectionId]) acc[sectionId] = [];
          acc[sectionId].push(question);
          return acc;
        }, {});

        Object.keys(transformedQuestions).forEach((sectionId) => {
          transformedQuestions[sectionId].sort((a, b) => a.question_id - b.question_id);
        });

        setQuestions(transformedQuestions);
      } catch (error) {
        console.error("🚨 Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleAnswerChange = (e, questionId) => {
    const { value, checked } = e.target;
    const question = questions[currentSection]?.find(q => q.question_id === questionId);
    const questionType = question?.question_type;
  
    setAnswers((prev) => {
      let updatedAnswers = { ...prev };
  
      if (questionType === "multiple_choice") {
        // Ensure it's an array before applying .filter()
        const currentAnswers = Array.isArray(updatedAnswers[questionId]) ? updatedAnswers[questionId] : [];
  
        updatedAnswers[questionId] = checked
          ? [...currentAnswers, value] 
          : currentAnswers.filter((answer) => answer !== value);
      } else {
        updatedAnswers[questionId] = value;
      }
  
      console.log("📝 Updated Answers:", updatedAnswers);
      return updatedAnswers;
    });
  };
  

  const submitResponse = async () => {
    try {
      const responses = Object.entries(answers).map(([question_id, answer]) => ({
        question_id: parseInt(question_id, 10),
        answer_text: Array.isArray(answer) ? answer.join(", ") : answer
      }));

      if (responses.length === 0) {
        console.error("❌ No valid responses to submit!");
        return;
      }

      const payload = {
        survey_id: 1,
        sections: Object.entries(questions).map(([sectionId, sectionQuestions]) => ({
          section_id: parseInt(sectionId, 10),
          questions: sectionQuestions.map(q => ({
            question_text: q.question_text,
            question_type: q.question_type,
            answer_text: answers[q.question_id] ?? ""
          }))
        }))
      };

      console.log("📌 Final Payload to Backend:", payload);

      await axios.post("http://localhost:5001/submit-response", payload);

      alert("✅ Survey Submitted Successfully!");

      navigate("/thank-you")
    } catch (error) {
      console.error("❌ Error submitting response:", error);
    }
  };

  const handleNext = async (e) => {
    e.preventDefault();
    const currentQuestions = questions[currentSection] || [];

    if (currentQuestions.length === 0) {
      console.error("⚠️ No questions found for section:", currentSection);
      return;
    }

    const currentQuestionObj = currentQuestions[currentQuestion];

    if (!currentQuestionObj) {
      console.error("⚠️ No valid question found at index:", currentQuestion);
      return;
    }

    const currentQuestionId = currentQuestionObj.question_id;

    if (!answers[currentQuestionId]) {
      console.error("⚠️ No answer provided for question:", currentQuestionId);
      return;
    }

    if (currentQuestion < currentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      if (currentSection < sections.length) {
        setCompletedSections((prev) => [...prev, currentSection]);
        setCurrentSection(currentSection + 1);
        setCurrentQuestion(0);
      } else {
        await submitResponse();
      }
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
      setCurrentQuestion((questions[currentSection - 1]?.length || 1) - 1);
    }
  };

  const formatQuestionText = (questionText) => {
    const parts = questionText.split("?");
    return (
      <div className="question-text">
        {parts[0]}?
        {parts[1] && <br />}
        {parts[1] && <span className="sub-text">{parts[1]}</span>}
      </div>
    );
  };

 const renderOptions = (question) => {
  if (!question) return <p>Loading options...</p>;

  // Open-ended question (Always shows a text box)
  if (question.question_type === "open-ended" || question.question_type === "open_ended") {
    return (
      <input
        type="text"
        className="text-box"
        value={answers[question.question_id] || ""}
        onChange={(e) =>
          setAnswers((prev) => ({ ...prev, [question.question_id]: e.target.value }))
        }
        placeholder="Please type your answer"
      />
    );
  }

  return question.options.map((option, index) => {
    const isOtherOption = option.toLowerCase().includes("other (please specify)");
    const questionId = question.question_id;
    const isSelected =
      question.question_type === "multiple_choice"
        ? (answers[questionId] || []).includes(option)
        : answers[questionId] === option;

    return (
      <label key={index} className="option-label">
        <input
          type={question.question_type === "multiple_choice" ? "checkbox" : "radio"}
          name={`question-${questionId}`}
          value={isOtherOption ? "" : option} // Don't store "Other", only store input
          checked={isSelected}
          onChange={(e) => {
            if (!isOtherOption) {
              handleAnswerChange(e, questionId);
            }
          }}
        />
        
        <span className="options">{option}</span>

        {/* Show text box inside label when "Other (Please specify)" is selected */}
        {isOtherOption && isSelected && (
          <input
            type="text"
            className="text-box inline-other-input"
            placeholder="Please specify"
            autoFocus
            value={answers[questionId] || ""}
            onChange={(e) => {
              setAnswers((prev) => ({
                ...prev,
                [questionId]: e.target.value, // Store only user input
              }));
            }}
          />
        )}
      </label>
    );
  });
};

  
  

  const isLastQuestion = currentSection === sections.length && currentQuestion === (questions[currentSection]?.length || 0) - 1;

  return (
    <div className="content">
      {loading ? (
        <p>Loading questions...</p>
      ) : questions[currentSection] ? (
        <>
          <h1>{motivationText[currentSection]}</h1>
          <h3>Question {currentQuestion + 1}/{questions[currentSection]?.length || 0}</h3>
          <h2 className="question-text">{formatQuestionText(questions[currentSection]?.[currentQuestion]?.question_text || "No question available")}</h2>
          <div className="options-container">
            {renderOptions(questions[currentSection]?.[currentQuestion])}
          </div>
          <div className="btn-container">
            <button onClick={handleBack} disabled={currentQuestion === 0 && currentSection === 1} className="back-btn">Back</button>
            <button onClick={handleNext} disabled={!answers[questions[currentSection]?.[currentQuestion]?.question_id]} className="next-btn">{isLastQuestion ? "Submit" : "Next"}</button>
          </div>
        </>
      ) : (
        <p>No questions available for this section.</p>
      )}
    </div>
  );
};

export default Questionnaire;
