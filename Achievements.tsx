import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, Star, Clock, Trophy } from 'lucide-react';

interface Achievement {
  id: string;
  studentId: string;
  badgeId: string;
  earnedAt: string;
}

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

export default function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const studentId = localStorage.getItem('studentId');
  const studentName = localStorage.getItem('studentName');

  useEffect(() => {
    if (!studentId) {
      navigate('/login');
      return;
    }

    fetch(`/api/students/${studentId}/achievements`)
      .then(res => res.json())
      .then(data => {
        setAchievements(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch achievements:', err);
        setLoading(false);
      });
  }, [studentId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const earnedBadgeIds = achievements.map(a => a.badgeId);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <Link to="/readings" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Readings
        </Link>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 mb-8 text-center">
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="w-10 h-10" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {studentName}'s Achievements
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Unlock badges by participating in reading week activities, providing thoughtful evaluations, and completing rankings early!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(BADGES).map(([id, badge], index) => {
            const isEarned = earnedBadgeIds.includes(id);
            const achievement = achievements.find(a => a.badgeId === id);
            
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-3xl p-6 border-2 transition-all ${
                  isEarned 
                    ? badge.color 
                    : 'bg-white border-slate-200 opacity-60 grayscale'
                }`}
              >
                <div className="flex flex-col items-center text-center h-full">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isEarned ? 'bg-white/50' : 'bg-slate-100'}`}>
                    {badge.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{badge.title}</h3>
                  <p className={`text-sm mb-4 flex-1 ${isEarned ? 'opacity-90' : 'text-slate-500'}`}>
                    {badge.description}
                  </p>
                  
                  {isEarned ? (
                    <div className="text-xs font-medium uppercase tracking-wider opacity-75 mt-auto">
                      Earned on {new Date(achievement!.earnedAt).toLocaleDateString()}
                    </div>
                  ) : (
                    <div className="text-xs font-medium uppercase tracking-wider text-slate-400 mt-auto">
                      Locked
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
