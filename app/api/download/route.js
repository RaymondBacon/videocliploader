export const runtime = 'edge'

export async function POST(request) {
  try {
    const body = await request.json()
    const { url, videoQuality, downloadMode, filenameStyle } = body

    if (!url) {
      return Response.json({ error: 'URL is required' }, { status: 400 })
    }

    // Try multiple cobalt instances for reliability
    const cobaltInstances = [
      'https://api.cobalt.tools',
      'https://cobalt.api.horse',
    ]

    let lastError = null

    for (const instance of cobaltInstances) {
      try {
        const cobaltRes = await fetch(`${instance}/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            url,
            videoQuality: videoQuality || 'max',
            downloadMode: downloadMode || 'auto',
            filenameStyle: filenameStyle || 'pretty',
          }),
          signal: AbortSignal.timeout(15000),
        })

        if (!cobaltRes.ok) {
          const errText = await cobaltRes.text()
          lastError = `Instance ${instance} returned ${cobaltRes.status}: ${errText}`
          continue
        }

        const data = await cobaltRes.json()

        return Response.json(data, {
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        })
      } catch (err) {
        lastError = err.message
        continue
      }
    }

    return Response.json(
      { error: 'All download services are currently unavailable. Please try again in a moment.', detail: lastError },
      { status: 503 }
    )
  } catch (err) {
    return Response.json({ error: 'Invalid request', detail: err.message }, { status: 400 })
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
