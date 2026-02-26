/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useAppStore } from './store';
import { TopNav } from './components/TopNav';
import { JLPTCard } from './components/JLPTCard';
import { JLPTDetailCard } from './components/JLPTDetailCard';
import { Roadmap } from './components/Roadmap';
import { HandsFreeMode } from './components/HandsFreeMode';
import { loadWordsByLevel, WordData } from './data/words';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Archive, Flame, Lightbulb, Plus, Home, Map, Settings, Sun, Moon, Headphones } from 'lucide-react';

type ViewState = 'home' | 'roadmap' | 'flashcard' | 'detail' | 'review';

export default function App() {
  const { darkMode, toggleDarkMode, handsFreeMode, toggleHandsFreeMode, currentLevel, setCurrentLevel, updateStreak, streak } = useAppStore();
  const [view, setViewState] = useState<ViewState>('home');
  const [words, setWords] = useState<WordData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [unknownWords, setUnknownWords] = useState<WordData[]>([]);
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showTipDetail, setShowTipDetail] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    updateStreak();
  }, [updateStreak]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const timeContext = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return { greeting: '좋은 아침입니다', sub: '상쾌한 공기와 함께' };
    if (hour >= 12 && hour < 18) return { greeting: '나른한 오후네요', sub: '커피 한 잔과 함께' };
    return { greeting: '포근한 밤입니다', sub: '오늘의 마지막 복습' };
  }, [currentTime]);

  const dailyTip = {
    title: '망각 곡선 활용법',
    description: '복습 타이밍의 비밀',
    details: '에빙하우스의 망각 곡선에 따르면, 학습 후 10분이 지나면 망각이 시작됩니다. 1일 후에는 70% 이상을 잊어버리게 되죠. JLPT Master는 이 주기에 맞춰 최적의 복습 타이밍을 알려드립니다.'
  };

  const loadSet = async (setId: number) => {
    setIsLoading(true);
    try {
      const levelWords = await loadWordsByLevel(currentLevel);
      setWords(levelWords);
      setCurrentIndex(0);
      setUnknownWords([]);
      setViewState('flashcard');
    } catch (error) {
      console.error("Failed to load words:", error);
      // Fallback or error handling could go here
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextCard = (knew: boolean) => {
    const updatedUnknowns = !knew ? [...unknownWords, words[currentIndex]] : unknownWords;
    
    if (!knew) {
      setUnknownWords(updatedUnknowns);
    }
    
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      if (updatedUnknowns.length > 0) {
        setViewState('review');
      } else {
        setViewState('home');
      }
    }
  };

  const startReview = () => {
    setWords(unknownWords);
    setCurrentIndex(0);
    setUnknownWords([]);
    setViewState('flashcard');
  };

  const progress = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;

  return (
    <div className={`min-h-[100dvh] flex justify-center bg-slate-200 dark:bg-black transition-colors duration-500 font-sans`}>
      <div className={`w-full max-w-md h-[100dvh] relative shadow-2xl flex flex-col overflow-hidden ${darkMode ? 'bg-[#121212] text-slate-200' : 'bg-[#F8F9FA] text-slate-800'}`}>
        {view !== 'home' && view !== 'roadmap' && <TopNav progress={progress} />}

        <main className={`flex-1 flex flex-col overflow-y-auto w-full ${view !== 'home' && view !== 'roadmap' ? 'pt-20' : ''} pb-20`}>
          <AnimatePresence mode="wait">
            {view === 'home' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col h-full relative"
              >
                {/* Premium Home UI */}
                <div className="px-8 pt-16 pb-6">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{timeContext.greeting}</p>
                    <div className="flex items-center gap-3">
                      <button onClick={toggleHandsFreeMode} className="p-2 rounded-full bg-white dark:bg-[#1A1A1A] border border-slate-200/60 dark:border-white/5 shadow-sm text-slate-400 hover:text-emerald-500 transition-colors">
                        <Headphones size={14} />
                      </button>
                      <button onClick={toggleDarkMode} className="p-2 rounded-full bg-white dark:bg-[#1A1A1A] border border-slate-200/60 dark:border-white/5 shadow-sm text-slate-400 hover:text-emerald-500 transition-colors">
                        {darkMode ? <Sun size={14} /> : <Moon size={14} />}
                      </button>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-colors bg-emerald-50 border-emerald-100/50 dark:bg-emerald-900/30 dark:border-emerald-800`}>
                        <div className={`w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse`}></div>
                        <span className={`text-[9px] font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-400`}>
                          Offline Saved
                        </span>
                      </div>
                    </div>
                  </div>
                  <h1 className="text-3xl font-serif text-slate-800 dark:text-slate-100 leading-tight" style={{ fontFamily: "'Zen Old Mincho', serif" }}>
                    {timeContext.sub}<br />학습을 시작할까요?
                  </h1>
                </div>

                <div className="px-6 py-2">
                  <div className="bg-white dark:bg-[#1A1A1A] rounded-[32px] p-8 border border-slate-200/60 dark:border-white/5 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Current Level</p>
                        <h3 className="text-4xl font-serif text-slate-800 dark:text-slate-100" style={{ fontFamily: "'Zen Old Mincho', serif" }}>{currentLevel}</h3>
                      </div>
                      <div className="relative w-20 h-20">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="40" cy="40" r="38" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                          <circle cx="40" cy="40" r="38" stroke="currentColor" strokeWidth="2" fill="transparent" strokeDasharray="238.7" strokeDashoffset={238.7 * (1 - 0.65)} className="text-emerald-500 transition-all duration-1000 ease-out" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xl font-serif text-slate-800 dark:text-slate-100" style={{ fontFamily: "'Zen Old Mincho', serif" }}>65<span className="text-[10px] font-sans text-slate-400 ml-0.5">%</span></span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">완강까지 <span className="font-bold text-slate-800 dark:text-slate-200">280단어</span> 남았습니다.</p>
                    <button onClick={() => loadSet(1)} disabled={isLoading} className="w-full bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] py-4 rounded-full font-bold text-sm transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-md disabled:opacity-70">
                      {isLoading ? '로딩 중...' : '이어서 학습하기'} <ArrowRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="px-6 py-4 grid grid-cols-2 gap-4">
                  <button className="bg-white dark:bg-[#1A1A1A] rounded-[24px] p-6 border border-slate-200/60 dark:border-white/5 shadow-sm flex flex-col justify-between aspect-square text-left active:scale-95 transition-transform group">
                    <Archive size={24} className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors" strokeWidth={1.5} />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">오답 창고</p>
                      <p className="text-3xl font-serif text-slate-800 dark:text-slate-100" style={{ fontFamily: "'Zen Old Mincho', serif" }}>12<span className="text-xs font-sans text-slate-400 ml-1.5 font-medium">단어</span></p>
                    </div>
                  </button>
                  <div className="bg-white dark:bg-[#1A1A1A] rounded-[24px] p-6 border border-slate-200/60 dark:border-white/5 shadow-sm flex flex-col justify-between aspect-square relative overflow-hidden">
                    <Flame size={24} className={`${streak > 0 ? 'text-emerald-500 animate-pulse' : 'text-slate-300 dark:text-slate-600'}`} strokeWidth={1.5} />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">연속 학습</p>
                      <p className="text-3xl font-serif text-slate-800 dark:text-slate-100" style={{ fontFamily: "'Zen Old Mincho', serif" }}>{streak}<span className="text-xs font-sans text-slate-400 ml-1.5 font-medium">일차</span></p>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 pb-8">
                  <button onClick={() => setShowTipDetail(true)} className="w-full bg-transparent border border-slate-200/60 dark:border-white/5 rounded-[24px] p-6 text-left flex flex-col gap-4 hover:bg-white dark:hover:bg-[#1A1A1A] transition-colors shadow-sm">
                    <div className="flex items-center gap-2">
                      <Lightbulb size={14} className="text-emerald-500" />
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Today's Pick</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-serif text-slate-800 dark:text-slate-100 mb-2" style={{ fontFamily: "'Zen Old Mincho', serif" }}>{dailyTip.title}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{dailyTip.details}</p>
                    </div>
                  </button>
                </div>

                {showTipDetail && (
                  <div className="absolute inset-0 z-[100] flex items-end justify-center px-4 pb-6">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowTipDetail(false)}></div>
                    <motion.div 
                      initial={{ y: 100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="w-full bg-white dark:bg-[#1E1E1E] rounded-[32px] p-8 shadow-2xl relative z-10 border border-slate-100 dark:border-white/5"
                    >
                      <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-8"></div>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-500">
                          <Lightbulb size={20} />
                        </div>
                        <h3 className="font-serif text-2xl text-slate-800 dark:text-slate-100 tracking-tight" style={{ fontFamily: "'Zen Old Mincho', serif" }}>{dailyTip.title}</h3>
                      </div>
                      <div className="mb-10">
                        <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">{dailyTip.details}</p>
                      </div>
                      <button onClick={() => setShowTipDetail(false)} className="w-full py-4 bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] rounded-full font-bold text-sm active:scale-95 transition-transform">확인했습니다</button>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}

            {view === 'roadmap' && (
              <motion.div 
                key="roadmap"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-full h-full"
              >
                <Roadmap onSelectSet={loadSet} />
              </motion.div>
            )}

            {view === 'flashcard' && (
              <motion.div
                key={`card-${currentIndex}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="w-full flex-1 flex flex-col justify-center relative"
              >
                {words.length > 0 ? (
                  <>
                    <JLPTCard wordData={words[currentIndex]} onNext={handleNextCard} />
                    
                    <div className="mt-8 flex justify-center pb-8">
                      <button 
                        onClick={() => setViewState('detail')}
                        className="text-xs font-bold text-slate-400 hover:text-emerald-500 uppercase tracking-widest transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-8">
                    <p className="text-slate-500 dark:text-slate-400 mb-6">해당 레벨의 단어가 아직 준비되지 않았습니다.</p>
                    <button onClick={() => setViewState('home')} className="px-6 py-3 bg-emerald-500 text-white rounded-full font-bold text-sm shadow-lg shadow-emerald-500/30">홈으로 돌아가기</button>
                  </div>
                )}
              </motion.div>
            )}

            {view === 'detail' && words.length > 0 && (
              <motion.div
                key={`detail-${currentIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full pb-8"
              >
                <JLPTDetailCard 
                  data={words[currentIndex]} 
                  onNext={() => setViewState('flashcard')} 
                />
              </motion.div>
            )}

            {view === 'review' && (
              <motion.div
                key="review"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm mx-auto p-8 bg-white dark:bg-[#1E1E1E] rounded-[32px] shadow-sm border border-slate-200 dark:border-slate-800 text-center mt-12"
              >
                <h2 className="text-2xl font-bold mb-4">Set Completed!</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8">
                  You have {unknownWords.length} words to review.
                </p>
                <div className="flex flex-col gap-4">
                  <button 
                    onClick={startReview}
                    className="w-full py-4 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors"
                  >
                    Review Unknown Words
                  </button>
                  <button 
                    onClick={() => setViewState('home')}
                    className="w-full py-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Back to Home
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Floating Bottom Navigation */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%] max-w-sm bg-white/90 dark:bg-[#1A1A1A]/90 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-full flex justify-around items-center p-2 shadow-lg z-40">
          <button onClick={() => setViewState('home')} className={`p-3 rounded-full flex items-center gap-2 transition-all duration-300 ${view === 'home' ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white px-5' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
            <Home size={20} strokeWidth={view === 'home' ? 2 : 1.5} />
            {view === 'home' && <span className="text-xs font-bold">Home</span>}
          </button>
          <button onClick={() => setViewState('roadmap')} className={`p-3 rounded-full flex items-center gap-2 transition-all duration-300 ${view === 'roadmap' ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white px-5' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
            <Map size={20} strokeWidth={view === 'roadmap' ? 2 : 1.5} />
            {view === 'roadmap' && <span className="text-xs font-bold">Roadmap</span>}
          </button>
          <button className={`p-3 rounded-full flex items-center gap-2 transition-all duration-300 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300`}>
            <Settings size={20} strokeWidth={1.5} />
          </button>
        </div>

        {handsFreeMode && (
          <HandsFreeMode />
        )}
      </div>
    </div>
  );
}
