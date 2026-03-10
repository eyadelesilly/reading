import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, ChevronRight, GraduationCap, Award } from 'lucide-react';
import type { Reading } from '../types';

export default function SelectReading() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const studentId = localStorage.getItem('studentId');
    if (!studentId) {
      navigate('/login');
      return;
    }

    fetch('/api/readings')
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP error! status: ${res.status}, body: ${text.substring(0, 100)}`);
        }
        return res.json();
      })
      .then(data => {
        setReadings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load readings', err);
        setLoading(false);
      });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">Select a Reading</h1>
            <p className="text-lg text-slate-600">Choose the book your class is currently analyzing.</p>
          </div>
          <Link 
            to="/achievements" 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-full font-medium transition-colors"
          >
            <Award className="w-5 h-5" />
            My Achievements
          </Link>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-3xl h-80 animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {readings.map((reading, i) => (
              <motion.div
                key={reading.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 flex flex-col"
              >
                <div className="p-6 flex-1 flex flex-col">
                  <h2 className="text-xl font-bold text-slate-900 mb-2">{reading.title}</h2>
                  <p className="text-slate-600 text-sm line-clamp-3 mb-6 flex-1">
                    {reading.description}
                  </p>
                  
                  <Link
                    to={`/readings/${reading.id}/rank`}
                    className="w-full inline-flex items-center justify-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white py-3 rounded-xl font-semibold transition-colors"
                  >
                    Rank Characters <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
