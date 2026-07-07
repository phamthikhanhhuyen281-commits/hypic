import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Star, 
  Volume2, 
  ChevronRight,
  Library,
  BookOpen,
  Filter,
  Bookmark
} from 'lucide-react';
import { commonIELTSWords, WordDefinition } from '../data/vocabulary';
import { cn } from '../lib/utils';
import { auth, db } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';

export default function Lexivault() {
  const [searchTerm, setSearchTerm] = useState("");
  const [savedWords, setSavedWords] = useState<any[]>([]);
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites'>('all');

  useEffect(() => {
    if (!auth.currentUser) {
      setSavedWords(commonIELTSWords.map((w, i) => ({ ...w, id: `local-${i}`, isFavorite: false })));
      return;
    }

    const q = query(collection(db, `users/${auth.currentUser.uid}/lexivault`));
    const unsub = onSnapshot(q, (snapshot) => {
      const words = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (words.length === 0) {
        setSavedWords(commonIELTSWords.map((w, i) => ({ ...w, id: `local-${i}`, isFavorite: false })));
      } else {
        setSavedWords(words);
      }
    });

    return unsub;
  }, []);

  const handleToggleFavorite = async (word: any) => {
    if (!auth.currentUser || word.id.startsWith('local')) return;
    const wordRef = doc(db, `users/${auth.currentUser.uid}/lexivault`, word.id);
    await updateDoc(wordRef, { isFavorite: !word.isFavorite });
  };

  const handleSaveWord = async (word: WordDefinition) => {
    if (!auth.currentUser) return;
    await addDoc(collection(db, `users/${auth.currentUser.uid}/lexivault`), {
      ...word,
      isFavorite: false,
      savedAt: serverTimestamp()
    });
  };

  const filteredWords = savedWords.filter(w => {
    const matchesSearch = w.word.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          w.meaning.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || w.isFavorite;
    return matchesSearch && matchesFilter;
  });

  const speakWord = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
            <Library size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">LexiVault</h1>
            <p className="text-slate-500">Your personal dictionary of high-yield IELTS words</p>
          </div>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200">
           {(['all', 'favorites'] as const).map((f) => (
             <button
               key={f}
               onClick={() => setActiveFilter(f)}
               className={cn(
                 "px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all",
                 activeFilter === f ? "bg-primary text-white shadow-sm" : "text-slate-400 hover:text-primary"
               )}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* List View */}
        <div className="lg:col-span-4 space-y-4">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search words or meanings..."
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all outline-none text-sm font-medium"
              />
           </div>

           <div className="space-y-2 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredWords.map((word) => (
                <motion.div
                  layout
                  key={word.id}
                  onClick={() => setSelectedWord(word)}
                  className={cn(
                    "p-4 rounded-2xl border transition-all cursor-pointer group flex items-center justify-between",
                    selectedWord?.id === word.id 
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]" 
                      : "bg-white text-slate-700 border-slate-100 hover:border-accent hover:shadow-md"
                  )}
                >
                  <div className="space-y-1">
                     <p className="font-bold text-lg">{word.word}</p>
                     <p className={cn("text-xs transition-colors", selectedWord?.id === word.id ? "text-primary-foreground/60" : "text-slate-400")}>
                        {word.meaning}
                     </p>
                  </div>
                  <ChevronRight size={18} className={cn("transition-transform", selectedWord?.id === word.id ? "translate-x-1" : "opacity-0 group-hover:opacity-100")} />
                </motion.div>
              ))}
           </div>
        </div>

        {/* Detail View */}
        <div className="lg:col-span-8 flex flex-col">
           <AnimatePresence mode="wait">
              {selectedWord ? (
                <motion.div
                  key={selectedWord.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="glass-card p-10 space-y-10 flex-1 relative overflow-hidden"
                >
                   {/* Background word */}
                   <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 text-[12rem] font-black text-slate-100 opacity-50 select-none pointer-events-none">
                      {selectedWord.word.charAt(0)}
                   </div>

                   <div className="flex justify-between items-start relative z-10">
                      <div className="space-y-2">
                         <div className="flex items-center gap-4">
                            <h2 className="text-5xl font-black tracking-tight">{selectedWord.word}</h2>
                            <button 
                              onClick={() => speakWord(selectedWord.word)}
                              className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-accent hover:text-white transition-all shadow-sm"
                            >
                              <Volume2 size={24} />
                            </button>
                         </div>
                         <div className="flex items-center gap-3 text-slate-400 font-mono text-sm">
                            <span>{selectedWord.ipa}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                            <span className="text-accent font-bold uppercase tracking-widest text-[10px]">{selectedWord.stress}</span>
                         </div>
                      </div>
                      <div className="flex gap-2">
                         <button 
                          onClick={() => handleToggleFavorite(selectedWord)}
                          className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center transition-all border",
                            selectedWord.isFavorite ? "bg-amber-50 border-amber-100 text-amber-500" : "bg-white border-slate-100 text-slate-300 hover:text-amber-500"
                          )}
                         >
                            <Star size={24} fill={selectedWord.isFavorite ? "currentColor" : "none"} />
                         </button>
                      </div>
                   </div>

                   <div className="space-y-8 relative z-10">
                      <div className="space-y-3">
                         <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vietnamese Meaning</h4>
                         <p className="text-2xl font-bold text-primary">{selectedWord.meaning}</p>
                      </div>

                      <div className="space-y-3">
                         <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Definition</h4>
                         <p className="text-slate-600 leading-relaxed text-lg">{selectedWord.definition}</p>
                      </div>

                      <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-3 italic">
                         <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 not-italic">Example Sentence</h4>
                         <p className="text-slate-700 font-medium">"{selectedWord.example}"</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                               <Plus size={12} /> Common Collocations
                            </h4>
                            <div className="flex flex-wrap gap-2">
                               {selectedWord.collocations.map((c: string, i: number) => (
                                 <span key={i} className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600">
                                    {c}
                                 </span>
                               ))}
                            </div>
                         </div>
                         <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                               <Filter size={12} /> Synonyms
                            </h4>
                            <div className="flex flex-wrap gap-2">
                               {selectedWord.synonyms.map((s: string, i: number) => (
                                 <span key={i} className="px-3 py-1.5 bg-accent-light text-accent rounded-xl text-xs font-bold border border-accent/10">
                                    {s}
                                 </span>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>

                   {!auth.currentUser && (
                     <div className="mt-auto p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center">
                              <Bookmark size={16} />
                           </div>
                           <p className="text-xs font-medium text-orange-800">Log in to save this word to your persistent LexiVault.</p>
                        </div>
                        <ChevronRight size={16} className="text-orange-400 group-hover:translate-x-1 transition-transform" />
                     </div>
                   )}
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 glass-card border-dashed">
                   <BookOpen size={64} className="text-slate-200" />
                   <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-slate-400 tracking-tight">Select a word</h3>
                      <p className="text-slate-400 text-sm">Deep dive into pronunciation, definitions, and usage.</p>
                   </div>
                </div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
