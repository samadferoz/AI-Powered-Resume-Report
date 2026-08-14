import { useMemo, useState, useEffect } from "react"
import { useParams } from "react-router-dom" 
import "../style/interview.scss"
import { useInterview } from "../hooks/useInterview.js"

const sections = [
  { key: "technical", label: "Technical questions" },
  { key: "behavioral", label: "Behavioral questions" },
  { key: "roadmap", label: "Road Map" },
]

const Interview = () => {
  const [activeSection, setActiveSection] = useState("technical")
  const { interviewId } = useParams(); 
  
  const { report, getReportById } = useInterview();

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

  if (!report) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <h2>Loading your interview report...</h2>
      </div>
    )
  }

  return (
    <main className="interview-page">
      <aside className="interview-sidebar">
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
                {section.label}
              </button>
            ))}
          </div>

          <div className="sidebar-note">
            Select any section to inspect the AI-generated insights, prepare your responses, and keep the study plan in view.
          </div>
        </div>
      </aside>

      <section className="interview-content">
        <div className="interview-summary">
          <div>
            <span className="eyebrow">Interview AI assistant</span>
            <h1>Strong interview preparation in one place</h1>
            <p>
              The report below highlights your most important technical and behavioral responses, plus a tailored preparation plan for the next five days.
            </p>
          </div>

          <div className="match-score-card">
            <span className="match-score-card__label">Match score</span>
            <strong>{report.matchScore}%</strong>
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
                    <span>Day {plan.day}</span>
                    <strong>{plan.focus}</strong>
                  </div>
                  <ul>
                    {plan.tasks.map((task, index) => (
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
                  <p className="answer-label">Suggested answer</p>
                  <p className="answer-copy">{item.answer}</p>
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
            {report.skillGapSchema.length > 0 ? (
              report.skillGapSchema.map((skillItem) => (
                <span className="skill-pill" key={skillItem.skill}>{skillItem.skill}</span>
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
            {report.preparationPlanSchema.slice(0, 3).map((plan) => (
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