import React, { useRef, useCallback, useEffect } from 'react';
import { Bold, Italic, Underline, Link, List, ListOrdered, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

// Props cho RichTextEditor
interface RichTextEditorProps {
  initialContent: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string; 
}

/**
 * Component icon đơn giản cho thanh công cụ của Editor
 */
const EditorIcon: React.FC<{ children: React.ReactNode, onClick: (e: React.MouseEvent) => void, title: string, active?: boolean }> = ({ children, onClick, title, active }) => (
  <button
    onMouseDown={onClick}
    title={title}
    type="button" // Ngăn chặn form submit
    // Sử dụng bg-gray-300 khi active, thêm transition-colors
    className={`p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors ${active ? 'bg-gray-300' : ''}`}
  >
    {children}
  </button>
);

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  initialContent, 
  onChange, 
  placeholder = "Nhập nội dung...", // Sét giá trị mặc định nếu không truyền
  className = "" // Sét giá trị mặc định nếu không truyền
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  // Thực thi lệnh Rich Text Editor
  const exec = useCallback((cmd: string, val?: string) => {
    // Ngăn chặn sự kiện click khỏi xóa vùng chọn (selection) trước khi execCommand chạy
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

  // Chỉ set innerHTML lần đầu tiên khi component mount
  useEffect(() => {
    if (editorRef.current) {
      if (!isInitialized.current) {
        // Lần đầu tiên mount component
        editorRef.current.innerHTML = initialContent;
        isInitialized.current = true;
      } else if (editorRef.current.innerHTML === '' && initialContent !== '') {
        // Khi editor trống nhưng có initialContent (trường hợp load lại dữ liệu)
        editorRef.current.innerHTML = initialContent;
      }
    }
    // Lưu ý: Hàm này chỉ chạy khi initialContent thay đổi, không nên chạy khi contentEditable đang focus
  }, [initialContent]);

  return (
    // Loại bỏ div className="space-y-2" và label. Áp dụng className tại đây.
    <div className={`border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 ${className}`}>
      <div
        ref={editorRef}
        contentEditable
        // Thêm class cho placeholder styling: empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400
        className="p-3 min-h-[120px] bg-white text-gray-800 focus:outline-none focus:ring-0 prose prose-sm max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
        onInput={handleContentInput}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder} // Sử dụng prop placeholder
      />
      {/* Thanh công cụ Rich Text */}
      <div className="p-2 bg-gray-50 flex flex-wrap gap-1 border-t border-gray-200">
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

        <EditorIcon
            onClick={(e) => {
              e.preventDefault();
              // Sử dụng document.execCommand cho createLink
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
