import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchVocabulariesIncludingDeleted, restoreVocabulary, hardDeleteVocabulary } from '../features/vocabularies/vocabApi';
import { getNotebookById } from '../features/notebooks/notebookApi';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../hooks/useAuth';
import { RotateCcw, Trash2, CheckSquare, XSquare, ArrowLeft } from 'lucide-react';

const NotebookTrash: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const currentUser = useAuth();

  const [notebook, setNotebook] = useState<any | null>(null);
  const [deletedList, setDeletedList] = useState<any[]>([]);
  const [deletedSelected, setDeletedSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const nb = await getNotebookById(id);
      setNotebook(nb);
      const list = await fetchVocabulariesIncludingDeleted({ includeDeleted: true, search: '' });
      setDeletedList(list.filter((v: any) => v.deleted_at));
    })();
  }, [id]);

  const toggleDeletedSelect = (vid: string) => setDeletedSelected(s => ({ ...s, [vid]: !s[vid] }));
  const deletedSelectedIds = Object.keys(deletedSelected).filter(k => deletedSelected[k]);

  const handleBulkRestoreDeleted = async () => {
    if (deletedSelectedIds.length === 0) return toast.push('Chưa chọn mục nào', 'warning');
    setLoading(true);
    try {
      await Promise.all(deletedSelectedIds.map(id => restoreVocabulary(id)));
      setDeletedSelected({});
      const list = await fetchVocabulariesIncludingDeleted({ includeDeleted: true });
      setDeletedList(list.filter((v: any) => v.deleted_at));
      toast.push('Đã phục hồi các mục đã chọn', 'success');
    } catch (_e) {
      toast.push('Phục hồi thất bại', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkHardDeleteDeleted = async () => {
    if (deletedSelectedIds.length === 0) return toast.push('Chưa chọn mục nào', 'warning');
    if (currentUser?.role !== 'super admin') return toast.push('Không có quyền', 'error');
    setLoading(true);
    try {
      await Promise.all(deletedSelectedIds.map(id => hardDeleteVocabulary(id)));
      setDeletedSelected({});
      const list = await fetchVocabulariesIncludingDeleted({ includeDeleted: true });
      setDeletedList(list.filter((v: any) => v.deleted_at));
      toast.push('Đã xóa vĩnh viễn các mục đã chọn', 'success');
    } catch (_e) {
      toast.push('Xóa thất bại', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (vid: string) => {
    setLoading(true);
    try {
      await restoreVocabulary(vid);
      toast.push('Đã phục hồi', 'success');
      setDeletedList(prev => prev.filter(v => v.id !== vid));
    } catch (_e) {
      toast.push('Phục hồi thất bại', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleHardDelete = async (vid: string) => {
    if (currentUser?.role !== 'super admin') return toast.push('Không có quyền', 'error');
    setLoading(true);
    try {
      await hardDeleteVocabulary(vid);
      toast.push('Đã xoá vĩnh viễn', 'success');
      setDeletedList(prev => prev.filter(v => v.id !== vid));
    } catch (_e) {
      toast.push('Xoá thất bại', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border shadow-sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>
          <h2 className="text-2xl font-semibold">Thùng rác {notebook ? `- ${notebook.title || notebook.name || ''}` : ''}</h2>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <button
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium bg-white text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  const all: Record<string, boolean> = {};
                  deletedList.forEach(d => (all[d.id] = true));
                  setDeletedSelected(all);
                }}
              >
                <CheckSquare className="w-4 h-4" /> Chọn tất cả
              </button>

              <button
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium bg-white text-gray-700 hover:bg-gray-50"
                onClick={() => setDeletedSelected({})}
              >
                <XSquare className="w-4 h-4" /> Bỏ chọn
              </button>
            </div>

            <div className="flex gap-2">
              <button
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                onClick={handleBulkRestoreDeleted}
                disabled={loading || deletedSelectedIds.length === 0}
              >
                <RotateCcw className="w-4 h-4" /> Phục hồi
              </button>

              <button
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${currentUser?.role === 'super admin' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                onClick={handleBulkHardDeleteDeleted}
                disabled={loading || deletedSelectedIds.length === 0 || currentUser?.role !== 'super admin'}
                title={currentUser?.role !== 'super admin' ? 'Chỉ Super Admin mới được xóa vĩnh viễn' : 'Xóa vĩnh viễn'}
              >
                <Trash2 className="w-4 h-4" /> Xóa vĩnh viễn
              </button>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto space-y-2">
            {deletedList.length === 0 ? (
              <div className="text-sm text-gray-500 italic">Không có mục đã xóa</div>
            ) : (
              deletedList.map(v => (
                <div key={v.id} className="p-3 bg-white rounded-lg border shadow-sm flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={!!deletedSelected[v.id]} onChange={() => toggleDeletedSelect(v.id)} className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                    <div className="text-sm">
                      <div className="font-semibold text-gray-800">{v.hanzi} · {v.pinyin}</div>
                      <div className="text-xs text-gray-500">{v.meaning}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-sm font-medium bg-white text-gray-700 hover:bg-gray-50" onClick={() => handleRestore(v.id)} disabled={loading}>
                      <RotateCcw className="w-4 h-4" /> Phục hồi
                    </button>

                    <button className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${currentUser?.role === 'super admin' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`} onClick={() => handleHardDelete(v.id)} disabled={loading || currentUser?.role !== 'super admin'} title={currentUser?.role !== 'super admin' ? 'Chỉ Super Admin mới được xóa vĩnh viễn' : 'Xóa vĩnh viễn'}>
                      <Trash2 className="w-4 h-4" /> {currentUser?.role === 'super admin' ? 'Xóa vĩnh viễn' : 'Không'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotebookTrash;
