import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'
import './App.css' // Keep your existing CSS import if you have one, or reliance on the styles below

gsap.registerPlugin(ScrollTrigger)

function App() {
  const [attempt, setAttempt] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [letters, setLetters] = useState([])
  const [inView, setInView] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  
  const carouselImages = ['/images/img1.jpeg', '/images/img2.jpeg', '/images/img3.jpeg', '/images/img4.jpeg', '/images/img5.jpeg', '/images/img6.jpeg']
  
  const lenisRef = useRef(null)
  const puzzleContainerRef = useRef(null)
  const winMessageRef = useRef(null)
  const aboutUnderlineRef = useRef(null)
  
  const targetWord = 'MASSON'
  const allLetters = ['M','A','S','S','O','N','X','Y','Z']

  // --- Initialization ---

  // Initialize Puzzle
  useEffect(() => {
    shufflePuzzle()
  }, [])

  // Initialize Lenis Smooth Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      smooth: true,
    })
    lenisRef.current = lenis

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => lenis.destroy()
  }, [])

  // Loader: simple initial unveiling screen
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1400)
    return () => clearTimeout(t)
  }, [])

  // Carousel autoplay
  useEffect(() => {
    if (isPaused) return undefined
    const id = setInterval(() => {
      setCurrentImageIndex((i) => (i + 1) % carouselImages.length)
    }, 3800)
    return () => clearInterval(id)
  }, [isPaused])

  // --- Animations (GSAP) ---
  useEffect(() => {
    // Progress Bar
    gsap.to("#progress-bar", {
      width: "100%",
      ease: "none",
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 0
      }
    })

    // Hero Parallax & Fade
    gsap.to("#hero-content", {
      y: 100,
      opacity: 0,
      ease: "power1.in",
      scrollTrigger: {
        trigger: "section:first-child",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    })

    // Text Reveal
    gsap.from("#text-reveal", {
      y: 30,
      opacity: 0,
      duration: 1,
      clearProps: 'all',
      scrollTrigger: {
        trigger: "#text-reveal",
        start: "top 90%",
      }
    })

    // About Underline Animation
    ScrollTrigger.create({
      trigger: '#about',
      start: 'top 75%',
      onEnter: () => setInView(true),
      onLeaveBack: () => setInView(false)
    })

    // Highlights Cards Entrance
    gsap.from('#highlights .grid > div', {
      y: 24,
      opacity: 0,
      duration: 0.9,
      stagger: 0.12,
      ease: 'power2.out',
      clearProps: 'all',
      scrollTrigger: { trigger: '#highlights', start: 'top 80%' }
    })

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  // Handle ESC key for modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && modalOpen) closeModal()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [modalOpen])

  // Carousel auto-advance
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // --- Logic ---

  const shufflePuzzle = () => {
    const shuffled = [...allLetters].sort(() => Math.random() - 0.5)
    setLetters(shuffled)
    setAttempt('')
    setUnlocked(false)
    // Reset win message visibility if needed
    if (winMessageRef.current) {
        gsap.set(winMessageRef.current, { autoAlpha: 0, scale: 1 })
    }
  }

  const onLetterClick = (ch, index, e) => {
    if (unlocked) return

    // Visual feedback
    const btn = e.currentTarget
    btn.style.transform = 'scale(0.95)'
    btn.classList.add('opacity-70')
    setTimeout(() => {
        btn.style.transform = ''
        btn.classList.remove('opacity-70')
    }, 120)

    const newAttempt = attempt + ch

    if (!targetWord.startsWith(newAttempt)) {
      // Wrong sequence logic
      setAttempt('')
      if (puzzleContainerRef.current) {
        gsap.from(puzzleContainerRef.current, { x: -8, duration: 0.08, repeat: 3, yoyo: true })
      }
      return
    }

    setAttempt(newAttempt)

    if (newAttempt === targetWord) {
      setUnlocked(true)
      // Show win message
      if (winMessageRef.current) {
          gsap.to(winMessageRef.current, { autoAlpha: 1, scale: 1.02, duration: 0.8, ease: 'power2.out' })
      }
      // Open modal after delay
      setTimeout(() => {
        openModal()
      }, 900)
    }
  }

  const openModal = () => {
    setModalOpen(true)
    if (lenisRef.current) lenisRef.current.stop()
  }

  const closeModal = () => {
    setModalOpen(false)
    if (lenisRef.current) lenisRef.current.start()
  }

  return (
    <div className="bg-[#020617] text-white selection:bg-blue-500 selection:text-white min-h-screen font-sans">
      {/* Injecting Styles directly to match HTML implementation */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=Syne:wght@400;700;800&display=swap');
        
        :root {
          --font-display: 'Syne', sans-serif;
          --font-sans: 'Inter', sans-serif;
        }
        
        .font-display { font-family: var(--font-display); }
        .font-sans { font-family: var(--font-sans); }

        /* Custom Utilities */
        .text-stroke {
          -webkit-text-stroke: 1px rgba(59, 130, 246, 0.3);
          color: transparent;
        }
        .text-stroke-sm {
          -webkit-text-stroke: 0.5px rgba(59, 130, 246, 0.3);
        }
        .noise-bg {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
        }

        /* Puzzle Styles */
        .tile {
          background-image: url('image_a20c80.png'); /* Ensure this image is in your public folder */
          background-size: 300% 300%;
          background-color: rgba(30, 58, 138, 0.5); /* Fallback color */
          cursor: pointer;
          border-radius: 4px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .tile:hover {
          z-index: 10;
          transform: scale(1.02);
          box-shadow: 0 0 15px rgba(37, 99, 235, 0.4);
        }

        /* Navbar */
        .nav-backdrop { background: linear-gradient(90deg, rgba(3,7,18,0.6), rgba(2,6,23,0.4)); backdrop-filter: blur(6px); }

        /* About underline */
        .underline-anim {
          position: relative;
          display: inline-block;
        }
        .underline-anim::after {
          content: '';
          position: absolute;
          left: 0; bottom: -6px;
          height: 4px; width: 0;
          background: linear-gradient(90deg,#60a5fa,#3b82f6,#93c5fd);
          transition: width 0.7s cubic-bezier(.2,.9,.2,1);
          border-radius: 4px;
          box-shadow: 0 6px 20px rgba(59,130,246,0.18);
        }
        .underline-anim.in-view::after { width: 100%; }

        /* Glass cards */
        .glass-card {
          background: rgba(255,255,255,0.04);
          border-radius: 14px;
          padding: 28px;
          border: 1px solid rgba(59,130,246,0.15);
          backdrop-filter: blur(8px);
          transition: transform 0.35s ease, box-shadow 0.35s ease;
          position: relative;
        }
        .glass-card:hover { transform: translateY(-8px); box-shadow: 0 20px 60px rgba(59,130,246,0.12); }

        /* CTA Background */
        .cta-hero { background: linear-gradient(120deg, rgba(14,165,233,0.06), rgba(59,130,246,0.06)); }
        .moving-bg { background: linear-gradient(90deg,#0ea5e9,#3b82f6,#60a5fa); background-size: 200% 200%; animation: moveBg 8s linear infinite; }
        @keyframes moveBg { 0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%} }
      `}</style>

          {/* Progress Bar */}
      <div id="progress-bar" className="fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-white z-50 w-0 shadow-[0_0_20px_rgba(37,99,235,0.8)]"></div>

          {/* Loader / Unveiling screen */}
          {loading && (
            <div className="site-loader fixed inset-0 z-[120] flex items-center justify-center">
              <div className="loader-inner flex flex-col items-center gap-4">
                <img src="/images/logo.png" alt="Masson logo" className="w-20 h-20 rounded-full object-cover logo-pop" />
                <div className="text-blue-300 tracking-widest text-sm logo-text">M A S S O N</div>
              </div>
            </div>
          )}

      {/* Navbar */}
      <nav className="fixed w-full z-40 top-4 px-4 md:px-8">
        <div className="max-w-7xl mx-auto nav-backdrop border border-white/6 rounded-2xl md:rounded-full">
        <div className="flex items-center justify-between py-2 px-4">
          <a href="#" className="flex items-center gap-3 text-white no-underline">
            <img src="/images/logo.png" alt="Masson House" className="w-9 h-9 rounded-full object-cover" />
            <div className="font-display font-bold tracking-tight">Masson House</div>
          </a>
          <div className="hidden md:flex items-center gap-6 text-sm text-blue-100/70">
            <a href="#game-section" className="hover:text-white transition-colors">Cipher</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#highlights" className="hover:text-white transition-colors">Highlights</a>
            <a href="#final-cta" className="hover:text-white transition-colors">Watch</a>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden text-blue-200/90 hover:text-white transition-colors flex flex-col gap-1 w-6 h-5 justify-center"
            aria-label="Toggle menu"
          >
            <span className={`block h-0.5 w-full bg-current transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
            <span className={`block h-0.5 w-full bg-current transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block h-0.5 w-full bg-current transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 py-4 px-4 bg-gray-900/95 backdrop-blur-xl border-t border-white/10 rounded-b-2xl">
            <div className="flex flex-col gap-3">
              <a 
                href="#game-section" 
                className="text-blue-100/70 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Cipher
              </a>
              <a 
                href="#about" 
                className="text-blue-100/70 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </a>
              <a 
                href="#highlights" 
                className="text-blue-100/70 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Highlights
              </a>
              <a 
                href="#final-cta" 
                className="text-blue-100/70 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Watch
              </a>
            </div>
          </div>
        )}
        </div>
      </nav>

      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 noise-bg opacity-30"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-blue-600/10 blur-[100px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] bg-indigo-900/20 blur-[120px] rounded-full"></div>
      </div>

      <main>
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center relative z-10 py-20">
          <div id="hero-content" className="text-center relative px-4 w-full max-w-7xl mx-auto flex flex-col items-center overflow-visible">
            <div className="text-blue-400 font-medium tracking-[0.3em] uppercase mb-6 text-xs md:text-sm border border-blue-500/20 px-4 py-2 rounded-full backdrop-blur-sm">
              Ave Maria Convent • Sports Meet 2026
            </div>
            
              <h1 className="font-display text-[clamp(2.5rem,10vw,10rem)] md:text-[clamp(4rem,12vw,11rem)] leading-[0.85] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-blue-900 drop-shadow-2xl select-none w-full pr-4 pb-2 mx-auto">
              MASSON
            </h1>
            
            <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent w-full max-w-2xl my-10 opacity-50"></div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <span className="px-6 py-2 border border-blue-500/30 bg-blue-900/10 rounded-full text-blue-200 text-[10px] md:text-xs uppercase tracking-[0.2em] backdrop-blur-md hover:bg-blue-500/20 transition-colors cursor-default">
                House of Blue
              </span>
              <span className="px-6 py-2 border border-blue-500/30 bg-blue-900/10 rounded-full text-blue-200 text-[10px] md:text-xs uppercase tracking-[0.2em] backdrop-blur-md hover:bg-blue-500/20 transition-colors cursor-default">
                The Legacy
              </span>
            </div>
          </div>

          <div className="absolute bottom-8 animate-bounce opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
              <path d="M12 5v14M19 12l-7 7-7-7"/>
            </svg>
          </div>
        </section>

        {/* Marquee Section */}
        <section className="py-16 md:py-24 relative z-10 border-y border-blue-500/20 backdrop-blur-sm bg-gradient-to-r from-blue-950/30 via-blue-900/20 to-blue-950/30 overflow-hidden">
          <div className="marquee-container">
            <div className="marquee-content flex gap-8 text-6xl md:text-9xl font-display font-black whitespace-nowrap px-4 select-none">
              <span className="text-blue-400/60">SPEED</span> <span className="text-blue-300/40">•</span>
              <span className="text-blue-400/60">STRENGTH</span> <span className="text-blue-300/40">•</span>
              <span className="text-blue-400/60">SPIRIT</span> <span className="text-blue-300/40">•</span>
              <span className="text-blue-500/70">MASSON</span> <span className="text-blue-300/40">•</span>
              <span className="text-blue-400/60">SPEED</span> <span className="text-blue-300/40">•</span>
              <span className="text-blue-400/60">STRENGTH</span> <span className="text-blue-300/40">•</span>
              <span className="text-blue-400/60">SPIRIT</span> <span className="text-blue-300/40">•</span>
              <span className="text-blue-500/70">MASSON</span> <span className="text-blue-300/40">•</span>
              {/* Duplicate for seamless loop */}
              <span className="text-blue-400/60">SPEED</span> <span className="text-blue-300/40">•</span>
              <span className="text-blue-400/60">STRENGTH</span> <span className="text-blue-300/40">•</span>
              <span className="text-blue-400/60">SPIRIT</span> <span className="text-blue-300/40">•</span>
              <span className="text-blue-500/70">MASSON</span> <span className="text-blue-300/40">•</span>
              <span className="text-blue-400/60">SPEED</span> <span className="text-blue-300/40">•</span>
              <span className="text-blue-400/60">STRENGTH</span> <span className="text-blue-300/40">•</span>
              <span className="text-blue-400/60">SPIRIT</span> <span className="text-blue-300/40">•</span>
              <span className="text-blue-500/70">MASSON</span> <span className="text-blue-300/40">•</span>
            </div>
          </div>
        </section>

        {/* Cipher Section */}
        <section className="min-h-screen flex items-center justify-center relative z-10 px-4 py-20 md:py-32" id="game-section">
          <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            <div className="space-y-6 md:space-y-8 text-center lg:text-left order-1" id="text-reveal" style={{display: 'block', visibility: 'visible', opacity: 1}}>
              <h2 className="font-display text-3xl md:text-6xl font-bold leading-[0.9]">
                UNLOCK THE <br />
                <span className="text-blue-500 drop-shadow-[0_0_20px_rgba(37,99,235,0.4)]">LEGACY.</span>
              </h2>
              <p className="text-gray-400 text-sm md:text-lg max-w-md mx-auto lg:mx-0 font-light leading-relaxed">
                The premiere film is locked. Solve the visual cipher to verify your House of Blue status and access the exclusive content.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <div className="flex items-center gap-2 text-blue-400 text-xs font-mono uppercase tracking-widest">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </span>
                  System Online
                </div>
                <div className="hidden sm:block text-gray-700">|</div>
                <div className="text-gray-500 text-xs font-mono uppercase tracking-widest">
                  Difficulty: Recruit
                </div>
              </div>
            </div>

            <div className="relative group order-2">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              
              <div className="relative bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-mono text-blue-300">SECURITY_LAYER_01</h3>
                  <button 
                    onClick={shufflePuzzle} 
                    className="text-xs text-gray-400 hover:text-white underline decoration-blue-500 decoration-2 underline-offset-4 transition-colors"
                  >
                    RESET CIPHER
                  </button>
                </div>

                <div 
                  ref={puzzleContainerRef}
                  className="grid grid-cols-3 gap-[2px] w-full max-w-[400px] aspect-square mx-auto bg-blue-600/10 border border-white/10 rounded-xl p-2 relative"
                >
                  {letters.map((ch, i) => (
                    <button
                      key={i}
                      onClick={(e) => onLetterClick(ch, i, e)}
                      className="tile flex items-center justify-center text-2xl font-bold select-none text-white h-[64px]"
                    >
                      {ch}
                    </button>
                  ))}
                  <div className="text-xs text-gray-400 font-mono col-span-3 mt-3 text-center">
                    Tap letters in order to spell MASSON — complete to unlock the video
                  </div>

                  {/* Win Message Overlay */}
                  <div 
                    ref={winMessageRef}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-xl opacity-0 invisible"
                  >
                    <div className="text-blue-500 font-display text-4xl font-bold mb-2 animate-bounce">UNLOCKED</div>
                    <p className="text-white/60 text-xs font-mono">LOADING VIDEO DATA...</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 md:py-28 relative z-10">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-4">
            <div className="lg:pr-8 text-center lg:text-left">
              <h3 className="font-display text-4xl md:text-6xl font-extrabold leading-tight">At Ave Maria Convent,</h3>
              <h4 className="font-display text-3xl md:text-5xl font-bold text-blue-400 leading-tight mt-2">Masson House stands for resilience, discipline, and unstoppable energy.</h4>
              <p className="mt-6 text-gray-400 max-w-lg">The House that trains, inspires and raises athletes who carry forward tradition and fierce sportsmanship.</p>
              <div className="mt-6">
                <span ref={aboutUnderlineRef} className={`underline-anim ${inView ? 'in-view' : ''}`}>Our Spirit</span>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="w-full max-w-md rounded-xl overflow-hidden bg-gradient-to-br from-black/40 to-black/20 border border-blue-500/20 p-2 relative">
                <div
                  className="aspect-video rounded-lg relative overflow-hidden"
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                >
                  {carouselImages.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Masson House ${index + 1}`}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                        index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  ))}

                  {/* Prev / Next Controls */}
                  <button
                    onClick={() => setCurrentImageIndex((currentImageIndex - 1 + carouselImages.length) % carouselImages.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-9 h-9 flex items-center justify-center shadow-md"
                    aria-label="Previous"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((currentImageIndex + 1) % carouselImages.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-9 h-9 flex items-center justify-center shadow-md"
                    aria-label="Next"
                  >
                    ›
                  </button>

                  {/* Indicators */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                    {carouselImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`w-2 h-2 rounded-full ${i === currentImageIndex ? 'bg-white' : 'bg-white/30'}`}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
                {/* Carousel Indicators */}
                <div className="flex justify-center gap-2 mt-3">
                  {carouselImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex 
                          ? 'bg-blue-400 w-8' 
                          : 'bg-blue-400/30 hover:bg-blue-400/50'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Highlights Section */}
        <section id="highlights" className="py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-10">
              <h3 className="font-display text-3xl md:text-4xl font-bold">Highlights</h3>
              <p className="text-gray-400 mt-2">The pillars that define Masson.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white/[0.04] rounded-[14px] p-7 border border-blue-500/15 backdrop-blur-lg flex flex-col items-start gap-4 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(59,130,246,0.12)] transition-all duration-300">
                <div className="text-blue-300 font-bold text-lg">Speed</div>
                <p className="text-gray-400 text-sm">Reflexes and quickness on the track.</p>
              </div>
              <div className="bg-white/[0.04] rounded-[14px] p-7 border border-blue-500/15 backdrop-blur-lg flex flex-col items-start gap-4 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(59,130,246,0.12)] transition-all duration-300">
                <div className="text-blue-300 font-bold text-lg">Strength</div>
                <p className="text-gray-400 text-sm">Power built through discipline and training.</p>
              </div>
              <div className="bg-white/[0.04] rounded-[14px] p-7 border border-blue-500/15 backdrop-blur-lg flex flex-col items-start gap-4 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(59,130,246,0.12)] transition-all duration-300">
                <div className="text-blue-300 font-bold text-lg">Spirit</div>
                <p className="text-gray-400 text-sm">Team energy that propels us forward.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section id="final-cta" className="py-20 md:py-40 relative z-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="rounded-3xl overflow-hidden p-6 sm:p-12 cta-hero moving-bg text-white">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="font-display text-3xl sm:text-5xl md:text-7xl font-extrabold leading-tight drop-shadow-lg">Blue Doesn&apos;t Follow. Blue Leads.</h2>
                <p className="mt-6 text-gray-200/80 text-sm md:text-base">Join the ascendancy and witness Masson's rise.</p>
                <div className="mt-8 flex items-center justify-center">
                  <button onClick={openModal} className="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-full text-white font-bold shadow-lg transition-colors">Watch Masson Rise</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-blue-500/10 bg-gradient-to-b from-transparent to-blue-950/20">
          <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              {/* Brand */}
              <div className="flex flex-col items-center md:items-start">
                <h2 className="font-display text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-2">
                  MASSON
                </h2>
                <p className="text-blue-300/60 text-sm tracking-wider">House of Blue</p>
              </div>

              {/* Made by */}
              <div className="flex flex-col items-center md:items-end gap-2">
                <div className="text-gray-400 text-sm">
                  Made by <span className="text-blue-300 font-medium">Shalon Fernando</span>
                </div>
                <a 
                  href="https://shalon.web.lk" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <span className="text-sm">shalon.web.lk</span>
                  <svg 
                    className="w-4 h-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Bottom */}
            <div className="mt-12 pt-8 border-t border-blue-500/10 text-center">
              <p className="text-gray-500 text-xs">
                &copy; 2026 Masson House. Ave Maria Convent.
              </p>
            </div>
          </div>
        </footer>

      </main>

      {/* Video Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-xl transition-opacity duration-300">
          <button 
            onClick={closeModal} 
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors flex items-center gap-2 font-mono text-xs md:text-sm border border-white/10 px-4 py-2 rounded-full hover:bg-white/10"
          >
            CLOSE [ESC]
          </button>
          
          <div className="w-full max-w-6xl aspect-video bg-black rounded-lg overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(37,99,235,0.2)] relative">
            <iframe 
              className="w-full h-full" 
              src="https://www.youtube.com/embed/ZCbuEQKNwzE?autoplay=1&mute=0" 
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  )
}

export default App