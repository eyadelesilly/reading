import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2 text-blue-900 font-bold text-xl">
          <BookOpen className="w-6 h-6" />
          <span>School Reading Week</span>
        </div>
        <Link to="/admin" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          Teacher Login
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold mb-6">
            <ShieldCheck className="w-4 h-4" />
            <span>Values-Based Evaluation</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
            Evaluate Characters.<br />
            <span className="text-blue-600">Reflect on Values.</span>
          </h1>
          
          <p className="text-lg text-slate-600 mb-10 max-w-xl mx-auto">
            Join your classmates in analyzing the characters from this week's readings. 
            Score them based on our six core school values and see how your perspective 
            compares to the rest of the school.
          </p>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
          >
            Start Ranking <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
