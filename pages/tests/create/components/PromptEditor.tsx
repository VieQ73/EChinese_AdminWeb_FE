import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PlusIcon } from '../../../../components/icons';
import type { FormPrompt, PromptImage } from '../hooks/useExamForm';
import RichTextEditor from '../../../../components/RichTextEditor';
import FileInput from './shared/FileInput';
import { Button } from '../../../../components/ui/Button';

interface PromptEditorProps {
  prompt: FormPrompt;
  onPromptChange: (payload: Partial<FormPrompt>) => void;
}

type ImageMode = 'single' | 'multiple';

const PromptEditor: React.FC<PromptEditorProps> = ({ prompt, onPromptChange }) => {
  const [imageMode, setImageMode] = useState<ImageMode>('single');

  useEffect(() => {
    // Tự động xác định mode dựa trên dữ liệu hiện có
    if (prompt.image_json?.type === 'image_list') {
      setImageMode('multiple');
    } else {
      setImageMode('single');
    }
  }, [prompt.image_json]);

  const handleModeChange = (mode: ImageMode) => {
    if (mode === imageMode) return;

    setImageMode(mode);
    // Khi chuyển mode, xóa dữ liệu ảnh cũ để tránh xung đột
    if (mode === 'multiple') {
      onPromptChange({ image_json: { type: 'image_list', images: [] } });
    } else {
      onPromptChange({ image_json: undefined });
    }
  };

  const getImages = (): PromptImage[] => {
    if (prompt.image_json?.type === 'image_list' && Array.isArray(prompt.image_json.images)) {
      return prompt.image_json.images;
    }
    return [];
  };

  const images = getImages();

  const handleImageChange = (index: number, file: File | null) => {
    const updatedImages = images.map((img, i) => (i === index ? { ...img, url: file ? URL.createObjectURL(file) : '' } : img));
    onPromptChange({ image_json: { type: 'image_list', images: updatedImages } });
  };

  const addImage = () => {
    if (images.length >= 5) {
        alert("Chỉ có thể thêm tối đa 5 ảnh.");
        return;
    }
    const newLabel = String.fromCharCode(65 + images.length);
    const newImages: PromptImage[] = [...images, { type: 'image', label: newLabel, url: '' }];
    onPromptChange({ image_json: { type: 'image_list', images: newImages } });
  };

  const removeImage = (index: number) => {
    // Lọc bỏ ảnh và cập nhật lại label cho các ảnh còn lại
    const updatedImages = images
      .filter((_, i) => i !== index)
      .map((img, i) => ({ ...img, label: String.fromCharCode(65 + i) }));
    onPromptChange({ image_json: { type: 'image_list', images: updatedImages } });
  };

  return (
    <div className="space-y-4 p-4 border border-slate-200 rounded-lg bg-white">
      <RichTextEditor
        initialContent={prompt.content?.html || ''}
        onChange={html => onPromptChange({ content: { html } })}
        placeholder="Nhập nội dung chung cho các câu hỏi (văn bản, hội thoại...)"
      />

      <div className="space-y-3">
        <div className="flex gap-4 border-b border-slate-200">
          <button
            type="button"
            onClick={() => handleModeChange('single')}
            className={`pb-2 text-sm font-semibold transition-colors ${imageMode === 'single' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Một ảnh
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('multiple')}
            className={`pb-2 text-sm font-semibold transition-colors ${imageMode === 'multiple' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Nhiều ảnh (Nối)
          </button>
        </div>

        {imageMode === 'single' ? (
          <FileInput
            id={`prompt-image-${prompt.id}`}
            label="Hình ảnh cho đề bài"
            value={prompt.image_json?.type === 'single_image' ? prompt.image_json.url : undefined}
            onFileChange={(file) => onPromptChange({ image_json: file ? { type: 'single_image', url: URL.createObjectURL(file) } : undefined })}
            accept="image/*"
          />
        ) : (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Các ảnh cho câu hỏi nối (tối đa 5)</label>
            <div className="flex items-start gap-4 flex-wrap justify-center bg-slate-50 p-4 rounded-lg">
              {images.map((img, index) => (
                <div key={index} className="flex flex-col gap-2 p-2 border rounded-md bg-white w-32 shadow-sm">
                  <FileInput
                    id={`prompt-image-multi-${prompt.id}-${index}`}
                    label={`Ảnh ${img.label}`}
                    value={img.url}
                    onFileChange={(file) => handleImageChange(index, file)}
                    accept="image/*"
                    variant="compact"
                  />
                  {images.length > 0 && (
                     <button type="button" onClick={() => removeImage(index)} className="text-xs text-red-600 hover:underline">Xóa ảnh</button>
                  )}
                </div>
              ))}
              {images.length < 5 && (
                <div className="w-32 h-[148px] flex items-center justify-center">
                    <Button type="button" variant="secondary" size="sm" onClick={addImage}>
                        <PlusIcon className="w-4 h-4 mr-1" /> Thêm
                    </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <FileInput
        id={`prompt-audio-${prompt.id}`}
        label="Âm thanh cho đề bài (nếu có)"
        value={prompt.audio_url}
        onFileChange={(file) => onPromptChange({ audio_url: file ? URL.createObjectURL(file) : undefined })}
        accept="audio/*"
      />
    </div>
  );
};

export default PromptEditor;
