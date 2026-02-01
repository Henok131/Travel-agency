import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactCrop, { makeAspectCrop, centerCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import './LogoEditor.css'

export default function LogoEditor({
  imageUrl,
  onSave,
  onCancel,
  onRemove,
  loading = false
}) {
  const [crop, setCrop] = useState()
  const [completedCrop, setCompletedCrop] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [flipHorizontal, setFlipHorizontal] = useState(false)
  const [flipVertical, setFlipVertical] = useState(false)
  const [imageSrc, setImageSrc] = useState(imageUrl)
  const [isEditing, setIsEditing] = useState(false)
  const imgRef = useRef(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.match(/^image\/(png|jpeg|jpg|svg)$/)) {
      alert('Please upload a valid image file (PNG, JPG, or SVG)')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setImageSrc(reader.result)
      setIsEditing(true)
      setZoom(1)
      setRotation(0)
      setFlipHorizontal(false)
      setFlipVertical(false)
      setCrop(undefined)
    }
    reader.readAsDataURL(file)
  }

  // Handle image load
  const onImageLoaded = useCallback((img) => {
    imgRef.current = img
    const { width, height } = img
    const cropSize = Math.min(width, height) * 0.9
    const crop = makeAspectCrop(
      {
        unit: 'px',
        width: cropSize,
        height: cropSize,
      },
      1,
      width,
      height
    )
    const centeredCrop = centerCrop(crop, width, height)
    setCrop(centeredCrop)
  }, [])

  // Get cropped image as blob
  const getCroppedImg = (image, crop, fileName) => {
    if (!crop || !image) {
      return Promise.resolve(null)
    }

    const canvas = document.createElement('canvas')
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    
    const cropWidth = crop.width ? crop.width * scaleX : image.naturalWidth
    const cropHeight = crop.height ? crop.height * scaleY : image.naturalHeight
    const cropX = crop.x ? crop.x * scaleX : 0
    const cropY = crop.y ? crop.y * scaleY : 0

    canvas.width = cropWidth
    canvas.height = cropHeight
    const ctx = canvas.getContext('2d')

    const pixelRatio = window.devicePixelRatio
    canvas.width = cropWidth * pixelRatio
    canvas.height = cropHeight * pixelRatio
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    ctx.imageSmoothingQuality = 'high'

    const rotateRads = (rotation * Math.PI) / 180
    const centerX = cropWidth / 2
    const centerY = cropHeight / 2

    ctx.save()

    // Move to center of crop area
    ctx.translate(centerX, centerY)
    ctx.rotate(rotateRads)
    ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1)
    ctx.translate(-centerX, -centerY)

    // Draw the cropped portion
    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    )

    ctx.restore()

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error('Canvas is empty')
            return
          }
          blob.name = fileName
          resolve(blob)
        },
        'image/png',
        1
      )
    })
  }

  // Handle save
  const handleSave = async () => {
    if (!imgRef.current || !completedCrop) {
      // If no crop, use original image
      if (imageSrc && onSave) {
        // Convert data URL to blob
        const response = await fetch(imageSrc)
        const blob = await response.blob()
        onSave(blob)
      }
      return
    }

    try {
      const croppedImageBlob = await getCroppedImg(
        imgRef.current,
        completedCrop,
        'logo.png'
      )
      if (onSave) {
        onSave(croppedImageBlob)
      }
      setIsEditing(false)
    } catch (error) {
      console.error('Error cropping image:', error)
      alert('Failed to process image')
    }
  }

  // Handle cancel
  const handleCancel = () => {
    setImageSrc(imageUrl)
    setIsEditing(false)
    setZoom(1)
    setRotation(0)
    setFlipHorizontal(false)
    setFlipVertical(false)
    if (onCancel) {
      onCancel()
    }
  }

  // Reset transformations
  const handleReset = () => {
    setZoom(1)
    setRotation(0)
    setFlipHorizontal(false)
    setFlipVertical(false)
    if (imgRef.current) {
      const { width, height } = imgRef.current
      const cropSize = Math.min(width, height) * 0.9
      const newCrop = makeAspectCrop(
        {
          unit: 'px',
          width: cropSize,
          height: cropSize,
        },
        1,
        width,
        height
      )
      const centeredCrop = centerCrop(newCrop, width, height)
      setCrop(centeredCrop)
    }
  }

  return (
    <div className="logo-editor">
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/svg+xml"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Logo Preview/Editor */}
      <div className="logo-editor-preview">
        {imageSrc ? (
          <div className="logo-image-container">
            {isEditing ? (
              <>
                <div className="logo-editor-canvas-wrapper">
                  {crop && (
                    <ReactCrop
                      crop={crop}
                      onChange={(c) => setCrop(c)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={1}
                      minWidth={50}
                      minHeight={50}
                    >
                      <img
                        ref={imgRef}
                        src={imageSrc}
                        alt="Logo preview"
                        style={{
                          transform: `scale(${zoom}) rotate(${rotation}deg) scaleX(${flipHorizontal ? -1 : 1}) scaleY(${flipVertical ? -1 : 1})`,
                          maxWidth: '100%',
                          maxHeight: '400px'
                        }}
                        onLoad={onImageLoaded}
                      />
                    </ReactCrop>
                  )}
                  {!crop && (
                    <img
                      ref={imgRef}
                      src={imageSrc}
                      alt="Logo preview"
                      style={{
                        transform: `scale(${zoom}) rotate(${rotation}deg) scaleX(${flipHorizontal ? -1 : 1}) scaleY(${flipVertical ? -1 : 1})`,
                        maxWidth: '100%',
                        maxHeight: '400px'
                      }}
                      onLoad={onImageLoaded}
                    />
                  )}
                </div>

                {/* Editor Controls */}
                <div className="logo-editor-controls">
                  <div className="logo-control-group">
                    <label>Zoom</label>
                    <div className="logo-control-input-group">
                      <button
                        className="logo-control-btn"
                        onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                        disabled={loading}
                      >
                        −
                      </button>
                      <span className="logo-control-value">{Math.round(zoom * 100)}%</span>
                      <button
                        className="logo-control-btn"
                        onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                        disabled={loading}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="logo-control-group">
                    <label>Rotate</label>
                    <div className="logo-control-input-group">
                      <button
                        className="logo-control-btn"
                        onClick={() => setRotation(rotation - 90)}
                        disabled={loading}
                      >
                        ↺
                      </button>
                      <span className="logo-control-value">{rotation}°</span>
                      <button
                        className="logo-control-btn"
                        onClick={() => setRotation(rotation + 90)}
                        disabled={loading}
                      >
                        ↻
                      </button>
                    </div>
                  </div>

                  <div className="logo-control-group">
                    <label>Flip</label>
                    <div className="logo-control-buttons">
                      <button
                        className={`logo-control-btn ${flipHorizontal ? 'active' : ''}`}
                        onClick={() => setFlipHorizontal(!flipHorizontal)}
                        disabled={loading}
                        title="Flip Horizontal"
                      >
                        ↔
                      </button>
                      <button
                        className={`logo-control-btn ${flipVertical ? 'active' : ''}`}
                        onClick={() => setFlipVertical(!flipVertical)}
                        disabled={loading}
                        title="Flip Vertical"
                      >
                        ↕
                      </button>
                    </div>
                  </div>

                  <div className="logo-control-group">
                    <button
                      className="logo-control-btn-reset"
                      onClick={handleReset}
                      disabled={loading}
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="logo-editor-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Logo'}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* View Mode - Clickable to Edit */}
                <div
                  className="logo-preview-clickable"
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.click()
                    }
                  }}
                  title="Click to edit logo"
                >
                  <img
                    src={imageSrc}
                    alt="Company Logo"
                    className="logo-preview-image"
                  />
                  <div className="logo-preview-overlay">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    <span>Click to Edit</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="logo-view-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                  >
                    Change Logo
                  </button>
                  {onRemove && (
                    <button
                      className="btn btn-danger"
                      onClick={onRemove}
                      disabled={loading}
                    >
                      Remove Logo
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="logo-placeholder">
            <div
              className="logo-placeholder-clickable"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <p>No logo uploaded</p>
              <span className="logo-placeholder-hint">Click to upload</span>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="logo-editor-instructions">
        <p className="logo-instructions-text">
          <strong>Instructions:</strong>
        </p>
        <ul className="logo-instructions-list">
          <li>Click on the logo to edit it</li>
          <li>Use zoom controls to adjust size</li>
          <li>Drag the crop area to select the portion you want</li>
          <li>Rotate and flip as needed</li>
          <li>Click "Save Logo" when done</li>
        </ul>
        <p className="logo-instructions-formats">
          Supported formats: PNG, JPG, SVG (max 2MB)
        </p>
      </div>
    </div>
  )
}
