
import React from 'react';
import { Slide } from '../types';

interface Props {
  activeSlide?: Slide;
  onNext: () => void;
  onPrev: () => void;
  onBack: () => void;
  onOpenEditor: () => void;
  totalSlides: number;
  currentIndex: number;
}

const NavigationOverlay: React.FC<Props> = ({ 
  activeSlide, onNext, onPrev, onBack, onOpenEditor, totalSlides, currentIndex 
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8">
      {/* Top Bar */}
      <div className="flex justify-between items-center pointer-events-auto">
        <div className="flex items-center gap-4">
          <button 
            onClick={onOpenEditor}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-sm font-medium transition-colors border border-white/10"
          >
            Éditeur de Présentation
          </button>
        </div>
        
        {activeSlide && (
          <button 
            onClick={onBack}
            className="px-4 py-2 bg-amber-500/80 hover:bg-amber-500 backdrop-blur-md rounded-full text-sm font-bold text-black transition-colors"
          >
            Vue d'ensemble (ESC)
          </button>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="flex justify-between items-end pointer-events-auto">
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 p-4 rounded-3xl max-w-md">
          {activeSlide ? (
            <div>
              <span className="text-amber-400 text-xs font-mono uppercase tracking-widest mb-1 block">Diapositif {currentIndex + 1} / {totalSlides}</span>
              <h4 className="text-xl font-bold text-white mb-2">{activeSlide.title}</h4>
              <p className="text-sm text-gray-400 line-clamp-2">{activeSlide.content}</p>
            </div>
          ) : (
            <div>
              <h4 className="text-lg font-medium text-amber-50/50 italic">Sélectionnez un cercle pour explorer...</h4>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={onPrev}
            className="w-14 h-14 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition-all active:scale-95"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button 
            onClick={onNext}
            className="w-20 h-20 flex items-center justify-center bg-amber-50 text-black hover:bg-white rounded-full transition-all active:scale-95 shadow-xl shadow-amber-500/20"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavigationOverlay;
