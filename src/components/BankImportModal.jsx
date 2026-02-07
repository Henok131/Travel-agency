import React, { useState } from 'react'
import { importBankFile } from '@/lib/bankImport/importService'

// Single-account mode: auto-create account if none provided
function isValidAccountId(id) {
  return true
}

const acceptTypes = '.csv,.pdf,.png,.jpg,.jpeg,.xml,.mt940,.mt942,.txt'

export function BankImportModal({ accountId, onImportComplete, onClose }) {
  const [file, setFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleFileSelect = (e) => {
    setFile(e.target.files[0])
    setError(null)
    setResult(null)
  }

  const handleImport = async () => {
    if (!file) return
    setImporting(true)
    setError(null)
    try {
      const importResult = await importBankFile(file, accountId)
      setResult(importResult)
      if (onImportComplete) {
        onImportComplete()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="modal-overlay" style={{ zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content" style={{ background: '#181f2a', borderRadius: 12, padding: '2rem', minWidth: 360, maxWidth: 520, boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>Import Bank Statement</h2>
        <p style={{ color: '#b8c7e0', marginBottom: '1rem', fontSize: '0.95rem' }}>
          Upload CSV, PDF, images (PNG/JPG), MT940/942 or CAMT.053/054 XML. We auto-detect format, OCR PDFs/images via OpenAI Vision, normalize, dedupe, and recalc balance.
        </p>
        <div className="file-upload" style={{ marginBottom: '1rem' }}>
          <input
            type="file"
            accept={acceptTypes}
            onChange={handleFileSelect}
            disabled={importing}
            style={{ padding: '0.5rem', fontSize: '1rem', background: '#222', color: '#fff', borderRadius: 6, border: '1px solid #444', width: '100%' }}
          />
          {file && <p style={{ color: '#fff', marginTop: '0.5rem' }}>Selected: {file.name}</p>}
        </div>
        {error && (
          <div className="error-message" style={{ color: '#ff4d4f', marginBottom: '1rem', fontWeight: 600 }}>{error}</div>
        )}
        {result && (
          <div className="success-message" style={{ color: '#52c41a', marginBottom: '1rem', fontWeight: 600 }}>
            <h3 style={{ color: '#fff', fontWeight: 700 }}>Import Complete ({result.fileType})</h3>
            <ul style={{ color: '#fff', fontSize: '1rem', margin: 0, padding: 0, listStyle: 'none' }}>
              <li>Total rows: {result.stats.total}</li>
              <li>Imported: {result.stats.imported}</li>
              <li>Duplicates skipped: {result.stats.duplicates}</li>
              <li>Failed: {result.stats.failed}</li>
            </ul>
          </div>
        )}
        <div className="modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button onClick={handleImport} disabled={!file || importing || !isValidAccountId(accountId)} style={{ background: '#007bff', color: '#fff', border: 'none', borderRadius: 6, padding: '0.75rem 1.5rem', fontWeight: 600, fontSize: '1rem', cursor: importing ? 'not-allowed' : 'pointer', opacity: (!file || importing || !isValidAccountId(accountId)) ? 0.6 : 1 }}>
            {importing ? 'Importing...' : 'Import'}
          </button>
          <button onClick={onClose} disabled={importing} style={{ background: '#222', color: '#fff', border: 'none', borderRadius: 6, padding: '0.75rem 1.5rem', fontWeight: 600, fontSize: '1rem', cursor: importing ? 'not-allowed' : 'pointer', opacity: importing ? 0.6 : 1 }}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
