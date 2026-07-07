import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  X, 
  ChevronRight,
  Headphones,
  Zap,
  Volume2,
  Lock,
  Search
} from 'lucide-react';
import { listeningExercises } from '../data/listening';
import { cn } from '../lib/utils';

export default function Listening() {
  const [activeTab, setActiveTab] = useState<'listenType' | 'gapFill' | 'accent'>('listenType');
  const [selectedLevel, setSelectedLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [gapFillValues, setGapFillValues] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const filteredExercises = activeTab === 'listenType' 
    ? listeningExercises.listenAndType.filter(ex => ex.level === selectedLevel)
    : activeTab === 'gapFill'
      ? listeningExercises.gapFill.filter((ex: any) => ex.level === selectedLevel)
      : listeningExercises.accentPractice;

  const exercise = filteredExercises[currentIdx] || filteredExercises[0];

  const handlePlay = (customLang?: string) => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const textToSpeak = activeTab === 'listenType' 
      ? (exercise as any).text 
      : activeTab === 'gapFill' 
        ? (exercise as any).audioText 
        : (exercise as any).text;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Tìm giọng đọc theo yêu cầu hoặc mặc định
    const voices = window.speechSynthesis.getVoices();
    const targetLang = customLang || 'en-GB';
    
    let preferredVoice = voices.find(v => v.lang === targetLang || v.lang.startsWith(targetLang));
    if (!preferredVoice) {
       // Fallback to any English voice
       preferredVoice = voices.find(v => v.lang.startsWith('en'));
    }
    
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.lang = targetLang;
    utterance.rate = playbackRate === 1 ? 0.9 : 0.7; 
    utterance.pitch = 1;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % filteredExercises.length);
    setUserInput("");
    setGapFillValues([]);
    setIsSubmitted(false);
    setIsPlaying(false);
  };

  const getAccuracy = (text1: string, text2: string) => {
    const normalize = (t: string) => t.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
    const t1 = normalize(text1).split(' ');
    const t2 = normalize(text2).split(' ');
    let matches = 0;
    t1.forEach(word => {
      if (t2.includes(word)) matches++;
    });
    return Math.round((matches / t1.length) * 100);
  };

  const getGapFillAccuracy = () => {
    if (!exercise || !(exercise as any).blanks) return 0;
    const blanks = (exercise as any).blanks;
    let matches = 0;
    blanks.forEach((correct: string, i: number) => {
      if (gapFillValues[i]?.toLowerCase().trim() === correct.toLowerCase().trim()) {
        matches++;
      }
    });
    return Math.round((matches / blanks.length) * 100);
  };

  const renderGapFillText = () => {
    if (!exercise || !exercise.text) return null;
    const parts = exercise.text.split(/(\[.*?\])/);
    let blankIdx = 0;

    return (
      <div className="text-xl font-medium leading-loose text-slate-800 text-center flex flex-wrap justify-center items-center gap-x-2 gap-y-4">
        {parts.map((part, i) => {
          if (part.startsWith('[') && part.endsWith(']')) {
            const index = blankIdx++;
            const isCorrect = isSubmitted && gapFillValues[index]?.toLowerCase().trim() === (exercise as any).blanks[index]?.toLowerCase().trim();
            
            return (
              <span key={i} className="relative group">
                <input
                  type="text"
                  value={gapFillValues[index] || ""}
                  onChange={(e) => {
                    const newValues = [...gapFillValues];
                    newValues[index] = e.target.value;
                    setGapFillValues(newValues);
                  }}
                  disabled={isSubmitted}
                  className={cn(
                    "w-32 h-10 border-b-2 bg-transparent text-center focus:outline-none transition-all",
                    isSubmitted 
                      ? (isCorrect ? "border-emerald-500 text-emerald-600 bg-emerald-50" : "border-red-500 text-red-600 bg-red-50")
                      : "border-slate-300 focus:border-accent"
                  )}
                  placeholder="..."
                />
                {isSubmitted && !isCorrect && (
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded font-black whitespace-nowrap">
                    {(exercise as any).blanks[index]}
                  </span>
                )}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Listening Lab</h1>
          <p className="text-slate-500 font-medium">Perfect your transcription and spelling skills</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200">
           {[
             { id: 'listenType', name: 'Listen & Type', icon: Headphones },
             { id: 'gapFill', name: 'Gap Fill', icon: Zap },
             { id: 'accent', name: 'Accent Trainer', icon: Volume2 },
           ].map((tab) => (
             <button
               key={tab.id}
               onClick={() => {
                 setActiveTab(tab.id as any);
                 setCurrentIdx(0);
                 setIsSubmitted(false);
                 setUserInput("");
                 setGapFillValues([]);
               }}
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
          <motion.div 
            key={`${activeTab}-${currentIdx}-${selectedLevel}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 space-y-8 overflow-hidden"
          >
             <div className="flex justify-between items-center">
                <div className="flex gap-4">
                   <div className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase">
                     {exercise.level}
                   </div>
                   <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase border border-emerald-100">
                     {exercise.topic}
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <button 
                    onClick={() => setPlaybackRate(playbackRate === 1 ? 0.75 : 1)}
                    className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md border transition-all",
                      playbackRate < 1 ? "bg-accent text-white border-accent" : "text-slate-400 border-slate-200"
                    )}
                   >
                     Slow Mode
                   </button>
                </div>
             </div>

             <div className="flex flex-col items-center py-12 space-y-8 bg-slate-900 rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
                {/* Visualizer effect */}
                <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-20 pointer-events-none">
                   {[...Array(20)].map((_, i) => (
                     <motion.div 
                        key={i}
                        animate={{ height: isPlaying ? [10, 40, 10] : 10 }}
                        transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                        className="w-1 bg-white rounded-full"
                     />
                   ))}
                </div>
                
                <div className="relative z-10 flex flex-col items-center gap-6">
                  <button 
                    onClick={handlePlay}
                    className="w-24 h-24 bg-white text-primary rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all active:scale-95"
                  >
                    {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" fill="currentColor" />}
                  </button>
                  <div className="text-center space-y-1">
                     <p className="text-xs font-black uppercase tracking-[0.3em] text-white/40">AI Native Engine</p>
                     <p className="text-white font-medium italic">"Listen carefully to the recording..."</p>
                  </div>
                </div>

                {/* Accent Indicators */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 z-10">
                   <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest">Active Native Voice</span>
                   </div>
                   <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest">Accent: British</span>
                   </div>
                </div>
             </div>

             <div className="space-y-4">
                <label className="text-sm font-bold text-slate-400 block px-1 uppercase tracking-wider">
                  {activeTab === 'gapFill' ? 'Listen and Fill in the Blanks' : activeTab === 'accent' ? 'Compare Accents' : 'Your Transcription'}
                </label>
                {activeTab === 'gapFill' ? (
                  <div className="p-8 bg-slate-50 border-2 border-slate-100 rounded-3xl min-h-[150px] flex items-center justify-center">
                    {renderGapFillText()}
                  </div>
                ) : activeTab === 'accent' ? (
                  <div className="space-y-6">
                    <div className="p-8 bg-white border-2 border-slate-100 rounded-3xl text-center">
                       <p className="text-xl font-medium text-slate-800 leading-relaxed italic">"{exercise.text}"</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                       {(exercise as any).accents.map((acc: any, i: number) => (
                         <button 
                           key={i}
                           onClick={() => handlePlay(acc.lang)}
                           className="flex flex-col items-center gap-3 p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] hover:border-accent hover:bg-white transition-all group"
                         >
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:bg-accent group-hover:text-white transition-colors">
                               <Volume2 size={24} />
                            </div>
                            <div className="text-center">
                               <p className="font-bold text-slate-800">{acc.name}</p>
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{acc.description}</p>
                            </div>
                         </button>
                       ))}
                    </div>
                  </div>
                ) : (
                  <textarea 
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    disabled={isSubmitted}
                    placeholder="Type exactly what you hear..."
                    className="w-full h-32 p-6 bg-white border-2 border-slate-200 rounded-2xl focus:border-accent focus:ring-0 transition-all resize-none text-lg leading-relaxed outline-none"
                  />
                )}
             </div>

             <div className="flex justify-between items-center">
                <button 
                  onClick={() => {
                    setUserInput("");
                    setGapFillValues([]);
                  }}
                  disabled={isSubmitted || activeTab === 'accent'}
                  className="p-3 text-slate-400 hover:text-primary transition-colors disabled:opacity-0"
                  title="Reset"
                >
                  <RotateCcw size={20} />
                </button>
                <button 
                   onClick={isSubmitted || activeTab === 'accent' ? handleNext : handleSubmit}
                   disabled={(!isSubmitted && activeTab === 'listenType' && !userInput) || (activeTab === 'gapFill' && gapFillValues.length === 0 && !isSubmitted)}
                   className={cn(
                     "px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg",
                     (isSubmitted || activeTab === 'accent') ? "bg-primary text-white shadow-primary/20" : "bg-accent text-white shadow-accent/20"
                   )}
                >
                   {(isSubmitted || activeTab === 'accent') ? (
                     <>Next Exercise <ChevronRight size={18} /></>
                   ) : (
                     <>Submit Answer <Check size={18} /></>
                   )}
                </button>
             </div>
          </motion.div>

          <AnimatePresence>
            {isSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                 <div className="glass-card p-8 bg-emerald-50/30 border-emerald-100 border-2">
                    <div className="flex justify-between items-center mb-6">
                       <h3 className="text-lg font-bold text-emerald-900 px-4 py-2 bg-emerald-100 rounded-full inline-block">
                         Result Analysis
                       </h3>
                       <div className="flex flex-col items-end">
                          <p className="text-xs font-bold text-slate-400 uppercase">Accuracy</p>
                          <p className="text-3xl font-black text-emerald-600">
                            {activeTab === 'gapFill' ? getGapFillAccuracy() : getAccuracy(exercise.text, userInput)}%
                          </p>
                       </div>
                    </div>
                    
                    {activeTab === 'listenType' && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Correct Answer</p>
                            <p className="text-lg font-medium text-emerald-800 leading-relaxed">{exercise.text}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Your Answer</p>
                            <p className={cn(
                              "text-lg font-medium border-l-4 pl-4 leading-relaxed",
                              getAccuracy(exercise.text, userInput) > 90 ? "text-emerald-700 border-emerald-500" : "text-amber-700 border-amber-500 underline decoration-wavy decoration-amber-300"
                            )}>
                              {userInput}
                            </p>
                        </div>
                      </div>
                    )}

                    {activeTab === 'gapFill' && (
                      <div className="space-y-4">
                        <p className="text-sm font-bold text-emerald-800">Check your blanks against the correct words above.</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                           {(exercise as any).blanks.map((correct: string, i: number) => (
                             <div key={i} className="p-3 rounded-xl bg-white border border-emerald-100 flex items-center justify-between">
                               <div className="flex flex-col">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase">Blank {i+1}</span>
                                  <span className="font-bold text-emerald-700">{correct}</span>
                               </div>
                               {gapFillValues[i]?.toLowerCase().trim() === correct.toLowerCase().trim() ? (
                                 <Check size={16} className="text-emerald-500" />
                               ) : (
                                 <X size={16} className="text-red-400" />
                               )}
                             </div>
                           ))}
                        </div>
                      </div>
                    )}
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
           <div className="glass-card p-6 space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Search className="text-accent" /> Filter Practice
              </h3>
              <div className="space-y-4">
                 <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase">Difficulty</p>
                    <div className="flex flex-wrap gap-2">
                       {['Beginner', 'Intermediate', 'Advanced'].map(l => (
                         <button 
                           key={l} 
                           onClick={() => {
                             setSelectedLevel(l as any);
                             setCurrentIdx(0);
                             setIsSubmitted(false);
                             setUserInput("");
                           }}
                           className={cn(
                             "px-3 py-1 rounded-lg text-xs font-bold border transition-all", 
                             l === selectedLevel ? "bg-primary text-white border-primary" : "bg-white text-slate-500 border-slate-200"
                           )}
                         >
                           {l}
                         </button>
                       ))}
                    </div>
                 </div>
                 <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase">Focus Accent</p>
                    <div className="grid grid-cols-2 gap-2">
                       {['British', 'American', 'Australian', 'Canadian'].map(a => (
                         <button key={a} className="flex items-center justify-between px-3 py-2 bg-white border border-slate-100 rounded-xl text-xs font-medium hover:border-accent group">
                            {a} <Lock size={12} className="text-slate-300 group-hover:text-accent" />
                         </button>
                       ))}
                    </div>
                 </div>
              </div>
           </div>

           <div className="glass-card p-6 bg-primary text-white overflow-hidden relative">
              <div className="relative z-10 space-y-4">
                <h3 className="text-lg font-bold">Shadowing Challenge</h3>
                <p className="text-xs text-primary-foreground/60 leading-relaxed">
                  Daily dictation sessions can improve your score by up to 1 band in 4 weeks.
                </p>
                <button className="w-full py-3 bg-white text-primary rounded-xl font-bold text-sm hover:scale-105 transition-all outline-none">
                   Join Today
                </button>
              </div>
              <Headphones className="absolute -bottom-4 -right-4 opacity-10 w-24 h-24 rotate-12" />
           </div>
        </div>
      </div>
    </div>
  );
}
