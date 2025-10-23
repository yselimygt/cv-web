/* Scroll progress */
const progressBar = document.getElementById('scroll-progress');
function setProgress(){
  const s = window.scrollY;
  const h = document.documentElement.scrollHeight - window.innerHeight;
  const p = Math.max(0, Math.min(1, s / h));
  progressBar.style.width = (p * 100) + '%';
}
document.addEventListener('scroll', setProgress, {passive:true}); setProgress();

/* Back to top */
const backBtn = document.getElementById('backToTop');
function toggleBack(){ backBtn.classList.toggle('show', window.scrollY > 400); }
backBtn.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
document.addEventListener('scroll', toggleBack, {passive:true}); toggleBack();

/* Theme toggle */
const themeToggle = document.getElementById('themeToggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
function applyTheme(t){ document.documentElement.setAttribute('data-theme', t); localStorage.setItem('theme', t); themeToggle.textContent = t==='dark' ? '☀️' : '🌙'; }
function initTheme(){ const saved=localStorage.getItem('theme'); applyTheme(saved || (prefersDark.matches ? 'dark' : 'light')); }
themeToggle.addEventListener('click', ()=>{ const cur=document.documentElement.getAttribute('data-theme'); applyTheme(cur==='dark'?'light':'dark'); }); initTheme();

/* Mobile menu */
const mobileBtn = document.getElementById('mobileBtn');
const mobileMenu = document.getElementById('mobileMenu');
mobileBtn?.addEventListener('click', ()=>{ mobileMenu.classList.toggle('hidden'); });
window.addEventListener('scroll', ()=>{ if(!mobileMenu.classList.contains('hidden')) mobileMenu.classList.add('hidden'); }, {passive:true});

/* Typewriter */
const tw = document.getElementById('typewriter');
const twText = 'Estetik odaklı otomasyon ve üretkenlik çözümleri geliştiriyorum. Teknik derinliği UI/UX ile birleştiriyorum.';
let i=0; (function type(){ if(i<=twText.length){ tw.textContent = twText.slice(0,i++) + (i%2?'|':''); setTimeout(type, 22); } else { tw.textContent = twText; } })();

/* Lazy load images */
const lazyImgs = document.querySelectorAll('img.lazy-img');
const io = ('IntersectionObserver' in window) ? new IntersectionObserver((entries,obs)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ const img=e.target; const src=img.getAttribute('data-src'); if(src){ img.src=src; img.removeAttribute('data-src'); } img.classList.remove('lazy-img'); obs.unobserve(img);} });
}, {rootMargin:'200px'}) : null;
lazyImgs.forEach(img=>{ if(io) io.observe(img); else { img.src = img.dataset.src; }});

/* Form simulate */
const form = document.getElementById('contactForm'); const toast=document.getElementById('formToast');
form.addEventListener('submit', (e)=>{ e.preventDefault(); toast.className='text-green-400'; toast.textContent='Mesaj simüle edildi. Gerçek gönderim için Supabase / Cloudflare Worker ekleyebiliriz.'; });

/* Footer year */
document.getElementById('yearText').textContent =
  `© ${new Date().getFullYear()} yselimyigit · "Küçük detaylar büyük farklar yaratır."`;

/* PWA */
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{ navigator.serviceWorker.register('/sw.js').catch(console.error); });
}
