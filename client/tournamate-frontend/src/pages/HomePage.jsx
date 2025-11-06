// src/pages/HomePage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaTrophy,
  FaUsers,
  FaCalendarAlt,
  FaBolt,
  FaArrowRight,
  FaStar,
  FaMobile,
  FaDesktop,
  FaShieldAlt,
  FaRocket,
  FaCheckCircle,
  FaPlay,
} from "react-icons/fa";

function HomePage() {
  // animated counters
  const [teams, setTeams] = useState(0);
  const [matches, setMatches] = useState(0);
  const [brackets, setBrackets] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Move testimonials array to the top so it can be used in useEffect
  const testimonials = [
    {
      text: "Saved us hours on scheduling — best platform I've used.",
      author: "Alex M.",
      role: "Esports Tournament Organizer",
      rating: 5,
    },
    {
      text: "Auto-brackets are flawless. BYEs handled like a charm.",
      author: "Sarah K.",
      role: "College Sports Coordinator",
      rating: 5,
    },
    {
      text: "My campus league ran without admin chaos for once.",
      author: "Mike R.",
      role: "Student Union President",
      rating: 4,
    },
    {
      text: "Lovely UI, fast and dependable — highly recommended!",
      author: "Jessica L.",
      role: "Community Manager",
      rating: 5,
    },
  ];

  // simulate stats load
  useEffect(() => {
    let t = 0,
      m = 0,
      b = 0;
    const tInt = setInterval(() => {
      t += Math.ceil(Math.random() * 12);
      if (t >= 1200) {
        t = 1200;
        clearInterval(tInt);
      }
      setTeams(t);
    }, 60);
    const mInt = setInterval(() => {
      m += Math.ceil(Math.random() * 7);
      if (m >= 5600) {
        m = 5600;
        clearInterval(mInt);
      }
      setMatches(m);
    }, 55);
    const bInt = setInterval(() => {
      b += Math.ceil(Math.random() * 3);
      if (b >= 320) {
        b = 320;
        clearInterval(bInt);
      }
      setBrackets(b);
    }, 75);
    return () => {
      clearInterval(tInt);
      clearInterval(mInt);
      clearInterval(bInt);
    };
  }, []);

  // Testimonial rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const features = [
    {
      icon: <FaUsers />,
      title: "League & Group Stages",
      desc: "Auto group creation, fair scheduling and real-time standings.",
      color: "from-blue-500 to-cyan-500",
      delay: 0,
    },
    {
      icon: <FaTrophy />,
      title: "Knockout Brackets",
      desc: "Automatic bracket generation with BYEs and next-match logic.",
      color: "from-amber-500 to-yellow-500",
      delay: 80,
    },
    {
      icon: <FaCalendarAlt />,
      title: "Live Score Management",
      desc: "Real-time score updates with penalty shootout support.",
      color: "from-green-500 to-emerald-500",
      delay: 160,
    },
    {
      icon: <FaBolt />,
      title: "Flexible Rules",
      desc: "Customize legs, groups, and knockout stages easily.",
      color: "from-purple-500 to-pink-500",
      delay: 240,
    },
  ];

  const platforms = [
    {
      icon: <FaMobile />,
      name: "Mobile First",
      desc: "Works perfectly on all devices",
    },
    {
      icon: <FaDesktop />,
      name: "Desktop Power",
      desc: "Full features on larger screens",
    },
    {
      icon: <FaShieldAlt />,
      name: "Secure & Reliable",
      desc: "Your data is always safe",
    },
    {
      icon: <FaRocket />,
      name: "Lightning Fast",
      desc: "Quick loading and smooth interactions",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white selection:bg-pink-400/40 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-28">
        <FloatingBlobs />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column */}
          <div className="text-center lg:text-left space-y-6 lg:space-y-8">
            <Badge />

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight">
              Organize tournaments —{" "}
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                fast, smart, fun
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Create groups, auto-schedule fixtures, and run knockout brackets
              without the usual chaos. Perfect for esports, sports leagues, and
              community tournaments.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/signup"
                className="group bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl transform hover:scale-105 transition-all duration-300 inline-flex items-center justify-center gap-3"
              >
                Start Free Trial
                <FaArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/tournaments"
                className="group border-2 border-white/10 hover:border-white/20 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/5 transition-all duration-300 inline-flex items-center justify-center gap-3"
              >
                <FaPlay className="text-sm" />
                Watch Demo
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <StatCard
                icon={<FaUsers />}
                title="Teams"
                value={`${formatNumber(teams)}+`}
                color="from-pink-500 to-purple-500"
              />
              <StatCard
                icon={<FaCalendarAlt />}
                title="Matches"
                value={`${formatNumber(matches)}+`}
                color="from-indigo-500 to-cyan-400"
              />
              <StatCard
                icon={<FaBolt />}
                title="Brackets"
                value={`${formatNumber(brackets)}+`}
                color="from-amber-400 to-yellow-300"
              />
            </div>
          </div>

          {/* Right Column - Preview Card */}
          <div className="relative">
            <div className="relative z-10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl hover-card transform-gpu">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-sm text-gray-400">
                    Next Match • Group A
                  </div>
                  <div className="font-bold text-xl sm:text-2xl mt-1">
                    Team Phoenix vs Team Titans
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Today</div>
                  <div className="font-bold text-white text-lg">19:30</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-xl border border-white/5">
                  <span className="font-semibold">Team Phoenix</span>
                  <span className="bg-pink-500/20 text-pink-300 px-3 py-1 rounded-lg text-sm font-bold">
                    2-1
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-xl border border-white/5">
                  <span className="font-semibold">Team Titans</span>
                  <span className="text-gray-400 px-3 py-1 text-sm">Final</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                <div className="text-sm text-gray-300">
                  <strong>Quarter-Finals</strong> • Best of 3 • Next: Tomorrow
                  18:00
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Link
                  to="/signup"
                  className="flex-1 bg-pink-600 hover:bg-pink-500 py-3 rounded-lg font-semibold text-center transition-colors"
                >
                  Create Tournament
                </Link>
                <Link
                  to="/tournaments"
                  className="px-4 py-3 border border-white/10 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2"
                >
                  Browse
                </Link>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-2xl rotate-12 blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-pink-400/20 to-purple-500/20 rounded-2xl -rotate-12 blur-xl"></div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 bg-gray-800/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-gray-400 text-sm uppercase tracking-wider">
              Trusted by tournament organizers worldwide
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 opacity-60">
            {[
              "Esports Arena",
              "Campus League",
              "Community Cup",
              "Pro Circuit",
              "Amateur Series",
            ].map((org, index) => (
              <div
                key={index}
                className="text-gray-300 font-semibold text-lg hover:text-white transition-colors cursor-pointer"
              >
                {org}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Everything you need to run{" "}
              <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                perfect tournaments
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From small community events to large competitive leagues, we've
              got you covered with powerful features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
            {features.map((feature, index) => (
              <FeatureCardAnimated
                key={index}
                icon={feature.icon}
                title={feature.title}
                desc={feature.desc}
                color={feature.color}
                delay={feature.delay}
              />
            ))}
          </div>

          {/* Platform Features */}
          <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-3xl p-8 border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {platforms.map((platform, index) => (
                <div
                  key={index}
                  className="text-center p-6 hover:bg-white/5 rounded-xl transition-all duration-300"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-2xl text-purple-300">
                    {platform.icon}
                  </div>
                  <h4 className="font-bold text-lg mb-2">{platform.name}</h4>
                  <p className="text-gray-300 text-sm">{platform.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 lg:py-24 bg-gray-800/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Loved by{" "}
              <span className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                organizers
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              See what tournament organizers are saying about their experience
              with TournaMate.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-3xl p-8 border border-white/10">
              <div className="flex flex-col lg:flex-row gap-8 items-center">
                <div className="flex-1">
                  <div className="text-6xl text-yellow-400 mb-4">"</div>
                  <p className="text-xl lg:text-2xl text-gray-200 mb-6 leading-relaxed">
                    {testimonials[activeTestimonial].text}
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={
                          i < testimonials[activeTestimonial].rating
                            ? "text-yellow-400"
                            : "text-gray-600"
                        }
                        size={16}
                      />
                    ))}
                  </div>
                  <div className="font-semibold text-lg">
                    {testimonials[activeTestimonial].author}
                  </div>
                  <div className="text-gray-400">
                    {testimonials[activeTestimonial].role}
                  </div>
                </div>

                <div className="w-full lg:w-48 space-y-3">
                  {testimonials.map((testimonial, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTestimonial(index)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        activeTestimonial === index
                          ? "border-pink-500 bg-pink-500/10"
                          : "border-white/5 hover:border-white/10"
                      }`}
                    >
                      <div className="font-medium mb-1">
                        {testimonial.author}
                      </div>
                      <div className="text-sm text-gray-400 truncate">
                        {testimonial.text}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl p-8 lg:p-12 border border-purple-500/20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Ready to start your next tournament?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of organizers who trust TournaMate for their
              events. Free to start, powerful enough for pro leagues.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/signup"
                className="group bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold text-lg py-4 px-8 rounded-xl shadow-2xl inline-flex items-center gap-3 transition-all transform hover:scale-105"
              >
                <FaRocket className="text-sm" />
                Start Free Trial
                <FaArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/tournaments"
                className="inline-flex items-center gap-3 border-2 border-white/10 hover:border-white/20 px-8 py-4 rounded-xl text-gray-200 hover:bg-white/5 transition-all font-semibold"
              >
                <FaPlay className="text-sm" />
                See Live Demo
              </Link>
            </div>

            <div className="mt-8 text-gray-400 text-sm">
              <div className="flex flex-wrap justify-center gap-6">
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-400" />
                  <span>Free forever plan</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-400" />
                  <span>Setup in 2 minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FaTrophy className="text-pink-400 text-2xl" />
                <span className="text-xl font-bold">TournaMate</span>
              </div>
              <p className="text-gray-400">
                Making tournament organization simple, fast, and enjoyable for
                everyone.
              </p>
            </div>

            {[
              {
                title: "Product",
                links: ["Features", "Examples", "Pricing", "API"],
              },
              {
                title: "Company",
                links: ["About", "Blog", "Careers", "Contact"],
              },
              {
                title: "Support",
                links: ["Help Center", "Documentation", "Community", "Status"],
              },
            ].map((section, index) => (
              <div key={index}>
                <h4 className="font-semibold text-white mb-4">
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href="#"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-white/10 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} TournaMate. Built with ❤️ for
              tournament organizers worldwide.
            </p>
          </div>
        </div>
      </footer>

      {/* Scoped CSS animations */}
      <style>{`
        /* hero reveal */
        .hero-reveal { opacity: 0; transform: translateY(8px); animation: heroReveal 700ms cubic-bezier(.16,.84,.28,1) forwards; }
        @keyframes heroReveal { to { opacity: 1; transform: translateY(0); } }

        /* hover card lift */
        .hover-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 32px 64px rgba(0, 0, 0, 0.4); }

        /* floating blobs */
        .blob-1, .blob-2 { position: absolute; border-radius: 9999px; filter: blur(28px); pointer-events: none; transform: translate3d(0,0,0); }
        .blob-1 { left: -5rem; top: -4rem; width: 18rem; height: 18rem; opacity: 0.24; background: radial-gradient(circle at 30% 30%, rgba(236,73,153,0.45), transparent 30%), radial-gradient(circle at 70% 70%, rgba(124,58,237,0.35), transparent 30%); animation: blobFloat1 8s ease-in-out infinite; }
        .blob-2 { right: -8rem; bottom: -4rem; width: 20rem; height: 20rem; opacity: 0.18; background: radial-gradient(circle at 20% 20%, rgba(6,182,212,0.30), transparent 30%), radial-gradient(circle at 80% 80%, rgba(139,92,246,0.25), transparent 30%); animation: blobFloat2 10s ease-in-out infinite; }
        @keyframes blobFloat1 { 0% { transform: translate(0,0) } 50% { transform: translate(6px,-12px) } 100% { transform: translate(0,0) } }
        @keyframes blobFloat2 { 0% { transform: translate(0,0) } 50% { transform: translate(-10px,8px) } 100% { transform: translate(0,0) } }

        /* mobile optimizations */
        @media (max-width: 768px) {
          .hover-card:hover { transform: none; }
        }
      `}</style>
    </main>
  );
}

/* ---------- Small Components ---------- */

function Badge() {
  return (
    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-pink-600/20 to-purple-600/10 border border-white/6 w-max mx-auto lg:mx-0">
      <FaTrophy className="text-pink-400" />
      <span className="text-sm text-pink-200 font-semibold">
        #1 Tournament Platform
      </span>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  color = "from-pink-500 to-purple-500",
}) {
  return (
    <div className="flex items-center gap-3 bg-white/3 rounded-xl p-4 border border-white/6 transform-gpu transition-all hover:scale-105 hover:bg-white/5">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${color} shadow-lg`}
      >
        {icon}
      </div>
      <div>
        <div className="text-sm text-gray-300">{title}</div>
        <div className="font-bold text-lg sm:text-xl">{value}</div>
      </div>
    </div>
  );
}

function FeatureCardAnimated({
  icon,
  title,
  desc,
  color = "from-pink-500 to-purple-500",
  delay = 0,
}) {
  const style = {
    animation: `featureFade 600ms ease forwards`,
    animationDelay: `${delay}ms`,
    opacity: 0,
    transform: "translateY(8px)",
  };

  return (
    <>
      <style>{`
        @keyframes featureFade { 
          to { 
            opacity: 1; 
            transform: translateY(0); 
          } 
        }
      `}</style>
      <div
        style={style}
        className="bg-gradient-to-br from-white/4 to-white/6 border border-white/8 rounded-2xl p-6 shadow-lg hover:scale-105 transition-all duration-300 group cursor-pointer"
      >
        <div className="flex items-center gap-4 mb-4">
          <div
            className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform`}
          >
            {icon}
          </div>
          <div>
            <h4 className="font-bold text-white text-lg mb-1">{title}</h4>
            <p className="text-gray-300 text-sm leading-relaxed">{desc}</p>
          </div>
        </div>
        <div className="text-xs text-gray-400 flex items-center gap-2">
          <FaCheckCircle className="text-green-400 text-xs" />
          Try it — create a tournament in seconds
        </div>
      </div>
    </>
  );
}

function FloatingBlobs() {
  return (
    <>
      <div className="blob-1" aria-hidden />
      <div className="blob-2" aria-hidden />
    </>
  );
}

/* ---------- Helpers ---------- */
function formatNumber(n) {
  if (n >= 1e6) return `${Math.floor(n / 1e6)}M`;
  if (n >= 1e3) return `${Math.floor(n / 1e3)}k`;
  return `${n}`;
}

export default HomePage;
