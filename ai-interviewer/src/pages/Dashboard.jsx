import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import HeroBanner from "../components/HeroBanner";
import StatCard from "../components/StatCard";
import InterviewCard from "../components/InterviewCard";
import ScoreChart from "../components/ScoreChart";
import { Loader2 } from "lucide-react";
import { API_URL } from "../config/api.js"; // adjust path if your config file lives elsewhere
import { supabase } from "../supabaseClient.js";

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPersonalized, setIsPersonalized] = useState(false);

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      setLoading(true);
      try {
        // 🔑 Always check the LIVE session right before fetching —
        // don't rely on a stale value from earlier in the render.
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        const accessToken = session?.access_token || null;
        setIsPersonalized(!!accessToken);

        // 🔑 Attach the user's Supabase access token so the backend can
        // identify who's asking and scope the analytics to their sessions.
        // With no token (guest), the backend should fall back to global data.
        const response = await fetch(`${API_URL}/interview/global-analytics`, {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
        });
        const json = await response.json();

        if (json.success) {
          const rawMetrics = json.metrics;

          // Days of the week lookup table
          const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

          // Safely format raw database items into objects Recharts understands
          const formattedScoreTrend = (rawMetrics.scoreTrend || []).map((item) => {
            // Backend (analyticsController.js) sends the label as `name`
            // (already formatted, e.g. "Jul 14"). Fall back to `day` or
            // `created_at` in case an older/different backend shape is ever
            // returned, so this never silently collapses to a placeholder.
            let dayLabel = item.name || item.day;

            if (!dayLabel && item.created_at) {
              const dateObj = new Date(item.created_at);
              dayLabel = daysOfWeek[dateObj.getDay()];
            }

            return {
              day: dayLabel || "Day",
              score: Number(item.score) || 0, // Ensure score is an absolute number
            };
          });

          // Store the processed data back into state
          setMetrics({
            ...rawMetrics,
            scoreTrend: formattedScoreTrend,
          });
        }
      } catch (err) {
        console.error("Failed fetching live dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardMetrics();

    // 🔑 Re-fetch automatically on sign-in / sign-out, so the dashboard
    // flips between global and personalized data live, without a manual refresh.
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchDashboardMetrics();
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-950 text-white items-center justify-center">
        <Loader2 className="animate-spin text-purple-500" size={40} />
      </div>
    );
  }

  const data = metrics || {
    totalInterviews: 0,
    averageScore: 0,
    skillsTestedCount: 0,
    recentInterviews: [],
    scoreTrend: []
  };

  const dynamicStats = [
    {
      title: "TOTAL INTERVIEWS",
      value: data.totalInterviews,
      trend: "", 
    },
    {
      title: "AVERAGE SCORE",
      value: `${data.averageScore}%`,
      trend: "",
    },
    {
      title: "SKILLS TESTED",
      value: data.skillsTestedCount,
      trend: "", // Changed from "Distinct areas" for clarity
    }
  ];

  return (
    <div className="flex bg-slate-950 text-white min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8">
        <HeroBanner />

        {/* Real-time Metric Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {dynamicStats.map((item) => (
            <StatCard
              key={item.title}
              title={item.title}
              value={item.value}
              trend={item.trend}
            />
          ))}
        </div>

        {/* Dynamic Score Curve Component passing liveData prop */}
        <div className="mt-8">
          <ScoreChart liveData={data.scoreTrend} />
        </div>

        {/* Recent Interviews History Feed */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">
            {isPersonalized ? "Your Recent Interviews" : "Recent Interviews (All Mocks)"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.recentInterviews.length === 0 ? (
              <div className="col-span-3 text-center py-10 text-sm text-slate-500 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
                No interview sessions completed yet. Click "Start Interview" to begin!
              </div>
            ) : (
              data.recentInterviews.map((item) => (
                <InterviewCard
                  key={item.id || item.title}
                  title={item.title}
                  score={`${item.score}`}
                  summary={item.summary}
                />
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
