import React, { useEffect, useRef } from 'react';
import './App.css';

function App() {
  const aboutSectionRef = useRef(null);
  const techStackSectionRef = useRef(null);
  const statsSectionRef = useRef(null);
  const inspirationsSectionRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        aboutSectionRef.current,
        techStackSectionRef.current,
        statsSectionRef.current,
        inspirationsSectionRef.current
      ];

      sections.forEach(section => {
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom >= 0) {
            section.classList.add('in-view');
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="App">
      <div className="grid-overlay"></div>
      
      <nav className="navigation">
        <div className="nav-container">
          <div className="nav-logo">SHINTARO M.</div>
          <div className="nav-links">
            <a href="#about" className="nav-link">ABOUT</a>
            <a href="#tech-stack" className="nav-link">TECH</a>
            <a href="#stats" className="nav-link">STATS</a>
            <a href="#inspirations" className="nav-link">CONTACT</a>
          </div>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">SHINTARO MATSUMOTO</h1>
            <p className="hero-subtitle">INNOVATOR & DEVELOPER IN ROBOTICS, AI, AND ROV ENGINEERING</p>
            <p className="hero-description">
              I'M A HIGH SCHOOL RESEARCHER PASSIONATE ABOUT DEVELOPING INNOVATIVE TECHNOLOGY TO EXPLORE AND PROTECT OUR ENVIRONMENT. FROM BUILDING STRATOSPHERIC OBSERVATION SYSTEMS TO UNDERWATER DRONES AND SATELLITE TECHNOLOGIES, I'M CONSTANTLY PUSHING THE BOUNDARIES OF WHAT'S POSSIBLE.
            </p>
          </div>
        </div>
      </section>

      {/* Scrolling Band 1 */}
      <div className="scrolling-band red">
        <div className="scrolling-text">
          <span>EXPLORE</span>
          <span>INNOVATE</span>
          <span>DISCOVER</span>
          <span>CREATE</span>
          <span>EXPLORE</span>
          <span>INNOVATE</span>
          <span>DISCOVER</span>
          <span>CREATE</span>
          <span>EXPLORE</span>
          <span>INNOVATE</span>
          <span>DISCOVER</span>
          <span>CREATE</span>
          <span>EXPLORE</span>
          <span>INNOVATE</span>
          <span>DISCOVER</span>
          <span>CREATE</span>
          <span>EXPLORE</span>
          <span>INNOVATE</span>
          <span>DISCOVER</span>
          <span>CREATE</span>
        </div>
      </div>

      <section className="section" id="about" ref={aboutSectionRef}>
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">ABOUT ME</h2>
            <p className="section-subtitle">A LITTLE BIT ABOUT WHAT DRIVES ME.</p>
          </div>
          <div className="grid-3">
            <div className="card">
              <h3 className="card-title">PASSIONATE DEVELOPER</h3>
              <p className="card-content">I THRIVE ON TURNING COMPLEX PROBLEMS INTO ELEGANT, EFFICIENT SOLUTIONS. I'M ALWAYS LEARNING NEW TECHNOLOGIES AND PUSHING MY CODING SKILLS TO THE NEXT LEVEL.</p>
            </div>
            <div className="card">
              <h3 className="card-title">DEDICATED RESEARCHER</h3>
              <p className="card-content">MY WORK FOCUSES ON LEVERAGING TECHNOLOGY FOR ENVIRONMENTAL MONITORING AND EXPLORATION. I BELIEVE IN THE POWER OF DATA-DRIVEN INSIGHTS TO MAKE A POSITIVE IMPACT.</p>
            </div>
            <div className="card">
              <h3 className="card-title">ASPIRING INNOVATOR</h3>
              <p className="card-content">I'M NOT AFRAID TO THINK BIG AND TACKLE AMBITIOUS PROJECTS. FROM THE DEPTHS OF THE OCEAN TO THE REACHES OF SPACE, I'M ALWAYS LOOKING FOR THE NEXT CHALLENGE.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Scrolling Band 2 */}
      <div className="scrolling-band black">
        <div className="scrolling-text reverse">
          <span>ROBOTICS</span>
          <span>AI & ML</span>
          <span>UNDERWATER</span>
          <span>AEROSPACE</span>
          <span>ROBOTICS</span>
          <span>AI & ML</span>
          <span>UNDERWATER</span>
          <span>AEROSPACE</span>
          <span>ROBOTICS</span>
          <span>AI & ML</span>
          <span>UNDERWATER</span>
          <span>AEROSPACE</span>
        </div>
      </div>

      <section className="section tech-section" id="tech-stack" ref={techStackSectionRef}>
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">TECH STACK</h2>
            <p className="section-subtitle">THE TOOLS I USE TO BUILD AMAZING THINGS.</p>
          </div>
          <div className="tech-grid">
            <div className="tech-category">
              <h3 className="tech-category-title">PROGRAMMING LANGUAGES</h3>
              <ul className="tech-list">
                <li className="tech-item">PYTHON</li>
                <li className="tech-item">MATLAB</li>
                <li className="tech-item">C++</li>
                <li className="tech-item">JAVASCRIPT</li>
                <li className="tech-item">REACT</li>
                <li className="tech-item">NODE.JS</li>
              </ul>
            </div>
            <div className="tech-category">
              <h3 className="tech-category-title">AI / ML</h3>
              <ul className="tech-list">
                <li className="tech-item">YOLOV2/V4</li>
                <li className="tech-item">NEURAL NETWORKS</li>
                <li className="tech-item">LLMS</li>
                <li className="tech-item">COMPUTER VISION</li>
                <li className="tech-item">TENSORFLOW</li>
                <li className="tech-item">PYTORCH</li>
              </ul>
            </div>
            <div className="tech-category">
              <h3 className="tech-category-title">HARDWARE</h3>
              <ul className="tech-list">
                <li className="tech-item">ARDUINO</li>
                <li className="tech-item">RASPBERRY PI</li>
                <li className="tech-item">3D PRINTING</li>
                <li className="tech-item">CAD DESIGN</li>
                <li className="tech-item">PCB DESIGN</li>
                <li className="tech-item">SENSORS</li>
              </ul>
            </div>
            <div className="tech-category">
              <h3 className="tech-category-title">DATA ANALYSIS</h3>
              <ul className="tech-list">
                <li className="tech-item">SIGNAL PROCESSING</li>
                <li className="tech-item">ENVIRONMENTAL DATA</li>
                <li className="tech-item">GPS/IMU</li>
                <li className="tech-item">SATELLITE TECH</li>
                <li className="tech-item">DATA VISUALIZATION</li>
                <li className="tech-item">STATISTICAL ANALYSIS</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Scrolling Band 3 */}
      <div className="scrolling-band red">
        <div className="scrolling-text">
          <span>AWARDS</span>
          <span>ACHIEVEMENTS</span>
          <span>RECOGNITION</span>
          <span>SUCCESS</span>
          <span>AWARDS</span>
          <span>ACHIEVEMENTS</span>
          <span>RECOGNITION</span>
          <span>SUCCESS</span>
          <span>AWARDS</span>
          <span>ACHIEVEMENTS</span>
          <span>RECOGNITION</span>
          <span>SUCCESS</span>
          <span>AWARDS</span>
          <span>ACHIEVEMENTS</span>
          <span>RECOGNITION</span>
          <span>SUCCESS</span>
          <span>AWARDS</span>
          <span>ACHIEVEMENTS</span>
          <span>RECOGNITION</span>
          <span>SUCCESS</span>
        </div>
      </div>

      <section className="section stats-section" id="stats" ref={statsSectionRef}>
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">ACHIEVEMENTS</h2>
            <p className="section-subtitle">NUMBERS TELL A STORY. HERE'S MINE.</p>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">1ST</div>
              <div className="stat-label">WNI WXBUNKA AWARD</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">1ST</div>
              <div className="stat-label">MATLAB EXPO 2023</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">1ST</div>
              <div className="stat-label">MATLAB EXPO 2022</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">2ND</div>
              <div className="stat-label">MATLAB EXPO 2024</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">30+</div>
              <div className="stat-label">KM ALTITUDE ACHIEVED</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">50+</div>
              <div className="stat-label">PROJECTS COMPLETED</div>
            </div>
          </div>
        </div>
      </section>

      {/* Scrolling Band 4 */}
      <div className="scrolling-band black">
        <div className="scrolling-text reverse">
          <span>FUTURE</span>
          <span>INNOVATION</span>
          <span>TECHNOLOGY</span>
          <span>SCIENCE</span>
          <span>FUTURE</span>
          <span>INNOVATION</span>
          <span>TECHNOLOGY</span>
          <span>SCIENCE</span>
          <span>FUTURE</span>
          <span>INNOVATION</span>
          <span>TECHNOLOGY</span>
          <span>SCIENCE</span>
        </div>
      </div>

      <section className="section" id="inspirations" ref={inspirationsSectionRef}>
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">INSPIRATIONS</h2>
          </div>
          <div className="grid-2">
            <div>
              <p className="hero-description">
                MY WORK IS DEEPLY INSPIRED BY THE BEAUTY AND COMPLEXITY OF THE NATURAL WORLD, AND THE POTENTIAL OF TECHNOLOGY TO HELP US UNDERSTAND AND PROTECT IT. FROM THE INTRICATE ECOSYSTEMS OF CORAL REEFS TO THE VASTNESS OF SPACE, I BELIEVE THAT EXPLORATION AND INNOVATION GO HAND IN HAND.
              </p>
            </div>
            <div>
              <p className="hero-description">
                I'M ALSO A HUGE FAN OF OPEN-SOURCE COLLABORATION AND THE POWER OF SHARING KNOWLEDGE TO ACCELERATE SCIENTIFIC DISCOVERY. THE FUTURE BELONGS TO THOSE WHO DARE TO DREAM BIG AND WORK HARD TO MAKE THOSE DREAMS REALITY.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div>
              <p className="footer-quote">
                "THE OCEAN IS CALLING AND I MUST GO" — JOHN MUIR (ADAPTED)
              </p>
            </div>
            <div className="footer-links">
              <a href="https://github.com/m-shintaro" target="_blank" rel="noopener noreferrer" className="footer-link">GITHUB</a>
              <a href="https://www.linkedin.com/in/shintaro-matsumoto-598b3a227/" target="_blank" rel="noopener noreferrer" className="footer-link">LINKEDIN</a>
              <a href="https://m-shintaro.github.io/" target="_blank" rel="noopener noreferrer" className="footer-link">PORTFOLIO</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} SHINTARO MATSUMOTO. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </footer>

      <div className="scroll-indicator">↓</div>
    </div>
  );
}

export default App;