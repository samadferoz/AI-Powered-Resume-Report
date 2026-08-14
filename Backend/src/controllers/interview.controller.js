const {PDFParse} = require("pdf-parse")
const generateInterviewReport= require("../services/ai.service")
const interviewReportModel= require("../models/interviewReport.model")


async function generateInterviewReportController(req, res) {
    try {
        const resumeFile = req.file;

        
        if(!resumeFile) {
            return res.status(400).json({
                message: "Resume file is required"
            })
        }

        const parser = new PDFParse({ data: resumeFile.buffer });
        const result = await parser.getText();
        await parser.destroy();

        const resumeContent = { text: result.text };

        const { title,selfDescription, jobDescription } = req.body;

        const interviewReportByAi = await generateInterviewReport({
            resume: resumeContent.text,
            selfDescription,
            jobDescription,
        });

        const interviewReport = await interviewReportModel.create({
        user: req.user.id,
        title: interviewReportByAi.title,
        resume: resumeContent.text,
        selfDescription: selfDescription,
        jobDescription: jobDescription,
        
        matchScore: interviewReportByAi.matchScore,
        technicalQuestionSchema: interviewReportByAi.technicalQuestions, 
        behavioralQuestionSchema: interviewReportByAi.behavioralQuestions, 
        skillGapSchema: interviewReportByAi.skillGap, 
        preparationPlanSchema: interviewReportByAi.preparationPlan 
        });
        res.status(201).json({
            message:"Interview report generated successfully.",
            interviewReport
        })
    } catch(error) {
        console.error("Error generating interview report:", error)
        res.status(500).json({
            message: "Error generating interview report",
            error: error.message
        })
    }
}

async function getInterviewReportByIdController(req,res){
    const { interviewID } = req.params
    const interviewReport = await interviewReportModel.findOne({ _id: interviewID,user: req.user.id})

    if(!interviewReport){
        return(res.status(400).json({
            message: "INterview report not found"
        }))
    }
    res.status(200).json({
        message: "INterview report fetched successfully",
        interviewReport
    })
}

async function getAllInterviewReportController(req,res){
    const interviewReports = await interviewReportModel.find({user: req.user.id}).sort({createdAt:-1}).select("-resume -selfDescription -jobDescription -__v -technicalQuestionSchema -behavioralQuestionSchema -skillGapSchema -preparationPlanSchema")

    res.status(200).json({
        message: "All interview reports fetched successfully",
        interviewReports
    })
}
module.exports={generateInterviewReportController,getInterviewReportByIdController,getAllInterviewReportController}