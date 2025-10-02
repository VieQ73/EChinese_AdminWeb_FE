import React, { useEffect, useState } from 'react';
import { fetchNotebooks, createNotebook, publishNotebooks, hardDeleteNotebooks } from '../features/notebooks/notebookApi';
import type { Notebook } from '../types/entities';
import NotebookCard from '../components/notebooks/NotebookCard';
import Input from '../components/ui/Input';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/Toast';

const NotebooksPage: React.FC = () => {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [bulkLoading, setBulkLoading] = useState(false);
  const [name, setName] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchNotebooks();
        setNotebooks(res);
      } catch (_e) {
        toast.push('Không thể tải sổ tay', 'error');
      } finally { setLoading(false); }
    };
    load();
  }, [toast]);

  const toggleSelect = (id: string) => setSelected(s => ({ ...s, [id]: !s[id] }));
  const selectAll = (list: Notebook[]) => {
    const map: Record<string, boolean> = {};
    list.forEach(n => map[n.id] = true);
    setSelected(map);
  };
  const clearSelection = () => setSelected({});
  const selectedIds = Object.keys(selected).filter(k => selected[k]);

  const handlePublish = async () => {
    if (selectedIds.length === 0) return toast.push('Chưa chọn sổ tay nào', 'warning');
    setBulkLoading(true);
    try {
      await publishNotebooks(selectedIds);
      toast.push('Đã cập nhật sổ tay lên mobile (mock)', 'success');
      clearSelection();
    } catch (e:any) { toast.push(e?.message || 'Thao tác thất bại', 'error'); }
    finally { setBulkLoading(false); }
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return toast.push('Chưa chọn sổ tay nào', 'warning');
    // If any selected notebook has vocab_count > 0, show confirm
    const hasContent = notebooks.some(n => selectedIds.includes(n.id) && (n.vocab_count || 0) > 0);
    if (hasContent) {
      if (!confirm('Một hoặc nhiều sổ tay chứa từ vựng. Bạn có chắc muốn xóa vĩnh viễn không?')) return;
    }
    setBulkLoading(true);
    try {
      await hardDeleteNotebooks(selectedIds);
      // refresh list
      const res = await fetchNotebooks();
      setNotebooks(res);
      clearSelection();
      toast.push('Đã xóa sổ tay (mock)', 'success');
    } catch (e:any) { toast.push(e?.message || 'Xóa thất bại', 'error'); }
    finally { setBulkLoading(false); }
  };

  const handleCreate = async () => {
    if (!name.trim()) return toast.push('Tên sổ tay không được để trống', 'warning');
    try {
      const nb = await createNotebook({ name, is_premium: isPremium, options: { show_hanzi: true, show_pinyin: true } });
      setNotebooks(prev => [...prev, nb].sort((a,b)=>a.name.localeCompare(b.name)));
      setName(''); setIsPremium(false);
      toast.push('Tạo sổ tay thành công', 'success');
    } catch (e: any) {
      toast.push(e.message || 'Tạo sổ tay thất bại', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Sổ tay & Gói từ vựng</h1>
        <p className="text-gray-500">Tạo, xem và quản lý sổ tay từ vựng.</p>
      </div>

  <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <h3 className="font-semibold">Tạo sổ tay mới</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input id="nb-name" label="Tên sổ tay" value={name} onChange={e=>setName(e.target.value)} />
          <div>
            <label className="block text-sm font-medium mb-1">Loại</label>
            <select className="w-full p-3 border rounded" value={isPremium? 'premium':'free'} onChange={e=>setIsPremium(e.target.value==='premium')}>
              <option value="free">Miễn phí</option>
              <option value="premium">Cao cấp</option>
            </select>
          </div>
          {/* display options removed per UI spec */}
        </div>
        <div className="flex justify-end">
          <Button onClick={handleCreate}>Tạo</Button>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-3">Miễn phí</h3>
        <div className="mb-3 flex items-center gap-2">
          <button onClick={() => selectAll(notebooks.filter(n=>!n.is_premium))} className="px-3 py-2 border rounded">Chọn tất cả</button>
          <button onClick={() => clearSelection()} className="px-3 py-2 border rounded">Bỏ chọn</button>
          <button onClick={handlePublish} disabled={bulkLoading || selectedIds.length===0} className="px-3 py-2 bg-emerald-600 text-white rounded">Cập nhật</button>
          <button onClick={handleDelete} disabled={bulkLoading || selectedIds.length===0} className="px-3 py-2 bg-red-600 text-white rounded">Xóa</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {loading ? 'Đang tải...' : notebooks.filter(n=>!n.is_premium).map(nb => (
            <div className="relative" key={nb.id}>
              <input type="checkbox" checked={!!selected[nb.id]} onChange={()=>toggleSelect(nb.id)} className="absolute right-2 top-2 z-10" />
              <NotebookCard notebook={nb} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-3">Cao cấp</h3>
        <div className="mb-3 flex items-center gap-2">
          <button onClick={() => selectAll(notebooks.filter(n=>n.is_premium))} className="px-3 py-2 border rounded">Chọn tất cả</button>
          <button onClick={() => clearSelection()} className="px-3 py-2 border rounded">Bỏ chọn</button>
          <button onClick={handlePublish} disabled={bulkLoading || selectedIds.length===0} className="px-3 py-2 bg-emerald-600 text-white rounded">Cập nhật</button>
          <button onClick={handleDelete} disabled={bulkLoading || selectedIds.length===0} className="px-3 py-2 bg-red-600 text-white rounded">Xóa</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {loading ? 'Đang tải...' : notebooks.filter(n=>n.is_premium).map(nb => (
            <div className="relative" key={nb.id}>
              <input type="checkbox" checked={!!selected[nb.id]} onChange={()=>toggleSelect(nb.id)} className="absolute right-2 top-2 z-10" />
              <NotebookCard notebook={nb} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotebooksPage;
