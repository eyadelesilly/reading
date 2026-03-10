import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, CheckCircle2, Info } from 'lucide-react';
import type { Character, Value, Reading } from '../types';

export default function RankCharacters() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reading, setReading] = useState<Reading | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [values, setValues] = useState<Value[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // scores[characterId][valueId] = { score, justification }
  const [scores, setScores] = useState<Record<string, Record<string, { score: number, justification: string }>>>({});
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const studentId = localStorage.getItem('studentId');
    if (!studentId) {
      navigate('/login');
      return;
    }

    const savedScores = localStorage.getItem(`ranking_${id}`);
    if (savedScores) {
      try {
        setScores(JSON.parse(savedScores));
      } catch (e) {
        console.error('Failed to parse saved scores', e);
      }
    }

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

  const currentCharacter = characters[currentIndex];

  const handleScoreChange = (valueId: string, score: number) => {
    if (!currentCharacter) return;
    setScores(prev => ({
      ...prev,
      [currentCharacter.id]: {
        ...(prev[currentCharacter.id] || {}),
        [valueId]: {
          ...(prev[currentCharacter.id]?.[valueId] || { justification: '' }),
          score
        }
      }
    }));
  };

  const handleJustificationChange = (valueId: string, justification: string) => {
    if (!currentCharacter) return;
    setScores(prev => ({
      ...prev,
      [currentCharacter.id]: {
        ...(prev[currentCharacter.id] || {}),
        [valueId]: {
          ...(prev[currentCharacter.id]?.[valueId] || { score: 0 }),
          justification
        }
      }
    }));
  };

  const isCurrentCharacterComplete = () => {
    if (!currentCharacter) return false;
    const charScores = scores[currentCharacter.id] || {};
    return values.every(v => charScores[v.id]?.score > 0);
  };

  const isAllComplete = () => {
    return characters.every(c => {
      const charScores = scores[c.id] || {};
      return values.every(v => charScores[v.id]?.score > 0);
    });
  };

  useEffect(() => {
    if (Object.keys(scores).length > 0) {
      localStorage.setItem(`ranking_${id}`, JSON.stringify(scores));
    }
  }, [scores, id]);

  const handleNext = () => {
    if (currentIndex < characters.length - 1) {
      setCurrentIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (isAllComplete()) {
      navigate(`/readings/${id}/review`);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  if (!reading || characters.length === 0) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">No characters found.</div>;
  }

  const progress = ((currentIndex + (isCurrentCharacterComplete() ? 1 : 0)) / characters.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header & Progress */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{reading.title}</h1>
            <p className="text-sm text-slate-500">Character {currentIndex + 1} of {characters.length}</p>
          </div>
          <button
            onClick={() => navigate('/readings')}
            className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            Exit
          </button>
        </div>
        <div className="max-w-4xl mx-auto h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <main className="max-w-4xl mx-auto p-6 mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCharacter.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
          >
            {/* Character Header */}
            <div className="flex flex-col md:flex-row items-center gap-6 p-8 border-b border-slate-100 bg-slate-50/50">
              <div className="w-24 h-24 rounded-full overflow-hidden shrink-0 border-4 border-white shadow-md bg-slate-200 flex items-center justify-center text-3xl font-bold text-slate-500">
                {currentCharacter.image ? (
                  <img src={`/api/image-proxy?url=${encodeURIComponent(currentCharacter.image)}`} alt={currentCharacter.name} className="w-full h-full object-cover" />
                ) : (
                  currentCharacter.name.charAt(0)
                )}
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">{currentCharacter.name}</h2>
                <p className="text-slate-600 max-w-xl">{currentCharacter.description}</p>
              </div>
            </div>

            {/* Values Scoring */}
            <div className="p-8 space-y-8">
              {values.map(value => {
                const currentScore = scores[currentCharacter.id]?.[value.id]?.score || 0;
                const currentJustification = scores[currentCharacter.id]?.[value.id]?.justification || '';
                
                return (
                  <div key={value.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          {value.name}
                          <div className="group relative">
                            <Info className="w-4 h-4 text-slate-400 cursor-help" />
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 shadow-xl">
                              {value.description}
                              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                            </div>
                          </div>
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">{value.description}</p>
                      </div>
                      <div className="text-2xl font-bold text-blue-600 w-12 text-right">
                        {currentScore > 0 ? currentScore : '-'}
                      </div>
                    </div>

                    {/* Slider */}
                    <div className="mb-6">
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={currentScore || 3}
                        onChange={(e) => handleScoreChange(value.id, parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="flex justify-between text-xs font-medium text-slate-400 mt-2 px-1">
                        <span>1 - Does not demonstrate</span>
                        <span>3 - Sometimes</span>
                        <span>5 - Strongly demonstrates</span>
                      </div>
                    </div>

                    {/* Optional Justification */}
                    <div className="mt-4">
                      <textarea
                        value={currentJustification}
                        onChange={(e) => handleJustificationChange(value.id, e.target.value)}
                        placeholder="Optional: Why did you give this score?"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none h-20"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" /> Previous
          </button>

          <button
            onClick={handleNext}
            disabled={!isCurrentCharacterComplete()}
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20"
          >
            {currentIndex === characters.length - 1 ? (
              <>Review & Submit <CheckCircle2 className="w-5 h-5" /></>
            ) : (
              <>Next Character <ChevronRight className="w-5 h-5" /></>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
