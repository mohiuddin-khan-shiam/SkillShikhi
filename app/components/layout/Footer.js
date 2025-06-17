'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState('');
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubscribeMessage('Please enter a valid email address');
      setSubscribeSuccess(false);
      return;
    }
    
    setIsSubscribing(true);
    setSubscribeMessage('');
    
    // Simulate API call with timeout
    setTimeout(() => {
      setIsSubscribing(false);
      setSubscribeMessage('Thanks for subscribing! We\'ve sent a confirmation email.');
      setSubscribeSuccess(true);
      setEmail('');
      setTimeout(() => {
        setSubscribeMessage('');
        setSubscribeSuccess(false);
      }, 5000);
    }, 1500);
  };

  return (
    <footer className="bg-light text-dark pt-5 pb-4 mt-auto position-relative" role="contentinfo" aria-label="Site footer">
      <div className="container py-4">
        <div className="row gy-4 gx-5">
          {/* Newsletter */}
          <div className="col-md-6 col-lg-5 mb-4 mb-lg-0">
            <h4 className="fs-5 fw-semibold mb-4 text-dark">Join Our Newsletter</h4>
            <p className="text-muted mb-4 small">
              Stay updated with the latest skills, events, and community happenings. We'll never spam your inbox.
            </p>
            
            {/* Newsletter Form */}
            <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
              <div className="input-group mb-3 shadow-sm rounded overflow-hidden">
                <input
                  type="email"
                  className="form-control border-0 py-2"
                  placeholder="Your email address"
                  aria-label="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button
                  className="btn btn-primary text-white fw-medium px-4"
                  type="submit"
                  disabled={isSubscribing}
                  aria-label="Subscribe to newsletter"
                >
                  {isSubscribing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      <span>Subscribing...</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-envelope-check me-2" viewBox="0 0 16 16" aria-hidden="true">
                        <path d="M2 2a2 2 0 0 0-2 2v8.01A2 2 0 0 0 2 14h5.5a.5.5 0 0 0 0-1H2a1 1 0 0 1-.966-.741l5.64-3.471L8 9.583l7-4.2V8.5a.5.5 0 0 0 1 0V4a2 2 0 0 0-2-2H2Zm3.708 6.208L1 11.105V5.383l4.708 2.825ZM1 4.217V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v.217l-7 4.2-7-4.2Z"/>
                        <path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Zm-1.993-1.679a.5.5 0 0 0-.686.172l-1.17 1.95-.547-.547a.5.5 0 0 0-.708.708l.774.773a.75.75 0 0 0 1.174-.144l1.335-2.226a.5.5 0 0 0-.172-.686Z"/>
                      </svg>
                      Subscribe
                    </>
                  )}
                </button>
              </div>
              {subscribeMessage && (
                <div className={`small mt-2 ${subscribeSuccess ? 'text-success' : 'text-danger'}`}>
                  {subscribeMessage}
                </div>
              )}
              <div className="form-text text-muted small mt-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-shield-check me-1" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M5.338 1.59a61.44 61.44 0 0 0-2.837.856.481.481 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.725 10.725 0 0 0 2.287 2.233c.346.244.652.42.893.533.12.057.218.095.293.118a.55.55 0 0 0 .101.025.615.615 0 0 0 .1-.025c.076-.023.174-.061.294-.118.24-.113.547-.29.893-.533a10.726 10.726 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.775 11.775 0 0 1-2.517 2.453 7.159 7.159 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7.158 7.158 0 0 1-1.048-.625 11.777 11.777 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 62.456 62.456 0 0 1 5.072.56z"/>
                  <path d="M10.854 5.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
                </svg>
                Your email is safe with us. We respect your privacy.
              </div>
            </form>
          </div>

          {/* Social Media Links */}
          <div className="col-md-6 col-lg-3 mb-4 mb-lg-0">
            <h4 className="fs-5 fw-semibold mb-4 text-dark">Follow Us</h4>
            <div className="d-flex gap-2 mb-4">
              <a
                href="https://twitter.com/skillshikhi"
                className="text-muted bg-light hover-bg-primary-soft rounded-circle p-2 d-flex align-items-center justify-content-center social-icon transition-all border"
                style={{ width: '36px', height: '36px' }}
                aria-label="Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-twitter-x" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z" />
                </svg>
              </a>
              <a
                href="https://facebook.com/skillshikhi"
                className="text-muted bg-light hover-bg-primary-soft rounded-circle p-2 d-flex align-items-center justify-content-center social-icon transition-all border"
                style={{ width: '36px', height: '36px' }}
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-facebook" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/skillshikhi"
                className="text-muted bg-light hover-bg-primary-soft rounded-circle p-2 d-flex align-items-center justify-content-center social-icon transition-all border"
                style={{ width: '36px', height: '36px' }}
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-instagram" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.738-.034-1.024-.044-2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com/company/skillshikhi"
                className="text-muted bg-light hover-bg-primary-soft rounded-circle p-2 d-flex align-items-center justify-content-center social-icon transition-all border"
                style={{ width: '36px', height: '36px' }}
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-linkedin" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z" />
                </svg>
              </a>
              <a
                href="https://github.com/skillshikhi"
                className="text-muted bg-light hover-bg-primary-soft rounded-circle p-2 d-flex align-items-center justify-content-center social-icon transition-all border"
                style={{ width: '36px', height: '36px' }}
                aria-label="GitHub"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-github" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-top border-white border-opacity-10 mt-5 pt-4 d-flex flex-column flex-md-row justify-content-between align-items-center small text-white text-opacity-75">
          <p className="mb-3 mb-md-0">&copy; {new Date().getFullYear()} SkillShikhi. All rights reserved.</p>
          <nav aria-label="Footer legal navigation">
            <ul className="list-inline mb-0">
              <li className="list-inline-item me-3">
                <Link href="/terms" className="text-white text-opacity-75 text-decoration-none hover-opacity-100 transition-all">Terms</Link>
              </li>
              <li className="list-inline-item me-3">
                <Link href="/privacy" className="text-white text-opacity-75 text-decoration-none hover-opacity-100 transition-all">Privacy</Link>
              </li>
              <li className="list-inline-item">
                <Link href="/cookies" className="text-white text-opacity-75 text-decoration-none hover-opacity-100 transition-all">Cookies</Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 