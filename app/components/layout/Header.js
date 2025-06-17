'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 992);
    };
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    // Initial check
    handleResize();
    handleScroll();
    
    // Add event listeners with throttling/debouncing for better performance
    let resizeTimer;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 100);
    };
    
    let scrollTimer;
    const throttledScroll = () => {
      if (!scrollTimer) {
        scrollTimer = setTimeout(() => {
          handleScroll();
          scrollTimer = null;
        }, 100);
      }
    };
    
    window.addEventListener('resize', debouncedResize);
    window.addEventListener('scroll', throttledScroll);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', debouncedResize);
      window.removeEventListener('scroll', throttledScroll);
      clearTimeout(resizeTimer);
      clearTimeout(scrollTimer);
    };
  }, []);

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Prevent body scrolling when menu is open
    document.body.style.overflow = !isMenuOpen ? 'hidden' : '';
  };

  // Close menu when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMenuOpen && e.target.closest('.navbar') === null) {
        setIsMenuOpen(false);
        document.body.style.overflow = '';
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Close menu when navigating to a new page
  useEffect(() => {
    setIsMenuOpen(false);
    document.body.style.overflow = '';
  }, [pathname]);

  // Navigation links
  const navLinks = [
    { text: 'Home', href: '/' },
    { text: 'Skills', href: '/skills' },
    { text: 'Sessions', href: '/sessions' },
    { text: 'Community', href: '/community' },
    { text: 'About', href: '/about' },
    { text: 'Contact', href: '/contact' },
  ];

  return (
    <header className={`fixed-top ${isScrolled ? 'header-shadow' : ''}`} role="banner">
      <div className="container">
        <nav className="navbar navbar-expand-lg py-3" aria-label="Main navigation">
          <Link href="/" className="navbar-brand d-flex align-items-center" aria-label="SkillShikhi Home">
            <span className="d-flex align-items-center">
              <span className="me-2 d-flex align-items-center justify-content-center" style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#4338ca',
                borderRadius: '10px',
                boxShadow: '0 3px 10px rgba(67, 56, 202, 0.2)',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>S</span>
              <span className="fw-bold fs-4" style={{
                background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>SkillShikhi</span>
            </span>
          </Link>

          {/* Mobile toggle button */}
          <button 
            className="navbar-toggler border-0 shadow-none" 
            type="button" 
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation"
            aria-controls="navbarContent"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Desktop menu */}
          <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="navbarContent">
            <ul className="navbar-nav ms-auto align-items-center">
              {navLinks.map((link) => (
                <li key={link.href} className="nav-item mx-lg-1 my-1 my-lg-0">
                  <Link 
                    href={link.href} 
                    className={`nav-link px-3 py-2 ${pathname === link.href ? 'active fw-medium' : ''}`}
                    aria-current={pathname === link.href ? 'page' : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
              <li className="nav-item ms-lg-2 my-1 my-lg-0 d-flex align-items-center" style={{gap: '0.75rem'}}>
                <Link 
                  href="/login" 
                  className="btn btn-primary rounded-pill header-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="btn btn-primary rounded-pill header-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join Now
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      {/* Mobile menu overlay */}
      {isMobileView && isMenuOpen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-white"
          style={{
            zIndex: 999,
            opacity: 1,
            transition: 'opacity 0.3s ease',
            overflowY: 'auto',
            paddingTop: '80px',
            paddingBottom: '30px'
          }}
        >
          <div className="container">
            <ul className="list-unstyled">
              {navLinks.map((link) => (
                <li key={link.href} className="mb-3">
                  <Link 
                    href={link.href} 
                    className={`d-block p-3 rounded-3 fs-5 ${pathname === link.href 
                      ? 'bg-primary bg-opacity-10 text-primary fw-medium' 
                      : 'text-dark'}`}
                    onClick={() => setIsMenuOpen(false)}
                    aria-current={pathname === link.href ? 'page' : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
              <li className="py-3 mt-4">
                <Link 
                  href="/register" 
                  className="btn btn-primary rounded-pill px-4 py-3 d-block fw-medium"
                  onClick={() => setIsMenuOpen(false)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get Started
                </Link>
              </li>
            </ul>
            
            <div className="mt-5">
              <div className="d-flex gap-3 justify-content-center mb-4">
                <a 
                  href="https://twitter.com/skillshikhi" 
                  className="text-primary bg-primary bg-opacity-10 rounded-circle p-2 d-flex align-items-center justify-content-center"
                  style={{width: '38px', height: '38px'}}
                  aria-label="Twitter"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-twitter-x" viewBox="0 0 16 16">
                    <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"/>
                  </svg>
                </a>
                <a 
                  href="https://facebook.com/skillshikhi" 
                  className="text-primary bg-primary bg-opacity-10 rounded-circle p-2 d-flex align-items-center justify-content-center"
                  style={{width: '38px', height: '38px'}}
                  aria-label="Facebook"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-facebook" viewBox="0 0 16 16">
                    <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                  </svg>
                </a>
                <a 
                  href="https://instagram.com/skillshikhi" 
                  className="text-primary bg-primary bg-opacity-10 rounded-circle p-2 d-flex align-items-center justify-content-center"
                  style={{width: '38px', height: '38px'}}
                  aria-label="Instagram"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-instagram" viewBox="0 0 16 16">
                    <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
                  </svg>
                </a>
                <a 
                  href="https://linkedin.com/company/skillshikhi" 
                  className="text-primary bg-primary bg-opacity-10 rounded-circle p-2 d-flex align-items-center justify-content-center"
                  style={{width: '38px', height: '38px'}}
                  aria-label="LinkedIn"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-linkedin" viewBox="0 0 16 16">
                    <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .navbar-toggler {
          border: none;
          padding: 0;
          outline: none;
          box-shadow: none;
        }
        
        .nav-link {
          position: relative;
          transition: all 0.3s ease;
        }
        
        .nav-link:hover {
          color: var(--primary-600);
        }
        
        .nav-link.active {
          color: var(--primary-600);
        }
        
        .nav-link.active::after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: 0;
          transform: translateX(-50%);
          width: 20px;
          height: 2px;
          background-color: var(--primary-500);
        }
        
        @media (max-width: 991.98px) {
          .nav-link.active::after {
            display: none;
          }
        }
        
        .header-btn {
          min-width: 140px;
          max-width: 140px;
          text-align: center;
          font-size: 1.15rem;
          font-weight: 500;
          white-space: nowrap;
          padding-top: 0.7rem;
          padding-bottom: 0.7rem;
        }
      `}</style>
    </header>
  );
}
