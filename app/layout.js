import './styles.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata = {
  title: 'SkillShikhi — Social Media Meets Peer Skill Sharing',
  description:
    'The everything platform for skill sharing & learning. Combining the power of Facebook, LinkedIn, YouTube, Classroom, Instagram, WhatsApp, Snapchat, Telegram, TikTok, Messenger, Reddit, X (Twitter), Pinterest, and Threads into one unified learning ecosystem.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'SkillShikhi — Social Media Meets Peer Skill Sharing',
    description: 'Learn and teach in an ecosystem combining all 14 major social media platforms.',
    url: 'https://skill-shikhi.vercel.app',
    siteName: 'SkillShikhi',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
