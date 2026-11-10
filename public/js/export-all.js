(() => {
 const versions=[
  ['android-normal','Android_FF_STANDARD.zip','Android · FF Standard'],
  ['android-max','Android_FF_MAX.zip','Android · FF MAX'],
  ['ios-normal','iOS_FF_STANDARD.zip','iOS · FF Standard'],
  ['ios-max','iOS_FF_MAX.zip','iOS · FF MAX']
 ];
 window.alokExportAll=async (selection,progress) => {
  const assets=window.alokWardrobe.assets;
  const chosen={...selection};
  for(const [version] of versions)for(const field of ['hair','top','bottom','shoes','mask','face','action']){
   const item=assets.itemCatalog[field]?.[chosen[field]];
   if(!item||!assets.versionInventory[version]?.[field]?.includes(item.id))throw Error('The selected item is not available for all four versions.');
   if(!item.default&&!assets.mixEngine.patches[item.patchByVersion?.[version]])throw Error('Missing data for '+item.name+' cho '+version+'.');
  }
  const completed=new Array(4).fill(0),results=new Array(4);
  const cores=Number(navigator.hardwareConcurrency)||2;
  const memory=Number(navigator.deviceMemory)||4;
  const lanes=cores>=4&&memory>=4?2:1;
  let failed=false;
  const report=(index,p)=>{
   completed[index]=Math.max(completed[index],Math.min(100,Math.max(0,Number(p)||0)));
   progress?.(Math.floor(completed.reduce((a,b)=>a+b,0)/4),versions[index][2]);
  };
  const tasks=Array.from({length:lanes},async(_,lane)=>{
   for(let index=lane;index<versions.length;index+=lanes){
    if(failed)return;
    const [version]=versions[index];report(index,0);
    try{results[index]=await window.alokExport(chosen,version,p=>report(index,p));report(index,100);}
    catch(error){failed=true;throw error;}
   }
  });
  const settled=await Promise.allSettled(tasks);
  const error=settled.find(result=>result.status==='rejected');if(error)throw error.reason;
  return Object.fromEntries(versions.map((entry,index)=>[entry[1],results[index]]));
 };
})();