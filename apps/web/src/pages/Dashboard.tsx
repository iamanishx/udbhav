import { useState, useEffect } from 'react'
import './Dashboard.css'

interface Patient {
  id: string
  username: string
  email: string
  createdAt: number
}

interface MedicalRecord {
  id: string
  userId: string
  recordDate: number
  description: string
  summary: string | null
  createdAt: number
}

// Dummy data for testing
const getDummyPatients = (): Patient[] => [
  {
    id: 'patient-1',
    username: 'John Smith',
    email: 'john.smith@example.com',
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 30
  },
  {
    id: 'patient-2',
    username: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 45
  },
  {
    id: 'patient-3',
    username: 'Michael Chen',
    email: 'michael.chen@example.com',
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 20
  },
  {
    id: 'patient-4',
    username: 'Emily Rodriguez',
    email: 'emily.rodriguez@example.com',
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 60
  },
  {
    id: 'patient-5',
    username: 'David Williams',
    email: 'david.williams@example.com',
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 15
  }
]

const getDummyRecords = (): Record<string, MedicalRecord[]> => ({
  'patient-1': [
    {
      id: 'record-1-1',
      userId: 'patient-1',
      recordDate: Math.floor(Date.now() / 1000) - 86400 * 5,
      description: 'Annual physical examination. Patient reports feeling well overall. Blood pressure 120/80, heart rate 72 bpm. No significant findings.',
      summary: 'Normal annual physical examination. Vital signs within normal limits. No acute concerns.',
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 5
    },
    {
      id: 'record-1-2',
      userId: 'patient-1',
      recordDate: Math.floor(Date.now() / 1000) - 86400 * 90,
      description: 'Follow-up visit for persistent cough. Patient reports 2-week history of dry cough. Lungs clear on auscultation. Prescribed cough suppressant.',
      summary: 'Follow-up for persistent cough. Lungs clear. Symptomatic treatment initiated.',
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 90
    },
    {
      id: 'record-1-3',
      userId: 'patient-1',
      recordDate: Math.floor(Date.now() / 1000) - 86400 * 180,
      description: 'Routine check-up. Lab results show normal cholesterol levels. Advised to continue current diet and exercise regimen.',
      summary: 'Routine check-up with normal lab results. Continue preventive care measures.',
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 180
    }
  ],
  'patient-2': [
    {
      id: 'record-2-1',
      userId: 'patient-2',
      recordDate: Math.floor(Date.now() / 1000) - 86400 * 3,
      description: 'Emergency visit for acute abdominal pain. CT scan reveals appendicitis. Patient scheduled for appendectomy.',
      summary: 'Acute appendicitis diagnosed. Surgical intervention required.',
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 3
    },
    {
      id: 'record-2-2',
      userId: 'patient-2',
      recordDate: Math.floor(Date.now() / 1000) - 86400 * 120,
      description: 'Diabetes management visit. HbA1c at 6.8%. Review of medication adherence and diet modifications. Blood glucose logs reviewed.',
      summary: 'Diabetes follow-up. HbA1c controlled. Continue current management plan.',
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 120
    }
  ],
  'patient-3': [
    {
      id: 'record-3-1',
      userId: 'patient-3',
      recordDate: Math.floor(Date.now() / 1000) - 86400 * 7,
      description: 'Sports injury evaluation. Patient presents with right ankle sprain from basketball. X-ray negative for fracture. Prescribed RICE protocol and follow-up in 2 weeks.',
      summary: 'Right ankle sprain diagnosed. No fracture. Conservative management recommended.',
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 7
    },
    {
      id: 'record-3-2',
      userId: 'patient-3',
      recordDate: Math.floor(Date.now() / 1000) - 86400 * 200,
      description: 'Mental health consultation. Patient discusses work-related stress and anxiety. Provided coping strategies and scheduled follow-up.',
      summary: 'Anxiety management visit. Coping strategies discussed. Continued support recommended.',
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 200
    }
  ],
  'patient-4': [
    {
      id: 'record-4-1',
      userId: 'patient-4',
      recordDate: Math.floor(Date.now() / 1000) - 86400 * 10,
      description: 'Prenatal care visit - 28 weeks gestation. Fetal heart rate normal at 145 bpm. Ultrasound shows normal development. Discussed nutrition and exercise.',
      summary: 'Routine prenatal visit at 28 weeks. Normal fetal development. Continue standard prenatal care.',
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 10
    }
  ],
  'patient-5': [
    {
      id: 'record-5-1',
      userId: 'patient-5',
      recordDate: Math.floor(Date.now() / 1000) - 86400 * 2,
      description: 'Post-operative follow-up for knee replacement surgery. Incision healing well. Physical therapy progressing. Range of motion improving.',
      summary: 'Post-op knee replacement follow-up. Good healing progress. Continue PT regimen.',
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 2
    },
    {
      id: 'record-5-2',
      userId: 'patient-5',
      recordDate: Math.floor(Date.now() / 1000) - 86400 * 30,
      description: 'Pre-operative evaluation for knee replacement. Medical clearance provided. Surgical risks discussed. Patient informed consent obtained.',
      summary: 'Pre-op evaluation completed. Patient cleared for knee replacement surgery.',
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 30
    }
  ]
})

