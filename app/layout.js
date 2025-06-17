import './globals.css';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

export const metadata = {
  title: 'SkillShikhi',
  description: 'Learn and Share Skills in Your Community',
  keywords: 'skill sharing, learning, teaching, community skills, peer learning, skill exchange, learn from others',
  authors: [{ name: 'SkillShikhi Team' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#4338ca',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="min-vh-100 bg-light">
        <div className="d-flex flex-column min-vh-100">
          <Header />
          <main className="flex-grow-1 pt-5 mt-5"> 
            {children}
          </main>
          <Footer />
        </div>
        
        {/* Back to top button */}
        <a 
          href="#" 
          className="position-fixed bottom-0 end-0 m-4 btn btn-primary rounded-circle shadow-sm d-none d-md-flex align-items-center justify-content-center"
          style={{ width: '48px', height: '48px', zIndex: 1030 }}
          aria-label="Back to top"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-arrow-up" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z"/>
          </svg>
        </a>
      </body>
    </html>
  );
}
