import { useNavigate } from "react-router-dom";
import { Camera, Mic, Volume2, AlertOctagon, ArrowRight } from "lucide-react";

export default function InterviewInstructions() {
  const navigate = useNavigate();

  const instructions = [
    {
      icon: <Camera size={22} />,
      title: "Keep your camera and microphone on",
      description: "Your video and audio streams must stay active for the entire session so we can evaluate your responses properly."
    },
    {
      icon: <Volume2 size={22} />,
      title: "Natural conversation flow",
      description: "Each question will be read out automatically. Your microphone activates immediately after the AI finishes speaking."
    },
    {
      icon: <AlertOctagon size={22} />,
      title: "Strict Tab and Window Tracking Active",
      description: "Do not minimize the browser window, switch tabs, or open outside text documents. Leaving this testing screen will be logged immediately and will negatively impact your honesty evaluation metrics."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="border-b border-slate-800 pb-6 mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tight">Candidate Pre-Screening Guidelines</h1>
          <p className="text-slate-400 mt-2">Please read through these structural requirements before commencing.</p>
        </div>

        <div className="space-y-4">
          {instructions.map((item, idx) => (
            <div key={idx} className="flex gap-4 bg-slate-950 border border-slate-800/60 rounded-2xl p-5 items-start">
              <div className="p-3 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-xl shrink-0 text-white">
                {item.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
          <p className="text-sm text-amber-300 leading-relaxed text-center">
            <strong>Important Notification:</strong> Your browser will prompt for camera and microphone accessibility immediately upon proceeding. Grant authorization to ensure your responses are recorded correctly.
          </p>
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate("/room")}
            className="flex items-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 font-bold shadow-xl hover:opacity-95 transform hover:-translate-y-0.5 transition"
          >
            Enter Interview Assessment <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
