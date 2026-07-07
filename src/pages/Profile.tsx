import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { motion } from 'motion/react';
import { 
  User as UserIcon, 
  TrendingUp, 
  Calendar, 
  MapPin, 
  Award,
  History,
  TrendingDown,
  Activity,
  ArrowUpRight,
  BookOpen
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;
      
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) setProfile(userSnap.data());

      const sessionsRef = collection(db, `users/${auth.currentUser.uid}/speakingSessions`);
      const q = query(sessionsRef, orderBy('createdAt', 'desc'), limit(5));
      const sessionsSnap = await getDocs(q);
      setSessions(sessionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      setIsLoading(false);
    };

    fetchProfile();
  }, []);

  if (!auth.currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <UserIcon size={64} className="text-slate-200" />
        <h2 className="text-2xl font-bold text-slate-400">Please log in to view your profile</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Profile Header */}
      <div className="glass-card p-10 overflow-hidden relative border-none bg-slate-900 text-white">
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 rounded-[2.5rem] bg-accent/20 flex items-center justify-center border-4 border-accent/20 relative">
               {auth.currentUser.photoURL ? (
                 <img src={auth.currentUser.photoURL} alt="Avatar" className="w-full h-full rounded-[2.5rem] object-cover" />
               ) : (
                 <UserIcon size={48} className="text-accent" />
               )}
               <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-accent text-white rounded-2xl flex items-center justify-center shadow-lg">
                  <Award size={20} />
               </div>
            </div>
            <div className="text-center md:text-left space-y-4">
               <div>
                  <h1 className="text-4xl font-black tracking-tight">{profile?.displayName || 'HyPilot Learner'}</h1>
                  <p className="text-slate-400 font-medium">{profile?.email}</p>
               </div>
               <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-2 text-xs font-bold bg-white/10 px-4 py-2 rounded-xl">
                     <TrendingUp size={14} className="text-emerald-400" /> Band {profile?.targetBand || '7.5'} Target
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold bg-white/10 px-4 py-2 rounded-xl">
                     <Calendar size={14} className="text-accent" /> Joined April 2026
                  </div>
               </div>
            </div>
         </div>
         {/* Background pattern */}
         <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
               <circle cx="90" cy="10" r="40" />
               <circle cx="100" cy="50" r="30" />
            </svg>
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: 'Study Streak', value: `${profile?.studyStreak || 0} Days`, icon: Activity, color: 'text-orange-500', bg: 'bg-orange-50' },
           { label: 'Words Learned', value: profile?.totalWords || 0, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
           { label: 'Practice Sessions', value: profile?.sessionsCompleted || 0, icon: History, color: 'text-purple-500', bg: 'bg-purple-50' },
         ].map((stat, i) => (
           <motion.div 
             key={i}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             className="glass-card p-6 flex items-center gap-4"
           >
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
                 <stat.icon size={24} />
              </div>
              <div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                 <p className="text-2xl font-black text-primary">{stat.value}</p>
              </div>
           </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
         {/* Recent Activity */}
         <div className="lg:col-span-3 space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
               <History className="text-slate-400" /> Recent Sessions
            </h2>
            <div className="space-y-4">
               {sessions.length > 0 ? (
                 sessions.map((s, i) => (
                   <motion.div 
                     key={s.id}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.1 }}
                     className="glass-card p-6 flex items-center justify-between group cursor-pointer hover:border-accent"
                   >
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
                            <Activity size={20} />
                         </div>
                         <div>
                            <p className="font-bold text-slate-800">{s.topic}</p>
                            <p className="text-xs text-slate-400">{new Date(s.createdAt?.toDate()).toLocaleDateString()}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="text-right hidden sm:block">
                            <p className="text-sm font-black text-primary">Score: {s.feedback?.fluency?.score || '-'}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Fluency</p>
                         </div>
                         <ArrowUpRight size={20} className="text-slate-300 group-hover:text-accent group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                      </div>
                   </motion.div>
                 ))
               ) : (
                 <div className="p-12 glass-card border-dashed flex flex-col items-center justify-center text-center space-y-4">
                    <History size={48} className="text-slate-100" />
                    <p className="text-slate-400 font-medium">No sessions recorded yet.</p>
                 </div>
               )}
            </div>
         </div>

         {/* Target Score Progress */}
         <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
               <TrendingUp className="text-slate-400" /> Accuracy Tracker
            </h2>
            <div className="glass-card p-8 space-y-8">
               <div className="space-y-6">
                  {[
                    { label: 'Speaking', value: 75 },
                    { label: 'Listening', value: 88 },
                    { label: 'Writing', value: 62 },
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-500">
                          <span>{item.label}</span>
                          <span className="text-primary">{item.value}%</span>
                       </div>
                       <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${item.value}%` }}
                            transition={{ duration: 1, delay: i * 0.2 }}
                            className="h-full bg-accent rounded-full"
                          />
                       </div>
                    </div>
                  ))}
               </div>
               <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Estimated Overall</p>
                  <p className="text-5xl font-black text-primary">7.0</p>
                  <p className="text-[10px] font-bold text-accent uppercase tracking-widest mt-2 underline decoration-accent/30 underline-offset-4">0.5 band to go</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
