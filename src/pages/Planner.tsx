import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Target, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  ClipboardList
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Planner() {
  const [currentBand, setCurrentBand] = useState(5.5);
  const [targetBand, setTargetBand] = useState(7.5);
  const [examDate, setExamDate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<any>(null);

  const generatePlan = () => {
    setIsGenerating(true);
    // Simulate real generation
    setTimeout(() => {
      setPlan({
        weeks: [
          {
            title: "Foundation & Awareness",
            focus: "Grammar & Basic Fluency",
            tasks: ["Master compound sentences", "Part 1 speaking drills (20/day)", "Basic listening dictation"]
          },
          {
            title: "Accuracy & Precision",
            focus: "Vocabulary Expansion",
            tasks: ["LexiVault: 50 academic words", "Listening gap-fill accuracy > 90%", "Writing task 2 idea generation"]
          },
          {
             title: "Strategic Performance",
             focus: "Time Management",
             tasks: ["Speaking Part 2 long turns", "Full writing mocks", "Advanced listening accents"]
          }
        ]
      });
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight">Study Planner</h1>
        <p className="text-slate-500 max-w-xl mx-auto text-lg leading-relaxed">
          Tell us your goals, and we'll build a precision-engineered roadmap 
          to get you to your target band score.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Setup Card */}
        <div className="glass-card p-8 space-y-8">
           <h3 className="text-lg font-bold flex items-center gap-2">
             <Target className="text-accent" /> Set Your Goals
           </h3>
           
           <div className="space-y-6">
              <div className="space-y-4">
                 <div className="flex justify-between items-center px-1">
                   <p className="text-sm font-bold text-slate-500 uppercase">Current Level</p>
                   <span className="text-lg font-black text-primary">{currentBand}</span>
                 </div>
                 <input 
                  type="range" min="4.0" max="9.0" step="0.5" 
                  value={currentBand} 
                  onChange={(e) => setCurrentBand(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                 />
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-center px-1">
                   <p className="text-sm font-bold text-slate-500 uppercase">Target Band</p>
                   <span className="text-lg font-black text-accent">{targetBand}</span>
                 </div>
                 <input 
                  type="range" min="4.0" max="9.0" step="0.5" 
                  value={targetBand} 
                  onChange={(e) => setTargetBand(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-accent"
                 />
              </div>

              <div className="space-y-4">
                 <p className="text-sm font-bold text-slate-500 uppercase px-1">Exam Date</p>
                 <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-accent focus:bg-white transition-all outline-none font-medium"
                    />
                 </div>
              </div>
           </div>

           <button 
             onClick={generatePlan}
             disabled={isGenerating || !examDate}
             className="w-full py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50"
           >
             {isGenerating ? "Analyzing data..." : <><Sparkles size={18} /> Build My Roadmap</>}
           </button>
        </div>

        {/* Info Card */}
        <div className="space-y-6">
           <div className="glass-card p-8 bg-accent-light/10 border-accent/20 relative overflow-hidden h-full">
              <div className="relative z-10 space-y-6">
                 <h3 className="text-lg font-bold text-accent">Why HyPilot Planner?</h3>
                 <div className="space-y-4 font-medium text-slate-600 text-sm">
                    <div className="flex gap-4">
                       <CheckCircle2 className="text-accent shrink-0" size={20} />
                       <p>Dynamic adjustment based on your practice performance in Lab sessions.</p>
                    </div>
                    <div className="flex gap-4">
                       <CheckCircle2 className="text-accent shrink-0" size={20} />
                       <p>Automated priority on your weakest modules (Listening, Speaking, etc).</p>
                    </div>
                    <div className="flex gap-4">
                       <CheckCircle2 className="text-accent shrink-0" size={20} />
                       <p>Integrated LexiVault review schedules using spaced repetition.</p>
                    </div>
                 </div>
                 <div className="pt-4">
                    <div className="flex items-center gap-2 text-slate-400 text-xs italic">
                       <Clock size={14} />
                       Updated 2 minutes ago
                    </div>
                 </div>
              </div>
              <Calendar className="absolute -bottom-8 -right-8 w-48 h-48 opacity-5 text-accent rotate-12" />
           </div>
        </div>
      </div>

      {/* Generated Plan Section */}
      <AnimatePresence>
        {plan && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
             <div className="flex items-center gap-2 justify-center">
                <hr className="flex-1 border-slate-200" />
                <span className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] px-4">Your Roadmap</span>
                <hr className="flex-1 border-slate-200" />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plan.weeks.map((week: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass-card p-6 flex flex-col gap-6 group hover:border-accent transition-colors"
                  >
                     <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                           0{idx + 1}
                        </div>
                        <ClipboardList className="text-slate-200 group-hover:text-accent/30 transition-colors" />
                     </div>
                     <div className="space-y-2">
                        <h4 className="font-black text-primary text-lg leading-tight uppercase tracking-tight">{week.title}</h4>
                        <p className="text-xs font-bold text-accent px-2 py-1 bg-accent-light/50 inline-block rounded uppercase tracking-wider">
                           Focus: {week.focus}
                        </p>
                     </div>
                     <ul className="space-y-3 flex-1">
                        {week.tasks.map((task: string, tIdx: number) => (
                          <li key={tIdx} className="flex gap-2 text-sm text-slate-500 font-medium">
                             <div className="w-1 h-1 rounded-full bg-slate-300 mt-2 shrink-0" />
                             {task}
                          </li>
                        ))}
                     </ul>
                     <button className="w-full py-3 bg-slate-50 text-slate-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                        Mark Done
                     </button>
                  </motion.div>
                ))}
             </div>

             <div className="glass-card p-8 bg-gradient-to-r from-accent to-blue-600 text-white flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="space-y-2 text-center md:text-left">
                   <h3 className="text-2xl font-bold tracking-tight uppercase">Ready to Commit?</h3>
                   <p className="text-white/80 font-medium">Sync this study plan with your Google Calendar and get daily reminders.</p>
                </div>
                <button className="px-8 py-4 bg-white text-accent rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                   Connect Calendar
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
