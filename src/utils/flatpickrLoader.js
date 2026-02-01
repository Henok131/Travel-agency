// Global Flatpickr loader and auto-attacher for all date inputs
// Uses CDN versioned assets and dispatches native events so React onChange handlers fire.

const STYLE_ID = 'flatpickr-style'
const SCRIPT_ID = 'flatpickr-script'
const SELECTOR = '[data-flatpickr="true"]'

const ensureAssets = () => {
  // CSS
  if (!document.getElementById(STYLE_ID)) {
    const link = document.createElement('link')
    link.id = STYLE_ID
    link.rel = 'stylesheet'
    link.href = 'https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/flatpickr.min.css'
    document.head.appendChild(link)
  }

  // JS
  if (!window.__flatpickrReadyPromise) {
    window.__flatpickrReadyPromise = new Promise((resolve, reject) => {
      if (typeof window.flatpickr !== 'undefined') {
        resolve(window.flatpickr)
        return
      }
      let script = document.getElementById(SCRIPT_ID)
      if (!script) {
        script = document.createElement('script')
        script.id = SCRIPT_ID
        script.src = 'https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/flatpickr.min.js'
        script.defer = true
        script.onload = () => resolve(window.flatpickr)
        script.onerror = reject
        document.body.appendChild(script)
      } else {
        const onLoad = () => resolve(window.flatpickr)
        script.addEventListener('load', onLoad, { once: true })
        script.addEventListener('error', reject, { once: true })
      }
    })
  }
}

const dispatchReactInputEvents = (input) => {
  // Trigger React synthetic events so existing onChange handlers run
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

const applyFlatpickr = (input) => {
  if (input.__flatpickrBound) return
  const format = input.dataset.flatpickrFormat || 'd-m-Y'
  const minDate = input.dataset.flatpickrMin || input.getAttribute('min') || undefined
  const maxDate = input.dataset.flatpickrMax || input.getAttribute('max') || undefined

  // Convert date type to text to avoid native pickers and keep styling consistent
  if (input.type === 'date') {
    input.setAttribute('data-original-type', 'date')
    input.type = 'text'
  }

  const config = {
    dateFormat: format,
    allowInput: true,
    clickOpens: true,
    enableTime: false,
    minDate,
    maxDate,
    // Keep calendar consistent
    monthSelectorType: 'dropdown',
    onChange: (selectedDates, dateStr, instance) => {
      // Normalize to configured format (Flatpickr already formats)
      input.value = dateStr
      dispatchReactInputEvents(input)
    }
  }

  input.__flatpickrInstance = window.flatpickr(input, config)
  input.__flatpickrBound = true
}

const attachToAll = () => {
  const nodes = document.querySelectorAll(SELECTOR)
  nodes.forEach((node) => {
    if (typeof window.flatpickr === 'undefined') return
    applyFlatpickr(node)
  })
}

export const ensureGlobalFlatpickr = () => {
  ensureAssets()

  const start = async () => {
    try {
      if (window.__flatpickrReadyPromise) {
        await window.__flatpickrReadyPromise
      }
      attachToAll()

      if (!window.__flatpickrObserver) {
        const observer = new MutationObserver(() => {
          attachToAll()
        })
        observer.observe(document.body, { childList: true, subtree: true })
        window.__flatpickrObserver = observer
      }
    } catch (e) {
      // Fallback silently; do not block app
      console.error('Flatpickr failed to initialize globally', e)
    }
  }

  start()
}

export default ensureGlobalFlatpickr
