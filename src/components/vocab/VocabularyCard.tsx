import React from 'react';
import type { Vocabulary } from '../../types/entities';
import { playPronunciation } from '../../features/vocabularies/vocabApi';

const IconBtn: React.FC<{ children: React.ReactNode; title?: string; onClick?: (e: React.MouseEvent<HTMLButtonElement>)=>void; className?:string }> = ({ children, title, onClick, className })=> (
  <button title={title} onClick={onClick} className={`inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 ${className}`}>{children}</button>
);

const VocabularyCard: React.FC<{ vocab: Vocabulary; selectable?: boolean; checked?: boolean; onToggle?: () => void; onOpen?: ()=>void; viewMode?: 'grid'|'list' }> = ({ vocab, selectable, checked, onToggle, onOpen, viewMode='grid' }) => {
  // word_types and level are intentionally not shown on the card; they appear only in detail view

  // Fixed-size card for image/grid view: image left, content right with three rows (hanzi, pinyin, meaning).
  // Ensure min-w-0 on the content column to avoid flex children causing horizontal growth.
  // Fixed sizes: make image-view cards rigid in both dimensions and clamp text with ellipsis when overflowing
  return (
    <div className={`bg-white rounded-xl shadow-sm p-3 transform transition-all duration-150 hover:scale-[1.02] ${vocab.deleted_at ? 'opacity-60' : ''}`}>
      {viewMode === 'grid' ? (
        // revert to previous fixed height h-36 (9rem)
        <div className="flex h-36">
          <div className="w-36 h-full bg-gray-100 rounded-md overflow-hidden flex items-center justify-center flex-shrink-0">
            <img src={vocab.image_url || 'https://picsum.photos/200/120'} alt={vocab.hanzi} className="object-cover w-full h-full" />
          </div>
          <div className="flex-1 pl-3 min-w-0 flex flex-col justify-between relative">
            <div>
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold leading-tight break-words" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{vocab.hanzi}</h3>
                {/* removed inline header icon to allow absolute positioning so it lines up with bottom icon */}
              </div>
              <p className="text-sm text-gray-600 mt-1 leading-tight" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{vocab.pinyin}</p>
              <p className="text-sm text-gray-700 mt-2 leading-tight" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{vocab.meaning}</p>
            </div>

            {/* Top-right: audio button pinned so it aligns on the same right column as the bottom detail button */}
            <div className="absolute right-3 top-2">
              <IconBtn title="Phát âm" onClick={async (e)=>{ e.stopPropagation(); try { await playPronunciation(vocab.id); } catch (_) { /* ignore */ } }} className="bg-gray-100 text-gray-700">🔊</IconBtn>
            </div>

            {/* Bottom-right: checkbox (if present) sits to the left of the detail button; both are absolute and share the same right offset so they form a vertical column */}
            <div className="absolute right-3 bottom-2 flex items-center gap-2">
              {selectable && <input type="checkbox" checked={!!checked} onChange={(e)=>{ e.stopPropagation(); if(onToggle) onToggle(); }} className="w-4 h-4" />}
              <IconBtn title="Xem chi tiết" onClick={(e)=>{ e.stopPropagation(); if(onOpen) onOpen(); }}>🔍</IconBtn>
            </div>
          </div>
        </div>
      ) : (
        // Detail/list view: no image, just three stacked rows; keep detail button
        <div className="flex flex-col min-w-0">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold leading-tight break-words">{vocab.hanzi}</h3>
            <IconBtn title="Xem chi tiết" onClick={(e)=>{ e.stopPropagation(); if(onOpen) onOpen(); }}>🔍</IconBtn>
          </div>
          <p className="text-sm text-gray-600 mt-1 leading-tight break-words">{vocab.pinyin}</p>
          <p className="text-sm text-gray-700 mt-2 leading-tight break-words">{vocab.meaning}</p>
        </div>
      )}
    </div>
  );
};

export default VocabularyCard;
