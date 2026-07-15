import axios from 'axios'

const api= axios.create({
    baseURL:"http://localhost:3000",
    withCredentials: true,
    timeout: 30000,

})

export const generateInterviewReport= async ({jobDescription,selfDescription,resumeFile})=>{
    const formData= new FormData()
    formData.append("jobDescription",jobDescription)
    formData.append("selfDescription",selfDescription)
    formData.append("resume",resumeFile)

    const response = await api.post("/api/interview/",formData)
    return response.data

}

export const getInterviewReportById= async (interviewID)=>{
    const response= await api.get(`/api/interview/report/${interviewID}`)
    return response.data
}

export const getAllInterviewReports= async ()=>{
    const response= await api.get("/api/interview/")
    return response.data
}

export const generateResumePdf=async(interviewID)=>{
    const response= await api.post(`/api/interview/resume/pdf/${interviewID}`,null,{
        responseType: 'blob'
    })
    return response.data
}