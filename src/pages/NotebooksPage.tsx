import React, { useEffect, useState } from 'react';
import { fetchNotebooks, createNotebook } from '../features/notebooks/notebookApi';
import type { Notebook } from '../types/entities';
import NotebookCard from '../components/notebooks/NotebookCard';
import Input from '../components/ui/Input';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/Toast';

const NotebooksPage: React.FC = () => {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {loading ? 'Đang tải...' : notebooks.filter(n=>!n.is_premium).map(nb => <NotebookCard key={nb.id} notebook={nb} />)}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-3">Cao cấp</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {loading ? 'Đang tải...' : notebooks.filter(n=>n.is_premium).map(nb => <NotebookCard key={nb.id} notebook={nb} />)}
        </div>
      </div>
    </div>
  );
};

export default NotebooksPage;
