'use client';

import Link from 'next/link';

export default function CookiesPage() {
  return (
    <main className="pt-4 pb-5">
      <div className="container mt-5 pt-5">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="mb-5">
              <h1 className="display-5 fw-bold mb-3 gradient-text">Cookie Policy</h1>
              <p className="text-secondary">Last Updated: June 15, 2024</p>
              <hr className="mb-4" />
            </div>
            
            <div className="bg-white rounded-4 shadow-sm p-4 p-lg-5 mb-4">
              <h2 className="fs-3 fw-bold mb-4 text-primary">1. Introduction</h2>
              <p className="text-secondary mb-4">
                SkillShikhi ("we", "our", or "us") uses cookies and similar technologies on our website and mobile applications. This Cookie Policy explains how we use cookies, what types of cookies we use, and how you can control them.
              </p>
              <p className="text-secondary mb-4">
                By using our website and agreeing to this policy, you consent to our use of cookies in accordance with the terms of this policy.
              </p>
            </div>
            
            <div className="bg-white rounded-4 shadow-sm p-4 p-lg-5 mb-4">
              <h2 className="fs-3 fw-bold mb-4 text-primary">2. What Are Cookies?</h2>
              <p className="text-secondary mb-4">
                Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently, as well as to provide information to the owners of the site. Cookies allow the website to recognize your device and store some information about your preferences or past actions.
              </p>
              <p className="text-secondary mb-4">
                We also use similar technologies such as pixel tags, web beacons, and local storage, which perform functions like cookies. In this policy, we refer to these technologies collectively as "cookies."
              </p>
            </div>
            
            <div className="bg-white rounded-4 shadow-sm p-4 p-lg-5 mb-4">
              <h2 className="fs-3 fw-bold mb-4 text-primary">3. Types of Cookies We Use</h2>
              <p className="text-secondary mb-4">
                We use the following types of cookies:
              </p>
              
              <h3 className="fs-4 fw-bold mb-3">Essential Cookies</h3>
              <p className="text-secondary mb-4">
                These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in, or filling in forms. These cookies do not store any personally identifiable information.
              </p>
              
              <h3 className="fs-4 fw-bold mb-3 mt-4">Performance Cookies</h3>
              <p className="text-secondary mb-4">
                These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site. All information these cookies collect is aggregated and therefore anonymous.
              </p>
              
              <h3 className="fs-4 fw-bold mb-3 mt-4">Functionality Cookies</h3>
              <p className="text-secondary mb-4">
                These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages. If you do not allow these cookies, some or all of these services may not function properly.
              </p>
              
              <h3 className="fs-4 fw-bold mb-3 mt-4">Targeting Cookies</h3>
              <p className="text-secondary mb-4">
                These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant advertisements on other sites. They do not directly store personal information but are based on uniquely identifying your browser and internet device.
              </p>
              
              <h3 className="fs-4 fw-bold mb-3 mt-4">Social Media Cookies</h3>
              <p className="text-secondary mb-4">
                These cookies are set by a range of social media services that we have added to the site to enable you to share our content with your friends and networks. They are capable of tracking your browser across other sites and building up a profile of your interests. This may impact the content and messages you see on other websites you visit.
              </p>
            </div>
            
            <div className="bg-white rounded-4 shadow-sm p-4 p-lg-5 mb-4">
              <h2 className="fs-3 fw-bold mb-4 text-primary">4. Specific Cookies We Use</h2>
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead className="bg-light">
                    <tr>
                      <th className="text-primary">Name</th>
                      <th className="text-primary">Provider</th>
                      <th className="text-primary">Purpose</th>
                      <th className="text-primary">Expiry</th>
                      <th className="text-primary">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>_session</td>
                      <td>skillshikhi.com</td>
                      <td>Preserves user session state across page requests</td>
                      <td>Session</td>
                      <td>Essential</td>
                    </tr>
                    <tr>
                      <td>XSRF-TOKEN</td>
                      <td>skillshikhi.com</td>
                      <td>Ensures visitor browsing security by preventing cross-site request forgery</td>
                      <td>Session</td>
                      <td>Essential</td>
                    </tr>
                    <tr>
                      <td>_ga</td>
                      <td>Google Analytics</td>
                      <td>Registers a unique ID that is used to generate statistical data on how the visitor uses the website</td>
                      <td>2 years</td>
                      <td>Performance</td>
                    </tr>
                    <tr>
                      <td>_gid</td>
                      <td>Google Analytics</td>
                      <td>Registers a unique ID that is used to generate statistical data on how the visitor uses the website</td>
                      <td>24 hours</td>
                      <td>Performance</td>
                    </tr>
                    <tr>
                      <td>_gat</td>
                      <td>Google Analytics</td>
                      <td>Used by Google Analytics to throttle request rate</td>
                      <td>1 minute</td>
                      <td>Performance</td>
                    </tr>
                    <tr>
                      <td>user_preferences</td>
                      <td>skillshikhi.com</td>
                      <td>Stores user preferences (language, theme, etc.)</td>
                      <td>1 year</td>
                      <td>Functionality</td>
                    </tr>
                    <tr>
                      <td>_fbp</td>
                      <td>Facebook</td>
                      <td>Used by Facebook to deliver a series of advertisement products such as real-time bidding from third-party advertisers</td>
                      <td>3 months</td>
                      <td>Targeting</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="bg-white rounded-4 shadow-sm p-4 p-lg-5 mb-4">
              <h2 className="fs-3 fw-bold mb-4 text-primary">5. Third-Party Cookies</h2>
              <p className="text-secondary mb-4">
                In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the service, deliver advertisements on and through the service, and so on. These cookies may be placed by:
              </p>
              <ul className="text-secondary mb-4">
                <li className="mb-2">Google Analytics (for analytics)</li>
                <li className="mb-2">Facebook Pixel (for advertising)</li>
                <li className="mb-2">LinkedIn Insight Tag (for advertising)</li>
                <li className="mb-2">Hotjar (for behavior analytics)</li>
                <li className="mb-2">Intercom (for customer support chat)</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-4 shadow-sm p-4 p-lg-5 mb-4">
              <h2 className="fs-3 fw-bold mb-4 text-primary">6. How to Control Cookies</h2>
              <p className="text-secondary mb-4">
                You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed. However, if you do this, you may have to manually adjust some preferences every time you visit a site, and some services and functionalities may not work.
              </p>
              
              <h3 className="fs-4 fw-bold mb-3 mt-4">Browser Settings</h3>
              <p className="text-secondary mb-4">
                Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set, visit <a href="https://www.aboutcookies.org/" className="text-primary text-decoration-none" target="_blank" rel="noopener noreferrer">www.aboutcookies.org</a> or <a href="https://www.allaboutcookies.org/" className="text-primary text-decoration-none" target="_blank" rel="noopener noreferrer">www.allaboutcookies.org</a>.
              </p>
              <p className="text-secondary mb-4">
                Find out how to manage cookies on popular browsers:
              </p>
              <ul className="text-secondary mb-4">
                <li className="mb-2"><a href="https://support.google.com/accounts/answer/61416" className="text-primary text-decoration-none" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
                <li className="mb-2"><a href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences" className="text-primary text-decoration-none" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
                <li className="mb-2"><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" className="text-primary text-decoration-none" target="_blank" rel="noopener noreferrer">Apple Safari</a></li>
                <li className="mb-2"><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" className="text-primary text-decoration-none" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
                <li className="mb-2"><a href="https://support.microsoft.com/en-us/windows/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d" className="text-primary text-decoration-none" target="_blank" rel="noopener noreferrer">Internet Explorer</a></li>
              </ul>
              
              <h3 className="fs-4 fw-bold mb-3 mt-4">Cookie Consent Tool</h3>
              <p className="text-secondary mb-4">
                When you first visit our website, you will be presented with a cookie banner that allows you to accept or decline non-essential cookies. You can change your preferences at any time by clicking on the "Cookie Settings" link in the footer of our website.
              </p>
              
              <h3 className="fs-4 fw-bold mb-3 mt-4">Opt-Out of Specific Third-Party Cookies</h3>
              <p className="text-secondary mb-4">
                You can opt out of third-party cookies used for advertising purposes at:
              </p>
              <ul className="text-secondary mb-4">
                <li className="mb-2"><a href="http://www.aboutads.info/choices/" className="text-primary text-decoration-none" target="_blank" rel="noopener noreferrer">Digital Advertising Alliance</a></li>
                <li className="mb-2"><a href="https://www.youronlinechoices.com/" className="text-primary text-decoration-none" target="_blank" rel="noopener noreferrer">European Interactive Digital Advertising Alliance</a></li>
                <li className="mb-2"><a href="https://optout.networkadvertising.org/" className="text-primary text-decoration-none" target="_blank" rel="noopener noreferrer">Network Advertising Initiative</a></li>
              </ul>
              <p className="text-secondary mb-4">
                To opt-out of Google Analytics, you can download and install the Google Analytics Opt-out Browser Add-on at <a href="https://tools.google.com/dlpage/gaoptout" className="text-primary text-decoration-none" target="_blank" rel="noopener noreferrer">https://tools.google.com/dlpage/gaoptout</a>.
              </p>
            </div>
            
            <div className="bg-white rounded-4 shadow-sm p-4 p-lg-5 mb-4">
              <h2 className="fs-3 fw-bold mb-4 text-primary">7. Updates to This Cookie Policy</h2>
              <p className="text-secondary mb-4">
                We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our business practices. Any changes will be posted on this page, and if the changes are significant, we will provide a more prominent notice.
              </p>
            </div>
            
            <div className="bg-white rounded-4 shadow-sm p-4 p-lg-5 mb-4">
              <h2 className="fs-3 fw-bold mb-4 text-primary">8. Contact Information</h2>
              <p className="text-secondary mb-4">
                If you have any questions or concerns about this Cookie Policy or our use of cookies, please contact us at:
              </p>
              <p className="text-secondary mb-4">
                Email: <a href="mailto:privacy@skillshikhi.com" className="text-primary text-decoration-none">privacy@skillshikhi.com</a><br />
                Address: SkillShikhi, 123 Learning Lane, New Delhi, 110001, India
              </p>
            </div>
            
            <div className="d-flex justify-content-between mt-5">
              <Link href="/terms" className="btn btn-outline-primary rounded-pill px-4 py-2" target="_blank" rel="noopener noreferrer">
                Terms of Service
              </Link>
              <Link href="/privacy" className="btn btn-outline-primary rounded-pill px-4 py-2" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 