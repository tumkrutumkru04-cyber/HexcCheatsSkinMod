
(() => {
  const $ = id => document.getElementById(id);
  const fields = ['hair','top','bottom','shoes','mask','face','action'];
  let assets = window.__alokPackedAssets || JSON.parse($('alok-data').textContent);
  delete window.__alokPackedAssets;
  const alokAssets={...assets};delete alokAssets.characters;
  const characterAssets={alok:alokAssets};
  delete assets.characters;
  const getVersion = () => window.currentAlokVersion || 'android-normal';
  const getVoice=()=> 'fish';
  const selection = () => Object.fromEntries(fields.map(k => [k, Number($(k).value)]));
  const picked = (field, s=selection()) => assets.itemCatalog[field][s[field]];

  // The packed catalog came from a multilingual source. Keep the data IDs
  // intact for export compatibility, but expose clean English labels in every
  // selector, picker, and selection summary.
  const englishWords = {
    ac:'evil', an:'peace', ao:'shirt', angelic:'angelic', anbu:'anbu', ao:'top',
    bong:'ball', bo:'set', boong:'basketball', booyah:'booyah', biker:'biker',
    bich:'jade', black:'black', blue:'blue', bong:'basketball', brazil:'Brazil',
    brazill:'Brazil', buddha:'buddha', buoc:'step', cai:'item', ca:'fish',
    cao:'premium', cap:'premium', caption:'caption', cat:'cat', cau:'player',
    chien:'warrior', chinh:'conquer', cho:'dog', cong:'tech', con:'wrath',
    cuong:'frenzy', cuop:'pirate', da:'soccer', dau:'fighter', dep:'flip-flops',
    dia:'earth', di:'go', duong:'street', dong:'uniform', esports:'esports',
    face:'face', phong:'style', phuong:'phoenix', fire:'fire', game:'game',
    gia:'join', galaxy:'galaxy', gojo:'Gojo', gold:'gold', hac:'dark',
    hacker:'hacker', hanh:'action', hello:'Hello', ho:'rain', hoa:'flame',
    hoang:'emperor', hu:'void', huyet:'blood', hy:'pig', khach:'traveler',
    ky:'pig', lan:'wave', lang:'rogue', lua:'fire', luot:'glide', manh:'powerful',
    ma:'demon', mac:'default', mat:'face', mordecai:'Mordecai', mua:'rain',
    nam:'male', ngao:'bold', nghe:'tech', nguoi:'player', ngu:'sleep',
    neon:'neon', nhan:'spider', nham:'lava', noel:'Santa', nua:'half',
    ong:'bee', phong:'style', phuong:'phoenix', pink:'pink', purple:'purple',
    qua:'black', quai:'monster', quan:'bottom', quang:'light', quy:'demon',
    red:'red', rong:'dragon', rua:'turtle', sat:'steel', squid:'Squid',
    street:'Street', su:'messenger', sao:'star', soai:'zombie', soc:'shorts',
    soi:'wolf', tay:'long-sleeve', thang:'victory', thanh:'holy', thien:'angel',
    tho:'rabbit', thoi:'space', thu:'commander', thuc:'awaken', tien:'fairy',
    titan:'Titan', top:'top', trai:'wild', trieu:'summon', tu:'from', tuong:'commander',
    violet:'purple', vo:'faceless', vu:'dance', vang:'gold', ve:'guardian',
    white:'white', xam:'gray', xanh:'blue', xoa:'remove', yellow:'yellow',
    yen:'peace', y:'and', z:'',
  };
  const englishExact = {
    'hair-lang-khach-tim':'Purple Rogue', 'hair-soi-cong-nghe':'Tech Wolf',
    'hair-hac-tinh':'Dark Star', 'hair-bich-vang':'Golden Jade',
    'hair-tieu-tien':'Little Fairy', 'hair-duong-pho-cao-cap':'Premium Street',
    'hair-trai-ngo-ngao':'Bold Wild Boy', 'hair-xoa':'Remove hair',
    'top-ve-binh-tinh-tu':'Star Guardian', 'top-quy-lua':'Fire Demon',
    'top-qua-den':'Black Crow', 'top-xoa':'Remove top',
    'bottom-thien-than-thanh-thien':'Pure Angel', 'bottom-xoa':'Remove bottom',
    'shoes-dep-di-bien':'Beach Flip-flops', 'shoes-xoa':'Remove shoes',
    'mask-su-gia-ac-ma':'Demon Messenger', 'mask-xoa':'Remove mask',
    'face-tiec-cuong-loan':'Frenzy Party', 'face-xoa':'Remove face',
  };
  const englishNames = {
    'hair-lang-khach-tim':'Purple Rogue','hair-default':'Default','hair-soi-cong-nghe':'Tech Wolf','hair-hac-tinh':'Dark Star','hair-tieu-tien':'Little Fairy','hair-duong-pho-cao-cap':'Premium Street','hair-trai-ngo-ngao':'Bold Wild Boy','hair-duong-pho':'Street Style','hair-bich-vang':'Golden Jade','hair-hac-anh-tinh-ha':'Dark Galaxy','hair-dao-si-do':'Red Swordsman','hair-lan-song-nang-dong':'Dynamic Wave','hair-ghet-su-gia-doi':'Hate the Lies','hair-phu-thuy':'Witch Hunter','hair-bushido':'Bushido','hair-bushido-cao-cap':'Premium Bushido','hair-su-gia-ac-ma':'Demon Messenger','hair-xoa':'Remove Hair','hair-chien-binh-tho':'Rabbit Warrior','hair-soai-ca-cuong-thi':'Zombie Rockstar','hair-tho-black':'Black Rabbit','hair-quai-nhan-hu-khong':'Void Monster','hair-tho-white':'White Rabbit','hair-tho-quay':'Playful Rabbit','hair-tho-red':'Red Rabbit','hair-tho-thien-ha':'Galaxy Rabbit','hair-tho-pink':'Pink Rabbit','hair-tho-purple':'Purple Rabbit','hair-tho-yellow':'Yellow Rabbit','hair-alien-x':'Alien X','hair-caption-american':'American Caption','hair-titan-tien-cong':'Titan Assault','hair-titan-thiet-giap':'Titan Armor','hair-nguoi-nhen':'Spider-Man','hair-tho-san-huyet-quy':'Blood Demon Hunter','hair-mordecai':'Mordecai','hair-nguoi-nhen-full-set':'Spider-Man Full Set','hair-ky-hoa':'Sketch','hair-phac-thao':'Draft','hair-chieu-mua':'Rainy Afternoon','hair-bach-tuoc-ca':'Octopus','hair-bom':'Mohawk','hair-chien-binh-tuyet-bang':'Ice Warrior','hair-chien-than-esports':'Esports Champion','hair-chien-than-phong-cach-tim':'Purple Style Champion','hair-chien-than-phong-cach-vang':'Gold Style Champion','hair-chien-than-phong-cach-xanh':'Blue Style Champion','hair-chien-than-phong-cach-do':'Red Style Champion',
    'top-ve-binh-tinh-tu':'Star Guardian','top-quy-lua':'Fire Demon','top-default':'Default','top-qua-den':'Black Crow','top-cuop-bien-nam':'Male Pirate','top-dau-si-huyen-thoai':'Legendary Fighter','top-nguoi-choi-squid':'Squid Player','top-thu-linh-binh-doan':'Squad Commander','top-thiet-quyen':'Steel Fist','top-da-bong-anh':'England Football','top-lv-up':'Level UP','top-da-bong-den':'Black Football','top-tho-quay':'Playful Rabbit','top-peru':'Peru Football','top-ao-bong-bi':'Belgium Football','top-da-bong-argentina':'Argentina Football','top-da-bong-duc':'Germany Football','top-co-rua-trang':'White Turtleneck','top-bong-ma-phia-tay':'Western Phantom','top-duong-pho':'Street Style','top-cau-thu-tay-dai':'Long-Sleeve Player','top-duong-pho-cao-cap':'Premium Street','top-co-rua-den':'Black Turtleneck','top-gojo':'Satoru Gojo','top-hello-kitty':'Hello Kitty','top-hello-kitty-xanh':'Blue Hello Kitty','top-vo-dien-loi-than':'Thunder Faceless','top-bushido':'Bushido','top-bushido-cao-cap':'Premium Bushido','top-da-biker':'Biker Leather','top-xoa':'Remove Top','top-chien-binh-tho':'Rabbit Warrior','top-trai-ngo-ngao':'Bold Wild Boy','top-quai-nhan-hu-khong-black':'Black Void Monster','top-quai-nhan-hu-khong':'Void Monster','top-quai-nhan-hu-khong-white':'White Void Monster','top-quai-nhan-hu-khong-blue':'Blue Void Monster','top-tho-neon':'Neon Rabbit','top-tho-red':'Red Rabbit','top-tho-black':'Black Rabbit','top-tho-pink':'Pink Rabbit','top-tho-purple':'Purple Rabbit','top-tho-yellow':'Yellow Rabbit','top-thich-khach-kim-long':'Golden Dragon Assassin','top-ngu-thanh-phong':'Fluffy Sleepwear','top-thich-khach-bong-dem':'Night Assassin','top-titan-tien-cong':'Titan Assault','top-titan-thiet-giap':'Titan Armor','top-nguoi-nhen':'Spider-Man','top-hac-ginh':'Dark Glory','top-da-bong-brazill':'Brazil Football','top-3-lo-trang':'Three-Hole White',
    'bottom-thien-than-thanh-thien':'Pure Angel','bottom-ngu-thanh-phong':'Fluffy Sleepwear','bottom-default':'Default','bottom-sooc-den':'Black Shorts','bottom-ve-binh-tinh-tu':'Star Guardian','bottom-phong-cach-street':'Street Style','bottom-bong-chay':'Baseball','bottom-thien-than-hoang-kim':'Golden Angel','bottom-tham-hiem-hong-thien':'Pink Sky Explorer','bottom-tre-trau':'Young Buffalo','bottom-tham-hiem-loi-lac':'Elite Explorer','bottom-pyjama-gau-truc':'Panda Pajamas','bottom-angelic-neon':'Angelic Neon','bottom-bang-cuop-dem':'Night Bandit','bottom-duong-pho':'Street Style','bottom-chien-binh-tho':'Rabbit Warrior','bottom-duong-pho-cao-cap':'Premium Street','bottom-dong-phuc-anh':'England Uniform','bottom-gojo':'Satoru Gojo','bottom-hello-kitty':'Hello Kitty','bottom-hello-kitty-xanh':'Blue Hello Kitty','bottom-vo-dien-loi-than':'Thunder Faceless','bottom-bushido':'Bushido','bottom-bushido-cao-cap':'Premium Bushido','bottom-ky-hoi':'Year of the Pig','bottom-xoa':'Remove Bottom','bottom-dau':'Strawberry','bottom-quai-nhan-hu-khong-black':'Black Void Monster','bottom-quai-nhan-hu-khong':'Void Monster','bottom-quai-nhan-hu-khong-white':'White Void Monster','bottom-quai-nhan-hu-khong-blue':'Blue Void Monster','bottom-dau-si-tho':'Rabbit Fighter','bottom-tho-red':'Red Rabbit','bottom-tho-thien-ha':'Galaxy Rabbit','bottom-tho-pink':'Pink Rabbit','bottom-tho-purple':'Purple Rabbit','bottom-tho-yellow':'Yellow Rabbit','bottom-hac-tinh':'Dark Star','bottom-hoa-quyen-su':'Flame Fist','bottom-nguoi-nhen':'Spider-Man','bottom-nguoi-choi-squid-game':'Squid Game Player','bottom-dau-sy-huyen-thoai':'Legendary Fighter','bottom-ac-quy':'Demon','bottom-boy-pho':'Street Boy','bottom-bo-rach-roi':'Ripped Cow',
    'shoes-dep-di-bien':'Beach Flip-flops','shoes-default':'Default','shoes-hacker':'Super Hacker','shoes-dep-heo-u':'Pig Flip-flops','shoes-bong-ro':'Basketball','shoes-thanh-phong':'Fluffy Shoes','shoes-ca-sau':'Crocodile','shoes-ca-map':'Shark','shoes-hello-kitty':'Hello Kitty','shoes-vo-dien-loi-than':'Thunder Faceless','shoes-bushido-cao-cap':'Premium Bushido','shoes-bong-gau-do':'Red Bear','shoes-xoa':'Remove Shoes','shoes-chien-binh-tho':'Rabbit Warrior','shoes-bushido':'Bushido','shoes-dau-si-tho':'Rabbit Fighter','shoes-tho-black':'Black Rabbit','shoes-nguoi-nhen':'Spider-Man','shoes-hac-tinh':'Dark Star','shoes-hoang-de-hai-huoc':'Funny Emperor','shoes-he-vui-ve':'Happy Summer','shoes-hoi-tho-mua-he':'Summer Breeze','shoes-hoa-quyen-su':'Flame Fist','shoes-thien-than':'Angel','shoes-to-ong':'Beehive','shoes-dau-rang':'Toothache','shoes-di-bien-vang':'Golden Beach',
    'mask-su-gia-ac-ma':'Demon Messenger','mask-default':'Default','mask-ma-bup-be-nham-thach':'Lava Doll','mask-noel':'Santa Claus','mask-chien-than-dung-nham':'Lava Champion','mask-chien-than':'Warrior Champion','mask-ma-bup-be':'Doll Mask','mask-hac-anh-tinh-ha':'Dark Galaxy','mask-hac-tinh':'Dark Star','mask-tien-si-con-trung':'Insect Doctor','mask-vo-dien-loi-than':'Thunder Faceless','mask-bushido':'Bushido','mask-bushido-cao-cap':'Premium Bushido','mask-xoa':'Remove Mask','mask-trai-ngo-ngao':'Bold Wild Boy','mask-titan-tien-cong':'Titan Assault','mask-titan-thiet-giap':'Titan Armor','mask-anbu':'Anbu','mask-mordecai':'Mordecai','mask-bang-che-mat-quan-lot':'Underwear Eye Band','mask-bang-che-mat-ao-lot':'Bra Eye Band','mask-ffwc-2025':'FFWC 2025','mask-ffws-2025':'FFWS 2025','mask-hello-kitty':'Hello Kitty',
    'face-default':'Default','face-tiec-cuong-loan':'Frenzy Party','face-xoa':'Remove Face',
    'action-m60-pha-mong':'M60 – Dream Breaker','action-dia-chan-sac-mau':'Color Earthquake','action-default':'Default','action-gia-nhap-chinh-phuc':'Join the Conquest','action-hac-thach-long':'Dark Stone Dragon','action-phat-sung-sac-mau':'Color Shot','action-ac-nhan-bo-cap':'Scorpion Villain','action-vo-luong-thoi-khong':'Boundless Space-Time','action-trieu-hoi-manh-ho':'Summon Tiger','action-hac-anh':'Dark Shadow','action-awm':'AWM','action-trieu-hoi-cuong-long':'Summon Furious Dragon','action-thoi-khac-hoang-kim':'Golden Moment','action-booyah-phong-cach':'Stylish Booyah','action-con-thinh-no':'Wrath','action-huyet-nguyet-tram':'Blood Moon Slash','action-phuong-hoang-xuat-the':'Phoenix Rising','action-du-ngoan-dai-duong':'Ocean Voyage','action-ho-mua-goi-sung':'Rain of Guns','action-thi-uy-long-trao':'Dragon Claw Display','action-long-vu-vang':'Golden Feathers','action-luot-tren-may':'Cloud Glide','action-mang-xa-xuat-tran':'Python Arrival','action-sinh-ra-tu-lua':'Born from Fire','action-thuc-tinh-long-toc':'Dragon Awakening','action-trieu-hoi-rong':'Summon Dragon','action-trieu-hoi-sung':'Summon Gun','action-tu-long-xuat-hien':'Purple Dragon Appears','action-duong-kiem-anh-sang':'Light Sword',
  };
  const englishSlug = {
    ac:'evil', alien:'Alien', american:'American', anbu:'Anbu', angelic:'Angelic',
    anh:'English', ao:'Top', argentina:'Argentina', awm:'AWM', bach:'white',
    bang:'band', be:'baby', bich:'jade', bien:'Beach', biker:'Biker', binh:'Warrior',
    black:'Black', blue:'Blue', bo:'Set', bom:'bomb', bong:'ball', boy:'Boy',
    brazill:'Brazil', bup:'doll', bushido:'Bushido', ca:'fish', cach:'style',
    cao:'Premium', cap:'Premium', caption:'Caption', cau:'Player', chan:'leg',
    chay:'fire', che:'cover', chien:'Warrior', chieu:'skill', chinh:'Conqueror',
    choi:'Player', co:'turtle', con:'Wrath', cong:'Tech', cuong:'Frenzy', cuop:'Pirate',
    da:'Soccer', dai:'Long', dao:'Swordsman', dau:'Fighter', de:'easy', dem:'Night',
    den:'Black', dep:'Flip-flops', di:'Go', dia:'Earth', dien:'Electric', do:'Red',
    doan:'Squad', doi:'False', dong:'Uniform', du:'enough', duc:'Germany',
    dung:'Stand', duong:'Street', ffwc:'FFWC', ffws:'FFWS', full:'Full', game:'Game',
    gau:'Bear', ghet:'Hate', gia:'Join', giap:'Armor', ginh:'Glory', goi:'Call',
    ha:'Summer', hac:'Dark', hacker:'Hacker', hai:'Sea', he:'Summer', heo:'Pig',
    hiem:'Rare', hien:'Kind', ho:'Rain', hoa:'Flame', hoang:'Emperor', hoi:'Summer',
    hong:'Pink', hu:'Void', huoc:'Humor', huyen:'Legendary', huyet:'Blood',
    khac:'Other', khach:'Traveler', khong:'Void', kiem:'Sword', kim:'Golden',
    kitty:'Kitty', ky:'Pig', lac:'Strange', lan:'Wave', lang:'Rogue', linh:'Spirit',
    lo:'Slot', loan:'Chaos', loi:'Thunder', long:'Dragon', lot:'Lining', lua:'Fire',
    luong:'Power', luot:'Glide', lv:'Level', m60:'M60', ma:'Demon', mang:'Network',
    manh:'Mighty', map:'Lava', mat:'Face', mau:'Color', may:'Cloud', mong:'Dream',
    mua:'Rain', nam:'Male', nang:'Dynamic', ngao:'Bold', nghe:'Tech', ngo:'Wild',
    ngoan:'Naughty', ngu:'Sleep', nguoi:'Player', nguyet:'Moon', nham:'Lava',
    nhan:'Spider', nhap:'Enter', nhen:'Spider', no:'Explosive', noel:'Santa',
    ong:'Bee', peru:'Peru', pha:'Break', phac:'Sketch', phat:'Fire', phia:'West',
    pho:'Street', phong:'Style', phu:'Wizard', phuong:'Phoenix', pink:'Pink',
    purple:'Purple', pyjama:'Pajama', qua:'Crow', quai:'Monster', quan:'Bottom',
    quay:'Playful', quy:'Demon', quyen:'Fist', ra:'Out', rach:'Ripped', rang:'Tooth',
    red:'Red', ro:'Clear', roi:'Messy', rong:'Dragon', rua:'Turtle', sac:'Color',
    san:'Hunter', sang:'Bright', sau:'Crocodile', set:'Set', si:'Warrior', sinh:'Born',
    soai:'Zombie', soi:'Wolf', song:'Wave', sooc:'Shorts', squid:'Squid', street:'Street',
    su:'Messenger', sung:'Gun', sy:'Warrior', tay:'Sleeve', thach:'Stone', tham:'Explore',
    than:'God', thanh:'Holy', thao:'Wild', the:'World', thi:'Show', thich:'Assassin',
    thien:'Angel', thiet:'Steel', thinh:'Wrath', tho:'Rabbit', thoai:'Relax', thoi:'Space',
    thu:'Commander', thuc:'Awaken', thuy:'Water', tiec:'Party', tien:'Fairy', tieu:'Little',
    tim:'Purple', tinh:'Star', titan:'Titan', to:'Hornet', toc:'Hair', trai:'Wild',
    tram:'Strike', tran:'Battle', trang:'White', trao:'Claw', trau:'Buffalo', tre:'Young',
    tren:'Sky', trieu:'Summon', truc:'Bamboo', trung:'Center', tu:'From', tuoc:'Bird',
    tuyet:'Snow', u:'Sad', up:'Up', uy:'Power', vang:'Gold', ve:'Guardian', vo:'Faceless',
    vu:'Dance', vui:'Fun', white:'White', xa:'Away', xanh:'Blue', xoa:'Remove',
    xuat:'Appear', yellow:'Yellow', default:'Default'
  };
  const titleWord = word => englishSlug[word] || englishWords[word] || word.charAt(0).toUpperCase()+word.slice(1);
  function englishItemName(item, field, index) {
    if (englishNames[item.id]) return englishNames[item.id];
    if (englishExact[item.id]) return englishExact[item.id];
    if (item.default) return 'Default';
    const slug=item.id.replace(new RegExp('^'+field+'-'),'');
    if (!slug || slug==='default') return 'Default';
    const words=slug.split('-').map(titleWord).filter(Boolean);
    return words.length ? words.join(' ') : `${field} item ${index+1}`;
  }
  function translateCatalogNames() {
    for (const [field,items] of Object.entries(assets.itemCatalog||{})) {
      items.forEach((item,index)=>{ item.name=englishItemName(item,field,index); });
    }
  }
  translateCatalogNames();
  let downloading = false,exportAbort;
  function reportMod(p,step){const n=Math.max(Number($('mod-progress-bar').value)||0,Math.min(100,Math.floor(p)));$('mod-progress-bar').value=n;$('mod-progress-percent').textContent=n+'%';$('mod-progress-step').textContent=step;}
  function startMod(){exportAbort=new AbortController();$('mod-progress-bar').value=0;$('mod-progress-percent').textContent='0%';$('mod-progress').hidden=false;$('mod-cancel').disabled=false;reportMod(0,'Checking export readiness…');}
  function checkCancelled(){if(exportAbort.signal.aborted)throw new DOMException('Export cancelled','AbortError');}
  $('mod-cancel').addEventListener('click',()=>{exportAbort?.abort();window.alokCancelExport();});

  let fourDownloadUrls=[];
  window.addEventListener('beforeunload',()=>fourDownloadUrls.forEach(url=>URL.revokeObjectURL(url)));
  const cookieGet = name => { const row = document.cookie.split('; ').find(item => item.startsWith(name + '=')); return row ? decodeURIComponent(row.slice(name.length + 1)) : ''; };
  const cookieSet = (name, value, maxAge = 31536000) => { document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`; };
  const storageKey = () => 'wardrobe-selection-'+assets.characterId+'-' + getVersion();
  const uiCookieKey = () => 'hex_ui_loadout_' + assets.characterId + '_' + getVersion();
  function fileForSelection(s=selection()) {

    if((!assets.voiceProfile?.enabled||getVoice()==='alok') && fields.every(k=>picked(k,s).default)) return assets.originals[getVersion()];
    return {dynamic:true, url:'alok-phoi-cheo-'+getVersion()+'.zip'};
  }
  function setDefaults() {
    fields.forEach(k => $(k).value = String(assets.itemCatalog[k].findIndex(i=>i.default)));
  }
  const fullSetHairIds=new Set(['hair-alien-x','hair-nguoi-nhen-full-set','hair-caption-american']);
  const headOnlyHairIds=new Set(['hair-chien-binh-tho','hair-tho-black','hair-tho-pink','hair-tho-purple','hair-tho-quay','hair-tho-red','hair-tho-thien-ha','hair-tho-white','hair-tho-yellow','hair-quai-nhan-hu-khong']);
  function applyFullSetHair(){
    const hairId=picked('hair').id;
    const clearFields=fullSetHairIds.has(hairId)?['top','bottom','shoes','mask','face']:headOnlyHairIds.has(hairId)?['mask','face']:[];
    for(const field of clearFields){
      const index=assets.itemCatalog[field].findIndex(item=>item.id===field+'-xoa');
      if(index>=0&&[...$(field).options].some(option=>option.value===String(index)))$(field).value=String(index);
    }
  }
  const noShoesBottomIds=new Set(['bottom-quai-nhan-hu-khong-black','bottom-quai-nhan-hu-khong-blue','bottom-quai-nhan-hu-khong-white']);
  function applyBottomShoes(){
    if(!noShoesBottomIds.has(picked('bottom').id))return;
    const index=assets.itemCatalog.shoes.findIndex(item=>item.id==='shoes-xoa');
    if(index>=0&&[...$('shoes').options].some(option=>option.value===String(index)))$('shoes').value=String(index);
  }
  const titanTopIds=new Set(['top-titan-tien-cong','top-titan-thiet-giap']);
  const titanMaskIds=new Set(['mask-titan-tien-cong','mask-titan-thiet-giap']);
  function applyTitanRules(source){
    const clearFields=source==='top'&&titanTopIds.has(picked('top').id)?['bottom','shoes']:source==='mask'&&titanMaskIds.has(picked('mask').id)?['face']:[];
    for(const field of clearFields){
      const index=assets.itemCatalog[field].findIndex(item=>item.id===field+'-xoa');
      if(index>=0&&[...$(field).options].some(option=>option.value===String(index)))$(field).value=String(index);
    }
  }
  function applyMordecai(source){
    if(source&&(!['hair','mask'].includes(source)||picked(source).id!==source+'-mordecai'))return;
    if(!source&&picked('hair').id!=='hair-mordecai'&&picked('mask').id!=='mask-mordecai')return;
    for(const field of ['hair','top','bottom','shoes','mask','face']){
      const id=field+'-'+(['hair','mask'].includes(field)?'mordecai':'xoa');
      const index=assets.itemCatalog[field].findIndex(item=>item.id===id);
      if(index>=0&&[...$(field).options].some(option=>option.value===String(index)))$(field).value=String(index);
    }
  }
  function populate() {
    const inv = assets.versionInventory[getVersion()];
    fields.forEach(k => {
      $(k).replaceChildren();
      assets.itemCatalog[k].map((item,index) => ({item,index})).sort((a,b) => a.item.name.localeCompare(b.item.name,'en',{sensitivity:'base',numeric:true})).forEach(({item,index}) => {
        if(!inv[k].includes(item.id)) return;
        const option = new Option(item.name,String(index));
        option.dataset.itemId = item.id;
        $(k).add(option);
      });
    });
    setDefaults();
    let saved; try { saved=JSON.parse(cookieGet(uiCookieKey()) || localStorage.getItem(storageKey())); } catch {}
    if(saved && typeof saved==='object') fields.forEach(k => {
      const index=assets.itemCatalog[k].findIndex(i=>i.id===saved[k]);
      if([...$(k).options].some(o=>o.value===String(index))) $(k).value=String(index);
    });
    applyFullSetHair();applyTitanRules('top');applyBottomShoes();applyTitanRules('mask');applyMordecai();
  }
  let previewToken=0;
  function update() {
    const s=selection(), file=fileForSelection(s);
    const captions={hair:'Hair',top:'Top',bottom:'Bottom',shoes:'Shoes',mask:'Mask',face:'Face',action:assets.characterId==='ignis'?'Fist':'Action'};
    $('selection-summary').textContent=fields.map(k=>captions[k]+': '+picked(k,s).name).join('\n');
    if(assets.characterId==='alok')$('selection-summary').textContent+='';
    const savedUi = Object.fromEntries(fields.map(k=>[k,picked(k,s).id]));
    try { localStorage.setItem(storageKey(),JSON.stringify(savedUi)); } catch {}
    cookieSet(uiCookieKey(), JSON.stringify(savedUi));
    $('download').disabled = downloading || !file;
    $('download-all').disabled = downloading || !file;
    $('download-all-label').textContent = downloading ? 'Preparing files…' : 'Create all 4 versions';
    $('download-label').textContent = downloading ? 'Preparing file…' : file
      ? (file.dynamic ? (assets.mixEngine?.bases?.[getVersion()]?.physicalSize ? 'Create mod · '+(assets.mixEngine.bases[getVersion()].physicalSize/1048576).toFixed(2)+' MB' : 'Create mod') : (assets.characterId==='ignis'?'Download file · ':'Download '+assets.characterName+' original · ')+(file.bytes/1048576).toFixed(2)+' MB')
      : 'This outfit is missing export data';
    $('status').classList.remove('error');
    $('status').textContent = file
      ? (fields.every(k=>picked(k,s).default) ? 'Original file for the selected version.' : '')
      : assets.mixExportDeferred.includes(getVersion())
        ? 'Cross-version export data will be added later.'
        : 'This outfit is missing export data.';
    const token=++previewToken;
    const fire=()=>{if(token===previewToken)window.dispatchEvent(new CustomEvent('wardrobe-change',{detail:s}));};
    if(window.alokEnsureMeshes)window.alokEnsureMeshes(s).then(fire,fire);else fire();
  }
  window.alokWardrobe={get assets(){return assets;},selection,getVersion,getVoice,picked,fileForSelection,ready:Promise.resolve(assets.manifest)};
  function updateCharacterLabels(){
    document.querySelector('.character-name').textContent=assets.characterName.toUpperCase();
    document.querySelector('.watermark').textContent='HEX CHEATS SKINMOD';
    document.querySelector('.stage').setAttribute('aria-label',assets.characterName+' character preview');
    $('fallback').alt=assets.characterName+' wearing the selected outfit';
    const isIgnis=assets.characterId==='ignis';
    const actionLabel=document.querySelector('label[for="action"]');
    actionLabel.lastChild.textContent=assets.characterId==='ignis'?'Fist':'Action';
  }
  $('character').addEventListener('change',()=>{
    if(downloading){$('character').value=assets.characterId;return;}
    const next=characterAssets[$('character').value];
    assets=next;
    assets.manifest.combinations=assets.versionCombinations[getVersion()]||{};
    populate();updateCharacterLabels();update();
  });
  updateCharacterLabels();
  populate();
  fields.forEach(k=>$(k).addEventListener('change',()=>{if(k==='hair')applyFullSetHair();if(k==='bottom')applyBottomShoes();if(k==='top'||k==='mask')applyTitanRules(k);if(k==='hair'||k==='mask')applyMordecai(k);update();}));
  $('wardrobe-form').addEventListener('submit',e=>e.preventDefault());
  $('reset').addEventListener('click',()=>{setDefaults();update();});
  $('randomize').addEventListener('click',()=>{
    const before=JSON.stringify(selection());
    for(let trial=0;trial<12;trial++) {
      fields.forEach(k=>{
        const options=[...$(k).options].filter(option=>assets.itemCatalog[k][Number(option.value)].id!==k+'-xoa');
        if(options.length)$(k).value=options[Math.floor(Math.random()*options.length)].value;
      });
      if(JSON.stringify(selection())!==before) break;
    }
    applyFullSetHair();applyTitanRules('top');applyBottomShoes();applyTitanRules('mask');applyMordecai();update();
  });
  const versionLabels={'android-normal':'ANDROID · STANDARD','android-max':'ANDROID · MAX','ios-normal':'iOS · STANDARD','ios-max':'iOS · MAX'};
  function updateVersionLabels(){
    $('platform-label').textContent=versionLabels[getVersion()];
    const count=$('wardrobe-intro').querySelector('.count');if(count)count.textContent=versionLabels[getVersion()];
  }
  $('version').addEventListener('change',()=>{
    if(downloading)return;
    const chosen=Object.fromEntries(fields.map(k=>[k,picked(k).id]));
    window.currentAlokVersion=$('version').value;
    try{localStorage.setItem('alok-current-version',getVersion());}catch{}
    assets.manifest.combinations=assets.versionCombinations[getVersion()]||{};
    populate();
    fields.forEach(k=>{
      const index=assets.itemCatalog[k].findIndex(item=>item.id===chosen[k]);
      if([...$(k).options].some(option=>option.value===String(index)))$(k).value=String(index);
    });
    updateVersionLabels();update();
  });
  window.addEventListener('alok-version-change',()=>{populate();updateVersionLabels();update();});
  updateVersionLabels();
  $('download').addEventListener('click',async()=>{
    const chosen=selection(), version=getVersion(), file=fileForSelection(chosen); if(!file || downloading) return;
    downloading=true; update();startMod();
    const controls=[...document.querySelectorAll('select, #randomize, #reset, #download-all, .version-picker-button')];controls.forEach(el=>el.disabled=true);
    try {
      const ticket=await window.fishCheckExport(1);
      checkCancelled();await window.alokEnsureExport(p=>reportMod(2+p*.18,'Loading export data…'),exportAbort.signal);checkCancelled();await new Promise(resolve=>requestAnimationFrame(resolve));
      let bytes;
      if(file.dynamic){
        bytes=await window.alokExport(chosen,version,p=>{
          reportMod(20+p*.7,'Building outfit…');$('download-label').textContent='Creating file… '+p+'%';
          $('status').textContent='Building the selected outfit and version.';
        });
      }else{
        const encoded=assets.downloads[file.url];if(!encoded)throw Error('ZIP data is missing.');
        const binary=atob(encoded);bytes=new Uint8Array(binary.length);
        for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
        if(bytes.length!==file.bytes)throw Error('The downloaded file is incomplete.');
      }
      const packaged=window.alokPackageDownload(bytes,version);
      checkCancelled();reportMod(95,'Finalizing file…');$('mod-cancel').disabled=true;await window.fishChargeExport(ticket);
      const url=URL.createObjectURL(new Blob([packaged.bytes],{type:'application/zip'}));
      const link=document.createElement('a');link.href=url;link.download=packaged.name;
      document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
      controls.forEach(el=>el.disabled=false);downloading=false;$('mod-progress').hidden=true;update();$('status').textContent=(assets.characterId==='ignis'&&picked('top',chosen).id==='top-sasuke'?'Sasuke top exported with IG38 data.':'The selected ZIP file is ready.');
    } catch(err) {
      controls.forEach(el=>el.disabled=false);downloading=false;$('mod-progress').hidden=true;update();if (err.name !== 'AbortError' || err.message !== 'Verification required') { $('status').classList.add('error'); $('status').textContent=err.name==='AbortError'?'Export cancelled.':'Could not create file: '+err.message; }
    }
  });
  $('download-all').addEventListener('click',async()=>{
    if(downloading)return;
    const chosen=selection();
    downloading=true;update();startMod();
    const controls=[...document.querySelectorAll('select, #randomize, #reset, .version-picker-button')];controls.forEach(el=>el.disabled=true);
    try{
      const ticket=await window.fishCheckExport(4);
      checkCancelled();await window.alokEnsureExport(p=>reportMod(2+p*.18,'Loading export data…'),exportAbort.signal);checkCancelled();await new Promise(resolve=>requestAnimationFrame(resolve));
      const files=await window.alokExportAll(chosen,(p,label)=>{
        reportMod(20+p*.7,'Creating '+label+'…');$('download-all-label').textContent='Creating all 4 versions… '+p+'%';
        $('status').textContent='Creating '+label+' from the selected outfit.';
      });
      fourDownloadUrls.forEach(url=>URL.revokeObjectURL(url));fourDownloadUrls=[];
      const fileVersions={'Android_FF_STANDARD.zip':'android-normal','Android_FF_MAX.zip':'android-max','iOS_FF_STANDARD.zip':'ios-normal','iOS_FF_MAX.zip':'ios-max'};
      const readyFiles=Object.entries(files).map(([name,bytes])=>window.alokPackageDownload(bytes,fileVersions[name]));
      if(readyFiles.length!==4)throw Error('Could not create all four versions.');
      checkCancelled();reportMod(95,'Finalizing files…');$('mod-cancel').disabled=true;await window.fishChargeExport(ticket);
      const bundleEntries=Object.fromEntries(readyFiles.map(packaged=>[packaged.name,packaged.bytes]));
      const bundleBytes=fflate.zipSync(bundleEntries,{level:0});
      const bundleUrl=URL.createObjectURL(new Blob([bundleBytes],{type:'application/zip'}));
      const link=document.createElement('a');link.href=bundleUrl;link.download='HEX_CHEATS_SKINMOD_FF_4_VERSIONS.zip';link.style.display='none';
      document.body.append(link);link.click();link.remove();
      setTimeout(()=>URL.revokeObjectURL(bundleUrl),60000);
      controls.forEach(el=>el.disabled=false);downloading=false;$('mod-progress').hidden=true;update();
      $('status').textContent='ZIP bundle with all four versions is ready.';
    }catch(err){
      controls.forEach(el=>el.disabled=false);downloading=false;$('mod-progress').hidden=true;update();$('status').classList.add('error');$('status').textContent=err.name==='AbortError'?'Export cancelled.':'Could not create all four versions: '+err.message;
    }
  });
  update();
})();
