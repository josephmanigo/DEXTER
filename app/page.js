'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Sparkles, CheckCircle, Image as ImageIcon, ArrowRight, Zap, Layers, Cpu, Compass } from 'lucide-react';

export default function Home() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [view, setView] = useState('hero'); // 'hero' or 'synthesis'
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY && currentScrollY > 20) {
          setShowNav(false);
        } else {
          setShowNav(true);
        }
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleManualFileUpdate = (event) => {
    try {
      const targetInput = (event && event.target && event.target.files) ? event.target : fileInputRef.current;
      if (!targetInput || !targetInput.files || targetInput.files.length === 0) return;

      const selectedFile = targetInput.files[0];
      setImage(selectedFile);

      const fileReader = new FileReader();
      fileReader.onloadend = () => setPreview(fileReader.result);
      fileReader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error("DEXTER Error:", error);
    }
  };

  const generateProfile = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', image);
      const response = await fetch('/api/generate', { method: 'POST', body: formData });
      const result = await response.json();
      if (result.success) {
        setResults(result.data);
      } else {
        alert("System error: " + (result.error || "Please try again"));
      }
    } catch (e) {
      alert("Synthesis failed. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  const resetToHero = () => {
    setView('hero');
    setResults(null);
    setPreview(null);
    setImage(null);
  };

  return (
    <div className="page-wrapper">
      {/* Navigation */}
      <nav className={`nav-bar glass ${!showNav ? 'nav-hidden' : ''}`}>
        <div className="nav-container">
          <div className="logo-group" onClick={resetToHero} style={{ cursor: 'pointer' }}>
            <span className="logo-title">DEXTER</span>
          </div>
          <button className="btn-3d btn-secondary-3d nav-btn">Enterprise</button>
        </div>
      </nav>

      {/* Main Views */}
      {view === 'hero' ? (
        <section className="hero-section container">
          <div className="hero-content-wrapper">
            <div className="hero-text slide-up">
              <h1 className="hero-heading">
                Forge Your <br />
                <span className="gradient-text">3D Digital Life.</span>
              </h1>
              <p className="hero-subtext">
                Optimize your social presence with Gemini 3 Pro. One portrait generates 6 high-conversion personas for the 2026 dating ecosystem.
              </p>
              <button
                className="btn-3d btn-primary-3d hero-btn"
                onClick={() => setView('synthesis')}
              >
                Initialize Avatar <ArrowRight size={20} />
              </button>
            </div>

            <div className="hero-visual animate-float">
              <div className="visual-card-3d glass">
                <div className="core-orb"></div>
                <div className="status-bars">
                  <div className="status-item"><Cpu size={14} /> System: Active</div>
                  <div className="status-item"><Layers size={14} /> Neural: Online</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <main id="synthesis-center" className="main-center container slide-up">
          {!results ? (
            <div className="synthesis-box">
              <div className={`upload-panel glass ${preview ? 'is-preview' : ''}`}>
                {!preview ? (
                  <div className="upload-trigger" onClick={() => fileInputRef.current.click()}>
                    <div className="trigger-orb"><Camera size={36} /></div>
                    <h3 className="trigger-title">Input Surface Data</h3>
                    <p className="trigger-desc">Upload a clear portrait to begin synthesis</p>
                    <button className="btn-3d btn-secondary-3d">
                      <Upload size={18} /> Select Source
                    </button>
                  </div>
                ) : (
                  <div className="preview-stage">
                    <img src={preview} alt="Input" className="main-preview" />
                    <div className="preview-controls">
                      <button className="btn-3d btn-primary-3d action-btn animate-glow" onClick={generateProfile} disabled={loading}>
                        {loading ? "Processing..." : <><Sparkles size={18} /> Execute Synthesis</>}
                      </button>
                      <button className="btn-3d btn-secondary-3d reset-btn" onClick={() => { setPreview(null); setImage(null); }} disabled={loading}>
                        Reset
                      </button>
                    </div>
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleManualFileUpdate} hidden accept="image/*" />
              </div>
            </div>
          ) : (
            <div id="results-view" className="results-panel">
              <div className="panel-header">
                <h2 className="gradient-text">Synthesis Complete</h2>
                <button className="btn-3d btn-secondary-3d" onClick={() => { setResults(null); setPreview(null); setImage(null); }}>New Avatar</button>
              </div>

              <div className="panel-body">
                <div className="panel-column">
                  <div className="column-head"><Compass size={18} /> Social Blueprints</div>
                  {results.prompts.map((p, i) => (
                    <div key={i} className="blueprint-card glass">
                      <span className="blueprint-vibe">{p.vibe}</span>
                      <h4>{p.question}</h4>
                      <p>{p.answer}</p>
                    </div>
                  ))}
                </div>

                <div className="panel-column">
                  <div className="column-head"><ImageIcon size={18} /> Identity Projections</div>
                  {results.photos.map((photo, i) => (
                    <div key={i} className="projection-card glass">
                      <img src={photo.url} alt={photo.style} />
                      <div className="projection-label"><CheckCircle size={14} /> {photo.style}</div>
                      <div className="projection-hover">
                        <p>{photo.prompt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      <footer className="main-footer">
        <p>&copy; 2026 DEXTER AI • ALL RIGHTS RESERVED</p>
      </footer>

      <style jsx>{`
        .page-wrapper {
          min-height: 100vh;
          background: var(--background);
          padding-top: 100px;
          display: flex;
          flex-direction: column;
        }

        .gradient-text {
          background: linear-gradient(135deg, #FFF, var(--primary), var(--secondary));
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Nav */
        .nav-bar {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 40px);
          max-width: 1200px;
          height: 64px;
          border-radius: 20px;
          padding: 0 24px;
          z-index: 1000;
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), top 0.8s ease;
        }

        .nav-hidden {
          top: -100px !important;
        }

        .nav-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 100%;
        }

        .logo-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-title {
          font-weight: 800;
          font-size: 18px;
          letter-spacing: -0.5px;
          color: #FFFFFF;
          background: linear-gradient(to right, #FFF, #A78BFA);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .nav-btn { padding: 8px 16px !important; font-size: 10px !important; }

        /* Hero */
        .hero-section { 
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 60px;
        }
        .hero-content-wrapper { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 80px; align-items: center; width: 100%; }
        
        .hero-heading { font-size: 72px; font-weight: 800; line-height: 1.1; margin-bottom: 24px; letter-spacing: -2px; }
        .hero-subtext { font-size: 18px; color: var(--text-muted); margin-bottom: 40px; }

        .visual-card-3d {
          height: 420px;
          border-radius: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          box-shadow: var(--shadow-3d);
          position: relative;
        }

        .core-orb {
          width: 160px;
          height: 160px;
          background: radial-gradient(circle at 30% 30%, var(--primary), var(--secondary));
          border-radius: 50%;
          filter: blur(1px);
          box-shadow: 0 0 60px var(--primary-glow), inset -10px -10px 20px rgba(0,0,0,0.5);
          position: relative;
        }

        .core-orb::before {
          content: '';
          position: absolute;
          inset: -20px;
          border: 1px dashed rgba(255,255,255,0.1);
          border-radius: 50%;
          animation: rotate 20s linear infinite;
        }

        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .status-bars { width: 100%; margin-top: 50px; display: flex; flex-direction: column; gap: 12px; }
        .status-item {
          background: rgba(0,0,0,0.4);
          padding: 10px 20px;
          border-radius: 12px;
          font-size: 12px;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 12px;
          border-left: 3px solid var(--primary);
        }

        /* Synthesis Center */
        .main-center { flex: 1; padding: 40px 24px; }
        .synthesis-box { max-width: 900px; margin: 0 auto; }
        .upload-panel { min-height: 480px; border-radius: 32px; display: flex; align-items: center; justify-content: center; padding: 60px; transition: all 0.5s ease; }
        
        .upload-trigger { text-align: center; cursor: pointer; }
        .trigger-orb {
          width: 110px;
          height: 110px;
          margin: 0 auto 30px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          transition: all 0.3s ease;
        }

        .upload-trigger:hover .trigger-orb { transform: scale(1.1); background: rgba(139, 92, 246, 0.1); color: #FFF; }
        .trigger-title { font-size: 24px; margin-bottom: 8px; }
        .trigger-desc { opacity: 0.6; margin-bottom: 40px; }

        .preview-stage { width: 100%; display: flex; flex-direction: column; align-items: center; }
        .main-preview { max-width: 100%; max-height: 400px; border-radius: 20px; object-fit: contain; }
        .preview-controls { margin-top: 40px; display: flex; gap: 20px; }

        /* Results Panel */
        .results-panel { width: 100%; }
        .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 60px; }
        .panel-header h2 { font-size: 48px; font-weight: 800; }

        .panel-body { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .column-head { font-size: 13px; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 2.5px; margin-bottom: 30px; display: flex; align-items: center; gap: 12px; padding-bottom: 15px; border-bottom: 1px solid var(--glass-border); }
        .panel-column { display: flex; flex-direction: column; gap: 24px; }

        .blueprint-card { padding: 30px; border-radius: 20px; position: relative; transition: all 0.3s ease; }
        .blueprint-card:hover { transform: translateX(10px); background: rgba(255,255,255,0.05); }
        .blueprint-vibe { position: absolute; top: 20px; right: 20px; font-size: 9px; font-weight: 800; background: var(--primary); color: white; padding: 2px 10px; border-radius: 100px; text-transform: uppercase; }
        .blueprint-card h4 { font-size: 18px; margin-bottom: 12px; color: var(--primary-light); }
        .blueprint-card p { font-size: 15px; opacity: 0.7; }

        .projection-card { height: 380px; border-radius: 24px; position: relative; overflow: hidden; }
        .projection-card img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
        .projection-card:hover img { transform: scale(1.1); }
        .projection-label { position: absolute; bottom: 20px; left: 20px; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); padding: 8px 16px; border-radius: 10px; font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 8px; border: 1px solid var(--glass-border); }
        .projection-hover { position: absolute; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; padding: 40px; text-align: center; opacity: 0; transition: opacity 0.3s ease; font-size: 13px; line-height: 1.6; }
        .projection-card:hover .projection-hover { opacity: 1; }

        .main-footer { padding: 40px 0; border-top: 1px solid var(--glass-border); text-align: center; font-size: 11px; letter-spacing: 2px; color: var(--text-muted); opacity: 0.5; }

        @media (max-width: 968px) {
          .hero-content-wrapper { grid-template-columns: 1fr; text-align: center; gap: 40px; }
          .hero-heading { font-size: 48px; }
          .hero-text { display: flex; flex-direction: column; align-items: center; }
          .panel-body { grid-template-columns: 1fr; }
          .nav-bar { width: calc(100% - 20px); top: 10px; }
        }
      `}</style>
    </div>
  );
}
