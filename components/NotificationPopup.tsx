import React, { useEffect, useState } from 'react';
import { X, Bell } from 'lucide-react';

interface NotificationPayload {
  notification?: {
    title?: string;
    body?: string;
  };
  data?: {
    redirect_url?: string;
    type?: string;
    post_id?: string;
    [key: string]: any;
  };
}

interface NotificationPopupProps {
  payload: NotificationPayload | null;
  onClose: () => void;
  onNavigate?: (url: string) => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ payload, onClose, onNavigate }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Hàm decode HTML entities và loại bỏ thẻ HTML
  const decodeHtmlEntities = (text: string): string => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  // Hàm convert HTML thành văn bản thuần và cắt ngắn
  const htmlToPlainText = (html: string, maxLength: number = 150): string => {
    // Decode HTML entities trước
    const decoded = decodeHtmlEntities(html);
    
    // Tạo element tạm để parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = decoded;
    
    // Lấy text content (loại bỏ tất cả thẻ HTML)
    let text = temp.textContent || temp.innerText || '';
    
    // Loại bỏ khoảng trắng thừa và xuống dòng
    text = text.replace(/\s+/g, ' ').trim();
    
    // Cắt ngắn nếu quá dài
    if (text.length > maxLength) {
      text = text.substring(0, maxLength) + '...';
    }
    
    return text;
  };

  // Lấy content từ payload
  const getContent = (): string => {
    // Thử nhiều nguồn khác nhau
    const sources = [
      payload?.data?.content,
      payload?.data?.message,
      payload?.data?.body,
      payload?.notification?.body,
      ''
    ];
    
    // Lấy nguồn đầu tiên có giá trị
    for (const source of sources) {
      if (!source) continue;
      
      // Nếu source là object có thuộc tính html
      if (typeof source === 'object' && (source as any).html) {
        return (source as any).html;
      }
      
      // Nếu source là string
      if (typeof source === 'string' && source.trim()) {
        return source;
      }
    }
    
    return 'Bạn có một thông báo mới';
  };

  useEffect(() => {
    console.log('🎨 [NotificationPopup] useEffect triggered, payload:', payload);
    
    if (payload) {
      console.log('✅ [NotificationPopup] Payload exists, showing popup');
      console.log('📋 [NotificationPopup] Title:', payload.notification?.title);
      console.log('📋 [NotificationPopup] Body:', payload.notification?.body);
      console.log('📋 [NotificationPopup] Data:', payload.data);
      console.log('📋 [NotificationPopup] Content from getContent():', getContent());
      console.log('📋 [NotificationPopup] Plain text:', htmlToPlainText(getContent()));
      
      setIsVisible(true);
      console.log('✅ [NotificationPopup] isVisible set to true');
      
      // Tự động đóng sau 10 giây
      const timer = setTimeout(() => {
        console.log('⏰ [NotificationPopup] Auto-closing after 10 seconds');
        handleClose();
      }, 10000);

      return () => {
        console.log('🧹 [NotificationPopup] Cleaning up timer');
        clearTimeout(timer);
      };
    } else {
      console.log('⚠️ [NotificationPopup] No payload, hiding popup');
    }
  }, [payload]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Đợi animation kết thúc
  };

  const handleClick = async () => {
    if (onNavigate) {
      // Lấy notification ID từ payload
      const notificationId = payload?.data?.notification_id || payload?.data?.id;
      
      // Nếu có notification ID, chuyển đến trang Trung tâm Kiểm duyệt & Thông báo, tab Thông báo
      if (notificationId) {
        onNavigate(`/reports?tab=notifications&notificationId=${notificationId}`);
        handleClose();
        return;
      }

      // Fallback: chuyển đến trang Trung tâm Kiểm duyệt & Thông báo, tab Thông báo
      onNavigate('/reports?tab=notifications');
    }
    handleClose();
  };

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'community':
        return '💬';
      case 'achievement':
        return '🏆';
      case 'subscription':
        return '💎';
      case 'system':
        return '🔔';
      default:
        return '🔔';
    }
  };

  if (!payload) {
    console.log('🚫 [NotificationPopup] Render: No payload, returning null');
    return null;
  }

  console.log('🎨 [NotificationPopup] Rendering popup with isVisible:', isVisible);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pointer-events-none">
      <div
        className={`pointer-events-auto w-full max-w-sm transition-all duration-300 transform ${
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
      >
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">Thông báo mới</span>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div
            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={handleClick}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 text-3xl">
                {getNotificationIcon(payload.data?.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  {payload.notification?.title || 'Thông báo'}
                </h3>
                <div className="mt-2">
                  <span className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                    Nhấn để xem chi tiết →
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-gray-100">
            <div
              className="h-full bg-blue-500 transition-all duration-[10000ms] ease-linear"
              style={{ width: isVisible ? '0%' : '100%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;
