import './styles.css';

export const metadata = {
  title: 'SkillHub',
  description: 'Skill Sharing & Learning Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
