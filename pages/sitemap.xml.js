import { getServerSideSitemap } from 'next-sitemap';
import { GetServerSideProps } from 'next';

// This function runs server-side to generate the sitemap
export const getServerSideProps = async (ctx) => {
  // Fetch dynamic routes from your API or database
  // For example: const skills = await fetchSkills();
  const skills = [];
  const users = [];
  
  // Base URLs
  const baseUrls = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/about', changefreq: 'weekly', priority: 0.8 },
    { url: '/skills', changefreq: 'daily', priority: 0.9 },
    { url: '/teaching', changefreq: 'daily', priority: 0.9 },
    { url: '/community', changefreq: 'daily', priority: 0.8 },
    { url: '/login', changefreq: 'monthly', priority: 0.5 },
    { url: '/register', changefreq: 'monthly', priority: 0.5 },
    { url: '/privacy', changefreq: 'monthly', priority: 0.3 },
    { url: '/terms', changefreq: 'monthly', priority: 0.3 },
    { url: '/faq', changefreq: 'weekly', priority: 0.5 },
    { url: '/contact', changefreq: 'weekly', priority: 0.7 },
  ];

  // Dynamic routes
  const skillRoutes = skills.map(skill => ({
    loc: `/skills/${skill.slug}`,
    changefreq: 'weekly',
    priority: 0.7,
    lastmod: new Date(skill.updatedAt).toISOString(),
  }));

  const userRoutes = users.map(user => ({
    loc: `/user/${user.username}`,
    changefreq: 'weekly',
    priority: 0.6,
    lastmod: new Date(user.updatedAt).toISOString(),
  }));

  // Combine all routes
  const allRoutes = [...baseUrls, ...skillRoutes, ...userRoutes];

  // Generate the sitemap
  return getServerSideSitemap(ctx, allRoutes);
};

// Default export to prevent Next.js from treating this as a page
export default function Sitemap() {}
