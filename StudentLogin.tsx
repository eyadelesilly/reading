import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export default function StudentLogin() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/students/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId: 'default', name: name.trim() })
      });
      
      if (!res.ok) {
        throw new Error('Server returned an error');
      }
      
      const data = await res.json();
      
      if (data.id) {
        localStorage.setItem('studentId', data.id);
        localStorage.setItem('studentName', data.name);
        navigate('/readings');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Login failed', err);
      setError('Failed to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col items-center justify-center p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-semibold tracking-tight text-[#1d1d1f] mb-3">
            Welcome
          </h1>
          <p className="text-[17px] text-[#86868b] tracking-tight">
            Please enter your name to begin.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="w-full px-4 py-4 bg-white border border-[#d2d2d7] rounded-2xl text-[17px] text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
          
          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!name.trim() || loading}
            className="w-full flex items-center justify-center gap-2 bg-[#0071e3] hover:bg-[#0077ED] disabled:bg-[#0071e3]/50 disabled:cursor-not-allowed text-white py-4 rounded-2xl text-[17px] font-medium transition-colors"
          >
            {loading ? 'Continuing...' : 'Continue'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
