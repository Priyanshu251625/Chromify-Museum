
import { useEffect, useRef, useState } from 'react'
import { Streamlit } from 'streamlit-component-lib'
import {
  Aperture,
  ArrowDownToLine,
  Check,
  ImagePlus,
  LoaderCircle,
  RotateCcw,
  ShieldCheck,
  Upload,
  X
} from 'lucide-react'

const ACCEPT = 'image/png,image/jpeg,image/webp,image/bmp'
const MAX_FILE_SIZE = 16 * 1024 * 1024

export default function App({ args = {} }) {
  const inputRef = useRef(null)

  const [file, setFile] = useState(null)
  const [originalUrl, setOriginalUrl] = useState('')
  const [resultUrl, setResultUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [apiState, setApiState] = useState('checking')

  // Receive updates from Streamlit.
  
// Receive updates from Streamlit.
useEffect(() => {
  if (
    args.status === 'idle' ||
    args.status === 'ready' ||
    args.status === 'success'
  ) {
    setApiState('ready')
    setBusy(false)
    setError('')
  }

  if (args.status === 'processing') {
    setApiState('ready')
    setBusy(true)
  }

  if (args.status === 'error') {
    setApiState('ready')
    setBusy(false)
    setError(args.error || 'Colorization could not be completed.')
  }

  if (args.result) {
    setResultUrl(args.result)
    setBusy(false)
    setError('')
  }
}, [args.status, args.result, args.error])


  // Release local preview URLs when they are replaced.
  useEffect(() => {
    return () => {
      if (originalUrl.startsWith('blob:')) {
        URL.revokeObjectURL(originalUrl)
      }
    }
  }, [originalUrl])

  useEffect(() => {
    return () => {
      if (resultUrl.startsWith('blob:')) {
        URL.revokeObjectURL(resultUrl)
      }
    }
  }, [resultUrl])

  // Select and validate an image.
  function chooseImage(nextFile) {
    if (!nextFile) return

    if (!nextFile.type.startsWith('image/')) {
      setError('Please select a valid image file.')
      return
    }

    if (nextFile.size > MAX_FILE_SIZE) {
      setError('Please choose an image smaller than 16 MB.')
      return
    }

    setError('')
    setFile(nextFile)
    setOriginalUrl(URL.createObjectURL(nextFile))
    setResultUrl('')
    setBusy(false)
  }

  // Send the image to the Python Streamlit application.
  async function runColorization() {
    if (!file) {
      setError('Choose a photograph before beginning restoration.')
      return
    }

    setBusy(true)
    setError('')
    setResultUrl('')

    try {
      const reader = new FileReader()

      reader.onload = () => {
        try {
          const dataUrl = reader.result
          const imageBase64 = dataUrl.split(',')[1]

          if (!imageBase64) {
            throw new Error('Could not encode the selected photograph.')
          }

          Streamlit.setComponentValue({
            action: 'colorize',
            requestId: `${Date.now()}-${Math.random()}`,
            filename: file.name,
            imageBase64
          })
        } catch (err) {
          setBusy(false)
          setError(err.message || 'Could not submit the photograph.')
        }
      }

      reader.onerror = () => {
        setBusy(false)
        setError('Could not read the selected photograph.')
      }

      reader.readAsDataURL(file)

    } catch (err) {
      setBusy(false)
      setError(err.message || 'Could not submit the photograph.')
    }
  }

  // Reset the studio.
  function reset() {
    setFile(null)
    setError('')
    setOriginalUrl('')
    setResultUrl('')
    setBusy(false)

    if (inputRef.current) {
      inputRef.current.value = ''
    }

    Streamlit.setComponentValue({
      action: 'reset',
      requestId: `${Date.now()}-${Math.random()}`
    })
  }

  // Download the restored image.
  function download() {
    if (!resultUrl) return

    const a = document.createElement('a')
    a.href = resultUrl
    a.download = 'chromify-restored.png'

    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  return (
    <div className="app-shell">

      {/* Header */}
      <header className="topbar">
        <a className="brand" href="#">
          <Aperture size={21} strokeWidth={1.35} />
          <span>CHROMIFY</span>
        </a>

        <nav>
          <a className="nav-active" href="#studio">The studio</a>
          <a href="#process">The process</a>
        </nav>

        <div className="top-right">
          <span className={`status-dot ${apiState === 'ready' ? 'online' : ''}`} />
          <span>
            {apiState === 'ready' ? 'Studio open' : 'Preparing studio'}
          </span>
        </div>
      </header>

      <main>

        {/* Hero */}
        <section className="hero">
          <div className="hero-index">
            AN IMAGE RESTORATION ATELIER
            <span>— EST. 2026</span>
          </div>

          <h1>
            Every photograph<br />
            holds a <i>memory.</i>
          </h1>

          <p>
            Time may soften a photograph, but it need not take its color.
            <br className="desktop-break" />
            Bring a monochrome moment into a new light.
          </p>

          <div className="hero-rule">
            <span>01</span>
            <span>THE ART OF REMEMBERING</span>
            <span>01 / 03</span>
          </div>
        </section>

        {/* Restoration Studio */}
        <section className="studio-card" id="studio">

          <div className="studio-head">
            <div>
              <div className="section-kicker">
                THE RESTORATION ROOM
              </div>
              <h2>Begin with a photograph</h2>
            </div>

            <div className="private-note">
              <ShieldCheck size={14} />
              Your image is processed by this hosted studio
            </div>
          </div>

          {!file ? (

            /* Upload Area */
            <button
              className="dropzone"
              onClick={() => inputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault()
                chooseImage(e.dataTransfer.files?.[0])
              }}
            >
              <span className="upload-mark">
                <Upload size={22} strokeWidth={1.25} />
              </span>

              <span className="drop-title">
                Place a photograph here
              </span>

              <span className="drop-sub">
                Drag an image into this space, or browse your collection.
              </span>

              <span className="browse-btn">
                Select photograph <span>↗</span>
              </span>

              <span className="file-hint">
                JPG · PNG · WEBP · BMP &nbsp; / &nbsp; MAX 16 MB
              </span>
            </button>

          ) : (

            /* Original and Restored Images */
            <div className="preview-grid">

              <div className="preview-panel">
                <div className="preview-label">
                  <span>PLATE I</span>
                  ORIGINAL
                  <em>MONOCHROME</em>
                </div>

                <div className="image-frame">
                  <img
                    src={originalUrl}
                    alt="Original uploaded photograph"
                  />
                </div>

                <div className="image-meta">
                  <span className="truncate">{file.name}</span>
                  <span>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>

              <div className="preview-panel">
                <div className="preview-label">
                  <span>PLATE II</span>
                  RESTORED
                  <em>{resultUrl ? 'COMPLETE' : 'IN WAITING'}</em>
                </div>

                <div
                  className={`image-frame result-frame ${
                    !resultUrl ? 'empty-result' : ''
                  }`}
                >
                  {resultUrl ? (
                    <img
                      src={resultUrl}
                      alt="Colorized photograph"
                    />
                  ) : (
                    <div className="result-placeholder">
                      <span>II</span>
                      <strong>The restored photograph</strong>
                      <small>Its color will appear here</small>
                    </div>
                  )}

                  {busy && (
                    <div className="processing">
                      <LoaderCircle className="spin" size={26} />
                      <strong>Restoration in progress</strong>
                      <small>Please allow a moment</small>
                    </div>
                  )}
                </div>

                <div className="image-meta">
                  <span>
                    {resultUrl ? 'Ready to keep' : 'Awaiting restoration'}
                  </span>
                  <span>
                    {resultUrl ? <Check size={14} /> : '—'}
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="error-banner">
              <X size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-row">

            <button
              className="btn-secondary"
              onClick={() => inputRef.current?.click()}
            >
              <ImagePlus size={15} />
              {file ? 'Choose another' : 'Choose photograph'}
            </button>

            <div className="action-spacer" />

            {file && (
              <button className="btn-ghost" onClick={reset}>
                <RotateCcw size={14} />
                Clear
              </button>
            )}

            <button
              className="btn-primary"
              onClick={runColorization}
              disabled={!file || busy || apiState !== 'ready'}
            >
              {busy ? (
                <>
                  <LoaderCircle className="spin" size={15} />
                  Restoring…
                </>
              ) : (
                <>
                  Begin restoration <span>↗</span>
                </>
              )}
            </button>

            {resultUrl && (
              <button
                className="btn-download"
                onClick={download}
              >
                <ArrowDownToLine size={15} />
                Save image
              </button>
            )}

          </div>

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            hidden
            onChange={e => {
              chooseImage(e.target.files?.[0])
              e.target.value = ''
            }}
          />

        </section>

        {/* Process Section */}
        <section className="process" id="process">

          <div className="process-heading">
            <span>FROM MONOCHROME TO MEMORY</span>
            <span>THE METHOD</span>
          </div>

          <div className="steps">

            <div className="step">
              <span className="step-no">01</span>
              <div>
                <strong>Choose an image</strong>
                <p>
                  Begin with a black and white photograph from your collection.
                </p>
              </div>
            </div>

            <div className="step">
              <span className="step-no">02</span>
              <div>
                <strong>Restore its tones</strong>
                <p>
                  A trained colorization model proposes a natural palette.
                </p>
              </div>
            </div>

            <div className="step">
              <span className="step-no">03</span>
              <div>
                <strong>Keep the moment</strong>
                <p>
                  Save the finished image and give the memory a new life.
                </p>
              </div>
            </div>

          </div>
        </section>

        <div className="disclaimer">
          <ShieldCheck size={13} />
          Color is interpreted by a machine-learning model; it is an artistic
          estimate, not a record of historically exact colors.
        </div>

      </main>

      {/* Footer */}
      <footer>
        <span>© 2026 CHROMIFY — IMAGE RESTORATION ATELIER</span>
        <span>MADE FOR THE MEMORIES WE KEEP</span>
      </footer>

    </div>
  )
}
