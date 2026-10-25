export default async function sitemap() {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://skill-shikhi.vercel.app';
  
  const staticRoutes = [
    '',
    '/feed',
    '/reels',
    '/community',
    '/pins',
    '/droplets',
    '/sessions',
    '/skills',
    '/teaching',
    '/teaching-request',
    '/chat',
    '/friends',
    '/profile',
    '/login',
    '/register',
    '/admin-login',
    '/admin/dashboard',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: route === '' ? 1.0 : 0.8,
  }));

  return staticRoutes;
}
