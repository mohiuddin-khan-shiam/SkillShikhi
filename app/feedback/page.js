'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    feedbackType: '',
    rating: 0,
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

  const handleRatingChange = (rating) => {
    setFormData((prev) => ({
      ...prev,
      rating
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
        feedbackType: '',
        rating: 0,
        message: ''
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    }, 1500);
  };

  const feedbackTypes = [
    "General Feedback",
    "Feature Request",
    "Bug Report",
    "User Experience",
    "Content Feedback",
    "Other"
  ];

  return (
    <main className="pt-4 pb-5">
      <div className="container mt-5 pt-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="text-center mb-5">
              <span className="badge-custom bg-primary bg-opacity-10 text-primary px-3 py-2 mb-3 rounded-pill fw-medium d-inline-flex align-items-center">
                <span className="me-2" role="img" aria-label="feedback">📝</span>
                <span>Your Voice Matters</span>
              </span>
              <h1 className="display-5 fw-bold mb-3 gradient-text">Share Your Feedback</h1>
              <p className="text-secondary lead mx-auto" style={{ maxWidth: '700px' }}>
                We're constantly improving SkillShikhi based on your feedback. Let us know what you think about our platform, suggest new features, or report any issues.
              </p>
            </div>
            
            <div className="bg-white p-4 p-lg-5 rounded-4 shadow-sm">
              {submitSuccess ? (
                <div className="text-center py-5">
                  <div className="mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-check-circle-fill text-success" viewBox="0 0 16 16">
                      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                    </svg>
                  </div>
                  <h2 className="fs-3 fw-bold mb-3 text-primary">Thank You for Your Feedback!</h2>
                  <p className="text-secondary mb-4">
                    We appreciate you taking the time to share your thoughts with us. Your feedback helps us improve SkillShikhi for everyone.
                  </p>
                  <div className="d-flex justify-content-center gap-3 mt-4">
                    <Link href="/" className="btn btn-outline-primary rounded-pill px-4 py-2">
                      Return to Home
                    </Link>
                    <button 
                      onClick={() => setSubmitSuccess(false)} 
                      className="btn btn-primary rounded-pill px-4 py-2"
                    >
                      Submit More Feedback
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <label htmlFor="name" className="form-label">Full Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="name" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="email" className="form-label">Email Address</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        id="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                    
                    <div className="col-12">
                      <label htmlFor="feedbackType" className="form-label">Feedback Type</label>
                      <select 
                        className="form-select" 
                        id="feedbackType" 
                        name="feedbackType" 
                        value={formData.feedbackType} 
                        onChange={handleChange} 
                        required
                      >
                        <option value="" disabled>Select feedback type</option>
                        {feedbackTypes.map((type, index) => (
                          <option key={index} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="col-12">
                      <label className="form-label">How would you rate your experience?</label>
                      <div className="d-flex gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={`btn btn-outline-${formData.rating >= star ? 'warning' : 'secondary'} rounded-circle p-0 d-flex align-items-center justify-content-center`}
                            style={{ width: '42px', height: '42px' }}
                            onClick={() => handleRatingChange(star)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-star-fill" viewBox="0 0 16 16">
                              <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                            </svg>
                          </button>
                        ))}
                        <span className="ms-3 text-secondary align-self-center">
                          {formData.rating > 0 ? `${formData.rating} out of 5` : 'Select a rating'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="col-12">
                      <label htmlFor="message" className="form-label">Your Feedback</label>
                      <textarea 
                        className="form-control" 
                        id="message" 
                        name="message" 
                        rows="5" 
                        value={formData.message} 
                        onChange={handleChange} 
                        required
                        placeholder="Share your thoughts, suggestions, or report an issue..."
                      ></textarea>
                    </div>
                    
                    <div className="col-12 mt-4">
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="contactConsent" />
                        <label className="form-check-label text-secondary small" htmlFor="contactConsent">
                          I agree to be contacted about my feedback if needed for clarification or follow-up.
                        </label>
                      </div>
                    </div>
                    
                    <div className="col-12 mt-4">
                      <button 
                        type="submit" 
                        className="btn btn-primary rounded-pill px-4 py-2" 
                        disabled={isSubmitting || formData.rating === 0}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Submitting...
                          </>
                        ) : 'Submit Feedback'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
            
            <div className="row g-4 mt-5">
              <div className="col-md-4">
                <div className="p-4 bg-white rounded-4 shadow-sm text-center h-100">
                  <div className="mb-3 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-chat-dots" viewBox="0 0 16 16">
                      <path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                      <path d="m2.165 15.803.02-.004c1.83-.363 2.948-.842 3.468-1.105A9.06 9.06 0 0 0 8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6a10.437 10.437 0 0 1-.524 2.318l-.003.011a10.722 10.722 0 0 1-.244.637c-.079.186.074.394.273.362a21.673 21.673 0 0 0 .693-.125zm.8-3.108a1 1 0 0 0-.287-.801C1.618 10.83 1 9.468 1 8c0-3.192 3.004-6 7-6s7 2.808 7 6c0 3.193-3.004 6-7 6a8.06 8.06 0 0 1-2.088-.272 1 1 0 0 0-.711.074c-.387.196-1.24.57-2.634.893a10.97 10.97 0 0 0 .398-2z"/>
                    </svg>
                  </div>
                  <h3 className="fs-5 fw-bold mb-3">Contact Support</h3>
                  <p className="text-secondary small">
                    Need immediate assistance? Contact our support team directly.
                  </p>
                  <Link href="/contact" className="btn btn-outline-primary rounded-pill px-3 py-2 mt-2" target="_blank" rel="noopener noreferrer">
                    Contact Us
                  </Link>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-4 bg-white rounded-4 shadow-sm text-center h-100">
                  <div className="mb-3 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-question-circle" viewBox="0 0 16 16">
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                      <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
                    </svg>
                  </div>
                  <h3 className="fs-5 fw-bold mb-3">Read FAQs</h3>
                  <p className="text-secondary small">
                    Check our frequently asked questions for quick answers.
                  </p>
                  <Link href="/faq" className="btn btn-outline-primary rounded-pill px-3 py-2 mt-2" target="_blank" rel="noopener noreferrer">
                    View FAQs
                  </Link>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-4 bg-white rounded-4 shadow-sm text-center h-100">
                  <div className="mb-3 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-people" viewBox="0 0 16 16">
                      <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8Zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022ZM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816ZM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/>
                    </svg>
                  </div>
                  <h3 className="fs-5 fw-bold mb-3">Community</h3>
                  <p className="text-secondary small">
                    Join our community discussions to share ideas and suggestions.
                  </p>
                  <Link href="/community" className="btn btn-outline-primary rounded-pill px-3 py-2 mt-2">
                    Join Discussion
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 