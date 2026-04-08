'use client'

import { useState, useRef } from 'react'
import styles from './page.module.css'

const PLATFORMS = [
  'YouTube', 'Twitter / X', 'Instagram', 'TikTok', 'Reddit',
  'Vimeo', 'Twitch Clips', 'SoundCloud', 'Pinterest', 'Dailymotion',
  'Tumblr', 'Bilibili', 'Streamable', '+ more',
]

function getSiteName(url) {
  try {
    const h = new URL(url).hostname.replace('www.', '')
    const map = {
      'youtube.com': 'YouTube', 'youtu.be': 'YouTube',
      'twitter.com': 'Twitter / X', 'x.com': 'Twitter / X',
      'instagram.com': 'Instagram', 'tiktok.com': 'TikTok',
      'reddit.com': 'Reddit', 'vimeo.com': 'Vimeo',
      'twitch.tv': 'Twitch', 'soundcloud.com': 'SoundCloud',
    }
    return map[h] || h
  } catch { return 'Video' }
}

function getYouTubeId(url) {
  const m = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

export default function Home() {
  const [url, setUrl] = useState('')
  const [quality, setQuality] = useState('max')
  const [mode, setMode] = useState('auto')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [result, setResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const inputRef = useRef(null)

  async function handleFetch() {
    const trimmed = url.trim()
    if (!trimmed) {
      inputRef.current?.focus()
      return
    }
    try { new URL(trimmed) } catch {
      setStatus('error')
      setErrorMsg('That doesn\'t look like a valid URL. Please paste a full link including https://')
      return
    }

    setStatus('loading')
    setResult(null)
    setErrorMsg('')

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: trimmed,
          videoQuality: quality,
          downloadMode: mode,
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setStatus('error')
        setErrorMsg(data.error || 'Something went wrong. Please try a different URL.')
        return
      }

      // cobalt can return status: redirect | tunnel | stream | picker
      if (data.url) {
        setResult({
          downloadUrl: data.url,
          filename: data.filename || 'video',
          site: getSiteName(trimmed),
          ytId: getYouTubeId(trimmed),
          type: data.status,
        })
        setStatus('success')
      } else if (data.status === 'picker' && data.picker?.length) {
        // For Instagram/Pinterest multi-pick, just use first item
        setResult({
          downloadUrl: data.picker[0].url,
          filename: data.filename || 'media',
          site: getSiteName(trimmed),
          ytId: null,
          type: 'picker',
          pickerItems: data.picker,
        })
        setStatus('success')
      } else {
        setStatus('error')
        setErrorMsg('Unexpected response. This URL may not be supported.')
      }
    } catch (err) {
      setStatus('error')
      setErrorMsg('Network error — could not reach the server. Please refresh and try again.')
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleFetch()
  }

  function handlePaste(e) {
    // Auto-fetch on paste
    setTimeout(() => {
      const pasted = e.target.value.trim()
      if (pasted.startsWith('http')) handleFetch()
    }, 50)
  }

  return (
    <main className={styles.main}>
      {/* Header */}
      <header className={styles.header}>
        <span className={styles.logoDot} />
        <span className={styles.logoText}>Clipload</span>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.h1}>
          Download any <span className={styles.accent}>video</span><br />
          from anywhere
        </h1>
        <p className={styles.sub}>
          Paste a link from YouTube, TikTok, Instagram, Twitter and more.<br />
          Pick your quality — download instantly, no account needed.
        </p>
      </section>

      {/* Main card */}
      <div className={styles.card}>
        <div className={styles.inputRow}>
          <input
            ref={inputRef}
            className={styles.input}
            type="url"
            placeholder="Paste video URL here…"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            className={styles.fetchBtn}
            onClick={handleFetch}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? (
              <span className={styles.spinner} />
            ) : 'Fetch'}
          </button>
        </div>

        <div className={styles.optRow}>
          <div className={styles.optGroup}>
            <label className={styles.optLabel}>Quality</label>
            <select className={styles.select} value={quality} onChange={e => setQuality(e.target.value)}>
              <option value="max">Best available</option>
              <option value="2160">4K (2160p)</option>
              <option value="1440">1440p</option>
              <option value="1080">1080p</option>
              <option value="720">720p</option>
              <option value="480">480p</option>
              <option value="360">360p</option>
            </select>
          </div>
          <div className={styles.optGroup}>
            <label className={styles.optLabel}>Download as</label>
            <select className={styles.select} value={mode} onChange={e => setMode(e.target.value)}>
              <option value="auto">Video + Audio</option>
              <option value="audio">Audio only (MP3)</option>
              <option value="mute">Video only (no audio)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {status === 'error' && (
        <div className={styles.errorBox}>
          <span className={styles.errorIcon}>!</span>
          {errorMsg}
        </div>
      )}

      {/* Result */}
      {status === 'success' && result && (
        <div className={styles.resultCard}>
          <div className={styles.resultInner}>
            <div className={styles.thumb}>
              {result.ytId ? (
                <img
                  src={`https://img.youtube.com/vi/${result.ytId}/mqdefault.jpg`}
                  alt="thumbnail"
                  className={styles.thumbImg}
                />
              ) : (
                <div className={styles.thumbIcon}>▶</div>
              )}
            </div>
            <div className={styles.resultMeta}>
              <div className={styles.resultSite}>{result.site}</div>
              <div className={styles.resultFilename}>{result.filename}</div>

              {result.pickerItems ? (
                <div className={styles.pickerGrid}>
                  {result.pickerItems.map((item, i) => (
                    <a
                      key={i}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className={styles.dlBtnSmall}
                    >
                      ↓ Item {i + 1}
                    </a>
                  ))}
                </div>
              ) : (
                <a
                  href={result.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={result.filename}
                  className={styles.dlBtn}
                >
                  ↓ Download
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Supported platforms */}
      <div className={styles.platforms}>
        <p className={styles.platformsLabel}>Supported platforms</p>
        <div className={styles.tags}>
          {PLATFORMS.map(p => (
            <span key={p} className={styles.tag}>{p}</span>
          ))}
        </div>
      </div>

      <footer className={styles.footer}>
        Powered by <a href="https://cobalt.tools" target="_blank" rel="noopener noreferrer">cobalt.tools</a> open-source API.
        Only download content you have the right to. Respect copyright and platform terms.
      </footer>
    </main>
  )
}
