import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import Logo from '../components/Logo';

export default function Login() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore, if not create profile
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          studyStreak: 1,
          totalWords: 0,
          sessionsCompleted: 0,
          lastActive: serverTimestamp(),
          createdAt: serverTimestamp(),
        });
      }

      navigate('/');
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-md p-10 space-y-8"
      >
        <div className="text-center space-y-2">
           <Logo className="justify-center scale-125 mb-8" />
           <h2 className="text-3xl font-black text-primary">Welcome Back</h2>
           <p className="text-slate-500 font-medium tracking-tight">Your IELTS journey continues here.</p>
        </div>

        <div className="space-y-4 pt-4">
           {error && (
             <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
                {error}
             </div>
           )}

           <button 
             onClick={handleGoogleSignIn}
             disabled={isLoading}
             className="w-full py-4 px-6 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
           >
             <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
             </svg>
             {isLoading ? "Signing in..." : "Continue with Google"}
           </button>

           <div className="relative py-4">
              <hr className="border-slate-100" />
              <span className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-white px-4 text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">OR</span>
           </div>

           <button 
             onClick={() => navigate('/')}
             className="w-full py-4 px-6 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-all"
           >
             Continue as Guest
           </button>
        </div>

        <p className="text-center text-xs text-slate-400 font-medium">
           By continuing, you agree to HyPilot's <Link to="#" className="text-primary hover:underline">Terms of Service</Link> and <Link to="#" className="text-primary hover:underline">Privacy Policy</Link>.
        </p>
      </motion.div>
    </div>
  );
}
