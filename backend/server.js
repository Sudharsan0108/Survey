// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const pool = require("./db");
// const fs = require('fs');


// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());
// app.use(express.json()); // Required for parsing JSON requests



// // 🛠️ Create Tables
// const createTables = async () => {
//     const queries = [
//         `CREATE TABLE IF NOT EXISTS Surveys (
//             survey_id SERIAL PRIMARY KEY,
//             title VARCHAR(255) NOT NULL,
//             description TEXT,
//             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//             status VARCHAR(50) DEFAULT 'active'
//         );`,
//         `CREATE TABLE IF NOT EXISTS Survey_Questions (
//             question_id SERIAL PRIMARY KEY,
//             survey_id INT REFERENCES Surveys(survey_id) ON DELETE CASCADE,
//             question_text TEXT NOT NULL,
//             question_type VARCHAR(50) NOT NULL,
//             is_required BOOLEAN DEFAULT TRUE
            
//         );`,
//         `CREATE TABLE IF NOT EXISTS Survey_Options (
//             option_id SERIAL PRIMARY KEY,
//             question_id INT REFERENCES Survey_Questions(question_id) ON DELETE CASCADE,
//             option_text VARCHAR(255) NOT NULL,
//             order_number INT
//         );`,
//         `CREATE TABLE IF NOT EXISTS Survey_Responses (
//             response_id SERIAL PRIMARY KEY,
//             survey_id INT REFERENCES Surveys(survey_id) ON DELETE CASCADE,
//             submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//         );`,
//         `CREATE TABLE IF NOT EXISTS Survey_Answers (
//             answer_id SERIAL PRIMARY KEY,
//             response_id INT REFERENCES Survey_Responses(response_id) ON DELETE CASCADE,
//             question_id INT REFERENCES Survey_Questions(question_id) ON DELETE CASCADE,
//             option_id INT REFERENCES Survey_Options(option_id),
//             answer_text TEXT,
//             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//         );`
//     ];

//     for (const query of queries) {
//         await pool.query(query);
//     }
//     console.log("✅ Tables are ready");
// };

// // Initialize Database
// createTables();

// // 📌 API: Create a Survey
// app.post("/create-survey", async (req, res) => {
//   const { title, description } = req.body; // Ensure you're only sending these fields

//   try {
//       const result = await pool.query(
//           "INSERT INTO Surveys (title, description) VALUES ($1, $2) RETURNING survey_id",
//           [title, description]
//       );

//       res.status(201).json({ survey_id: result.rows[0].survey_id });
//   } catch (error) {
//       console.error("❌ Error creating survey:", error);
//       res.status(500).json({ message: "Error creating survey", error });
//   }
// });



// app.post("/add-questions", async (req, res) => {
//   try {
//       const { survey_id, questions } = req.body;

//       // ✅ Validate Input
//       if (!survey_id || !questions || !Array.isArray(questions) || questions.length === 0) {
//           return res.status(400).json({ message: "Survey ID and a non-empty questions array are required." });
//       }

//       // ✅ Insert Multiple Questions
//       const values = [];
//       const placeholders = [];

//       questions.forEach((q, index) => {
//           if (!q.question_text || !q.question_type) {
//               return res.status(400).json({ message: "Each question must have 'question_text' and 'question_type'." });
//           }
//           placeholders.push(`($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`);
//           values.push(survey_id, q.question_text, q.question_type);
//       });

//       const query = `
//           INSERT INTO survey_questions (survey_id, question_text, question_type)
//           VALUES ${placeholders.join(", ")}
//           RETURNING *;
//       `;

//       const result = await pool.query(query, values);
//       res.status(201).json({ message: "Questions added successfully", questions: result.rows });
//   } catch (error) {
//       console.error("❌ Error adding questions:", error);
//       res.status(500).json({ message: "Error adding questions", error });
//   }
// });


// app.post('/add-options', async (req, res) => {
//   const { question_id, options } = req.body;

//   try {
//       const values = options.map((option, index) => `(${question_id}, '${option}', ${index + 1})`).join(',');
//       const result = await pool.query(
//           `INSERT INTO Survey_Options (question_id, option_text) VALUES ${values} RETURNING *`
//       );

