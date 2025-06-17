import ClientOnly from './ClientOnly';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function HeroSection() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const heroRef = useRef(null);

  // Mouse parallax effect
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
  };

  useEffect(() => {
    // Check authentication status
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    }
    
    // Trigger animations with slight delay for better visual effect
    const visibleTimeout = setTimeout(() => setIsVisible(true), 100);
    const animTimeout = setTimeout(() => setAnimationComplete(true), 1200);
    
    // Add mousemove listener for parallax
    const heroElement = heroRef.current;
    if (heroElement) {
      heroElement.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      clearTimeout(visibleTimeout);
      clearTimeout(animTimeout);
      if (heroElement) {
        heroElement.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  // Calculate parallax movement
  const getParallaxStyle = (depth = 30) => {
    if (!heroRef.current) return {};
    const centerX = heroRef.current.offsetWidth / 2;
    const centerY = heroRef.current.offsetHeight / 2;
    const moveX = (mousePosition.x - centerX) / depth;
    const moveY = (mousePosition.y - centerY) / depth;
    return {
      transform: `translate(${moveX}px, ${moveY}px)`,
      transition: 'transform 0.1s ease-out'
    };
  };

  // Handle button clicks with loading state
  const handleButtonClick = (path) => {
    setIsLoading(true);
    
    // Add a small delay to show loading animation
    setTimeout(() => {
      router.push(path);
    }, 300);
  };

  return (
    <section ref={heroRef} className="hero-section position-relative overflow-hidden py-5 py-md-6" aria-label="Hero section"> 
      {/* Animated background */}
      <div className="animated-bg position-absolute top-0 start-0 w-100 h-100" style={{
        background: 'linear-gradient(135deg, rgba(239, 242, 255, 0.8) 0%, rgba(236, 248, 255, 0.8) 100%)',
        zIndex: -2
      }} aria-hidden="true"></div>
      
      {/* Animated pattern overlay */}
      <div className="position-absolute top-0 start-0 w-100 h-100" style={{
        backgroundImage: 'radial-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
        opacity: 0.6,
        zIndex: -1,
        animation: 'movePattern 60s linear infinite'
      }} aria-hidden="true"></div>

      {/* Background elements */}
      <div className="position-absolute top-0 end-0 d-none d-lg-block" style={{
        width: '900px',
        height: '900px',
        background: 'radial-gradient(circle, rgba(67,56,202,0.07) 0%, rgba(255,255,255,0) 70%)',
        transform: 'translate(200px, -400px)',
        borderRadius: '50%',
        zIndex: -1
      }}></div>
      
      <div className="position-absolute bottom-0 start-0 d-none d-lg-block" style={{
        width: '700px',
        height: '700px',
        background: 'radial-gradient(circle, rgba(67,56,202,0.06) 0%, rgba(255,255,255,0) 70%)',
        transform: 'translate(-200px, 200px)',
        borderRadius: '50%',
        zIndex: -1
      }}></div>

      {/* Animated particles */}
      <div className="position-absolute d-none d-lg-block floating-element" 
        style={{
          ...getParallaxStyle(20),
          top: '15%',
          left: '10%',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: 'rgba(99, 102, 241, 0.7)',
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.5s ease'
        }}
      ></div>
      
      <div className="position-absolute d-none d-lg-block floating-element" 
        style={{
          ...getParallaxStyle(15),
          top: '25%',
          right: '15%',
          width: '20px',
          height: '20px',
          backgroundColor: 'rgba(14, 165, 233, 0.6)',
          transform: 'rotate(45deg)',
          boxShadow: '0 0 20px rgba(14, 165, 233, 0.3)',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.5s ease 0.3s'
        }}
      ></div>
      
      <div className="position-absolute d-none d-lg-block floating-element" 
        style={{
          ...getParallaxStyle(25),
          bottom: '20%',
          left: '20%',
          width: '15px',
          height: '15px',
          borderRadius: '50%',
          backgroundColor: 'rgba(245, 158, 11, 0.6)',
          boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.5s ease 0.6s'
        }}
      ></div>
      
      {/* Additional particles */}
      <div className="position-absolute d-none d-lg-block floating-element" 
        style={{
          ...getParallaxStyle(22),
          top: '35%',
          right: '25%',
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          backgroundColor: 'rgba(16, 185, 129, 0.6)',
          boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.5s ease 0.5s'
        }}
      ></div>
      
      <div className="position-absolute d-none d-lg-block floating-element" 
        style={{
          ...getParallaxStyle(18),
          bottom: '30%',
          right: '10%',
          width: '16px',
          height: '16px',
          borderRadius: '3px',
          backgroundColor: 'rgba(236, 72, 153, 0.6)',
          boxShadow: '0 0 20px rgba(236, 72, 153, 0.3)',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.5s ease 0.4s'
        }}
      ></div>
      
      <div className="container position-relative">
        <div className="row g-5 align-items-center justify-content-between">
          {/* Text Content */}
          <div className="col-lg-6" style={{
            transition: 'all 1s ease-out',
            transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.98)',
            opacity: isVisible ? 1 : 0
          }}>
            <div className="mb-4 slide-in-left" 
              style={{
                animationDelay: '0.3s', 
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 1s ease'
              }}
              aria-hidden={!isVisible}
            >
              <span className="d-flex align-items-center" style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
                transition: 'all 0.6s ease'
              }}>
                <div className="me-2 text-primary" style={{
                  fontSize: '1.2rem', 
                  opacity: 0.9,
                  animation: 'sparkle 3s infinite'
                }}>✨</div>
                <div className="text-primary small fw-medium" style={{
                  letterSpacing: '0.5px'
                }}>SKILL SHARING PLATFORM</div>
              </span>
            </div>
            
            <h1 className="display-4 fw-bold mb-4 lh-sm" style={{
              background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #818cf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textFillColor: 'transparent',
            }}>
              <div className="position-relative d-inline-block text-highlight">
                <span className="text-highlight-content">Learn</span>
                <svg 
                  viewBox="0 0 70 8" 
                  width="70" 
                  height="8" 
                  className="position-absolute" 
                  style={{
                    left: '0',
                    bottom: '-5px',
                    fill: 'none',
                    stroke: '#4338ca',
                    strokeWidth: '3',
                    strokeLinecap: 'round',
                    strokeDasharray: '1, 12',
                    strokeDashoffset: isVisible ? '0' : '100',
                    opacity: isVisible ? 1 : 0,
                    transition: 'all 1.2s ease 0.7s'
                  }}
                >
                  <path d="M1,4.5 C20,1.5 46,1.5 69,4.5" />
                </svg>
              </div>{' '}
              and{' '}
              <div className="position-relative d-inline-block text-highlight">
                <span className="text-highlight-content">Share</span>
                <svg 
                  viewBox="0 0 90 8" 
                  width="90" 
                  height="8" 
                  className="position-absolute" 
                  style={{
                    left: '0',
                    bottom: '-5px',
                    fill: 'none',
                    stroke: '#4338ca',
                    strokeWidth: '3',
                    strokeLinecap: 'round',
                    strokeDasharray: '1, 12',
                    strokeDashoffset: isVisible ? '0' : '100',
                    opacity: isVisible ? 1 : 0,
                    transition: 'all 1.2s ease 0.9s'
                  }}
                >
                  <path d="M1,4.5 C30,1.5 56,1.5 89,4.5" />
                </svg>
              </div>
              <br />
              <div className="position-relative d-inline-block typing-text">
                <span>Skills in Your</span>
              </div>
              <br className="d-block d-sm-none" />
              <div className="position-relative d-inline-block text-highlight">
                <span className="text-highlight-content">Community</span>
                <div className="position-absolute bottom-0 start-0 w-100 community-highlight" style={{
                  height: '8px',
                  background: 'rgba(99, 102, 241, 0.2)',
                  borderRadius: '4px',
                  transform: isVisible ? 'scaleX(1)' : 'scaleX(0)',
                  transformOrigin: 'left',
                  transition: 'transform 1s ease 1.1s'
                }}></div>
              </div>
            </h1>
            
            <p className="lead text-secondary mb-5 slide-in-left"
              style={{
                animationDelay: '0.6s',
                maxWidth: '540px',
                fontSize: '1.2rem', 
                lineHeight: '1.7',
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 1s ease 0.4s'
              }}
              aria-hidden={!isVisible}
            >
              SkillShikhi connects people who want to learn with those who want to teach.
              Share your expertise, discover new skills, and grow together in a supportive environment.
            </p>
            
            <ClientOnly>
              <div className="d-flex flex-column flex-sm-row gap-3 mt-4 slide-in-left"
                style={{
                  animationDelay: '0.9s',
                  opacity: isVisible ? 1 : 0,
                  transition: 'opacity 1s ease 0.7s'
                }}
                aria-hidden={!isVisible}
              >
                <button 
                  className="btn btn-primary btn-lg px-4 py-3 rounded-pill fw-medium position-relative overflow-hidden hero-btn explore-btn"
                  onClick={() => handleButtonClick('/skills')}
                  disabled={isLoading}
                  style={{
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 14px rgba(67, 56, 202, 0.3)',
                    border: 'none'
                  }}
                  aria-label="Explore Skills"
                >
                  <span className="position-relative d-flex align-items-center justify-content-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="me-2" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                      <path d="M6.428 1.151C6.708.591 7.213 0 8 0s1.292.592 1.572 1.151C9.861 1.73 10 2.431 10 3v3.691l5.17 2.585a1.5 1.5 0 0 1 .83 1.342V12a.5.5 0 0 1-.582.493l-5.507-.918-.375 2.253 1.318 1.318A.5.5 0 0 1 10.5 16h-5a.5.5 0 0 1-.354-.854l1.319-1.318-.376-2.253-5.507.918A.5.5 0 0 1 0 12v-1.382a1.5 1.5 0 0 1 .83-1.342L6 6.691V3c0-.568.14-1.271.428-1.849Zm.894.448C7.111 2.02 7 2.569 7 3v4a.5.5 0 0 1-.276.447l-5.448 2.724a.5.5 0 0 0-.276.447v.792l5.418-.903a.5.5 0 0 1 .575.41l.5 3a.5.5 0 0 1-.14.437L6.708 15h2.586l-.647-.646a.5.5 0 0 1-.14-.436l.5-3a.5.5 0 0 1 .576-.411L15 11.41v-.792a.5.5 0 0 0-.276-.447L9.276 7.447A.5.5 0 0 1 9 7V3c0-.432-.11-.979-.322-1.401C8.458 1.159 8.213 1 8 1c-.213 0-.458.158-.678.599Z"/>
                    </svg>
                    Explore Skills
                  </span>
                  <div className="button-effect"></div>
                </button>
                <button 
                  className="btn btn-outline-primary btn-lg px-4 py-3 rounded-pill fw-medium position-relative overflow-hidden hero-btn teach-btn"
                  onClick={() => handleButtonClick('/teaching-request')}
                  disabled={isLoading}
                  style={{
                    transition: 'all 0.3s ease',
                    borderWidth: '2px'
                  }}
                  aria-label="Teach a Skill"
                >
                  <span className="position-relative d-flex align-items-center justify-content-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="me-2" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                      <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5ZM3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.58 26.58 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.933.933 0 0 1-.765.935c-.845.147-2.34.346-4.235.346-1.895 0-3.39-.2-4.235-.346A.933.933 0 0 1 3 9.219V8.062Zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a24.767 24.767 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25.286 25.286 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.135Z"/>
                      <path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A1.5 1.5 0 0 0 4 4.5v8.5a1.5 1.5 0 0 0 1.5 1.5h5A1.5 1.5 0 0 0 12 13V4.5A1.5 1.5 0 0 0 10.5 3h-2V1.866ZM7 2.5a.5.5 0 0 1 .5-.5.5.5 0 0 1 .5.5V3h-1V2.5ZM5 4.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5V13a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5V4.5Z"/>
                    </svg>
                    Teach a Skill
                  </span>
                  <div className="button-effect"></div>
                </button>
              </div>
            </ClientOnly>
            
            <div className="mt-5 d-flex flex-column flex-sm-row align-items-center gap-3 text-secondary slide-in-left"
              style={{
                animationDelay: '1.2s',
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 1s ease 1s'
              }}
              aria-hidden={!isVisible}
            >
              <div className="position-relative" style={{ height: '40px', width: '140px' }}>
                {[1, 2, 3, 4].map((num) => (
                  <div 
                    key={num} 
                    className="rounded-circle bg-gradient-primary text-white d-flex align-items-center justify-content-center border-2 border-white shadow position-absolute" 
                    style={{
                      width: '40px', 
                      height: '40px', 
                      left: `${(num - 1) * 30}px`, 
                      zIndex: 5-num, 
                      top: 0,
                      backgroundImage: 'linear-gradient(135deg, #6366f1, #4338ca)',
                      transition: `all 0.5s ease ${0.3 + (num * 0.1)}s`,
                      transform: isVisible ? 'translateX(0) scale(1)' : 'translateX(-20px) scale(0.8)',
                      opacity: isVisible ? 1 : 0
                    }}
                  >
                    {String.fromCharCode(64 + num)}
                  </div>
                ))}
              </div>
              <p className="mb-0 ms-2 fw-medium" style={{
                transition: 'all 0.5s ease 0.7s',
                transform: isVisible ? 'translateX(0)' : 'translateX(-20px)',
                opacity: isVisible ? 1 : 0
              }}>
                <span className="fw-bold text-primary">500+</span> community members already sharing skills
              </p>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="col-lg-5 d-none d-md-block" style={{
            transition: 'all 1s ease-out',
            transitionDelay: '300ms',
            transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.95)',
            opacity: isVisible ? 1 : 0
          }}
          aria-hidden={!isVisible}>
            <div className="position-relative rounded-5 overflow-hidden shadow-lg" style={{
              background: 'linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%)',
              ...getParallaxStyle(60)
            }}>
              <div className="position-absolute top-0 start-0 end-0 bottom-0 bg-light opacity-75"></div>
              
              {/* Enhanced interactive illustration */}
              <div className="position-relative p-4" style={{ height: '350px' }}>
                {/* Central connection animation */}
                <div className="connection-line position-absolute" style={{
                  top: '40%',
                  left: '36%',
                  width: '28%',
                  height: '3px',
                  background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.7) 0%, rgba(59, 130, 246, 0.7) 100%)',
                  zIndex: 2,
                  transform: `translate(${mousePosition.x / 120}px, ${mousePosition.y / 120}px)`,
                  transition: 'transform 0.2s ease-out'
                }}>
                  <div className="skill-badge position-absolute bg-primary text-white px-2 py-1 rounded-2 shadow-sm fw-bold" style={{
                    top: '-13px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '0.7rem',
                    letterSpacing: '0.5px',
                    animation: 'pulse 2s infinite'
                  }}>
                    SKILL
                  </div>
                  
                  {/* Animated dots */}
                  <div className="animated-dot" style={{
                    position: 'absolute',
                    top: '0px',
                    left: '0%',
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: '#6366f1',
                    animation: 'moveDotRight 3s infinite'
                  }}></div>
                  
                  <div className="animated-dot" style={{
                    position: 'absolute',
                    top: '0px',
                    right: '0%',
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: '#3b82f6',
                    animation: 'moveDotLeft 3s infinite'
                  }}></div>
                </div>
                
                {/* Left person circle */}
                <div className="person-circle position-absolute bg-primary rounded-circle d-flex align-items-center justify-content-center shadow" style={{
                  left: '25%',
                  top: '40%',
                  width: '70px',
                  height: '70px',
                  transform: `translate(${mousePosition.x / -90}px, ${mousePosition.y / 90}px)`,
                  transition: 'transform 0.2s ease-out',
                  zIndex: 3
                }}>
                  <div className="person-icon text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z"/>
                    </svg>
                  </div>
                </div>
                
                {/* Right person circle */}
                <div className="person-circle position-absolute bg-info rounded-circle d-flex align-items-center justify-content-center shadow" style={{
                  right: '25%',
                  top: '40%',
                  width: '70px',
                  height: '70px',
                  transform: `translate(${mousePosition.x / 90}px, ${mousePosition.y / 90}px)`,
                  transition: 'transform 0.2s ease-out',
                  zIndex: 3
                }}>
                  <div className="person-icon text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z"/>
                    </svg>
                  </div>
                </div>
                
                {/* Background elements */}
                <div className="position-absolute rounded-circle bg-info bg-opacity-20" style={{
                  width: '150px',
                  height: '150px',
                  right: '15%',
                  top: '20%',
                  transform: `translate(${mousePosition.x / 60}px, ${mousePosition.y / 60}px)`,
                  transition: 'transform 0.3s ease-out',
                  zIndex: 1
                }}></div>
                
                <div className="position-absolute rounded-circle bg-warning bg-opacity-20" style={{
                  width: '100px',
                  height: '100px',
                  left: '20%',
                  bottom: '15%',
                  transform: `translate(${mousePosition.x / -70}px, ${mousePosition.y / 70}px)`,
                  transition: 'transform 0.3s ease-out',
                  zIndex: 1
                }}></div>
                
                <div className="position-absolute rounded bg-success bg-opacity-20" style={{
                  width: '80px',
                  height: '80px',
                  right: '30%',
                  bottom: '20%',
                  transform: `translate(${mousePosition.x / 50}px, ${mousePosition.y / 50}px)`,
                  transition: 'transform 0.3s ease-out',
                  zIndex: 1
                }}></div>
                
                {/* Connection lines */}
                <svg className="position-absolute top-0 start-0" width="100%" height="100%" style={{ zIndex: 2 }}>
                  {/* Left person connections */}
                  <path d="M80,180 Q60,100 120,60" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="1.5" fill="none" />
                  <path d="M80,180 Q20,160 40,220" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="1.5" fill="none" />
                  
                  {/* Right person connections */}
                  <path d="M270,180 Q290,120 240,50" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="1.5" fill="none" />
                  <path d="M270,180 Q320,200 290,230" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="1.5" fill="none" />
                </svg>
                
                {/* Small connected nodes */}
                <div className="small-node position-absolute bg-primary rounded-circle" style={{
                  width: '18px',
                  height: '18px',
                  left: '35%',
                  top: '17%',
                  transform: `translate(${mousePosition.x / -40}px, ${mousePosition.y / -40}px)`,
                  transition: 'transform 0.4s ease-out',
                  animation: 'pulse 3s infinite 0.5s'
                }}></div>
                
                <div className="small-node position-absolute bg-warning rounded-circle" style={{
                  width: '20px',
                  height: '20px',
                  left: '12%',
                  top: '62%',
                  transform: `translate(${mousePosition.x / -30}px, ${mousePosition.y / 30}px)`,
                  transition: 'transform 0.4s ease-out',
                  animation: 'pulse 3s infinite 1s'
                }}></div>
                
                <div className="small-node position-absolute bg-info rounded-circle" style={{
                  width: '16px',
                  height: '16px',
                  right: '25%',
                  top: '15%',
                  transform: `translate(${mousePosition.x / 50}px, ${mousePosition.y / -50}px)`,
                  transition: 'transform 0.4s ease-out',
                  animation: 'pulse 3s infinite 1.5s'
                }}></div>
                
                <div className="small-node position-absolute bg-success rounded-circle" style={{
                  width: '15px',
                  height: '15px',
                  right: '30%',
                  bottom: '22%',
                  transform: `translate(${mousePosition.x / 45}px, ${mousePosition.y / 45}px)`,
                  transition: 'transform 0.4s ease-out',
                  animation: 'pulse 3s infinite 0.2s'
                }}></div>
              </div>
            </div>
            
            {/* Floating community card */}
            <div 
              className="position-absolute bg-white rounded-4 shadow-lg p-3 d-flex align-items-center community-card" 
              style={{
                bottom: '5%',
                right: '-5%',
                zIndex: 20,
                width: '220px',
                transform: isVisible ? 'translateY(0) rotate(0)' : 'translateY(30px) rotate(-5deg)',
                opacity: isVisible ? 1 : 0,
                transition: 'all 1s ease 0.8s',
                ...getParallaxStyle(45)
              }}
            >
              <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style={{minWidth: '42px', height: '42px'}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#10b981" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                </svg>
              </div>
              <div className="flex-grow-1">
                <p className="mb-0 fw-medium" style={{color: '#4b5563', fontSize: '0.9rem'}}>Join our growing community today!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-light position-relative" style={{ marginTop: '4rem' }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" style={{width: '100%', display: 'block', marginBottom: '-1px'}} aria-hidden="true">
          <path fill="#f8f9fa" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,128C672,128,768,160,864,160C960,160,1056,128,1152,106.7C1248,85,1344,75,1392,69.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
      
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-10px) rotate(0); }
          100% { transform: translateY(0) rotate(0); }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }
        
        @keyframes movePattern {
          0% { background-position: 0 0; }
          100% { background-position: 100px 100px; }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0.9; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        
        @keyframes moveDotRight {
          0% { transform: translateX(0); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes moveDotLeft {
          0% { transform: translateX(0); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateX(-100%); opacity: 0; }
        }
        
        .floating-element {
          animation: float 6s infinite ease-in-out;
        }
        
        .bg-gradient-primary {
          background-image: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);
        }

        .hero-section {
          min-height: 85vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .text-highlight-content {
          position: relative;
          z-index: 2;
        }
        
        .typing-text::after {
          content: '|';
          animation: blink 1s infinite;
          opacity: 0;
          animation-delay: 2s;
        }
        
        @keyframes blink {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        
        .hero-btn {
          transform: translateY(0);
          transition: all 0.3s ease !important;
        }
        
        .hero-btn:hover {
          transform: translateY(-3px);
        }
        
        .explore-btn:hover {
          box-shadow: 0 6px 18px rgba(67, 56, 202, 0.4) !important;
        }
        
        .teach-btn:hover {
          background-color: rgba(67, 56, 202, 0.05);
          box-shadow: 0 4px 12px rgba(67, 56, 202, 0.15);
        }

        @media (max-width: 768px) {
          .hero-section {
            min-height: auto;
            padding-top: 6rem;
          }
        }

        .button-effect {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          opacity: 0;
          transition: width 0.6s ease-out, height 0.6s ease-out, opacity 0.6s ease-out;
        }

        .btn:active .button-effect {
          width: 200px;
          height: 200px;
          opacity: 1;
          transition: width 0.6s ease-out, height 0.6s ease-out, opacity 0s;
        }

        .community-card {
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .community-card:hover {
          transform: translateY(-5px) !important;
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15) !important;
          transition: all 0.3s ease !important;
        }

        .person-circle {
          transition: all 0.3s ease;
        }

        .person-circle:hover {
          transform: scale(1.1) !important;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.2) !important;
        }

        .skill-badge {
          box-shadow: 0 2px 10px rgba(67, 56, 202, 0.3);
        }
      `}</style>
    </section>
  );
}
