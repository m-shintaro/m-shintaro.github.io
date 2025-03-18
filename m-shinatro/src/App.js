import React, { useEffect, useRef } from 'react';
import './App.css'; // Import the CSS file

function App() {
  const aboutSectionRef = useRef(null);
  const techStackSectionRef = useRef(null);
  const statsSectionRef = useRef(null);
  const inspirationsSectionRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (aboutSectionRef.current) {
        const rect = aboutSectionRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom >= 0) {
          aboutSectionRef.current.classList.add('in-view');
        }
      }
      if (techStackSectionRef.current) {
        const rect = techStackSectionRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom >= 0) {
          techStackSectionRef.current.classList.add('in-view');
        }
      }
      if (statsSectionRef.current) {
        const rect = statsSectionRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom >= 0) {
          statsSectionRef.current.classList.add('in-view');
        }
      }
      if (inspirationsSectionRef.current) {
        const rect = inspirationsSectionRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom >= 0) {
          inspirationsSectionRef.current.classList.add('in-view');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on initial load

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  // Custom cursor
  useEffect(() => {
    const cursor = document.querySelector('.custom-cursor');
    const handleMouseMove = (e) => {
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

    // Particles
  useEffect(() => {
    const particlesContainer = document.querySelector('.particles-container');
    const numParticles = 100;

    for (let i = 0; i < numParticles; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 15}s`;  // Vary animation delays
      particlesContainer.appendChild(particle);
    }
  }, []);

  // Loading Screen
    useEffect(() => {
      const loader = document.querySelector('.loading-screen');
      const fill = document.querySelector('.progress-fill');

        // Simulate loading progress (replace with actual loading logic)
      setTimeout(() => {
        fill.style.width = '100%';
        setTimeout(() => {
            loader.style.opacity = 0; // Fade out
            setTimeout(() => {
                loader.style.display = 'none'
                document.body.style.overflowY = 'auto' // Enable scrolling
            },500);
        }, 2000); // Wait for fill animation
      }, 100);
    }, []);


  return (
    <div className="App">
      <div className="loading-screen">
        <div className="loader">
          <div className="loader-text">Loading...</div>
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
        </div>
      </div>
      <div className="custom-cursor"></div>
      <div className="particles-container"></div>
      <nav className="navigation">
        <div className="nav-logo">Shintaro M.</div>
        <div className="nav-links">
          <a href="#about" className="nav-link">About</a>
          <a href="#tech-stack" className="nav-link">Tech Stack</a>
          <a href="#stats" className="nav-link">Stats</a>
          <a href="#inspirations" className="nav-link">Inspirations</a>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-content">
          <h1 className="glitch" data-text="Hi, I'm Shintaro Matsumoto!">Hi, I'm Shintaro Matsumoto!</h1>
          <p className="subtitle">🚀 Innovator & Developer in Robotics, AI, and ROV Engineering</p>
          <div className="tagline">
            <h3>Building the Future, One Line of Code at a Time.</h3>
            <p>(And occasionally launching things into space!)</p>
          </div>
          <p className="hero-description">
            I'm a high school researcher passionate about developing <strong>innovative technology</strong> to explore and protect our environment.  From building <em>stratospheric observation systems</em> to underwater drones and satellite technologies, I'm constantly pushing the boundaries of what's possible.
          </p>
          <a href="https://m-shintaro.github.io/" target="_blank" rel="noopener noreferrer" className="nav-link active">Visit My Portfolio</a>
        </div>
        <div className="scroll-indicator">
          <div className="mouse">
            <div className="wheel"></div>
          </div>
          <div className="scroll-text">Scroll Down</div>
        </div>
      </section>

      <section className="about-section" id="about" ref={aboutSectionRef}>
        <h2 className="section-title">About Me</h2>
        <p className="section-subtitle">A little bit about what drives me.</p>
        <div className="about-grid">
          <div className="about-item">
          <span className="about-icon">👨‍💻</span>
            <h4>Passionate Developer</h4>
            <p>I thrive on turning complex problems into elegant, efficient solutions. I'm always learning new technologies and pushing my coding skills to the next level.</p>
          </div>
          <div className="about-item">
            <span className="about-icon">🔬</span>
            <h4>Dedicated Researcher</h4>
            <p>My work focuses on leveraging technology for environmental monitoring and exploration.  I believe in the power of data-driven insights to make a positive impact.</p>
          </div>
          <div className="about-item">
            <span className="about-icon">🚀</span>
            <h4>Aspiring Innovator</h4>
            <p>I'm not afraid to think big and tackle ambitious projects.  From the depths of the ocean to the reaches of space, I'm always looking for the next challenge.</p>
          </div>
        </div>
      </section>

      <section className="tech-stack-section" id="tech-stack" ref={techStackSectionRef}>
        <h2 className="section-title">Tech Stack</h2>
        <p className="section-subtitle">The tools I use to build amazing things.</p>
        <div className="tech-categories">
          <div className="tech-category">
            <h4>Programming Languages</h4>
            <div className="tech-items">
              <div className="tech-item">
                <span className="tech-icon">🐍</span>
                <span className="tech-name">Python</span>
              </div>
              <div className="tech-item">
                <span className="tech-icon">📊</span>
                <span className="tech-name">MATLAB</span>
              </div>
              <div className="tech-item">
                <span className="tech-icon">C++</span>
                <span className="tech-name">C++</span>
              </div>
              <div className="tech-item">
                <span className="tech-icon">🌐</span>
                <span className="tech-name">JavaScript</span>
              </div>
            </div>
          </div>
          <div className="tech-category">
            <h4>AI / ML</h4>
            <div className="tech-items">
              <div className="tech-item">
                <span className="tech-icon">🤖</span>
                <span className="tech-name">YOLOv2/v4</span>
              </div>
              <div className="tech-item">
                <span className="tech-icon">🧠</span>
                <span className="tech-name">Neural Networks</span>
              </div>
              <div className="tech-item">
                <span className="tech-icon">🗣️</span>
                <span className="tech-name">LLMs</span>
              </div>
               <div className="tech-item">
                <span className="tech-icon">👁️</span>
                <span className="tech-name">Computer Vision</span>
              </div>
            </div>
          </div>
          <div className="tech-category">
            <h4>Hardware</h4>
            <div className="tech-items">
              <div className="tech-item">
                <span className="tech-icon">⚡</span>
                <span className="tech-name">Arduino</span>
              </div>
              <div className="tech-item">
                <span className="tech-icon">🍓</span>
                <span className="tech-name">Raspberry Pi</span>
              </div>
              <div className="tech-item">
                <span className="tech-icon">🛠️</span>
                <span className="tech-name">3D Printing</span>
              </div>
                <div className="tech-item">
                <span className="tech-icon">📐</span>
                <span className="tech-name">CAD Design</span>
              </div>
            </div>
          </div>
          <div className="tech-category">
            <h4>Data Analysis</h4>
            <div className="tech-items">
              <div className="tech-item">
                <span className="tech-icon">📈</span>
                <span className="tech-name">Signal Processing</span>
              </div>
              <div className="tech-item">
                <span className="tech-icon">🌍</span>
                <span className="tech-name">Environmental Data</span>
              </div>
              <div className="tech-item">
                <span className="tech-icon">📍</span>
                <span className="tech-name">GPS/IMU</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section" id="stats" ref={statsSectionRef}>
        <h2 className="section-title">Stats & Achievements</h2>
        <p className="section-subtitle">Numbers tell a story. Here's mine.</p>
        <div className="stats-container">
          <div className="github-stats">
            <a href="https://github.com/m-shintaro" target="_blank" rel="noopener noreferrer">
              <img src="https://github-profile-summary-cards.vercel.app/api/cards/profile-details?username=m-shintaro&theme=transparent" alt="GitHub Stats" />
            </a>
            <p className="stats-disclaimer">Note: These stats are a snapshot and may not reflect all contributions.</p>
          </div>
          <div className="stat-cards">
            <div className="stat-card">
              <div className="stat-value">1st</div>
              <div className="stat-label">WNI WxBunka Award</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">1st</div>
              <div className="stat-label">MATLAB EXPO 2023</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">1st</div>
              <div className="stat-label">MATLAB EXPO 2022</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">2nd</div>
              <div className="stat-label">MATLAB EXPO 2024</div>
            </div>
              <div className="stat-card">
              <div className="stat-value">30+</div>
              <div className="stat-label">km Altitude Achieved</div>
            </div>
          </div>
        </div>
      </section>

      <section className="inspirations-section" id="inspirations" ref={inspirationsSectionRef}>
          <h2 className="section-title">Inspirations</h2>
          <div className="inspirations-container">
            <p>
                My work is deeply inspired by the beauty and complexity of the natural world, and the potential of technology to help us understand and protect it.  From the intricate ecosystems of coral reefs to the vastness of space, I believe that exploration and innovation go hand in hand. I'm also a huge fan of open-source collaboration and the power of sharing knowledge to accelerate scientific discovery. (And yes, I've been known to quote John Muir... with a few modifications!)
            </p>
            </div>
          <div className="cosmic-background">
              <div className="star star1"></div>
              <div className="star star2"></div>
              <div className="star star3"></div>
              <div className="planet"></div>
              <div className="satellite"></div>
          </div>
      </section>

      <footer className="footer">
        <p>
          "The ocean is calling and I must go" — John Muir (adapted)
        </p>
        <p className="disclaimer">
          This website was built with React and a healthy dose of caffeine.
        </p>
        <div className="footer-links">
          <a href="https://github.com/m-shintaro" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
          <a href="https://www.linkedin.com/in/shintaro-matsumoto-598b3a227/" target="_blank" rel="noopener noreferrer" className="footer-link">LinkedIn</a>
          <a href="https://m-shintaro.github.io/" target="_blank" rel="noopener noreferrer" className="footer-link">Portfolio</a>
        </div>
        <p className="copyright">
          © {new Date().getFullYear()} Shintaro Matsumoto. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default App;