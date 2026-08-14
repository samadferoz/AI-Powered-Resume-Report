const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai")

const ai = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY)

const interviewReportGeminiSchema = {
    type: SchemaType.OBJECT,
    properties: {
        matchScore: {
            type: SchemaType.NUMBER,
            description: "A score between 0 and 100 indicating how well the candidate's profile matches the job"
        },
        technicalQuestions: {
            type: SchemaType.ARRAY,
            description: "Technical questions that can be asked in the interview along with their intention and how to answer them",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    question: { type: SchemaType.STRING, description: "The technical question asked in the interview" },
                    intention: { type: SchemaType.STRING, description: "The intention of interviewer behind asking this question" },
                    answer: { type: SchemaType.STRING, description: "How to answer this question, what points to cover, what approach to take etc." }
                },
                required: ["question", "intention", "answer"]
            }
        },
        behavioralQuestions: {
            type: SchemaType.ARRAY,
            description: "Behavioral questions that can be asked in the interview along with their intention and how to answer them",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    question: { type: SchemaType.STRING, description: "The behavioral question asked in the interview" },
                    intention: { type: SchemaType.STRING, description: "The intention of interviewer behind asking this question" },
                    answer: { type: SchemaType.STRING, description: "How to answer this question, what points to cover, what approach to take etc." }
                },
                required: ["question", "intention", "answer"]
            }
        },
        skillGap: {
            type: SchemaType.ARRAY,
            description: "List of skill gap in the candidate's profile along with their severity",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    skill: { type: SchemaType.STRING, description: "The skill which the candidate is lacking" },
                    severity: {
                        type: SchemaType.STRING,
                        description: "The severity of this skill gap (low, medium, or high)"
                    }
                },
                required: ["skill", "severity"]
            }
        },
        preparationPlan: {
            type: SchemaType.ARRAY,
            description: "A day-wise preparation plan for the candidate to follow in order to prepare for the interview",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    day: { type: SchemaType.NUMBER, description: "The day number in the preparation plan, starting from 1" },
                    focus: { type: SchemaType.STRING, description: "The main focus of this day, e.g. data structures, system design, mock interview etc." },
                    tasks: {
                        type: SchemaType.ARRAY,
                        description: "List of tasks to be done on this day",
                        items: { type: SchemaType.STRING }
                    }
                },
                required: ["day", "focus", "tasks"]
            }
        },
        title: {
            type: SchemaType.STRING,
            description: "The title of the job for which the interview report is generated"
        }
    },
    required: ["matchScore", "technicalQuestions", "behavioralQuestions", "skillGap", "preparationPlan", "title"],
}

async function generateInterviewReport({resume, selfDescription, jobDescription}) {
    
    const prompt = `Generate an interview report for a candidate with the following details:
                    Resume: ${resume}
                    Self Descriptions: ${selfDescription}
                    Job Description: ${jobDescription}`

    // Use standard flash model
    const model = ai.getGenerativeModel({
        model: "gemini-3.1-flash-lite", 
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: interviewReportGeminiSchema
        }
    })

    try {
        console.log("Calling Gemini API...")
        const response = await model.generateContent(prompt)
        
        // Safer way to extract text
        const textContent = response.response.text()
        const result = JSON.parse(textContent)
        
        console.log("AI Report Generated Successfully!")
        return result
    } catch (error) {
        console.error("GEMINI API ERROR:", error)
        throw error // Controller catch block will handle this now
    }
}

module.exports = generateInterviewReport