import type { Tip } from '../types/entities';

/**
 * Mock data cho Tips - Mẹo học tiếng Trung
 * Bao gồm các chủ đề khác nhau với rich text content
 */

export const mockTips: Tip[] = [
  // ========== CÂUI ĐỐ ==========
  {
    id: '1',
    topic: 'Câu đố',
    level: 'Sơ cấp',
    content: {
      html: '<div><p><strong>Câu đố thanh điệu:</strong></p><p>Một từ tiếng Trung có 4 thanh điệu khác nhau, nghĩa hoàn toàn khác nhau:</p><ul><li style="color: #e53e3e;"><strong>mā</strong> (妈) - Mẹ</li><li style="color: #3182ce;"><strong>má</strong> (麻) - Gai, thô ráp</li><li style="color: #38a169;"><strong>mǎ</strong> (马) - Ngựa</li><li style="color: #d69e2e;"><strong>mà</strong> (骂) - Chửi mắng</li></ul><p>❓ <em>Bạn có biết từ nào khác cũng có 4 thanh điệu như thế này không?</em></p></div>',
      ops: [{ insert: 'Câu đố thanh điệu với từ "ma"' }]
    },
    answer: 'Còn có từ "bā bá bǎ bà" (八、拔、把、爸) và nhiều từ khác nữa!',
    is_pinned: true,
    created_by: 'admin-001'
  },

  {
    id: '2', 
    topic: 'Câu đố',
    level: 'Trung cấp',
    content: {
      html: '<div><p>🧩 <strong>Câu đố chữ Hán:</strong></p><p>Một chữ Hán khi thêm bộ thủ khác nhau sẽ có nghĩa hoàn toàn khác:</p><p style="text-align: center; font-size: 18px;"><strong>羊</strong> (dương - con cừu)</p><p>Thêm bộ thủ:</p><ul><li><strong>氵+ 羊 = 洋</strong> (dương - đại dương)</li><li><strong>艹+ 羊 = 芊</strong> (thiên - cỏ tươi tốt)</li><li><strong>示+ 羊 = 祥</strong> (tường - may mắn)</li><li><strong>鱼+ 羊 = 鲜</strong> (tiên - tươi ngon)</li></ul><p><em>Thật thú vị phải không? 🤔</em></p></div>',
      ops: [{ insert: 'Câu đố bộ thủ và chữ Hán' }]
    },
    answer: 'Đây là cách tạo từ điển hình trong tiếng Trung! Một chữ gốc + bộ thủ = nghĩa mới.',
    is_pinned: false,
    created_by: 'admin-002'
  },

  {
    id: '3',
    topic: 'Câu đố', 
    level: 'Cao cấp',
    content: {
      html: '<div><p>🎯 <strong>Câu đố thành ngữ:</strong></p><p>Đoán thành ngữ tiếng Trung từ hình ảnh miêu tả:</p><blockquote style="border-left: 4px solid #3182ce; padding-left: 16px; margin: 16px 0; font-style: italic;"><p>"Một con rồng bay trong mây, một con phượng hoàng nhảy múa"</p></blockquote><p>💡 <strong>Gợi ý:</strong> Thành ngữ này dùng để miêu tả những người tài năng xuất chúng, vượt trội hơn người khác.</p><p style="color: #e53e3e;">🤔 <em>Thành ngữ này là gì?</em></p></div>',
      ops: [{ insert: 'Câu đố thành ngữ rồng phượng' }]
    },
    answer: '龙飞凤舞 (lóng fēi fèng wǔ) - Rồng bay phượng múa. Dùng để miêu tả chữ viết đẹp như rồng bay phượng múa, hoặc người tài năng xuất chúng.',
    is_pinned: true,
    created_by: 'admin-001'
  },

  // ========== NGỮ PHÁP ==========
  {
    id: '4',
    topic: 'Ngữ pháp',
    level: 'Sơ cấp', 
    content: {
      html: '<div><p><strong>💡 Mẹo nhớ trật tự từ trong câu tiếng Trung:</strong></p><p style="background-color: #f7fafc; padding: 12px; border-radius: 8px;"><strong>Chủ ngữ + Thời gian + Địa điểm + Cách thức + Động từ + Tân ngữ</strong></p><p><strong>Ví dụ:</strong></p><p style="text-align: center; color: #2d3748; font-size: 16px;">我 今天 在学校 认真地 学习 中文</p><p style="text-align: center; color: #718096;">Tôi hôm nay ở trường một cách chăm chỉ học tiếng Trung</p><p><em>Ghi nhớ: <strong>T-T-Đ-C-Đ-T</strong> (Thời gian - Địa điểm - Cách thức luôn đứng trước động từ!)</em></p></div>',
      ops: [{ insert: 'Mẹo nhớ trật tự từ trong câu' }]
    },
    is_pinned: true,
    created_by: 'admin-003'
  },

  {
    id: '5',
    topic: 'Ngữ pháp',
    level: 'Trung cấp',
    content: {
      html: '<div><p><strong>🔑 Phân biệt 的, 地, 得:</strong></p><table style="width: 100%; border-collapse: collapse; margin: 16px 0;"><tr style="background-color: #edf2f7;"><td style="padding: 8px; border: 1px solid #cbd5e0; font-weight: bold;">Chữ</td><td style="padding: 8px; border: 1px solid #cbd5e0; font-weight: bold;">Vị trí</td><td style="padding: 8px; border: 1px solid #cbd5e0; font-weight: bold;">Ví dụ</td></tr><tr><td style="padding: 8px; border: 1px solid #cbd5e0; color: #e53e3e;"><strong>的</strong></td><td style="padding: 8px; border: 1px solid #cbd5e0;">Tính từ + 的 + Danh từ</td><td style="padding: 8px; border: 1px solid #cbd5e0;">漂亮<strong>的</strong>女孩</td></tr><tr style="background-color: #f7fafc;"><td style="padding: 8px; border: 1px solid #cbd5e0; color: #3182ce;"><strong>地</strong></td><td style="padding: 8px; border: 1px solid #cbd5e0;">Trạng từ + 地 + Động từ</td><td style="padding: 8px; border: 1px solid #cbd5e0;">快乐<strong>地</strong>唱歌</td></tr><tr><td style="padding: 8px; border: 1px solid #cbd5e0; color: #38a169;"><strong>得</strong></td><td style="padding: 8px; border: 1px solid #cbd5e0;">Động từ + 得 + Kết quả</td><td style="padding: 8px; border: 1px solid #cbd5e0;">跑<strong>得</strong>很快</td></tr></table><p><em>Nhớ: 的地得 = Đ-Đ-Đ (Định-Động-Động)! 🎯</em></p></div>',
      ops: [{ insert: 'Phân biệt 的地得' }]
    },
    is_pinned: false,
    created_by: 'admin-002'
  },

  // ========== TỪ VỰNG ==========
  {
    id: '6',
    topic: 'Từ vựng',
    level: 'Sơ cấp',
    content: {
      html: '<div><p><strong>🌈 Mẹo nhớ màu sắc tiếng Trung:</strong></p><p>Liên tưởng qua hình ảnh cụ thể:</p><ul><li style="color: #e53e3e;"><strong>红 (hóng)</strong> - Đỏ như <em>hồng</em> táo 🍎</li><li style="color: #3182ce;"><strong>蓝 (lán)</strong> - Xanh như <em>làn</em> nước biển 🌊</li><li style="color: #38a169;"><strong>绿 (lǜ)</strong> - Xanh lá như <em>lục</em> bình 🌿</li><li style="color: #d69e2e;"><strong>黄 (huáng)</strong> - Vàng như <em>hoàng</em> kim 👑</li><li style="color: #553c9a;"><strong>紫 (zǐ)</strong> - Tím như quả <em>chỉ</em> (nho) 🍇</li></ul><p style="background-color: #f0fff4; padding: 8px; border-radius: 6px;"><em>💡 Tip: Liên kết với tiếng Việt để nhớ lâu hơn!</em></p></div>',
      ops: [{ insert: 'Mẹo nhớ màu sắc' }]
    },
    is_pinned: false,
    created_by: 'admin-001'
  },

  // ========== PHÁT ÂM ==========
  {
    id: '7',
    topic: 'Phát âm', 
    level: 'Trung cấp',
    content: {
      html: '<div><p><strong>🎵 Luyện thanh điệu qua bài hát:</strong></p><p>Sử dụng giai điệu quen thuộc để nhớ 4 thanh điệu:</p><div style="background-color: #fffaf0; padding: 16px; border-radius: 8px; border-left: 4px solid #ed8936;"><p><strong>Bài "Twinkle Twinkle Little Star":</strong></p><p style="font-size: 18px; line-height: 1.8;">mā má mǎ mà<br/>mē mé mě mè<br/>mī mí mǐ mì<br/>mō mó mǒ mò</p></div><p><strong>Cách luyện:</strong></p><ol><li>Hát theo giai điệu quen thuộc</li><li>Tăng giảm âm theo thanh điệu</li><li>Lặp lại 5-10 lần mỗi ngày</li><li>Thay đổi phụ âm (b, p, d, t...)</li></ol><p><em>🎤 Luyện đều đặn sẽ cải thiện thanh điệu rõ rệt!</em></p></div>',
      ops: [{ insert: 'Luyện thanh điệu qua bài hát' }]
    },
    is_pinned: true,
    created_by: 'admin-003'
  },

  // ========== VĂN HÓA ==========
  {
    id: '8',
    topic: 'Văn hóa',
    level: 'Cao cấp',
    content: {
      html: '<div><p><strong>🧧 Văn hóa số trong tiếng Trung:</strong></p><p><strong>Số may mắn:</strong></p><ul><li><strong style="color: #e53e3e;">8 (八 bā)</strong> - Phát tài, thịnh vượng</li><li><strong style="color: #38a169;">6 (六 liù)</strong> - Thuận lợi, suôn sẻ</li><li><strong style="color: #d69e2e;">9 (九 jiǔ)</strong> - Lâu dài, vĩnh cửu</li></ul><p><strong>Số xui xẻo:</strong></p><ul><li><strong style="color: #718096;">4 (四 sì)</strong> - Giống âm "死" (chết)</li></ul><p><strong>Combo số đặc biệt:</strong></p><div style="background-color: #fef5e7; padding: 12px; border-radius: 6px;"><p><strong>168</strong> - Suốt đời phát tài 一路发</p><p><strong>888</strong> - Phát phát phát 发发发</p><p><strong>520</strong> - Tôi yêu bạn 我爱你 (wǒ ài nǐ)</p></div><p><em>💡 Hiểu văn hóa số giúp giao tiếp tự nhiên hơn!</em></p></div>',
      ops: [{ insert: 'Văn hóa số trong tiếng Trung' }]
    },
    is_pinned: false,
    created_by: 'admin-002'
  },

  // ========== HSK ==========
  {
    id: '9',
    topic: 'HSK',
    level: 'Trung cấp',
    content: {
      html: '<div><p><strong>📚 Chiến thuật ôn HSK hiệu quả:</strong></p><p><strong>Phương pháp 4-3-2-1:</strong></p><div style="background-color: #f0f4ff; padding: 16px; border-radius: 8px;"><p><strong>4 tuần trước thi:</strong> Làm đề tổng hợp</p><p><strong>3 tuần trước thi:</strong> Ôn lại từ vựng yếu</p><p><strong>2 tuần trước thi:</strong> Luyện kỹ năng nghe</p><p><strong>1 tuần trước thi:</strong> Ôn lại ngữ pháp cơ bản</p></div><p><strong>📊 Phân bổ thời gian ôn:</strong></p><ul><li><strong>40%</strong> - Từ vựng và đọc hiểu</li><li><strong>30%</strong> - Nghe hiểu</li><li><strong>20%</strong> - Ngữ pháp</li><li><strong>10%</strong> - Viết (HSK 3 trở lên)</li></ul><p><em>🎯 Lưu ý: Làm đề thử ít nhất 5 lần trước khi thi!</em></p></div>',
      ops: [{ insert: 'Chiến thuật ôn HSK' }]
    },
    is_pinned: true,
    created_by: 'admin-001'
  },

  // ========== KHẨU NGỮ ==========
  {
    id: '10',
    topic: 'Khẩu ngữ',
    level: 'Sơ cấp',
    content: {
      html: '<div><p><strong>🗣️ Từ khẩu ngữ thông dụng hàng ngày:</strong></p><div style="background-color: #f7fafc; padding: 16px; border-radius: 8px;"><p><strong style="color: #2d3748;">哎呀 (āi ya)</strong> - Ối trời ơi!</p><p style="color: #718096; margin-left: 16px;"><em>Dùng khi ngạc nhiên, bực mình</em></p><p><strong style="color: #2d3748;">加油 (jiā yóu)</strong> - Cố lên!</p><p style="color: #718096; margin-left: 16px;"><em>Động viên, cổ vũ ai đó</em></p><p><strong style="color: #2d3748;">没关系 (méi guān xi)</strong> - Không sao đâu!</p><p style="color: #718096; margin-left: 16px;"><em>An ủi, bảo không có vấn đề gì</em></p><p><strong style="color: #2d3748;">随便 (suí biàn)</strong> - Tuỳ ý/Đại khái</p><p style="color: #718096; margin-left: 16px;"><em>Thể hiện thái độ thoải mái, không quan tâm</em></p></div><p><em>💬 Dùng khẩu ngữ giúp nói chuyện tự nhiên như người bản xứ!</em></p></div>',
      ops: [{ insert: 'Từ khẩu ngữ hàng ngày' }]
    },
    is_pinned: false,
    created_by: 'admin-003'
  }
];

