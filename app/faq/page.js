'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function FAQPage() {
  const [activeIndex, setActiveIndex] = useState(null);
  
  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };
  
  const faqCategories = [
    {
      title: "General Questions",
      faqs: [
        {
          question: "What is SkillShikhi?",
          answer: "SkillShikhi is a community-based skill sharing platform that connects people who want to learn with those who want to teach. Our platform makes it easy to discover new skills, connect with skilled teachers in your community, and share your own expertise with others."
        },
        {
          question: "Is SkillShikhi free to use?",
          answer: "Basic membership on SkillShikhi is completely free. You can browse available skills, create a profile, and connect with others at no cost. Some premium features or specific skill sessions may have associated costs, which are set by the teachers themselves."
        },
        {
          question: "How do I get started on SkillShikhi?",
          answer: "Getting started is easy! Simply create an account, set up your profile, and start browsing skills or offering to teach. You can search for skills by category, location, or difficulty level to find something that interests you."
        }
      ]
    },
    {
      title: "For Learners",
      faqs: [
        {
          question: "How do I find someone to teach me a skill?",
          answer: "You can use our search feature to browse skills by category, location, or keywords. Once you find a skill you're interested in, you can view the teacher's profile, reviews, and availability. Then, you can send a request to schedule a session."
        },
        {
          question: "What happens after I request a session?",
          answer: "After you request a session, the teacher will receive a notification and can accept, suggest an alternative time, or decline the request. Once accepted, you'll both receive confirmation, and contact details will be shared to coordinate further details."
        },
        {
          question: "How do I leave a review for a teacher?",
          answer: "After completing a session, you'll receive a prompt to leave a review. You can rate your experience and provide feedback that helps the teacher improve and helps other learners make informed decisions."
        }
      ]
    },
    {
      title: "For Teachers",
      faqs: [
        {
          question: "How do I start teaching on SkillShikhi?",
          answer: "To start teaching, go to your profile and click on 'Offer a Skill.' Fill out the form with details about the skill you want to teach, your experience level, availability, and any requirements. Once submitted, your skill offering will be visible to potential learners."
        },
        {
          question: "Can I charge for my sessions?",
          answer: "Yes, you can choose to offer your skills for free or set a price for your sessions. When creating your skill offering, you can specify your rate per session and any additional costs for materials or equipment."
        },
        {
          question: "How do I manage my teaching requests?",
          answer: "All teaching requests will appear in your dashboard. You can accept, suggest an alternative time, or decline requests based on your availability. You'll receive notifications for new requests and can manage your schedule through the calendar feature."
        }
      ]
    },
    {
      title: "Account & Privacy",
      faqs: [
        {
          question: "How do I update my profile information?",
          answer: "You can update your profile by going to your account settings. From there, you can edit your personal information, profile picture, bio, and preferences at any time."
        },
        {
          question: "Is my personal information secure?",
          answer: "Yes, we take privacy and security seriously. We only share your contact information with users you've agreed to connect with for sessions. You can review our Privacy Policy for complete details on how we protect your information."
        },
        {
          question: "How do I delete my account?",
          answer: "To delete your account, go to your account settings and select 'Delete Account' at the bottom of the page. Please note that this action is permanent and will remove all your data from our platform."
        }
      ]
    },
    {
      title: "Technical Support",
      faqs: [
        {
          question: "What should I do if I encounter a technical issue?",
          answer: "If you experience any technical issues, please visit our Help Center for troubleshooting guides. If you can't resolve the issue, contact our support team through the Contact page or by emailing support@skillshikhi.com."
        },
        {
          question: "Is SkillShikhi available on mobile devices?",
          answer: "Yes, SkillShikhi is fully responsive and works on all modern mobile devices through your web browser. We're also developing dedicated mobile apps for iOS and Android, which will be available soon."
        },
        {
          question: "How do I report inappropriate behavior?",
          answer: "If you encounter inappropriate behavior, you can report it by clicking the 'Report' button on the user's profile or session page. All reports are reviewed by our moderation team and handled confidentially."
        }
      ]
    }
  ];

  return (
    <main className="pt-4 pb-5">
      <div className="container mt-5 pt-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="text-center mb-5">
              <span className="badge-custom bg-primary bg-opacity-10 text-primary px-3 py-2 mb-3 rounded-pill fw-medium d-inline-flex align-items-center">
                <span className="me-2" role="img" aria-label="question">❓</span>
                <span>Help Center</span>
              </span>
              <h1 className="display-5 fw-bold mb-3 gradient-text">Frequently Asked Questions</h1>
              <p className="text-secondary lead mx-auto" style={{ maxWidth: '700px' }}>
                Find answers to common questions about using SkillShikhi. Can't find what you're looking for? Feel free to contact us.
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="bg-white p-4 rounded-4 shadow-sm mb-5">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search text-primary" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                  </svg>
                </span>
                <input type="text" className="form-control border-start-0 ps-0" placeholder="Search FAQs..." aria-label="Search FAQs" />
                <button className="btn btn-primary rounded-end px-4" type="button">Search</button>
              </div>
            </div>
            
            {/* FAQ Categories */}
            <div className="mb-5">
              <div className="nav nav-pills mb-4 justify-content-center flex-wrap" id="faq-tabs" role="tablist">
                {faqCategories.map((category, index) => (
                  <button
                    key={index}
                    className={`nav-link ${index === 0 ? 'active' : ''} m-1`}
                    id={`tab-${index}`}
                    data-bs-toggle="pill"
                    data-bs-target={`#content-${index}`}
                    type="button"
                    role="tab"
                    aria-controls={`content-${index}`}
                    aria-selected={index === 0}
                  >
                    {category.title}
                  </button>
                ))}
              </div>
              
              <div className="tab-content" id="faq-content">
                {faqCategories.map((category, catIndex) => (
                  <div
                    key={catIndex}
                    className={`tab-pane fade ${catIndex === 0 ? 'show active' : ''}`}
                    id={`content-${catIndex}`}
                    role="tabpanel"
                    aria-labelledby={`tab-${catIndex}`}
                  >
                    <div className="accordion accordion-flush" id={`accordion-${catIndex}`}>
                      {category.faqs.map((faq, faqIndex) => {
                        const uniqueId = `${catIndex}-${faqIndex}`;
                        return (
                          <div key={faqIndex} className="accordion-item border-0 mb-3 bg-white rounded-4 shadow-sm overflow-hidden">
                            <h2 className="accordion-header" id={`heading-${uniqueId}`}>
                              <button
                                className={`accordion-button ${activeIndex === uniqueId ? '' : 'collapsed'} bg-white`}
                                type="button"
                                onClick={() => toggleAccordion(uniqueId)}
                                aria-expanded={activeIndex === uniqueId}
                                aria-controls={`collapse-${uniqueId}`}
                              >
                                <span className="fw-semibold">{faq.question}</span>
                              </button>
                            </h2>
                            <div
                              id={`collapse-${uniqueId}`}
                              className={`accordion-collapse collapse ${activeIndex === uniqueId ? 'show' : ''}`}
                              aria-labelledby={`heading-${uniqueId}`}
                            >
                              <div className="accordion-body text-secondary">
                                {faq.answer}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Still Have Questions */}
            <div className="bg-primary text-white p-5 rounded-4 text-center mt-5">
              <h2 className="fs-3 fw-bold mb-3">Still Have Questions?</h2>
              <p className="mb-4">
                Can't find the answer you're looking for? Please chat to our friendly team.
              </p>
              <Link href="/contact" className="btn btn-light text-primary rounded-pill px-5 py-3 fw-medium shadow">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .accordion-button:not(.collapsed) {
          color: var(--primary-700);
          background-color: rgba(99, 102, 241, 0.05);
          box-shadow: none;
        }
        
        .accordion-button:focus {
          box-shadow: none;
          border-color: rgba(99, 102, 241, 0.1);
        }
        
        .accordion-button::after {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%234338ca'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
        }
        
        .nav-pills .nav-link {
          color: var(--gray-700);
          background-color: var(--gray-100);
          border-radius: 30px;
          padding: 0.5rem 1.5rem;
          transition: all 0.3s ease;
        }
        
        .nav-pills .nav-link.active, 
        .nav-pills .show > .nav-link {
          color: white;
          background-color: var(--primary-600);
        }
      `}</style>
    </main>
  );
} 