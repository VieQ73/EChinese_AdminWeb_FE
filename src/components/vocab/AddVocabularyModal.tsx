import React, { useState } from 'react';
import Input from '../ui/Input';
import { Button } from '../ui/button';
import type { Vocabulary } from '../../types/entities';

const defaultVocab = (): Partial<Vocabulary> => ({ hanzi: '', pinyin: '', meaning: '', notes: '', level: ['HSK1'], word_types: ['Danh từ'] });

const AddVocabularyModal: React.FC<{ isOpen: boolean; onClose: (added?: boolean)=>void; onAdd: (items: Partial<Vocabulary>[])=>Promise<void> }> = ({ isOpen, onClose, onAdd }) => {
  const [items, setItems] = useState<Partial<Vocabulary>[]>([defaultVocab()]);
  const [loading, setLoading] = useState(false);

  if(!isOpen) return null;

  const addCard = ()=>{
    if(items.length >= 10) return;
    setItems(prev => [...prev, defaultVocab()]);
  };
  const removeCard = (idx:number)=> setItems(prev => prev.filter((_,i)=>i!==idx));

  const handleChange = (idx:number, key:string, value:string)=>{
    const val = key === 'level' ? value.split(',').map(s=>s.trim()).filter(Boolean) : value;
    setItems(prev => prev.map((it,i)=> i===idx ? ({...it,[key]:val}) : it));
  };

  const handleAdd = async ()=>{
    setLoading(true);
    try { await onAdd(items); onClose(true); } catch (_e) { onClose(false); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg p-6 w-3/4 max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Thêm từ vựng (1/{items.length}/10)</h3>
          <div className="flex gap-2"><Button variant="ghost" onClick={()=>onClose(false)}>Hủy</Button></div>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {items.map((it, idx) => (
            <div key={idx} className="p-3 border rounded grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <Input id={`h${idx}`} label="Hanzi" value={it.hanzi||''} onChange={e=>handleChange(idx,'hanzi',e.target.value)} />
              <Input id={`p${idx}`} label="Pinyin" value={it.pinyin||''} onChange={e=>handleChange(idx,'pinyin',e.target.value)} />
              <Input id={`m${idx}`} label="Nghĩa" value={it.meaning||''} onChange={e=>handleChange(idx,'meaning',e.target.value)} />
              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Từ loại</label>
                  <div className="w-full p-2 border rounded">
                    {[ 'Danh từ', 'Đại từ', 'Động từ', 'Tính từ', 'Trạng từ', 'Giới từ', 'Liên từ', 'Trợ từ', 'Thán từ', 'Số từ', 'Lượng từ', 'Thành phần câu', 'Cụm từ'].map(wt => {
                      const checked = Array.isArray(it.word_types) ? it.word_types.includes(wt) : false;
                      return (
                        <label key={wt} className="inline-flex items-center mr-3">
                          <input type="checkbox" checked={checked} onChange={(e)=>{
                            const arr = Array.isArray(it.word_types) ? [...it.word_types!] : [];
                            if(e.target.checked){ if(!arr.includes(wt)) arr.push(wt); } else { const idx2 = arr.indexOf(wt); if(idx2>=0) arr.splice(idx2,1); }
                            handleChange(idx,'word_types', arr as any as string);
                          }} />
                          <span className="ml-2 text-sm">{wt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Level (CSV)</label>
                  <input value={Array.isArray(it.level) ? (it.level as any).join(',') : (it.level||'')} onChange={e=>handleChange(idx,'level',e.target.value)} className="w-full p-2 border rounded" />
                </div>
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium mb-1">Ghi chú</label>
                <textarea value={it.notes||''} onChange={e=>handleChange(idx,'notes',e.target.value)} className="w-full p-2 border rounded h-24 resize-y" />
              </div>
              <div className="md:col-span-3 flex justify-end gap-2">
                <Button variant="destructive" onClick={()=>removeCard(idx)}>X</Button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4">
          <div>
            <Button onClick={addCard} disabled={items.length>=10}>+ Thêm thẻ</Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={()=>onClose(false)}>Hủy</Button>
            <Button onClick={handleAdd} disabled={loading}>{loading? 'Đang thêm...':'Thêm'}</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVocabularyModal;
