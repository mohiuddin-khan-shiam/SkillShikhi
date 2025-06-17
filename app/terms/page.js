'use client';

import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="pt-4 pb-5">
      <div className="container mt-5 pt-5">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="mb-5">
              <h1 className="display-5 fw-bold mb-3 gradient-text">Terms of Service</h1>
              <p className="text-secondary">Last Updated: June 15, 2024</p>
              <hr className="mb-4" />
            </div>
            
            <div className="bg-white rounded-4 shadow-sm p-4 p-lg-5 mb-4">
              <h2 className="fs-3 fw-bold mb-4 text-primary">1. Introduction</h2>
              <p className="text-secondary mb-4">
                Welcome to SkillShikhi. These Terms of Service ("Terms") govern your access to and use of the SkillShikhi website, mobile applications, and services (collectively, the "Services").
              </p>
              <p className="text-secondary mb-4">
                By accessing or using our Services, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not access or use the Services.
              </p>
            </div>
            
            <div className="bg-white rounded-4 shadow-sm p-4 p-lg-5 mb-4">
              <h2 className="fs-3 fw-bold mb-4 text-primary">2. Definitions</h2>
              <ul className="text-secondary mb-4">
                <li className="mb-3">
                  <strong>"User"</strong> refers to any individual who accesses or uses our Services, including both "Learners" and "Teachers."
                </li>
                <li className="mb-3">
                  <strong>"Learner"</strong> refers to a User who uses our Services to find and connect with Teachers to learn skills.
                </li>
                <li className="mb-3">
                  <strong>"Teacher"</strong> refers to a User who uses our Services to offer and teach skills to Learners.
                </li>
                <li className="mb-3">
                  <strong>"Content"</strong> refers to text, graphics, images, music, software, audio, video, information, or other materials that Users submit, upload, or otherwise share through our Services.
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-4 shadow-sm p-4 p-lg-5 mb-4">
              <h2 className="fs-3 fw-bold mb-4 text-primary">3. Account Registration</h2>
              <p className="text-secondary mb-4">
                To use certain features of our Services, you must register for an account. When you register, you agree to provide accurate, current, and complete information about yourself. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </p>
              <p className="text-secondary mb-4">
                You agree to:
              </p>
              <ul className="text-secondary mb-4">
                <li className="mb-2">Create only one account for yourself</li>
                <li className="mb-2">Not share your account with anyone else</li>
                <li className="mb-2">Not transfer your account to another person</li>
                <li className="mb-2">Immediately notify us of any unauthorized use of your account</li>
              </ul>
              <p className="text-secondary mb-4">
                We reserve the right to suspend or terminate your account if we determine, in our sole discretion, that you have violated these Terms.
              </p>
            </div>
            
            <div className="bg-white rounded-4 shadow-sm p-4 p-lg-5 mb-4">
              <h2 className="fs-3 fw-bold mb-4 text-primary">4. User Conduct</h2>
              <p className="text-secondary mb-4">
                You agree not to use the Services to:
              </p>
              <ul className="text-secondary mb-4">
                <li className="mb-2">Violate any applicable law or regulation</li>
                <li className="mb-2">Infringe upon the rights of others</li>
                <li className="mb-2">Post or share Content that is unlawful, harmful, threatening, abusive, defamatory, or otherwise objectionable</li>
                <li className="mb-2">Impersonate any person or entity</li>
                <li className="mb-2">Engage in any activity that interferes with or disrupts the Services</li>
                <li className="mb-2">Attempt to gain unauthorized access to any part of the Services</li>
                <li className="mb-2">Use the Services for any commercial purpose without our prior written consent</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-4 shadow-sm p-4 p-lg-5 mb-4">
              <h2 className="fs-3 fw-bold mb-4 text-primary">5. Skills and Sessions</h2>
              <p className="text-secondary mb-4">
                SkillShikhi serves as a platform connecting Teachers and Learners. We do not guarantee the quality, safety, or legality of any skills taught or sessions conducted. Users are solely responsible for:
              </p>
              <ul className="text-secondary mb-4">
                <li className="mb-2">Verifying the qualifications and backgrounds of other Users</li>
                <li className="mb-2">Ensuring personal safety during in-person sessions</li>
                <li className="mb-2">Compliance with applicable laws and regulations</li>
                <li className="mb-2">Payment arrangements between Teachers and Learners</li>
              </ul>
              <p className="text-secondary mb-4">
                SkillShikhi is not responsible for and disclaims all liability related to disputes between Users, including but not limited to payment disputes, quality of services, and personal safety.
              </p>
            </div>
            
            <div className="bg-white rounded-4 shadow-sm p-4 p-lg-5 mb-4">
              <h2 className="fs-3 fw-bold mb-4 text-primary">6. User Content</h2>
              <p className="text-secondary mb-4">
                You retain all rights to any Content you submit, upload, or display on or through the Services. By submitting, posting, or displaying Content on or through the Services, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display, and distribute such Content in any and all media or distribution methods.
              </p>
              <p className="text-secondary mb-4">
                You represent and warrant that:
              </p>
              <ul className="text-secondary mb-4">
                <li className="mb-2">You own the Content you post or have the right to post it</li>
                <li className="mb-2">Your Content does not violate the privacy rights, publicity rights, copyrights, contract rights, or any other rights of any person or entity</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-4 shadow-sm p-4 p-lg-5 mb-4">
              <h2 className="fs-3 fw-bold mb-4 text-primary">7. Privacy</h2>
              <p className="text-secondary mb-4">
                Our Privacy Policy, which is incorporated by reference into these Terms, explains how we collect, use, and protect your personal information. By using our Services, you consent to our collection and use of your personal information as described in our Privacy Policy.
              </p>
              <p className="text-secondary mb-4">
                Please review our <Link href="/privacy" className="text-primary text-decoration-none">Privacy Policy</Link> carefully.
              </p>
            </div>
            
            <div className="bg-white rounded-4 shadow-sm p-4 p-lg-5 mb-4">
              <h2 className="fs-3 fw-bold mb-4 text-primary">8. Intellectual Property</h2>
              <p className="text-secondary mb-4">
                The Services and all content and materials included on the Services, including, but not limited to, text, graphics, logos, button icons, images, audio clips, digital downloads, data compilations, and software, are the property of SkillShikhi or its licensors and are protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p className="text-secondary mb-4">
                You may not use, reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Services, except as follows:
              </p>
              <ul className="text-secondary mb-4">
                <li className="mb-2">Your computer may temporarily store copies of such materials incidental to your accessing and viewing those materials</li>
                <li className="mb-2">You may store files that are automatically cached by your web browser for display enhancement purposes</li>
                <li className="mb-2">You may print or download one copy of a reasonable number of pages of the Services for your own personal, non-commercial use and not for further reproduction, publication, or distribution</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-4 shadow-sm p-4 p-lg-5 mb-4">
              <h2 className="fs-3 fw-bold mb-4 text-primary">9. Termination</h2>
              <p className="text-secondary mb-4">
                We may terminate or suspend your access to all or part of the Services for any or no reason, including without limitation, any violation of these Terms.
              </p>
              <p className="text-secondary mb-4">
                If you wish to terminate your account, you may simply discontinue using the Services or follow the instructions for account deletion in your account settings.
              </p>
              <p className="text-secondary mb-4">
                All provisions of these Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
              </p>
            </div>
            
            <div className="bg-white rounded-4 shadow-sm p-4 p-lg-5 mb-4">
              <h2 className="fs-3 fw-bold mb-4 text-primary">10. Disclaimer of Warranties</h2>
              <p className="text-secondary mb-4">
                THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED. WITHOUT LIMITING THE FOREGOING, WE EXPLICITLY DISCLAIM ANY WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, QUIET ENJOYMENT, OR NON-INFRINGEMENT, AND ANY WARRANTIES ARISING OUT OF COURSE OF DEALING OR USAGE OF TRADE.
              </p>
              <p className="text-secondary mb-4">
                WE MAKE NO WARRANTY THAT THE SERVICES WILL MEET YOUR REQUIREMENTS OR BE AVAILABLE ON AN UNINTERRUPTED, SECURE, OR ERROR-FREE BASIS. WE MAKE NO WARRANTY REGARDING THE QUALITY, ACCURACY, TIMELINESS, TRUTHFULNESS, COMPLETENESS, OR RELIABILITY OF ANY CONTENT AVAILABLE THROUGH THE SERVICES.
              </p>
            </div>
            
            <div className="bg-white rounded-4 shadow-sm p-4 p-lg-5 mb-4">
              <h2 className="fs-3 fw-bold mb-4 text-primary">11. Limitation of Liability</h2>
              <p className="text-secondary mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL SKILLSHIKHI, ITS AFFILIATES, DIRECTORS, EMPLOYEES, OR LICENSORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
              </p>
              <ul className="text-secondary mb-4">
                <li className="mb-2">YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICES</li>
                <li className="mb-2">ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICES</li>
                <li className="mb-2">ANY CONTENT OBTAINED FROM THE SERVICES</li>
                <li className="mb-2">UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-4 shadow-sm p-4 p-lg-5 mb-4">
              <h2 className="fs-3 fw-bold mb-4 text-primary">12. Indemnification</h2>
              <p className="text-secondary mb-4">
                You agree to defend, indemnify, and hold harmless SkillShikhi, its affiliates, licensors, and service providers, and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of the Services, including, but not limited to, your User Content, any use of the Services' content, services, and products other than as expressly authorized in these Terms, or your use of any information obtained from the Services.
              </p>
            </div>
            
            <div className="bg-white rounded-4 shadow-sm p-4 p-lg-5 mb-4">
              <h2 className="fs-3 fw-bold mb-4 text-primary">13. Governing Law and Dispute Resolution</h2>
              <p className="text-secondary mb-4">
                These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
              </p>
              <p className="text-secondary mb-4">
                Any dispute arising out of or in connection with these Terms, including any question regarding its existence, validity, or termination, shall be referred to and finally resolved by arbitration under the rules of the Indian Arbitration and Conciliation Act, 1996, which rules are deemed to be incorporated by reference in this clause. The seat of the arbitration shall be New Delhi. The language of the arbitration shall be English.
              </p>
            </div>
            
            <div className="bg-white rounded-4 shadow-sm p-4 p-lg-5 mb-4">
              <h2 className="fs-3 fw-bold mb-4 text-primary">14. Changes to Terms</h2>
              <p className="text-secondary mb-4">
                We may revise these Terms from time to time. The most current version will always be posted on our website. If a revision, in our sole discretion, is material, we will notify you via email to the email address associated with your account or through a notification on the Services. By continuing to access or use the Services after those revisions become effective, you agree to be bound by the revised Terms.
              </p>
            </div>
            
            <div className="bg-white rounded-4 shadow-sm p-4 p-lg-5 mb-4">
              <h2 className="fs-3 fw-bold mb-4 text-primary">15. Contact Information</h2>
              <p className="text-secondary mb-4">
                If you have any questions about these Terms, please contact us at:
              </p>
              <p className="text-secondary mb-4">
                Email: <a href="mailto:legal@skillshikhi.com" className="text-primary text-decoration-none">legal@skillshikhi.com</a><br />
                Address: SkillShikhi, 123 Learning Lane, New Delhi, 110001, India
              </p>
            </div>
            
            <div className="d-flex justify-content-between mt-5">
              <Link href="/privacy" className="btn btn-outline-primary rounded-pill px-4 py-2">
                Privacy Policy
              </Link>
              <Link href="/cookies" className="btn btn-outline-primary rounded-pill px-4 py-2">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 