//       res.status(201).json({ message: 'Options added successfully', options: result.rows });
//   } catch (error) {
//       console.error('❌ Error adding options:', error);
//       res.status(500).json({ message: 'Error saving data', error });
//   }
// });

// app.post('/submit-response', async (req, res) => {
//   const { survey_id, responses } = req.body;

//   try {
//       const responseResult = await pool.query(
//           `INSERT INTO Survey_Responses (survey_id) VALUES ($1) RETURNING response_id`,
//           [survey_id]
//       );
//       const response_id = responseResult.rows[0].response_id;

//       const answerValues = responses
//           .map(({ question_id, option_id, answer_text }) => 
//               `(${response_id}, ${question_id}, ${option_id || "NULL"}, ${answer_text ? `'${answer_text}'` : "NULL"})`
//           )
//           .join(',');

//       await pool.query(
//           `INSERT INTO Survey_Answers (response_id, question_id, option_id, answer_text) VALUES ${answerValues}`
//       );

//       res.status(201).json({ message: 'Response recorded successfully', response_id });
//   } catch (error) {
//       console.error('❌ Error submitting response:', error);
//       res.status(500).json({ message: 'Error saving response', error });
//   }
// });


// app.get("/get-survey-questions", async (req, res) => {
//     fs.readFile("question.json", "utf8", async (err, data) => {
//         if (err) {
//             console.error("❌ Error reading JSON file:", err);
//             return res.status(500).json({ message: "Error reading file", error: err });
//         }

//         const questions = JSON.parse(data); // Parse JSON content

//         try {
//             // Loop through each question
//             for (let question of questions) {
//                 const { survey_id, question_text, question_type, options } = question;

//                 // Insert the question into the Survey_Questions table
//                 const result = await pool.query(
//                     "INSERT INTO Survey_Questions (survey_id, question_text, question_type) RETURNING question_id",
//                     [survey_id, question_text, question_type]
//                 );

//                 const question_id = result.rows[0].question_id; // Get the inserted question ID

//                 // If options exist, insert them into Survey_Options
//                 if (options && options.length > 0) {
//                     const optionValues = options
//                         .map((option, index) => `(${question_id}, '${option}', ${index + 1})`)
//                         .join(',');

//                     await pool.query(
//                         `INSERT INTO Survey_Options (question_id, option_text, order_number) VALUES ${optionValues}`
//                     );
//                 }
//             }

//             res.status(200).json({ message: "Questions and options added successfully" });
//         } catch (error) {
//             console.error("❌ Error adding questions and options:", error);
//             res.status(500).json({ message: "Error saving questions and options", error });
//         }
//     });
// });



// app.get("/get-surveys", async (req, res) => {
//     try {
//         const result = await pool.query("SELECT * FROM Surveys ORDER BY created_at DESC");
//         res.status(200).json(result.rows);
//     } catch (error) {
//         console.error("❌ Error retrieving surveys:", error);
//         res.status(500).json({ message: "Error retrieving data", error });
//     }
// });

// // Start Server
// app.listen(PORT, () => {
//     console.log(`🚀 Server running on http://localhost:${PORT}`);
// });





require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const pool = require("./db"); // Ensure you have a db.js file that exports your database connection

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON requests
app.use(express.urlencoded({ extended: true })); // Parse form data

