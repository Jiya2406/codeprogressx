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
        <div className="blob bg-lavender-200 w-64 h-64 md:w-[28rem] md:h-[28rem] -top-20 -left-20 md:-top-32 md:-left-32" />
        <div className="blob bg-blush-200 w-64 h-64 md:w-[26rem] md:h-[26rem] top-1/3 -right-16 md:-right-24" style={{ animationDelay: '6s' }} />
        <div className="blob bg-peach-200 w-60 h-60 md:w-[24rem] md:h-[24rem] bottom-0 left-1/4 md:left-1/3" style={{ animationDelay: '12s' }} />
        <div className="relative z-10">{children}</div>
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      </body>
    </html>
  );
}
