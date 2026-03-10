import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trophy, ArrowLeft, BarChart3, Star, BookOpen } from 'lucide-react';
import type { CharacterAnalytics } from '../types';

export default function OverallLeaderboard() {
  const [analytics, setAnalytics] = useState<(CharacterAnalytics & { readingTitle: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics/leaderboard')
      .then(res => res.json())
      .then(data => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load leaderboard data', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;

  const topCharacter = analytics[0];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <Link to="/readings" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Readings
            </Link>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">Overall Leaderboard</h1>
            <p className="text-lg text-slate-600">Top characters across all readings based on core values.</p>
          </div>
          {topCharacter && (
            <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Top Character Overall</p>
                <p className="text-xl font-extrabold text-slate-900">{topCharacter.name}</p>
              </div>
            </div>
          )}
        </header>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" /> All Characters
          </h2>
          <div className="space-y-4">
            {analytics.map((char, index) => (
              <motion.div
                key={char.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${index === 0 ? 'bg-amber-100 text-amber-600' : index === 1 ? 'bg-slate-200 text-slate-600' : index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                  #{index + 1}
                </div>
                <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-white shadow-sm shrink-0 flex items-center justify-center font-bold text-slate-500 overflow-hidden">
                  {char.image ? (
                    <img src={`/api/image-proxy?url=${encodeURIComponent(char.image)}`} alt={char.name} className="w-full h-full object-cover" />
                  ) : (
                    char.name.charAt(0)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 truncate">{char.name}</h3>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      {char.averageCompositeScore.toFixed(1)} avg score
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      <BookOpen className="w-3 h-3 text-slate-400" />
                      {char.readingTitle}
                    </span>
                  </div>
                </div>
                <div className="w-24 md:w-32 h-2 bg-slate-200 rounded-full overflow-hidden hidden sm:block">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${(char.averageCompositeScore / 30) * 100}%` }}
                  />
                </div>
              </motion.div>
            ))}
            
            {analytics.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                No rankings available yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
