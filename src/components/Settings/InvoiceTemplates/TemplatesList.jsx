import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { FileText, Edit, Copy, Trash2, Star } from 'lucide-react'

export default function TemplatesList() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchTemplates()
  }, [])

  async function fetchTemplates() {
    try {
      const { data, error } = await supabase
        .from('invoice_templates')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    try {
      const { error } = await supabase.from('invoice_templates').delete().eq('id', id)
      if (error) throw error
      setTemplates(templates.filter(t => t.id !== id))
      setDeleteModal(null)
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Error deleting template')
    }
  }

  async function handleDuplicate(template) {
    try {
      const { id, created_at, updated_at, ...templateData } = template
      const copy = {
        ...templateData,
        template_name: `Copy of ${template.template_name}`,
        is_default: false
      }
      
      const { error } = await supabase.from('invoice_templates').insert(copy)
      if (error) throw error
      fetchTemplates()
    } catch (error) {
      console.error('Error duplicating template:', error)
      alert('Error duplicating template')
    }
  }

  async function handleSetDefault(id) {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Remove default from all user's templates
      const { error: updateError } = await supabase
        .from('invoice_templates')
        .update({ is_default: false })
        .eq('user_id', user.id)
      
      if (updateError) throw updateError

      // Set new default
      const { error: setError } = await supabase
        .from('invoice_templates')
        .update({ is_default: true })
        .eq('id', id)
      
      if (setError) throw setError
      fetchTemplates()
    } catch (error) {
      console.error('Error setting default template:', error)
      alert('Error setting default template')
    }
  }

  if (loading) {
    return <div className="templates-loading">Loading templates...</div>
  }

  return (
    <div className="templates-list">
      <div className="list-header">
        <div>
          <h2>Invoice Templates</h2>
          <p>Create and manage invoice templates for your bookings</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/settings?tab=invoiceTemplates&action=new')}
          type="button"
        >
          <FileText size={16} />
          Create New Template
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} />
          <h3>No Templates Yet</h3>
          <p>Create your first invoice template to get started</p>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/settings?tab=invoiceTemplates&action=new')}
            type="button"
          >
            Create Template
          </button>
        </div>
      ) : (
        <div className="templates-grid">
          {templates.map(template => (
            <div key={template.id} className="template-card">
              {template.is_default && (
                <div className="default-badge">
                  <Star size={12} /> Default
                </div>
              )}
              
              <div className="template-preview">
                <FileText size={32} />
              </div>
              
              <div className="template-info">
                <h3>{template.template_name}</h3>
                <p>Modified {new Date(template.updated_at).toLocaleDateString()}</p>
              </div>
              
              <div className="template-actions">
                <button 
                  onClick={() => navigate(`/settings?tab=invoiceTemplates&action=edit&id=${template.id}`)}
                  title="Edit"
                  type="button"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => handleDuplicate(template)} 
                  title="Duplicate"
                  type="button"
                >
                  <Copy size={16} />
                </button>
                {!template.is_default && (
                  <button 
                    onClick={() => handleSetDefault(template.id)} 
                    title="Set as default"
                    type="button"
                  >
                    <Star size={16} />
                  </button>
                )}
                <button 
                  onClick={() => setDeleteModal(template.id)}
                  title="Delete"
                  disabled={templates.length === 1}
                  type="button"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Delete Template?</h3>
            <p>This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary" 
                onClick={() => setDeleteModal(null)}
                type="button"
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={() => handleDelete(deleteModal)}
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