// Helper functions cho mock tips
export const getTipsByTopic = (topic: string): Tip[] => {
  if (topic === 'Tất cả') return mockTips;
  return mockTips.filter(tip => tip.topic === topic);
};

export const getTipsByLevel = (level: string): Tip[] => {
  if (level === 'Tất cả') return mockTips;
  return mockTips.filter(tip => tip.level === level);
};

export const getPinnedTips = (): Tip[] => {
  return mockTips.filter(tip => tip.is_pinned);
};

export const searchTips = (query: string): Tip[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockTips.filter(tip => {
    // Tìm kiếm trong topic, level, answer
    const searchFields = [
      tip.topic,
      tip.level, 
      tip.answer || '',
      // Tìm kiếm trong HTML content (loại bỏ tags)
      typeof tip.content === 'object' && tip.content && 'html' in tip.content 
        ? (tip.content as any).html.replace(/<[^>]*>/g, ' ')
        : tip.content?.toString() || ''
    ].join(' ').toLowerCase();
    
    return searchFields.includes(lowercaseQuery);
  });
};

export const mockPaginatedTips = (
  page: number = 1,
  limit: number = 12,
  filters?: {
    topic?: string;
    level?: string;
    search?: string;
    is_pinned?: boolean;
  }
) => {
  let filteredTips = [...mockTips];

  // Apply filters
  if (filters?.topic && filters.topic !== 'Tất cả') {
    filteredTips = filteredTips.filter(tip => tip.topic === filters.topic);
  }

  if (filters?.level && filters.level !== 'Tất cả') {
    filteredTips = filteredTips.filter(tip => tip.level === filters.level);
  }

  if (filters?.search) {
    filteredTips = searchTips(filters.search);
  }

  if (filters?.is_pinned !== undefined) {
    filteredTips = filteredTips.filter(tip => tip.is_pinned === filters.is_pinned);
  }

  // Calculate pagination
  const total = filteredTips.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const data = filteredTips.slice(startIndex, endIndex);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages
    }
  };
};