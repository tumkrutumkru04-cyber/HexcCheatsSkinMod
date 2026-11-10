(() => {
 let id=0;
 const workers=new Map();
 const pending=new Map();
 const recent=new Map(),running=new Map();
 window.alokPackagedExports=new WeakSet();
 function getWorker(version,characterId){
  const lane=characterId+'|'+(version.endsWith('-max')?1:0);
  if(workers.has(lane))return workers.get(lane);
  const worker=new Worker('./js/worker.js');workers.set(lane,worker);
  worker.onmessage=event=>{
   const message=event.data,task=pending.get(message.id);if(!task)return;
   if(message.error){pending.delete(message.id);task.reject(Error(message.error));}
   else if(message.result){pending.delete(message.id);const bytes=new Uint8Array(message.result);window.alokPackagedExports.add(bytes);task.resolve(bytes);}
   else if(message.progress!==undefined)task.progress?.(message.progress);
  };
  worker.onerror=()=>{
   for(const [requestId,task]of pending)if(task.worker===worker){pending.delete(requestId);task.reject(Error('This browser cannot build the file. Use the latest Chrome or Edge.'));}
   worker.terminate();workers.delete(lane);
  };
  return worker;
 }
  window.alokCancelExport=()=>{for(const w of workers.values())w.terminate();workers.clear();for(const task of pending.values())task.reject(new DOMException('Export cancelled','AbortError'));pending.clear();running.clear();};
 window.alokExport = (selection,version,progress) => {
  const assets=window.alokWardrobe.assets;const voice='fish'; if(assets.characterId==='ignis'&&assets.itemCatalog.top[selection.top]?.id==='top-sasuke')return window.ignisIG38Export(assets,selection,version,progress);
  if((!assets.voiceProfile?.enabled||voice==='alok') && Object.keys(selection).every(k=>assets.itemCatalog[k]?.[selection[k]]?.default)){
   const original=assets.originals[version];if(!original||!assets.downloads[original.url])return Promise.reject(Error('The original character file is missing for this version.'));
   const binary=atob(assets.downloads[original.url]);const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));progress?.(100);return Promise.resolve(bytes);
  }
  const engine=assets.mixEngine;
  const cacheKey=(assets.characterId||'alok')+'|'+voice+'|'+version+'|'+Object.keys(selection).sort().map(k=>assets.itemCatalog[k][selection[k]].id).join('|');
  if(recent.has(cacheKey)){
   const bytes=recent.get(cacheKey);recent.delete(cacheKey);recent.set(cacheKey,bytes);
   progress?.(100);return Promise.resolve(bytes);
  }
  if(running.has(cacheKey))return running.get(cacheKey);
  const patches=[],objects={};const donorSasuke=assets.characterId==='ignis'&&assets.itemCatalog.top[selection.top]?.id==='top-sasuke';
  for(const field of Object.keys(selection)){
   const item=assets.itemCatalog[field][selection[field]];
   if(item.default||(donorSasuke&&field==='top'))continue;
   const key=item.motionPatchByVersion?.[version]||item.patchByVersion?.[version],refs=(donorSasuke?engine.donorPatches:engine.patches)[key];
   if(!refs) return Promise.reject(Error('Missing data for '+item.name+' for the selected version.'));
   patches.push(refs);for(const hash of Object.values(refs))objects[hash]=engine.objects[hash];
  }
  const hair=assets.itemCatalog.hair[selection.hair];const useHairMotion=hair?.id==='hair-dao-si-do' && !!hair.motionPatchByVersion?.[version];const base={...(assets.characterId==='ignis'?(assets.itemCatalog.top[selection.top]?.id==='top-sasuke'?engine.sasukeVfxBases[version]:engine.bases[version]):(useHairMotion?engine.hairMotionBases[version]:engine.bases[version])),compactCAB:assets.characterId==='alok'||donorSasuke},compressed={};
  const chosen={};for(const refs of patches)for(const [pid,hash]of Object.entries(refs))chosen[pid]=objects[hash];
  const blocks=[...base.fast.metadata,...base.fast.resources,...base.fast.blocks.map(b=>chosen[b.pid]||b)];
  for(const block of blocks)compressed[block.key]=engine.compressed[block.key];
  const result=new Promise((resolve,reject)=>{
   const requestId=++id;
   try{const worker=getWorker(version,assets.characterId);pending.set(requestId,{resolve,reject,progress,worker});worker.postMessage({id:requestId,base,objects,patches,version,compressed});}
   catch(error){pending.delete(requestId);reject(error);}
  }).then(bytes=>{
   recent.set(cacheKey,bytes);while(recent.size>4)recent.delete(recent.keys().next().value);
   return bytes;
  }).finally(()=>running.delete(cacheKey));
  running.set(cacheKey,result);return result;
 };
})();
