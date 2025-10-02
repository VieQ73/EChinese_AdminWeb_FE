import { useEffect, useState } from 'react';
import { fetchAllBadgeLevels } from './badgeApi';

let _cache: any[] | null = null;

export function clearBadgeListCache(){ _cache = null; }

export function useBadgeList(){
  const [badges, setBadges] = useState<any[] | null>(() => _cache || null);
  useEffect(()=>{
    let mounted = true;
    (async ()=>{
      if(_cache){ if(mounted) setBadges(_cache); return; }
      try{
        const b = await fetchAllBadgeLevels();
        _cache = b;
        if(mounted) setBadges(b);
      }catch(e){ console.error('useBadgeList failed', e); }
    })();
    return ()=>{ mounted = false; };
  },[]);
  return badges;
}
