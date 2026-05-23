import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { getAnalyticsSummary, getAnalyticsStats } from '../services/api';
import { Users, MessageCircle, Brain, Target, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const [summary, setSummary] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user || !user._id) return;
      setLoading(true);
      try {
        const [sRes, tRes] = await Promise.all([
          getAnalyticsSummary(user._id),
          getAnalyticsStats()
        ]);
        setSummary(sRes?.data || {});
        setStats(tRes?.data || {});
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
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

        {/* 1. TOP STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1e293b] border border-slate-700/50 p-6 rounded-2xl shadow-lg flex items-center gap-4">
            <div className="p-4 bg-blue-500/10 rounded-xl">
              <MessageCircle className="text-blue-500 w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Missed Messages</p>
              <h3 className="text-2xl font-bold text-white">{summary?.missed || 0}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Direct: {summary?.directMissed || 0} • Channels: {summary?.channelMissed || 0}
              </p>
            </div>
          </div>

          <div className="bg-[#1e293b] border border-slate-700/50 p-6 rounded-2xl shadow-lg flex items-center gap-4">
            <div className="p-4 bg-green-500/10 rounded-xl">
              <Users className="text-green-500 w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Active Online</p>
              <h3 className="text-2xl font-bold text-white">{stats?.activeUsersOnline || 0}</h3>
            </div>
          </div>

          <div className="bg-[#1e293b] border border-slate-700/50 p-6 rounded-2xl shadow-lg flex items-center gap-4">
            <div className="p-4 bg-purple-500/10 rounded-xl">
              <Activity className="text-purple-500 w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Sent Today</p>
              <h3 className="text-2xl font-bold text-white">{stats?.messagesSentToday || 0}</h3>
            </div>
          </div>
        </div>

        {/* 2. AI SUMMARY SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1e293b] border border-slate-700/50 p-6 rounded-2xl shadow-lg lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Brain className="text-pink-500" />
              <h3 className="text-xl font-bold text-white">AI Discussion Summary</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Key Points</h4>
                <ul className="space-y-2">
                  {summary?.keyPoints?.length > 0 ? (
                    summary.keyPoints.map((kp, i) => (
                      <li key={i} className="text-slate-300 flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span> {kp}
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-500 italic">No key discussions detected.</li>
                  )}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Target size={16} /> Action Items
                </h4>
                <ul className="space-y-2">
                  {summary?.actionItems?.length > 0 ? (
                    summary.actionItems.map((a, i) => (
                      <li key={i} className="text-slate-300 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                        {a}
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-500 italic">No pending action items.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-[#1e293b] border border-slate-700/50 p-6 rounded-2xl shadow-lg flex flex-col">
            <h3 className="text-lg font-bold text-white mb-4">Top Channels</h3>
            <div className="flex-1 space-y-3">
              {stats?.mostActiveChannels?.length > 0 ? (
                stats.mostActiveChannels.map((c) => (
                  <div key={c.channelId || Math.random()} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                    <span className="text-slate-300 font-medium"># {c.name || 'Unnamed'}</span>
                    <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-2 py-1 rounded-full">
                      {c.count} msgs
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 italic text-sm">No channel activity yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* 3. RECHARTS GRAPH */}
        <div className="bg-[#1e293b] border border-slate-700/50 p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-bold text-white mb-6">Team Activity (Last 7 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.teamActivity || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" tickFormatter={(val) => val ? val.slice(5) : ''} />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
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