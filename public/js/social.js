(() => {
  'use strict';
  const versions = ['android-normal', 'android-max', 'ios-normal', 'ios-max'];
  let saved = ''; try { saved = localStorage.getItem('alok-current-version') || ''; } catch {}
  window.currentAlokVersion = versions.includes(saved) ? saved : 'android-normal';
  const version = document.getElementById('version'); if (version) version.value = window.currentAlokVersion;
  const versionMeta = {
    'android-normal': { label:'Android · FF Standard', platform:'./assets/platform/android.svg', game:'./assets/official/free-fire-app-icon.jpg' },
    'android-max': { label:'Android · FF MAX', platform:'./assets/platform/android.svg', game:'./assets/official/free-fire-max-app-icon.jpg' },
    'ios-normal': { label:'iOS · FF Standard', platform:'./assets/platform/apple.svg', game:'./assets/official/free-fire-app-icon.jpg' },
    'ios-max': { label:'iOS · FF MAX', platform:'./assets/platform/apple.svg', game:'./assets/official/free-fire-max-app-icon.jpg' },
  };

  const modal=document.getElementById('unlock-modal'), card=modal?.querySelector('.unlock-card'), modalTitle=document.getElementById('unlock-title'), modalCopy=document.getElementById('unlock-copy'), modalKicker=document.getElementById('unlock-kicker'), continueButton=document.getElementById('unlock-continue'), keyEntry=document.getElementById('key-entry'), keyInput=document.getElementById('access-key-input'), getKeyButton=document.getElementById('get-key'), verifyButton=document.getElementById('verify-key');
  let verifyResolve, verifyReject, countdownTimer;
  const setStep=(n,state='active')=>{for(let i=1;i<=3;i++){const el=document.getElementById(`unlock-step-${i}`);if(el){el.classList.toggle('is-active',i===n&&state!=='done');el.classList.toggle('is-done',i<n||(i===n&&state==='done'));}}};
  const show=()=>{if(modal)modal.hidden=false}; const hide=()=>{if(modal)modal.hidden=true};
  const resetModal=()=>{card?.classList.remove('is-success','is-key');keyEntry.hidden=true;continueButton.hidden=true;continueButton.textContent='CONTINUE TO STUDIO';getKeyButton.hidden=false;verifyButton.disabled=false;verifyButton.textContent='VERIFY KEY';verifyButton.onclick=null;keyInput.readOnly=false;clearInterval(countdownTimer)};
  const showKeyPrompt=()=>{resetModal();card?.classList.add('is-key');modalKicker.textContent='ACCESS KEY REQUIRED';modalTitle.textContent='Enter your 24-hour key';modalCopy.textContent='Complete the VIPLINK task first, then enter the key you received. The key is checked against the server database and its 10-IP limit.';keyEntry.hidden=false;getKeyButton.hidden=false;setStep(3);show();setTimeout(()=>keyInput.focus(),80)};
  const showIssuedKey=key=>{resetModal();card?.classList.add('is-success');modalKicker.textContent='VIPLINK TASK COMPLETE';modalTitle.textContent='Your 24-hour key';modalCopy.textContent='Copy this key. Tap Create Mod and enter it to verify access. This key supports up to 10 unique IP addresses.';keyEntry.hidden=false;getKeyButton.hidden=true;keyInput.value=key;keyInput.readOnly=true;verifyButton.textContent='COPY KEY';verifyButton.onclick=()=>{navigator.clipboard?.writeText(key);verifyButton.textContent='KEY COPIED';};setStep(3,'done');show()};
  const showError=msg=>{card?.classList.add('is-key');modalKicker.textContent='KEY CHECK FAILED';modalTitle.textContent='Access not verified';modalCopy.textContent=msg;keyEntry.hidden=false;verifyButton.disabled=false;verifyButton.textContent='VERIFY KEY';show()};
  document.getElementById('unlock-close')?.addEventListener('click',()=>{hide();if(verifyReject){verifyReject(new DOMException('Export cancelled','AbortError'));verifyResolve=verifyReject=null}});
  continueButton?.addEventListener('click',()=>hide());

  function mountPicker(){if(!version||version.dataset.customPicker)return;version.dataset.customPicker='true';const wrap=version.closest('.version-wrap'),picker=document.createElement('div');picker.className='version-picker';picker.innerHTML='<button class="version-picker-button" type="button" aria-haspopup="listbox" aria-expanded="false"></button><div class="version-picker-menu" role="listbox"></div>';wrap.append(picker);const button=picker.querySelector('.version-picker-button'),menu=picker.querySelector('.version-picker-menu');const render=()=>{const current=versionMeta[version.value]||versionMeta['android-normal'];button.innerHTML=`<img class="version-platform-icon" src="${current.platform}" alt=""><img class="version-game-icon" src="${current.game}" alt=""><span>${current.label}</span><i aria-hidden="true"></i>`;menu.replaceChildren();Object.entries(versionMeta).forEach(([value,meta])=>{const option=document.createElement('button');option.type='button';option.className='version-option'+(value===version.value?' is-selected':'');option.setAttribute('role','option');option.innerHTML=`<img class="version-platform-icon" src="${meta.platform}" alt=""><img class="version-game-icon" src="${meta.game}" alt=""><span>${meta.label}</span>`;option.addEventListener('click',()=>{version.value=value;window.currentAlokVersion=value;try{localStorage.setItem('alok-current-version',value)}catch{}version.dispatchEvent(new Event('change',{bubbles:true}));picker.classList.remove('is-open');button.setAttribute('aria-expanded','false')});menu.append(option)})};button.addEventListener('click',()=>{const open=picker.classList.toggle('is-open');button.setAttribute('aria-expanded',String(open))});document.addEventListener('click',e=>{if(!picker.contains(e.target)){picker.classList.remove('is-open');button.setAttribute('aria-expanded','false')}});version.addEventListener('change',render);render()}
  mountPicker();

  const updatePill=()=>{const pill=document.getElementById('access-pill');if(pill){pill.classList.remove('unlocked');pill.classList.add('locked');pill.textContent='KEY REQUIRED'}};updatePill();
  const protocolSuccess=(key,resolve)=>{keyInput.value=key;keyInput.readOnly=true;keyEntry.hidden=true;card?.classList.remove('is-key');card?.classList.add('is-success');modalKicker.textContent='KEY VERIFIED';modalTitle.textContent='Protocol complete';modalCopy.textContent='Access confirmed. Preparing your ZIP in 5 seconds…';setStep(3,'done');let seconds=5;const tick=()=>{modalCopy.textContent=`Access confirmed. Preparing your ZIP in ${seconds} seconds…`;seconds-=1;if(seconds<0){clearInterval(countdownTimer);hide();verifyResolve=verifyReject=null;resolve({ok:true,key})}};tick();countdownTimer=setInterval(tick,1000)};
  const startVipTask = async () => {
    resetModal(); card?.classList.remove('is-key'); modalKicker.textContent='VIPLINK KEY GENERATOR'; modalTitle.textContent='Complete the task to get a key'; modalCopy.textContent='Complete the VIPLINK task. When you return, a random 24-hour key will be generated and shown with a copy button.'; setStep(1); show(); getKeyButton.hidden=true;
    try {
      const response=await fetch('/api/unlock/start',{cache:'no-store'}); const data=await response.json();
      if(!response.ok || !data.shortUrl) throw Error(data.error || 'Could not create the VIPLINK task link.');
      setStep(1,'done'); setStep(2); let seconds=5; const tick=()=>{modalCopy.textContent=`Task link ready. Opening VIPLINK in ${seconds} seconds…`; seconds-=1; if(seconds<0){clearInterval(countdownTimer); window.location.assign(data.shortUrl);}}; tick(); countdownTimer=setInterval(tick,1000);
    } catch(e) { showError(e.message); }
  };
  getKeyButton?.addEventListener('click',startVipTask);
  verifyButton?.addEventListener('click',async()=>{if(verifyButton.textContent==='COPY KEY')return;const key=String(keyInput.value||'').trim().toUpperCase();if(!key)return showError('Enter the key you received after completing the VIPLINK task.');verifyButton.disabled=true;modalKicker.textContent='CHECKING DATABASE';modalTitle.textContent='Verifying access key';modalCopy.textContent='Checking expiry, key status, and the 10-IP limit…';setStep(3);try{const response=await fetch('/api/key/check',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key})});const data=await response.json();if(!response.ok||!data.ok)throw new Error(data.error||'Key rejected by the database.');protocolSuccess(data.key,verifyResolve)}catch(e){verifyButton.disabled=false;showError(e.message)}});
  window.fishCheckExport=async()=>new Promise((resolve,reject)=>{verifyResolve=resolve;verifyReject=reject;showKeyPrompt()});
  window.fishChargeExport=async()=>{};

  const toggle=document.getElementById('menu-toggle'),nav=document.getElementById('top-nav');if(toggle&&nav){toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open))});nav.addEventListener('click',e=>{if(e.target.closest('a')){nav.classList.remove('open');toggle.setAttribute('aria-expanded','false')}})}
  const params=new URLSearchParams(location.search),issued=params.get('key');if(params.get('unlock')==='1'&&issued){showIssuedKey(issued);history.replaceState({},'',location.pathname+'#studio')}
  const year=document.getElementById('year');if(year)year.textContent=String(new Date().getFullYear());
})();
