import * as XLSX from "xlsx";
import { Vocabulary } from "../types";

// Viết hoa chữ cái đầu tiên của cụm từ
const capitalizePhrase = (str: string) =>
  str.trim().toLowerCase().replace(/^\S/, (c) => c.toUpperCase());

// Tách và chuẩn hóa word_types
const parseWordTypes = (value: string): string[] => {
  if (!value) return [];
  return value
    .split(/[.,\/\\;]/) // tách theo: , . / \ ;
    .map((x) => capitalizePhrase(x))
    .filter(Boolean);
};

export const parseCSV = (text: string): Partial<Vocabulary>[] => {
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== "");
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
  
  return lines.slice(1).map(line => {
    const cells = line.split(",").map(c => c.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = cells[i] || ""));

    const vocab: Partial<Vocabulary> = {
      hanzi: row.hanzi || "",
      pinyin: row.pinyin || "",
      meaning: row.meaning || "",
      notes: row.notes || "",
      level: (row.level || "").split(/[.,\/\\;]/).map(l => l.trim().toUpperCase()).filter(Boolean),
      image_url: row.image_url || "",
      word_types: parseWordTypes(row.word_types || "")
    };
    if (row.id) vocab.id = row.id; // Chỉ thêm ID nếu có
    return vocab;
  });
};

export const readImportFile = async (file: File): Promise<Partial<Vocabulary>[]> => {
  const name = file.name.toLowerCase();

  // CSV
  if (name.endsWith(".csv")) {
    const text = await file.text();
    return parseCSV(text);
  }

  // Excel .xlsx
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    const ab = await file.arrayBuffer();
    const workbook = XLSX.read(ab);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" });

    return json.map(row => {
      const vocab: Partial<Vocabulary> = {
        hanzi: row.hanzi || "",
        pinyin: row.pinyin || "",
        meaning: row.meaning || "",
        notes: row.notes || "",
        level: (row.level || "").split(/[.,\/\\;]/).map(l => l.trim().toUpperCase()).filter(Boolean),
        image_url: row.image_url || "",
        word_types: parseWordTypes(row.word_types || "")
      };
      if (row.id) vocab.id = row.id; // Chỉ thêm ID nếu có
      return vocab;
    });
  }

  // fallback text (không import được định dạng khác)
  const text = await file.text();
  return parseCSV(text);
};
