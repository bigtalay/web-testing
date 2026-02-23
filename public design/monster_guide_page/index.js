let currentSection = 0;
const totalSections = 3;
let isScrolling = false;
const container = document.getElementById('mainContainer');
const dots = document.querySelectorAll('.dot');
const sections = document.querySelectorAll('.section');
const modal = document.getElementById('monsterModal');


import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1. Setup (Paste your keys here)
const firebaseConfig = {
  apiKey: "AIzaSyD3jwOwv5FHHi_IM3nVPQNQC6ayPnuylEA",
  authDomain: "forwebtesting-12636.firebaseapp.com",
  projectId: "forwebtesting-12636",
  storageBucket: "forwebtesting-12636.firebasestorage.app",
  messagingSenderId: "721692467237",
  appId: "1:721692467237:web:a4eb6e74d05f9c9deddfcc",
  measurementId: "G-1DR3E38CKP"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 2. The Loop (The Magic Part)
async function loadMonsters() {
    const grid = document.getElementById('monsterGrid');
    const book = document.getElementById('bookContent');

    // Fetch data from Firebase
    const snapshot = await getDocs(collection(db, "monsters"));

    snapshot.forEach((doc) => {
        const m = doc.data(); // m is the monster data (name, image, etc.)
        const id = doc.id;

        // --- TEMPLATE A: The Small Card ---
        const cardHTML = `
            <div class="monster-card" id="card-${id}" 
                 style="background-image: url('${m.thumbnail}');">
                <div class="monster-name-tag">${m.name}</div>
            </div>
        `;
        grid.insertAdjacentHTML('beforeend', cardHTML); // Add to grid

        // Add Click Event
        document.getElementById(`card-${id}`).addEventListener('click', () => {
            openModal(id);
        });

        // --- TEMPLATE B: The Book Page ---
        const pageHTML = `
            <div id="content-${id}" class="monster-detail-layout" style="display: none;">
                <div class="monster-image-large">
                    <img src="${m.detailImage}" alt="${m.name}" />
                </div>
                <div class="monster-info">
                    <h2>${m.name}</h2>
                    <div class="info-section">
                        <h3>General Info</h3>
                        <p>${m.description}</p>
                    </div>
                    <div class="info-section">
                        <h3>Weakness</h3>
                        <p>${m.weaknessText}</p>
                        ${m.weaknessChart ? `<img src="${m.weaknessChart}" class="weakness-img">` : ''}
                    </div>
                </div>
            </div>
        `;
        book.insertAdjacentHTML('beforeend', pageHTML); // Add to book
    });
}

loadMonsters(); // Run it!
// ฟังก์ชันเลื่อนหน้า
function scrollToSection(index) {
    if (index < 0 || index >= totalSections) return;
    currentSection = index;
    container.style.transform = `translateY(-${currentSection * 100}vh)`;
    sections.forEach(sec => sec.classList.remove('active'));
    sections[currentSection].classList.add('active');
    dots.forEach(dot => dot.classList.remove('active'));
    dots[currentSection].classList.add('active');
    isScrolling = true;
    setTimeout(() => { isScrolling = false; }, 1000);
}

// ตรวจจับการเลื่อนเมาส์
window.addEventListener('wheel', (e) => {
    if (modal.classList.contains('show')) return;
    if (isScrolling) return;
    if (e.deltaY > 0) scrollToSection(currentSection + 1);
    else scrollToSection(currentSection - 1);
});

// ตรวจจับปุ่มคีย์บอร์ด
window.addEventListener('keydown', (e) => {
    if (modal.classList.contains('show')) return;
    if (isScrolling) return;
    if (e.key === 'ArrowDown') scrollToSection(currentSection + 1);
    if (e.key === 'ArrowUp') scrollToSection(currentSection - 1);
});

// เปิด Modal
function openModal(monsterId) {
    modal.classList.add('show');
    const allContents = document.querySelectorAll('.monster-detail-layout');
    allContents.forEach(content => { content.style.display = 'none'; });
    const targetContent = document.getElementById('content-' + monsterId);
    if (targetContent) targetContent.style.display = 'flex';
}

// ปิด Modal
function closeModal() {
    modal.classList.remove('show');
}
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

window.closeModal = closeModal;

// ==========================================
// 🎵 SMART AUDIO SYSTEM (Autoplay Workaround)
// ==========================================

// 1. Load YouTube API
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
var isMuted = true; // Start assuming it is muted

// 2. Setup Player (Attached to window for Module compatibility)
window.onYouTubeIframeAPIReady = function() {
    player = new YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: 'po_t8I9FC2Y', // Your Monster Hunter Track
        playerVars: {
            'autoplay': 1,      // Request autoplay
            'loop': 1,          // Loop forever
            'controls': 0,      // No buttons
            'playlist': 'po_t8I9FC2Y' // Required for looping
        },
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    // Browser Rule: We MUST start muted to autoplay
    event.target.mute();
    event.target.playVideo();
}

// 3. The "First Click" Trick
// As soon as the user clicks ANYWHERE, we turn on the sound.
document.addEventListener('click', function(e) {
    // If they clicked the Mute button specifically, ignore this logic
    if (e.target.id === 'muteBtn' || e.target.closest('#muteBtn')) return;

    if (player && typeof player.unMute === 'function') {
        // If it's playing and muted, UNMUTE it now!
        if (player.isMuted()) {
            player.unMute();
            player.setVolume(50); // Set volume to 50%
            isMuted = false;
            
            // Update the button text to match
            const btn = document.getElementById("muteBtn");
            if(btn) btn.innerHTML = "🔊 Mute Music";
        }
    }
}, { once: true }); // 'once: true' deletes this listener after it runs once

// 4. The Toggle Button Logic
window.toggleMute = function() {
    const btn = document.getElementById("muteBtn");
    if (!player) return;

    if (isMuted) {
        player.unMute();
        btn.innerHTML = "🔊 Mute Music"; // Sound is ON
        isMuted = false;
    } else {
        player.mute();
        btn.innerHTML = "🔇 Unmute Music"; // Sound is OFF
        isMuted = true;
    }
}
