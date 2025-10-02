import React, { useState, useEffect, useRef } from 'react';
// SỬ DỤNG CÁC IMPORTS GỐC THEO YÊU CẦU CỦA BẠN
// Đã loại bỏ các import lỗi và thay thế bằng cấu trúc HTML/Tailwind nội tuyến
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
// import { Button } from '../../../components/ui/button';
import { X, Image as ImageIcon, Bold, Italic, Underline, Link, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

// Danh sách các Chủ đề
const TOPICS = [
  'Cơ khí', 'Công nghệ thông tin', 'Dịch', 'Du học Trung Quốc', 
  'Du lịch Trung Quốc', 'Góc chia sẻ', 'Học tiếng Trung', 'Khác', 
  'Tìm bạn học chung', 'Tìm gia sư tiếng Trung', 'Văn hóa Trung Quốc', 
  'Việc làm tiếng Trung', 'Xây dựng', 'Y tế'
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
  const [title, setTitle] = useState(initial?.title || '');
  // Nội dung Rich Text/HTML
  const [content, setContent] = useState(
    initial?.content?.html || initial?.content?.ops?.map((o: any) => o.insert).join('') || ''
  );
  // Mảng chứa URL/Blob URL của các ảnh đã tải lên (max 3)
  const [images, setImages] = useState<string[]>(initial?.images || []);
  // Bố cục ảnh, mặc định là 'single'
  const [frameType, setFrameType] = useState<'single'|'two'|'gallery'>(initial?.frameType || 'single');
  const [selectedTopic, setSelectedTopic] = useState<string>(initial?.topic || '');
  const [saving, setSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement|null>(null);
  
  useEffect(() => {
    if (initial) {
      setTitle(initial.title || '');
      setSelectedTopic(initial.topic || '');
      const rawContent = initial.content?.html || initial.content?.ops?.map((o: any) => o.insert).join('') || '';
      setContent(rawContent);
    }
  }, [initial]);
  
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
        images, 
        // Ràng buộc bố cục: Chỉ áp dụng khi có 2 ảnh trở lên, nếu không thì là 'single'
        frameType: images.length >= 2 ? frameType : 'single', 
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

  // Xử lý tải ảnh (với ràng buộc)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if(!files) return;
    const allowed = ['image/jpeg','image/jpg','image/png','image/webp'];
    const maxFiles = 3;
    const toAdd: string[] = [];
    for(let i=0;i<files.length;i++){
      const f = files[i];
      // Ràng buộc loại file
      if(!allowed.includes(f.type)) { console.warn('Lỗi ràng buộc: Chỉ chấp nhận JPG, PNG, WEBP.'); continue; }
      // Ràng buộc kích thước file (5MB)
      if(f.size > 5*1024*1024) { console.warn('Lỗi ràng buộc: Ảnh quá lớn. Tối đa 5MB mỗi ảnh.'); continue; }
      // Ràng buộc số lượng
      if(images.length + toAdd.length >= maxFiles) { console.warn('Lỗi ràng buộc: Đã đạt giới hạn 3 ảnh'); break; }
      
      toAdd.push(URL.createObjectURL(f));
    }
    setImages(prev => {
      const merged = [...prev, ...toAdd].slice(0,3);
      return merged;
    });
    // Reset input để cho phép tải lên cùng một file sau khi đã xóa
    e.target.value = '';
  };
  
  // Class CSS cho các kiểu khung hình ảnh xem trước dựa trên số lượng ảnh
  const imagePreviewGridClass = () => {
    if (images.length === 1) return 'grid-cols-1';
    // Khi có 2 ảnh trở lên, sử dụng frameType để mô phỏng bố cục
    if (images.length === 2) return frameType === 'two' ? 'grid-cols-2' : 'grid-cols-1';
    if (images.length >= 3) {
      if (frameType === 'two') return 'grid-cols-2'; // 2 cột (1 ảnh lớn, 2 ảnh nhỏ hoặc chia đều)
      return 'grid-cols-3'; // 3 cột chia đều (hoặc single/gallery)
    }
    return 'grid-cols-1';
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
                dangerouslySetInnerHTML={{ __html: content || 'Nội dung bổ sung cho câu hỏi' }} 
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
                  ${images.length >= 3 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`} 
                title={images.length >= 3 ? "Đã đạt giới hạn 3 ảnh" : "Tải lên tối đa 3 ảnh"}
              >
                <ImageIcon size={16} /> Tải ảnh
                <input 
                  type="file" 
                  id="image-upload" 
                  accept="image/jpeg,image/jpg,image/png,image/webp" 
                  multiple 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  disabled={images.length >= 3} 
                />
              </label>
            </div>
            
            {/* Xem trước ảnh */}
            {images.length > 0 && (
              <div className={`grid ${imagePreviewGridClass()} gap-2`}>
                {images.map((src,i)=> (
                  <div key={i} className={`relative aspect-square overflow-hidden ${images.length >= 3 && frameType === 'two' && i === 0 ? 'row-span-2 col-span-1 h-auto aspect-[4/3] sm:aspect-[4/5]' : ''}`}>
                    <img src={src} alt={`Ảnh ${i+1}`} className="h-full w-full object-cover rounded-lg border border-gray-200 shadow-sm" />
                    <div className="absolute top-1 right-1 flex gap-1">
                      {/* Nút xóa */}
                      <button type="button" title="Xóa ảnh" className="bg-red-500/90 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow" onClick={()=>setImages(prev=>prev.filter((_,idx)=>idx!==i))}><Trash2 size={16}/></button>
                    </div>
                  </div>
              ))}
              </div>
            )}

            {/* Chọn kiểu khung hình (RÀNG BUỘC: Chỉ hiện khi có 2 ảnh trở lên) */}
            {images.length >= 2 && (
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700">Chọn bố cục ảnh:</span>
                <button 
                  type="button"
                  className={"px-3 py-1 text-xs rounded transition-colors " + (frameType==='single'? 'bg-blue-100 text-blue-700 font-semibold':'bg-gray-200 text-gray-600 hover:bg-gray-300')} 
                  onClick={()=>setFrameType('single')}
                >Ảnh đơn (Tỷ lệ tự động)</button>
                <button 
                  type="button"
                  className={"px-3 py-1 text-xs rounded transition-colors " + (frameType==='two'? 'bg-blue-100 text-blue-700 font-semibold':'bg-gray-200 text-gray-600 hover:bg-gray-300')} 
                  onClick={()=>setFrameType('two')}
                >Chia 2 cột</button>
                <button 
                  type="button"
                  className={"px-3 py-1 text-xs rounded transition-colors " + (frameType==='gallery'? 'bg-blue-100 text-blue-700 font-semibold':'bg-gray-200 text-gray-600 hover:bg-gray-300')} 
                  onClick={()=>setFrameType('gallery')}
                >Chia đều (Grid)</button>
              </div>
            )}
            
            {/* Thông báo ràng buộc chuẩn */}
            <div className="text-xs text-gray-500 mt-2 p-2 border-l-4 border-yellow-500 bg-yellow-50">
              **RÀNG BUỘC:** Chỉ chấp nhận tối đa **3 ảnh** (JPG/PNG/WEBP). Kích thước tối đa mỗi ảnh: **5 MB**. Chức năng **Chọn bố cục ảnh** chỉ khả dụng khi bạn tải lên **2 ảnh trở lên**.
            </div>
          </div>

          {/* Khu vực Chủ đề câu hỏi (Giống giao diện Dark Mode cũ, nhưng đổi màu Light) */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-600">Chủ đề câu hỏi</label>
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
            {saving ? 'Đang đăng...' : (initial ? 'Cập nhật' : 'Đăng')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateEditPostModal;
