import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Eye, Pin, MoreVertical, Search, Filter, Sparkles, AlertTriangle } from 'lucide-react';

// Khai báo biến toàn cục cho API Key (bắt buộc)
const API_KEY = ""; 
const GEMINI_MODEL = "gemini-2.5-flash-preview-05-20";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;


// --- TYPE DEFINITIONS (DEFINED LOCALLY TO RESOLVE IMPORT ERRORS) ---
type Content = { html: string };
type Post = {
    id: string;
    user_id: string;
    title: string;
    content: Content;
    topic: string;
    likes: number;
    views: number;
    created_at: string;
    is_approved: boolean;
    is_pinned: boolean;
    deleted_at?: string;
    deleted_reason?: string;
    deleted_by?: string;
    updated_at?: string;
};
type User = {
    id: string;
    username: string;
    name: string;
    email: string;
    role: 'user' | 'admin' | 'super admin';
    is_active: boolean;
    isVerify: boolean;
    community_points: number;
    subscription_id: string;
    level: string;
    badge_level: number;
    language: string;
    created_at: string;
};
type BadgeLevel = { level: number; name: string; icon: string; };

// --- MOCK AUTH HOOK (DEFINED LOCALLY TO RESOLVE IMPORT ERRORS) ---
const mockUsers: User[] = [
  {
    id: 'user1',
    username: 'nguyenvana',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    role: 'user',
    is_active: true,
    isVerify: true,
    community_points: 1250,
    subscription_id: 'sub1',
    level: '3',
    badge_level: 2,
    language: 'Tiếng Việt',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'admin1',
    username: 'admin',
    name: 'Admin System',
    email: 'admin@echinese.com',
    role: 'admin',
    is_active: true,
    isVerify: true,
    community_points: 5000,
    subscription_id: 'sub2',
    level: '6',
    badge_level: 4,
    language: 'Tiếng Việt',
    created_at: '2023-10-01T08:00:00Z',
  },
  {
    id: 'user2',
    username: 'tranthib',
    name: 'Trần Thị B',
    email: 'tranthib@example.com',
    role: 'user',
    is_active: false,
    isVerify: true,
    community_points: 850,
    subscription_id: 'sub1',
    level: '2',
    badge_level: 1,
    language: 'Tiếng Việt',
    created_at: '2024-03-20T14:30:00Z',
  },
];

const useAuth = (): User => {
    // Trả về user admin để kiểm tra quyền admin
    return mockUsers.find(u => u.id === 'admin1') || mockUsers[0];
};

// --- API UTILITY FUNCTIONS (FOR GEMINI) ---

/**
 * Gọi API Gemini với backoff để xử lý giới hạn tốc độ.
 * @param payload Payload cho API generateContent
 * @param retries Số lần thử lại tối đa
 * @returns Phản hồi JSON từ API
 */
const fetchWithBackoff = async (payload: any, retries = 3): Promise<any> => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                return response.json();
            } else if (response.status === 429 && i < retries - 1) {
                // Xử lý Rate Limit: Exponential Backoff
                const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw new Error(`API call failed with status: ${response.status}`);
            }
        } catch (error) {
            if (i === retries - 1) throw error;
        }
    }
};

/**
 * Phân tích bài viết bằng Gemini: Tóm tắt và đề xuất chủ đề.
 */
const analyzePost = async (title: string, contentHtml: string): Promise<string> => {
    const prompt = `Phân tích bài viết sau.
    Tiêu đề: ${title}
    Nội dung (HTML đã được lọc): ${contentHtml.replace(/<[^>]*>/g, ' ')}
    
    Hãy đưa ra một bản tóm tắt ngắn gọn (tối đa 30 từ) và đề xuất 3 chủ đề liên quan (phân cách bằng dấu phẩy) mà bài viết có thể thuộc về.
    Định dạng phản hồi phải là:
    Tóm tắt: [Tóm tắt ở đây]
    Chủ đề đề xuất: [Chủ đề 1, Chủ đề 2, Chủ đề 3]
    `;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: {
            parts: [{ text: "Act as a helpful and professional community content analyst. Respond strictly in Vietnamese." }]
        },
    };

    try {
        const result = await fetchWithBackoff(payload);
        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        return text || "Không thể phân tích nội dung bài viết.";
    } catch (error) {
        console.error("Gemini API Error for Analysis:", error);
        return "Lỗi kết nối hoặc xử lý API Gemini.";
    }
};

