
import React, { useState } from 'react';
import { Slide } from '../types';

interface Props {
  slides: Slide[];
  onClose: () => void;
  onSave: (title: string, content: string, imageUrl?: string) => void;
  onDelete: (id: string) => void;
  isProcessing: boolean;
}

const SlideEditor: React.FC<Props> = ({ slides, onClose, onSave, onDelete, isProcessing }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;
    onSave(title, content, imageUrl);
    setTitle('');
    setContent('');
    setImageUrl('');
  };

  const isLimitReached = slides.length >= 24;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#111] border border-white/10 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl">
        {/* Left Side: Form */}
        <div className="p-8 flex-1 border-r border-white/5 overflow-y-auto">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-amber-500 rounded-full"></span>
            Nouveau Diapositif
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Titre (Optionnel - Gemini peut en générer un)</label>
              <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Le commencement"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-amber-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Contenu / Description</label>
              <textarea 
                required
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={4}
                placeholder="Détaillez le sujet ici..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-amber-500 outline-none transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">URL de l'image (Optionnel)</label>
              <input 
                type="url" 
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-amber-500 outline-none transition-colors"
              />
            </div>

            {isLimitReached && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-200 text-xs">
                ⚠️ <strong>Conseil :</strong> Un cercle orbital est plus lisible avec moins de 24 diapositives.
              </div>
            )}

            <div className="flex gap-4">
              <button 
                type="submit"
                disabled={isProcessing}
                className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold py-4 rounded-xl transition-all shadow-lg shadow-amber-500/20"
              >
                {isProcessing ? 'Optimisation IA...' : 'Ajouter à la Roue'}
              </button>
              <button 
                type="button"
                onClick={onClose}
                className="px-6 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
              >
                Fermer
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: List & Management */}
        <div className="p-8 w-full md:w-80 bg-black/40 overflow-y-auto">
          <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Structure ({slides.length}/24)</h4>
          <div className="space-y-3">
            {slides.map((s, i) => (
              <div key={s.id} className="group flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="text-[10px] font-mono text-amber-500/50">{i + 1}</span>
                  <p className="text-xs font-medium truncate">{s.title}</p>
                </div>
                <button 
                  onClick={() => onDelete(s.id)}
                  className="p-1 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 rounded"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlideEditor;
