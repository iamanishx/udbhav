import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

function Landing() {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="container">
          <div className="nav-content">
            <div className="nav-logo">
              <img src="/insightMD.svg" alt="insightsMD" className="nav-logo-icon" />
              <h2>insightsMD</h2>
            </div>
            <div className="nav-buttons">
              <button className="btn-demo">Try Demo</button>
              <a href="/login" className="btn-login">Login</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">
            MEET AI-POWERED<br></br>CLINIC SUPPORT.
          </h1>
          <p className="hero-subtitle">
            Transform unstructured clinical notes into actionable insights with AI-generated summaries 
            and prioritized differential diagnoses—reducing clinician workload and enhancing patient care.
          </p>
          <div className="hero-cta">
            <button className="btn-primary">Start Free Trial</button>
            <button className="btn-secondary">Watch Demo</button>
          </div>
          
          {/* Marquee Section */}
          <div className="marquee-container">
            <p className="marquee-label">Inspired by leading healthcare organizations</p>
            <div className="marquee">
              <div className="marquee-content">
                <img src="/insightMD.svg" alt="Healthcare Logo 1" className="marquee-logo" />
                <img src="/insightMD.svg" alt="Healthcare Logo 2" className="marquee-logo" />
                <img src="/insightMD.svg" alt="Healthcare Logo 3" className="marquee-logo" />
                <img src="/insightMD.svg" alt="Healthcare Logo 4" className="marquee-logo" />
                <img src="/insightMD.svg" alt="Healthcare Logo 5" className="marquee-logo" />
                <img src="/insightMD.svg" alt="Healthcare Logo 6" className="marquee-logo" />
                {/* Duplicate for seamless loop */}
                <img src="/insightMD.svg" alt="Healthcare Logo 1" className="marquee-logo" />
                <img src="/insightMD.svg" alt="Healthcare Logo 2" className="marquee-logo" />
                <img src="/insightMD.svg" alt="Healthcare Logo 3" className="marquee-logo" />
                <img src="/insightMD.svg" alt="Healthcare Logo 4" className="marquee-logo" />
                <img src="/insightMD.svg" alt="Healthcare Logo 5" className="marquee-logo" />
                <img src="/insightMD.svg" alt="Healthcare Logo 6" className="marquee-logo" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="value-props">
        <div className="container">
          <div className="value-grid">
            <div className="value-item">
              <h3>Reduce diagnostic errors.</h3>
              <p>AI-powered analysis with evidence-based differential diagnoses.</p>
            </div>
            <div className="value-item">
              <h3>Save clinician time.</h3>
              <p>Process complex notes in seconds, not hours.</p>
            </div>
            <div className="value-item">
              <h3>Traceable & accurate.</h3>
              <p>Every diagnosis references specific clinical evidence from your notes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">70%</div>
              <div className="stat-label">REDUCTION IN NOTE REVIEW TIME</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">95%</div>
              <div className="stat-label">DIAGNOSTIC ACCURACY RATE</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">3 sec</div>
              <div className="stat-label">AVERAGE PROCESSING TIME</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100%</div>
              <div className="stat-label">HIPAA COMPLIANT</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="container">
          <h2 className="section-title">
            Trusted by healthcare professionals who prioritize accuracy and efficiency.
          </h2>
          <div className="testimonial-grid">
            {/* Card 1: Hero/Headline - twice as wide */}
            <div className="testimonial-card testimonial-hero">
              <div className="testimonial-header">
                <span className="testimonial-category">Emergency Medicine</span>
              </div>
              <p className="testimonial-text">
                "ClinicalAI has transformed how we process patient notes. The differential diagnosis 
                suggestions are remarkably accurate and save us crucial time in emergency situations."
              </p>
              <div className="testimonial-label">LOVES AI-POWERED DIAGNOSIS</div>
              <div className="testimonial-footer">
                <div className="testimonial-author">
                  <img src="/insightMD.svg" alt="Dr. Maria Chen" className="author-avatar-img" />
                  <div className="author-info">
                    <div className="author-name">Dr. Maria Chen</div>
                    <div className="author-title">Emergency Medicine Director</div>
                  </div>
                </div>
                <img src="/insightMD.svg" alt="Hospital Logo" className="company-logo" />
              </div>
            </div>

            {/* Card 2: Top-Right */}
            <div className="testimonial-card">
              <div className="testimonial-header">
                <span className="testimonial-category">Internal Medicine</span>
              </div>
              <p className="testimonial-text">
                "The ability to trace each diagnosis back to specific clinical evidence gives us 
                confidence in the AI's recommendations. It's like having a senior consultant available 24/7."
              </p>
              <div className="testimonial-label">LOVES EVIDENCE TRACEABILITY</div>
              <div className="testimonial-footer">
                <div className="testimonial-author">
                  <img src="/insightMD.svg" alt="Dr. Robert Patel" className="author-avatar-img" />
                  <div className="author-info">
                    <div className="author-name">Dr. Robert Patel</div>
                    <div className="author-title">Chief Resident, Internal Medicine</div>
                  </div>
                </div>
                <img src="/insightMD.svg" alt="Hospital Logo" className="company-logo" />
              </div>
            </div>

            {/* Card 3: Bottom-Left */}
            <div className="testimonial-card">
              <div className="testimonial-header">
                <span className="testimonial-category">Primary Care</span>
              </div>
              <p className="testimonial-text">
                "Our diagnostic accuracy improved significantly, and clinician burnout decreased. 
                The summaries help us focus on patient care rather than paperwork."
              </p>
              <div className="testimonial-label">LOVES AUTOMATED SUMMARIES</div>
              <div className="testimonial-footer">
                <div className="testimonial-author">
                  <img src="/insightMD.svg" alt="Dr. Sarah Kim" className="author-avatar-img" />
                  <div className="author-info">
                    <div className="author-name">Dr. Sarah Kim</div>
                    <div className="author-title">Medical Director, Primary Care</div>
                  </div>
                </div>
                <img src="/insightMD.svg" alt="Hospital Logo" className="company-logo" />
              </div>
            </div>

            {/* Cards 4 & 5: Bottom-Right Stack */}
            <div className="testimonial-stack">
              <div className="testimonial-card">
                <div className="testimonial-header">
                  <span className="testimonial-category">Hospital Medicine</span>
                </div>
                <p className="testimonial-text">
                  "We integrated ClinicalAI into our workflow and had our critical flows covered within days. 
                  The AI-generated differentials are comprehensive and well-reasoned."
                </p>
                <div className="testimonial-label">LOVES RAPID INTEGRATION</div>
                <div className="testimonial-footer">
                  <div className="testimonial-author">
                    <img src="/insightMD.svg" alt="Dr. James Wilson" className="author-avatar-img" />
                    <div className="author-info">
                      <div className="author-name">Dr. James Wilson</div>
                      <div className="author-title">Hospitalist, Teaching Hospital</div>
                    </div>
                  </div>
                  <img src="/insightMD.svg" alt="Hospital Logo" className="company-logo" />
                </div>
              </div>

              <div className="testimonial-card">
                <div className="testimonial-header">
                  <span className="testimonial-category">Critical Care</span>
                </div>
                <p className="testimonial-text">
                  "In the ICU, every second counts. ClinicalAI helps us quickly identify potential complications 
                  and adjust treatment plans based on evolving clinical data."
                </p>
                <div className="testimonial-label">LOVES REAL-TIME INSIGHTS</div>
                <div className="testimonial-footer">
                  <div className="testimonial-author">
                    <img src="/insightMD.svg" alt="Dr. Emily Rodriguez" className="author-avatar-img" />
                    <div className="author-info">
                      <div className="author-name">Dr. Emily Rodriguez</div>
                      <div className="author-title">Critical Care Intensivist</div>
                    </div>
                  </div>
                  <img src="/insightMD.svg" alt="Hospital Logo" className="company-logo" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="process">
        <div className="container">
          <h2 className="section-title">
            From unstructured notes to clinical insights in four intelligent steps.
          </h2>
          <div className="process-timeline">
            <div className="timeline-line"></div>
            <div className="process-step">
              <div className="step-circle">
                <div className="step-number">01</div>
              </div>
              <div className="step-content">
                <h3>Ingest</h3>
                <p>Upload clinical notes, EHR data, or paste text directly. Our system handles any format.</p>
              </div>
            </div>
            <div className="process-step">
              <div className="step-circle">
                <div className="step-number">02</div>
              </div>
              <div className="step-content">
                <h3>Analyze</h3>
                <p>Fine-tuned LLMs with RAG process notes, extracting key symptoms, history, and findings.</p>
              </div>
            </div>
            <div className="process-step">
              <div className="step-circle">
                <div className="step-number">03</div>
              </div>
              <div className="step-content">
                <h3>Generate</h3>
                <p>AI creates concise summaries and prioritized differential diagnoses with evidence links.</p>
              </div>
            </div>
            <div className="process-step">
              <div className="step-circle">
                <div className="step-number">04</div>
              </div>
              <div className="step-content">
                <h3>Verify</h3>
                <p>Review AI insights with traceable citations pointing to specific clinical evidence.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section (removed) */}

      {/* Use Cases Section removed per request */}

      {/* Problem Solution Section (challenges removed, keeping addressing header) */}
      <section className="problem-solution">
        <div className="container">
          <h2 className="section-title">
            Addressing the critical challenges in modern healthcare.
          </h2>
          <div className="problem-solution-grid">
            <div className="problem-card">
              <div className="card-label">THE PROBLEM</div>
              <h3>Clinician Burnout</h3>
              <p>Physicians spend hours reviewing lengthy, unstructured clinical notes, leading to exhaustion and reduced quality of care.</p>
            </div>
            <div className="solution-card">
              <div className="card-label">OUR SOLUTION</div>
              <h3>Automated Analysis</h3>
              <p>AI processes notes in seconds, generating clear summaries that free clinicians to focus on patient care, not paperwork.</p>
            </div>
            <div className="problem-card">
              <div className="card-label">THE PROBLEM</div>
              <h3>Diagnostic Errors</h3>
              <p>Cognitive biases and information overload contribute to misdiagnoses, affecting patient outcomes and safety.</p>
            </div>
            <div className="solution-card">
              <div className="card-label">OUR SOLUTION</div>
              <h3>Evidence-Based Differentials</h3>
              <p>RAG-enhanced AI provides comprehensive, prioritized differential diagnoses with traceable evidence from clinical notes.</p>
            </div>
            <div className="problem-card">
              <div className="card-label">THE PROBLEM</div>
              <h3>Information Fragmentation</h3>
              <p>Critical clinical details scattered across long notes make it difficult to identify key findings quickly.</p>
            </div>
            <div className="solution-card">
              <div className="card-label">OUR SOLUTION</div>
              <h3>Intelligent Extraction</h3>
              <p>Our LLMs identify and highlight crucial symptoms, findings, and history, presenting them in actionable format.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="container">
          <h2>Ready to transform your clinical workflow?</h2>
          <p>Join leading healthcare institutions using AI to enhance diagnostic accuracy and reduce clinician burden.</p>
          <div className="cta-buttons">
            <button className="btn-primary">Start 90-day Pilot</button>
            <button className="btn-secondary">Schedule Demo</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Product</h4>
              <ul>
                <li><a href="#">Features</a></li>
                <li><a href="#">Technology</a></li>
                <li><a href="#">Pricing</a></li>
                <li><a href="#">Enterprise</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Resources</h4>
              <ul>
                <li><a href="#">Clinical Studies</a></li>
                <li><a href="#">Documentation</a></li>
                <li><a href="#">API Reference</a></li>
                <li><a href="#">Knowledge Base</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Compliance</h4>
              <ul>
                <li><a href="#">HIPAA Compliance</a></li>
                <li><a href="#">Security</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Research</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 ClinicalAI. All rights reserved. Built for healthcare professionals.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  )
}
