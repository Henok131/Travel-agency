export const STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled'
}

export const STATUS_ORDER = [
  STATUS.DRAFT,
  STATUS.PENDING,
  STATUS.CONFIRMED,
  STATUS.CANCELLED
]

export const STATUS_TRANSITIONS = {
  [STATUS.DRAFT]: [STATUS.PENDING, STATUS.CANCELLED],
  [STATUS.PENDING]: [STATUS.CONFIRMED, STATUS.CANCELLED],
  [STATUS.CONFIRMED]: [STATUS.CANCELLED],
  [STATUS.CANCELLED]: []
}

export const STATUS_LABELS = {
  en: {
    [STATUS.DRAFT]: 'Draft',
    [STATUS.PENDING]: 'Pending',
    [STATUS.CONFIRMED]: 'Confirmed',
    [STATUS.CANCELLED]: 'Cancelled'
  },
  de: {
    [STATUS.DRAFT]: 'Entwurf',
    [STATUS.PENDING]: 'Ausstehend',
    [STATUS.CONFIRMED]: 'Bestätigt',
    [STATUS.CANCELLED]: 'Storniert'
  }
}

export const STATUS_COLORS = {
  [STATUS.DRAFT]: { bg: '#dfe6ef', fg: '#000' },
  [STATUS.PENDING]: { bg: '#ffd700', fg: '#000' },
  [STATUS.CONFIRMED]: { bg: '#90ee90', fg: '#000' },
  [STATUS.CANCELLED]: { bg: '#ff6b6b', fg: '#fff' }
}

export const getStatusLabel = (status, language = 'en') => {
  const labels = STATUS_LABELS[language] || STATUS_LABELS.en
  return labels[status] || status || ''
}

export const isValidTransition = (fromStatus, toStatus) => {
  const from = fromStatus || STATUS.DRAFT
  const to = toStatus || STATUS.DRAFT
  if (from === to) return true
  const allowed = STATUS_TRANSITIONS[from] || []
  return allowed.includes(to)
}

export const normalizeStatus = (value, fallback = STATUS.DRAFT) => {
  if (!value) return fallback
  const lower = String(value).toLowerCase()
  return STATUS_ORDER.includes(lower) ? lower : fallback
}