export default function Dashboard() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [recordsLoading, setRecordsLoading] = useState(false)

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  useEffect(() => {
    // Try to fetch real data, but fall back to dummy data if API fails
    fetchPatients()
  }, [])

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientRecords(selectedPatient.id)
    } else {
      setRecords([])
    }
  }, [selectedPatient])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${apiUrl}/api/patients`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0) {
          setPatients(data)
        } else {
          // Fall back to dummy data if API returns empty
          setPatients(getDummyPatients())
        }
      } else {
        // Fall back to dummy data if API fails
        setPatients(getDummyPatients())
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
      // Fall back to dummy data on error
      setPatients(getDummyPatients())
    } finally {
      setLoading(false)
    }
  }

  const fetchPatientRecords = async (patientId: string) => {
    try {
      setRecordsLoading(true)
      const response = await fetch(`${apiUrl}/api/patients/${patientId}/records`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0) {
          setRecords(data)
        } else {
          // Fall back to dummy data if API returns empty
          setRecords(getDummyRecords()[patientId] || [])
        }
      } else {
        // Fall back to dummy data if API fails
        setRecords(getDummyRecords()[patientId] || [])
      }
    } catch (error) {
      console.error('Error fetching records:', error)
      // Fall back to dummy data on error
      setRecords(getDummyRecords()[patientId] || [])
    } finally {
      setRecordsLoading(false)
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Patients</h2>
          <button className="new-chat-btn" title="New Patient">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        
        <div className="sidebar-content">
          {loading ? (
            <div className="loading-state">Loading patients...</div>
          ) : patients.length === 0 ? (
            <div className="empty-state">
              <p>No patients yet</p>
            </div>
          ) : (
            <div className="patient-list">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  className={`patient-item ${selectedPatient?.id === patient.id ? 'active' : ''}`}
                  onClick={() => setSelectedPatient(patient)}
                >
                  <div className="patient-avatar">
                    {patient.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="patient-info">
                    <div className="patient-name">{patient.username}</div>
                    <div className="patient-email">{patient.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedPatient && (
          <div className="sidebar-footer">
            <div className="selected-patient-info">
              <div className="patient-avatar small">
                {selectedPatient.username.charAt(0).toUpperCase()}
              </div>
              <div className="patient-details">
                <div className="patient-name">{selectedPatient.username}</div>
                <div className="patient-email">{selectedPatient.email}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {!selectedPatient ? (
          <div className="empty-selection">
            <div className="empty-selection-content">
              <h1>Select a patient</h1>
              <p>Choose a patient from the sidebar to view their medical history</p>
            </div>
          </div>
        ) : recordsLoading ? (
          <div className="loading-records">
            <div className="loading-spinner"></div>
            <p>Loading medical records...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="empty-history">
            <div className="empty-history-content">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              <h2>No medical records</h2>
              <p>This patient doesn't have any medical records yet.</p>
              <button className="add-record-btn" onClick={() => {/* Handle add record */}}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Add Record
              </button>
            </div>
          </div>
        ) : (
          <div className="records-container">
            <div className="records-header">
              <h1>{selectedPatient.username}'s Medical History</h1>
              <button className="add-record-btn-header" onClick={() => {/* Handle add record */}}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Add Record
              </button>
            </div>

            <div className="records-list">
              {records.map((record) => (
                <div key={record.id} className="record-card">
                  <div className="record-header">
                    <div className="record-date-group">
                      <div className="record-date">{formatDate(record.recordDate)}</div>
                      <div className="record-time">{formatTime(record.recordDate)}</div>
                    </div>
                  </div>
                  <div className="record-description">{record.description}</div>
                  {record.summary && (
                    <div className="record-summary">
                      <div className="summary-label">Summary:</div>
                      <div className="summary-content">{record.summary}</div>
                    </div>
                  )}
                  <div className="record-footer">
                    <span className="record-id">ID: {record.id.substring(0, 8)}...</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

