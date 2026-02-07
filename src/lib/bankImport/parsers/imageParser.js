import { parseWithVision } from './visionParser'

export async function parseImage(file) {
  return parseWithVision(
    file,
    'Read this bank statement image and return transactions as JSON.'
  )
}
