import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Mic2, 
  Headphones, 
  PenTool, 
  Library, 
  Calendar, 
  User, 
  Menu, 
  X,
  ChevronRight,
  LogOut,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';
import Logo from './Logo';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const navItems = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Speaking Lab', path: '/speaking', icon: Mic2 },
  { name: 'Listening Lab', path: '/listening', icon: Headphones },
  { name: 'Writing Tools', path: '/writing', icon: PenTool },
  { name: 'LexiVault', path: '/lexivault', icon: Library },
  { name: 'Study Planner', path: '/planner', icon: Calendar },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const location = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center px-4 md:px-8 justify-between">
        <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
          <Logo />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link 
              key={item.name}
              to={item.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-accent",
                location.pathname === item.path ? "text-accent" : "text-slate-600"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors">
                <div className="w-7 h-7 rounded-full bg-accent-light flex items-center justify-center text-accent text-xs font-bold uppercase">
                  {user.displayName?.charAt(0) || user.email?.charAt(0)}
                </div>
                <span className="text-sm font-medium text-slate-700">{user.displayName || 'Learner'}</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Log Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm font-medium px-4 py-2 text-slate-600 hover:text-primary transition-colors">
                Log In
              </Link>
              <Link to="/signup" className="text-sm font-medium px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-sm">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed inset-x-0 top-16 z-40 bg-white border-b border-slate-200 p-4 flex flex-col gap-2 shadow-xl"
          >
            {navItems.map((item) => (
              <Link 
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl text-base font-medium transition-colors",
                  location.pathname === item.path ? "bg-accent-light text-accent" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      <footer className="py-8 px-4 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-sm">
          <Logo className="opacity-50 grayscale hover:grayscale-0 transition-all" />
          <div className="flex gap-8">
            <span>© 2026 HyPilot. All rights reserved.</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-accent">Privacy</a>
              <a href="#" className="hover:text-accent">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
