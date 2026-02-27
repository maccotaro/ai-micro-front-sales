import type { NextApiRequest, NextApiResponse } from 'next'

const GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8888'

export const config = {
  api: {
    responseLimit: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { path: filePath, title: customTitle } = req.query
  if (!filePath || typeof filePath !== 'string') {
    return res.status(400).json({ error: 'File path is required' })
  }

  const token = req.cookies.access_token
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  try {
    const downloadUrl = `${GATEWAY_URL}/presentation${filePath}`
    const response = await fetch(downloadUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      return res.status(response.status).json({ error: `Download failed: ${response.statusText}` })
    }

    const rawFilename = filePath.split('/').pop() || 'presentation.pptx'
    const ext = rawFilename.endsWith('.pdf') ? '.pdf' : '.pptx'
    const contentType = ext === '.pdf'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.presentationml.presentation'

    // Use custom title if provided, otherwise truncate Presenton's long filename
    let filename: string
    if (typeof customTitle === 'string' && customTitle.trim()) {
      filename = `${customTitle.trim()}${ext}`
    } else {
      const baseName = rawFilename.replace(/\.(pptx|pdf)$/i, '')
      const truncated = baseName.length > 60 ? baseName.slice(0, 60).trimEnd() : baseName
      filename = `${truncated}${ext}`
    }

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"; filename*=UTF-8''${encodeURIComponent(filename)}`)

    const reader = response.body?.getReader()
    if (!reader) {
      return res.status(500).json({ error: 'Failed to read response body' })
    }

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        res.write(Buffer.from(value))
      }
    } finally {
      reader.releaseLock()
      res.end()
    }
  } catch (error: unknown) {
    console.error('Presentation download proxy error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
