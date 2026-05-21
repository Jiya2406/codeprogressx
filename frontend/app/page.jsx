import Link from 'next/link';
import { Code2, LineChart, Bell, Sparkles, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen">
      <nav className="flex items-center justify-between px-6 md:px-10 py-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-lavender-400 to-blush-300 flex items-center justify-center shadow-soft">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl">CodeProgressX</span>
        </Link>
        <div className="flex items-center gap-2 md:gap-3">
          <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-lavender-500 transition">
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2 rounded-full bg-gradient-to-r from-lavender-400 to-blush-300 text-white font-medium text-sm shadow-soft hover:shadow-glow transition"
          >
            Get started
          </Link>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 border border-lavender-100 mb-8 shadow-soft">
          <Sparkles className="w-4 h-4 text-lavender-400" />
          <span className="text-sm text-gray-700">Your AI-powered coding mentor</span>
        </div>

        <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-7xl leading-tight mb-6">
          Track your <span className="gradient-text">Codeforces</span><br />journey in style
        </h1>

        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Beautiful analytics for your solved problems, contest reminders that actually work, and an AI mentor that recommends what to practice next.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-lavender-400 to-blush-300 text-white font-semibold shadow-soft hover:shadow-glow transition"
          >
            Start tracking free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
          <Link
            href="/login"
            className="px-8 py-3.5 rounded-full bg-white/70 border border-white text-gray-800 font-semibold hover:bg-white transition"
          >
            I already have an account
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 md:px-10 pb-24 grid md:grid-cols-3 gap-5">
        <FeatureCard
          icon={LineChart}
          bgClass="bg-lavender-100"
          iconClass="text-lavender-400"
          title="Progress Dashboard"
          desc="Watch your rating climb with weekly charts and tag breakdowns."
        />
        <FeatureCard
          icon={Bell}
          bgClass="bg-peach-100"
          iconClass="text-peach-400"
          title="Contest Reminders"
          desc="Email alerts before every contest you mark — never miss a round."
        />
        <FeatureCard
          icon={Sparkles}
          bgClass="bg-mint-100"
          iconClass="text-mint-400"
          title="AI Practice Mentor"
          desc='Ask "what should I solve?" and get picks based on your weak topics.'
        />
      </section>

      {/* <footer className="text-center text-sm text-gray-500 pb-10">
        Built with Next.js, Express & the Codeforces API.
      </footer> */}
    </main>
  );
}

function FeatureCard({ icon: Icon, bgClass, iconClass, title, desc }) {
  return (
    <div className="glass-card rounded-3xl p-7 shadow-soft hover:-translate-y-1 transition duration-300">
      <div className={`w-12 h-12 rounded-2xl ${bgClass} flex items-center justify-center mb-4`}>
        <Icon className={`w-6 h-6 ${iconClass}`} />
      </div>
      <h3 className="font-display font-bold text-lg mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
