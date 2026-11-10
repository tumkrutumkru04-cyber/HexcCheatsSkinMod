(() => {
  const prefixes={'android-normal':'HEX CHEATS SKINMOD Android FF Standard','android-max':'HEX CHEATS SKINMOD Android FF MAX','ios-normal':'HEX CHEATS SKINMOD iOS FF Standard','ios-max':'HEX CHEATS SKINMOD iOS FF MAX'};
 const usedCodes=new Set();
 let lastCode;try{lastCode=localStorage.getItem("alok-last-export-code");}catch{}
 window.alokPackageDownload=(bytes,version)=>{
   if(!prefixes[version])throw Error('Invalid version.');
  let packed=bytes;
  // Never ship attribution or miscellaneous TXT files inside user downloads.
  try {
    const entries=fflate.unzipSync(bytes);
    for (const name of Object.keys(entries)) {
      if (/\.txt$/i.test(name) || /HEX CHEATS SKINMOD/i.test(name)) delete entries[name];
    }
    packed=fflate.zipSync(entries,{level:0});
  } catch {}
  if(usedCodes.size>=67600)usedCodes.clear();
  let code;
  do{
   const random=new Uint32Array(1);crypto.getRandomValues(random);
   if(random[0]>=4294966000)continue;
   const value=random[0]%67600;
   code=String.fromCharCode(65+Math.floor(value/2600),65+Math.floor(value/100)%26)+String(value%100).padStart(2,'0');
  }while(!code||usedCodes.has(code)||code===lastCode);
  usedCodes.add(code);lastCode=code;try{localStorage.setItem('alok-last-export-code',code);}catch{}
  return {bytes:packed,name:prefixes[version]+' '+code+'.zip'};
 };
})();