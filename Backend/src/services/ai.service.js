const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai")

const ai = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY)
const puppeteer =   require("puppeteer")

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

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        // Ye path verify karo, 99% yahi hota hai Windows par
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        args: ['--no-sandbox', '--disable-setuid-sandbox'], 
        timeout: 60000
    });
    const page = await browser.newPage()
    await page.setContent(htmlContent , {waitUntil: 'networkidle0'})
    const pdfBuffer = await page.pdf({ format: 'A4' })
    await browser.close()
    return pdfBuffer
}

async function generateResumePdf({resume, selfDescription, jobDescription}) {
    const resumePdfSchema={
        type: SchemaType.OBJECT,
        properties: {
            html:{
                type: SchemaType.STRING,
                description: "HTML content of the resume which can be converted to PDF using any library like puppeteer"
            }
        },
        required: ["html"]
    }

    const prompt = `Generate  resume for a candidate with the following details:
                Resume: ${resume}
                Self Descriptions: ${selfDescription}
                Job Description: ${jobDescription}
                    
                the resume should be in HTML format and should be suitable for converting to PDF using libraries like puppeteer.
                The resume should be tailored to the job description and should highlight the candidate's skills and experiences relevant to the job.The html should be well-structured and formatted, with appropriate headings, sections, and styling. The resume should be concise, clear, and professional. The resume should be in a single page format if possible.
                The content of resume should be not sound like it is generated by AI and should be  as close as possible to a real human-written resume.
                You can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                The content should be ATS friendly, i.e. it should be easily readable by Applicant Tracking Systems (ATS) used by many companies to screen resumes. Avoid using images, graphics, or complex formatting that may not be parsed correctly by ATS. Use standard fonts and avoid using tables or text boxes for important information. Use standard section headings like 'Experience', 'Education', 'Skills', etc. and avoid using creative headings that may not be recognized by ATS. Use bullet points for listing skills and experiences, and avoid using special characters or symbols that may not be recognized by ATS.
                The resume should not be so lengthy, it should be ideally 1-2 pages long when converted to PDF.Focus on quality rather than quantity and make sure to include all the relevant information that showcases the candidate's chances of getting an interview call for the given job description.`
    
    const model = ai.getGenerativeModel({
        model: "gemini-3.1-flash-lite",
        generationConfig:{
            responseMimeType: "application/json",
            responseSchema: resumePdfSchema
        }
    })

    const response = await model.generateContent(prompt)
    const jsonContent= JSON.parse(response.response.text())

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return  pdfBuffer
}

module.exports = {
    generateInterviewReport,
    generateResumePdf
}