import { fileToBase64 } from '../utils/fileUtils'

const DEFAULT_PROMPT = `
Extract all bank transactions and return JSON with:
{
  "transactions": [
    {"date": "YYYY-MM-DD", "description": "text", "amount": number, "type": "credit|debit", "reference": "optional"}
  ]
}
Use ISO dates and signed amounts (negative for debits). Do not include any extra fields.
`

export async function parseWithVision(file, prompt = DEFAULT_PROMPT) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) throw new Error('Missing OpenAI API key for vision parsing')

  const base64 = await fileToBase64(file)
  const mime = file.type || 'application/octet-stream'

  const body = {
    model: 'gpt-4.1-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image_url',
            image_url: { url: `data:${mime};base64,${base64}` }
          }
        ]
      }
    ]
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Vision API failed: ${response.status} ${errorText}`)
  }

  const json = await response.json()
  const content = json?.choices?.[0]?.message?.content
  if (!content) throw new Error('Vision API returned empty content')

  const parsed = JSON.parse(content)
  const transactions = parsed.transactions || []
  return transactions.map(t => ({
    date: t.date,
    description: t.description,
    amount: Number(t.amount || 0),
    type: t.type || (Number(t.amount || 0) >= 0 ? 'credit' : 'debit'),
    reference: t.reference || null
  }))
}
