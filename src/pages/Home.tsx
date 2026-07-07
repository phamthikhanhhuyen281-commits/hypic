import { motion } from 'motion/react';
import { 
  Mic2, 
  Headphones, 
  PenTool, 
  Library, 
  Calendar, 
  Zap,
  ChevronRight,
  TrendingUp,
  Target,
  Trophy
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const tools = [
  { name: 'Speaking Lab', desc: 'AI-powered feedback on your fluency and grammar.', icon: Mic2, color: 'bg-blue-500', path: '/speaking' },
  { name: 'Listening Lab', desc: 'Dictation and gap-fill exercises for high precision.', icon: Headphones, color: 'bg-emerald-500', path: '/listening' },
  { name: 'Writing Tools', desc: 'Upgrade sentences to Band 7+ and generate essay ideas.', icon: PenTool, color: 'bg-purple-500', path: '/writing' },
  { name: 'LexiVault', desc: 'Your personal vocabulary bank with smart definitions.', icon: Library, color: 'bg-orange-500', path: '/lexivault' },
  { name: 'Study Planner', desc: 'Custom roadmap based on your target band score.', icon: Calendar, color: 'bg-rose-500', path: '/planner' },
  { name: 'Shadowing Mode', desc: 'Improve intonation by echoing native speakers.', icon: Zap, color: 'bg-yellow-500', path: '/listening' },
];

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative pt-10 pb-0 overflow-hidden">
        <div className="text-center space-y-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-primary">
              Simple Tools. <br/>
              <span className="text-accent">Serious Progress.</span>
            </h1>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto"
          >
            A smart, tool-based platform designed for serious IELTS learners. 
            No junk, just high-precision practice engines.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row justify-center gap-4 pt-4"
          >
            <Link to="/speaking" className="px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all text-lg">
              Start Practicing
            </Link>
            <Link to="/planner" className="px-8 py-4 bg-white border border-slate-200 text-primary rounded-2xl font-bold hover:bg-slate-50 transition-all text-lg">
              Explore Tools
            </Link>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] -z-0">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-radial from-accent/5 to-transparent rounded-full blur-3xl" />
        </div>
      </section>

      {/* Quick Tools Dashboard */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold">Quick Tools</h2>
            <p className="text-slate-500">Jump into a focused practice session</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, idx) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -5 }}
              className="glass-card p-6 flex flex-col justify-between group h-full"
            >
              <div className="space-y-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md", tool.color)}>
                  <tool.icon size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary group-hover:text-accent transition-colors">{tool.name}</h3>
                  <p className="text-slate-500 mt-2 text-sm leading-relaxed">{tool.desc}</p>
                </div>
              </div>
              <Link to={tool.path} className="mt-6 flex items-center gap-2 text-sm font-bold text-primary group-hover:translate-x-2 transition-transform">
                Open Tool <ChevronRight size={16} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Progress & Challenge Split */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Challenge */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2">
            <Zap className="text-yellow-500" fill="currentColor" />
            <h2 className="text-2xl font-bold">Today's Challenge</h2>
          </div>
          <div className="bg-primary text-white p-8 rounded-[2rem] relative overflow-hidden shadow-xl">
             <div className="relative z-10 space-y-6">
                <div className="space-y-2">
                   <span className="text-sm font-bold uppercase tracking-widest text-primary-foreground/60">Speaking Prompt</span>
                   <p className="text-2xl font-medium italic">"Describe a piece of technology that you find difficult to use."</p>
                </div>
                <div className="flex gap-4">
                   <Link to="/speaking" className="px-6 py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent/90 transition-all">
                     Try Challenge
                   </Link>
                </div>
             </div>
             {/* Background glow */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
          </div>
        </div>

        {/* Progress Snapshot */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-accent" />
            <h2 className="text-2xl font-bold">Progress Snapshot</h2>
          </div>
          <div className="glass-card p-6 divide-y divide-slate-100 flex flex-col gap-6">
             <div className="flex items-center justify-between pb-6 pt-2">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                      <Zap size={20} />
                   </div>
                   <div>
                      <p className="text-sm text-slate-500">Study Streak</p>
                      <p className="text-xl font-bold">12 Days</p>
                   </div>
                </div>
                <div className="w-10 h-2 bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-orange-500 w-3/4 rounded-full" />
                </div>
             </div>
             <div className="flex items-center justify-between py-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Library size={20} />
                   </div>
                   <div>
                      <p className="text-sm text-slate-500">Saved Words</p>
                      <p className="text-xl font-bold">142 Words</p>
                   </div>
                </div>
                <Target className="text-slate-300" />
             </div>
             <div className="flex items-center justify-between pt-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                      <Mic2 size={20} />
                   </div>
                   <div>
                      <p className="text-sm text-slate-500">Sessions</p>
                      <p className="text-xl font-bold">28 Completed</p>
                   </div>
                </div>
                <Trophy className="text-yellow-400" />
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
