import { useMemo, useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import "../style/interview.scss"
import { useInterview } from "../hooks/useInterview.js"
import { generateResumePdf } from "../services/interview.api.js"

const sections = [
  {
    key: "technical",
    label: "Technical questions",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    key: "behavioral",
    label: "Behavioral questions",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
  },
  {
    key: "roadmap",
    label: "Road map",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
]

const severityRank = { high: 3, medium: 2, low: 1 }

const CopyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const MatchScoreRing = ({ score }) => {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0))
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (safeScore / 100) * circumference

  return (
    <div className="score-ring">
      <svg viewBox="0 0 140 140">
        <circle className="score-ring__track" cx="70" cy="70" r={radius} />
        <circle
          className="score-ring__progress"
          cx="70"
          cy="70"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="score-ring__value">
        <strong>{safeScore}</strong>
        <span>%</span>
      </div>
    </div>
  )
}

const AnswerBlock = ({ item }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.answer)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // clipboard not available, ignore silently
    }
  }

  return (
    <>
      <div className="answer-row">
        <p className="answer-label">Suggested answer</p>
        <button type="button" className="copy-btn" onClick={handleCopy}>
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="answer-copy">{item.answer}</p>
    </>
  )
}

const Interview = () => {
  const [activeSection, setActiveSection] = useState("technical")
  const { interviewId } = useParams()
  const navigate = useNavigate()

  const { report, getReportById,getResumePdf } = useInterview()

  useEffect(() => {
    if (interviewId) {
      getReportById(interviewId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId])

  const sectionData = useMemo(() => {
    if (!report) {
      return {
        title: "Loading...",
        items: [],
        empty: "Loading your report...",
      }
    }
    if (activeSection === "technical") {
      return {
        title: "Technical question review",
        items: report.technicalQuestionSchema || [],
        empty: "No technical questions are available.",
      }
    }

    if (activeSection === "behavioral") {
      return {
        title: "Behavioral question review",
        items: report.behavioralQuestionSchema || [],
        empty: "No behavioral questions are available.",
      }
    }

    return {
      title: "5-day preparation plan",
      items: report.preparationPlanSchema || [],
      empty: "No preparation plan is available.",
    }
  }, [activeSection, report])

  const sortedSkillGaps = useMemo(() => {
    const gaps = report?.skillGapSchema || []
    return [...gaps].sort((a, b) => (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0))
  }, [report])

  if (!report) {
    return (
      <main className="interview-loading">
        <div className="interview-loading__spinner" />
        <h2>Loading your interview report...</h2>
      </main>
    )
  }

  return (
    <main className="interview-page">
      <aside className="interview-sidebar">
        <button 
        onClick={()=>{getResumePdf(interviewId)}}
          className='button primary-button'>
          Download Resume
        </button>
        <div className="interview-panel interview-panel--stacked">
          <div className="panel-heading">
            <span className="panel-eyebrow">Interview report</span>
            <h2>Review sections</h2>
          </div>

          <div className="nav-group">
            {sections.map((section) => (
              <button
                key={section.key}
                type="button"
                className={`nav-pill ${activeSection === section.key ? "active" : ""}`}
                onClick={() => setActiveSection(section.key)}
              >
                <span className="nav-pill__icon">{section.icon}</span>
                {section.label}
              </button>
            ))}
          </div>

          <div className="sidebar-note">
            Select any section to inspect the AI-generated insights, prepare your responses, and keep the study plan in view.
          </div>

          <button type="button" className="back-home-btn" onClick={() => navigate("/")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Generate new report
          </button>
        </div>
      </aside>

      <section className="interview-content">
        <div className="interview-summary">
          <div>
            <span className="eyebrow">Interview AI assistant</span>
            <h1>{report.title || "Strong interview preparation in one place"}</h1>
            <p>
              The report below highlights your most important technical and behavioral responses, plus a tailored preparation plan for the next five days.
            </p>
          </div>

          <div className="match-score-card">
            <span className="match-score-card__label">Match score</span>
            <MatchScoreRing score={report.matchScore} />
            <p>Confidence rating based on question coverage and domain fit.</p>
          </div>
        </div>

        <div className="interview-panel">
          <div className="interview-panel__header">
            <div>
              <span className="panel-eyebrow">{sectionData.title}</span>
              <h2>{activeSection === "roadmap" ? "Follow this plan" : "Review the answers"}</h2>
            </div>
            <span className="panel-count">{sectionData.items.length} items</span>
          </div>

          {sectionData.items.length === 0 ? (
            <p className="empty-state">{sectionData.empty}</p>
          ) : activeSection === "roadmap" ? (
            <div className="roadmap-grid">
              {sectionData.items.map((plan) => (
                <article className="roadmap-card" key={plan.day}>
                  <div className="roadmap-card__header">
                    <span className="day-badge">Day {plan.day}</span>
                    <strong>{plan.focus}</strong>
                  </div>
                  <ul>
                    {(plan.tasks || []).map((task, index) => (
                      <li key={`${plan.day}-${index}`}>{task}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          ) : (
            <div className="question-grid">
              {sectionData.items.map((item, index) => (
                <article className="question-card" key={`${activeSection}-${index}`}>
                  <div className="question-card__header">
                    <span className="question-index">Q{index + 1}</span>
                    <span className="question-type">{activeSection === "technical" ? "Technical" : "Behavioral"}</span>
                  </div>
                  <h3>{item.question}</h3>
                  <p className="intent-label">Intention</p>
                  <p className="intent-copy">{item.intention}</p>
                  <AnswerBlock item={item} />
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <aside className="interview-aside">
        <div className="interview-panel interview-panel--stacked">
          <div className="panel-heading">
            <span className="panel-eyebrow">Skill gaps</span>
            <h2>What to improve</h2>
          </div>

          <div className="skill-list">
            {sortedSkillGaps.length > 0 ? (
              sortedSkillGaps.map((item, index) => (
                <div className={`skill-pill severity-${item.severity}`} key={index}>
                  <span className={`severity-dot severity-dot--${item.severity}`} />
                  <span className="skill-pill__name">{item.skill}</span>
                  <span className="skill-pill__severity">{item.severity}</span>
                </div>
              ))
            ) : (
              <p className="empty-state">No immediate skill gaps detected. Focus on your strongest topics first.</p>
            )}
          </div>
        </div>

        <div className="interview-panel interview-panel--stacked">
          <div className="panel-heading">
            <span className="panel-eyebrow">Action plan</span>
            <h2>Ready to practice</h2>
          </div>
          <p className="sidebar-note">
            Use this right panel to keep a compact view of your next interview preparation steps.
          </p>
          <div className="plan-summary">
            {(report.preparationPlanSchema || []).slice(0, 3).map((plan) => (
              <div className="plan-item" key={plan.day}>
                <strong>Day {plan.day}</strong>
                <span>{plan.focus}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </main>
  )
}

export default Interview
