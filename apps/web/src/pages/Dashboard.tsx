import { useState, useEffect } from 'react'
import './Dashboard.css'
import Modal from '../components/Modal'
import ReactMarkdown from 'react-markdown'

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

export default function Dashboard() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [recordsLoading, setRecordsLoading] = useState(false)
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [showRecordModal, setShowRecordModal] = useState(false)

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

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
        interface RecordResponse {
          id: string
          patientId?: string
          patient_id?: string
          recordDate?: number
          record_date?: number
          description: string
          summary: string | null
          createdAt?: number
          created_at?: number
        }
        // Transform the data to match our interface
        const transformedRecords: MedicalRecord[] = data.map((record: RecordResponse) => ({
          id: record.id,
          userId: record.patientId || record.patient_id || '',
          recordDate: record.recordDate || record.record_date || 0,
          description: record.description,
          summary: record.summary,
          createdAt: record.createdAt || record.created_at || 0,
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

  useEffect(() => {
    fetchPatients()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientRecords(selectedPatient.id)
    } else {
      setRecords([])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPatient])

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

  const handleAddRecord = async (file: File, description: string, recordDate: Date) => {
    if (!selectedPatient) return

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('patientId', selectedPatient.id)
      formData.append('description', description)
      formData.append('recordDate', Math.floor(recordDate.getTime() / 1000).toString())
      formData.append('generateSummary', 'true')

      const response = await fetch(`${apiUrl}/api/health/upload-records`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (response.ok) {
        await response.json()
        // Refresh records list
        if (selectedPatient) {
          fetchPatientRecords(selectedPatient.id)
        }
        setShowRecordModal(false)
      } else {
        const error = await response.json()
        alert('Failed to upload record: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error uploading record:', error)
      alert('Failed to upload record. Please try again.')
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
                      <div className="summary-label">AI Summary:</div>
                      <div className="summary-content markdown-content">
                        <ReactMarkdown>{record.summary}</ReactMarkdown>
                      </div>
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
  onSubmit: (file: File, description: string, recordDate: Date) => void
  onCancel: () => void
  patientName: string
}) {
  const [description, setDescription] = useState('')
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0])
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      
      if (!allowedTypes.includes(selectedFile.type)) {
        alert('Invalid file type. Only PDF and image files are allowed.')
        e.target.value = ''
        return
      }

      const maxSize = 10 * 1024 * 1024 // 10MB
      if (selectedFile.size > maxSize) {
        alert('File too large. Maximum size is 10MB.')
        e.target.value = ''
        return
      }

      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) {
      alert('Please enter a description')
      return
    }
    if (!file) {
      alert('Please select a file')
      return
    }

    setSubmitting(true)
    await onSubmit(file, description.trim(), new Date(recordDate))
    setSubmitting(false)
    setDescription('')
    setFile(null)
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
        <label htmlFor="file">Medical Record File *</label>
        <input
          id="file"
          type="file"
          onChange={handleFileChange}
          accept=".pdf,image/*"
          required
          disabled={submitting}
        />
        {file && (
          <div className="file-info">
            Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </div>
        )}
        <small>Accepted formats: PDF, JPEG, PNG, GIF, WebP (max 10MB)</small>
      </div>

      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter detailed description of the medical record..."
          rows={6}
          required
          minLength={10}
          maxLength={1000}
          disabled={submitting}
        />
        <small>{description.length}/1000 characters</small>
      </div>

      <div className="form-info">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: '8px' }}>
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M8 4v4M8 10v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        AI will automatically generate a summary from the uploaded file
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn-submit" disabled={submitting}>
          {submitting ? 'Uploading...' : 'Upload Record'}
        </button>
      </div>
    </form>
  )
}

