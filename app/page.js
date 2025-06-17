'use client';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const testimonialsRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    setIsPageLoaded(true);
    
    // Reset scroll position on page load
    window.scrollTo(0, 0);
    
    // Intersection Observer for animations
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
        }
      });
    }, observerOptions);
    
    // Observe all fade-in sections
    const fadeElements = document.querySelectorAll('.fade-in-section');
    fadeElements.forEach(el => observer.observe(el));
    
    return () => {
      fadeElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Handle button clicks with loading state
  const handleButtonClick = (path) => {
    setIsLoading(true);
    
    // Add a small delay to show loading animation
    setTimeout(() => {
      router.push(path);
    }, 300);
  };

  // Testimonial data
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Learned Photography",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      quote: "I've always wanted to learn photography. Through SkillShikhi, I connected with an expert who taught me everything from camera basics to advanced composition."
    },
    {
      name: "Michael Chen",
      role: "Taught Programming",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      quote: "Teaching programming on SkillShikhi has been rewarding. I've helped several people start their coding journey while reinforcing my own knowledge."
    },
    {
      name: "Priya Sharma",
      role: "Learned Cooking",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      quote: "Thanks to SkillShikhi, I found someone in my neighborhood who taught me authentic regional recipes I couldn't learn from cookbooks or videos."
    }
  ];

  return (
    <div 
      className={`transition ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`} 
      style={{transition: 'opacity 0.7s ease-in'}}
    >
      <HeroSection />
      <FeaturesSection />
      
      {/* Testimonials section */}
      <section className="py-section bg-white fade-in-section" ref={testimonialsRef}>
        <div className="container">
          <div className="community-heading text-center mb-5">
            <div className="community-heading-flex">
              <span className="community-pill">
                <svg className="star-icon" width="24" height="24" viewBox="0 0 24 24" fill="#FFD700">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
              </span>
              <h2 className="community-title">What Our Community Says</h2>
            </div>
            <p className="community-subtitle">
              Hear from people who have connected through SkillShikhi
            </p>
          </div>
          
          {/* Desktop view - cards */}
          <div className="d-none d-md-flex row g-4">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="col-md-4">
                <div 
                  className="testimonial-card h-100 shadow-sm border-0 rounded-4 overflow-hidden"
                  style={{
                    transform: isPageLoaded ? 'translateY(0)' : 'translateY(20px)',
                    opacity: isPageLoaded ? 1 : 0,
                    transition: `all 0.7s ease-out ${0.2 + index * 0.1}s`
                  }}
                >
                  <div className="card-body p-4">
                    {/* Decorative quotes */}
                    <div 
                      className="position-absolute top-0 end-0 opacity-10 me-2 mt-2" 
                      style={{
                        fontSize: '4rem', 
                        lineHeight: 1, 
                        fontFamily: 'serif',
                        color: '#4338ca',
                        transform: 'scaleX(-1)'
                      }}
                    >
                      "
                    </div>
                    
                    <div className="d-flex align-items-center mb-3">
                      <div className="position-relative rounded-circle overflow-hidden me-3 border border-2 border-primary avatar-border" style={{width: '64px', height: '64px'}}>
                        <Image 
                          src={testimonial.image} 
                          alt={testimonial.name}
                          width={64}
                          height={64}
                          className="avatar-img"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/100x100/e2e8f0/1e40af?text=SK";
                          }}
                        />
                      </div>
                      <div>
                        <h5 className="card-title mb-0 text-primary fw-semibold">{testimonial.name}</h5>
                        <p className="text-secondary mb-0 small">{testimonial.role}</p>
                      </div>
                    </div>
                    <p className="card-text text-secondary fst-italic">{testimonial.quote}</p>
                    
                    {/* Rating stars */}
                    <div className="d-flex mt-3 text-warning">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-star-fill me-1" viewBox="0 0 16 16">
                          <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Mobile view - carousel */}
          <div className="d-md-none position-relative">
            <div className="testimonial-carousel">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index} 
                  className={`testimonial-slide card border-0 shadow-sm rounded-4 p-4 ${index === activeTestimonial ? 'active' : ''}`}
                  style={{
                    opacity: index === activeTestimonial ? 1 : 0,
                    transform: `translateX(${(index - activeTestimonial) * 100}%)`,
                    transition: 'all 0.5s ease'
                  }}
                >
                  {/* Decorative quotes */}
                  <div 
                    className="position-absolute top-0 end-0 opacity-10 me-2 mt-2" 
                    style={{
                      fontSize: '4rem', 
                      lineHeight: 1, 
                      fontFamily: 'serif',
                      color: '#4338ca',
                      transform: 'scaleX(-1)'
                    }}
                  >
                    "
                  </div>
                  
                  <div className="d-flex align-items-center mb-3">
                    <div className="position-relative rounded-circle overflow-hidden me-3 border border-2 border-primary avatar-border" style={{width: '64px', height: '64px'}}>
                      <Image 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        width={64}
                        height={64}
                        className="avatar-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/100x100/e2e8f0/1e40af?text=SK";
                        }}
                      />
                    </div>
                    <div>
                      <h5 className="card-title mb-0 text-primary fw-semibold">{testimonial.name}</h5>
                      <p className="text-secondary mb-0 small">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="card-text text-secondary fst-italic">{testimonial.quote}</p>
                  
                  {/* Rating stars */}
                  <div className="d-flex mt-3 text-warning">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-star-fill me-1" viewBox="0 0 16 16">
                        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                      </svg>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Carousel controls */}
            <div className="d-flex justify-content-center mt-4 gap-2">
              {testimonials.map((_, index) => (
                <button 
                  key={index}
                  type="button"
                  className={`btn btn-sm rounded-circle p-0 ${index === activeTestimonial ? 'btn-primary' : 'btn-outline-primary'}`}
                  style={{width: '12px', height: '12px'}}
                  onClick={() => setActiveTestimonial(index)}
                  aria-label={`Testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA section */}
      <section className="cta-section fade-in-section" ref={ctaRef}>
        <div className="container position-relative">
          <div className="cta-bg-glow cta-bg-glow-1"></div>
          <div className="cta-bg-glow cta-bg-glow-2"></div>
          <div className="text-center py-4 position-relative" style={{zIndex: 1}}>
            <h2 className="cta-title mb-4">
              Ready to Share Your Skills?
            </h2>
            <p className="cta-subtitle mb-5 mx-auto">
              Join our growing community today and start your journey of learning and teaching.
            </p>
            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
              <button 
                onClick={() => handleButtonClick('/register')}
                disabled={isLoading}
                className="btn btn-light btn-lg text-primary px-5 py-3 shadow fw-medium rounded-pill position-relative overflow-hidden"
                style={{
                  transition: 'all 0.3s ease',
                  transform: 'translateY(0)'
                }}
                onMouseOver={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(67,56,202,0.18)';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 24px rgba(67,56,202,0.10)';
                }}
              >
                {isLoading ? (
                  <span className="d-flex align-items-center justify-content-center">
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Loading...
                  </span>
                ) : (
                  'Sign Up Now'
                )}
                <div className="button-effect"></div>
              </button>
              <button 
                onClick={() => handleButtonClick('/skills')}
                disabled={isLoading}
                className="btn btn-outline-light btn-lg px-5 py-3 fw-medium rounded-pill position-relative overflow-hidden"
                style={{
                  transition: 'all 0.3s ease',
                  transform: 'translateY(0)'
                }}
                onMouseOver={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                  }
                }}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {isLoading ? (
                  <span className="d-flex align-items-center justify-content-center">
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Loading...
                  </span>
                ) : (
                  'Explore Skills'
                )}
                <div className="button-effect"></div>
              </button>
            </div>
          </div>
        </div>
      </section>
      
      <style jsx>{`
        .testimonial-carousel {
          position: relative;
          height: 400px;
          overflow: hidden;
        }
        
        .testimonial-slide {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        
        .fade-in-section {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        
        .fade-in-section.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media (max-width: 768px) {
          .testimonial-carousel {
            height: 450px;
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

        .community-heading-flex {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.2rem;
          margin-bottom: 0.5rem;
        }
        .community-pill {
          background: #4f46e5;
          border-radius: 999px;
          padding: 0.5rem 2.5rem 0.5rem 1.2rem;
          display: flex;
          align-items: center;
          box-shadow: 0 2px 8px rgba(79,70,229,0.08);
        }
        .star-icon {
          animation: shine 2s infinite alternate;
        }
        @keyframes shine {
          0% { filter: brightness(1); }
          100% { filter: brightness(1.5); }
        }
        .community-title {
          font-size: 2.7rem;
          font-weight: 800;
          color: #4338ca;
          margin: 0;
        }
        .community-subtitle {
          margin-top: 0.5rem;
          color: #64748b;
          font-size: 1.25rem;
          font-weight: 400;
        }
        @media (max-width: 600px) {
          .community-title {
            font-size: 2rem;
          }
          .community-heading-flex {
            gap: 0.7rem;
          }
          .community-pill {
            padding: 0.4rem 1.2rem 0.4rem 0.7rem;
          }
        }
        .cta-section {
          position: relative;
          background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
          padding: 6rem 0 6rem 0;
          overflow: hidden;
        }
        .cta-title {
          color: #fff;
          font-size: 3rem;
          font-weight: 800;
          text-shadow: 0 4px 24px rgba(67,56,202,0.18);
        }
        .cta-subtitle {
          color: #e0e7ff;
          font-size: 1.5rem;
          font-weight: 400;
          max-width: 800px;
        }
        .cta-bg-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.5;
          z-index: 0;
          pointer-events: none;
        }
        .cta-bg-glow-1 {
          width: 350px;
          height: 350px;
          left: -100px;
          bottom: -80px;
          background: radial-gradient(circle, #818cf8 0%, transparent 70%);
        }
        .cta-bg-glow-2 {
          width: 350px;
          height: 350px;
          right: -100px;
          top: -80px;
          background: radial-gradient(circle, #a5b4fc 0%, transparent 70%);
        }
        .btn.btn-light {
          box-shadow: 0 4px 24px rgba(67,56,202,0.10);
          transition: box-shadow 0.2s, background 0.2s, color 0.2s;
        }
        .btn.btn-light:hover, .btn.btn-light:focus {
          box-shadow: 0 8px 32px rgba(67,56,202,0.18);
          background: #fff;
          color: #4f46e5;
        }
        .btn.btn-outline-light {
          border: 2px solid #e0e7ff;
          color: #fff;
          background: transparent;
          transition: background 0.2s, color 0.2s;
        }
        .btn.btn-outline-light:hover, .btn.btn-outline-light:focus {
          background: #fff;
          color: #4f46e5;
          border-color: #fff;
        }
        @media (max-width: 600px) {
          .cta-title { font-size: 2rem; }
          .cta-section { padding: 3rem 0; }
        }
      `}</style>
    </div>
  );
}