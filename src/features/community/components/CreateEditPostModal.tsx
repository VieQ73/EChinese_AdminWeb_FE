import React, { useState, useEffect, useRef } from 'react';
import { X, Image as ImageIcon, Bold, Italic, Underline, Link, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Trash2 } from 'lucide-react';

// Danh sách các Chủ đề theo entities.ts
const TOPICS = [
  'Cơ khí', 'CNTT', 'Dịch', 'Du học', 'Du lịch', 'Góc chia sẻ', 
  'Tìm bạn học chung', 'Học tiếng Trung', 'Tìm gia sư', 'Việc làm', 
  'Văn hóa', 'Thể thao', 'Xây dựng', 'Y tế', 'Tâm sự', 'Khác'
];



/**
 * Component icon đơn giản cho Editor (Rich Text Controls)
 */
const EditorIcon = ({ children, onClick, title, active }: { children: React.ReactNode, onClick: (e:any)=>void, title: string, active?: boolean }) => (
  <button 
    onClick={onClick} 
    title={title}
    type="button" // Ngăn chặn form submit
    className={`w-8 h-8 flex items-center justify-center border-none rounded text-gray-600 hover:bg-gray-200 transition-colors 
      ${active ? 'bg-gray-300' : ''}`}
  >
    {children}
  </button>
);


const CreateEditPostModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initial?: any;
}> = ({ isOpen, onClose, onSave, initial }) => {
  const [title, setTitle] = useState('');
  // Nội dung Rich Text/HTML
  const [content, setContent] = useState('');
  // Mảng chứa URL/Blob URL của các ảnh đã tải lên (max 4)
  const [images, setImages] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement|null>(null);
  
  useEffect(() => {
    if (isOpen) {
      // Lấy dữ liệu từ initial khi edit
      setTitle(initial?.title || '');
      setSelectedTopic(initial?.topic || '');
      
      // Xử lý content - có thể là HTML hoặc ops format
      const rawContent = initial?.content?.html || 
                        (initial?.content?.ops ? initial.content.ops.map((o: any) => o.insert).join('') : '') || 
                        '';
      setContent(rawContent);
      
      // Lấy danh sách ảnh nếu có
      setImages(initial?.images || []);
      
      // Cập nhật editor với nội dung
      if (editorRef.current && rawContent) {
        editorRef.current.innerHTML = rawContent;
      }
    } else {
      // Reset form khi đóng modal
      setTitle('');
      setSelectedTopic('');
      setContent('');
      setImages([]);
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
    }
  }, [isOpen, initial]);
  
  const handleSave = async () => {
    // Ràng buộc: Tiêu đề và Chủ đề là bắt buộc
    // Thay alert() bằng console.error và log thông báo cho người dùng
    if (!title.trim() || !selectedTopic.trim()) {
      console.error('Lỗi ràng buộc: Vui lòng nhập Tiêu đề và chọn Chủ đề câu hỏi.');
      return;
    }

    setSaving(true);
    try {
      // Lấy nội dung HTML cuối cùng
      const finalContent = editorRef.current?.innerHTML || `<p>${content}</p>`;
      
      const payload = { 
        title, 
        topic: selectedTopic,
        // Đóng gói nội dung
        content: { html: finalContent, ops: [{ insert: finalContent }] }, 
        images
      };
      await onSave(payload);
      onClose();
    } catch (e: any) {
      console.error('Save post failed', e);
    } finally {
      setSaving(false);
    }
  };

  // Thực thi lệnh Rich Text Editor
  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val || undefined);
    // Cập nhật state sau khi lệnh được thực thi
    setContent(editorRef.current?.innerHTML || '');
  };
  
  // Xử lý input từ contentEditable
  const handleContentInput = (e: React.FormEvent<HTMLDivElement>) => {
    setContent(e.currentTarget.innerHTML || '');
  };

  // Xử lý tải ảnh (tối đa 4 ảnh)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; 
    if (!files) return;
    
    const allowed = ['image/jpeg','image/jpg','image/png','image/webp'];
    const maxFiles = 4;
    const toAdd: string[] = [];
    
    for(let i = 0; i < files.length; i++){
      const f = files[i];
      // Validation loại file
      if(!allowed.includes(f.type)) { 
        console.warn('Lỗi validation: Chỉ chấp nhận JPG, PNG, WEBP.'); 
        continue; 
      }
      // Validation kích thước file (5MB)
      if(f.size > 5*1024*1024) { 
        console.warn('Lỗi validation: Ảnh quá lớn. Tối đa 5MB mỗi ảnh.'); 
        continue; 
      }
      // Validation số lượng
      if(images.length + toAdd.length >= maxFiles) { 
        console.warn('Lỗi validation: Đã đạt giới hạn 4 ảnh'); 
        break; 
      }
      
      toAdd.push(URL.createObjectURL(f));
    }
    
    setImages(prev => {
      const merged = [...prev, ...toAdd].slice(0, maxFiles);
      return merged;
    });
    
    // Reset input để cho phép tải lên cùng một file sau khi đã xóa
    e.target.value = '';
  };
  
  // Tự động tính toán layout cho ảnh dựa trên số lượng
  const getImageLayoutClass = () => {
    switch(images.length) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-2'; // 2 ảnh trên, 1 ảnh dưới
      case 4:
        return 'grid-cols-2'; // 2x2 grid
      default:
        return 'grid-cols-1';
    }
  };

  if (!isOpen) return null;

  return (
    // BẮT ĐẦU THAY THẾ DIALOG VÀ BUTTON BẰNG CẤU TRÚC HTML/TAILWIND
    // Full screen overlay (Mimics Dialog)
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4" onClick={(e) => { 
      // Đóng modal khi click ra ngoài (trừ khi click vào nội dung modal)
      if ((e.target as HTMLDivElement).classList.contains('bg-black/50')) onClose(); 
    }}>
      
      {/* Modal Content Box (Mimics DialogContent) */}
      <div className="relative w-full max-w-2xl bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-100 animate-in fade-in-0 zoom-in-95 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] duration-300">
        
        {/* Header (Mimics DialogHeader) */}
        <div className="flex flex-row items-center justify-between p-6 border-b border-gray-200">
          {/* Title (Mimics DialogTitle) */}
          <h2 className="text-xl font-bold leading-none tracking-tight">
            {initial ? 'Chỉnh sửa bài viết' : 'Tạo bài viết'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors rounded-full p-1 bg-gray-100 hover:bg-gray-200">
            <X size={20} />
          </button>
        </div>
        
        {/* Main Content Area */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          
          {/* Tiêu đề */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-600">Tiêu đề*</label>
            <input 
              id="post-title" 
              value={title} 
              onChange={(e)=>setTitle(e.target.value)} 
              placeholder="Hãy nhập tiêu đề câu hỏi của bạn."
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Nội dung (Textarea + Rich Text Controls) */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-600">Nội dung</label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              {/* Textarea Area - Dùng contentEditable để hỗ trợ RTF */}
              <div 
                ref={editorRef} 
                contentEditable 
                className="p-3 min-h-[120px] bg-white text-gray-800 focus:outline-none focus:ring-0" 
                onInput={handleContentInput} 
                dangerouslySetInnerHTML={{ __html: content  }} 
              />

              {/* Rich Text Controls */}
              <div className="p-2 bg-gray-50 flex flex-wrap gap-1 border-t border-gray-200">
                <EditorIcon onClick={(e)=>{ e.preventDefault(); exec('bold'); }} title="In đậm"><Bold size={16} /></EditorIcon>
                <EditorIcon onClick={(e)=>{ e.preventDefault(); exec('italic'); }} title="In nghiêng"><Italic size={16} /></EditorIcon>
                <EditorIcon onClick={(e)=>{ e.preventDefault(); exec('underline'); }} title="Gạch chân"><Underline size={16} /></EditorIcon>
                
                <input type="color" onInput={(e)=>{ e.preventDefault(); exec('foreColor', (e.target as HTMLInputElement).value); }} title="Màu chữ" className="w-6 h-6 p-0 border border-gray-300 rounded cursor-pointer bg-white" />
                <input type="color" onInput={(e)=>{ e.preventDefault(); exec('backColor', (e.target as HTMLInputElement).value); }} title="Màu nền" className="w-6 h-6 p-0 border border-gray-300 rounded cursor-pointer bg-white" />
                
                <EditorIcon onClick={(e)=>{ e.preventDefault(); exec('justifyLeft'); }} title="Căn trái"><AlignLeft size={16} /></EditorIcon>
                <EditorIcon onClick={(e)=>{ e.preventDefault(); exec('justifyCenter'); }} title="Căn giữa"><AlignCenter size={16} /></EditorIcon>
                <EditorIcon onClick={(e)=>{ e.preventDefault(); exec('justifyRight'); }} title="Căn phải"><AlignRight size={16} /></EditorIcon>
                
                <EditorIcon onClick={(e)=>{ e.preventDefault(); exec('insertUnorderedList'); }} title="Danh sách gạch đầu dòng"><List size={16} /></EditorIcon>
                <EditorIcon onClick={(e)=>{ e.preventDefault(); exec('insertOrderedList'); }} title="Danh sách có thứ tự"><ListOrdered size={16} /></EditorIcon>
                
                <EditorIcon onClick={(e)=>{ e.preventDefault(); const url = prompt('Nhập URL'); if(url) exec('createLink', url); }} title="Chèn liên kết"><Link size={16} /></EditorIcon>
              </div>
            </div>
          </div>

          {/* Khu vực Tải ảnh và Xem trước */}
          <div className="p-3 border border-dashed border-gray-300 rounded-lg bg-gray-50 space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-semibold text-gray-700">Hình ảnh</label>
              
              {/* Nút Tải lên ảnh (Dùng label cho styling đẹp hơn) */}
              <label 
                htmlFor="image-upload" 
                className={`flex items-center gap-1 cursor-pointer px-3 py-1 rounded-full text-sm font-medium transition-colors shadow-sm
                  ${images.length >= 4 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`} 
                title={images.length >= 4 ? "Đã đạt giới hạn 4 ảnh" : "Tải lên tối đa 4 ảnh"}
              >
                <ImageIcon size={16} /> Tải ảnh
                <input 
                  type="file" 
                  id="image-upload" 
                  accept="image/jpeg,image/jpg,image/png,image/webp" 
                  multiple 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  disabled={images.length >= 4} 
                />
              </label>
            </div>
            
            {/* Xem trước ảnh với layout tự động */}
            {images.length > 0 && (
              <div className={`grid ${getImageLayoutClass()} gap-2`}>
                {images.map((src,i)=> (
                  <div 
                    key={i} 
                    className={`relative overflow-hidden ${
                      // Layout đặc biệt cho 3 ảnh: ảnh đầu chiếm 2 cột
                      images.length === 3 && i === 0 ? 'col-span-2 aspect-[2/1]' : 
                      // Layout thông thường
                      'aspect-square'
                    }`}
                  >
                    <img 
                      src={src} 
                      alt={`Ảnh ${i+1}`} 
                      className="h-full w-full object-cover rounded-lg border border-gray-200 shadow-sm" 
                    />
                    <div className="absolute top-1 right-1">
                      {/* Nút xóa ảnh */}
                      <button 
                        type="button" 
                        title="Xóa ảnh" 
                        className="bg-red-500/90 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow" 
                        onClick={()=>setImages(prev=>prev.filter((_,idx)=>idx!==i))}
                      >
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Thông báo validation */}
            <div className="text-xs text-gray-500 mt-2 p-2 border-l-4 border-blue-500 bg-blue-50">
              **Lưu ý:** Chỉ chấp nhận tối đa **4 ảnh** (JPG/PNG/WEBP). Kích thước tối đa mỗi ảnh: **5 MB**. Layout sẽ tự động điều chỉnh theo số lượng ảnh.
            </div>
          </div>



          {/* Chủ đề câu hỏi */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-600">Chủ đề câu hỏi*</label>
            <div className="grid grid-cols-2 gap-2">
              {TOPICS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setSelectedTopic(topic)}
                  className={`p-2 rounded-lg text-sm font-medium transition-colors border 
                    ${selectedTopic === topic 
                      ? 'bg-blue-500 text-white border-blue-500 shadow-md' 
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

        </div>
        
        {/* Footer Buttons (Mimics DialogFooter) */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
          {/* Thay thế Button (Hủy) */}
          <button 
            onClick={onClose} 
            className="px-4 py-2 rounded-lg font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300"
          >Hủy</button>
          {/* Thay thế Button (Đăng/Cập nhật) */}
          <button 
            onClick={handleSave} 
            // Button chính (Đăng/Cập nhật)
            className="px-4 py-2 rounded-lg font-medium transition-colors bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300"
            disabled={saving || !title.trim() || !selectedTopic.trim()} 
          >
{saving ? 'Đang lưu...' : (initial ? 'Cập nhật' : 'Đăng')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateEditPostModal;
