import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import ClientFormModal from './components/ClientFormModal'
import {
  fetchClientById,
  fetchLeadsForClient,
  updateClient,
  friendlyClientSaveError
} from './api/clientsApi'
import { fetchCorporateGroupById } from './api/groupsApi'
import ClientProfileHeader from './components/ClientProfileHeader'
import ClientProfileDetails from './components/ClientProfileDetails'
import ClientFinancials from './components/ClientFinancials'
import ClientDeadlines from './components/ClientDeadlines'
import './Leads.css'

function ClientProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [client, setClient] = useState(null)
  const [groupName, setGroupName] = useState('')
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    const { data: clientData, error: clientError } = await fetchClientById(id)
    if (clientError) {
      setError(clientError.message)
      setLoading(false)
      return
    }
    setClient(clientData)
    if (clientData?.corporate_group_id) {
      const { data: groupData } = await fetchCorporateGroupById(clientData.corporate_group_id)
      setGroupName(groupData?.company_name || '')
    } else {
      setGroupName('')
    }
    const { data: leadData } = await fetchLeadsForClient(id)
    setLeads(leadData || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [id])

  const handleSave = async (form) => {
    setSaving(true)
    setSaveError('')
    const { data, error: saveErr } = await updateClient(id, form)
    if (saveErr) {
      setSaveError(friendlyClientSaveError(saveErr.message))
      setSaving(false)
      return
    }
    setClient(data)
    if (data?.corporate_group_id) {
      const { data: groupData } = await fetchCorporateGroupById(data.corporate_group_id)
      setGroupName(groupData?.company_name || '')
    } else {
      setGroupName('')
    }
    setSaving(false)
    setModalOpen(false)
  }

  if (loading) {
    return (
      <AdminLayout title="Client profile" subtitle="Loading...">
        <div className="crm-state">Loading client...</div>
      </AdminLayout>
    )
  }

  if (error || !client) {
    return (
      <AdminLayout title="Client profile" subtitle="">
        <div className="crm-state crm-state-error">{error || 'Client not found.'}</div>
        <button type="button" className="crm-btn crm-btn-ghost crm-btn--dark" onClick={() => navigate('/admin/clients')}>
          Back to clients
        </button>
      </AdminLayout>
    )
  }

  const clientName = [client.first_name, client.last_name].filter(Boolean).join(' ').trim()

  return (
    <AdminLayout
      header={
        <ClientProfileHeader
          client={client}
          leadsCount={leads.length}
          groupName={groupName}
          onEdit={() => setModalOpen(true)}
        />
      }
    >
      <div className="crm-profile-grid">
        <section className="crm-workspace crm-workspace--profile-details">
          <ClientProfileDetails client={client} clientName={clientName} />
        </section>

        <ClientFinancials clientId={client.id} leads={leads} />

        <ClientDeadlines clientId={client.id} clientName={clientName} leads={leads} />

        <section className="crm-workspace crm-workspace--profile-leads">
          <div className="crm-workspace__head">
            <div>
              <h2 className="crm-workspace__title">Enquiry history</h2>
              <p className="crm-workspace__subtitle">{leads.length} linked leads</p>
            </div>
            <Link to="/admin/leads" className="crm-btn crm-btn-ghost crm-btn--dark">
              Open leads
            </Link>
          </div>
          {leads.length === 0 ? (
            <div className="crm-state">No leads linked to this client yet.</div>
          ) : (
            <div className="crm-table-wrap">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Destination</th>
                    <th>Status</th>
                    <th>Trip type</th>
                    <th>Travel dates</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id}>
                      <td>{lead.destination || '—'}</td>
                      <td>
                        <span className={`crm-status crm-status-${(lead.status || 'new').toLowerCase()}`}>
                          {lead.status || 'New'}
                        </span>
                      </td>
                      <td>{lead.trip_type || '—'}</td>
                      <td>{lead.travel_dates || '—'}</td>
                      <td>{lead.created_at ? new Date(lead.created_at).toLocaleString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <ClientFormModal
        open={modalOpen}
        initialClient={client}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        saving={saving}
        saveError={saveError}
      />
    </AdminLayout>
  )
}

export default ClientProfile
