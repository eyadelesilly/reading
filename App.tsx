import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import StudentLogin from './pages/StudentLogin';
import SelectReading from './pages/SelectReading';
import RankCharacters from './pages/RankCharacters';
import ReviewPage from './pages/ReviewPage';
import ResultsPage from './pages/ResultsPage';
import AdminDashboard from './pages/AdminDashboard';
import OverallLeaderboard from './pages/OverallLeaderboard';
import Achievements from './pages/Achievements';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<StudentLogin />} />
        <Route path="/readings" element={<SelectReading />} />
        <Route path="/readings/:id/rank" element={<RankCharacters />} />
        <Route path="/readings/:id/review" element={<ReviewPage />} />
        <Route path="/readings/:id/results" element={<ResultsPage />} />
        <Route path="/leaderboard" element={<OverallLeaderboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/achievements" element={<Achievements />} />
      </Routes>
    </div>
  );
}
