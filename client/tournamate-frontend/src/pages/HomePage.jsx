// src/pages/HomePage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaTrophy, FaUsers, FaCalendarAlt, FaBolt, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";

/**
 * HomePage - louder, flashier, still tasteful.
 * Requires: framer-motion & Tailwind
 */

function HomePage() {
  // animated counters
  const [teams, setTeams] = useState(0);
  const [matches, setMatches] = useState(0);
  const [brackets, setBrackets] = useState(0);

  // simulate stats load (replace with real data later)
  useEffect(() => {
    let t = 0, m = 0, b = 0;
    const tInt = setInterval(() => {
      t += Math.ceil(Math.random() * 12);
      if (t >= 1200) { t = 1200; clearInterval(tInt); }
      setTeams(t);
    }, 60);
    const mInt = setInterval(() => {
      m += Math.ceil(Math.random() * 7);
      if (m >= 5600) { m = 5600; clearInterval(mInt); }
      setMatches(m);
    }, 55);
    const bInt = setInterval(() => {
      b += Math.ceil(Math.random() * 3);
      if (b >= 320) { b = 320; clearInterval(bInt); }
      setBrackets(b);
    }, 75);
    return () => { clearInterval(tInt); clearInterval(mInt); clearInterval(bInt); };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white selection:bg-pink-400/40">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-24 lg:py-36 relative overflow-hidden">
        {/* Floating gradient blobs */}
        <FloatingBlobs />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-6"
          >
            <Badge />
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight"
              initial={{ scale: 0.995 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              Organize tournaments — <span className="text-pink-400">fast</span>, <span className="text-pink-300">smart</span>, and <span className="text-amber-300">fun</span>.
            </motion.h1>

            <p className="text-gray-300 max-w-xl text-lg">
              Create groups, auto-schedule fixtures, and run knockout brackets without the usual chaos.
              TournaMate automates match creation, standings, and the bracket drama — so you only worry about who wears the trophy.
            </p>

            <div className="flex flex-wrap gap-4 mt-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-pink-600 px-6 py-3 rounded-xl font-semibold shadow-2xl transform transition"
                >
                  Get Started — It's free
                  <motion.span className="ml-1" whileHover={{ x: 4 }}><FaArrowRight /></motion.span>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }}>
                <Link
                  to="/tournaments"
                  className="inline-flex items-center gap-3 border border-white/10 px-6 py-3 rounded-xl text-gray-200 hover:bg-white/5 transition"
                >
                  Explore Tournaments
                </Link>
              </motion.div>
            </div>

            {/* Stat strip */}
            <div className="mt-8 grid grid-cols-3 gap-3">
              <StatCard icon={<FaUsers />} title="Teams" value={`${formatNumber(teams)}`} color="from-pink-500 to-purple-500" />
              <StatCard icon={<FaCalendarAlt />} title="Matches" value={`${formatNumber(matches)}`} color="from-indigo-500 to-cyan-400" />
              <StatCard icon={<FaBolt />} title="Brackets" value={`${formatNumber(brackets)}`} color="from-amber-400 to-yellow-300" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative flex justify-center lg:justify-end"
          >
            {/* Mock card with tiny animations */}
            <motion.div
              whileHover={{ rotate: -2, y: -6, scale: 1.02 }}
              className="w-full max-w-md rounded-2xl bg-gradient-to-br from-white/4 to-white/8 p-6 shadow-2xl border border-white/6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-gray-400">Next match</div>
                  <div className="font-semibold text-lg">Team A vs Team B</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Today</div>
                  <div className="font-bold text-white">7:30 PM</div>
                </div>
              </div>

              <div className="bg-gray-900 p-4 rounded-lg border border-white/6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-pink-700/20 to-purple-700/10 p-3 rounded-lg">
                    <div className="text-sm text-gray-300">Group A</div>
                    <div className="font-bold text-white">Team X</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-700/10 to-cyan-700/10 p-3 rounded-lg">
                    <div className="text-sm text-gray-300">Stage</div>
                    <div className="font-bold text-white">Quarter-Finals</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-400">
                Create tournaments, invite teams via link, and generate brackets with one click.
              </div>

              <div className="mt-5 flex gap-3">
                <Link to="/signup" className="flex-1 inline-flex justify-center items-center gap-2 bg-pink-600 hover:bg-pink-500 py-2 rounded-lg font-semibold transition">
                  Create Tournament
                </Link>
                <Link to="/tournaments" className="inline-flex items-center gap-2 px-3 py-2 border border-white/8 rounded-lg text-gray-200">
                  Browse
                </Link>
              </div>
            </motion.div>

            {/* floating accent SVG */}
            <svg className="absolute -right-10 -top-10 w-44 h-44 opacity-30" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="g2" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.45" />
                </linearGradient>
              </defs>
              <rect x="10" y="10" width="120" height="120" rx="40" fill="url(#g2)"/>
            </svg>
          </motion.div>
        </div>
      </section>

      {/* Features & testimonials */}
      <section className="py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FeatureCardAnimated
              title="League & Group Stages"
              desc="Auto group creation, fair scheduling and standings."
              icon={<FaUsers />}
              delay={0}
            />
            <FeatureCardAnimated
              title="Knockout Brackets"
              desc="Automatic bracket generation, BYEs and next-match logic."
              icon={<FaTrophy />}
              delay={0.08}
            />
            <FeatureCardAnimated
              title="Score Management"
              desc="Live score updates, penalties for KO and progress flow."
              icon={<FaCalendarAlt />}
              delay={0.16}
            />
            <FeatureCardAnimated
              title="Flexible Rules"
              desc="Choose legs, number of groups, and KO start stages."
              icon={<FaBolt />}
              delay={0.24}
            />
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-white/4 to-white/8 p-6 border border-white/8 shadow-lg">
            <h3 className="text-xl font-bold mb-4">What people say</h3>
            <TestimonialMarquee />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h2 
            initial={{ y: 8, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ duration: 0.5 }} 
            className="text-3xl font-extrabold mb-4"
          >
            Ready to start your next tournament?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.08 }} 
            className="text-gray-300 mb-8"
          >
            Free to start. Powerful enough to run a league. Built to avoid headaches.
          </motion.p>

          <div className="flex gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.04 }} transition={{ type: "spring", stiffness: 300 }}>
              <Link to="/signup" className="group bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold text-lg py-4 px-10 rounded-xl shadow-2xl hover:shadow-2xl transform transition-all inline-flex items-center gap-3">
                Sign Up for Free
                <FaArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
            <Link to="/tournaments" className="inline-flex items-center gap-2 border border-white/10 px-6 py-4 rounded-xl text-gray-200">
              Explore demos
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-gray-400 text-center">
        <div className="max-w-3xl mx-auto">
          <p>Built with care for tournament managers. © {new Date().getFullYear()} TournaMate</p>
        </div>
      </footer>
    </main>
  );
}

