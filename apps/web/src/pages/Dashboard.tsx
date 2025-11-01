import { useState, useEffect } from 'react'
import './Dashboard.css'
import Modal from '../components/Modal'

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
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [showRecordModal, setShowRecordModal] = useState(false)

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
      const response = await fetch(`${apiUrl}/api/health/patients`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0) {
          setPatients(data)
        } else {
          // If API returns empty array, show empty state
          setPatients([])
        }
      } else {
        console.error('Failed to fetch patients:', response.status)
        setPatients([])
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
      setPatients([])
    } finally {
      setLoading(false)
    }
  }

  const fetchPatientRecords = async (patientId: string) => {
    try {
      setRecordsLoading(true)
      const response = await fetch(`${apiUrl}/api/health/patients/${patientId}/records`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        // Transform the data to match our interface
        const transformedRecords: MedicalRecord[] = data.map((record: any) => ({
          id: record.id,
          userId: record.patientId || record.patient_id, // Handle both camelCase and snake_case
          recordDate: record.recordDate || record.record_date,
          description: record.description,
          summary: record.summary,
          createdAt: record.createdAt || record.created_at,
        }))
        setRecords(transformedRecords)
      } else {
        console.error('Failed to fetch patient records:', response.status)
        setRecords([])
      }
    } catch (error) {
      console.error('Error fetching records:', error)
      setRecords([])
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

  const handleAddPatient = async (username: string, email: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/health/create/patient`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, email }),
      })

      if (response.ok) {
        // Refresh patient list
        fetchPatients()
        setShowPatientModal(false)
      } else {
        const error = await response.json()
        alert('Failed to create patient: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error creating patient:', error)
      alert('Failed to create patient. Please try again.')
    }
  }

  const handleAddRecord = async (description: string, summary: string, recordDate: Date) => {
    if (!selectedPatient) return

    try {
      const response = await fetch(`${apiUrl}/api/health/create/record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          patientId: selectedPatient.id,
          recordDate: Math.floor(recordDate.getTime() / 1000),
          description,
          summary: summary || null,
          mimeType: 'text/plain',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Refresh records list
        if (selectedPatient) {
          fetchPatientRecords(selectedPatient.id)
        }
        setShowRecordModal(false)
      } else {
        const error = await response.json()
        alert('Failed to create record: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error creating record:', error)
      alert('Failed to create record. Please try again.')
    }
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Patients</h2>
          <button className="new-chat-btn" title="New Patient" onClick={() => setShowPatientModal(true)}>
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
              <button 
                className="add-record-btn" 
                onClick={() => {
                  if (selectedPatient) {
                    setShowRecordModal(true)
                  }
                }}
                type="button"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Add Record
              </button>
            </div>
          </div>
        ) : (
          <div className="records-container">
            <div className="records-header">
              <h1>{selectedPatient.username}'s Medical History</h1>
              <button className="add-record-btn-header" onClick={() => setShowRecordModal(true)}>
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

      {/* Add Patient Modal */}
      <Modal
        isOpen={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        title="Add New Patient"
      >
        <AddPatientForm onSubmit={handleAddPatient} onCancel={() => setShowPatientModal(false)} />
      </Modal>

      {/* Add Record Modal */}
      <Modal
        isOpen={showRecordModal && !!selectedPatient}
        onClose={() => setShowRecordModal(false)}
        title="Add Medical Record"
      >
        {selectedPatient && (
          <AddRecordForm
            onSubmit={handleAddRecord}
            onCancel={() => setShowRecordModal(false)}
            patientName={selectedPatient.username}
          />
        )}
      </Modal>
    </div>
  )
}

// Add Patient Form Component
function AddPatientForm({ onSubmit, onCancel }: { onSubmit: (username: string, email: string) => void; onCancel: () => void }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !email.trim()) {
      alert('Please fill in all fields')
      return
    }

    setSubmitting(true)
    await onSubmit(username.trim(), email.trim())
    setSubmitting(false)
    setUsername('')
    setEmail('')
  }

  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <div className="form-group">
        <label htmlFor="username">Patient Name</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter patient name"
          required
          minLength={3}
          maxLength={30}
          disabled={submitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="patient@example.com"
          required
          disabled={submitting}
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn-submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Patient'}
        </button>
      </div>
    </form>
  )
}

// Add Record Form Component
function AddRecordForm({
  onSubmit,
  onCancel,
  patientName,
}: {
  onSubmit: (description: string, summary: string, recordDate: Date) => void
  onCancel: () => void
  patientName: string
}) {
  const [description, setDescription] = useState('')
  const [summary, setSummary] = useState('')
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0])
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) {
      alert('Please enter a description')
      return
    }

    setSubmitting(true)
    await onSubmit(description.trim(), summary.trim(), new Date(recordDate))
    setSubmitting(false)
    setDescription('')
    setSummary('')
    setRecordDate(new Date().toISOString().split('T')[0])
  }

  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <div className="form-group">
        <label>Patient</label>
        <div className="form-readonly">{patientName || 'No patient selected'}</div>
      </div>

      <div className="form-group">
        <label htmlFor="recordDate">Record Date</label>
        <input
          id="recordDate"
          type="date"
          value={recordDate}
          onChange={(e) => setRecordDate(e.target.value)}
          required
          disabled={submitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter detailed description of the medical record..."
          rows={6}
          required
          disabled={submitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="summary">Summary (Optional)</label>
        <textarea
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Enter a brief summary..."
          rows={3}
          disabled={submitting}
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn-submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Record'}
        </button>
      </div>
    </form>
  )
}

