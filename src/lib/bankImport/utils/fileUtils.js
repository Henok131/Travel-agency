
const TEXT_FILE_MAX_PREVIEW = 20000

export async function detectFileType(file) {
  const name = (file?.name || '').toLowerCase()
  const mime = (file?.type || '').toLowerCase()

  if (mime.includes('csv') || name.endsWith('.csv')) return 'csv'
  if (mime.includes('pdf') || name.endsWith('.pdf')) return 'pdf'
  if (mime.startsWith('image/') || /\.(png|jpg|jpeg)$/i.test(name)) return 'image'
  if (name.endsWith('.mt940') || name.endsWith('.mt942') || /mt9(40|42)/.test(name)) return 'mt940'
  if (mime.includes('xml') || name.endsWith('.xml') || name.includes('camt')) return 'camt'

  // Peek into the file for format hints
  try {
    const preview = await readFileAsText(file, TEXT_FILE_MAX_PREVIEW)
    if (preview.includes(':20:') && preview.includes(':61:')) return 'mt940'
    if (/camt\.(053|054)/i.test(preview) || preview.includes('<CstmrStmt') || preview.includes('<Ntry>')) return 'camt'
    if (preview.includes(',')) return 'csv'
  } catch (error) {
    console.warn('File detection fallback failed:', error)
  }

  return 'unknown'
}

export async function readFileAsText(file, limitBytes) {
  if (!file) return ''
  if (typeof file.text === 'function') {
    const text = await file.text()
    return limitBytes ? text.slice(0, limitBytes) : text
  }
  const buffer = await file.arrayBuffer()
  const truncated = limitBytes ? buffer.slice(0, limitBytes) : buffer
  return new TextDecoder().decode(truncated)
}

export async function fileToBase64(file) {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  bytes.forEach(b => { binary += String.fromCharCode(b) })
  return btoa(binary)
}