/* ---------- small components ---------- */

function Badge() {
  return (
    <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-gradient-to-r from-pink-600/20 to-purple-600/10 border border-white/6 w-max">
      <FaTrophy className="text-pink-400" />
      <span className="text-sm text-pink-200 font-semibold">Tournament platform</span>
    </div>
  );
}

function StatCard({ icon, title, value, color = "from-pink-500 to-purple-500" }) {
  return (
    <div className="flex items-center gap-3 bg-white/3 rounded-lg p-3 border border-white/6">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center text-white bg-gradient-to-br ${color}`}>
        {icon}
      </div>
      <div>
        <div className="text-sm text-gray-300">{title}</div>
        <div className="font-semibold text-lg">{value}</div>
      </div>
    </div>
  );
}

function FeatureCardAnimated({ icon, title, desc, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.03 }}
      className="bg-gradient-to-br from-white/4 to-white/6 border border-white/8 rounded-2xl p-6 shadow-lg"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-lg">
          {icon}
        </div>
        <div>
          <h4 className="font-bold text-white">{title}</h4>
          <p className="text-sm text-gray-300">{desc}</p>
        </div>
      </div>
      <div className="text-xs text-gray-400">Try it — create a tournament in seconds.</div>
    </motion.div>
  );
}

function TestimonialMarquee() {
  const testimonials = [
    "Saved us hours on scheduling — best platform i've used.",
    "Auto-brackets are flawless. BYEs handled like a charm.",
    "My campus league ran without admin chaos for once.",
    "Lovely UI, fast and dependable — recommended.",
  ];

  return (
    <div className="overflow-hidden">
      <motion.div
        className="flex gap-6"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      >
        {testimonials.concat(testimonials).map((t, i) => (
          <div key={i} className="min-w-[260px] bg-gray-900/40 p-4 rounded-lg border border-white/6">
            <p className="text-gray-200">{t}</p>
            <p className="text-xs text-gray-400 mt-2">— Organizer</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function FloatingBlobs() {
  return (
    <>
      <motion.div
        animate={{ y: [0, -10, 0], x: [0, 6, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-20 -top-16 w-72 h-72 rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(circle at 30% 30%, rgba(236,73,153,0.45), transparent 30%), radial-gradient(circle at 70% 70%, rgba(124,58,237,0.35), transparent 30%)" }}
      />
      <motion.div
        animate={{ y: [0, 8, 0], x: [0, -8, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-32 bottom-[-20px] w-80 h-80 rounded-full opacity-18 blur-3xl"
        style={{ background: "radial-gradient(circle at 20% 20%, rgba(6,182,212,0.30), transparent 30%), radial-gradient(circle at 80% 80%, rgba(139,92,246,0.25), transparent 30%)" }}
      />
    </>
  );
}

/* ---------- helpers ---------- */
function formatNumber(n) {
  if (n >= 1e6) return `${Math.floor(n / 1e6)}M+`;
  if (n >= 1e3) return `${Math.floor(n / 1e3)}k+`;
  return `${n}`;
}

export default HomePage;