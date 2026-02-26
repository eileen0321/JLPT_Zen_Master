import React, { useEffect } from 'react';
import { Sun, Moon, Headphones, Flame } from 'lucide-react';
import { useAppStore } from '../store';
import { motion } from 'framer-motion';

interface TopNavProps {
  progress: number; // 0 to 100
}

export const TopNav: React.FC<TopNavProps> = ({ progress }) => {
  const { darkMode, toggleDarkMode, streak, handsFreeMode, toggleHandsFreeMode, studyTime, incrementStudyTime } = useAppStore();

  useEffect(() => {
    const timer = setInterval(() => {
      incrementStudyTime();
    }, 1000);
    return () => clearInterval(timer);
  }, [incrementStudyTime]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute top-0 left-0 w-full z-50">
      {/* Ultra-slim progress bar */}
      <div className="h-[1px] w-full bg-slate-200 dark:bg-slate-800">
        <motion.div 
          className="h-full bg-emerald-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <nav className="w-full flex justify-between items-center p-4 backdrop-blur-md bg-white/70 dark:bg-[#121212]/70">
        <div className="flex items-center gap-4">
          <span className="font-sans font-medium tracking-tight text-sm opacity-50">JLPT MASTER</span>
          <div className="flex items-center gap-1 text-xs font-mono opacity-40">
            {formatTime(studyTime)}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-orange-500 bg-orange-50 dark:bg-orange-950/30 px-2 py-1 rounded-full">
            <Flame size={14} />
            <span className="text-xs font-bold">{streak}</span>
          </div>
          
          <button 
            onClick={toggleHandsFreeMode}
            className={`relative p-2.5 rounded-full shadow-md transition-all duration-300 ${
              handsFreeMode 
                ? 'bg-emerald-500 text-white shadow-emerald-500/40 scale-105' 
                : 'bg-white dark:bg-[#2A2A2A] border border-slate-200/60 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-emerald-500'
            }`}
          >
            {handsFreeMode && (
              <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-40"></span>
            )}
            <Headphones size={18} />
          </button>

          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-500"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </nav>
    </div>
  );
};
