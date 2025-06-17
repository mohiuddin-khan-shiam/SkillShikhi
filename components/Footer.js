export default function Footer() {
  return (
    <footer className="px-6 py-8 bg-blue-900 text-white md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <img
              src="/logo-white.png"
              alt="SkillShikhi Logo"
              className="h-10 mb-2"
              onError={e => {
                e.target.onerror = null;
                e.target.src = "/logo.png";
              }}
            />
            <p className="text-blue-200">&copy; {new Date().getFullYear()} SkillShikhi. All rights reserved.</p>
          </div>
          <div className="flex gap-6">
            <a href="/about" className="text-blue-200 hover:text-white">About</a>
            <a href="/contact" className="text-blue-200 hover:text-white">Contact</a>
            <a href="/privacy" className="text-blue-200 hover:text-white">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
