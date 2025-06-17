'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
    
    // Intersection Observer for fade-in sections
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

  const teamMembers = [
    {
      name: 'Rahul Sharma',
      role: 'Founder & CEO',
      bio: 'Passionate about connecting communities through skill sharing.',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
      name: 'Priya Patel',
      role: 'Head of Product',
      bio: 'Former educator with a vision to make learning accessible to everyone.',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
      name: 'Vikram Singh',
      role: 'Chief Technology Officer',
      bio: 'Tech enthusiast with expertise in building community platforms.',
      image: 'https://randomuser.me/api/portraits/men/67.jpg',
    },
  ];

  return (
    <div className="container py-5 min-vh-100 bg-light">
      {/* Hero section */}
      <div className="bg-primary text-white rounded-4 p-5 mb-5">
        <div className="row align-items-center">
          <div className="col-md-7">
            <span className="badge bg-light text-primary mb-3">Our Story</span>
            <h1 className="display-4 fw-bold mb-3">Empowering Communities Through Skill Sharing</h1>
            <p className="lead mb-4">We believe in the power of community-driven learning and the impact of sharing knowledge to create a better world.</p>
          </div>
          <div className="col-md-5 text-center mt-4 mt-md-0">
            <div className="bg-white bg-opacity-25 rounded-4 p-4 d-inline-block">
              <div className="text-primary-200 small mb-1">Founded in</div>
              <div className="display-5 fw-bold mb-3">2024</div>
              <div className="text-primary-200 small mb-1">Community members</div>
              <div className="display-5 fw-bold">500+</div>
            </div>
          </div>
        </div>
      </div>
      {/* Vision section */}
      <div className="card shadow-sm p-4 mb-5">
        <div className="mx-auto text-center" style={{maxWidth: '700px'}}>
          <h2 className="display-6 fw-bold mb-4">Our Vision</h2>
          <p className="lead text-secondary mb-4">We envision a world where knowledge flows freely within communities, where everyone has the opportunity to learn and grow, and where skills are shared to create meaningful connections and positive change.</p>
        </div>
        <div className="row g-4 mt-4">
          <div className="col-md-4">
            <div className="bg-primary bg-opacity-10 rounded-4 p-4 h-100">
              <div className="bg-primary bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{width: '48px', height: '48px'}}>
                <i className="bi bi-book-half text-primary fs-4"></i>
              </div>
              <h5 className="fw-semibold mb-2">Learn</h5>
              <p className="text-secondary">Access a diverse range of skills and knowledge from community experts.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="bg-primary bg-opacity-10 rounded-4 p-4 h-100">
              <div className="bg-primary bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{width: '48px', height: '48px'}}>
                <i className="bi bi-people-fill text-primary fs-4"></i>
              </div>
              <h5 className="fw-semibold mb-2">Connect</h5>
              <p className="text-secondary">Build meaningful relationships with fellow learners and teachers.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="bg-primary bg-opacity-10 rounded-4 p-4 h-100">
              <div className="bg-primary bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{width: '48px', height: '48px'}}>
                <i className="bi bi-bar-chart-line-fill text-primary fs-4"></i>
              </div>
              <h5 className="fw-semibold mb-2">Grow</h5>
              <p className="text-secondary">Develop new skills and contribute to your community's growth.</p>
            </div>
          </div>
        </div>
      </div>
      {/* Journey section */}
      <div className="card shadow-sm p-4 mb-5">
        <div className="mx-auto" style={{maxWidth: '700px'}}>
          <h2 className="display-6 fw-bold mb-4 text-center">Our Journey</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="d-flex align-items-start">
                <div className="bg-primary bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center" style={{width: '48px', height: '48px'}}>
                  <span className="text-primary fw-bold fs-5">1</span>
                </div>
                <div className="ms-3">
                  <h6 className="fw-semibold mb-1">The Beginning</h6>
                  <p className="text-secondary mb-0">Started with a simple idea: to connect people who want to learn with those who want to teach.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex align-items-start">
                <div className="bg-primary bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center" style={{width: '48px', height: '48px'}}>
                  <span className="text-primary fw-bold fs-5">2</span>
                </div>
                <div className="ms-3">
                  <h6 className="fw-semibold mb-1">Growing Community</h6>
                  <p className="text-secondary mb-0">Witnessed the power of community as more people joined to share and learn skills.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex align-items-start">
                <div className="bg-primary bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center" style={{width: '48px', height: '48px'}}>
                  <span className="text-primary fw-bold fs-5">3</span>
                </div>
                <div className="ms-3">
                  <h6 className="fw-semibold mb-1">Today & Beyond</h6>
                  <p className="text-secondary mb-0">Continuing to expand our platform and impact, making skill sharing accessible to everyone.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Team section */}
      <div className="card shadow-sm p-4 mb-5">
        <div className="mx-auto" style={{maxWidth: '700px'}}>
          <h2 className="display-6 fw-bold mb-4 text-center">Meet Our Team</h2>
          <div className="row g-4">
            {teamMembers.map((member) => (
              <div key={member.name} className="col-md-6 d-flex align-items-start">
                <img
                  src={member.image}
                  alt={member.name}
                  className="rounded-circle me-3"
                  style={{width: '80px', height: '80px', objectFit: 'cover'}}
                />
                <div>
                  <h6 className="fw-semibold mb-1">{member.name}</h6>
                  <div className="text-primary mb-1">{member.role}</div>
                  <p className="text-secondary mb-0">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* CTA section */}
      <div className="bg-primary text-white rounded-4 p-5 text-center">
        <h2 className="display-6 fw-bold mb-3">Join Our Community</h2>
        <p className="lead mb-4">Be part of our growing community of learners and teachers. Share your skills, learn from others, and make a difference.</p>
        <div className="d-flex flex-wrap justify-content-center gap-3">
          <a href="/signup" className="btn btn-light btn-lg fw-medium d-flex align-items-center">
            <i className="bi bi-person-plus me-2"></i> Join Now
          </a>
          <a href="/contact" className="btn btn-outline-light btn-lg fw-medium d-flex align-items-center">
            <i className="bi bi-envelope me-2"></i> Contact Us
          </a>
        </div>
      </div>
    </div>
  );
} 