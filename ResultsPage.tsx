import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, ArrowLeft, BarChart3, Star, Award, X, Clock } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { CharacterAnalytics, Reading } from '../types';

const BADGES = {
  thoughtful_evaluator: {
    title: 'Thoughtful Evaluator',
    description: 'Submitted detailed justifications for character rankings.',
    icon: <Star className="w-8 h-8 text-yellow-500" />,
    color: 'bg-yellow-100 border-yellow-200 text-yellow-800',
  },
  value_master: {
    title: 'Value Master',
    description: 'Consistently scored 5s on a specific value across multiple characters.',
    icon: <Trophy className="w-8 h-8 text-purple-500" />,
    color: 'bg-purple-100 border-purple-200 text-purple-800',
  },
  early_bird: {
    title: 'Early Bird',
    description: 'Completed the ranking before the deadline.',
    icon: <Clock className="w-8 h-8 text-blue-500" />,
    color: 'bg-blue-100 border-blue-200 text-blue-800',
  },
};

export default function ResultsPage() {
  const { id } = useParams();
  const location = useLocation();
  const [reading, setReading] = useState<Reading | null>(null);
  const [analytics, setAnalytics] = useState<CharacterAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBadges, setShowBadges] = useState(false);
  const newBadges: string[] = location.state?.newBadges || [];

  useEffect(() => {
    if (newBadges.length > 0) {
      setShowBadges(true);
    }
    Promise.all([
      fetch(`/api/readings/${id}`).then(res => res.json()),
      fetch(`/api/analytics/readings/${id}`).then(res => res.json())
    ]).then(([rData, aData]) => {
      setReading(rData);
      setAnalytics(aData);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load data', err);
      setLoading(false);
    });
  }, [id, newBadges.length]);

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;

  const topCharacter = analytics[0];

  // Prepare data for radar chart (top character vs average)
  const radarData = topCharacter?.valueScores.map(v => {
    const avgScore = analytics.reduce((sum, char) => {
      const charVal = char.valueScores.find(cv => cv.valueId === v.valueId);
      return sum + (charVal?.averageScore || 0);
    }, 0) / analytics.length;

    return {
      subject: v.valueName,
      A: v.averageScore,
      B: avgScore,
      fullMark: 5,
    };
  }) || [];

  // Prepare data for bar chart (all characters composite score)
  const barData = analytics.map(char => ({
    name: char.name,
    score: Number(char.averageCompositeScore.toFixed(1))
  }));

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 relative">
      <AnimatePresence>
        {showBadges && newBadges.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setShowBadges(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">New Badges Unlocked!</h2>
                <p className="text-slate-600">Congratulations! You earned new achievements for your ranking.</p>
              </div>

              <div className="space-y-4 mb-8">
                {newBadges.map(badgeId => {
                  const badge = BADGES[badgeId as keyof typeof BADGES];
                  if (!badge) return null;
                  return (
                    <div key={badgeId} className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${badge.color}`}>
                      <div className="bg-white/50 p-3 rounded-full">
                        {badge.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{badge.title}</h3>
                        <p className="text-sm opacity-90">{badge.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowBadges(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Close
                </button>
                <Link 
                  to="/achievements"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors text-center"
                >
                  View All
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <Link to="/readings" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Readings
            </Link>
            <Link to="/leaderboard" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors">
              <Trophy className="w-4 h-4" /> View Overall Leaderboard
            </Link>
          </div>
          <div className="mt-4 md:mt-0">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">Results: {reading?.title}</h1>
            <p className="text-lg text-slate-600">Class aggregate scores based on core values.</p>
          </div>
          <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Top Character</p>
              <p className="text-xl font-extrabold text-slate-900">{topCharacter?.name}</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Leaderboard */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" /> Overall Leaderboard
            </h2>
            <div className="space-y-4">
              {analytics.map((char, index) => (
                <motion.div
                  key={char.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${index === 0 ? 'bg-amber-100 text-amber-600' : index === 1 ? 'bg-slate-200 text-slate-600' : index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                    #{index + 1}
                  </div>
                  <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-500 overflow-hidden">
                    {char.image ? (
                      <img src={`/api/image-proxy?url=${encodeURIComponent(char.image)}`} alt={char.name} className="w-full h-full object-cover" />
                    ) : (
                      char.name.charAt(0)
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">{char.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      {char.averageCompositeScore.toFixed(1)} avg score
                    </div>
                  </div>
                  <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${(char.averageCompositeScore / 30) * 100}%` }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Radar Chart */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-amber-500" /> Value Profile
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Comparing <strong>{topCharacter?.name}</strong> (blue) against the class average (gray).
            </p>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#94a3b8' }} />
                  <Radar name={topCharacter?.name} dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.5} />
                  <Radar name="Average" dataKey="B" stroke="#94a3b8" fill="#cbd5e1" fillOpacity={0.3} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Score Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} domain={[0, 30]} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="score" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
