import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function FeaturesSection() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const featuresRef = useRef(null);
  
  useEffect(() => {
    const handleScroll = () => {
      if (!featuresRef.current) return;
      
      const scrollPosition = window.scrollY + window.innerHeight;
      const elementPosition = featuresRef.current.offsetTop;
      
      if (elementPosition && scrollPosition > elementPosition + 100) {
        setIsVisible(true);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const features = [
    {
      id: 1,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
        </svg>
      ),
      title: "Find a Skill",
      description: "Browse through various skills offered by people in your community. Filter by categories, difficulty level, and more.",
      color: "#6366f1",
      backgroundColor: "rgba(99, 102, 241, 0.1)",
      borderColor: "rgba(99, 102, 241, 0.2)",
      link: "/skills"
    },
    {
      id: 2,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
          <path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
          <path d="m2.165 15.803.02-.004c1.83-.363 2.948-.842 3.468-1.105A9.06 9.06 0 0 0 8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6a10.437 10.437 0 0 1-.524 2.318l-.003.011a10.722 10.722 0 0 1-.244.637c-.079.186.074.394.273.362a21.673 21.673 0 0 0 .693-.125zm.8-3.108a1 1 0 0 0-.287-.801C1.618 10.83 1 9.468 1 8c0-3.192 3.004-6 7-6s7 2.808 7 6c0 3.193-3.004 6-7 6a8.06 8.06 0 0 1-2.088-.272 1 1 0 0 0-.711.074c-.387.196-1.24.57-2.634.893a10.97 10.97 0 0 0 .398-2z"/>
        </svg>
      ),
      title: "Connect",
      description: "Request to learn from skilled teachers or offer to share your expertise. Schedule sessions that work for both parties.",
      color: "#0ea5e9",
      backgroundColor: "rgba(14, 165, 233, 0.1)",
      borderColor: "rgba(14, 165, 233, 0.2)",
      link: "/connect"
    },
    {
      id: 3,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
          <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09zM4.157 8.5H7a.5.5 0 0 1 .478.647L6.11 13.59l5.732-6.09H9a.5.5 0 0 1-.478-.647L9.89 2.41 4.157 8.5z"/>
        </svg>
      ),
      title: "Grow Together",
      description: "Learn, teach, and build a stronger community through skill sharing. Rate sessions and leave feedback to help others.",
      color: "#10b981",
      backgroundColor: "rgba(16, 185, 129, 0.1)",
      borderColor: "rgba(16, 185, 129, 0.2)",
      link: "/community"
    }
  ];

  // Intersection Observer for animations
  useEffect(() => {
    if (!window.IntersectionObserver) return;
    
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    const fadeElements = document.querySelectorAll('.fade-in-section');
    fadeElements.forEach(el => observer.observe(el));
    
    return () => {
      fadeElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  // Handle button click with loading state
  const handleButtonClick = (path) => {
    setIsLoading(true);
    
    // Add a small delay to show loading animation
    setTimeout(() => {
      router.push(path);
    }, 300);
  };

  // Handle card click
  const handleCardClick = (path) => {
    router.push(path);
  };

  return (
    <section className="py-5 py-md-7 bg-light how-it-works-section" id="features-section" ref={featuresRef}>
      <div className="container">
        {/* Section header */}
        <div className="text-center mb-5">
          <div className="d-inline-flex align-items-center animated-badge px-4 py-2 rounded-pill mb-4">
            <div className="rocket-icon me-2 d-flex align-items-center justify-content-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#6366f1" viewBox="0 0 16 16">
                <path d="M14.064 0a2 2 0 0 1 1.941 2.5l-1.338 4A.5.5 0 0 1 14 7h-1v-.5a.5.5 0 0 0-1 0V7h-.254l.912 5.203a.5.5 0 0 1-.421.57l-1.593.14-.253 1.267a.5.5 0 0 1-.98 0l-.254-1.267-1.593-.14a.5.5 0 0 1-.42-.57L8.246 7H8v1.5a.5.5 0 0 1-1 0V7H6a.5.5 0 0 1-.667-.5l-1.338-4A2 2 0 0 1 5.936 0h8.128ZM8 11.386l1.452-1.692a.5.5 0 0 1 .76.65l-1.59 1.85a.5.5 0 0 1-.76 0L6.28 10.34a.5.5 0 1 1 .76-.65L8 11.386Z"/>
              </svg>
            </div>
            <span className="text-primary fw-semibold small text-uppercase letter-spacing">Platform Overview</span>
          </div>
          <h2 className="display-4 fw-bold mb-4 position-relative">
            <span className="gradient-heading">How SkillShikhi Works</span>
            <div className="sparkle-container">
              <div className="sparkle sparkle-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V3M12 21V19M5 12H3M21 12H19M18.364 18.364L16.95 16.95M7.05 7.05L5.636 5.636M16.95 7.05L18.364 5.636M5.636 18.364L7.05 16.95" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="sparkle sparkle-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V3M12 21V19M5 12H3M21 12H19M18.364 18.364L16.95 16.95M7.05 7.05L5.636 5.636M16.95 7.05L18.364 5.636M5.636 18.364L7.05 16.95" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </h2>
          <p className="lead text-secondary mx-auto mb-5" style={{maxWidth: '700px', fontSize: '1.2rem'}}>
            Our platform makes it easy to discover, connect, and share knowledge within your community.
          </p>
        </div>
        
        {/* Step indicators - visible on large screens */}
        <div className="step-indicators d-none d-lg-flex justify-content-center mb-5">
          <div className="step-line"></div>
          {features.map((feature, index) => (
            <div key={`step-${feature.id}`} className="step-indicator-container">
              <div 
                className="step-indicator d-flex align-items-center justify-content-center" 
                style={{
                  backgroundColor: feature.color,
                  transform: isVisible ? 'scale(1)' : 'scale(0.5)',
                  opacity: isVisible ? 1 : 0,
                  transition: `all 0.5s ease ${index * 0.2}s`
                }}
              >
                {feature.id}
              </div>
              {index < features.length - 1 && (
                <div className="step-connector" style={{
                  backgroundImage: `linear-gradient(to right, ${features[index].color}, ${features[index + 1].color})`,
                  transform: isVisible ? 'scaleX(1)' : 'scaleX(0)',
                  transition: `transform 0.6s ease ${0.4 + index * 0.2}s`
                }}></div>
              )}
            </div>
          ))}
        </div>
        
        {/* Feature cards */}
        <div className="row g-4 position-relative">
          {features.map((feature, index) => (
            <div 
              key={feature.id} 
              className="col-md-4 feature-column"
              style={{
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                opacity: isVisible ? 1 : 0,
                transition: `transform 0.6s ease-out ${index * 0.2}s, opacity 0.6s ease-out ${index * 0.2}s`,
              }}
            >
              {/* Step number - visible only on mobile */}
              <div className="d-md-none mb-3 text-center">
                <div 
                  className="step-number d-inline-flex align-items-center justify-content-center"
                  style={{ 
                    backgroundColor: feature.color,
                    boxShadow: `0 4px 12px ${feature.borderColor}`
                  }}
                >
                  Step {feature.id}
                </div>
              </div>
              
              <div 
                className="feature-card h-100 border-0 shadow-sm rounded-4 overflow-hidden"
                style={{
                  transition: 'all 0.3s ease',
                  transform: hoveredCard === feature.id ? 'translateY(-10px)' : 'translateY(0)',
                  boxShadow: hoveredCard === feature.id ? '0 15px 30px rgba(0,0,0,0.1)' : '0 5px 15px rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  borderTop: `4px solid ${feature.color}`
                }}
                onClick={() => handleCardClick(feature.link)}
                onMouseEnter={() => setHoveredCard(feature.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="card-body p-4">
                  <div 
                    className="feature-icon rounded-3 d-inline-flex align-items-center justify-content-center mb-3"
                    style={{
                      width: '56px',
                      height: '56px',
                      color: feature.color,
                      backgroundColor: feature.backgroundColor,
                      transition: 'all 0.3s ease',
                      transform: hoveredCard === feature.id ? 'scale(1.1)' : 'scale(1)'
                    }}
                  >
                    {feature.icon}
                  </div>
                  
                  <h3 
                    className="fs-4 fw-bold mb-3"
                    style={{
                      color: feature.color,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {feature.title}
                  </h3>
                  
                  <p className="text-secondary mb-0">
                    {feature.description}
                  </p>
                  
                  <div className="mt-4 text-end">
                    <div className="learn-more-btn" style={{ color: feature.color }}>
                      <span style={{ 
                        opacity: hoveredCard === feature.id ? 1 : 0,
                        transform: hoveredCard === feature.id ? 'translateX(0)' : 'translateX(-10px)',
                        transition: 'all 0.3s ease'
                      }}>
                        Learn more
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" style={{
                        marginLeft: hoveredCard === feature.id ? '8px' : '0',
                        transition: 'all 0.3s ease'
                      }}>
                        <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Stats section */}
      <div className="container mt-5 pt-5">
        <div className="stats-card text-white">
          {/* Decorative elements */}
          <div className="stats-decoration" style={{
            top: '-40px',
            right: '-40px',
          }}></div>
          
          <div className="stats-decoration" style={{
            bottom: '-20px',
            left: '-20px',
            width: '100px',
            height: '100px',
            animationDuration: '8s',
            animationDelay: '1s'
          }}></div>
          
          <div className="row g-4 position-relative" style={{zIndex: 2}}>
            <div className="col-6 col-md-3 text-center">
              <div className="display-5 fw-bold text-white mb-2 counter-value" data-target="500">500+</div>
              <p className="text-light mb-0">Active Users</p>
            </div>
            <div className="col-6 col-md-3 text-center">
              <div className="display-5 fw-bold text-white mb-2 counter-value" data-target="250">250+</div>
              <p className="text-light mb-0">Unique Skills</p>
            </div>
            <div className="col-6 col-md-3 text-center">
              <div className="display-5 fw-bold text-white mb-2 counter-value" data-target="1200">1,200+</div>
              <p className="text-light mb-0">Sessions Completed</p>
            </div>
            <div className="col-6 col-md-3 text-center">
              <div className="display-5 fw-bold text-white mb-2 counter-value" data-target="4.8">4.8</div>
              <p className="text-light mb-0">Average Rating</p>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .animated-badge {
          background: linear-gradient(90deg, rgba(99, 102, 241, 0.08) 0%, rgba(79, 70, 229, 0.1) 50%, rgba(99, 102, 241, 0.08) 100%);
          background-size: 200% 100%;
          animation: gradientMove 3s ease infinite;
          box-shadow: 0 4px 15px rgba(67, 56, 202, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.15);
          transition: all 0.3s ease;
        }
        
        .animated-badge:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(67, 56, 202, 0.2);
        }
        
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .rocket-icon {
          animation: slight-bounce 2s infinite ease-in-out;
        }
        
        .letter-spacing {
          letter-spacing: 1px;
        }
        
        .gradient-heading {
          background: linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #818cf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
          position: relative;
          display: inline-block;
        }
        
        .gradient-heading::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 4px;
          background: linear-gradient(90deg, #4338ca, #6366f1);
          border-radius: 2px;
        }
        
        @keyframes slight-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        
        .step-indicators {
          position: relative;
          padding: 0 40px;
          margin: 0 auto;
          max-width: 500px;
        }
        
        .step-indicator-container {
          display: flex;
          align-items: center;
          position: relative;
          z-index: 2;
          flex: 1;
        }
        
        .step-indicator {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          color: white;
          font-weight: bold;
          font-size: 18px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          z-index: 2;
          flex-shrink: 0;
        }
        
        .step-connector {
          height: 3px;
          flex-grow: 1;
          margin: 0 -5px;
          z-index: 1;
          transform-origin: left;
        }
        
        .step-number {
          background-color: #6366f1;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .learn-more-btn {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          font-weight: 500;
          font-size: 0.95rem;
          opacity: 0.7;
          transition: all 0.3s ease;
        }
        
        .feature-card:hover .learn-more-btn {
          opacity: 1;
        }
        
        .stats-card {
          background: linear-gradient(135deg, #4338ca 0%, #6366f1 100%);
          border-radius: 16px;
          padding: 40px 20px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 15px 30px rgba(67, 56, 202, 0.2);
        }
        
        .stats-decoration {
          position: absolute;
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          animation: pulse 6s infinite;
        }
        
        .counter-value {
          position: relative;
          display: inline-block;
        }
        
        .py-md-7 {
          padding-top: 5rem;
          padding-bottom: 5rem;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.15;
          }
          100% {
            transform: scale(1);
            opacity: 0.1;
          }
        }
        
        .how-it-works-section {
          position: relative;
        }
        
        .how-it-works-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100%;
          background-image: radial-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px);
          background-size: 20px 20px;
          pointer-events: none;
        }
        
        /* Add spacing between feature columns on mobile */
        @media (max-width: 767px) {
          .feature-column {
            margin-bottom: 1.5rem;
          }
        }
        
        .sparkle-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
        }
        
        .sparkle {
          position: absolute;
          opacity: 0.8;
          z-index: -1;
        }
        
        .sparkle-1 {
          top: -8px;
          right: 10%;
          animation: float 4s ease-in-out infinite, spin 8s linear infinite;
        }
        
        .sparkle-2 {
          bottom: 15px;
          left: 18%;
          animation: float 5s ease-in-out 1s infinite, spin 10s linear infinite reverse;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
