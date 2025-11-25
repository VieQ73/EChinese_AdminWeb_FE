import axios from 'axios';
import { GoogleGenAI } from "@google/genai";
import { WordTypeEnum } from '../../../types';

// === CẤU HÌNH PIXABAY ===
const PIXABAY_API_KEY = '53272830-016c9e20b013f864280d61b7c'; 
const PIXABAY_BASE = 'https://pixabay.com/api/';

// === CẤU HÌNH GEMINI ===
// Sử dụng API KEY từ biến môi trường
const ai = new GoogleGenAI({ apiKey: "AIzaSyDHY-jxYA3mBrXoDpELDbwyt5lyKwV9AgM" });

// Cache bộ nhớ tạm thời
const IMAGE_CACHE = new Map<string, string>();

// Database JSON giả lập lưu trữ tạm thời
export const TEMP_JSON_DB: Array<{
  hanzi: string;
  pinyin?: string; // Optional nếu muốn lưu thêm
  image_url: string;
  source: 'gemini-optimized' | 'direct-zh';
  created_at: string;
}> = [];

/**
 * Sử dụng Gemini để phân tích nghĩa và tạo từ khóa tìm kiếm hình ảnh tiếng Anh tối ưu
 */
const getOptimizedKeywords = async (
  hanzi: string,
  meaning: string,
  wordTypes: WordTypeEnum[]
): Promise<string | null> => {
  try {
    const typeStr = wordTypes.join(', ');
    
    // Prompt engineering: Yêu cầu Gemini đóng vai trò chuyên gia hình ảnh
    const prompt = `Convert this Chinese vocabulary into specific English search keywords for a stock photo site (Pixabay).
    
    Input:
    - Hanzi: "${hanzi}"
    - Vietnamese Meaning: "${meaning}"
    - Type: ${typeStr}

    Task: Provide 2-3 concrete, visual English keywords.
    - If it's a noun (e.g., "Cat"), return the noun.
    - If it's a verb (e.g., "Run"), return a visual action (e.g., "running runner").
    - If it's abstract, provide a visual metaphor.
    
    Output: ONLY return the keywords separated by spaces. No explanations.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const keywords = response.text?.trim();
    return keywords || null;
  } catch (error) {
    console.warn(`[Gemini] Không thể tối ưu từ khóa cho: ${hanzi}`, error);
    return null;
  }
};

/**
 * Hàm lấy ảnh thông minh
 * 1. Hỏi Gemini từ khóa tiếng Anh (chính xác nhất) -> Tìm Pixabay (lang=en)
 * 2. Nếu lỗi, tìm trực tiếp Hán tự -> Tìm Pixabay (lang=zh)
 */
export const fetchImageForVocab = async (
  hanzi: string,
  meaning: string,
  wordTypes: WordTypeEnum[]
): Promise<string | undefined> => {
  // 1. Kiểm tra Cache
  const cacheKey = `${hanzi}_${wordTypes.join('_')}`;
  if (IMAGE_CACHE.has(cacheKey)) return IMAGE_CACHE.get(cacheKey);

  try {
    let q = '';
    let lang = 'zh';
    let source: 'gemini-optimized' | 'direct-zh' = 'direct-zh';

    // 2. Thử tối ưu hóa bằng Gemini
    const optimizedKeywords = await getOptimizedKeywords(hanzi, meaning, wordTypes);

    if (optimizedKeywords) {
      q = optimizedKeywords;
      lang = 'en'; // Tìm bằng tiếng Anh sẽ cho kết quả stock photo tốt hơn
      source = 'gemini-optimized';
      // console.log(`[AI Search] ${hanzi} (${meaning}) -> Keywords: "${q}"`);
    } else {
      // 3. Fallback: Tìm bằng tiếng Trung
      q = hanzi;
      lang = 'zh';
      // console.log(`[Direct Search] ${hanzi} -> Lang: zh`);
    }

    // 4. Gọi Pixabay API
    const response = await axios.get(PIXABAY_BASE, {
      params: {
        key: PIXABAY_API_KEY,
        q: q,
        lang: lang, // Quan trọng: 'en' nếu dùng Gemini, 'zh' nếu tìm trực tiếp
        image_type: 'photo',
        orientation: 'horizontal',
        per_page: 3, // Lấy 3 ảnh để lọc
        safesearch: true,
        min_width: 400
      }
    });

    const hits = response.data.hits;
    
    if (hits && hits.length > 0) {
      // Lấy ảnh đầu tiên
      const imageUrl = hits[0].webformatURL;
      
      // Lưu vào Cache
      IMAGE_CACHE.set(cacheKey, imageUrl);

      // Lưu vào "File JSON" tạm thời
      TEMP_JSON_DB.push({
        hanzi,
        image_url: imageUrl,
        source,
        created_at: new Date().toISOString()
      });
      
      // Log ra console để user có thể copy nếu muốn
      // console.log('Saved to Temp JSON:', JSON.stringify(TEMP_JSON_DB[TEMP_JSON_DB.length - 1]));

      return imageUrl;
    }

    return undefined;
  } catch (error) {
    console.error(`Error fetching image for ${hanzi}:`, error);
    return undefined;
  }
};
