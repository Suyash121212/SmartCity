
import { motion } from 'framer-motion'
import {
  Zap,
  ShieldCheck,
  Brain,
  MapPinned,
  ArrowRight,
} from 'lucide-react'

import IssueCard from '../components/IssueCard/IssueCard'
import { Link } from 'react-router-dom'
import { DEMO_ISSUES } from '../data/demoIssues'

// Map demo issues to IssueCard-compatible shape with demo links
const sampleIssues = DEMO_ISSUES.slice(0, 3).map(issue => ({
  ...issue,
  // Override the id so IssueCard links to /demo/:slug instead of /issues/:id
  _demoSlug: issue.slug,
}))

const stats = [
  {
    title: 'Issues Reported',
    value: '12,500+',
  },
  {
    title: 'Issues Resolved',
    value: '8,900+',
  },
  {
    title: 'Active Zones',
    value: '32',
  },
  {
    title: 'Resolution Rate',
    value: '95%',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-[#020817] text-white">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-white/5">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.15),transparent_50%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-20 relative z-10">

          <div className="grid lg:grid-cols-2 gap-14 items-center">

            {/* LEFT */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >

              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 text-sm text-blue-400 font-medium mb-6">
                <Zap size={15} />
                AI Powered Civic Platform
              </div>

              <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-6">
                Building a Smarter,
                <br />
                Safer City{' '}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Together
                </span>
              </h1>

              <p className="text-gray-400 text-lg leading-relaxed max-w-xl mb-8">
                Report city issues, track their status in real-time,
                and help authorities build a better tomorrow.
              </p>

              <div className="flex flex-wrap gap-4">

              <Link to="/report">
                <button className="px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all font-semibold flex items-center gap-2">
                  Report an Issue
                  <ArrowRight size={18} />
                </button>
              </Link>

              <Link to="/how-it-works">
                <button className="px-7 py-3 rounded-xl border border-gray-700 hover:border-blue-500 hover:bg-blue-500/5 transition-all font-semibold">
                  How It Works
                </button>
              </Link>

              </div>
            </motion.div>

            {/* RIGHT */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >

              <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />

              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop"
                alt="Smart City"
                className="relative rounded-3xl border border-white/10 shadow-2xl"
              />

            </motion.div>

          </div>

        </div>
      </section>

      {/* STATS */}
      <section className="py-14 border-b border-white/5">

        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">

            {stats.map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                className="bg-white/[0.03] border border-white/5 rounded-2xl p-6"
              >
                <h3 className="text-3xl font-black text-white mb-2">
                  {item.value}
                </h3>

                <p className="text-gray-400 text-sm">
                  {item.title}
                </p>
              </motion.div>
            ))}

          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20">

        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          <div className="text-center mb-14">

            <h2 className="text-4xl font-black mb-4">
              How It Works
            </h2>

            <p className="text-gray-400 max-w-2xl mx-auto">
              AI-assisted civic issue reporting with real-time authority routing.
            </p>

          </div>

          <div className="grid md:grid-cols-3 gap-6">

            {[
              {
                icon: MapPinned,
                title: 'Report an Issue',
                desc: 'Upload issue images with location details.',
              },
              {
                icon: Brain,
                title: 'AI Analyzes',
                desc: 'AI detects issue type and priority automatically.',
              },
              {
                icon: ShieldCheck,
                title: 'Authorities Resolve',
                desc: 'Issues are routed to the correct authority.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6 }}
                className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 text-center"
              >

                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-6">
                  <item.icon className="text-blue-400" size={28} />
                </div>

                <h3 className="text-xl font-bold mb-3">
                  {item.title}
                </h3>

                <p className="text-gray-400 leading-relaxed">
                  {item.desc}
                </p>

              </motion.div>
            ))}

          </div>

        </div>
      </section>

      {/* SAMPLE ISSUES + MAP */}
      <section className="pb-20">

        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          <div className="grid lg:grid-cols-2 gap-8">

            {/* SAMPLE ISSUES */}
            <div>

              <div className="flex items-center justify-between mb-6">

                <h2 className="text-3xl font-black">
                  Sample Issues
                </h2>

                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                  View All Issues
                </button>

              </div>

              <div className="grid sm:grid-cols-2 gap-5">

                {sampleIssues.map((issue, i) => (
                  <Link key={issue.id} to={`/demo/${issue._demoSlug}`}>
                    <IssueCard
                      issue={issue}
                      index={i}
                      disableLink
                    />
                  </Link>
                ))}

              </div>

            </div>

            {/* MAP */}
            <div>

              <div className="flex items-center justify-between mb-6">

                <h2 className="text-3xl font-black">
                  Sample Issue Map  
                </h2>
                <Link to="/map">
                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                  View Full Map
                </button>
                </Link>

              </div>

              <div className="relative overflow-hidden rounded-3xl border border-white/10 min-h-[300px]">

                <img
                  src="/images/static_map.png"
                  alt="Map"
                 className="w-full h-48 md:h-64 lg:h-80 object-cover"
                />

                <div className="absolute inset-0 bg-black/30" />

                {/* Pins */}
                <div className="absolute top-20 left-24 w-4 h-4 bg-red-500 rounded-full border-4 border-white shadow-lg" />
                <div className="absolute top-40 right-24 w-4 h-4 bg-yellow-500 rounded-full border-4 border-white shadow-lg" />
                <div className="absolute bottom-28 left-1/2 w-4 h-4 bg-green-500 rounded-full border-4 border-white shadow-lg" />

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">

        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 p-[1px]">

            <div className="bg-[#020817] rounded-3xl px-8 py-12 flex flex-col lg:flex-row items-center justify-between gap-6">

              <div>

                <h2 className="text-4xl font-black mb-3">
                  Be a Part of the Change
                </h2>

                <p className="text-gray-400">
                  Together, let's build a smarter and safer city.
                </p>

              </div>

              <button className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all font-semibold flex items-center gap-2 whitespace-nowrap"
              >
                Get Started Now
                <ArrowRight size={18} />
              </button>

            </div>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-10">

        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          <div className="grid md:grid-cols-4 gap-10">

            <div>

              <h3 className="text-2xl font-black mb-3">
                SmartCity
              </h3>

              <p className="text-gray-400 leading-relaxed">
                Real-time civic issue tracking platform for smarter governance.
              </p>

            </div>

            <div>
              <h4 className="font-semibold mb-4">
                Platform
              </h4>

              <div className="space-y-2 text-gray-400 text-sm">
                <Link to="/about" className="block hover:text-white transition-colors">About</Link>
                <Link to="/" className="block hover:text-white transition-colors">Issues</Link>
                <Link to="/map" className="block hover:text-white transition-colors">Issue Map</Link>
                <Link to="/dashboard" className="block hover:text-white transition-colors">Dashboard</Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">
                Resources
              </h4>

              <div className="space-y-2 text-gray-400 text-sm">
                <Link to="/how-it-works" className="block hover:text-white transition-colors">How It Works</Link>
                <Link to="/how-it-works" className="block hover:text-white transition-colors">Guidelines</Link>
                <p>Privacy Policy</p>
                <p>Terms</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">
                Contact
              </h4>

              <div className="space-y-2 text-gray-400 text-sm">
                <a href="mailto:smartcity.portal.admin@gmail.com" className="block hover:text-white transition-colors">
                  smartcity.portal.admin@gmail.com
                </a>
                <p>Pune Smart City Office</p>
              </div>
            </div>

          </div>

          <div className="border-t border-white/5 mt-10 pt-6 text-center text-sm text-gray-500">
            © 2026 SmartCity Portal. All rights reserved.
          </div>

        </div>
      </footer>
    </div>
  )
}
