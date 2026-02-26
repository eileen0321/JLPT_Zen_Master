import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Bookmark, Volume2 } from 'lucide-react';
import { WordData } from '../data/words';

interface JLPTDetailCardProps {
  data: WordData;
  onNext?: () => void;
}

export const JLPTDetailCard: React.FC<JLPTDetailCardProps> = ({ data, onNext }) => {
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
    <div className="w-full max-w-md mx-auto p-2 font-sans">
      <motion.div 
        className="bg-white dark:bg-[#1A1A1A] rounded-[32px] border border-slate-100 dark:border-white/5 overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-none"
      >
        {/* Top Header */}
        <div className="p-6 pb-0 flex justify-between items-start">
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
              {data.level}
            </span>
            <span className="px-3 py-1 bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-full">
              {data.part_of_speech}
            </span>
          </div>
          <Bookmark size={20} className="text-slate-300 hover:text-emerald-500 cursor-pointer transition-colors" />
        </div>

        {/* Main Section */}
        <div className="p-8 flex flex-col items-center">
          <h1 className="text-6xl font-serif mb-4 dark:text-white" style={{ fontFamily: "'Zen Old Mincho', serif" }}>
            {renderRuby(data.reading_ruby)}
          </h1>
          
          <div className="flex items-center gap-2 mb-8">
            <div className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-semibold">
              {data.usage_chip}
            </div>
            <Volume2 size={18} className="text-slate-400 cursor-pointer hover:text-emerald-500" onClick={() => playAudio(data.word)} />
          </div>

          <h2 className="text-2xl font-bold tracking-tight mb-2">{data.meaning}</h2>
          <p className="text-sm text-slate-400 text-center leading-relaxed">
            {data.usage_note}
          </p>
        </div>

        {/* Example Section */}
        <div className="px-8 pb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent mb-8" />
          
          <div className="space-y-4 bg-slate-50 dark:bg-black/20 p-6 rounded-2xl border border-slate-100 dark:border-white/5">
            <div className="relative">
              <span className="absolute -left-2 top-0 text-[10px] font-bold text-emerald-500 opacity-50 uppercase">Example</span>
              <p className="text-lg font-serif dark:text-slate-200 pt-3 flex items-center gap-2" style={{ fontFamily: "'Zen Old Mincho', serif" }}>
                <span>
                  {data.example_jp.split(data.particle).map((part, i, arr) => (
                    <React.Fragment key={i}>
                      {part}
                      {i < arr.length - 1 && <span className="text-emerald-500 font-bold underline underline-offset-4">{data.particle}</span>}
                    </React.Fragment>
                  ))}
                </span>
                <Volume2 size={14} className="text-slate-400 cursor-pointer hover:text-emerald-500" onClick={() => playAudio(data.example_jp)} />
              </p>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {data.example_ko}
            </p>
          </div>
          
          {/* Bottom Memo */}
          <div className="mt-6 flex items-center justify-between text-[11px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">
            <span>#{data.memo}</span>
            {onNext && (
              <div onClick={onNext} className="flex items-center gap-1 cursor-pointer hover:text-emerald-500 transition-colors">
                <span>Next Word</span>
                <ChevronRight size={14} />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
