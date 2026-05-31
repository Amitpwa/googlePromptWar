import Link from "next/link";
import {
  Sparkles,
  Calendar,
  Wallet,
  Globe,
  FileText,
  MessageCircle,
  ArrowRight,
  Plane,
  MapPin,
  Shield,
  Star,
  CheckCircle,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden bg-slate-50">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/75 border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-500/20 animate-pulse-glow">
              <Plane className="w-5 h-5 -rotate-45" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">
              TravelEngine
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a>
            <a href="#testimonials" className="hover:text-blue-600 transition-colors">Testimonials</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all rounded-xl shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-gradient-to-br from-blue-700 via-indigo-600 to-teal-500 text-white overflow-hidden py-20 px-6">
        {/* Floating Icons Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
          <Plane className="absolute w-12 h-12 text-white/40 rotate-12 animate-float left-[10%] top-[15%]" style={{ animationDelay: "0s" }} />
          <MapPin className="absolute w-10 h-10 text-white/40 animate-float right-[15%] top-[25%]" style={{ animationDelay: "2s" }} />
          <Globe className="absolute w-14 h-14 text-white/30 animate-float left-[20%] bottom-[20%]" style={{ animationDelay: "4s" }} />
          <Sparkles className="absolute w-8 h-8 text-white/50 animate-float right-[25%] bottom-[15%]" style={{ animationDelay: "1s" }} />
          <div className="absolute w-96 h-96 bg-white/10 blur-3xl rounded-full top-[10%] left-[30%]" />
          <div className="absolute w-96 h-96 bg-white/10 blur-3xl rounded-full bottom-[20%] right-[20%]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wider uppercase mb-8 border border-white/20 hover:bg-white/15 transition-all">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
            <span>Next-Gen Travel Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-8 leading-tight max-w-4xl text-balance">
            Plan Your Dream Trip with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-teal-200 to-cyan-200">
              AI
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mb-12 font-normal leading-relaxed text-balance">
            TravelEngine uses artificial intelligence to create personalized itineraries, track budgets, and adapt your plans in real-time. Make travel effortless.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
            <Link
              href="/register"
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 text-base font-bold text-blue-900 bg-white hover:bg-slate-50 transition-all rounded-2xl shadow-xl shadow-slate-900/10 hover:shadow-slate-900/25 hover:-translate-y-1 active:translate-y-0"
            >
              Start Planning Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all rounded-2xl hover:-translate-y-1 active:translate-y-0"
            >
              Watch Demo
            </a>
          </div>

          <div className="mt-16 flex items-center justify-center gap-8 text-xs font-semibold text-white/70">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-teal-300" /> Free Trial</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-teal-300" /> No Credit Card Required</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-teal-300" /> Vercel Hosted</span>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3">All-In-One SaaS Engine</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-6">
            Everything You Need for the Perfect Trip
          </h3>
          <p className="text-slate-500 font-normal leading-relaxed">
            Consolidate your planning effort into a single state-of-the-art platform. Ditch spreadsheet logs, messy chats, and separate booking lists.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="group relative p-8 bg-white rounded-3xl border border-slate-100 hover:border-blue-500/20 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-3">AI Trip Planner</h4>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Generate complete itineraries with AI based on your preferences, budget constraints, and active interests in under 30 seconds.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-blue-600 gap-1.5">
              <span>Explore module</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="group relative p-8 bg-white rounded-3xl border border-slate-100 hover:border-blue-500/20 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-3">Dynamic Itinerary</h4>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Drag, drop, and customize your daily plans with smart scheduling. Auto-updates and scales budgets immediately on shifts.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-blue-600 gap-1.5">
              <span>Explore module</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Feature 3 */}
          <div className="group relative p-8 bg-white rounded-3xl border border-slate-100 hover:border-blue-500/20 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Wallet className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-3">Budget Tracker</h4>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Track expenses by category with real-time alerts when approaching limits. High-fidelity analytics matching actual costs.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-blue-600 gap-1.5">
              <span>Explore module</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Feature 4 */}
          <div className="group relative p-8 bg-white rounded-3xl border border-slate-100 hover:border-blue-500/20 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-3">Travel Intelligence</h4>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Weather forecasts, visa requirements, and local events at your fingertips. Live caching built directly into database layers.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-blue-600 gap-1.5">
              <span>Explore module</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Feature 5 */}
          <div className="group relative p-8 bg-white rounded-3xl border border-slate-100 hover:border-blue-500/20 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-3">Travel Wallet</h4>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Store bookings, tickets, and travel documents securely. Features local client-side AES-256 encryption.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-blue-600 gap-1.5">
              <span>Explore module</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Feature 6 */}
          <div className="group relative p-8 bg-white rounded-3xl border border-slate-100 hover:border-blue-500/20 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-3">AI Assistant</h4>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Chat with AI to modify plans, get custom local food recommendations, or request re-routing schedules when plans get disrupted.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-blue-600 gap-1.5">
              <span>Explore module</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3">Seamless Interaction Flow</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-6">
              How TravelEngine Works
            </h3>
            <p className="text-slate-500 font-normal">
              Get your entire itinerary designed and active in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-lg mb-6 shadow-lg shadow-blue-600/25">
                1
              </div>
              <h4 className="text-lg font-extrabold text-slate-800 mb-3">Tell Us Your Dream</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                Input your destination, dates, budget constraints, and active personal interests like culinary arts, architecture, or adventure.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-lg mb-6 shadow-lg shadow-blue-600/25">
                2
              </div>
              <h4 className="text-lg font-extrabold text-slate-800 mb-3">AI Creates Your Plan</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                Our GPT-4o engine processes your inputs to design a complete itinerary with cost items, timings, and custom tips.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-lg mb-6 shadow-lg shadow-blue-600/25">
                3
              </div>
              <h4 className="text-lg font-extrabold text-slate-800 mb-3">Travel with Confidence</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                Execute your plans with live weather intelligence and an integrated chat helper standing by to modify itineraries dynamically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3">User Feedback</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-6">
            Loved by Global Adventurers
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col justify-between">
            <p className="text-slate-600 text-base italic leading-relaxed mb-6">
              \"TravelEngine planned my 7-day trip to Tokyo perfectly! It took all of my food interests and planned the best local ramen and sushi stops, while strictly respecting my budget. Truly amazing!\"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center font-bold text-slate-700">
                A
              </div>
              <div>
                <h5 className="text-sm font-bold text-slate-800">Amit Sharma</h5>
                <span className="text-xs text-slate-400">Individual Traveler</span>
              </div>
            </div>
          </div>

          <div className="p-8 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col justify-between">
            <p className="text-slate-600 text-base italic leading-relaxed mb-6">
              \"Planning family trips used to be a nightmare of coordinate logistics. With TravelEngine, we got an optimized schedule in minutes, and the budget tracking prevented us from overspending!\"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center font-bold text-slate-700">
                M
              </div>
              <div>
                <h5 className="text-sm font-bold text-slate-800">Michelle Rossi</h5>
                <span className="text-xs text-slate-400">Family Explorer</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 to-teal-500 rounded-3xl p-12 text-white text-center flex flex-col items-center">
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <Plane className="absolute w-48 h-48 -rotate-45 -right-12 -top-12 text-white" />
          </div>
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Ready to Explore the World?
          </h3>
          <p className="text-white/80 max-w-lg mb-8 text-sm sm:text-base leading-relaxed">
            Create your account today and experience AI travel planning designed for the modern age. Start your planning effort now.
          </p>
          <Link
            href="/register"
            className="px-8 py-4 bg-white text-blue-700 font-bold hover:bg-slate-50 transition-all rounded-2xl shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 hover:-translate-y-0.5 active:translate-y-0"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-100 bg-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white">
              <Plane className="w-4 h-4 -rotate-45" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-800">
              TravelEngine
            </span>
          </div>
          <div className="flex items-center gap-8 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a>
            <a href="#testimonials" className="hover:text-blue-600 transition-colors">Testimonials</a>
          </div>
          <span className="text-slate-400 text-xs font-medium">
            &copy; 2026 TravelEngine. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