// 🛠️ Create Tables
// 🛠️ Create Tables
const createTables = async () => {
    const queries = [
        `CREATE TABLE IF NOT EXISTS Surveys (
            survey_id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status VARCHAR(50) DEFAULT 'active'
        );`,

        `CREATE TABLE IF NOT EXISTS Survey_Sections (
            section_id SERIAL PRIMARY KEY,
            survey_id INT REFERENCES Surveys(survey_id) ON DELETE CASCADE,
            section_title TEXT NOT NULL
        );`,

        `CREATE TABLE IF NOT EXISTS Survey_Questions (
            question_id SERIAL PRIMARY KEY,
            survey_id INT REFERENCES Surveys(survey_id) ON DELETE CASCADE,
            question_text TEXT NOT NULL,
            question_type VARCHAR(50) NOT NULL,
            options JSONB,  -- ✅ Change TEXT[] to JSONB
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`,

        `CREATE TABLE IF NOT EXISTS survey_options (
            id SERIAL PRIMARY KEY,
            question_id INT REFERENCES Survey_Questions(question_id) ON DELETE CASCADE,
            option_text JSONB NOT NULL,
            option_order INT NOT NULL
        );`,

        `CREATE TABLE IF NOT EXISTS Survey_Responses (
            response_id SERIAL PRIMARY KEY,
            survey_id INT REFERENCES Surveys(survey_id) ON DELETE CASCADE,
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`,

        `CREATE TABLE IF NOT EXISTS Survey_Answers (
    answer_id SERIAL PRIMARY KEY,
    response_id INT REFERENCES Survey_Responses(response_id) ON DELETE CASCADE,
    question_id INT REFERENCES Survey_Questions(question_id) ON DELETE CASCADE,
    section_id INT,
    question_type VARCHAR(50) NOT NULL,
    question_text TEXT NOT NULL,
    answer_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
    ];

    for (const query of queries) {
        await pool.query(query);
    }
    console.log("✅ Tables are ready");
};


// Initialize Database
const init = async () => {
    await createTables();
};

// Initialize Database
init();


// ✅ Create a new survey
app.post("/create-survey", async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }

        const result = await pool.query(
            `INSERT INTO surveys (title, description) VALUES ($1, $2) RETURNING survey_id;`,
            [title, description]
        );

        res.status(201).json({
            message: "Survey created successfully",
            survey_id: result.rows[0].survey_id,
        });
    } catch (error) {
        console.error("❌ Error creating survey:", error);
        res.status(500).json({ message: "Error creating survey", error });
    }
});

// ✅ Get the latest survey
app.get("/get-surveys", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM surveys ORDER BY created_at DESC LIMIT 1;"
        );
        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).json({ message: "No surveys found" });
        }
    } catch (error) {
        console.error("❌ Error retrieving surveys:", error);
        res.status(500).json({ message: "Error retrieving data", error });
    }
});

// ✅ Get all survey questions
app.get("/get-survey-questions", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM survey_questions ORDER BY question_id;"
        );
        res.status(200).json({ message: "Questions fetched successfully", questions: result.rows });
    } catch (error) {
        console.error("❌ Error fetching questions:", error);
        res.status(500).json({ message: "Error fetching questions", error });
    }
});

// ✅ Load questions from JSON file
app.post("/load-questions", async (req, res) => {
    try {
        const filePath = path.join(__dirname, "question.json");
        const fileData = fs.readFileSync(filePath, "utf8");
        const jsonData = JSON.parse(fileData);

        const { survey_id, sections, questions } = jsonData;

        if (!survey_id) {
            return res.status(400).json({ message: "survey_id is required in the JSON file." });
        }

        // 🛠 Ensure survey exists before inserting questions
        const surveyCheck = await pool.query("SELECT * FROM surveys WHERE survey_id = $1", [survey_id]);
        if (surveyCheck.rows.length === 0) {
            // Create a new survey if it doesn't exist
            const defaultTitle = "Untitled Survey";
            await pool.query(
                "INSERT INTO surveys (survey_id, title, status) VALUES ($1, $2, $3)",
                [survey_id, defaultTitle, "active"]
            );
        }

        let allQuestions = [];

        if (Array.isArray(sections) && sections.length > 0) {
            sections.forEach((section) => {
                if (Array.isArray(section.questions)) {
                    allQuestions = allQuestions.concat(
                        section.questions.map((q) => ({
                            ...q,
                            section_id: section.section_id || null, // Handle missing section_id
                        }))
                    );
                }
            });
        } else if (Array.isArray(questions)) {
            allQuestions = questions;
        } else {
            return res.status(400).json({ message: "No questions found in the JSON file." });
        }

        // ✅ Insert questions with correct JSON format
        const questionPromises = allQuestions.map((question) =>
            pool.query(
                `INSERT INTO survey_questions (survey_id, section_id, question_text, question_type, options) 
                 VALUES ($1, $2, $3, $4, $5::jsonb) RETURNING question_id;`,
                [
                    survey_id,
                    question.section_id || null,
                    question.question_text,
                    question.question_type,
                    JSON.stringify(question.options || []), // Ensure options is valid JSON
                ]
            )
        );

        const results = await Promise.all(questionPromises);
        const questionIds = results.map((result) => result.rows[0].question_id);

        res.status(201).json({
            message: "Questions loaded successfully",
            survey_id,
            question_ids: questionIds,
        });
    } catch (error) {
        console.error("❌ Error loading questions:", error);
        res.status(500).json({ message: "Error loading questions", error });
    }
});



// ✅ Submit survey response
app.post("/submit-response", async (req, res) => {
    console.log("✅ Received request at /submit-response");

    const { survey_id, sections } = req.body;

    if (!survey_id || !Array.isArray(sections)) {
        return res.status(400).json({ message: "Survey ID and sections are required." });
    }

    try {
        // Insert response and get response_id
        const responseResult = await pool.query(
            `INSERT INTO Survey_Responses (survey_id) VALUES ($1) RETURNING response_id;`,
            [survey_id]
        );
        const response_id = responseResult.rows[0].response_id;

        // Insert answers, ensuring question_id is valid
        const answerPromises = [];
        for (const { section_id, questions } of sections) {
            for (const { question_text, question_type, answer_text } of questions) {
                // Fetch question_id from Survey_Questions
                const questionQuery = await pool.query(
                    `SELECT question_id FROM Survey_Questions WHERE question_text = $1 LIMIT 1;`,
                    [question_text]
                );

                if (questionQuery.rows.length === 0) {
                    console.warn(`⚠️ Warning: Question not found for "${question_text}"`);
                    continue; // Skip invalid questions
                }

                const question_id = questionQuery.rows[0].question_id;

                answerPromises.push(
                    pool.query(
                        `INSERT INTO Survey_Answers (response_id, section_id, question_id, question_type, question_text, answer_text) 
                         VALUES ($1, $2, $3, $4, $5, $6);`,
                        [response_id, section_id, question_id, question_type, question_text, answer_text]
                    )
                );
            }
        }

        await Promise.all(answerPromises);

        // ✅ Ensure only one response is sent
        return res.status(201).json({ message: "Response recorded successfully", response_id });
    } catch (error) {
        console.error("❌ Error submitting response:", error);

        // ✅ Check if headers are already sent before responding
        if (!res.headersSent) {
            return res.status(500).json({ message: "Error saving response", error });
        }
    }
});


// ✅ Add questions to a survey
app.post("/add-questions", async (req, res) => {
    try {
        const { survey_id, questions } = req.body;

        if (!survey_id || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: "Survey ID and a non-empty questions array are required." });
        }

        const values = questions.map((q, i) => `($1, $${i * 2 + 2}, $${i * 2 + 3})`).join(",");
        const flatValues = [survey_id, ...questions.flatMap(q => [q.question_text, q.question_type])];

        const result = await pool.query(
            `INSERT INTO survey_questions (survey_id, question_text, question_type) VALUES ${values} RETURNING *;`,
            flatValues
        );

        res.status(201).json({ message: "Questions added successfully", questions: result.rows });
    } catch (error) {
        console.error("❌ Error adding questions:", error);
        res.status(500).json({ message: "Error adding questions", error });
    }
});

// ✅ Add options to a question
app.post('/add-options', async (req, res) => {
    const { question_id, options } = req.body;

    if (!question_id || !Array.isArray(options) || options.length === 0) {
        return res.status(400).json({ message: 'Invalid input data' });
    }

    try {
        // Insert options into `survey_options` table with an explicit order
        const values = options.map((option, index) => [question_id, option, index + 1]); // Add option_order
        const queryText = `
            INSERT INTO survey_options (question_id, option_text, option_order)
            VALUES ${values.map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`).join(',')}
            RETURNING *;
        `;
        const flattenedValues = values.flat();
        await pool.query(queryText, flattenedValues);

        // Update `survey_questions` table to store options as JSON
        await pool.query(
            `UPDATE survey_questions SET options = $1::jsonb WHERE question_id = $2`,
            [JSON.stringify(options), question_id]
        );

        res.status(201).json({ message: 'Options added successfully and updated in survey_questions' });
    } catch (error) {
        console.error('❌ Error adding options:', error);
        res.status(500).json({ message: 'Error saving data', error });
    }
});


console.log("Registered Routes:");
app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
        console.log(r.route.path);
    }
});


// ✅ Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

