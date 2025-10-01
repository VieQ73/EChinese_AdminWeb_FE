import React, { useState } from 'react';
import type { Vocabulary } from '../../types/entities';
import Input from '../ui/Input';
import { Button } from '../ui/button';

const VocabularyDetailModal: React.FC<{ vocab: Vocabulary | null; isOpen: boolean; onClose: (updated?: boolean)=>void; onSave?: (data: Partial<Vocabulary>)=>Promise<void> }> = ({ vocab, isOpen, onClose, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Vocabulary>>({});

  React.useEffect(()=>{ if(vocab) setForm(vocab); }, [vocab]);

  if(!isOpen || !vocab) return null;

  const handleSave = async ()=>{
    if(onSave) await onSave(form);
    setEditing(false);
    onClose(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg p-6 w-3/4 max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Chi tiết từ vựng</h3>
          <div className="space-x-2">
            <Button variant="ghost" onClick={()=>{ setEditing(e=>!e); }}>{editing ? 'Hủy' : 'Sửa'}</Button>
            <Button variant="outline" onClick={()=>onClose(false)}>Đóng</Button>
          </div>
        </div>
        <div className="flex flex-col gap-4">
            {/* Detail view should not show the image per new spec; show full fields only */}
          <div className="space-y-3">
            <Input id="hanzi" label="Hanzi" value={form.hanzi || ''} onChange={e=>setForm({...form, hanzi: e.target.value})} readOnly={!editing} />
            <Input id="pinyin" label="Pinyin" value={form.pinyin || ''} onChange={e=>setForm({...form, pinyin: e.target.value})} readOnly={!editing} />
            <Input id="meaning" label="Nghĩa" value={form.meaning || ''} onChange={e=>setForm({...form, meaning: e.target.value})} readOnly={!editing} />
            <div>
                <label className="block text-sm font-medium mb-1">Từ loại (chọn nhiều)</label>
                <div className="w-full p-2 border rounded">
                  {/* simple multi-select using checkboxes so we avoid adding new UI deps */}
                  {[ 'Danh từ', 'Đại từ', 'Động từ', 'Tính từ', 'Trạng từ', 'Giới từ', 'Liên từ', 'Trợ từ', 'Thán từ', 'Số từ', 'Lượng từ', 'Thành phần câu', 'Cụm từ', ].map(wt => {
                    const isChecked = Array.isArray(form.word_types) ? form.word_types.includes(wt) : (form.word_types ? (form.word_types as any).includes(wt) : false);
                    return (
                      <label key={wt} className="inline-flex items-center mr-3">
                        <input type="checkbox" disabled={!editing} checked={isChecked} onChange={(e)=>{
                          if(!editing) return;
                          setForm(prev=>{
                            const arr = Array.isArray(prev.word_types) ? [...prev.word_types] : (prev.word_types? [...(prev.word_types as any)] : []);
                            if(e.target.checked){ if(!arr.includes(wt)) arr.push(wt); }
                            else { const idx = arr.indexOf(wt); if(idx>=0) arr.splice(idx,1); }
                            return {...prev, word_types: arr};
                          });
                        }} />
                        <span className="ml-2 text-sm">{wt}</span>
                      </label>
                    );
                  })}
                </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Level (CSV)</label>
                <input value={Array.isArray(form.level) ? (form.level as any).join(',') : (form.level||'')} onChange={e=>setForm(f=>({...f, level: e.target.value.split(',').map((s)=>s.trim()).filter(Boolean)}))} readOnly={!editing} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ghi chú</label>
              <textarea value={form.notes || ''} onChange={e=>setForm({...form, notes: e.target.value})} readOnly={!editing} className="w-full p-2 border rounded h-40 resize-y" />
            </div>
          </div>
        </div>
        {editing && <div className="mt-4 flex justify-end"><Button onClick={handleSave}>Lưu</Button></div>}
      </div>
    </div>
  );
};

export default VocabularyDetailModal;
