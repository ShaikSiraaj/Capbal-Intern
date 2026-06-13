import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookMarked, Sparkles, Layers, Mic, BarChart3, ClipboardCheck,
  ArrowRight, Star, GraduationCap, Brain, Zap, Shield, ChevronDown
} from 'lucide-react';

const stats = [
  { value: '10x', label: 'Faster recall with spaced repetition' },
  { value: '94%', label: 'Average quiz score improvement' },
  { value: '3 min', label: 'To turn any PDF into flashcards' },
];

const features = [
  {
    icon: Brain,
    title: 'AI-Generated Flashcards',
    desc: 'Upload any PDF, article or lecture note and get smart flashcards instantly — no manual work needed.',
    color: 'bg-violet-100 text-violet-700',
  },
  {
    icon: ClipboardCheck,
    title: 'Adaptive Quizzes',
    desc: 'AI-crafted quizzes that adapt to your knowledge gaps and focus on what you need to practice most.',
    color: 'bg-amber-100 text-amber-700',
  },
  {
    icon: Mic,
    title: 'Voice Q&A',
    desc: 'Ask questions about your study material out loud and get spoken answers — learn hands-free.',
    color: 'bg-sky-100 text-sky-700',
  },
  {
    icon: Layers,
    title: 'Spaced Repetition',
    desc: 'Our algorithm schedules review at the perfect moment so knowledge sticks long-term.',
    color: 'bg-emerald-100 text-emerald-700',
  },
  {
    icon: BarChart3,
    title: 'Progress Analytics',
    desc: 'Track streaks, quiz scores, mastery levels and study time with beautiful dashboards.',
    color: 'bg-rose-100 text-rose-700',
  },
  {
    icon: GraduationCap,
    title: 'Exam Prep Mode',
    desc: 'Simulate exam conditions with timed quizzes and targeted revision sessions.',
    color: 'bg-indigo-100 text-indigo-700',
  },
];

// Animated counter
function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const isNum = !isNaN(parseInt(target));
    if (!isNum) { setCount(target); return; }
    const end = parseInt(target);
    const step = Math.ceil(end / 40);
    let cur = 0;
    const timer = setInterval(() => {
      cur = Math.min(cur + step, end);
      setCount(cur);
      if (cur >= end) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count}{suffix}</span>;
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    { q: 'Do I need a credit card to sign up?', a: 'No. You can create a free account and start studying immediately — no payment required.' },
    { q: 'What file formats are supported?', a: 'We support PDF, plain text, and articles from URLs. More formats are coming soon.' },
    { q: 'Is my data private?', a: 'Yes. Your study materials and notes are private and only visible to you. We never share or sell your data.' },
    { q: 'Can I use this on mobile?', a: 'Absolutely. StudySpark is fully responsive and works great on phones and tablets.' },
  ];

  return (
    <div className="min-h-screen bg-background font-sans">

      {/* ── NAV ── */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <BookMarked className="w-4 h-4 text-primary-foreground" strokeWidth={2} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent" />
            </div>
            <div className="leading-tight">
              <div className="font-serif text-lg font-semibold tracking-tight">StudySpark</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground -mt-0.5">Study Atelier</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
              Sign in
            </Link>
            <Link to="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all shadow-sm">
              Get started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-20 pb-28 px-6">
        {/* Background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-0 w-64 h-64 bg-accent/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/15 text-accent text-xs font-medium tracking-wide uppercase mb-6 border border-accent/20">
            <Sparkles className="w-3 h-3" /> AI-Powered Learning — Free to Start
          </div>

          <h1 className="font-serif text-5xl md:text-7xl font-semibold leading-[1.05] tracking-tight mb-6 text-foreground">
            Study smarter.<br />
            <em className="italic text-accent">Remember everything.</em>
          </h1>

          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            Transform any PDF, article or lecture note into AI-generated flashcards, adaptive quizzes,
            and spoken lessons — in seconds. Built for students who want results.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg">
              Start learning With AI <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#features"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
              See how it works <ChevronDown className="w-4 h-4" />
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-10 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-500" /> No credit card required</span>
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-500" /> Ready in 30 seconds</span>
            <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-violet-500" /> Free forever plan</span>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-14 border-y border-border/60 bg-secondary/30">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {stats.map((s, i) => (
            <div key={i}>
              <div className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-1">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-3">What's inside</div>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold">Everything you need to ace your exams</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="bg-card border border-border/60 rounded-2xl p-6 hover:shadow-md transition-all group">
                  <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${f.color} mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold mb-2 group-hover:text-accent transition-colors">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6 bg-secondary/20 border-y border-border/60">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-3">How it works</div>
          <h2 className="font-serif text-4xl font-semibold mb-16">Three steps to mastery</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
            {[
              { step: '01', title: 'Upload your material', desc: 'Drop in a PDF, paste text, or share a URL. StudySpark handles the rest.' },
              { step: '02', title: 'AI builds your study kit', desc: 'Flashcards, quizzes, audio summaries — generated in seconds by AI.' },
              { step: '03', title: 'Learn and track progress', desc: 'Study with spaced repetition, track your streak, and ace the exam.' },
            ].map((s, i) => (
              <div key={i} className="relative">
                <div className="font-serif text-6xl font-bold text-border/60 mb-4 leading-none">{s.step}</div>
                <h3 className="font-serif text-xl font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 right-0 translate-x-1/2 text-border text-2xl">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-6 bg-secondary/20 border-t border-border/60">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-semibold">Frequently asked questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="bg-card border border-border/60 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium hover:bg-secondary/40 transition-colors"
                >
                  {f.q}
                  <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center bg-primary text-primary-foreground rounded-3xl p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <Sparkles className="w-8 h-8 text-accent mx-auto mb-4" />
            <h2 className="font-serif text-4xl font-semibold mb-4">Ready to study smarter?</h2>
            <p className="text-primary-foreground/70 mb-8 text-lg">
              Join thousands of students who've transformed how they learn.
            </p>
            <Link to="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-accent text-accent-foreground text-base font-semibold hover:bg-accent/90 transition-all shadow-md">
              Create your  account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border/60 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <BookMarked className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-serif font-semibold">StudySpark</span>
            <span className="text-xs text-muted-foreground">· Study Atelier</span>
          </div>
          <p className="text-xs text-muted-foreground font-serif italic">
            "The mind is not a vessel to be filled, but a fire to be kindled."
          </p>
          <p className="text-xs text-muted-foreground">© 2025 StudySpark. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
