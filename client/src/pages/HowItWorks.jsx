import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  MapPin, Users, ShieldCheck, Brain, ArrowRight, CheckCircle2,
  Building2, UserPlus, FileText, Bell, Mail, ChevronRight,
  AlertCircle, BarChart3, Globe, Zap,
} from 'lucide-react'

const CONTACT_EMAIL = 'smartcity.portal.admin@gmail.com'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
})

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-[#020817] text-white">

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/5 pt-28 pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.12),transparent_55%)]" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div {...fadeUp()}>
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 text-sm text-blue-400 font-medium mb-6">
              <Zap size={14} /> Platform Guide
            </div>
            <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-6">
              How{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                SmartCity
              </span>{' '}
              Works
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
              A complete guide to understand the platform — for citizens, city authority admins,
              and anyone looking to onboard their city.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Quick role cards ──────────────────────────────── */}
      <section className="py-16 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2 {...fadeUp()} className="text-3xl font-black text-center mb-10">
            Three Roles, One Platform
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                role: 'Citizen',
                color: 'blue',
                desc: 'Residents who report civic issues in their city and zone.',
                actions: ['Register & complete profile', 'Select city + zone', 'Report issues with photos', 'Track issue status in real-time', 'Comment & upvote issues'],
              },
              {
                icon: ShieldCheck,
                role: 'Authority Admin',
                color: 'green',
                desc: 'Government officials managing one specific city + zone.',
                actions: ['Assigned by Super Admin', 'See only their zone\'s issues', 'Update issue status', 'Add resolution notes', 'Download AI-generated reports'],
              },
              {
                icon: Building2,
                role: 'Super Admin',
                color: 'purple',
                desc: 'Platform administrator who onboards cities, zones and authority accounts.',
                actions: ['Add cities & zones', 'Create authority accounts', 'View platform-wide analytics', 'Monitor all issues across cities', 'Manage routing rules'],
              },
            ].map(({ icon: Icon, role, color, desc, actions }, i) => (
              <motion.div key={role} {...fadeUp(i * 0.1)}
                className={`bg-white/[0.03] border rounded-3xl p-7 ${
                  color === 'blue' ? 'border-blue-500/20' :
                  color === 'green' ? 'border-green-500/20' : 'border-purple-500/20'
                }`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${
                  color === 'blue' ? 'bg-blue-500/10' :
                  color === 'green' ? 'bg-green-500/10' : 'bg-purple-500/10'
                }`}>
                  <Icon size={26} className={
                    color === 'blue' ? 'text-blue-400' :
                    color === 'green' ? 'text-green-400' : 'text-purple-400'
                  } />
                </div>
                <h3 className="text-xl font-bold mb-2">{role}</h3>
                <p className="text-gray-400 text-sm mb-4">{desc}</p>
                <ul className="space-y-2">
                  {actions.map(a => (
                    <li key={a} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle2 size={14} className={`mt-0.5 flex-shrink-0 ${
                        color === 'blue' ? 'text-blue-400' :
                        color === 'green' ? 'text-green-400' : 'text-purple-400'
                      }`} />
                      {a}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Step by step for citizens ─────────────────────── */}
      <section className="py-16 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 text-blue-400 text-xs font-medium mb-4">
              <Users size={12} /> For Citizens
            </div>
            <h2 className="text-3xl font-black">How to Report an Issue</h2>
          </motion.div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 to-transparent hidden md:block" />

            <div className="space-y-8">
              {[
                {
                  step: 1, icon: UserPlus, title: 'Register & Create Account',
                  desc: 'Sign up with your name, email and password. No city/zone needed at this stage.',
                  note: 'Go to /register → fill in Name, Email, Password → click Create Account',
                },
                {
                  step: 2, icon: MapPin, title: 'Complete Your Profile',
                  desc: 'After login, you\'ll be redirected to select your City and Zone. This tells the system which authority to route your complaints to.',
                  note: 'Select City (e.g. Pune) → Select Zone (e.g. Kothrud) → Save',
                  important: 'You cannot report issues until this is done.',
                },
                {
                  step: 3, icon: AlertCircle, title: 'Report an Issue',
                  desc: 'Go to "Report Issue". Upload a photo — AI will auto-detect the issue type, category and severity. Fill in any missing details, pin the location on the map, then submit.',
                  note: 'Photo → AI fills form → Pin location → Submit',
                },
                {
                  step: 4, icon: Bell, title: 'Track Status in Real-Time',
                  desc: 'Your complaint is automatically assigned to the authority for your city+zone. You\'ll receive live notifications as the status changes.',
                  note: 'REPORTED → IN REVIEW → IN PROGRESS → RESOLVED',
                },
                {
                  step: 5, icon: FileText, title: 'Download Resolution Report',
                  desc: 'Once resolved, you can download an AI-generated PDF resolution report from the issue detail page.',
                  note: 'Open issue → Click "PDF Report" button',
                },
              ].map(({ step, icon: Icon, title, desc, note, important }, i) => (
                <motion.div key={step} {...fadeUp(i * 0.08)} className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/25 z-10">
                    {step}
                  </div>
                  <div className="flex-1 bg-white/[0.03] border border-white/5 rounded-2xl p-6 -mt-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={16} className="text-blue-400" />
                      <h3 className="font-bold text-white">{title}</h3>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{desc}</p>
                    <div className="bg-gray-900 rounded-lg px-3 py-2 text-xs text-blue-300 font-mono">{note}</div>
                    {important && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-yellow-400">
                        <AlertCircle size={12} /> {important}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── City/Zone routing explained ───────────────────── */}
      <section className="py-16 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1 text-green-400 text-xs font-medium mb-4">
              <Globe size={12} /> Auto Routing
            </div>
            <h2 className="text-3xl font-black">City + Zone Based Routing</h2>
            <p className="text-gray-400 mt-3 max-w-xl mx-auto">
              Complaints are automatically routed to the right authority — no manual assignment needed.
            </p>
          </motion.div>

          <motion.div {...fadeUp(0.1)} className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 mb-8">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              {[
                { label: 'Citizen in Pune → Kothrud', icon: '👤', arrow: true },
                { label: 'System finds Authority for\nPune → Kothrud', icon: '⚙️', arrow: true },
                { label: 'Kothrud Admin sees\nand resolves it', icon: '✅', arrow: false },
              ].map(({ label, icon, arrow }, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-900 rounded-2xl p-5">
                    <div className="text-3xl mb-2">{icon}</div>
                    <p className="text-sm text-gray-300 whitespace-pre-line">{label}</p>
                  </div>
                  {arrow && <ChevronRight size={20} className="text-blue-400 flex-shrink-0 hidden md:block" />}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.2)} className="grid md:grid-cols-2 gap-5">
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <MapPin size={16} className="text-blue-400" /> Example Setup
              </h3>
              <div className="space-y-2 text-sm">
                {[
                  ['Pune', 'Kothrud', 'kothrud@pune.gov'],
                  ['Pune', 'Hadapsar', 'hadapsar@pune.gov'],
                  ['Nagpur', 'Dharampeth', 'dharampeth@nagpur.gov'],
                  ['Mumbai', 'Andheri', 'andheri@mumbai.gov'],
                ].map(([city, zone, email]) => (
                  <div key={email} className="flex items-center gap-2 bg-gray-900 rounded-lg px-3 py-2">
                    <span className="text-gray-400">{city}</span>
                    <ChevronRight size={12} className="text-gray-600" />
                    <span className="text-white font-medium">{zone}</span>
                    <span className="text-blue-400 text-xs ml-auto">{email}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <AlertCircle size={16} className="text-yellow-400" /> If No Authority Exists
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                If a citizen tries to report an issue for a city/zone that has no assigned authority,
                they will see:
              </p>
              <div className="mt-3 bg-gray-900 rounded-xl p-4 border border-red-500/20">
                <p className="text-red-400 text-sm font-medium">
                  "This area is currently not onboarded. No authority assigned to your city/zone yet."
                </p>
              </div>
              <p className="text-gray-500 text-xs mt-3">
                Solution: Contact the Super Admin to add an authority for your area.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── For Super Admin ───────────────────────────────── */}
      <section className="py-16 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1 text-purple-400 text-xs font-medium mb-4">
              <Building2 size={12} /> For Super Admin
            </div>
            <h2 className="text-3xl font-black">Onboarding a New City</h2>
            <p className="text-gray-400 mt-3 max-w-xl mx-auto">
              Step-by-step guide to onboard a new city, add zones and assign authority admins.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                step: '01', color: 'blue',
                title: 'Login as Super Admin',
                desc: 'Use your Super Admin credentials to access the Admin Panel at /admin.',
                code: 'admin@example.gov',
              },
              {
                step: '02', color: 'blue',
                title: 'Add City',
                desc: 'Go to Admin Panel → "Cities & Zones" tab → Type city name → Click Add.',
                code: 'e.g. Pune, Nagpur, Mumbai',
              },
              {
                step: '03', color: 'blue',
                title: 'Add Zones',
                desc: 'Click the city → Add zones/areas under it.',
                code: 'e.g. Kothrud, Hadapsar, Shivajinagar',
              },
              {
                step: '04', color: 'green',
                title: 'Create Authority Account',
                desc: 'Click "Add Authority" → Fill name, email, password, department → Select city + zone.',
                code: 'Each zone gets exactly ONE authority',
              },
              {
                step: '05', color: 'green',
                title: 'Share Credentials',
                desc: 'Send the authority admin their login email and password securely.',
                code: 'Authority logs in at /login',
              },
              {
                step: '06', color: 'green',
                title: 'Citizens Can Now Report',
                desc: 'Once an authority exists for a city+zone, citizens in that zone can report issues.',
                code: 'Complaints auto-route instantly ✓',
              },
            ].map(({ step, color, title, desc, code }, i) => (
              <motion.div key={step} {...fadeUp(i * 0.07)}
                className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                <div className={`text-4xl font-black mb-3 ${color === 'green' ? 'text-green-500/30' : 'text-blue-500/30'}`}>
                  {step}
                </div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm mb-3">{desc}</p>
                <div className={`text-xs px-3 py-1.5 rounded-lg font-mono ${
                  color === 'green' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'
                }`}>{code}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Features ───────────────────────────────────── */}
      <section className="py-16 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1 text-purple-400 text-xs font-medium mb-4">
              <Brain size={12} /> AI Features
            </div>
            <h2 className="text-3xl font-black">What AI Does Automatically</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                title: '📸 Photo Analysis',
                desc: 'Upload a photo of the issue — AI detects issue type (Pothole, Broken Light etc.), severity and category. Form auto-fills instantly.',
                tag: 'On photo upload',
              },
              {
                title: '🏷️ Auto Categorization',
                desc: 'If no photo, AI reads your title & description and assigns the right category, priority and suggests the relevant department.',
                tag: 'On issue submit',
              },
              {
                title: '😤 Sentiment Analysis',
                desc: 'AI reads citizen comments for frustration/urgency. If a comment is detected as frustrated on an unresolved issue, it auto-escalates.',
                tag: 'On comment post',
              },
              {
                title: '📄 PDF Report',
                desc: 'When an issue is resolved, AI generates a formal resolution report with timeline, actions taken and response time — downloadable as PDF.',
                tag: 'On issue resolved',
              },
            ].map(({ title, desc, tag }, i) => (
              <motion.div key={title} {...fadeUp(i * 0.1)}
                className="bg-purple-500/5 border border-purple-500/15 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-white">{title}</h3>
                  <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full whitespace-nowrap ml-2">{tag}</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact Super Admin ───────────────────────────── */}
      <section className="py-16 border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div {...fadeUp()}>
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 text-blue-400 text-xs font-medium mb-6">
              <Mail size={12} /> Contact & Onboarding
            </div>
            <h2 className="text-3xl font-black mb-4">Want Your City Onboarded?</h2>
            <p className="text-gray-400 leading-relaxed mb-8">
              If your city or zone is not yet on the platform, reach out to the Super Admin.
              We'll add your city, zones and assign a dedicated authority admin for your area.
            </p>

            <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 mb-6">
              <div className="grid sm:grid-cols-2 gap-6 text-left">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">What to include in your email</p>
                  <ul className="space-y-2 text-sm text-gray-300">
                    {[
                      'Your full name & designation',
                      'City name to be added',
                      'Zone/area names under the city',
                      'Authority admin email(s) to assign',
                      'Department name (Roads, Water, etc.)',
                    ].map(item => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 size={13} className="text-green-400 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Contact</p>
                  <a href={`mailto:${CONTACT_EMAIL}`}
                    className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 transition-all rounded-2xl px-5 py-4 text-white font-semibold text-sm">
                    <Mail size={18} />
                    {CONTACT_EMAIL}
                  </a>
                  <p className="text-gray-600 text-xs mt-3">
                    Typical onboarding time: Within 24 hours of receiving your request.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4 text-sm text-yellow-300">
              <strong>Note:</strong> Only verified government officials and municipal corporation officers
              will be granted authority admin access. Personal accounts will not be approved.
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────── */}
      <section className="py-16 border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4">
          <motion.h2 {...fadeUp()} className="text-3xl font-black text-center mb-10">
            Frequently Asked Questions
          </motion.h2>
          <div className="space-y-4">
            {[
              {
                q: 'Can I report an issue without completing my profile?',
                a: 'No. You must select your city and zone first. This ensures your complaint reaches the right authority. You\'ll be redirected to the profile page automatically.',
              },
              {
                q: 'What if my city is not listed?',
                a: `Your city hasn't been onboarded yet. Email us at ${CONTACT_EMAIL} with your city and zone details and we'll set it up within 24 hours.`,
              },
              {
                q: 'How does AI analyze my photo?',
                a: 'We use Google Gemini Vision AI. When you upload a photo, it\'s sent to the AI which detects the issue type (pothole, garbage, etc.), severity and category. The form fields are auto-filled — you just review and submit.',
              },
              {
                q: 'Can I see issues from other zones?',
                a: 'Yes! The home feed shows all public issues. But you can only report issues in your own registered city + zone.',
              },
              {
                q: 'How do I know my complaint was assigned to someone?',
                a: 'After submitting, your issue page shows a "Status Timeline". When the authority reviews it, the status changes to IN_REVIEW and you get a real-time notification.',
              },
              {
                q: 'What is the AI-generated PDF report?',
                a: 'When an issue is resolved, an AI writes a formal resolution report — covering what the issue was, what actions were taken, and the total response time. You can download it as a PDF from the issue page.',
              },
            ].map(({ q, a }, i) => (
              <motion.details key={i} {...fadeUp(i * 0.05)}
                className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 group cursor-pointer">
                <summary className="font-semibold text-white list-none flex items-center justify-between">
                  {q}
                  <ChevronRight size={16} className="text-gray-500 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="text-gray-400 text-sm mt-3 leading-relaxed">{a}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div {...fadeUp()}>
            <h2 className="text-4xl font-black mb-4">Ready to Get Started?</h2>
            <p className="text-gray-400 mb-8">
              Join SmartCity and help build a more responsive, accountable city.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/register">
                <button className="px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all font-semibold flex items-center gap-2">
                  Register as Citizen <ArrowRight size={18} />
                </button>
              </Link>
              <a href={`mailto:${CONTACT_EMAIL}`}>
                <button className="px-7 py-3.5 rounded-xl border border-gray-700 hover:border-blue-500 hover:bg-blue-500/5 transition-all font-semibold flex items-center gap-2">
                  <Mail size={16} /> Contact Super Admin
                </button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
