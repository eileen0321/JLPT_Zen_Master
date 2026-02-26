
import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Lock, Play, ArrowLeft } from 'lucide-react';
import { useAppStore } from '../store';
import { loadAllWords, WordData } from '../data/words';

const LEVELS = [
  { id: 'N5', description: '기초 입문' },
  { id: 'N4', description: '초급 도약' },
  { id: 'N3', description: '중급 실전' },
  { id: 'N2', description: '고급 완성' },
  { id: 'N1', description: '마스터' },
];

interface RoadmapProps {
  onSelectSet: (setId: number) => void;
}

export const Roadmap: React.FC<RoadmapProps> = ({ onSelectSet }) => {
  const { currentLevel, setCurrentLevel } = useAppStore();
  const [view, setView] = useState<'GRID' | 'PATH'>('GRID');
  const [words, setWords] = useState<WordData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const allWords = await loadAllWords();
        setWords(allWords);
      } catch (error) {
        console.error("Failed to load words for roadmap:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWords();
  }, []);

  const handleLevelClick = (lvl: string) => {
    setCurrentLevel(lvl);
    setView('PATH');
  };

  const levelProgress = useMemo(() => {
    if (words.length === 0) return { 'N5': 0, 'N4': 0, 'N3': 0, 'N2': 0, 'N1': 0 };
    // In a real app, this would use UserStats to calculate actual progress based on mastered words
    // For now, we return mock progress, but it could easily be calculated from the fetched words
    return {
      'N5': 65,
      'N4': 20,
      'N3': 0,
      'N2': 0,
      'N1': 0,
    };
  }, [words]);

  const stages = useMemo(() => {
    const levelWords = words.filter(w => w.level === currentLevel);
    if (levelWords.length === 0) return [];

    const chunks = [];
    for (let i = 0; i < levelWords.length; i += 30) {
      const chunk = levelWords.slice(i, i + 30);
      chunks.push({
        id: i / 30 + 1,
        title: `단어 ${String(i + 1).padStart(3, '0')} - ${String(i + chunk.length).padStart(3, '0')}`,
        isCompleted: i === 0, // Mock data
        isUnlocked: i <= 30,  // Mock data
        progress: i === 0 ? 100 : (i === 30 ? 45 : 0) // Mock data
      });
    }
    return chunks;
  }, [currentLevel, words]);

  if (isLoading) {
    return (
      <div className="px-6 pb-24 h-full w-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (view === 'GRID') {
    return (
      <div className="px-6 pb-24 h-full w-full overflow-y-auto">
        <div className="mb-8 text-left px-2">
          <h2 className="text-3xl font-serif text-slate-800 dark:text-slate-100 leading-tight" style={{ fontFamily: "'Zen Old Mincho', serif" }}>학습 코스</h2>
          <p className="text-xs font-bold text-slate-400 mt-2">원하는 레벨을 선택하세요.</p>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {LEVELS.map((lvl) => {
            const progress = levelProgress[lvl.id as keyof typeof levelProgress] || 0;
            return (
              <button 
                key={lvl.id}
                onClick={() => handleLevelClick(lvl.id)}
                className="relative bg-white dark:bg-[#1A1A1A] rounded-[32px] p-8 flex flex-col justify-between border border-slate-200/60 dark:border-white/5 shadow-sm transition-all duration-300 active:scale-[0.98] group overflow-hidden"
              >
                <div className="text-left relative z-10">
                  <span className="font-serif text-8xl text-slate-100 dark:text-white/5 absolute -top-8 -left-4 select-none group-hover:text-emerald-500/10 transition-colors" style={{ fontFamily: "'Zen Old Mincho', serif" }}>{lvl.id}</span>
                  <div className="pt-2">
                    <h4 className="font-serif font-bold text-slate-800 dark:text-slate-100 text-3xl leading-none mb-2" style={{ fontFamily: "'Zen Old Mincho', serif" }}>{lvl.id} Course</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lvl.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between relative z-10 w-full mt-12">
                   <div className="h-1.5 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                   </div>
                   <span className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400 ml-4">{progress}%</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full flex flex-col px-6 pb-24 overflow-y-auto">
      <div className="flex items-center gap-4 mb-8 sticky top-0 bg-slate-200/90 dark:bg-[#121212]/90 backdrop-blur-md z-30 pb-4 pt-2">
        <button onClick={() => setView('GRID')} className="w-10 h-10 rounded-full bg-white dark:bg-[#1A1A1A] border border-slate-200/60 dark:border-white/5 shadow-sm flex items-center justify-center text-slate-800 dark:text-slate-200 active:scale-95 transition-transform">
          <ArrowLeft size={18} />
        </button>
        <div className="text-left">
          <h2 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-none" style={{ fontFamily: "'Zen Old Mincho', serif" }}>{currentLevel} Master</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">학습 로드맵</p>
        </div>
      </div>
      
      <div className="relative pl-6 pr-2">
        <div className="absolute left-[43px] top-5 bottom-5 w-[2px] bg-gradient-to-b from-emerald-500 via-slate-200 dark:via-slate-800 to-transparent z-0"></div>
        <div className="flex flex-col gap-6">
          {stages.map((stage, index) => (
            <motion.div 
              key={stage.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
              className="relative flex items-center z-10 group cursor-pointer"
              onClick={() => stage.isUnlocked && onSelectSet(stage.id)}
            >
              {/* Node */}
              <div className="relative flex-shrink-0 w-10 h-10 flex items-center justify-center mr-6">
                <div className={`absolute inset-0 rounded-full border transition-all duration-500 ${
                  stage.isCompleted ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 
                  stage.isUnlocked ? 'border-slate-800 dark:border-slate-200 bg-[#1A1A1A] dark:bg-white shadow-md scale-110' : 
                  'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1A1A1A]'
                }`}></div>
                
                <div className={`relative z-10 ${
                  stage.isCompleted ? 'text-emerald-500' : 
                  stage.isUnlocked ? 'text-white dark:text-[#1A1A1A]' : 
                  'text-slate-300 dark:text-slate-700'
                }`}>
                  {stage.isCompleted ? <Check size={16} strokeWidth={2.5} /> : 
                   stage.isUnlocked ? <Play size={16} strokeWidth={2.5} className="ml-0.5" /> : 
                   <Lock size={14} strokeWidth={2} />}
                </div>
              </div>

              {/* Card */}
              <div className={`flex-1 p-6 rounded-[32px] border transition-all duration-300 ${
                stage.isUnlocked 
                  ? 'bg-white dark:bg-[#1A1A1A] border-slate-200/60 dark:border-white/5 shadow-sm group-hover:shadow-md group-hover:-translate-y-1' 
                  : 'bg-transparent border-transparent opacity-50'
              }`}>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Stage {String(stage.id).padStart(2, '0')}</p>
                    <h3 className="font-serif text-lg text-slate-800 dark:text-slate-100" style={{ fontFamily: "'Zen Old Mincho', serif" }}>
                      {stage.title}
                    </h3>
                  </div>
                  {stage.isUnlocked && (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${stage.isCompleted ? 'border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-500' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}>
                      <span className="text-[10px] font-mono font-bold">{stage.progress}%</span>
                    </div>
                  )}
                </div>
                
                {/* Progress Line */}
                {stage.isUnlocked && (
                  <div className="w-full h-[2px] bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out ${stage.isCompleted ? 'bg-emerald-500' : 'bg-slate-800 dark:bg-slate-200'}`}
                      style={{ width: `${stage.progress}%` }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
