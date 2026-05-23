import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import { Users, MessageCircle, Brain, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user || !user._id) return;
      
      setLoading(true);
      try {
        // 🚨 Using your exact backend route
        const res = await api.get("/dashboard-api/analytics");
        setData(res.data);
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [user]);

  if (!user) {
    return (
      <div className="flex-1 bg-[#020617] flex items-center justify-center text-slate-400">
        Please login to view dashboard.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 bg-[#020617] flex flex-col items-center justify-center h-full">
        <div className="animate-spin w-10 h-10 border-4 border-slate-700 border-t-blue-500 rounded-full mb-4"></div>
        <p className="text-slate-400">Loading AI Analytics...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#020617] overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-2">Workspace Analytics</h2>
        <p className="text-slate-400 mb-8">AI-generated insights and team activity.</p>

        {/* 1. TOP STATS ROW (Wired to data.stats) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <div className="bg-[#1e293b] border border-slate-700/50 p-6 rounded-2xl shadow-lg flex items-center gap-4">
            <div className="p-4 bg-blue-500/10 rounded-xl">
              <Users className="text-blue-500 w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Total Users</p>
              <h3 className="text-2xl font-bold text-white">{data?.stats?.users || 0}</h3>
            </div>
          </div>

          <div className="bg-[#1e293b] border border-slate-700/50 p-6 rounded-2xl shadow-lg flex items-center gap-4">
            <div className="p-4 bg-green-500/10 rounded-xl">
              <MessageCircle className="text-green-500 w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Total Messages</p>
              <h3 className="text-2xl font-bold text-white">{data?.stats?.totalMessages || 0}</h3>
            </div>
          </div>

          <div className="bg-[#1e293b] border border-slate-700/50 p-6 rounded-2xl shadow-lg flex items-center gap-4">
            <div className="p-4 bg-purple-500/10 rounded-xl">
              <Calendar className="text-purple-500 w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Sent Today</p>
              <h3 className="text-2xl font-bold text-white">{data?.stats?.todayMessages || 0}</h3>
            </div>
          </div>

        </div>

        {/* 2. AI SUMMARY SECTION (Wired to data.summary) */}
        <div className="bg-[#1e293b] border border-slate-700/50 p-6 rounded-2xl shadow-lg mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="text-pink-500 w-6 h-6" />
            <h3 className="text-xl font-bold text-white">AI Discussion Summary</h3>
          </div>
          
          <p className="text-slate-400 mb-4">
            You missed <span className="text-white font-bold">{data?.summary?.missedMessages || 0}</span> messages.
          </p>
          
          <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700/50 text-slate-300 leading-relaxed">
            {data?.summary?.summaryText || "No new insights to display at this time. Start chatting to generate an AI summary!"}
          </div>
        </div>

        {/* 3. RECHARTS GRAPH (Wired to data.activity) */}
        <div className="bg-[#1e293b] border border-slate-700/50 p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-bold text-white mb-6">App Usage Analytics</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.activity || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#60a5fa' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}