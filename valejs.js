// 1. Element Selectors
const btnPhotos = document.getElementById('btn-photos');
const btnFlowers = document.getElementById('btn-flowers');
const btnMessage = document.getElementById('btn-message');
const musicBtn = document.getElementById('btn-music');

const photosPanel = document.getElementById('photos-panel');
const flowersPanel = document.getElementById('flowers-panel');
const messagePanel = document.getElementById('message-panel');
const photosHeading = document.getElementById('photos-heading');
const messageHeading = document.getElementById('message-heading');
const photosGrid = document.getElementById('photos-grid');

const bgMusic = document.getElementById('bg-music');
const musicIcon = document.getElementById('music-icon');

// 2. State Management
let isPlaying = false;
let initialized = false;
let state = {
  track: null,
  items: [],
  originalCount: 0,
  index: 0,
  targets: [],
  timer: null,
  transition: 700,
  pause: 1700
};

// 3. Panel Navigation
function hideAll() {
  [photosPanel, flowersPanel, messagePanel].forEach(p => {
    p.classList.add('hidden');
    p.setAttribute('aria-hidden', 'true');
  });
  // Reset button states (but don't touch music)
  [btnPhotos, btnFlowers, btnMessage].forEach(b => b.setAttribute('aria-pressed', 'false'));
}

function showPanel(panelName) {
  hideAll();
  if (panelName === 'photos') {
    photosPanel.classList.remove('hidden');
    photosPanel.removeAttribute('aria-hidden');
    photosHeading.classList.remove('hidden');
    btnPhotos.setAttribute('aria-pressed', 'true');
    initializeCarousel();
  } else if (panelName === 'flowers') {
    flowersPanel.classList.remove('hidden');
    flowersPanel.removeAttribute('aria-hidden');
    btnFlowers.setAttribute('aria-pressed', 'true');
  } else if (panelName === 'message') {
    messagePanel.classList.remove('hidden');
    messagePanel.removeAttribute('aria-hidden');
    messageHeading.classList.remove('hidden');
    btnMessage.setAttribute('aria-pressed', 'true');
    const msg = document.getElementById('message-content');
    if (msg) msg.focus();
  }
}

// 4. Music Logic
musicBtn.addEventListener('click', () => {
  if (isPlaying) {
    bgMusic.pause();
    musicIcon.textContent = '🎵';
    musicBtn.classList.remove('playing');
  } else {
    bgMusic.play().catch(e => console.log("Playback failed:", e));
    musicIcon.textContent = '⏸️';
    musicBtn.classList.add('playing');
  }
  isPlaying = !isPlaying;
});

// 5. Carousel Logic (Centering & Scaling)
function initializeCarousel() {
  if (initialized) return;

  const imgs = Array.from(photosGrid.querySelectorAll('img'));
  if (!imgs.length) return;

  const track = document.createElement('div');
  track.className = 'photos-track';

  imgs.forEach(img => {
    img.style.transition = "transform 600ms ease, opacity 600ms ease";
    img.style.transform = "scale(0.7)";
    img.style.opacity = "0.6";
    track.appendChild(img);
  });

  photosGrid.innerHTML = "";
  photosGrid.appendChild(track);

  // Clone for seamless looping
  const originals = Array.from(track.children);
  originals.forEach(node => {
    const clone = node.cloneNode(true);
    clone.style.transition = "transform 600ms ease, opacity 600ms ease";
    clone.style.transform = "scale(0.7)";
    clone.style.opacity = "0.6";
    track.appendChild(clone);
  });

  state.track = track;
  state.originalCount = originals.length;
  state.items = Array.from(track.children);

  const promises = state.items.map(img => {
    return img.complete ? Promise.resolve() : new Promise(res => {
      img.onload = img.onerror = res;
    });
  });

  Promise.all(promises).then(() => {
    computeTargets();
    centerInstant(0);
    setTimeout(() => {
      track.style.transition = `transform ${state.transition}ms ease`;
      startCarousel();
    }, 50);
    window.addEventListener('resize', handleResize);
    initialized = true;
  });
}

function computeTargets() {
  const containerWidth = photosGrid.clientWidth;
  state.targets = state.items.map(el => {
    return el.offsetLeft - ((containerWidth - el.offsetWidth) / 2);
  });
}

function centerInstant(i) {
  state.index = i;
  state.track.style.transition = "none";
  state.track.style.transform = `translateX(-${state.targets[i]}px)`;
  highlightCenter();
}

function highlightCenter() {
  state.items.forEach((img, idx) => {
    if (idx === state.index) {
      img.style.transform = "scale(1)";
      img.style.opacity = "1";
    } else {
      img.style.transform = "scale(0.7)";
      img.style.opacity = "0.6";
    }
  });
}

function startCarousel() {
  scheduleNext();
}

function scheduleNext() {
  state.timer = setTimeout(() => {
    moveNext();
  }, state.pause);
}

function moveNext() {
  state.index++;
  state.track.style.transform = `translateX(-${state.targets[state.index]}px)`;
  highlightCenter();

  setTimeout(() => {
    if (state.index >= state.originalCount) {
      state.index -= state.originalCount;
      state.track.style.transition = "none";
      state.track.style.transform = `translateX(-${state.targets[state.index]}px)`;
      highlightCenter();
      void state.track.offsetHeight; // Force reflow
      state.track.style.transition = `transform ${state.transition}ms ease`;
    }
    scheduleNext();
  }, state.transition);
}

function handleResize() {
  computeTargets();
  centerInstant(state.index);
}

// 6. Flower Logic
const bouquet = document.getElementById('bouquet');
const stage = document.getElementById('flower-stage');

function spawnFloating(x, y, char) {
  const el = document.createElement('div');
  el.className = 'float';
  el.style.left = (x - 12) + 'px';
  el.style.top = (y - 12) + 'px';
  el.textContent = char;
  const dx = (Math.random() - 0.5) * 120;
  const dur = 1400 + Math.random() * 900;
  el.style.animationDuration = dur + 'ms';
  el.style.transform = `translateX(${dx}px)`;
  stage.appendChild(el);
  setTimeout(() => el.remove(), dur + 80);
}

bouquet.addEventListener('click', () => {
  const rect = stage.getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height / 2 - 10;
  const emojis = ['💗', '🌸', '💐', '✨', '💕'];
  for (let i = 0; i < 12; i++) {
    spawnFloating(
      cx + (Math.random() - 0.5) * 160,
      cy + (Math.random() - 0.2) * 60,
      emojis[Math.floor(Math.random() * emojis.length)]
    );
  }
});

// 7. Event Listeners
btnPhotos.addEventListener('click', () => showPanel('photos'));
btnFlowers.addEventListener('click', () => showPanel('flowers'));
btnMessage.addEventListener('click', () => showPanel('message'));

// Run on start
hideAll();
