import { motion } from 'motion/react';

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 group cursor-pointer ${className}`}>
      <div className="relative w-8 h-8 flex items-center justify-center">
        {/* H wings stylized icon */}
        <motion.svg 
          viewBox="0 0 24 24" 
          fill="none" 
          className="w-full h-full text-accent"
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          initial={{ rotate: -10 }}
          whileHover={{ rotate: 0, scale: 1.1 }}
        >
          {/* Stylized H with wings/upward motion */}
          <path d="M4 4v16" />
          <path d="M20 4v16" />
          <path d="M4 12h16" />
          <path d="M12 12l4-4" />
          <path d="M16 8l4-4" />
        </motion.svg>
      </div>
      <span className="text-xl font-bold tracking-tight text-primary">
        <span className="text-accent font-extrabold">Hy</span>Pilot
      </span>
    </div>
  );
}
