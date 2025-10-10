import React, { useState } from 'react';
import { Upload, X, Volume2, Play, Pause } from 'lucide-react';

interface SectionAudioManagerProps {
  sectionName: string;
  audioUrl?: string;
  onAudioChange: (audioUrl: string) => void;
  className?: string;
}

export const SectionAudioManager: React.FC<SectionAudioManagerProps> = ({
  sectionName,
  audioUrl,
  onAudioChange,
  className = ''
}) => {
  const [audioPlaying, setAudioPlaying] = useState<string | null>(null);

  // Handle file upload
  const handleFileUpload = () => {
    console.log(`Upload audio for section: ${sectionName}`);
    const mockUrl = `https://example.com/section_audio/${Date.now()}.mp3`;
    onAudioChange(mockUrl);
  };

  // Play audio
  const handlePlayAudio = (url: string) => {
    if (audioPlaying === url) {
      setAudioPlaying(null);
    } else {
      setAudioPlaying(url);
      setTimeout(() => setAudioPlaying(null), 3000);
    }
  };

  // Remove audio
  const handleRemoveAudio = () => {
    onAudioChange('');
  };

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-blue-900">
          Âm thanh phần {sectionName}
        </h4>
        <Volume2 className="w-4 h-4 text-blue-600" />
      </div>
      
      {audioUrl ? (
        <div className="flex items-center justify-between p-3 bg-white border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <Volume2 className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-sm text-blue-700">Đã có file âm thanh</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePlayAudio(audioUrl)}
              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
              title="Phát âm thanh"
            >
              {audioPlaying === audioUrl ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={handleRemoveAudio}
              className="p-1.5 text-red-600 hover:bg-red-100 rounded"
              title="Xóa file âm thanh"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleFileUpload}
          className="flex items-center justify-center w-full p-3 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          <Upload className="w-5 h-5 text-blue-400 mr-2" />
          <span className="text-blue-600 text-sm">Tải lên file âm thanh cho phần nghe</span>
        </button>
      )}
      
      <p className="text-xs text-blue-600 mt-2">
        File âm thanh này sẽ được sử dụng cho tất cả các câu hỏi trong phần nghe
      </p>
    </div>
  );
};