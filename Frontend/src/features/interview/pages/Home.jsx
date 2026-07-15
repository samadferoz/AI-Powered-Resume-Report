import {useState,useRef} from 'react'
import "../style/home.scss"
import {useInterview} from "../hooks/useInterview.js"
import { useNavigate } from 'react-router-dom'

const Home = () => {

  const {loading,generateReport} = useInterview()

  const [jobDescription,setJobDescription] = useState("")
  const [selfDescription,setSelfDescription] = useState("")
  const [resumeFile,setResumeFile] = useState(null)
  const resumeInputRef = useRef(null)
  const navigate = useNavigate()

  const handleResumeChange = (e) => {
    const file = e.target.files[0]
    if(file) {
      setResumeFile(file)
    }
  }

  // 1. Event 'e' ko receive karein aur preventDefault lagayein
  const handleGenerateReport = async (e) => {
    e.preventDefault(); 
    
    if(!resumeFile) {
      alert("Please upload a resume file first.");
      return;
    }

    const data = await generateReport({jobDescription,selfDescription,resumeFile})
    
    // 2. Ensure data exists and has an ID before navigating
    if(!data || !data._id) {
      alert("Failed to generate report. Please try again.")
      return
    }
    
    navigate(`/interview/${data._id}`)
  }

  if(loading){
    return(
      <main className='loading-screen'>
        <h1>Loading your interview plan...</h1>
        {/* Optional: Add a small spinner or subtitle here so the user knows the AI is thinking */}
        <p>Our AI is analyzing your resume and job description. This may take a few seconds.</p>
      </main>
    )
  }

  return (
    <main className="home-page">
      <section className="home-card">
        <header className="home-card__header">
          <span className="home-card__eyebrow">Interview AI assistant</span>
          <h1>Build a strong interview report in seconds</h1>
          <p className="home-card__copy">
            Enter the job description, upload your resume, and share a short self-summary to generate your interview report.
          </p>
        </header>

        <div className="home-card__grid">
          <div className="home-panel home-panel--large">
            <label htmlFor="jobDescription">Job Description</label>
            <textarea
              onChange={(e)=>setJobDescription(e.target.value)}
              id="jobDescription"
              name="jobDescription"
              placeholder="Paste the job description or role requirements here..."
            />
          </div>

          <aside className="home-panel home-panel--sidebar">
            <div className="home-panel__group">
              <div className="home-panel__label-row">
                <label>Resume</label>
                <span className="hint-text">Use resume and self description together for best results.</span>
              </div>
              {resumeFile ? (
                <div className="resume-upload-success">
                  <div className="resume-upload-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4"></path>
                      <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                  </div>
                  <div className="resume-upload-info">
                    <p className="resume-upload-name">{resumeFile.name}</p>
                    <p className="resume-upload-size">{(resumeFile.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <label className="resume-change-btn" htmlFor="resume">
                    Change
                  </label>
                </div>
              ) : (
                <label className="file-button" htmlFor="resume">
                  Upload resume
                </label>
              )}
              <input 
                ref={resumeInputRef} 
                type="file" 
                id="resume" 
                hidden 
                accept=".pdf" 
                onChange={handleResumeChange}
              />
            </div>

            <div className="home-panel__group">
              <label htmlFor="selfDescription">Self Description</label>
              <textarea
                onChange={(e)=>setSelfDescription(e.target.value)}
                id="selfDescription"
                name="selfDescription"
                placeholder="Describe your background, role expectations, or career goals..."
              />
            </div>

            {/* 3. Explicitly mark this as type="button" */}
            <button 
              type="button" 
              onClick={handleGenerateReport}
              className="button primary-button home-panel__submit">
                Generate Interview Report
            </button>
          </aside>
        </div>
      </section>
    </main>
  )
}

export default Home