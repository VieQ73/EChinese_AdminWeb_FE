import axios from 'axios';
import { GoogleGenAI } from "@google/genai";
import { WordTypeEnum } from '../../../types';
import { uploadImageFromUrl } from '../../../services/cloudinary';

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
  source: 'gemini-optimized' | 'direct-zh' | 'fallback-meaning' | 'ai-selected';
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
    
    const prompt = `You are a Chinese language expert. Analyze this word and provide the BEST English search keyword for stock photos.

Chinese: "${hanzi}"
Vietnamese meaning: "${meaning}"
Word type: ${typeStr}

CRITICAL RULES:
1. Return ONLY 1-2 words maximum
2. Use the MOST SPECIFIC, VISUAL term
3. For nouns → exact object (猫→cat, 书→book, 水→water)
4. For verbs → action form (跑→running, 吃→eating, 学习→studying)
5. For adjectives → visual descriptor (红→red, 大→big, 快→fast)
6. For abstract → concrete symbol (爱→heart, 和平→peace dove)
7. Prioritize LITERAL meaning over metaphorical
8. NO explanations, NO extra words

Output: [keyword only]`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });

    const keywords = response.text?.trim().toLowerCase();
    console.log(`[AI Keywords] ${hanzi} (${meaning}) → "${keywords}"`);
    return keywords || null;
  } catch (error) {
    console.warn(`[Gemini] Không thể tối ưu từ khóa cho: ${hanzi}`, error);
    return null;
  }
};

/**
 * Sử dụng Gemini để chọn ảnh phù hợp nhất từ danh sách kết quả
 */
