import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, Pause, Play, X, ChevronRight } from 'lucide-react';
import { loadWordsByLevel, WordData } from '../data/words';
import { useAppStore } from '../store';

export const HandsFreeMode: React.FC = () => {
  const { toggleHandsFreeMode } = useAppStore();
  const [step, setStep] = useState<'select' | 'playing'>('select');
  const [selectedLevel, setSelectedLevel] = useState<string>('N5');
  const [words, setWords] = useState<WordData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentPhase, setCurrentPhase] = useState<'word' | 'meaning' | 'example' | 'idle'>('idle');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [levelCounts, setLevelCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    // Load counts for all levels when component mounts
    const loadCounts = async () => {
      const counts: Record<string, number> = {};
      for (const level of ['N5', 'N4', 'N3', 'N2', 'N1']) {
        try {
          const data = await loadWordsByLevel(level);
          counts[level] = data.length;
        } catch {
          counts[level] = 0;
        }
      }
      setLevelCounts(counts);
    };
    loadCounts();
  }, []);

  const startPlaying = async (level: string) => {
    setIsLoading(true);
    try {
      const levelWords = await loadWordsByLevel(level);
      setWords(levelWords);
      setSelectedLevel(level);
      setCurrentIndex(0);
      setStep('playing');
      setIsPlaying(true);
    } catch (error) {
      console.error("Failed to load words for hands-free mode:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (step !== 'playing' || !isPlaying || words.length === 0) {
      window.speechSynthesis.cancel();
      return;
    }

    let isCancelled = false;

    const playSequence = async () => {
      const word = words[currentIndex];
      
      const speak = (text: string, lang: string, rate = 0.85): Promise<void> => {
        return new Promise((resolve) => {
          if (isCancelled) {
            resolve();
            return;
          }
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = lang;
          utterance.rate = rate;
          
          // Try to find a premium voice (e.g., Google, Siri, or specific Japanese voices)
          const voices = window.speechSynthesis.getVoices();
          const premiumVoice = voices.find(v => v.lang === lang && (v.name.includes('Premium') || v.name.includes('Google') || v.name.includes('Siri')));
          if (premiumVoice) utterance.voice = premiumVoice;

          utterance.onend = () => resolve();
          utterance.onerror = () => resolve();
          utteranceRef.current = utterance;
          window.speechSynthesis.speak(utterance);
        });
      };

      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      if (isCancelled) return;
      setCurrentPhase('word');
      await speak(word.word, 'ja-JP');
      await delay(1000); // 1초 간격 (복기 시간)

      if (isCancelled) return;
      setCurrentPhase('meaning');
      await speak(word.meaning, 'ko-KR', 0.95);
      await delay(1000);

      if (isCancelled) return;
      setCurrentPhase('example');
      await speak(word.example_jp, 'ja-JP');
      await delay(2000); // 다음 단어 전 2초 간격

      if (!isCancelled && isPlaying) {
        setCurrentIndex((prev) => (prev + 1) % words.length);
      }
    };

    playSequence();

    return () => {
      isCancelled = true;
      window.speechSynthesis.cancel();
    };
  }, [currentIndex, isPlaying, words, step]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-[100] bg-[#121212] flex flex-col text-white"
    >
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
            <Headphones size={20} />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-none mb-1">Hands-free Mode</h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">자동 학습 모드</p>
          </div>
        </div>
        <button 
          onClick={() => {
            window.speechSynthesis.cancel();
            toggleHandsFreeMode();
          }}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {step === 'select' ? (
        <div className="flex-1 p-6 overflow-y-auto">
          <h3 className="text-xl font-serif mb-6" style={{ fontFamily: "'Zen Old Mincho', serif" }}>학습할 레벨을 선택하세요</h3>
          <div className="space-y-3 relative">
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#121212]/50 backdrop-blur-sm rounded-[24px]">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {['N5', 'N4', 'N3', 'N2', 'N1'].map((level) => {
              const count = levelCounts[level] || 0;
              return (
                <button 
                  key={level}
                  onClick={() => count > 0 && startPlaying(level)}
                  disabled={isLoading}
                  className={`w-full p-5 rounded-[24px] border flex items-center justify-between transition-all ${count > 0 ? 'bg-[#1A1A1A] border-white/10 hover:border-emerald-500/50 active:scale-95' : 'bg-[#1A1A1A]/50 border-transparent opacity-50 cursor-not-allowed'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center font-serif text-xl" style={{ fontFamily: "'Zen Old Mincho', serif" }}>
                      {level}
                    </div>
                    <div className="text-left">
                      <p className="font-bold mb-1">미암기 단어 복습</p>
                      <p className="text-xs text-slate-400">{count}단어 대기 중</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-500" />
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
          {/* Visualizer */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
            <motion.div 
              animate={{ 
                scale: currentPhase !== 'idle' ? [1, 1.2, 1] : 1,
                opacity: currentPhase !== 'idle' ? [0.1, 0.3, 0.1] : 0.1
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-64 h-64 bg-emerald-500 rounded-full blur-[100px]"
            />
          </div>

          <div className="w-full max-w-md text-center space-y-12 relative z-10">
            <div className="flex justify-center mb-8">
              <span className="px-4 py-1.5 rounded-full border border-white/10 text-xs font-bold tracking-widest text-emerald-400">
                {selectedLevel} • {currentIndex + 1} / {words.length}
              </span>
            </div>

            <motion.div 
              animate={{ opacity: currentPhase === 'word' ? 1 : 0.3, scale: currentPhase === 'word' ? 1.05 : 1 }}
              className="text-6xl font-serif tracking-widest transition-all duration-500"
              style={{ fontFamily: "'Zen Old Mincho', serif" }}
            >
              {words[currentIndex]?.word}
            </motion.div>

            <motion.div 
              animate={{ opacity: currentPhase === 'meaning' ? 1 : 0.3, scale: currentPhase === 'meaning' ? 1.05 : 1 }}
              className="text-3xl font-bold font-sans transition-all duration-500 text-emerald-400"
            >
              {words[currentIndex]?.meaning}
            </motion.div>

            <motion.div 
              animate={{ opacity: currentPhase === 'example' ? 1 : 0.3 }}
              className="text-lg font-serif leading-relaxed px-4 transition-all duration-500"
              style={{ fontFamily: "'Zen Old Mincho', serif" }}
            >
              {words[currentIndex]?.example_jp}
            </motion.div>
          </div>

          <div className="absolute bottom-12 flex items-center gap-8 z-10">
            <button 
              onClick={() => {
                setIsPlaying(!isPlaying);
                if (isPlaying) window.speechSynthesis.cancel();
              }}
              className="w-20 h-20 rounded-full bg-white text-[#121212] flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.2)]"
            >
              {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-2" />}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
