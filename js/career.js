/* Dyn year */
document.getElementById('yearText').textContent =
  `© ${new Date().getFullYear()} yselimyigit · “Küçük detaylar büyük farklar yaratır.”`;

/* Fetch + render */
const TL = document.getElementById('timeline');
const BTN = q('.flt-btn', true);
let DATA = [], FILTER = 'all';

fetch('/career.json', {cache:'no-cache'})
  .then(r => r.json())
  .then(json => { DATA = sortByDate(json); render(); attachFilters(); lazyImages(); })
  .catch(err => { TL.innerHTML = `<p class="text-center text-red-400">career.json yüklenemedi: ${err}</p>`; });

function q(sel, all=false, root=document){ return all ? Array.from(root.querySelectorAll(sel)) : root.querySelector(sel); }

function sortByDate(arr){
  return arr.slice().sort((a,b)=>{
    const aActive = !a.end, bActive = !b.end;
    if (aActive !== bActive) return aActive ? -1 : 1;
    const ad = new Date((a.end || a.start) + '-01');
    const bd = new Date((b.end || b.start) + '-01');
    return bd - ad;
  });
}

function render(){
  TL.innerHTML = '';
  const filtered = DATA.filter(it => FILTER==='all' ? true : it.category.includes(FILTER));
  filtered.forEach((item, idx) => TL.appendChild(row(item, idx)));
  if(filtered.length === 0){ TL.innerHTML = `<p class="text-center text-slate-400">Bu filtre için sonuç yok.</p>`; }
}

function row(item, idx){
  const side = idx % 2 === 0 ? 't-left' : 't-right';
  const statusClass = item.status === 'completed' ? 't-status-completed' : '';
  const el = document.createElement('article');
  el.className = `t-row ${side} ${statusClass}`;
  el.innerHTML = `
    <span class="t-dot"></span>
    <div class="t-card">
      <div class="t-head">
        <img src="${item.logo || '/assets/org/placeholder.png'}" alt="${item.org} logosu" loading="lazy" decoding="async">
        <div>
          <div class="t-title">${escapeHTML(item.title)}</div>
          <div class="t-meta">${escapeHTML(item.org)} · ${prettyDate(item.start)} – ${item.end ? prettyDate(item.end) : 'Halen'}</div>
          <div class="t-meta">${escapeHTML(item.location || '')}</div>
        </div>
      </div>
      <p class="mt-1 text-slate-300">${escapeHTML(item.summary)}</p>
      ${tags(item.tags)}
      ${highlights(item.highlights)}
      ${media(item.media)}
    </div>`;
  return el;
}

function tags(t=[]){
  if(!t.length) return '';
  const map = (txt)=> {
    const key = txt.toLowerCase();
    let cls = 'tag-blue';
    if (/(c\+\+|stm|embedded|ros)/.test(key)) cls = 'tag-violet';
    else if (/(python|oop)/.test(key)) cls = 'tag-green';
    else if (/(canva|figma|grafik|ui|ux)/.test(key)) cls = 'tag-rose';
    else if (/(simülasyon|mavlink)/.test(key)) cls = 'tag-cyan';
    return `<span class="tag ${cls}">${escapeHTML(txt)}</span>`;
  };
  return `<div class="t-tags">${t.map(map).join('')}</div>`;
}
function highlights(h=[]){ if(!h.length) return ''; return `<ul class="list-disc pl-5 mt-2 text-slate-400 text-sm">${h.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ul>`; }
function media(m=[]){ if(!m.length) return ''; return `<div class="media-row">${m.map(i=>`<img data-src="${i.src}" alt="${escapeHTML(i.title||'medya')}" class="lazy-media">`).join('')}</div>`; }
function prettyDate(ym){ const [y,m] = ym.split('-').map(n=>parseInt(n,10)); const tr = ['','Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara']; return `${tr[m]} ${y}`; }
function escapeHTML(s=''){ return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function attachFilters(){
  BTN.forEach(b=>{
    b.addEventListener('click',()=>{
      BTN.forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      FILTER = b.dataset.filter;
      render(); lazyImages(); history.replaceState(null,'',`#${FILTER}`);
    });
  });
  const hash = (location.hash||'').replace('#',''); const match = BTN.find(b=>b.dataset.filter===hash); (match||BTN[0]).click();
}

function lazyImages(){
  const imgs = q('img.lazy-media', true);
  if(!imgs.length) return;
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries,obs)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const img = e.target; const src = img.getAttribute('data-src');
        if(src){ img.src = src; img.removeAttribute('data-src'); }
        img.classList.remove('lazy-media'); obs.unobserve(img);
      }
    });
  }, {rootMargin:'200px'}) : null;
  imgs.forEach(img => { if(io) io.observe(img); else img.src = img.dataset.src; });
}
