document.addEventListener('DOMContentLoaded', () => {
  const stage = document.querySelector('.stage');
  const envelope = document.getElementById('envelope');
  const letter = document.getElementById('letter');
  const closeBtn = document.getElementById('closeBtn');
  const message = document.getElementById('message');
  const caret = document.getElementById('caret');
  const langToggle = document.getElementById('langToggle');
  const signatureName = document.getElementById('signatureName');
  const hearts = document.getElementById('hearts');
  const tplAr = document.getElementById('tpl-ar');
  const tplEn = document.getElementById('tpl-en');
  const rulesBtn = document.getElementById('rulesBtn');
  const notice = document.getElementById('notice');
  const noticeTitle = document.getElementById('noticeTitle');
  const noticeText = document.getElementById('noticeText');
  const noticeOk = document.getElementById('noticeOk');
  const noticeClose = document.getElementById('noticeClose');
  const tplNoticeAr = document.getElementById('tpl-notice-ar');
  const body = document.body;

  // Override notice template content with your message
  if(tplNoticeAr){
    tplNoticeAr.innerHTML = `هلا تبوشتي شلونج عمري؟ 🌹
كلش هواية مشتاقلج , اعرف يمكن ما تحبين الرسائل 
بس حتى تبقالنا بصمه من الذكرى ما تنمحي يمكن من نكبر
او بيوم من الايام نفتحها
أتمنى من تفتحين كل ظرف، تشغّلين الأغنية وياها، وتكونين وحدج ومركّزة
 حتى تحسين بكل كلمة.
الظروف مرقّمة من الواحد بالترتيب، يعني قصة صغيرة نعيشها سوا خطوة بخطوة.
وكل رسالة حاولت اخلي  بيها كل من تبارك و يونس، 
ولا تنسين… آخر ظرف مو مرقّم، وما بي ورقة… بس بي شغلة صغيرة تنتظرج 😉
افتحيه وجرّبيها،لتنسين الفلوك ! ✨
اخر شي و اهم شي اكلج :
غير عينونچ أني شعندي! 🎵❤️`;
  }

  let clickCount = 0;
  const requiredClicks = 3;
  let currentLang = 'ar';

  // ===== Helpers
  let noticeLocked = true;
  let noticeTypingTimer = null;
  function showNotice(){
    if(!notice) return;
    notice.classList.add('show');
    notice.classList.toggle('locked', !!noticeLocked);
    notice.setAttribute('aria-hidden','false');
    startNoticeTyping();
  }
  function hideNotice(){
    if(!notice) return;
    clearTimeout(noticeTypingTimer);
    notice.classList.remove('show');
    notice.classList.remove('locked');
    notice.setAttribute('aria-hidden','true');
  }

  // Type the notice text (Arabic only)
  function startNoticeTyping(){
    if(!noticeText) return;
    clearTimeout(noticeTypingTimer);
    const raw = (tplNoticeAr?.innerHTML || '').trim()
      .replace(/\r?\n\s*\r?\n/g, '<br><br>')
      .replace(/\r?\n/g, '<br>');
    const tokens = tokenize(raw);
    noticeText.innerHTML = '';
    const caretEl = document.createElement('span');
    caretEl.className = 'caret';
    caretEl.style.opacity = 1;
    let i = 0;
    function step(){
      if(i < tokens.length){
        noticeText.insertAdjacentHTML('beforeend', tokens[i]);
        i++;
        // keep caret at end
        noticeText.appendChild(caretEl);
        const t = tokens[i-1];
        const slow = /[،؛؟,.!]/.test(t) || t === '<br>' ? 110 : 0;
        const base = 30;
        const jitter = Math.random()*28;
        noticeTypingTimer = setTimeout(step, base + slow + jitter);
      }else{
        caretEl.style.opacity = 0;
      }
    }
    // place caret and start
    noticeText.appendChild(caretEl);
    noticeTypingTimer = setTimeout(step, 420);
  }

  // Parse HTML string into tokens (tags vs chars) so typing doesn't break tags.
  function tokenize(html){
    const tokens = [];
    let i = 0;
    while(i < html.length){
      if(html[i] === '<'){
        let j = i;
        while(j < html.length && html[j] !== '>') j++;
        tokens.push(html.slice(i, j+1));
        i = j + 1;
      }else{
        tokens.push(html[i]);
        i++;
      }
    }
    return tokens;
  }

  function setLanguage(lang){
    currentLang = (lang === 'en') ? 'en' : 'ar';
    document.documentElement.lang = currentLang;
    document.documentElement.dir  = currentLang === 'ar' ? 'rtl' : 'ltr';
    langToggle.textContent = currentLang === 'ar' ? 'AR | EN' : 'EN | AR';
    signatureName.textContent = currentLang === 'ar' ? (body.dataset.nameAr || 'يونس كمال') : (body.dataset.nameEn || 'Younus Kamal');
    // restart typing with the selected language if letter open
    if(stage.classList.contains('envelope-open')){
      startTyping();
    }
  }

  // Typing with tokens (HTML-safe)
  let typingTimer = null;
  function startTyping(){
    clearTimeout(typingTimer);
    caret.style.opacity = 1;
    const text = (currentLang === 'ar' ? tplAr.textContent : tplEn.textContent).trim()
      // convert line breaks in templates to <br> for consistent spacing
      .replace(/\r?\n\r?\n/g, '<br><br>')
      .replace(/\r?\n/g, '<br>');

    const tokens = tokenize(text);
    message.innerHTML = '';
    let i = 0;

    function step(){
      if(i < tokens.length){
        message.innerHTML += tokens[i];
        i++;
        const t = tokens[i-1];
        // Slow down a bit after punctuation or line breaks
        const slow = /[،,.!?]/.test(t) || t === '<br>' ? 90 : 0;
        const base = 26;
        const jitter = Math.random()*22;
        typingTimer = setTimeout(step, base + slow + jitter);
      }else{
        caret.style.opacity = 0;
      }
    }
    typingTimer = setTimeout(step, 380);
  }

  // Ensure typing works reliably with template HTML (preserves <span class="gold"> etc.)
  const _startTypingOriginal = startTyping;
  startTyping = function(){
    clearTimeout(typingTimer);
    caret.style.opacity = 1;
    const raw = (currentLang === 'ar' ? tplAr?.innerHTML : tplEn?.innerHTML) || '';
    const text = raw.trim()
      .replace(/\r?\n\s*\r?\n/g, '<br><br>')
      .replace(/\r?\n/g, '<br>');

    const tokens = tokenize(text);
    message.innerHTML = '';
    let i = 0;
    function step(){
      if(i < tokens.length){
        message.insertAdjacentHTML('beforeend', tokens[i]);
        i++;
        const t = tokens[i-1];
        const slow = /[،؛؟,.!]/.test(t) || t === '<br>' ? 90 : 0;
        const base = 26;
        const jitter = Math.random()*22;
        typingTimer = setTimeout(step, base + slow + jitter);
      }else{
        caret.style.opacity = 0;
      }
    }
    typingTimer = setTimeout(step, 380);
  }

  // Hearts from envelope (click-only)
  function spawnHeart(){
    const rect = envelope.getBoundingClientRect();
    const x = rect.left + rect.width/2 + (Math.random()*40 - 20);
    const y = rect.top + rect.height*0.65 + (Math.random()*8 - 4);

    const h = document.createElement('div');
    h.className = 'heart';
    h.style.left = `${x}px`;
    h.style.top  = `${y}px`;
    h.style.animationDuration = `${4.5 + Math.random()*2.2}s`;
    hearts.appendChild(h);
    setTimeout(()=> h.remove(), 6000);
  }
  function emitHeartsBurst(count = 6){
    const n = Math.max(1, count|0);
    for(let i=0;i<n;i++){
      // stagger a bit for a natural burst
      setTimeout(spawnHeart, i*100 + Math.random()*80);
    }
  }

  // Envelope interactions
  if(envelope){
    envelope.addEventListener('click', () => {
      // hearts only on user click
      emitHeartsBurst(5 + Math.floor(Math.random()*4));

      if(!stage.classList.contains('envelope-open')){
        clickCount++;
        if(clickCount < requiredClicks){
          stage.classList.add('shake');
          setTimeout(()=> stage.classList.remove('shake'), 360);
        }else{
          stage.classList.add('envelope-open');
          body.classList.add('ribbon-loose');
          letter.setAttribute('aria-hidden','false');
          startTyping();
        }
      }
    });
  }

  if(closeBtn){
    closeBtn.addEventListener('click', () => {
      stage.classList.remove('envelope-open','shake');
      body.classList.remove('ribbon-loose');
      letter.setAttribute('aria-hidden','true');
      clickCount = 0;
      clearTimeout(typingTimer);
      message.innerHTML = '';
      caret.style.opacity = 0;
    });
  }

  if(langToggle){
    langToggle.addEventListener('click', () => {
      setLanguage(currentLang === 'ar' ? 'en' : 'ar');
    });
  }

  if(rulesBtn){
    // Arabic labels for consistency
    try{ rulesBtn.textContent = 'رسالتي'; }catch{}
    rulesBtn.addEventListener('click', () => { noticeLocked = false; showNotice(); });
  }
  if(noticeTitle){ try{ noticeTitle.textContent = 'رسالتي'; }catch{} }
  if(noticeOk){
    try{ noticeOk.textContent = 'ابدأ'; }catch{}
    noticeOk.addEventListener('click', () => { noticeLocked = false; hideNotice(); });
  }
  if(noticeClose){ noticeClose.addEventListener('click', () => { if(!noticeLocked) hideNotice(); }); }
  if(notice){ notice.addEventListener('click', (e)=> { if(e.target === notice && !noticeLocked) hideNotice(); }); }
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && !noticeLocked) hideNotice(); });

  // Init
  setLanguage('ar');
  noticeLocked = true;
  setTimeout(showNotice, 300);
});