/**
 * Đề xuất lý do gỡ bài viết dựa trên nội dung.
 */
const suggestRemovalReason = async (title: string, contentHtml: string): Promise<string> => {
    const prompt = `Phân tích nội dung sau và đưa ra một lý do gỡ bài viết giả định, chuyên nghiệp, dựa trên các quy tắc cộng đồng chung (ví dụ: spam, thông tin không liên quan, nội dung nhạy cảm, vi phạm bản quyền, v.v.).
    Tiêu đề: ${title}
    Nội dung (HTML đã được lọc): ${contentHtml.replace(/<[^>]*>/g, ' ')}
    
    Hãy đề xuất một lý do gỡ bài viết duy nhất, ngắn gọn (tối đa 10 từ) và phù hợp.
    Ví dụ: 'Nội dung quảng cáo không liên quan'
    `;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: {
            parts: [{ text: "Act as a strict and professional content moderator. Only provide the suggested reason text, without any introductory phrases or explanations. Respond strictly in Vietnamese." }]
        },
    };

    try {
        const result = await fetchWithBackoff(payload);
        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        // Loại bỏ ký tự xuống dòng hoặc khoảng trắng dư thừa
        return text?.trim() || "Không rõ lý do vi phạm.";
    } catch (error) {
        console.error("Gemini API Error for Removal Reason:", error);
        return "Lỗi kết nối API.";
    }
};


// --- MOCK MODAL COMPONENTS (WITH GEMINI INTEGRATION) ---

const allTopics = [
    'Cơ khí', 'CNTT', 'Dịch', 'Du học', 'Du lịch', 'Góc chia sẻ',
    'Tìm bạn học chung', 'Học tiếng Trung', 'Tìm gia sư', 'Việc làm',
    'Văn hóa', 'Thể thao', 'Xây dựng', 'Y tế', 'Tâm sự', 'Khác'
];

const CreateEditPostModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; content: { html: string }; topic: string }) => Promise<void>;
  initial?: Post;
}> = ({ isOpen, onClose, onSave, initial }) => {
  const [title, setTitle] = useState(initial?.title || '');
  const [content, setContent] = useState(initial?.content.html || '');
  const [topic, setTopic] = useState(initial?.topic || 'Góc chia sẻ');
  const isEditing = !!initial;
  
  // State cho tính năng Gemini Analysis
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setTitle(initial?.title || '');
      setContent(initial?.content.html || '');
      setTopic(initial?.topic || 'Góc chia sẻ');
      setAnalysisResult(''); // Reset
    }
  }, [isOpen, initial]);

  const handleAnalyze = async () => {
    if (!title.trim() && !content.trim()) {
        setAnalysisResult('Vui lòng nhập tiêu đề và nội dung để phân tích.');
        return;
    }
    setIsAnalyzing(true);
    setAnalysisResult('');
    const result = await analyzePost(title, content);
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSave({ title: title.trim(), content: { html: content.trim() }, topic }).then(() => {
      onClose();
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center backdrop-blur-sm">
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4 transform transition-all scale-100 ease-out duration-300">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Chỉnh sửa Bài viết' : 'Tạo Bài viết Mới'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label htmlFor="post-title" className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
            <input
              id="post-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
              placeholder="Nhập tiêu đề bài viết..."
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="post-topic" className="block text-sm font-medium text-gray-700 mb-1">Chủ đề Hiện tại</label>
            <select
              id="post-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white transition duration-150"
            >
              {allTopics.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="mb-6">
            <label htmlFor="post-content" className="block text-sm font-medium text-gray-700 mb-1">Nội dung (HTML hoặc Markdown)</label>
            <textarea
              id="post-content"
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none transition duration-150"
              placeholder="Chia sẻ suy nghĩ của bạn (có thể dùng thẻ HTML cơ bản)..."
              required
            />
          </div>

          {/* GEMINI QUICK ANALYSIS FEATURE */}
          <div className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <h4 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 fill-blue-500 text-blue-500" /> Phân tích Nhanh Bài viết
            </h4>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Đang phân tích...
                </>
              ) : (
                <>
                  Phân tích nội dung ✨
                </>
              )}
            </button>
            
            {analysisResult && (
                <div className="mt-3 p-3 bg-white border border-blue-300 rounded-md whitespace-pre-wrap text-sm text-gray-800">
                    {analysisResult}
                </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={!title.trim() || !content.trim()}
            >
              {isEditing ? 'Lưu Thay đổi' : 'Đăng Bài'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RemoveConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void>;
  requireReason: boolean;
  post: Post | null; // Cần post để truyền vào LLM
}> = ({ isOpen, onClose, onConfirm, requireReason, post }) => {
  const [reason, setReason] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);

  // Gemini Suggestion Feature
  const handleSuggestReason = async () => {
    if (!post) return;
    setIsSuggesting(true);
    const suggestedReason = await suggestRemovalReason(post.title, post.content.html);
    setReason(suggestedReason);
    setIsSuggesting(false);
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (requireReason && !reason.trim()) return;
    onConfirm(requireReason ? reason.trim() : undefined).then(() => {
      setReason('');
    });
  };

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center backdrop-blur-sm">
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-sm mx-4 transform transition-all scale-100 ease-out duration-300">
        <div className="p-6 border-b bg-red-50 flex justify-between items-center">
          <h3 className="text-xl font-bold text-red-700">Xác nhận Gỡ Bài viết</h3>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-red-100 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <form onSubmit={handleConfirm} className="p-6">
          <p className="text-gray-700 mb-4 font-semibold">
            Bài viết: <span className="italic font-normal">{post.title}</span>
          </p>
          <p className="text-gray-700 mb-4">
            Bạn có chắc chắn muốn gỡ bài viết này? Hành động này không thể hoàn tác.
          </p>
          {requireReason && (
            <div className="mb-4">
              <label htmlFor="remove-reason" className="block text-sm font-medium text-gray-700 mb-1 flex justify-between items-center">
                <span>Lý do gỡ (<span className="text-red-600">Bắt buộc</span>)</span>
                {/* GEMINI SUGGESTION BUTTON */}
                <button
                    type="button"
                    onClick={handleSuggestReason}
                    disabled={isSuggesting}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                    {isSuggesting ? (
                        <svg className="animate-spin h-3 w-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                        <Sparkles className="w-3 h-3 fill-blue-500 text-blue-500" />
                    )}
                    Đề xuất Lý do
                </button>
              </label>
              <textarea
                id="remove-reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 resize-none transition duration-150"
                placeholder="Nêu rõ lý do gỡ bài..."
                required={requireReason}
              />
            </div>
          )}
          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              disabled={requireReason && !reason.trim()}
            >
              Gỡ Bài viết
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- MOCK DATA ---

const mockBadgeLevels: BadgeLevel[] = [
  { level: 0, name: 'Người mới', icon: '🌱' },
  { level: 1, name: 'Học viên', icon: '📚' },
  { level: 2, name: 'Thành thạo', icon: '⭐' },
  { level: 3, name: 'Chuyên gia', icon: '🏆' },
  { level: 4, name: 'Quản trị viên', icon: '👑' },
];

const longPostContent = {
    html: `
        <p>Đây là một đoạn nội dung rất dài để minh họa cho tính năng "Xem thêm" (Read More). Chúng ta cần đảm bảo rằng khi nội dung vượt quá một chiều cao nhất định, nó sẽ bị ẩn đi một phần và hiển thị nút để người dùng có thể nhấp vào xem toàn bộ.</p>
        <p>Việc quản lý một cộng đồng trực tuyến đòi hỏi sự cân bằng giữa tự do ngôn luận và duy trì một môi trường an toàn, tích cực. Các quản trị viên phải đối mặt với nhiều thách thức, bao gồm việc kiểm duyệt nội dung, xử lý spam, giải quyết xung đột giữa các thành viên, và đảm bảo tuân thủ các quy tắc của cộng đồng. Hệ thống quản trị cần phải có công cụ mạnh mẽ để thực hiện các nhiệm vụ này một cách hiệu quả và minh bạch.</p>
        <p>Tính năng Gemini Analysis giúp phân loại chủ đề nhanh chóng và đưa ra tóm tắt, tiết kiệm thời gian đáng kể cho admin. Khi một bài viết mới được đăng tải, thay vì phải đọc kỹ toàn bộ, admin chỉ cần xem tóm tắt và các chủ đề đề xuất, sau đó đưa ra quyết định duyệt bài hoặc phân loại.</p>
        <p>Ngược lại, tính năng Suggest Removal Reason sử dụng LLM để tạo ra một lý do gỡ bài viết chuyên nghiệp và chính xác dựa trên nội dung bị vi phạm. Điều này không chỉ giúp admin nhanh chóng hoàn thành công việc mà còn đảm bảo sự công bằng và nhất quán trong việc áp dụng các quy tắc cộng đồng. Sự rõ ràng trong lý do gỡ bài cũng giúp người dùng hiểu rõ hơn về lỗi vi phạm của mình và tránh tái phạm trong tương lai.</p>
        <p>Dù là phân tích tích cực hay tiêu cực, việc sử dụng trí tuệ nhân tạo trong quy trình kiểm duyệt nội dung cộng đồng là một xu hướng tất yếu, giúp tăng cường hiệu suất và giảm bớt gánh nặng công việc thủ công cho đội ngũ quản trị.</p>
        <p>Tóm lại, việc tối ưu hóa giao diện người dùng bằng cách thêm nút "Xem thêm" cho nội dung dài và chuẩn hóa quy trình kiểm duyệt bằng AI đều là những bước đi quan trọng nhằm xây dựng một cộng đồng lành mạnh và dễ sử dụng. Hy vọng bạn sẽ thích các cập nhật này!</p>
    `
};

const mockPosts: Post[] = [
  {
    id: 'post1',
    user_id: 'admin1',
    title: 'Chào mừng đến với cộng đồng EChinese! (Bài viết ghim)',
    content: {
      html: '<p><strong>Chào mừng</strong> tất cả mọi người đến với cộng đồng học tiếng Trung EChinese! 🎉</p><p>Đây là nơi các bạn có thể:</p><ul><li>Chia sẻ kinh nghiệm học tập</li><li>Đặt câu hỏi và nhận được sự hỗ trợ</li><li>Kết nối với những người cùng đam mê</li></ul><p>Chúc các bạn học tập hiệu quả! 加油! 💪</p>'
    },
    topic: 'Góc chia sẻ',
    likes: 24,
    views: 156,
    created_at: '2025-10-02T08:30:00Z',
    is_approved: true,
    is_pinned: true,
  },
  {
    id: 'post_long',
    user_id: 'user1',
    title: 'Phân tích về vai trò của AI trong kiểm duyệt nội dung cộng đồng (Bài viết dài)',
    content: longPostContent,
    topic: 'CNTT',
    likes: 18,
    views: 89,
    created_at: '2025-10-02T07:15:00Z',
    is_approved: true,
    is_pinned: false,
  },
  {
    id: 'post3',
    user_id: 'user2',
    title: 'Tìm bạn học chung tại Hà Nội (Đã Gỡ)',
    content: {
      html: '<p>Mình đang ở Hà Nội và đang học HSK 4. Muốn tìm bạn học chung để:</p><ul><li>Luyện nói tiếng Trung với nhau</li><li>Chia sẻ tài liệu học tập</li><li>Động viên nhau trong quá trình học</li></ul><p>Ai có nhu cầu thì inbox mình nhé! 📚✨</p>'
    },
    topic: 'Tìm bạn học chung',
    likes: 7,
    views: 34,
    created_at: '2025-10-01T19:45:00Z',
    is_approved: true,
    is_pinned: false,
    deleted_at: '2025-10-02T09:00:00Z',
    deleted_reason: 'Vi phạm quy định đăng thông tin liên lạc',
    deleted_by: 'admin1',
  },
  {
    id: 'post4',
    user_id: 'user1',
    title: 'Review khóa học tiếng Trung online',
    content: {
      html: '<p>Vừa hoàn thành khóa học <em>Tiếng Trung cơ bản</em> và muốn review:</p><p><strong>Điểm tốt:</strong></p><ul><li>Giáo viên nhiệt tình, phát âm chuẩn</li><li>Tài liệu phong phú, có video minh họa</li><li>Lịch học linh hoạt</li></ul><p><strong>Điểm cần cải thiện:</strong></p><ul><li>Thiếu bài tập thực hành</li><li>Chưa có nhiều hoạt động tương tác</li></ul><p>Tổng thể: <strong>4/5 ⭐</strong></p>'
    },
    topic: 'Khác',
    likes: 12,
    views: 67,
    created_at: '2025-10-01T14:20:00Z',
    is_approved: true,
    is_pinned: false,
  },
];

// --- HELPER FUNCTIONS ---

const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const past = new Date(dateString);
  const diff = now.getTime() - past.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  return `${days} ngày trước`;
};

// --- POST CARD COMPONENT ---

const PostCard: React.FC<{
  post: Post;
  user: User;
  badge: BadgeLevel;
  onToggleLike: (postId: string, isLiked: boolean) => void; // Thay đổi để xử lý logic toggle
  onToggleView: (postId: string, isViewed: boolean) => void; // Thay đổi để xử lý logic toggle
  onComment: () => void;
  onPin?: () => void;
  onUnpin?: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
}> = ({ post, user, badge, onToggleLike, onToggleView, onComment, onPin, onUnpin, onEdit, onRemove }) => {
  const currentUser = useAuth();
  // Sử dụng state cục bộ cho trạng thái tương tác của người dùng hiện tại
  const [liked, setLiked] = useState(false);
  const [viewed, setViewed] = useState(false);
  
  // State cho tính năng Xem thêm
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  
  const MAX_HEIGHT_PX = 150; // Giới hạn chiều cao ban đầu
  
  // Logic kiểm tra nội dung có bị tràn hay không
  useEffect(() => {
    if (contentRef.current) {
      // Kiểm tra nếu chiều cao thực tế lớn hơn chiều cao giới hạn
      const isContentOverflowing = contentRef.current.scrollHeight > MAX_HEIGHT_PX;
      setIsOverflowing(isContentOverflowing);
    }
  }, [post.content.html]); // Chạy lại khi nội dung thay đổi

  const isOwner = currentUser?.id === post.user_id;
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super admin';
  
  const handleToggleLike = () => {
    const newLikedState = !liked;
    setLiked(newLikedState);
    onToggleLike(post.id, newLikedState); 
  };
  
  const handleToggleView = () => {
    const newViewedState = !viewed;
    setViewed(newViewedState);
    onToggleView(post.id, newViewedState);
  };

  const isDeleted = !!post.deleted_at;

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${isDeleted ? 'opacity-60' : ''}`}>
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              {!user.is_active && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border-2 border-white" title="Tài khoản bị khóa">
                  <span className="text-white text-xs font-bold leading-none">!</span>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 hover:underline cursor-pointer">
                  {user.name}
                </span>
                <span className="text-lg" title={badge.name}>
                  {badge.icon}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <span className="font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer">#{post.topic}</span>
                <span>•</span>
                <span>{formatTimeAgo(post.created_at)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {post.is_pinned && (
              <div className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold shadow-sm">
                <Pin className="w-3 h-3 fill-orange-500" />
                <span>Đã ghim</span>
              </div>
            )}
            
            {(isOwner || isAdmin) && (
              <div className="relative group">
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-500" />
                </button>
                
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  {isAdmin && !isDeleted && (
                    <>
                      {post.is_pinned ? (
                        <button onClick={onUnpin} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                          <Pin className="w-4 h-4 text-orange-500" />
                          Bỏ ghim
                        </button>
                      ) : (
                        <button onClick={onPin} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                          <Pin className="w-4 h-4 text-orange-500" />
                          Ghim bài viết
                        </button>
                      )}
                    </>
                  )}
                  {isOwner && !isDeleted && (
                    <button onClick={onEdit} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7-7l-4 4-2 2v4h4l2-2 4-4m-7-7l4 4"></path></svg>
                      Chỉnh sửa
                    </button>
                  )}
                  {(isOwner || isAdmin) && !isDeleted && (
                    <button onClick={onRemove} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      Gỡ bài viết
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {post.title}
        </h3>
        
        {/* NỘI DUNG BÀI VIẾT (VỚI TÍNH NĂNG XEM THÊM) */}
        <div className="relative">
          <div 
            ref={contentRef}
            className={`text-gray-700 prose prose-sm max-w-none leading-relaxed transition-all duration-500 overflow-hidden ${
              isExpanded ? 'max-h-full' : `max-h-[${MAX_HEIGHT_PX}px]` // Giới hạn chiều cao
            }`}
            dangerouslySetInnerHTML={{ __html: post.content.html || '' }}
          />
          
          {/* NÚT XEM THÊM/THU GỌN */}
          {isOverflowing && !isExpanded && (
            <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-white to-transparent pt-8 flex justify-center">
              <button 
                onClick={() => setIsExpanded(true)}
                className="text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors"
              >
                Xem thêm...
              </button>
            </div>
          )}
          
          {isExpanded && isOverflowing && (
            <div className="mt-3 flex justify-center">
              <button 
                onClick={() => setIsExpanded(false)}
                className="text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors"
              >
                Thu gọn
              </button>
            </div>
          )}
        </div>
        {/* KẾT THÚC NỘI DUNG BÀI VIẾT */}
        
        {isDeleted && (
          <div className="mt-4 p-4 bg-red-50 border border-red-300 rounded-lg shadow-inner">
            <p className="text-red-700 text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 fill-red-500 text-red-500" />
              Bài viết đã bị gỡ: <span className="font-normal italic">{post.deleted_reason}</span>
            </p>
          </div>
        )}
      </div>
      
      {!isDeleted && (
        <>
          <div className="px-4 py-2 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
            <div className="flex items-center gap-4">
              {post.likes > 0 && (
                <span className="flex items-center gap-1 font-medium">
                  <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  {post.likes + (liked ? 1 : 0)} Lượt thích
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="font-medium">{post.views + (viewed ? 1 : 0)} lượt xem</span>
            </div>
          </div>
          
          <div className="px-4 py-3 border-t border-gray-100 grid grid-cols-3 gap-2">
            {/* NÚT THÍCH/BỎ THÍCH (TOGGLE LIKE) */}
            <button
              onClick={handleToggleLike}
              className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors transform hover:scale-[1.02] active:scale-[0.98] ${
                liked 
                  ? 'text-red-600 bg-red-100 hover:bg-red-200 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
              <span>{liked ? 'Bỏ thích' : 'Thích'}</span> 
            </button>
            
            <button
              onClick={onComment}
              className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors text-gray-600 hover:bg-gray-100 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Bình luận</span>
            </button>
            
            {/* NÚT XEM/ĐÃ XEM (TOGGLE VIEW) */}
            <button
              onClick={handleToggleView}
              className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors transform hover:scale-[1.02] active:scale-[0.98] ${
                viewed 
                  ? 'text-blue-600 bg-blue-100 hover:bg-blue-200 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Eye className={`w-5 h-5 ${viewed ? 'fill-current' : ''}`} />
              <span>{viewed ? 'Đã xem' : 'Xem'}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// --- MAIN COMPONENT ---

const AdminCommunityPage: React.FC = () => {
  const currentUser = useAuth(); // Sử dụng mock useAuth
  const [posts, setPosts] = useState(mockPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState<string>('');
  const [editOpen, setEditOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<Post | null>(null);

  const getUserById = (userId: string): User => {
    return mockUsers.find(u => u.id === userId) || mockUsers[0];
  };

  const getBadgeByLevel = (level: number): BadgeLevel => {
    return mockBadgeLevels.find(b => b.level === level) || mockBadgeLevels[0];
  };

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = !searchQuery || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.html?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTopic = !topicFilter || post.topic === topicFilter;
      
      return matchesSearch && matchesTopic;
    }).sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [posts, searchQuery, topicFilter]);

  // Xử lý logic Toggle Like
  const handleToggleLike = (postId: string, isLiked: boolean) => {
    setPosts(prev => prev.map(p => {
        if (p.id === postId) {
            // Tăng/Giảm likes dựa trên trạng thái mới
            return { ...p, likes: p.likes + (isLiked ? 1 : -1) };
        }
        return p;
    }));
  };

  // Xử lý logic Toggle View
  const handleToggleView = (postId: string, isViewed: boolean) => {
    setPosts(prev => prev.map(p => {
        if (p.id === postId) {
            // Tăng/Giảm views dựa trên trạng thái mới
            return { ...p, views: p.views + (isViewed ? 1 : -1) };
        }
        return p;
    }));
  };

  const handlePin = (postId: string) => {
    setPosts(prev => prev.map(p => 
      p.id === postId ? { ...p, is_pinned: true } : p
    ));
  };

  const handleUnpin = (postId: string) => {
    setPosts(prev => prev.map(p => 
      p.id === postId ? { ...p, is_pinned: false } : p
    ));
  };

  const handleRemove = (post: Post) => {
    setConfirmTarget(post);
    setConfirmOpen(true);
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setEditOpen(true);
  };

  const doRemove = async (reason?: string) => {
    if (!confirmTarget) return;
    
    setPosts(prev => prev.map(p => 
      p.id === confirmTarget.id 
        ? { 
            ...p, 
            deleted_at: new Date().toISOString(),
            deleted_reason: reason || 'Không có lý do',
            deleted_by: currentUser.id
          } 
        : p
    ));
    
    setConfirmOpen(false);
    setConfirmTarget(null);
  };

  const doSavePost = async (data: any) => {
    if (editingPost) {
      setPosts(prev => prev.map(p => 
        p.id === editingPost.id 
          ? { ...p, ...data, updated_at: new Date().toISOString() }
          : p
      ));
    } else {
      const newPost: Post = {
        id: `post${Date.now()}`,
        user_id: currentUser.id, // Sử dụng ID của admin hiện tại
        title: data.title,
        content: data.content,
        topic: data.topic,
        likes: 0,
        views: 0,
        created_at: new Date().toISOString(),
        is_approved: true,
        is_pinned: false,
      };
      setPosts(prev => [newPost, ...prev]);
    }
    
    setEditOpen(false);
    setEditingPost(null);
  };
  
  // Topics for filtering and modal
  const topics = allTopics;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content & Posts */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2 border-b-2 border-blue-500 inline-block pb-1">Nội dung Cộng đồng</h1>
              <p className="text-gray-600 text-lg">Quản lý và kiểm duyệt các bài viết trong cộng đồng EChinese</p>
            </div>

            {/* Create Post Widget */}
            <div className="bg-white rounded-xl shadow-lg p-5 mb-8 border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-teal-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={() => { setEditingPost(null); setEditOpen(true); }}
                  className="flex-1 text-left px-5 py-3 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors shadow-inner"
                >
                  <span className="font-medium">Bạn đang nghĩ gì...? (Tạo bài viết mới)</span>
                </button>
              </div>
            </div>

            {/* Post List */}
            <div className="space-y-6">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-lg text-gray-500 border border-gray-200">
                  <p className="text-lg font-medium">Không có bài viết nào phù hợp với bộ lọc.</p>
                  <p className="text-sm">Hãy thử thay đổi điều kiện tìm kiếm hoặc lọc chủ đề.</p>
                </div>
              ) : (
                filteredPosts.map(post => {
                  const user = getUserById(post.user_id);
                  const badge = getBadgeByLevel(user.badge_level);
                  
                  return (
                    <PostCard
                      key={post.id}
                      post={post}
                      user={user}
                      badge={badge}
                      onToggleLike={handleToggleLike} // Truyền hàm toggle
                      onToggleView={handleToggleView} // Truyền hàm toggle
                      onComment={() => console.log('Comment on', post.id)}
                      onPin={() => handlePin(post.id)}
                      onUnpin={() => handleUnpin(post.id)}
                      onEdit={() => handleEdit(post)}
                      onRemove={() => handleRemove(post)}
                    />
                  );
                })
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Search Card */}
            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-xl text-gray-900">Tìm kiếm Nhanh</h3>
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề, nội dung..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
              />
            </div>

            {/* Filter Card */}
            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-5 h-5 text-teal-500" />
                <h3 className="font-bold text-xl text-gray-900">Lọc theo Chủ đề</h3>
              </div>
              <select
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-white appearance-none transition duration-150"
              >
                <option value="">Tất cả chủ đề</option>
                {topics.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>

            {/* Statistics Card */}
            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
              <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002-2h2a2 2 0 002 2M6 20v-2a2 2 0 012-2h3a2 2 0 012 2v2M4 14h16m-7-9h-2a2 2 0 00-2 2v4a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2z"></path></svg>
                Thống kê Cộng đồng
              </h3>
              <div className="space-y-3 text-base">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-600 font-medium">Tổng Bài viết:</span>
                  <span className="font-extrabold text-blue-600 text-lg">{posts.length}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-600 font-medium">Đã được Ghim:</span>
                  <span className="font-extrabold text-orange-600 text-lg">
                    {posts.filter(p => p.is_pinned).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Bài viết Đã Gỡ:</span>
                  <span className="font-extrabold text-red-600 text-lg">
                    {posts.filter(p => p.deleted_at).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateEditPostModal
        isOpen={editOpen}
        onClose={() => { setEditOpen(false); setEditingPost(null); }}
        onSave={doSavePost}
        initial={editingPost || undefined}
      />

      <RemoveConfirmModal
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setConfirmTarget(null); }}
        onConfirm={doRemove}
        // Admin phải nhập lý do nếu gỡ bài của người khác (currentUser.id != confirmTarget.user_id)
        requireReason={currentUser.id !== confirmTarget?.user_id} 
        post={confirmTarget}
      />
    </div>
  );
};

export default AdminCommunityPage;
