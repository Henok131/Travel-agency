import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import './DocsViewer.css'

// Documentation file mapping
const DOCS_MAP = {
  'quick-start': '/docs/en/01-getting-started/quick-start.md',
  'calculations': '/docs/en/02-financial/calculations.md',
  'vat-calculation': '/docs/en/03-tax/vat-calculation.md',
  'skr03-categories': '/docs/en/03-tax/skr03-categories.md',
  'common-questions': '/docs/en/05-faq/common-questions.md',
}

// Breadcrumb mapping
const BREADCRUMB_MAP = {
  'quick-start': ['Getting Started', 'Quick Start'],
  'calculations': ['Financial', 'Calculations'],
  'vat-calculation': ['Tax', 'VAT Calculation'],
  'skr03-categories': ['Tax', 'SKR03 Categories'],
  'common-questions': ['FAQ', 'Common Questions'],
}

function DocsViewer({ docId: propDocId, language = 'en' }) {
  const { docId: paramDocId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [markdown, setMarkdown] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [toc, setToc] = useState([])
  const [activeHeading, setActiveHeading] = useState('')

  // Use prop docId if provided (for Settings tab), otherwise use route param
  const docId = propDocId || paramDocId

  // Get file path from docId, using language to determine path
  const filePath = docId ? (language === 'de' 
    ? DOCS_MAP[docId]?.replace('/docs/en/', '/docs/de/') || DOCS_MAP[docId]
    : DOCS_MAP[docId]) : null

  // Extract table of contents from markdown
  const extractTOC = (content) => {
    const headings = []
    const lines = content.split('\n')
    
    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/)
      if (match) {
        const level = match[1].length
        const text = match[2].trim()
        const id = text.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
        
        headings.push({
          level,
          text,
          id,
          lineIndex: index
        })
      }
    })
    
    return headings
  }

  // Load markdown file
  useEffect(() => {
    if (!filePath || !docId) {
      setError('Document not found')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    fetch(filePath)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load: ${response.status} ${response.statusText}`)
        }
        return response.text()
      })
      .then(text => {
        setMarkdown(text)
        setToc(extractTOC(text))
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading markdown:', err, 'Path:', filePath, 'DocId:', docId)
        setError(err.message || 'Document not found')
        setLoading(false)
      })
  }, [filePath, docId])

  // Filter TOC based on search
  const filteredTOC = useMemo(() => {
    if (!searchQuery) return toc
    
    const query = searchQuery.toLowerCase()
    return toc.filter(item => 
      item.text.toLowerCase().includes(query)
    )
  }, [toc, searchQuery])

  // Filter markdown content based on search
  const filteredMarkdown = useMemo(() => {
    if (!searchQuery) return markdown
    
    const query = searchQuery.toLowerCase()
    const lines = markdown.split('\n')
    const filtered = []
    let inMatch = false
    
    lines.forEach((line, index) => {
      const lineLower = line.toLowerCase()
      if (lineLower.includes(query)) {
        inMatch = true
        filtered.push(line)
      } else if (inMatch && line.match(/^#{1,6}\s/)) {
        // Stop at next heading if we were in a match
        inMatch = false
      } else if (inMatch) {
        filtered.push(line)
      }
    })
    
    return filtered.join('\n')
  }, [markdown, searchQuery])

  // Scroll to heading on TOC click
  const scrollToHeading = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveHeading(id)
    }
  }

  // Track scroll position for active heading
  useEffect(() => {
    const handleScroll = () => {
      const headings = toc.map(h => ({
        id: h.id,
        element: document.getElementById(h.id)
      })).filter(h => h.element)

      let current = ''
      headings.forEach(({ id, element }) => {
        const rect = element.getBoundingClientRect()
        if (rect.top <= 100) {
          current = id
        }
      })

      if (current) {
        setActiveHeading(current)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [toc])

  // Custom renderer for headings with IDs
  const components = {
    h1: ({ node, ...props }) => {
      const text = props.children[0] || ''
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      return <h1 id={id} {...props} />
    },
    h2: ({ node, ...props }) => {
      const text = props.children[0] || ''
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      return <h2 id={id} {...props} />
    },
    h3: ({ node, ...props }) => {
      const text = props.children[0] || ''
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      return <h3 id={id} {...props} />
    },
    h4: ({ node, ...props }) => {
      const text = props.children[0] || ''
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      return <h4 id={id} {...props} />
    },
    h5: ({ node, ...props }) => {
      const text = props.children[0] || ''
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      return <h5 id={id} {...props} />
    },
    h6: ({ node, ...props }) => {
      const text = props.children[0] || ''
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      return <h6 id={id} {...props} />
    },
    a: ({ node, ...props }) => {
      // Handle internal links
      if (props.href && props.href.startsWith('../')) {
        const pathParts = props.href.split('/')
        const targetDoc = pathParts[pathParts.length - 1].replace('.md', '')
        return (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              navigate(`/docs/${targetDoc}`)
            }}
            {...props}
          />
        )
      }
      return <a {...props} />
    }
  }

  // Get breadcrumbs
  const breadcrumbs = docId ? (BREADCRUMB_MAP[docId] || ['Documentation']) : ['Documentation']

  if (loading) {
    return (
      <div className="docs-viewer">
        <div className="docs-loading">Loading documentation...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="docs-viewer">
        <div className="docs-error">
          <h2>Error Loading Document</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    )
  }

  return (
    <div className="docs-viewer">
      {/* Header */}
      <div className="docs-header">
        {/* Breadcrumbs */}
        <nav className="docs-breadcrumbs">
          <button onClick={() => navigate('/')}>Home</button>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-item">{crumb}</span>
            </React.Fragment>
          ))}
        </nav>

        {/* Search */}
        <div className="docs-search">
          <input
            type="text"
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="docs-search-input"
          />
          {searchQuery && (
            <button
              className="docs-search-clear"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="docs-container">
        {/* Sidebar - Table of Contents */}
        <aside className="docs-sidebar">
          <h3>Table of Contents</h3>
          <nav className="docs-toc">
            {filteredTOC.length === 0 ? (
              <p className="docs-toc-empty">No headings found</p>
            ) : (
              <ul>
                {filteredTOC.map((item, index) => (
                  <li
                    key={index}
                    className={`toc-item toc-level-${item.level} ${
                      activeHeading === item.id ? 'active' : ''
                    }`}
                  >
                    <button
                      onClick={() => scrollToHeading(item.id)}
                      className="toc-link"
                    >
                      {item.text}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="docs-content">
          <div className="docs-markdown">
            {searchQuery && filteredMarkdown !== markdown && (
              <div className="docs-search-results-info">
                Showing search results for "{searchQuery}"
              </div>
            )}
            <ReactMarkdown components={components}>
              {filteredMarkdown || markdown}
            </ReactMarkdown>
          </div>
        </main>
      </div>
    </div>
  )
}

export default DocsViewer
