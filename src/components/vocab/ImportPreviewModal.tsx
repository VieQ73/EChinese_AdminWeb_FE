import React from 'react';
import { Button } from '../ui/button';
import type { Vocabulary } from '../../types/entities';

const ImportPreviewModal: React.FC<{ isOpen: boolean; items: Vocabulary[]; duplicates: Vocabulary[]; onClose: ()=>void; onProceed: (strategy:'skip'|'overwrite')=>void }> = ({ isOpen, items, duplicates, onClose, onProceed }) => {
  if(!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg p-6 w-3/4 max-w-4xl">
        <h3 className="text-lg font-semibold">Xem trước import</h3>
        <p className="text-sm text-gray-500">Tổng: {items.length} từ. Trùng: {duplicates.length}</p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {items.map(it=> (
            <div key={it.id} className={`p-3 border rounded ${it.deleted_at ? 'opacity-50':''}`}>
              <div className="font-semibold">{it.hanzi} · {it.pinyin}</div>
              <div className="text-sm text-gray-500">{it.meaning}</div>
            </div>
          ))}
        </div>
        {duplicates.length>0 && (
          <div className="mt-4 p-3 bg-yellow-50 border rounded">
            <div className="font-semibold">Từ trùng</div>
            <div className="text-sm">Chọn hành động: Ghi đè (overwrite) hoặc Bỏ qua (skip)</div>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={()=>onProceed('skip')}>{duplicates.length>0? 'Import (Skip duplicates)' : 'Import'}</Button>
          {duplicates.length>0 && <Button variant="destructive" onClick={()=>onProceed('overwrite')}>Import (Overwrite)</Button>}
        </div>
      </div>
    </div>
  );
};

export default ImportPreviewModal;
