'use client';

import { useState } from 'react';
import Link from 'next/link';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(false);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    }, 1500);
  };

  return (
    <div className="container py-5 min-vh-100 bg-light">
      {/* Hero section */}
      <div className="bg-primary text-white rounded-4 p-5 mb-5">
        <div className="row align-items-center">
          <div className="col-md-7">
            <span className="badge bg-light text-primary mb-3">Get in Touch</span>
            <h1 className="display-4 fw-bold mb-3">Contact Us</h1>
            <p className="lead mb-4">Have questions or feedback? We'd love to hear from you. Our team is here to help and support you.</p>
          </div>
          <div className="col-md-5 text-center mt-4 mt-md-0">
            <div className="bg-white bg-opacity-25 rounded-4 p-4 d-inline-block">
              <div className="text-primary-200 small mb-1">Support hours</div>
              <div className="display-5 fw-bold mb-3">24/7</div>
              <div className="text-primary-200 small mb-1">Response time</div>
              <div className="display-5 fw-bold">24h</div>
            </div>
          </div>
        </div>
      </div>
      {/* Main content */}
      <div className="row g-5">
        {/* Contact form */}
        <div className="col-lg-6">
          <div className="card shadow-sm p-4">
            <h2 className="h4 fw-bold mb-4">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-12">
                <label htmlFor="name" className="form-label">Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="form-control" required />
              </div>
              <div className="col-12">
                <label htmlFor="email" className="form-label">Email</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="form-control" required />
              </div>
              <div className="col-12">
                <label htmlFor="subject" className="form-label">Subject</label>
                <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} className="form-control" required />
              </div>
              <div className="col-12">
                <label htmlFor="message" className="form-label">Message</label>
                <textarea id="message" name="message" rows={4} value={formData.message} onChange={handleChange} className="form-control" required />
              </div>
              <div className="col-12">
                <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center">
                  {isSubmitting ? (<><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Sending...</>) : (<><i className="bi bi-envelope me-2"></i> Send Message</>)}
                </button>
              </div>
            </form>
            {submitSuccess && (
              <div className="alert alert-success d-flex align-items-center mt-4" role="alert">
                <i className="bi bi-check-circle-fill me-2"></i>
                Thank you for reaching out! We've received your message and will get back to you soon.
              </div>
            )}
            {submitError && (
              <div className="alert alert-danger d-flex align-items-center mt-4" role="alert">
                <i className="bi bi-x-circle-fill me-2"></i>
                There was an error sending your message. Please try again later.
              </div>
            )}
          </div>
        </div>
        {/* Contact information, social, FAQ */}
        <div className="col-lg-6">
          <div className="card shadow-sm p-4 mb-4">
            <h2 className="h4 fw-bold mb-4">Contact Information</h2>
            <div className="mb-3 d-flex align-items-start">
              <div className="bg-primary bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center me-3" style={{width: '48px', height: '48px'}}>
                <i className="bi bi-telephone text-primary fs-4"></i>
              </div>
              <div>
                <div className="fw-semibold">Phone</div>
                <div>+1 (555) 123-4567</div>
                <div className="text-secondary small">Monday - Friday, 9am - 6pm EST</div>
              </div>
            </div>
            <div className="mb-3 d-flex align-items-start">
              <div className="bg-primary bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center me-3" style={{width: '48px', height: '48px'}}>
                <i className="bi bi-envelope text-primary fs-4"></i>
              </div>
              <div>
                <div className="fw-semibold">Email</div>
                <div>support@skillshikhi.com</div>
                <div className="text-secondary small">We'll respond within 24 hours</div>
              </div>
            </div>
            <div className="mb-3 d-flex align-items-start">
              <div className="bg-primary bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center me-3" style={{width: '48px', height: '48px'}}>
                <i className="bi bi-geo-alt text-primary fs-4"></i>
              </div>
              <div>
                <div className="fw-semibold">Location</div>
                <div>123 Learning Street</div>
                <div>New York, NY 10001</div>
                <div className="text-secondary small">United States</div>
              </div>
            </div>
          </div>
          <div className="card shadow-sm p-4 mb-4">
            <h2 className="h4 fw-bold mb-4">Follow Us</h2>
            <div className="d-flex gap-3">
              <a href="https://twitter.com/skillshikhi" target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary rounded-circle d-flex align-items-center justify-content-center" style={{width: '48px', height: '48px'}}><i className="bi bi-twitter"></i></a>
              <a href="https://linkedin.com/company/skillshikhi" target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary rounded-circle d-flex align-items-center justify-content-center" style={{width: '48px', height: '48px'}}><i className="bi bi-linkedin"></i></a>
              <a href="https://facebook.com/skillshikhi" target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary rounded-circle d-flex align-items-center justify-content-center" style={{width: '48px', height: '48px'}}><i className="bi bi-facebook"></i></a>
              <a href="https://instagram.com/skillshikhi" target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary rounded-circle d-flex align-items-center justify-content-center" style={{width: '48px', height: '48px'}}><i className="bi bi-instagram"></i></a>
            </div>
          </div>
          <div className="card shadow-sm p-4">
            <h2 className="h4 fw-bold mb-4">FAQ</h2>
            <div className="mb-3">
              <div className="fw-semibold">How can I become a teacher?</div>
              <div className="text-secondary">To become a teacher, simply create an account and submit a teaching request. Our team will review your application and get back to you within 48 hours.</div>
            </div>
            <div className="mb-3">
              <div className="fw-semibold">What skills can I teach?</div>
              <div className="text-secondary">You can teach any skill you're passionate about and have expertise in. From academic subjects to hobbies, crafts, and professional skills.</div>
            </div>
            <div>
              <div className="fw-semibold">How do I schedule a session?</div>
              <div className="text-secondary">Once you find a teacher you'd like to learn from, you can browse their available time slots and book a session directly through our platform.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 