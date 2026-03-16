import React, { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { useToast } from './Toast'
import './WhatsAppQRModal.css'

const POLL_INTERVAL_MS = 2000
const MAX_CONNECT_RETRIES = 2

export function WhatsAppQRModal({
  isOpen,
  onClose,
  onConnected,
  qrCode: externalQrCode,
  loading: externalLoading,
  onRetry,
  autoConnect = true
}) {
  const [internalQrCode, setInternalQrCode] = useState(null)
  const [internalLoading, setInternalLoading] = useState(false)
  const [polling, setPolling] = useState(false)
  const [error, setError] = useState(null)
  const pollIntervalRef = useRef(null)
  const toast = useToast()

  const qrCode = externalQrCode ?? internalQrCode
  const loading = externalLoading ?? internalLoading

  useEffect(() => {
    if (isOpen) {
      setError(null)
      setPolling(false)
      setInternalQrCode(null)
      if (autoConnect && !externalQrCode) connectWhatsApp()
    }
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [isOpen, autoConnect, externalQrCode])

  useEffect(() => {
    if (!isOpen) return
    if (!qrCode) return
    // Once we have a QR code, start polling for "connected"
    setPolling(true)
    startStatusPolling()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, qrCode])

  const connectWhatsApp = async (retryCount = 0) => {
    setInternalLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/whatsapp/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      let data
      try {
        data = await response.json()
      } catch (_) {
        throw new Error('Server returned an invalid response. Try again or check the API.')
      }

      if (!response.ok) {
        throw new Error(data?.error || data?.details || 'Failed to connect')
      }
      if (!data.success) {
        throw new Error(data.error || 'Failed to connect')
      }
      if (data.alreadyConnected) {
        toast.success('WhatsApp is already connected.')
        if (onConnected) onConnected()
        onClose()
        return
      }
      const qr = data.qrcode ? (data.qrcode.startsWith('data:') ? data.qrcode : `data:image/png;base64,${data.qrcode}`) : null
      if (qr) {
        setInternalQrCode(qr)
      } else {
        if (retryCount < MAX_CONNECT_RETRIES) {
          setTimeout(() => connectWhatsApp(retryCount + 1), 1500)
          return
        }
        throw new Error('No QR code in response')
      }
    } catch (err) {
      console.error('WhatsApp connect error:', err)
      let message = err.message || 'Failed to connect'
      if (message.includes('Not Found')) {
        message = 'WhatsApp service unavailable. Ensure Evolution API is running on the server and EVOLUTION_API_URL is set.'
      }
      setError(message)
      if (retryCount < MAX_CONNECT_RETRIES) {
        toast.error(`${message} Retrying...`)
        setTimeout(() => connectWhatsApp(retryCount + 1), 2000)
        return
      }
      toast.error(message)
    } finally {
      setInternalLoading(false)
    }
  }

  const startStatusPolling = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch('/api/whatsapp/status')
        const data = await response.json()
        if (data.success && (data.status === 'connected' || data.status === 'open')) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
          pollIntervalRef.current = null
          setPolling(false)
          toast.success('WhatsApp connected successfully!')
          if (onConnected) onConnected()
          onClose()
        }
      } catch (err) {
        console.error('Status polling error:', err)
      }
    }, POLL_INTERVAL_MS)
  }

  if (!isOpen) return null

  return (
    <div className="whatsapp-qr-modal-overlay" onClick={onClose}>
      <div className="whatsapp-qr-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="whatsapp-qr-modal-header">
          <h2>Connect WhatsApp</h2>
          <button className="whatsapp-qr-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="whatsapp-qr-modal-body">
          {loading ? (
            <div className="whatsapp-qr-loading">
              <div className="whatsapp-qr-spinner"></div>
              <p>Generating QR code...</p>
            </div>
          ) : error ? (
            <div className="whatsapp-qr-error">
              <p>{error}</p>
              <button
                type="button"
                className="whatsapp-qr-retry"
                onClick={() => (onRetry ? onRetry() : connectWhatsApp(0))}
              >
                Retry
              </button>
            </div>
          ) : qrCode ? (
            <>
              <p className="whatsapp-qr-instructions">
                Scan this QR code with your WhatsApp mobile app:
              </p>
              <ol className="whatsapp-qr-steps">
                <li>Open WhatsApp on your phone</li>
                <li>Tap <strong>Settings</strong> → <strong>Linked Devices</strong></li>
                <li>Tap <strong>Link a Device</strong></li>
                <li>Scan this QR code</li>
              </ol>
              <div className="whatsapp-qr-code-container">
                <img
                  src={qrCode}
                  alt="WhatsApp QR Code"
                  className="whatsapp-qr-code"
                />
              </div>
              {polling && (
                <p className="whatsapp-qr-waiting">
                  Waiting for connection...
                </p>
              )}
            </>
          ) : (
            <p>Failed to generate QR code. Click Retry or close and try again.</p>
          )}
        </div>
      </div>
    </div>
  )
}
