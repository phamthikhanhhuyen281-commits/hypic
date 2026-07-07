import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  Square, 
  Play, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft,
  Volume2,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { speakingPart1, speakingPart2 } from '../data/speaking';
import { getSpeakingFeedback } from '../lib/ai';
import { cn } from '../lib/utils';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function Speaking() {
  const [activeTab, setActiveTab] = useState<'p1' | 'p2' | 'p3'>('p1');
  const [currentTopicIdx, setCurrentTopicIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [currentP2Idx, setCurrentP2Idx] = useState(0);
  const [currentP3Idx, setCurrentP3Idx] = useState(0);

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [feedback, setFeedback] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Timer for P2
  const [prepTime, setPrepTime] = useState(60);
  const [isPrepping, setIsPrepping] = useState(false);
  const [isSpeakingTime, setIsSpeakingTime] = useState(false);
  const [speakingTime, setSpeakingTime] = useState(120);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const recognition = useRef<any>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isPrepping && prepTime > 0) {
      timerRef.current = setInterval(() => setPrepTime(p => p - 1), 1000);
    } else if (isPrepping && prepTime === 0) {
      setIsPrepping(false);
      setIsSpeakingTime(true);
      startRecording();
    }
    return () => clearInterval(timerRef.current);
  }, [isPrepping, prepTime]);

  useEffect(() => {
    if (isSpeakingTime && speakingTime > 0) {
      timerRef.current = setInterval(() => setSpeakingTime(p => p - 1), 1000);
    } else if (isSpeakingTime && speakingTime === 0) {
      stopRecording();
      setIsSpeakingTime(false);
    }
    return () => clearInterval(timerRef.current);
  }, [isSpeakingTime, speakingTime]);

  const startPrep = () => {
    setPrepTime(60);
    setIsPrepping(true);
    setFeedback(null);
    setTranscript("");
  };

  // Setup STT
  useEffect(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (SpeechRecognition) {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event: any) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setTranscript((prev) => prev + event.results[i][0].transcript + " ");
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
      };
    }
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];
      
      mediaRecorder.current.ondataavailable = (e) => chunks.current.push(e.data);
      mediaRecorder.current.onstop = () => {
        setAudioBlob(new Blob(chunks.current, { type: 'audio/webm' }));
      };

      mediaRecorder.current.start();
      recognition.current?.start();
      setIsRecording(true);
      setTranscript("");
      setFeedback(null);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    recognition.current?.stop();
    setIsRecording(false);
    setIsSpeakingTime(false);
  };

  const getTopic = () => speakingPart1.topics[currentTopicIdx];
  const getQuestion = () => {
    if (activeTab === 'p1') return speakingPart1.topics[currentTopicIdx].questions[currentQuestionIdx];
    if (activeTab === 'p2') return speakingPart2[currentP2Idx].title;
    return speakingPart2[currentP2Idx].part3Questions[currentP3Idx];
  };

  const handleNext = () => {
    if (activeTab === 'p1') {
      const topic = getTopic();
      if (currentQuestionIdx < topic.questions.length - 1) {
        setCurrentQuestionIdx(currentQuestionIdx + 1);
      } else if (currentTopicIdx < speakingPart1.topics.length - 1) {
        setCurrentTopicIdx(currentTopicIdx + 1);
        setCurrentQuestionIdx(0);
      }
    } else if (activeTab === 'p2') {
      setCurrentP2Idx((prev) => (prev + 1) % speakingPart2.length);
    } else {
      setCurrentP3Idx((prev) => (prev + 1) % speakingPart2[currentP2Idx].part3Questions.length);
    }
    resetSession();
  };

  const resetSession = () => {
    setAudioBlob(null);
    setTranscript("");
    setFeedback(null);
    setIsPrepping(false);
    setIsSpeakingTime(false);
    setPrepTime(60);
    setSpeakingTime(120);
  };

  const analyzeResponse = async () => {
    if (!transcript) return;
    setIsAnalyzing(true);
    try {
      const res = await getSpeakingFeedback(transcript, getQuestion());
      setFeedback(res);
      
      if (auth.currentUser) {
        await addDoc(collection(db, `users/${auth.currentUser.uid}/speakingSessions`), {
          topic: activeTab === 'p1' ? getTopic().name : activeTab === 'p2' ? 'Part 2 Cue Card' : 'Part 3 Discussion',
          question: getQuestion(),
          transcript,
          feedback: res,
          createdAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error("Feedback error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const speakQuestion = () => {
    const utterance = new SpeechSynthesisUtterance(getQuestion());
    // Try to find a nice English voice
    const voices = window.speechSynthesis.getVoices();
    const britVoice = voices.find(v => v.lang === 'en-GB' || v.name.includes('Google UK English'));
    if (britVoice) utterance.voice = britVoice;
    utterance.lang = 'en-GB';
    utterance.pitch = 1.0;
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Speaking Lab</h1>
          <p className="text-slate-500">Practice with a smart AI examiner</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200">
           {(['p1', 'p2', 'p3'] as const).map((tab) => (
             <button
               key={tab}
               onClick={() => {
                 setActiveTab(tab);
                 resetSession();
               }}
               className={cn(
                 "px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all",
                 activeTab === tab ? "bg-primary text-white shadow-sm" : "text-slate-400 hover:text-primary"
               )}
             >
               Part {tab.slice(1)}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Questions & Controls */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            key={`${activeTab}-${currentQuestionIdx}-${currentP2Idx}-${currentP3Idx}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-10 space-y-8 min-h-[500px] flex flex-col relative overflow-hidden"
          >
            {/* Examiners Voice selection hint */}
            <div className="absolute top-0 right-0 p-4 opacity-5">
               <Volume2 size={120} />
            </div>

            <div className="flex justify-between items-center relative z-10">
              <span className="text-xs font-bold uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full">
                {activeTab === 'p1' ? `Topic: ${getTopic().name}` : activeTab === 'p2' ? 'Cue Card Exercise' : 'Part 3 Discussion'}
              </span>
              <div className="flex gap-2">
                 <button onClick={speakQuestion} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 text-xs font-bold">
                   <Volume2 size={16} /> Examiner Voice
                 </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center text-center space-y-10 relative z-10">
               {activeTab === 'p2' ? (
                 <div className="w-full space-y-6">
                    <div className="p-8 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-left space-y-6 shadow-sm">
                       <h2 className="text-2xl font-black text-primary leading-tight">
                         {speakingPart2[currentP2Idx].title}
                       </h2>
                       <div className="space-y-4">
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">You should say:</p>
                          <ul className="space-y-2">
                             {speakingPart2[currentP2Idx].prompts.map((p, i) => (
                               <li key={i} className="flex items-center gap-3 text-slate-600 font-medium italic">
                                 <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                 {p}
                               </li>
                             ))}
                          </ul>
                          <p className="text-sm text-slate-400 mt-4 leading-relaxed italic">and explain why this is important to you.</p>
                       </div>
                    </div>

                    <div className="flex justify-center gap-6">
                       {isPrepping ? (
                         <div className="text-center space-y-2">
                            <div className="text-4xl font-black text-accent">{prepTime}s</div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Preparation Time</p>
                         </div>
                       ) : isSpeakingTime ? (
                         <div className="text-center space-y-2">
                            <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="text-4xl font-black text-red-500">{speakingTime}s</motion.div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Talking Time</p>
                         </div>
                       ) : (
                         <button 
                           onClick={startPrep}
                           className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20"
                         >
                           Start 1-Min Prep
                         </button>
                       )}
                    </div>
                 </div>
               ) : (
                 <>
                   <h2 className="text-3xl font-medium leading-relaxed max-w-lg">
                     "{getQuestion()}"
                   </h2>
                   
                   <div className="flex flex-col items-center gap-6">
                      {isRecording ? (
                        <motion.button
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          onClick={stopRecording}
                          className="w-24 h-24 bg-red-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-red-500/30 ring-8 ring-red-50"
                        >
                          <Square size={32} />
                        </motion.button>
                      ) : (
                        <button
                          onClick={startRecording}
                          className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary/30 hover:scale-105 transition-all ring-8 ring-slate-50"
                        >
                          <Mic size={32} />
                        </button>
                      )}
                      <p className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isRecording ? "text-red-500" : "text-slate-400")}>
                        {isRecording ? "Recording Audio..." : transcript ? "Ready for Analysis" : "Examiner is Listening"}
                      </p>
                   </div>
                 </>
               )}
            </div>

            <div className="flex justify-between items-center pt-8 border-t border-slate-100 relative z-10 font-bold">
               <button onClick={handleNext} className="flex items-center gap-2 text-sm text-slate-400 hover:text-primary transition-all">
                 <RotateCcw size={18} /> New Topic
               </button>
               <div className="flex gap-4">
                  {audioBlob && (
                    <button 
                      onClick={() => {
                        const url = URL.createObjectURL(audioBlob);
                        new Audio(url).play();
                      }}
                      className="flex items-center gap-2 text-sm text-accent px-5 py-2.5 bg-accent-light rounded-xl hover:scale-105 transition-all"
                    >
                      <Play size={16} fill="currentColor" /> Playback
                    </button>
                  )}
                  {activeTab !== 'p2' && (
                     <button onClick={handleNext} className="flex items-center gap-2 text-sm text-slate-600 hover:text-primary hover:translate-x-1 transition-all">
                       Next <ChevronRight size={18} />
                     </button>
                  )}
               </div>
            </div>
          </motion.div>

          {/* Transcript Panel */}
          <AnimatePresence>
            {transcript && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center px-2">
                   <h3 className="text-lg font-bold flex items-center gap-2">
                     <RotateCcw size={18} className="text-slate-400" /> 
                     Transcript
                   </h3>
                   {!feedback && !isAnalyzing && (
                     <button 
                       onClick={analyzeResponse}
                       className="text-xs font-bold bg-primary text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-md shadow-primary/20"
                     >
                       <Sparkles size={14} /> Get AI Feedback
                     </button>
                   )}
                </div>
                <div className="glass-card p-6 bg-slate-50/50 border-dashed border-2">
                  <p className="text-slate-700 leading-relaxed italic">
                    "{transcript}"
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Feedback Panel */}
        <div className="space-y-6">
           <div className="glass-card p-6 space-y-6 flex flex-col h-full min-h-[500px]">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="text-accent" /> AI Coach Feedback
              </h3>

              {!transcript && !feedback && (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 text-slate-400">
                  <Info size={48} className="opacity-20" />
                  <p className="text-sm">Record your response to see metrics and improvement tips.</p>
                </div>
              )}

              {isAnalyzing && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                   <motion.div
                     animate={{ rotate: 360 }}
                     transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                     className="w-12 h-12 border-4 border-slate-100 border-t-accent rounded-full"
                   />
                   <p className="text-sm font-medium text-slate-500 animate-pulse">Analyzing fluency & grammar...</p>
                </div>
              )}

              {feedback && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 space-y-6"
                >
                   {/* Scores Grid */}
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Fluency</p>
                         <div className="flex items-end gap-1">
                            <span className="text-2xl font-black text-primary">{feedback.fluency?.score}</span>
                            <span className="text-xs text-slate-400 pb-1">/9</span>
                         </div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Vocabulary</p>
                         <div className="flex items-end gap-1">
                            <span className="text-2xl font-black text-primary">{feedback.vocabulary?.score}</span>
                            <span className="text-xs text-slate-400 pb-1">/9</span>
                         </div>
                      </div>
                   </div>

                   {/* Key Takeaways */}
                   <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm font-bold flex items-center gap-2 text-emerald-600">
                           <CheckCircle2 size={16} /> Suggestions
                        </p>
                        <div className="flex flex-wrap gap-2">
                           {feedback.vocabulary?.suggestions?.map((item: string, i: number) => (
                             <span key={i} className="text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md border border-emerald-100 italic">
                               "{item}"
                             </span>
                           ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-bold flex items-center gap-2 text-rose-600">
                           <AlertCircle size={16} /> Corrections
                        </p>
                        <ul className="space-y-2">
                           {feedback.grammar?.corrections?.map((item: string, i: number) => (
                             <li key={i} className="text-xs text-slate-600 pl-4 border-l-2 border-rose-200 py-1">
                               {item}
                             </li>
                           ))}
                        </ul>
                      </div>

                      <div className="p-4 bg-accent-light/30 rounded-2xl border border-accent/10">
                        <p className="text-sm font-bold text-accent mb-2">Coach's Tip</p>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {feedback.overallInfo}
                        </p>
                      </div>
                   </div>

                   <button 
                    onClick={handleNext} 
                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                   >
                     Next Question <ChevronRight size={18} />
                   </button>
                </motion.div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
