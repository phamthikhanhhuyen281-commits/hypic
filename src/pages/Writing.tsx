import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Lightbulb, 
  PenTool, 
  ChevronRight, 
  ArrowRight,
  MessageSquare,
  BookOpen,
  CheckCircle2,
  Brain
} from 'lucide-react';
import { upgradeWriting, generateEssayIdeas } from '../lib/ai';
import { cn } from '../lib/utils';

export default function Writing() {
  const [activeTab, setActiveTab] = useState<'upgrade' | 'ideas' | 'helper'>('upgrade');
  
  // Upgrade state
  const [sentence, setSentence] = useState("");
  const [upgradedData, setUpgradedData] = useState<any>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Ideas state
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("Education");
  const [ideasData, setIdeasData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleUpgrade = async () => {
    if (!sentence) return;
    setIsUpgrading(true);
    try {
      const res = await upgradeWriting(sentence);
      setUpgradedData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleGenerateIdeas = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const res = await generateEssayIdeas(topic, category);
      setIdeasData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Writing Tools</h1>
          <p className="text-slate-500">Smart generators for high-scoring essays</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200">
           {[
             { id: 'upgrade', name: 'Band 7+ Upgrade', icon: Sparkles },
             { id: 'ideas', name: 'Idea Generator', icon: Lightbulb },
             { id: 'helper', name: 'Helper', icon: PenTool },
           ].map((tab) => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={cn(
                 "flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all",
                 activeTab === tab.id ? "bg-primary text-white shadow-sm" : "text-slate-400 hover:text-primary"
               )}
             >
               <tab.icon size={16} />
               <span className="hidden sm:inline">{tab.name}</span>
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Interface */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'upgrade' && (
              <motion.div
                key="upgrade"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="glass-card p-8 space-y-6">
                   <div className="space-y-4">
                      <label className="text-sm font-bold text-slate-400 block px-1 uppercase tracking-wider">Simple Sentence</label>
                      <textarea 
                        value={sentence}
                        onChange={(e) => setSentence(e.target.value)}
                        placeholder="e.g., Using computers in school is good because children learn faster."
                        className="w-full h-32 p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-accent focus:bg-white transition-all resize-none text-lg outline-none"
                      />
                   </div>
                   <button 
                     onClick={handleUpgrade}
                     disabled={!sentence || isUpgrading}
                     className="w-full py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                   >
                     {isUpgrading ? "Upgrading vocabulary..." : <><Sparkles size={18} /> Upgrade to Band 7+</>}
                   </button>
                </div>

                {upgradedData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card overflow-hidden border-accent/20"
                  >
                    <div className="bg-accent p-6 text-white flex items-center gap-2">
                       <CheckCircle2 size={24} />
                       <h3 className="text-xl font-bold">Natural Band 7 Upgrade</h3>
                    </div>
                    <div className="p-8 space-y-8">
                       <div className="p-6 bg-accent-light/30 rounded-2xl border border-accent/10 relative">
                          <p className="text-xl font-medium leading-relaxed text-slate-800">
                             "{upgradedData.upgraded}"
                          </p>
                          <div className="absolute -top-3 left-6 px-2 bg-white text-accent font-black text-[10px] uppercase border border-accent/20 rounded">
                             Natural & Fluent
                          </div>
                       </div>
                       
                       <div className="space-y-4">
                          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Brain size={14} /> Why this is better
                          </h4>
                          <p className="text-slate-600 leading-relaxed text-sm">
                             {upgradedData.explanation}
                          </p>
                       </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === 'ideas' && (
              <motion.div
                key="ideas"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="glass-card p-8 space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      {['Education', 'Environment', 'Technology', 'Health'].map(cat => (
                        <button 
                          key={cat}
                          onClick={() => setCategory(cat)}
                          className={cn(
                            "py-3 rounded-xl text-sm font-bold border transition-all",
                            category === cat ? "bg-primary text-white border-primary" : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                   </div>
                   <div className="space-y-4">
                      <label className="text-sm font-bold text-slate-400 block px-1 uppercase tracking-wider">Essay Topic / Prompt</label>
                      <textarea 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., Should art subjects be optional in high school?"
                        className="w-full h-32 p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-accent focus:bg-white transition-all resize-none text-lg outline-none"
                      />
                   </div>
                   <button 
                     onClick={handleGenerateIdeas}
                     disabled={!topic || isGenerating}
                     className="w-full py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                   >
                     {isGenerating ? "Brainstorming ideas..." : <><Lightbulb size={18} /> Generate Writing Pillars</>}
                   </button>
                </div>

                {ideasData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                     <div className="glass-card p-6 space-y-4 md:col-span-2 bg-gradient-to-br from-indigo-50 to-white">
                        <div className="flex items-center gap-2 text-indigo-600">
                           <MessageSquare size={18} />
                           <p className="text-sm font-bold uppercase tracking-widest">A Strong Thesis</p>
                        </div>
                        <p className="text-lg font-bold text-slate-800 leading-relaxed italic">"{ideasData.thesis}"</p>
                     </div>

                     <div className="glass-card p-6 space-y-4">
                        <div className="flex items-center gap-2 text-emerald-600">
                           <CheckCircle2 size={18} />
                           <p className="text-sm font-bold uppercase tracking-widest">Main Arguments</p>
                        </div>
                        <ul className="space-y-3">
                           {ideasData.arguments.map((arg: string, i: number) => (
                             <li key={i} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                                <span className="font-bold text-emerald-700">0{i+1}.</span>
                                {arg}
                             </li>
                           ))}
                        </ul>
                     </div>

                     <div className="glass-card p-6 space-y-4">
                        <div className="flex items-center gap-2 text-amber-600">
                           <BookOpen size={18} />
                           <p className="text-sm font-bold uppercase tracking-widest">Real-world Examples</p>
                        </div>
                        <ul className="space-y-3">
                           {ideasData.examples.map((ex: string, i: number) => (
                             <li key={i} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                                <span className="font-bold text-amber-700">Ex.</span>
                                {ex}
                             </li>
                           ))}
                        </ul>
                     </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
           <div className="glass-card p-6 space-y-6">
              <h3 className="text-xl font-bold">Writing Tips</h3>
              <div className="space-y-4">
                 <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-accent">
                       <CheckCircle2 size={16} />
                       <p className="text-xs font-bold uppercase">Complexity</p>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                       Use subordinate clauses (although, whereas, since) to boost your grammatical range score.
                    </p>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-accent">
                       <CheckCircle2 size={16} />
                       <p className="text-xs font-bold uppercase">Cohesion</p>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                       Start each paragraph with a clear topic sentence that links back to your thesis.
                    </p>
                 </div>
              </div>
           </div>

           <div className="glass-card p-6 bg-slate-900 text-white relative overflow-hidden group cursor-pointer">
              <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-center">
                   <h3 className="text-lg font-bold">Full Essay Check</h3>
                   <span className="text-[10px] font-black bg-white/10 px-2 py-1 rounded">PRO</span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">
                   Upload your full essay for a detailed Band Score estimate and paragraph-by-paragraph breakdown.
                </p>
                <div className="flex items-center gap-2 text-sm font-bold group-hover:gap-4 transition-all">
                   Upgrade Account <ArrowRight size={16} />
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent/20 rounded-full blur-3xl group-hover:scale-150 transition-all" />
           </div>
        </div>
      </div>
    </div>
  );
}
