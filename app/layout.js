import './globals.css';
import './styles.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata = {
  title: 'SkillShikhi — Learn Any Skill from Peers, Communities, and Mentors',
  description:
    'The unified peer-to-peer skill sharing ecosystem. Combining interactive feeds, byte-sized skill reels, architecture blueprints, tech discussions, live classroom sessions, and direct study pods.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'SkillShikhi — Social Media Meets Peer Skill Sharing',
    description: 'Learn and teach in an ecosystem combining interactive feeds, reels, blueprints, and study pods.',
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
        {/* Guaranteed Tailwind CSS styling layer */}
        <script src="https://cdn.tailwindcss.com"></script>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              img { max-width: 100%; }
              body { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; }
            `,
          }}
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
