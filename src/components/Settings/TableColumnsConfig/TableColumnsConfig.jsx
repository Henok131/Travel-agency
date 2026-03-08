import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from '../../Toast'
import { Eye, EyeOff, Plus, Trash2, Save } from 'lucide-react'
import './TableColumnsConfig.css'

const TableColumnsConfig = () => {
  const [columns, setColumns] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newColumnKey, setNewColumnKey] = useState('')
  const [newColumnLabel, setNewColumnLabel] = useState('')
  const toast = useToast()

  // Available column keys that can be added (from database schema)
  const availableColumnKeys = [
    'nationality',
    'booking_ref',
    'print_invoice',
    'departure_airport',
    'destination_airport',
    'airlines',
    'notice',
    'status'
  ]

  useEffect(() => {
    loadColumns()
  }, [])

  const loadColumns = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('table_columns_config')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) throw error

      setColumns(data || [])
    } catch (error) {
      console.error('Error loading columns:', error)
      toast.error('Failed to load column configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Update all columns
      for (const column of columns) {
        const { error } = await supabase
          .from('table_columns_config')
          .update({
            label: column.label,
            visible: column.visible,
            order_index: column.order_index
          })
          .eq('id', column.id)

        if (error) throw error
      }

      toast.success('Column configuration saved successfully')
      
      // Trigger a custom event to notify MainTable to reload
      window.dispatchEvent(new CustomEvent('tableColumnsUpdated'))
    } catch (error) {
      console.error('Error saving columns:', error)
      toast.error('Failed to save column configuration')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleVisibility = (id) => {
    setColumns(columns.map(col =>
      col.id === id ? { ...col, visible: !col.visible } : col
    ))
  }

  const handleLabelChange = (id, newLabel) => {
    setColumns(columns.map(col =>
      col.id === id ? { ...col, label: newLabel } : col
    ))
  }

  const handleMoveUp = (index) => {
    if (index === 0) return
    const newColumns = [...columns]
    // Swap order_index values
    const temp = newColumns[index].order_index
    newColumns[index].order_index = newColumns[index - 1].order_index
    newColumns[index - 1].order_index = temp
    // Sort by order_index to maintain visual order
    newColumns.sort((a, b) => a.order_index - b.order_index)
    setColumns(newColumns)
  }

  const handleMoveDown = (index) => {
    if (index === columns.length - 1) return
    const newColumns = [...columns]
    // Swap order_index values
    const temp = newColumns[index].order_index
    newColumns[index].order_index = newColumns[index + 1].order_index
    newColumns[index + 1].order_index = temp
    // Sort by order_index to maintain visual order
    newColumns.sort((a, b) => a.order_index - b.order_index)
    setColumns(newColumns)
  }

  const handleAddColumn = async () => {
    if (!newColumnKey || !newColumnLabel) {
      toast.error('Please enter both column key and label')
      return
    }

    // Check if column already exists
    if (columns.some(col => col.column_key === newColumnKey)) {
      toast.error('Column with this key already exists')
      return
    }

    try {
      const maxOrder = Math.max(...columns.map(c => c.order_index), -1)
      const { data, error } = await supabase
        .from('table_columns_config')
        .insert({
          column_key: newColumnKey,
          label: newColumnLabel,
          visible: true,
          order_index: maxOrder + 1
        })
        .select()
        .single()

      if (error) throw error

      setColumns([...columns, data].sort((a, b) => a.order_index - b.order_index))
      setNewColumnKey('')
      setNewColumnLabel('')
      toast.success('Column added successfully')
    } catch (error) {
      console.error('Error adding column:', error)
      toast.error('Failed to add column')
    }
  }

  const handleRemoveColumn = async (id, columnKey) => {
    // Prevent removing essential columns
    const essentialColumns = ['select', 'row_number', 'delete']
    if (essentialColumns.includes(columnKey)) {
      toast.error('Cannot remove essential columns')
      return
    }

    if (!window.confirm('Are you sure you want to remove this column?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('table_columns_config')
        .delete()
        .eq('id', id)

      if (error) throw error

      setColumns(columns.filter(col => col.id !== id))
      toast.success('Column removed successfully')
    } catch (error) {
      console.error('Error removing column:', error)
      toast.error('Failed to remove column')
    }
  }

  if (loading) {
    return (
      <div className="table-columns-config">
        <div className="loading">Loading column configuration...</div>
      </div>
    )
  }

  return (
    <div className="table-columns-config">
      <div className="table-columns-config-header">
        <h2 className="table-columns-config-title">Main Table Columns</h2>
        <p className="table-columns-config-description">
          Configure column visibility, labels, and order for the Main Table.
        </p>
      </div>

      {/* Add New Column */}
      <div className="table-columns-config-add">
        <h3>Add New Column</h3>
        <div className="add-column-form">
          <select
            value={newColumnKey}
            onChange={(e) => setNewColumnKey(e.target.value)}
            className="column-key-select"
          >
            <option value="">Select column key...</option>
            {availableColumnKeys
              .filter(key => !columns.some(col => col.column_key === key))
              .map(key => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
          </select>
          <input
            type="text"
            value={newColumnLabel}
            onChange={(e) => setNewColumnLabel(e.target.value)}
            placeholder="Column label..."
            className="column-label-input"
          />
          <button
            type="button"
            onClick={handleAddColumn}
            className="btn btn-primary btn-small"
            disabled={!newColumnKey || !newColumnLabel}
          >
            <Plus size={16} />
            Add Column
          </button>
        </div>
      </div>

      {/* Columns List */}
      <div className="table-columns-config-list">
        <div className="columns-list-header">
          <div className="column-header-drag">Order</div>
          <div className="column-header-key">Column Key</div>
          <div className="column-header-label">Label</div>
          <div className="column-header-visible">Visible</div>
          <div className="column-header-actions">Actions</div>
        </div>

        {columns.map((column, index) => (
          <div key={column.id} className="column-item">
            <div className="column-drag">
              <button
                type="button"
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
                className="move-button"
                title="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => handleMoveDown(index)}
                disabled={index === columns.length - 1}
                className="move-button"
                title="Move down"
              >
                ↓
              </button>
            </div>
            <div className="column-key">{column.column_key}</div>
            <div className="column-label">
              <input
                type="text"
                value={column.label}
                onChange={(e) => handleLabelChange(column.id, e.target.value)}
                className="label-input"
              />
            </div>
            <div className="column-visible">
              <button
                type="button"
                onClick={() => handleToggleVisibility(column.id)}
                className={`visibility-toggle ${column.visible ? 'visible' : 'hidden'}`}
                title={column.visible ? 'Hide column' : 'Show column'}
              >
                {column.visible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
            <div className="column-actions">
              {!['select', 'row_number', 'delete'].includes(column.column_key) && (
                <button
                  type="button"
                  onClick={() => handleRemoveColumn(column.id, column.column_key)}
                  className="remove-button"
                  title="Remove column"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="table-columns-config-actions">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  )
}

export default TableColumnsConfig
