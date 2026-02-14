// Panel switcher: no panels visible initially
const btnPhotos = document.getElementById('btn-photos');
const btnFlowers = document.getElementById('btn-flowers');
const btnMessage = document.getElementById('btn-message');

const photosPanel = document.getElementById('photos-panel');
const flowersPanel = document.getElementById('flowers-panel');
const messagePanel = document.getElementById('message-panel');
const photosHeading = document.getElementById('photos-heading');
const messageHeading = document.getElementById('message-heading');
const photosGrid = document.getElementById('photos-grid');

// ================== PHOTO GALLERY - FADE IN/OUT ==================
let allPhotos = [];
let currentPhotoIndex = 0;
let carouselActive = false;
let carouselTimer = null;

function initializeCarousel(){
  allPhotos = Array.from(photosGrid.querySelectorAll('img'));
  allPhotos.forEach(img => {
    img.classList.add('hidden');
    img.style.opacity = '0';
  });
  currentPhotoIndex = 0;
  showPhotoSequence();
}

function showPhotoSequence(){
  if(allPhotos.length === 0) return;
  
  const displayPhoto = () => {
    // Hide all photos
    allPhotos.forEach(img => img.classList.add('hidden'));
    
    // Show current photo with fade in
    const currentImg = allPhotos[currentPhotoIndex];
    currentImg.classList.remove('hidden');
    currentImg.style.animation = 'none';
    setTimeout(() => {
      currentImg.style.animation = 'photoFadeIn 0.8s ease-out forwards';
    }, 10);
    
    currentPhotoIndex++;
    
    // Move to next photo after 3 seconds
    if(currentPhotoIndex < allPhotos.length){
      carouselTimer = setTimeout(displayPhoto, 3000);
    } else {
      // Loop back to start
      currentPhotoIndex = 0;
      carouselTimer = setTimeout(displayPhoto, 500);
    }
  };
  
  carouselActive = true;
  displayPhoto();
}

function hideAll(){
  [photosPanel, flowersPanel, messagePanel].forEach(p => {
    p.classList.add('hidden');
    p.setAttribute('aria-hidden','true');
  });
  [btnPhotos, btnFlowers, btnMessage].forEach(b => b.setAttribute('aria-pressed','false'));
}
hideAll();

// show chosen panel; photos heading only appears when photos panel is opened
function showPanel(panelName){
  hideAll();
  if(panelName === 'photos'){
    photosPanel.classList.remove('hidden');
    photosPanel.removeAttribute('aria-hidden');
    photosHeading.classList.remove('hidden');
    btnPhotos.setAttribute('aria-pressed','true');
    initializeCarousel();
  } else if(panelName === 'flowers'){
    flowersPanel.classList.remove('hidden');
    flowersPanel.removeAttribute('aria-hidden');
    btnFlowers.setAttribute('aria-pressed','true');
  } else if(panelName === 'message'){
    messagePanel.classList.remove('hidden');
    messagePanel.removeAttribute('aria-hidden');
    messageHeading.classList.remove('hidden');
    btnMessage.setAttribute('aria-pressed','true');
    // focus the message for screen readers
    const msg = document.getElementById('message-content');
    if(msg) msg.focus();
  }
}

// wire up buttons
btnPhotos.addEventListener('click', () => showPanel('photos'));
btnFlowers.addEventListener('click', () => showPanel('flowers'));
btnMessage.addEventListener('click', () => showPanel('message'));

// -------------------- Bouquet interaction --------------------
const bouquet = document.getElementById('bouquet');
const stage = document.getElementById('flower-stage');

function spawnFloating(x, y, char){
  const el = document.createElement('div');
  el.className = 'float';
  el.style.left = (x - 12) + 'px';
  el.style.top = (y - 12) + 'px';
  el.textContent = char;
  // random horizontal drift by updating transform property after insertion
  const dx = (Math.random() - 0.5) * 120;
  const dur = 1400 + Math.random() * 900;
  el.style.animationDuration = dur + 'ms';
  el.style.transform = `translateX(${dx}px)`;
  stage.appendChild(el);
  setTimeout(()=> {
    // small gentle rotation added
    el.style.transform = el.style.transform + ` rotate(${(Math.random()-0.5)*40}deg)`;
  }, 10);
  setTimeout(()=> el.remove(), dur + 80);
}

// when bouquet clicked spawn multiple small floats (hearts & petals)
bouquet.addEventListener('click', (ev) => {
  ev.stopPropagation();
  const rect = stage.getBoundingClientRect();
  // center-ish coordinates where bouquet sits
  const cx = rect.width/2;
  const cy = rect.height/2 - 10;

  const emojis = ['💗','🌸','💐','✨','💕'];
  const count = 10 + Math.floor(Math.random()*8);
  for(let i=0;i<count;i++){
    // scatter around bouquet center
    const x = cx + (Math.random()-0.5) * 160;
    const y = cy + (Math.random()-0.2) * 60;
    const char = emojis[Math.floor(Math.random()*emojis.length)];
    spawnFloating(x, y, char);
  }

  // gentle "pop" feedback
  bouquet.style.transform = 'scale(0.985)';
  setTimeout(()=> bouquet.style.transform = '', 140);
});

// also spawn tiny floats on stage click (interactive)
stage.addEventListener('click', (e) => {
  // if bouquet itself handled it, skip (bouquet click stops propagation)
  const rect = stage.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const emojis = ['🌸','💗'];
  const char = emojis[Math.floor(Math.random()*emojis.length)];
  // spawn a smaller cluster for clicks outside bouquet
  const cluster = 1 + Math.floor(Math.random()*3);
  for(let i=0;i<cluster;i++){
    const rx = x + (Math.random()-0.5) * 40;
    const ry = y + (Math.random()-0.5) * 30;
    spawnFloating(rx, ry, char);
  }
});

// keyboard accessibility: let Enter/Space on bouquet trigger the effect
bouquet.setAttribute('tabindex', '0');
bouquet.addEventListener('keydown', (e) => {
  if(e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    bouquet.click();
  }
});

// keyboard shortcuts for panels (1,2,3)
document.addEventListener('keydown', (e) => {
  if(e.key === '1') btnPhotos.click();
  if(e.key === '2') btnFlowers.click();
  if(e.key === '3') btnMessage.click();
});
