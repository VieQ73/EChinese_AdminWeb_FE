import { useEffect, useState } from 'react';
import { fetchAllBadgeLevels } from './badgeApi';

// Simple module-level cache to avoid refetching badge levels repeatedly
let _cache: Array<any> | null = null;

export function useBadgeLevels() {
  const [badgeMap, setBadgeMap] = useState<Record<number,string>>(() => {
    if (!_cache) return {};
    const m: Record<number,string> = {};
    _cache.forEach((b:any) => { if (b.icon) m[b.level] = b.icon; });
    return m;
  });

  useEffect(()=>{
    let mounted = true;
    (async ()=>{
      if (_cache) {
        if (!mounted) return;
        const m: Record<number,string> = {};
        _cache.forEach((b:any)=>{ if(b.icon) m[b.level]=b.icon; });
        setBadgeMap(m);
        return;
      }
      try{
        const badges = await fetchAllBadgeLevels();
        _cache = badges;
        if(!mounted) return;
        const m: Record<number,string> = {};
        badges.forEach((b:any)=>{ if(b.icon) m[b.level]=b.icon; });
        setBadgeMap(m);
      }catch(e){ console.debug('useBadgeLevels failed', e); }
    })();
    return ()=>{ mounted = false; };
  }, []);

  return badgeMap;
}

export function clearBadgeLevelsCache(){ _cache = null; }
