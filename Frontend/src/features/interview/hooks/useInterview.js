import {getAllInterviewReports,generateInterviewReport,getInterviewReportById, generateResumePdf} from "../services/interview.api"
import {useContext,useEffect} from "react"
import {InterviewContext} from "../interview.context"
import {useParams} from "react-router-dom"

export const useInterview=()=>{
    const context = useContext(InterviewContext)
    const {interviewId} = useParams()
    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const {loading, setLoading, report, setReport, reports, setReports} = context

    const generateReport= async ({jobDescription,selfDescription,resumeFile})=>{
        if(!resumeFile) {
            alert("Please upload a resume file")
            return null
        }
        setLoading(true)
        try{
            const response = await generateInterviewReport({jobDescription,selfDescription,resumeFile})
            
            // Fix: Check if data is nested inside response.data (Axios behavior)
            const actualData = response?.data ? response.data.interviewReport : response?.interviewReport
            
            setReport(actualData)
            return actualData
        }catch(error){
            console.error("Error generating report:", error)
            alert("Error generating interview report. Please try again.")
            return null
        }finally{
            setLoading(false)
        }
    }

    const getReportById= async (interviewID)=>{
        setLoading(true)
        let response = null
        try{
            response= await getInterviewReportById(interviewID)
            
            // Fix: Check if data is nested inside response.data (Axios behavior)
            const actualData = response?.data ? response.data.interviewReport : response?.interviewReport
            
            setReport(actualData)
            return actualData
        }catch(error){
            console.log(error)
        }finally{
            setLoading(false)
        }
    }

    const getReports= async ()=>{
        setLoading(true)
        let response = null
        try{
            response= await getAllInterviewReports()
            
            // Fix: Check if data is nested inside response.data (Axios behavior)
            const actualData = response?.data ? response.data.interviewReports : response?.interviewReports
            
            setReports(actualData)
            return actualData
        }catch(error){
            console.log(error)
        }finally{
            setLoading(false)
        }
    }

    const getResumePdf= async(interviewID)=>{
        setLoading(true)
        let response = null
        try{
            response= await generateResumePdf(interviewID)
            const url=window.URL.createObjectURL(new Blob([response], { type: 'application/pdf' }))
            const link=document.createElement('a')
            link.href=url
            link.setAttribute('download',`resume_${interviewID}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
        }catch(error){
            console.log(error)
        }finally{
            setLoading(false)
        }
    }

    useEffect(() => {
        if (interviewId) {
          getReportById(interviewId)
        }else{
            getReports()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [interviewId])

    return { loading, report, reports, generateReport, getReportById, getReports,getResumePdf}
}