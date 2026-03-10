import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, ChevronLeft, ArrowRight, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Character, Value, Reading } from '../types';

export default function ReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reading, setReading] = useState<Reading | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [values, setValues] = useState<Value[]>([]);
  const [scores, setScores] = useState<Record<string, Record<string, { score: number, justification: string }>>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const studentId = localStorage.getItem('studentId');
    if (!studentId) {
      navigate('/login');
      return;
    }

    const savedScores = localStorage.getItem(`ranking_${id}`);
    if (!savedScores) {
      navigate(`/readings/${id}/rank`);
      return;
    }
    setScores(JSON.parse(savedScores));

    Promise.all([
      fetch(`/api/readings/${id}`).then(res => res.json()),
      fetch(`/api/readings/${id}/characters`).then(res => res.json()),
      fetch('/api/values').then(res => res.json())
    ]).then(([rData, cData, vData]) => {
      setReading(rData);
      setCharacters(cData);
      setValues(vData);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load data', err);
      setLoading(false);
    });
  }, [id, navigate]);

  const handleSubmit = async () => {
    const studentId = localStorage.getItem('studentId');
    if (!studentId) return;

    setSubmitting(true);

    try {
      const allEarnedBadges = new Set<string>();
      // Submit for each character
      for (const char of characters) {
        const charScores = scores[char.id];
        const formattedScores = values.map(v => ({
          valueId: v.id,
          score: charScores[v.id]?.score || 0,
          justification: charScores[v.id]?.justification || ''
        }));

        const res = await fetch('/api/rankings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId,
            characterId: char.id,
            scores: formattedScores
          })
        });
        const data = await res.json();
        if (data.earnedBadges) {
          data.earnedBadges.forEach((b: string) => allEarnedBadges.add(b));
        }
      }

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      localStorage.removeItem(`ranking_${id}`);
      setTimeout(() => {
        navigate(`/readings/${id}/results`, { state: { newBadges: Array.from(allEarnedBadges) } });
      }, 2000);
    } catch (error) {
      console.error('Submission failed', error);
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;

  // Calculate composite scores to show ranked preview
  const rankedCharacters = characters.map(char => {
    const charScores = scores[char.id] || {};
    const compositeScore = values.reduce((sum, v) => sum + (charScores[v.id]?.score || 0), 0);
    return { ...char, compositeScore };
  }).sort((a, b) => b.compositeScore - a.compositeScore);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Review Your Rankings</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Review your final scores for {reading?.title}. Make sure you're happy with your choices before submitting.
          </p>
        </header>

        <div className="space-y-6 mb-12">
          {rankedCharacters.map((char, index) => (
            <motion.div
              key={char.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-blue-500" />
              
              <div className="flex-shrink-0 relative">
                <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-slate-50 flex items-center justify-center text-3xl font-bold text-slate-400 overflow-hidden">
                  {char.image ? (
                    <img src={`/api/image-proxy?url=${encodeURIComponent(char.image)}`} alt={char.name} className="w-full h-full object-cover" />
                  ) : (
                    char.name.charAt(0)
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">
                  #{index + 1}
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-slate-900">{char.name}</h3>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-sm text-slate-500">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span className="font-semibold text-slate-700">{char.compositeScore}</span> total points
                </div>
              </div>

              <div className="w-full md:w-auto grid grid-cols-3 gap-4 text-center md:text-left">
                {values.slice(0, 3).map(v => (
                  <div key={v.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1 truncate" title={v.name}>{v.name}</div>
                    <div className="text-lg font-bold text-slate-900">{scores[char.id]?.[v.id]?.score || 0}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <button
            onClick={() => navigate(`/readings/${id}/rank`)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" /> Edit Rankings
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 transition-all shadow-lg shadow-blue-600/20 hover:scale-105"
          >
            {submitting ? 'Submitting...' : 'Submit Final Rankings'} <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
