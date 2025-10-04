import React, { useRef, useCallback, useEffect } from 'react';
import { Bold, Italic, Underline, Link, List, ListOrdered, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Icon button cho Rich Text Editor toolbar
 */
const EditorIcon: React.FC<{ 
  onClick: (e: React.MouseEvent) => void; 
  title: string; 
  children: React.ReactNode 
}> = ({ onClick, title, children }) => (
  <button
    type="button"
    onMouseDown={onClick}
    title={title}
    className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
  >
    {children}
  </button>
);

/**
 * Rich Text Editor component cho nội dung tips
 * Hỗ trợ định dạng text giống CreateEditPostModal nhưng không có ảnh
 */
const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = "Nhập nội dung...",
  className = ""
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  // Thực thi lệnh Rich Text Editor
  const exec = useCallback((cmd: string, val?: string) => {
    document.execCommand(cmd, false, val || undefined);
    // Cập nhật content sau khi thực thi lệnh
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Xử lý input từ contentEditable
  const handleContentInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerHTML || '';
    onChange(newContent);
  }, [onChange]);

  // Chỉ set innerHTML lần đầu tiên khi component mount hoặc khi content thay đổi từ props và editor đang trống
  useEffect(() => {
    if (editorRef.current) {
      if (!isInitialized.current) {
        // Lần đầu tiên mount component
        editorRef.current.innerHTML = content;
        isInitialized.current = true;
      } else if (editorRef.current.innerHTML === '' && content !== '') {
        // Khi editor trống nhưng có content từ props (như khi load data để edit)
        editorRef.current.innerHTML = content;
      }
    }
  }, [content]);

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {/* Content Editor Area */}
      <div 
        ref={editorRef} 
        contentEditable 
        className={`p-3 min-h-[120px] bg-white text-gray-800 focus:outline-none focus:ring-0 ${
          !content ? 'empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none' : ''
        }`}
        onInput={handleContentInput}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />

      {/* Rich Text Controls Toolbar */}
      <div className="p-2 bg-gray-50 flex flex-wrap gap-1 border-t border-gray-200">
        {/* Text formatting */}
        <EditorIcon 
          onClick={(e) => { e.preventDefault(); exec('bold'); }} 
          title="In đậm"
        >
          <Bold size={16} />
        </EditorIcon>
        
        <EditorIcon 
          onClick={(e) => { e.preventDefault(); exec('italic'); }} 
          title="In nghiêng"
        >
          <Italic size={16} />
        </EditorIcon>
        
        <EditorIcon 
          onClick={(e) => { e.preventDefault(); exec('underline'); }} 
          title="Gạch chân"
        >
          <Underline size={16} />
        </EditorIcon>
        
        {/* Color controls */}
        <input 
          type="color" 
          onInput={(e) => { 
            e.preventDefault(); 
            exec('foreColor', (e.target as HTMLInputElement).value); 
          }} 
          title="Màu chữ" 
          className="w-6 h-6 p-0 border border-gray-300 rounded cursor-pointer bg-white" 
        />
        
        <input 
          type="color" 
          onInput={(e) => { 
            e.preventDefault(); 
            exec('backColor', (e.target as HTMLInputElement).value); 
          }} 
          title="Màu nền" 
          className="w-6 h-6 p-0 border border-gray-300 rounded cursor-pointer bg-white" 
        />
        
        {/* Alignment controls */}
        <EditorIcon 
          onClick={(e) => { e.preventDefault(); exec('justifyLeft'); }} 
          title="Căn trái"
        >
          <AlignLeft size={16} />
        </EditorIcon>
        
        <EditorIcon 
          onClick={(e) => { e.preventDefault(); exec('justifyCenter'); }} 
          title="Căn giữa"
        >
          <AlignCenter size={16} />
        </EditorIcon>
        
        <EditorIcon 
          onClick={(e) => { e.preventDefault(); exec('justifyRight'); }} 
          title="Căn phải"
        >
          <AlignRight size={16} />
        </EditorIcon>
        
        {/* List controls */}
        <EditorIcon 
          onClick={(e) => { e.preventDefault(); exec('insertUnorderedList'); }} 
          title="Danh sách gạch đầu dòng"
        >
          <List size={16} />
        </EditorIcon>
        
        <EditorIcon 
          onClick={(e) => { e.preventDefault(); exec('insertOrderedList'); }} 
          title="Danh sách có thứ tự"
        >
          <ListOrdered size={16} />
        </EditorIcon>
        
        {/* Link control */}
        <EditorIcon 
          onClick={(e) => { 
            e.preventDefault(); 
            const url = prompt('Nhập URL'); 
            if (url) exec('createLink', url); 
          }} 
          title="Chèn liên kết"
        >
          <Link size={16} />
        </EditorIcon>
      </div>
    </div>
  );
};

export default RichTextEditor;