
import { Vocabulary, Notebook, NotebookVocabItem } from '../types';

export const mockNotebooks: Notebook[] = [
    { id: 'nb1', name: 'Sổ tay HSK 5 Cơ bản', vocab_count: 2, options: {}, is_premium: true, created_at: '2023-11-01T10:00:00Z', status: 'published' },
    { id: 'nb2', name: 'Từ vựng Giao tiếp hằng ngày', vocab_count: 3, options: {}, is_premium: false, created_at: '2023-12-15T14:00:00Z', status: 'published' },
    { id: 'nb3', name: 'Sổ tay luyện thi (Nháp)', vocab_count: 1, options: {}, is_premium: true, created_at: '2024-01-20T09:00:00Z', status: 'draft' },
    { id: 'nb4', name: 'Thành ngữ Trung Quốc', vocab_count: 0, options: {}, is_premium: true, created_at: '2024-02-10T11:00:00Z', status: 'published' },
    { id: 'nb5', name: 'Từ vựng công nghệ thông tin', vocab_count: 0, options: {}, is_premium: false, created_at: '2024-03-05T16:00:00Z', status: 'draft' },
];


export const mockVocab: Vocabulary[] = [
    { id: 'v1', hanzi: '你好', pinyin: 'nǐ hǎo', meaning: 'Xin chào', level: ['HSK1'], word_types: ['Cụm từ'], notes: 'Lời chào phổ biến nhất.', image_url: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=200&h=200&fit=crop' },
    { id: 'v2', hanzi: '经济', pinyin: 'jīng jì', meaning: 'Kinh tế', level: ['HSK5', 'HSK6'], word_types: ['Danh từ'], notes: 'Chủ đề quan trọng trong các bài đọc HSK cao cấp.', image_url: 'https://images.unsplash.com/photo-1579621970795-87f54f59758f?w=200&h=200&fit=crop' },
    { id: 'v3', hanzi: '谢谢', pinyin: 'xiè xie', meaning: 'Cảm ơn', level: ['HSK1'], word_types: ['Động từ', 'Cụm từ'], notes: 'Dùng để biểu thị lòng biết ơn.', image_url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=200&h=200&fit=crop' },
    { id: 'v4', hanzi: '警察', pinyin: 'jǐng chá', meaning: 'Cảnh sát', level: ['HSK3'], word_types: ['Danh từ'], image_url: 'https://images.unsplash.com/photo-1570868838154-17206b53023e?w=200&h=200&fit=crop' },
    { id: 'v5', hanzi: '环境', pinyin: 'huán jìng', meaning: 'Môi trường', level: ['HSK4'], word_types: ['Danh từ'], image_url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=200&h=200&fit=crop' },
    { id: 'v6', hanzi: '电脑', pinyin: 'diàn nǎo', meaning: 'Máy tính', level: ['HSK2'], word_types: ['Danh từ'], notes: 'Một thiết bị điện tử.', image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200&h=200&fit=crop' },
    { id: 'v7', hanzi: '高兴', pinyin: 'gāo xìng', meaning: 'Vui vẻ, vui mừng', level: ['HSK1'], word_types: ['Tính từ'], notes: 'Biểu thị tâm trạng vui vẻ.', image_url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=200&h=200&fit=crop' },
    { id: 'v8', hanzi: '学习', pinyin: 'xué xí', meaning: 'Học tập', level: ['HSK1'], word_types: ['Động từ'], notes: 'Hành động tiếp thu kiến thức.', image_url: 'https://images.unsplash.com/photo-1524995767968-97212ea9c14a?w=200&h=200&fit=crop' },
    { id: 'v9', hanzi: '旅游', pinyin: 'lǚ yóu', meaning: 'Du lịch', level: ['HSK3'], word_types: ['Động từ'], notes: 'Đi đến một nơi khác để tham quan, giải trí.', image_url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=200&h=200&fit=crop' },
    { id: 'v10', hanzi: '健康', pinyin: 'jiàn kāng', meaning: 'Sức khỏe', level: ['HSK2'], word_types: ['Danh từ', 'Tính từ'], notes: 'Trạng thái không bệnh tật.', image_url: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=200&h=200&fit=crop' },
];

export const mockNotebookVocabItems: NotebookVocabItem[] = [
    // Notebook 1
    { notebook_id: 'nb1', vocab_id: 'v2', status: 'chưa thuộc', added_at: '2023-11-02T00:00:00Z' },
    { notebook_id: 'nb1', vocab_id: 'v5', status: 'đã thuộc', added_at: '2023-11-05T00:00:00Z' },

    // Notebook 2
    { notebook_id: 'nb2', vocab_id: 'v1', status: 'yêu thích', added_at: '2023-12-16T00:00:00Z' },
    { notebook_id: 'nb2', vocab_id: 'v3', status: 'chưa thuộc', added_at: '2023-12-17T00:00:00Z' },
    { notebook_id: 'nb2', vocab_id: 'v6', status: 'đã thuộc', added_at: '2023-12-19T00:00:00Z' },

    // Notebook 3
    { notebook_id: 'nb3', vocab_id: 'v2', status: 'chưa thuộc', added_at: '2024-01-21T00:00:00Z' },
];

export const WORD_TYPES = [
    'Danh từ', 'Đại từ', 'Động từ', 'Tính từ', 'Trạng từ', 'Giới từ', 
    'Liên từ', 'Trợ từ', 'Thán từ', 'Số từ', 'Lượng từ', 'Thành phần câu', 'Cụm từ'
];
