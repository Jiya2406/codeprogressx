import Script from 'next/script';
import './globals.css';

export const metadata = {
  title: 'CodeProgressX — Track Your Codeforces Journey',
  description:
    'Beautiful analytics for solved problems, contest reminders, and an AI mentor that recommends what to practice next.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="relative overflow-x-hidden">
        <div className="blob bg-lavender-200 w-[28rem] h-[28rem] -top-32 -left-32" />
        <div className="blob bg-blush-200 w-[26rem] h-[26rem] top-1/3 -right-24" style={{ animationDelay: '6s' }} />
        <div className="blob bg-peach-200 w-[24rem] h-[24rem] bottom-0 left-1/3" style={{ animationDelay: '12s' }} />
        <div className="relative z-10">{children}</div>
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      </body>
    </html>
  );
}
