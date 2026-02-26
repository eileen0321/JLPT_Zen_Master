import React, { useState } from 'react';
import { CheckCircle2, HelpCircle, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { WordData } from '../data/words';

interface JLPTCardProps {
  wordData: WordData;
  onNext: (knew: boolean) => void;
}

export const JLPTCard: React.FC<JLPTCardProps> = ({ wordData, onNext }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const renderRuby = (text: string) => {
    const regex = /([가-힣|々|〆|一-龥]+)\[([^\]]+)\]/g;
    const parts = text.split(regex);
    const result = [];
    
    for (let i = 0; i < parts.length; i++) {
      if (i % 3 === 1) {
        result.push(<ruby key={i}>{parts[i]}<rt className="text-[10px] opacity-60">{parts[i+1]}</rt></ruby>);
        i++;
      } else if (parts[i]) {
        result.push(parts[i]);
      }
    }
    return result;
  };

  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[320px] mx-auto p-2 h-full">
      <div className="relative w-full aspect-[3/4] max-h-[60vh] perspective-1000">
        <motion.div
          className="w-full h-full cursor-pointer preserve-3d"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front side: Kanji focus */}
          <div className="absolute inset-0 w-full h-full backface-hidden rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E1E1E] flex flex-col items-center justify-center p-8 shadow-sm">
            <span className="text-8xl font-serif mb-4 tracking-tighter" style={{ fontFamily: "'Zen Old Mincho', serif" }}>
              {wordData.word}
            </span>
            <p className="text-sm font-sans opacity-40 mt-4">Touch to check</p>
          </div>

          {/* Back side: Meaning and example */}
          <div className="absolute inset-0 w-full h-full backface-hidden rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E1E1E] flex flex-col items-center justify-center p-8 shadow-sm rotate-y-180">
            <div className="w-full text-center space-y-6">
              <div>
                <h3 className="text-3xl font-serif opacity-80 mb-2 flex justify-center items-center gap-2">
                  {renderRuby(wordData.reading_ruby)}
                  <button onClick={(e) => { e.stopPropagation(); playAudio(wordData.word); }} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <Volume2 size={16} className="text-slate-400" />
                  </button>
                </h3>
                <h2 className="text-2xl font-bold font-sans">{wordData.meaning}</h2>
              </div>
              <div className="h-[1px] w-12 bg-slate-200 dark:bg-slate-700 mx-auto" />
              <div className="space-y-3 text-left w-full">
                <p className="text-lg font-serif leading-relaxed" style={{ fontFamily: "'Zen Old Mincho', serif" }}>
                  {wordData.example_jp.split(wordData.particle).map((part, i, arr) => (
                    <React.Fragment key={i}>
                      {part}
                      {i < arr.length - 1 && <span className="text-emerald-500 font-bold underline underline-offset-4">{wordData.particle}</span>}
                    </React.Fragment>
                  ))}
                </p>
                <p className="text-sm font-sans opacity-60 leading-relaxed">
                  {wordData.example_ko}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom interaction buttons */}
      <footer className="mt-10 flex gap-12">
        <button 
          onClick={() => { setIsFlipped(false); setTimeout(() => onNext(false), 300); }}
          className="group flex flex-col items-center gap-3 active:scale-95 transition-transform"
        >
          <div className="p-5 rounded-full bg-red-50 dark:bg-red-950/30 text-red-500 shadow-sm shadow-red-500/10">
            <HelpCircle size={32} strokeWidth={1.5} />
          </div>
          <span className="text-xs font-sans opacity-50 font-bold">모름</span>
        </button>
        <button 
          onClick={() => { setIsFlipped(false); setTimeout(() => onNext(true), 300); }}
          className="group flex flex-col items-center gap-3 active:scale-95 transition-transform"
        >
          <div className="p-5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 shadow-sm shadow-emerald-500/10">
            <CheckCircle2 size={32} strokeWidth={1.5} />
          </div>
          <span className="text-xs font-sans opacity-50 font-bold">완료</span>
        </button>
      </footer>
    </div>
  );
};
