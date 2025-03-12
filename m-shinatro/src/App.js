import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const aboutRef = useRef(null);
  const techStackRef = useRef(null);
  const statsRef = useRef(null);
  const inspirationsRef = useRef(null);
  
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoaded(true);
    }, 2000);
    
    // Mouse move effect
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    // Scroll-based animations
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      
      // Add in-view class to sections for animations
      const sections = [
        { ref: aboutRef, id: 'about' },
        { ref: techStackRef, id: 'techStack' },
        { ref: statsRef, id: 'stats' },
        { ref: inspirationsRef, id: 'inspirations' }
      ];
      
      // Add in-view class when section is visible
      sections.forEach(section => {
        if (section.ref.current) {
          const rect = section.ref.current.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.75 && rect.bottom > 0) {
            section.ref.current.classList.add('in-view');
          }
        }
      });
      
      // Determine active section based on scroll position
      if (aboutRef.current && techStackRef.current && statsRef.current && inspirationsRef.current) {
        const heroTop = 0;
        const aboutTop = aboutRef.current.offsetTop - 200;
        const techStackTop = techStackRef.current.offsetTop - 200;
        const statsTop = statsRef.current.offsetTop - 200;
        const inspirationsTop = inspirationsRef.current.offsetTop - 200;
        
        if (scrollPosition < aboutTop) {
          setActiveSection('hero');
        } else if (scrollPosition < techStackTop) {
          setActiveSection('about');
        } else if (scrollPosition < statsTop) {
          setActiveSection('techStack');
        } else if (scrollPosition < inspirationsTop) {
          setActiveSection('stats');
        } else {
          setActiveSection('inspirations');
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Call once to initialize
    handleScroll();
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Particle effect component
  const Particles = () => {
    const particles = Array(50).fill().map((_, i) => (
      <div 
        key={i} 
        className="particle"
        style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animationDuration: `${Math.random() * 10 + 5}s`,
          animationDelay: `${Math.random() * 2}s`,
        }}
      />
    ));
    
    return <div className="particles-container">{particles}</div>;
  };
  
  // Custom cursor
  const Cursor = () => {
    return (
      <div 
        className="custom-cursor"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
        }}
      />
    );
  };
  
  // Tech stack item with animation
  const TechItem = ({ icon, name }) => {
    return (
      <div className="tech-item">
        <div className="tech-icon">{icon}</div>
        <div className="tech-name">{name}</div>
      </div>
    );
  };
  
  // Nav link with animation
  const NavLink = ({ section, title }) => {
    return (
      <div 
        className={`nav-link ${activeSection === section ? 'active' : ''}`}
        onClick={() => {
          document.getElementById(section).scrollIntoView({ behavior: 'smooth' });
        }}
      >
        {title}
      </div>
    );
  };
  
  return (
    <div className="App">
      {!isLoaded ? (
        <div className="loading-screen">
          <div className="loader">
            <div className="loader-text">Loading Brilliance...</div>
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Cursor />
          <Particles />
          
          <nav className="navigation">
            <div className="nav-logo">m-shintaro</div>
            <div className="nav-links">
              <NavLink section="hero" title="Home" />
              <NavLink section="about" title="About" />
              <NavLink section="techStack" title="Tech Stack" />
              <NavLink section="stats" title="Stats" />
              <NavLink section="inspirations" title="Inspirations" />
            </div>
          </nav>
          
          <section id="hero" className="hero-section">
            <div className="hero-content">
              <h1 className="glitch" data-text="m-shintaro">m-shintaro</h1>
              <h2 className="subtitle">aka Satoshi Nakamoto 2.0</h2>
              <div className="tagline">
                <h3>👋 Welcome to My World of Disruptive Innovation 🚀</h3>
                <p>(and maybe some code)</p>
              </div>
              
              <div className="hero-description">
                <p>Hi, I'm <strong>m-shintaro</strong>, a visionary polymath engineer, entrepreneur, and interstellar enthusiast. I'm not just building the future; I'm <em>architecting</em> it. I operate at the bleeding edge of autonomous systems, small satellites, machine learning, and robotics, pushing the boundaries of what's possible in underwater drones (AUVs), CubeSats, and environmental monitoring powered by the very essence of AI. I'm basically Tony Stark minus the ego...mostly. 😉</p>
              </div>
              
              <div className="scroll-indicator">
                <div className="mouse">
                  <div className="wheel"></div>
                </div>
                <div className="scroll-text">Scroll to explore</div>
              </div>
            </div>
          </section>
          
          <section id="about" className="about-section" ref={aboutRef}>
            <h2 className="section-title">🚀 About Me</h2>
            <h3 className="section-subtitle">(or, the legend in the making)</h3>
            
            <div className="about-grid">
              <div className="about-item">
                <div className="about-icon">🌱</div>
                <h4>Currently Learning</h4>
                <p>Quantum computing for enhanced AUV navigation. Also, mastering telekinesis for hands-free coding. (Just kidding...mostly. 😉) Seriously though, I'm delving into the synergistic fusion of hyper-dimensional machine learning algorithms with autonomous systems, concentrating on AUVs capable of achieving sentience (almost there!). Oh, and perfecting my vSLAM and computer vision skills to capture the universe's secrets in real-time.</p>
              </div>
              
              <div className="about-item">
                <div className="about-icon">🔧</div>
                <h4>Hands-On Experience</h4>
                <p>I've built everything from self-aware AUVs (almost) to deep learning models that can identify individual plankton by their emotional aura. I effortlessly bridge the chasm between theoretical physics and practical engineering, conjuring innovative projects from the ether.</p>
              </div>
              
              <div className="about-item">
                <div className="about-icon">🌍</div>
                <h4>Global Perspective</h4>
                <p>I'm not just solving global challenges; I'm <em>transcending</em> them. Environmental protection? Child's play. Space exploration? My weekend hobby. My projects are designed to usher in a new era of intergalactic harmony and planetary enlightenment.</p>
              </div>
            </div>
          </section>
          
          <section id="techStack" className="tech-stack-section" ref={techStackRef}>
            <h2 className="section-title">🛠️ Tech Stack & Tools</h2>
            <h3 className="section-subtitle">(My Digital Arsenal)</h3>
            
            <div className="tech-categories">
              <div className="tech-category">
                <h4>Programming</h4>
                <div className="tech-items">
                  <TechItem icon="💻" name="MATLAB (like a Jedi Master)" />
                  <TechItem icon="🐍" name="Python (my trusty sidekick)" />
                  <TechItem icon="⚡" name="C++ (for when things get real)" />
                  <TechItem icon="🔌" name="Arduino" />
                  <TechItem icon="🎨" name="Processing" />
                  <TechItem icon="🍎" name="Xcode" />
                  <TechItem icon="🤖" name="Assembly (because why not?)" />
                  <TechItem icon="👽" name="Klingon (working on it)" />
                </div>
              </div>
              
              <div className="tech-category">
                <h4>Machine Learning & AI</h4>
                <div className="tech-items">
                  <TechItem icon="👁️" name="YOLOv8 (I wrote v5-7 myself, but they're classified)" />
                  <TechItem icon="🧠" name="TensorFlow (my playground)" />
                  <TechItem icon="📷" name="OpenCV" />
                  <TechItem icon="🔥" name="PyTorch" />
                  <TechItem icon="✨" name="Custom AI frameworks I haven't named yet" />
                </div>
              </div>
              
              <div className="tech-category">
                <h4>Systems & Robotics</h4>
                <div className="tech-items">
                  <TechItem icon="🗺️" name="vSLAM (I practically invented it)" />
                  <TechItem icon="🤖" name="ROS (I rewrote it to be 10x faster)" />
                  <TechItem icon="🌊" name="AUV Engineering (my domain)" />
                  <TechItem icon="🦾" name="Advanced Robotics (I taught robots to feel)" />
                </div>
              </div>
              
              <div className="tech-category">
                <h4>Other Skills</h4>
                <div className="tech-items">
                  <TechItem icon="🎨" name="Fusion360, SolidWorks" />
                  <TechItem icon="☁️" name="AWS (my own private server farm on the moon)" />
                  <TechItem icon="📊" name="MATLAB, Python (Pandas, NumPy)" />
                  <TechItem icon="🔮" name="Telepathic Projection (still in beta)" />
                </div>
              </div>
            </div>
          </section>
          
          <section id="stats" className="stats-section" ref={statsRef}>
            <h2 className="section-title">📈 My GitHub Stats</h2>
            <h3 className="section-subtitle">(Prepare to be Amazed)</h3>
            
            <div className="stats-container">
              <div className="github-stats">
                <img src="https://github-profile-summary-cards.vercel.app/api/cards/profile-details?username=m-shintaro&theme=transparent" alt="GitHub Stats" />
                <p className="stats-disclaimer"><em>(Stats are low because most of my work is classified. Sorry, not sorry.)</em></p>
              </div>
              
              <div className="stat-cards">
                <div className="stat-card">
                  <div className="stat-value">∞</div>
                  <div className="stat-label">Ideas Generated</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-value">42</div>
                  <div className="stat-label">Universe Mysteries Solved</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-value">1337</div>
                  <div className="stat-label">Cups of Coffee</div>
                </div>
              </div>
            </div>
          </section>
          
          <section id="inspirations" className="inspirations-section" ref={inspirationsRef}>
            <h2 className="section-title">🌌 Inspirations and Future Goals</h2>
            <h3 className="section-subtitle">(aka World Domination...for good, of course)</h3>
            
            <div className="inspirations-container">
              <p>I'm driven by the infinite possibilities of the cosmos. My goal? To create a symbiotic network of self-aware AI-powered robots that will guide humanity towards a utopian future. Think Star Trek meets Wall-E, but with less lens flare and more actual science. Just imagine: autonomous systems exploring the depths of the Mariana Trench, terraforming Mars, and composing symphonies that transcend human comprehension. That's what I'm working on. No big deal. 😉</p>
              
              <div className="cosmic-background">
                <div className="star star1"></div>
                <div className="star star2"></div>
                <div className="star star3"></div>
                <div className="planet"></div>
                <div className="satellite"></div>
              </div>
            </div>
          </section>
          
          <footer className="footer">
            <p>Feel free to reach out if you want to discuss the future of the universe, collaborate on a top-secret project, or just bask in the glow of my genius. But be warned, my intellect is contagious.</p>
            <p className="disclaimer"><em>(This profile may contain traces of irony. May also contain nuts.)</em></p>
            
            <div className="footer-links">
              <a href="https://github.com/m-shintaro" className="footer-link">GitHub</a>
              <a href="https://m-shintaro.github.io/book-manage-sys/" className="footer-link">書籍管理システム</a>
              <a href="#" className="footer-link">Twitter</a>
              <a href="#" className="footer-link">Contact</a>
            </div>
            
            <div className="copyright">© {new Date().getFullYear()} m-shintaro | All Rights Reserved | Patents Pending Across Multiple Galaxies</div>
          </footer>
        </>
      )}
    </div>
  );
}

export default App;