const selectBestImageWithAI = async (
  hanzi: string,
  meaning: string,
  images: Array<{ url: string; tags: string; id: number }>
): Promise<number> => {
  try {
    const imageList = images.map((img, idx) => 
      `${idx + 1}. Tags: ${img.tags}`
    ).join('\n');

    const prompt = `You are selecting the BEST image for a Chinese vocabulary flashcard.

Word: "${hanzi}"
Meaning: "${meaning}"

Available images:
${imageList}

Task: Choose the image number (1-${images.length}) that BEST represents "${hanzi}" (${meaning}).

Rules:
- Prioritize LITERAL representation over abstract
- Choose simple, clear images
- Avoid images with text or people (unless the word is about people)
- Prefer single object over complex scenes
- Match the PRIMARY meaning

Output: ONLY return the number (1-${images.length}). NO explanations.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });

    const selectedNum = parseInt(response.text?.trim() || '1');
    const index = Math.max(0, Math.min(selectedNum - 1, images.length - 1));
    
    console.log(`[AI Selection] Chose image ${selectedNum} for ${hanzi}: ${images[index].tags}`);
    return index;
  } catch (error) {
    console.warn(`[Gemini] Không thể chọn ảnh tốt nhất, dùng ảnh đầu tiên`, error);
    return 0;
  }
};

/**
 * Hàm lấy ảnh thông minh với AI đánh giá và chọn ảnh tốt nhất
 * 1. Hỏi Gemini từ khóa tiếng Anh tối ưu
 * 2. Tìm nhiều ảnh trên Pixabay
 * 3. Cho Gemini đánh giá và chọn ảnh phù hợp nhất
 * 4. Upload ảnh lên Cloudinary
 * 5. Fallback nếu không tìm được
 */
export const fetchImageForVocab = async (
  hanzi: string,
  meaning: string,
  wordTypes: WordTypeEnum[]
): Promise<string | undefined> => {
  try {
    let pixabayImageUrl: string | undefined;
    let source: 'ai-selected' | 'gemini-optimized' | 'direct-zh' | 'fallback-meaning' = 'direct-zh';

    // Chiến lược 1: AI tối ưu từ khóa + AI chọn ảnh tốt nhất
    const optimizedKeywords = await getOptimizedKeywords(hanzi, meaning, wordTypes);

    if (optimizedKeywords) {
      console.log(`[Strategy 1] AI Keywords: "${optimizedKeywords}"`);
      const images = await searchPixabayMultiple(optimizedKeywords, 'en', hanzi, meaning);
      
      if (images && images.length > 0) {
        if (images.length > 1) {
          // Cho AI chọn ảnh tốt nhất
          const bestIndex = await selectBestImageWithAI(hanzi, meaning, images);
          pixabayImageUrl = images[bestIndex].url;
          source = 'ai-selected';
        } else {
          pixabayImageUrl = images[0].url;
          source = 'gemini-optimized';
        }
      }
    }

    // Chiến lược 2: Tìm bằng Hán tự
    if (!pixabayImageUrl) {
      console.log(`[Strategy 2] Searching with Hanzi: "${hanzi}"`);
      const images = await searchPixabayMultiple(hanzi, 'zh', hanzi, meaning);
      if (images && images.length > 0) {
        if (images.length > 1) {
          const bestIndex = await selectBestImageWithAI(hanzi, meaning, images);
          pixabayImageUrl = images[bestIndex].url;
          source = 'ai-selected';
        } else {
          pixabayImageUrl = images[0].url;
          source = 'direct-zh';
        }
      }
    }

    // Chiến lược 3: Fallback với nghĩa tiếng Việt
    if (!pixabayImageUrl) {
      const firstMeaning = meaning.split(',')[0].trim().split(';')[0].trim();
      console.log(`[Strategy 3] Fallback with meaning: "${firstMeaning}"`);
      const images = await searchPixabayMultiple(firstMeaning, 'vi', hanzi, meaning);
      if (images && images.length > 0) {
        pixabayImageUrl = images[0].url;
        source = 'fallback-meaning';
      }
    }

    if (pixabayImageUrl) {
      // Upload ảnh từ Pixabay lên Cloudinary
      console.log(`[Cloudinary] Uploading image for ${hanzi} to Cloudinary...`);
      let cloudinaryUrl: string;
      
      try {
        cloudinaryUrl = await uploadImageFromUrl(pixabayImageUrl, 'vocabulary');
        console.log(`✓ Uploaded to Cloudinary: ${cloudinaryUrl}`);
      } catch (uploadError) {
        console.error(`[Cloudinary] Upload failed for ${hanzi}, using Pixabay URL as fallback:`, uploadError);
        cloudinaryUrl = pixabayImageUrl; // Fallback về URL Pixabay nếu upload thất bại
      }

      // Lưu vào Cache
      const cacheKey = `${hanzi}_${wordTypes.join('_')}`;
      IMAGE_CACHE.set(cacheKey, cloudinaryUrl);

      // Lưu vào database tạm
      TEMP_JSON_DB.push({
        hanzi,
        image_url: cloudinaryUrl,
        source,
        created_at: new Date().toISOString()
      });

      console.log(`✓ Found image for ${hanzi} using ${source}`);
      return cloudinaryUrl;
    }

    console.warn(`✗ No image found for ${hanzi} after all strategies`);
    return undefined;
  } catch (error) {
    console.error(`Error fetching image for ${hanzi}:`, error);
    return undefined;
  }
};

/**
 * Helper function: Tìm kiếm nhiều ảnh trên Pixabay để AI lựa chọn
 */
const searchPixabayMultiple = async (
  query: string,
  lang: string,
  hanzi: string,
  meaning: string
): Promise<Array<{ url: string; tags: string; id: number }> | undefined> => {
  try {
    const response = await axios.get(PIXABAY_BASE, {
      params: {
        key: PIXABAY_API_KEY,
        q: query,
        lang: lang,
        image_type: 'photo',
        per_page: 10, // Lấy 10 ảnh để AI có nhiều lựa chọn
        safesearch: true,
        min_width: 640,
        order: 'popular'
      }
    });

    const hits = response.data.hits;
    
    if (hits && hits.length > 0) {
      // Lọc và chuẩn bị dữ liệu cho AI
      const images = hits.slice(0, 5).map((hit: any) => ({
        url: hit.webformatURL,
        tags: hit.tags || 'no tags',
        id: hit.id
      }));
      
      return images;
    }

    return undefined;
  } catch (error) {
    console.error(`Pixabay search error for "${query}":`, error);
    return undefined;
  }
};
