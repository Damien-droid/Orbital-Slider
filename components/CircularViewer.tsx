
import React from 'react';
import { Slide, ViewportState } from '../types';
import { RING_RADIUS, RING_STROKE_WIDTH, RING_COLOR } from '../constants';

interface Props {
  slides: Slide[];
  viewport: ViewportState;
  onSelect: (id: string) => void;
}

const CircularViewer: React.FC<Props> = ({ slides, viewport, onSelect }) => {
  const transitionDuration = viewport.isManual ? '0ms' : '1000ms';
  const transitionTiming = viewport.isManual ? 'linear' : 'cubic-bezier(0.2, 1, 0.3, 1)';

  const transform = `translate(${window.innerWidth / 2 + viewport.translateX}px, ${window.innerHeight / 2 + viewport.translateY}px) scale(${viewport.scale})`;

  return (
    <div 
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ 
        transform, 
        transformOrigin: 'center center',
        transitionProperty: 'transform',
        transitionDuration: transitionDuration,
        transitionTimingFunction: transitionTiming,
        willChange: 'transform'
      }}
    >
      <div className="absolute w-2 h-2 bg-amber-500/40 rounded-full blur-[2px]"></div>

      <svg
        width={RING_RADIUS * 2.5}
        height={RING_RADIUS * 2.5}
        viewBox={`0 0 ${RING_RADIUS * 2.5} ${RING_RADIUS * 2.5}`}
        className="absolute pointer-events-none opacity-10"
      >
        <circle
          cx={RING_RADIUS * 1.25}
          cy={RING_RADIUS * 1.25}
          r={RING_RADIUS}
          fill="none"
          stroke={RING_COLOR}
          strokeWidth={RING_STROKE_WIDTH / 2}
          strokeDasharray="10 20"
        />
      </svg>

      {slides.map((slide, index) => {
        const angle = (index / slides.length) * 2 * Math.PI - Math.PI / 2;
        const x = RING_RADIUS * Math.cos(angle);
        const y = RING_RADIUS * Math.sin(angle);
        const isActive = viewport.activeSlideId === slide.id;

        return (
          <div
            key={slide.id}
            onDoubleClick={(e) => {
                e.stopPropagation();
                onSelect(slide.id);
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(slide.id);
            }}
            className={`absolute cursor-pointer pointer-events-auto group ${
              isActive ? 'z-20' : 'z-10'
            }`}
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: 'translate(-50%, -50%)',
              transition: viewport.isManual ? 'none' : 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)'
            }}
          >
            <div 
              className={`relative overflow-hidden flex items-center justify-center bg-black border-[2px] shadow-2xl transition-all duration-700
                ${isActive 
                  ? 'w-[780px] h-[520px] rounded-[2rem] border-amber-500 shadow-amber-500/50 scale-100' 
                  : 'w-[140px] h-[140px] rounded-full border-white/10 group-hover:border-amber-400 group-hover:scale-110 shadow-black'
                }`}
            >
              {slide.imageUrl ? (
                <img 
                  src={slide.imageUrl} 
                  alt={slide.title}
                  className={`w-full h-full object-cover pointer-events-none transition-all duration-1000 ${isActive ? 'opacity-10 blur-3xl scale-125' : 'opacity-70 group-hover:opacity-100'}`}
                />
              ) : (
                <div className="p-4 text-center opacity-30 group-hover:opacity-100 transition-opacity">
                   <div className="w-8 h-1 bg-white/20 mx-auto mb-2 rounded-full"></div>
                </div>
              )}

              {isActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in-95 duration-700 delay-100">
                   <div className="space-y-8 max-w-2xl">
                    <h3 className="text-5xl font-black text-white tracking-tighter leading-tight drop-shadow-lg">{slide.title}</h3>
                    <div className="w-24 h-1.5 bg-amber-500 mx-auto rounded-full shadow-[0_0_20px_rgba(245,158,11,0.6)]"></div>
                    <p className="text-2xl leading-relaxed text-gray-100 font-medium drop-shadow-md">{slide.content}</p>
                   </div>
                </div>
              )}
            </div>
            
            {!isActive && viewport.scale < 2.5 && (
              <div className="absolute top-[125%] left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none scale-90 group-hover:scale-100">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-50 bg-black/80 backdrop-blur-lg px-5 py-2.5 rounded-full border border-white/5 shadow-2xl">
                  {slide.title}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CircularViewer;
