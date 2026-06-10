import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  MapPin, Brain, ShieldCheck, Zap, ArrowRight, Mail,
  Globe, Users, BarChart3, Clock, CheckCircle2,
} from 'lucide-react'

const CONTACT_EMAIL = 'smartcity.portal.admin@gmail.com'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
})

export default function About() {
  return (
    <div className="min-h-screen bg-[#020817] text-white">

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/5 pt-28 pb-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(37,99,235,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.08),transparent_55%)]" />
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <motion.div {...fadeUp()}>
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 text-sm text-blue-400 font-medium mb-6">
                <Globe size={14} /> About the Platform
              </div>
              <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-6">
                Building Cities That{' '}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Actually Listen
                </span>
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed">
                SmartCity is an AI-powered civic issue reporting platform that connects citizens
                directly with local authorities — making cities more transparent, accountable,
                and responsive.
              </p>
            </motion.div>

            <motion.div {...fadeUp(0.15)} className="grid grid-cols-2 gap-4">
              {[
                { icon: Users, label: 'Citizens Served', value: '10,000+', color: 'blue' },
                { icon: CheckCircle2, label: 'Issues Resolved', value: '8,900+', color: 'green' },
                { icon: BarChart3, label: 'Resolution Rate', value: '95%', color: 'cyan' },
                { icon: Clock, label: 'Avg Response', value: '< 48hrs', color: 'purple' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label}
                  className={`bg-white/[0.03] border rounded-2xl p-5 ${
                    color === 'blue' ? 'border-blue-500/20' :
                    color === 'green' ? 'border-green-500/20' :
                    color === 'cyan' ? 'border-cyan-500/20' : 'border-purple-500/20'
                  }`}>
                  <Icon size={20} className={`mb-3 ${
                    color === 'blue' ? 'text-blue-400' :
                    color === 'green' ? 'text-green-400' :
                    color === 'cyan' ? 'text-cyan-400' : 'text-purple-400'
                  }`} />
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Mission ───────────────────────────────────────── */}
      <section className="py-20 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp()}>
              <h2 className="text-4xl font-black mb-6">Our Mission</h2>
              <p className="text-gray-400 leading-relaxed mb-5">
                Millions of civic problems — potholes, broken streetlights, garbage overflow,
                waterlogging — go unresolved every day because there's no efficient bridge
                between citizens and local authorities.
              </p>
              <p className="text-gray-400 leading-relaxed mb-5">
                SmartCity changes that. We built a platform where citizens can report issues
                in seconds, AI automatically categorizes and prioritizes them, and the right
                authority is notified instantly — no phone calls, no paperwork, no waiting.
              </p>
              <p className="text-gray-300 leading-relaxed font-medium">
                Our mission is simple: make every civic complaint visible, accountable,
                and resolved.
              </p>
            </motion.div>

            <motion.div {...fadeUp(0.1)} className="space-y-4">
              {[
                {
                  title: 'Transparency First',
                  desc: 'Every issue is publicly visible with real-time status updates. Citizens always know what\'s happening with their complaint.',
                },
                {
                  title: 'AI-Powered Speed',
                  desc: 'Gemini Vision AI analyzes photos instantly. No manual triage — issues are categorized, prioritized and routed in seconds.',
                },
                {
                  title: 'Accountability by Design',
                  desc: 'Every status change is timestamped, every action is logged. The full resolution timeline is downloadable as an official report.',
                },
              ].map(({ title, desc }, i) => (
                <div key={title} className="flex gap-4 bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── The Problem We Solve ──────────────────────────── */}
      <section className="py-20 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div {...fadeUp()} className="text-center mb-14">
            <h2 className="text-4xl font-black mb-4">The Problem We're Solving</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              India's urban local bodies receive thousands of civic complaints daily —
              but most cities still rely on fragmented, manual processes.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                problem: 'No unified reporting channel',
                current: 'WhatsApp groups, phone calls, walk-ins',
                solution: 'One web platform with photo + GPS pinning',
                icon: '📱',
              },
              {
                problem: 'Zero transparency',
                current: 'Citizens never know what happened',
                solution: 'Real-time status tracking with notifications',
                icon: '👁️',
              },
              {
                problem: 'Manual triage is slow',
                current: 'Staff reads every complaint by hand',
                solution: 'AI auto-categorizes and prioritizes instantly',
                icon: '⚡',
              },
              {
                problem: 'No accountability',
                current: 'No SLA or resolution tracking',
                solution: 'Timestamped audit trail + downloadable reports',
                icon: '📋',
              },
            ].map(({ problem, current, solution, icon }, i) => (
              <motion.div key={problem} {...fadeUp(i * 0.08)}
                className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="font-bold text-white mb-3">{problem}</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-red-400 mt-0.5">✗</span>
                    <span className="text-gray-500">{current}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span className="text-gray-300">{solution}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Core Features ─────────────────────────────────── */}
      <section className="py-20 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div {...fadeUp()} className="text-center mb-14">
            <h2 className="text-4xl font-black mb-4">What Makes SmartCity Different</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: 'AI Vision Detection',
                desc: 'Upload a photo — Gemini AI detects issue type, severity and category automatically. Zero manual effort.',
                badge: 'Highest Impact',
                badgeColor: 'purple',
              },
              {
                icon: Zap,
                title: 'Real-Time Updates',
                desc: 'Socket.io powered live feed. Authorities get instant alerts for critical issues. No page refresh needed.',
                badge: 'Live',
                badgeColor: 'green',
              },
              {
                icon: MapPin,
                title: 'City + Zone Routing',
                desc: 'Complaints auto-route to the right authority based on city and zone. No manual assignment ever.',
                badge: 'Smart Routing',
                badgeColor: 'blue',
              },
              {
                icon: ShieldCheck,
                title: 'Role-Based Access',
                desc: 'Three tiers: Citizen, Authority Admin, Super Admin. Each with isolated views and secure JWT authentication.',
                badge: 'Secure',
                badgeColor: 'blue',
              },
              {
                icon: BarChart3,
                title: 'Analytics Dashboard',
                desc: 'Super Admin sees platform-wide analytics — resolution rates, category breakdowns, 7-day trends and SLA compliance.',
                badge: 'Data-Driven',
                badgeColor: 'cyan',
              },
              {
                icon: Globe,
                title: 'Scalable Architecture',
                desc: 'Redis caching, BullMQ async job queue, PostgreSQL with Prisma. Built to scale from one city to thousands.',
                badge: 'Production-Ready',
                badgeColor: 'purple',
              },
            ].map(({ icon: Icon, title, desc, badge, badgeColor }, i) => (
              <motion.div key={title} {...fadeUp(i * 0.07)}
                className="bg-white/[0.03] border border-white/5 rounded-3xl p-7">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center">
                    <Icon size={22} className="text-blue-400" />
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    badgeColor === 'purple' ? 'bg-purple-500/10 text-purple-400' :
                    badgeColor === 'green' ? 'bg-green-500/10 text-green-400' :
                    badgeColor === 'cyan' ? 'bg-cyan-500/10 text-cyan-400' :
                    'bg-blue-500/10 text-blue-400'
                  }`}>{badge}</span>
                </div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

  
      {/* ── Contact ───────────────────────────────────────── */}
      <section className="py-20 border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div {...fadeUp()}>
            <h2 className="text-4xl font-black mb-4">Get In Touch</h2>
            <p className="text-gray-400 mb-10">
              Have questions, feedback, or want to onboard your city?
              We'd love to hear from you.
            </p>

            <div className="grid sm:grid-cols-2 gap-5 mb-8">
              <a href={`mailto:${CONTACT_EMAIL}`}
                className="flex items-center gap-4 bg-white/[0.03] border border-white/10 hover:border-blue-500/40 rounded-2xl p-6 transition-colors text-left group">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <Mail size={22} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Email Us</p>
                  <p className="text-white font-semibold text-sm break-all">{CONTACT_EMAIL}</p>
                </div>
              </a>

              <Link to="/how-it-works"
                className="flex items-center gap-4 bg-white/[0.03] border border-white/10 hover:border-green-500/40 rounded-2xl p-6 transition-colors text-left group">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                  <Globe size={22} className="text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Platform Guide</p>
                  <p className="text-white font-semibold text-sm">How It Works →</p>
                </div>
              </Link>
            </div>

            <p className="text-gray-600 text-sm">
              For authority onboarding requests, please include your city name, zone names,
              and your official designation in the email.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div {...fadeUp()}
            className="rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 p-[1px]">
            <div className="bg-[#020817] rounded-3xl px-8 py-14 text-center">
              <h2 className="text-4xl font-black mb-3">Ready to Report an Issue?</h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                Join thousands of citizens who are already making their cities better —
                one complaint at a time.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/register">
                  <button className="px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all font-semibold flex items-center gap-2">
                    Get Started <ArrowRight size={18} />
                  </button>
                </Link>
                <Link to="/how-it-works">
                  <button className="px-7 py-3.5 rounded-xl border border-gray-700 hover:border-blue-500 hover:bg-blue-500/5 transition-all font-semibold">
                    Learn How It Works
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
