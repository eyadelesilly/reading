import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Settings, ArrowLeft, Plus, Edit2, Trash2, X } from 'lucide-react';
import type { Reading, Value } from '../types';

export default function AdminDashboard() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [values, setValues] = useState<Value[]>([]);
  const [activeTab, setActiveTab] = useState<'readings' | 'values'>('readings');
  
  // Modal state
  const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);
  const [editingReading, setEditingReading] = useState<Reading | null>(null);
  const [readingForm, setReadingForm] = useState({ title: '', description: '', gradeLevel: '', coverImage: '' });

  useEffect(() => {
    fetchReadings();
    fetchValues();
  }, []);

  const fetchReadings = () => fetch('/api/readings').then(res => res.json()).then(setReadings).catch(console.error);
  const fetchValues = () => fetch('/api/values').then(res => res.json()).then(setValues).catch(console.error);

  const handleOpenReadingModal = (reading?: Reading) => {
    if (reading) {
      setEditingReading(reading);
      setReadingForm({ title: reading.title, description: reading.description, gradeLevel: reading.gradeLevel, coverImage: reading.coverImage || '' });
    } else {
      setEditingReading(null);
      setReadingForm({ title: '', description: '', gradeLevel: '', coverImage: '' });
    }
    setIsReadingModalOpen(true);
  };

  const handleSaveReading = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingReading ? `/api/readings/${editingReading.id}` : '/api/readings';
    const method = editingReading ? 'PUT' : 'POST';
    
    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(readingForm)
      });
      
      setIsReadingModalOpen(false);
      fetchReadings();
    } catch (error) {
      console.error('Failed to save reading', error);
    }
  };

  const handleDeleteReading = async (id: string) => {
    if (confirm('Are you sure you want to delete this reading?')) {
      try {
        await fetch(`/api/readings/${id}`, { method: 'DELETE' });
        fetchReadings();
      } catch (error) {
        console.error('Failed to delete reading', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-blue-400" />
          <span className="font-bold text-lg">Admin Panel</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('readings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'readings' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <BookOpen className="w-5 h-5" /> Readings
          </button>
          <button
            onClick={() => setActiveTab('values')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'values' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Settings className="w-5 h-5" /> School Values
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors px-4 py-2">
            <ArrowLeft className="w-4 h-4" /> Back to App
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'readings' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Manage Readings</h1>
                  <p className="text-slate-500">Add or edit books and their characters.</p>
                </div>
                <button 
                  onClick={() => handleOpenReadingModal()}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Reading
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {readings.map(reading => (
                  <div key={reading.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-5 relative">
                      <div className="absolute top-4 right-4 flex gap-1">
                        <button 
                          onClick={() => handleOpenReadingModal(reading)}
                          className="p-1.5 bg-slate-100 rounded-md text-slate-600 hover:text-blue-600 transition-colors shadow-sm"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteReading(reading.id)}
                          className="p-1.5 bg-slate-100 rounded-md text-slate-600 hover:text-red-600 transition-colors shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg mb-1 truncate">{reading.title}</h3>
                      <p className="text-sm text-slate-500 mb-4">Grades {reading.gradeLevel}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-md">Active</span>
                        <Link to={`/readings/${reading.id}/results`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                          View Results &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'values' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">School Values</h1>
                  <p className="text-slate-500">Manage the 6 core values used for ranking.</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500 uppercase tracking-wider">
                      <th className="p-4 font-semibold">Value Name</th>
                      <th className="p-4 font-semibold">Description</th>
                      <th className="p-4 font-semibold w-24 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {values.map(val => (
                      <tr key={val.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-900">{val.name}</td>
                        <td className="p-4 text-slate-600 text-sm">{val.description}</td>
                        <td className="p-4 text-center">
                          <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Reading Modal */}
      {isReadingModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingReading ? 'Edit Reading' : 'Add Reading'}</h2>
              <button onClick={() => setIsReadingModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveReading} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input 
                  type="text" 
                  required
                  value={readingForm.title}
                  onChange={e => setReadingForm({...readingForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  required
                  value={readingForm.description}
                  onChange={e => setReadingForm({...readingForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Grade Level</label>
                <input 
                  type="text" 
                  required
                  value={readingForm.gradeLevel}
                  onChange={e => setReadingForm({...readingForm, gradeLevel: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. 9-12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cover Image URL (Optional)</label>
                <input 
                  type="url" 
                  value={readingForm.coverImage}
                  onChange={e => setReadingForm({...readingForm, coverImage: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Leave blank to auto-fetch from Open Library"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsReadingModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Reading
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
