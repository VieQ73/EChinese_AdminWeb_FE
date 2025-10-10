import React from 'react';
import { Vocabulary } from '../../../../types';
import Checkbox from '../../../../ui/Checkbox';
import { MoreHorizontal } from 'lucide-react';

interface VocabCardProps {
    vocab: Vocabulary;
    isSelected: boolean;
    onSelect?: (id: string) => void;
    onViewDetails: (vocab: Vocabulary) => void;
}

const VocabCard: React.FC<VocabCardProps> = ({ vocab, isSelected, onSelect, onViewDetails }) => {
    return (
        <div 
            className={`relative bg-white rounded-xl border-2 transition-all duration-200 overflow-hidden hover:shadow-lg group cursor-pointer ${
                isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => onSelect ? onSelect(vocab.id) : onViewDetails(vocab)}
        >
            {/* Header với checkbox và image */}
            <div className="relative">
                {/* Checkbox */}
                {onSelect && (
                    <div 
                        className="absolute top-3 left-3 z-10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Checkbox 
                            checked={isSelected} 
                            onChange={() => onSelect(vocab.id)} 
                            id={`vocab-${vocab.id}`}
                        />
                    </div>
                )}
                
                {/* More actions button */}
                <button 
                    className="absolute top-3 right-3 z-10 p-2 text-gray-400 hover:text-blue-600 hover:bg-white hover:shadow-md rounded-full opacity-0 group-hover:opacity-100 transition-all"
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(vocab);
                    }}
                    title="Xem chi tiết"
                >
                    <MoreHorizontal size={18} />
                </button>
                
                {/* Vocabulary Image */}
                <div className="aspect-square w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
                    <img 
                        src={vocab.image_url || 'https://placehold.co/120x120/e2e8f0/64748b?text=' + encodeURIComponent(vocab.hanzi)} 
                        alt={vocab.hanzi}
                        className="w-full h-full object-cover rounded-lg"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                {/* Hanzi (main word) */}
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{vocab.hanzi}</h3>
                    <p className="text-lg text-blue-600 font-medium">{vocab.pinyin}</p>
                </div>
                
                {/* Meaning */}
                <div className="text-center">
                    <p className="text-sm text-gray-700 leading-relaxed"
                       style={{
                           display: '-webkit-box',
                           WebkitLineClamp: 2,
                           WebkitBoxOrient: 'vertical',
                           overflow: 'hidden'
                       }}>
                        {vocab.meaning}
                    </p>
                </div>
                
                {/* Word types */}
                {vocab.word_types && vocab.word_types.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center">
                        {vocab.word_types.slice(0, 3).map((type, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
                            >
                                {type}
                            </span>
                        ))}
                        {vocab.word_types.length > 3 && (
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">
                                +{vocab.word_types.length - 3}
                            </span>
                        )}
                    </div>
                )}
                
                {/* Level badges */}
                {vocab.level && vocab.level.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center">
                        {vocab.level.slice(0, 2).map((level, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full"
                            >
                                {level}
                            </span>
                        ))}
                        {vocab.level.length > 2 && (
                            <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-600 rounded-full">
                                +{vocab.level.length - 2}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VocabCard;