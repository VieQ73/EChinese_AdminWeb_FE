import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNotebookById, addItemsToNotebook, removeItemsFromNotebook } from '../features/notebooks/notebookApi';
import { fetchVocabularies, softDeleteVocabulary, hardDeleteVocabulary, createVocabulary, updateVocabulary } from '../features/vocabularies/vocabApi';
import NotebookCard from '../components/notebooks/NotebookCard';
import VocabularyCard from '../components/vocab/VocabularyCard';
import AddVocabularyModal from '../components/vocab/AddVocabularyModal';
import ImportPreviewModal from '../components/vocab/ImportPreviewModal';
import VocabularyDetailModal from '../components/vocab/VocabularyDetailModal';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../hooks/useAuth';
import { FolderOpen } from "lucide-react"

const NotebookDetail: React.FC = ()=>{
  const { id } = useParams<{id:string}>();
  const [notebook, setNotebook] = useState<any>(null);
  const [vocabList, setVocabList] = useState<any[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [bulkLoading, setBulkLoading] = useState(false);
  const toast = useToast();
  const currentUser = useAuth();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid'|'list'>('grid');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 24;
  // paging not used per UI spec (scrollable card), keep placeholders removed
  // Trash moved to its own page: /notebooks/:id/trash
  const [importPreviewOpen, setImportPreviewOpen] = useState(false);
  const [importItems, setImportItems] = useState<any[]>([]);
  const [importDuplicates, setImportDuplicates] = useState<any[]>([]);
  const [openedVocab, setOpenedVocab] = useState<any|null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(()=>{ if(!id) return; (async ()=>{ const nb = await getNotebookById(id); setNotebook(nb); const v = await fetchVocabularies(); setVocabList(v); })(); },[id]);

  const loadNotebookAndVocab = async ()=>{
    if(!id) return;
    const nb = await getNotebookById(id); setNotebook(nb);
    const v = await fetchVocabularies({ search, level: undefined }); setVocabList(v);
    setCurrentPage(1);
  };

  // (handleAdd removed — onAdd is handled inline when opening AddVocabularyModal)

  // debounce search input so filtering waits for typing to pause
  useEffect(()=>{
    const t = setTimeout(()=> setDebouncedSearch(search), 300);
    return ()=> clearTimeout(t);
  },[search]);

  // reset page when search or notebook items change
  useEffect(()=>{ setCurrentPage(1); }, [debouncedSearch, notebook?.items]);

  if(!notebook) return <div>Đang tải sổ tay...</div>;

  const toggleSelect = (id:string)=> setSelected(s=>({...s, [id]: !s[id]}));
  const isAllSelected = notebook.items?.every((it:any)=> selected[it.vocabulary_id]);
  const toggleSelectAll = ()=>{
    if(!notebook.items) return;
    if(isAllSelected){ // deselect all
      setSelected({});
    } else {
      const map: Record<string, boolean> = {};
      notebook.items.forEach((it:any)=> map[it.vocabulary_id] = true);
      setSelected(map);
    }
  };

  const selectedIds = Object.keys(selected).filter(k=>selected[k]);

  const handleBulkSoftDelete = async ()=>{
    if(selectedIds.length===0) return toast.push('Chưa chọn mục nào', 'warning');
    setBulkLoading(true);
    try{
      // soft-delete each vocab (mock), include notebook id so mock records where it came from
      await Promise.all(selectedIds.map(vid=> softDeleteVocabulary(vid, id)));
      // remove from notebook as well so mock notebook items don't keep referencing deleted vocabs
      if(id) await removeItemsFromNotebook(id, selectedIds);
      await loadNotebookAndVocab();
      setSelected({});
      toast.push('Đã gỡ khỏi sổ tay', 'success');
    }catch(e:any){ toast.push(e?.message||'Thao tác thất bại','error'); }
    finally{ setBulkLoading(false); }
  };

  const handleBulkHardDelete = async ()=>{
    if(selectedIds.length===0) return toast.push('Chưa chọn mục nào', 'warning');
    if(currentUser?.role !== 'super admin') return toast.push('Không có quyền', 'error');
    setBulkLoading(true);
    try{
      // hard-delete each vocab and remove from notebook
      await Promise.all(selectedIds.map(id=> hardDeleteVocabulary(id)));
      if(id) await removeItemsFromNotebook(id, selectedIds);
      await loadNotebookAndVocab();
      setSelected({});
      toast.push('Đã xóa vĩnh viễn', 'success');
    }catch(e:any){ toast.push(e?.message||'Thao tác thất bại','error'); }
    finally{ setBulkLoading(false); }
  };

  // Trash actions have been moved to a dedicated full-page view: /notebooks/:id/trash

  return (
    <div className="p-4">
      <div className="mb-4"><NotebookCard notebook={notebook} /></div>
      <div className="flex gap-4">
        {/* Left: large scrollable card containing vocab cards */}
        <div className="w-2/3">
          <div className="bg-white rounded-lg shadow p-4 h-[70vh] flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <button onClick={()=>navigate('/notebooks')} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border shadow-sm hover:bg-gray-50">🔙 <span>Quay lại</span></button>
                <h3 className="text-lg font-semibold">{viewMode==='grid' ? 'Image View' : 'Detail View'}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={()=>setViewMode('grid')} className={`inline-flex items-center gap-2 px-3 py-2 rounded-md ${viewMode==='grid' ? 'bg-teal-600 text-white' : 'bg-white border'}`}>🖼️ Image</button>
                <button onClick={()=>setViewMode('list')} className={`inline-flex items-center gap-2 px-3 py-2 rounded-md ${viewMode==='list' ? 'bg-teal-600 text-white' : 'bg-white border'}`}>📋 Detail</button>
                <button onClick={()=>setAddOpen(true)} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-600 text-white">➕ Thêm</button>
                <button onClick={()=>setSelectMode(s=>!s)} className={`inline-flex items-center gap-2 px-3 py-2 rounded-md ${selectMode? 'bg-gray-200 border' : 'bg-white border'}`}>{selectMode? '✖ Hủy chọn':'☑ Chọn'}</button>
                {selectMode && <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border" onClick={toggleSelectAll}>{isAllSelected? 'Bỏ chọn tất cả' : 'Chọn tất cả'}</button>}
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-2">
              <div>
                {/* compute filtered items and then paginate */}
                {(() => {
                  const filtered = (notebook.items || []).filter((it:any)=>{
                    if(!debouncedSearch.trim()) return true;
                    const v = vocabList.find(v=>v.id===it.vocabulary_id);
                    const hay = `${v?.hanzi||''} ${v?.pinyin||''} ${v?.meaning||''}`.toLowerCase();
                    return hay.includes(debouncedSearch.toLowerCase());
                  });
                  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
                  const page = Math.min(Math.max(1, currentPage), totalPages);
                  const start = (page - 1) * PAGE_SIZE;
                  const pageItems = filtered.slice(start, start + PAGE_SIZE);

                    return (
                    <>
                      <div className={viewMode==='grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
                        {pageItems.map((it:any)=> {
                          const vocab = vocabList.find(v=>v.id===it.vocabulary_id) || {id:it.vocabulary_id, hanzi: it.hanzi||'—', meaning: ''} as any;
                          return (
                            <div key={it.vocabulary_id}>
                              {selectMode && <div className="mb-2"><input type="checkbox" className="rounded-full" checked={!!selected[it.vocabulary_id]} onChange={()=>toggleSelect(it.vocabulary_id)} /></div>}
                              <div onClick={()=>{ setOpenedVocab(vocab); setDetailOpen(true); }}>
                                <VocabularyCard vocab={vocab} viewMode={viewMode} onOpen={()=>{ setOpenedVocab(vocab); setDetailOpen(true); }} selectable={selectMode} checked={!!selected[it.vocabulary_id]} onToggle={()=>toggleSelect(it.vocabulary_id)} />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </>
                  );
                })()}
              </div>
            </div>

            {/* Pagination: fixed at bottom of the big card */}
            <div className="mt-3 flex items-center justify-center gap-2">
              {(() => {
                const filtered = (notebook.items || []).filter((it:any)=>{
                  if(!debouncedSearch.trim()) return true;
                  const v = vocabList.find(v=>v.id===it.vocabulary_id);
                  const hay = `${v?.hanzi||''} ${v?.pinyin||''} ${v?.meaning||''}`.toLowerCase();
                  return hay.includes(debouncedSearch.toLowerCase());
                });
                const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
                const page = Math.min(Math.max(1, currentPage), totalPages);
                return (
                  <>
                    <button className="px-2 py-1 border rounded" onClick={()=>setCurrentPage(1)} disabled={page===1}>≪</button>
                    <button className="px-2 py-1 border rounded" onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} disabled={page===1}>←</button>
                    <div className="px-3 py-1 bg-gray-100 rounded-full font-medium">{page}</div>
                    <div className="text-sm text-gray-600">of {totalPages}</div>
                    <button className="px-2 py-1 border rounded" onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}>→</button>
                    <button className="px-2 py-1 border rounded" onClick={()=>setCurrentPage(totalPages)} disabled={page===totalPages}>≫</button>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Right: utilities */}
        <div className="w-1/3">
          <div className="p-3 border rounded space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Tìm trong sổ tay</label>
                  <input placeholder="Hanzi / Pinyin / Nghĩa" value={search} onChange={e=>setSearch(e.target.value)} className="w-full p-2 border rounded" />
                </div>

            <div>
              <label className="block text-sm font-medium mb-1">Import từ Excel</label>
              <input type="file" accept=".xlsx,.csv" onChange={async (e)=>{
                const f = e.target.files?.[0];
                if(!f) return;
                // Mock parsing: create 2 vocab items using filename
                const mockItems = [
                  { hanzi: '测试', pinyin: 'cèshì', meaning: 'kiểm tra', notes: 'từ thử nghiệm' },
                  { hanzi: '你', pinyin: 'nǐ', meaning: 'bạn', notes: 'từ phổ biến' },
                ];
                // attempt to create vocab entries so they show info in notebook
                const created: any[] = [];
                for(const mi of mockItems){ const cv = await createVocabulary(mi); created.push(cv); }
                // find duplicates by hanzi+pinyin against existing notebook items
                const existing = vocabList.map(v=>`${v.hanzi}||${v.pinyin}`);
                const duplicates = created.filter(mi=> existing.includes(`${mi.hanzi}||${mi.pinyin}`));
                setImportItems(created);
                setImportDuplicates(duplicates);
                setImportPreviewOpen(true);
              }} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Thao tác nhanh</label>
              <div className="flex flex-col gap-2">
                <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border" onClick={handleBulkSoftDelete} disabled={bulkLoading || selectedIds.length===0}>🗑️ Gỡ khỏi sổ tay</button>
                <button
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-red-600 text-white disabled:opacity-50"
                  onClick={handleBulkHardDelete}
                  disabled={bulkLoading || selectedIds.length===0 || currentUser?.role!=='super admin'}
                  title={currentUser?.role !== 'super admin' ? 'Chỉ Super Admin mới được xóa vĩnh viễn' : 'Xóa vĩnh viễn'}
                >
                  ❌ Xóa vĩnh viễn
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Thùng rác</label>
              <div className="flex gap-2">
                <button
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-colors"
                  onClick={() => navigate(`/notebooks/${id}/trash`)}
                >
                  <FolderOpen className="w-4 h-4" />
                  Mở Thùng rác
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  <AddVocabularyModal isOpen={addOpen} onClose={()=>setAddOpen(false)} onAdd={async (items)=>{
        // create vocabularies for any new items so they appear with details
        const created: any[] = [];
        for(const it of items){
          if(!it.id){ const cv = await createVocabulary(it); created.push(cv); } else created.push(it);
        }
        // add created ids into notebook
        if(id) await addItemsToNotebook(id, created.map(c=>c.id));
        setAddOpen(false);
        await loadNotebookAndVocab();
        toast.push('Đã thêm từ vào sổ tay', 'success');
      }} />
        <VocabularyDetailModal vocab={openedVocab} isOpen={detailOpen} onClose={async (updated?:boolean)=>{ setDetailOpen(false); setOpenedVocab(null); if(updated) await loadNotebookAndVocab(); }} onSave={async (data)=>{
          if(!openedVocab) return;
          await updateVocabulary(openedVocab.id, data as any);
        }} />
      <ImportPreviewModal isOpen={importPreviewOpen} items={importItems} duplicates={importDuplicates} onClose={()=>setImportPreviewOpen(false)} onProceed={async (strategy)=>{
        // mock import action
        if(strategy === 'overwrite'){
          // pretend overwrite
          for(const it of importItems) { await addItemsToNotebook(id!, [it.id]); }
        } else {
          for(const it of importItems) { if(!importDuplicates.find(d=>d.hanzi===it.hanzi && d.pinyin===it.pinyin)) await addItemsToNotebook(id!, [it.id]); }
        }
        setImportPreviewOpen(false);
        await loadNotebookAndVocab();
        toast.push('Import hoàn tất (mock)', 'success');
      }} />
    </div>
  );
};

export default NotebookDetail;
