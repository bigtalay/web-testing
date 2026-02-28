let currentSection = 0;
let totalSections = 3; 
let isScrolling = false;
const container = document.getElementById('mainContainer');
let sections = document.querySelectorAll('.section');
const modal = document.getElementById('monsterModal');

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

let monstersData = {};
let allMonstersArray = []; 

async function loadMonsters() {
    const snapshot = await getDocs(collection(db, "monsters"));
    allMonstersArray = [];
    monstersData = {}; 

    snapshot.forEach((doc) => {
        const m = doc.data();
        monstersData[doc.id] = m;
        allMonstersArray.push({ type: 'monster', id: doc.id, data: m });
    });

    allMonstersArray.sort((a, b) => {
        const timeA = a.data.createdAt || 0; 
        const timeB = b.data.createdAt || 0;
        return timeA - timeB; 
    });

    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value.trim() !== "") {
        handleSearch(searchInput.value);
    } else {
        renderMonsterGrid(allMonstersArray);
    }
}

function renderMonsterGrid(monstersToRender) {
    const book = document.getElementById('bookContent');
    const mainContainer = document.getElementById('mainContainer');
    const sec2 = document.querySelector('.sec2'); 
    const sec3 = document.querySelector('.sec3'); 

    document.querySelectorAll('.dynamic-page').forEach(el => el.remove());
    book.innerHTML = ''; 

    let allItems = [...monstersToRender];
    allItems.push({ type: 'add_button', id: 'add-btn-unique' });

    const itemsPerPage = 12;
    const pages = [];
    for (let i = 0; i < allItems.length; i += itemsPerPage) {
        pages.push(allItems.slice(i, i + itemsPerPage));
    }

    pages.forEach((pageItems, pageIndex) => {
        let targetGrid;

        if (pageIndex === 0) {
            targetGrid = sec2.querySelector('.monster-grid');
            targetGrid.innerHTML = ''; 
        } else {
            const newSection = sec2.cloneNode(true);
            newSection.classList.remove('sec2'); 
            newSection.classList.add('dynamic-page'); 
            
            const searchBox = newSection.querySelector('.search-container');
            if (searchBox) searchBox.remove();

            const title = newSection.querySelector('.monster-list-title');
            if(title) title.innerText = `Monster List (Page ${pageIndex + 1})`;
            targetGrid = newSection.querySelector('.monster-grid');
            targetGrid.innerHTML = ''; 
            mainContainer.insertBefore(newSection, sec3);
        }

        pageItems.forEach(item => {
            if (item.type === 'add_button') {
                const addCardHTML = `<div class="add-monster-card admin-only" onclick="openAddModal()"><div class="add-icon">+</div></div>`;
                targetGrid.insertAdjacentHTML('beforeend', addCardHTML);
            } else {
                const m = item.data;
                const id = item.id;

                const cardHTML = `
                    <div class="monster-card" id="card-${id}" style="background-image: url('${m.thumbnail}');">
                        <div class="monster-name-tag">${m.name}</div>
                    </div>
                `;
                targetGrid.insertAdjacentHTML('beforeend', cardHTML);

                targetGrid.lastElementChild.addEventListener('click', () => {
                    openModal(id);
                });

                if (!document.getElementById(`content-${id}`)) {
                    const pageHTML = `
                        <div id="content-${id}" class="monster-detail-layout" style="display: none;">
                            <div class="monster-image-large">
                                <img src="${m.detailImage}" alt="${m.name}" />
                                <div class="delete-section admin-only">
                                    <div class="delete-confirm" id="confirm-${id}">
                                        <div class="confirm-text">แน่ใจไหมว่าจะลบ</div>
                                        <div class="confirm-actions">
                                            <button class="btn-yes" onclick="deleteMonster('${id}')">ใช่</button>
                                            <button class="btn-no" onclick="toggleDeleteConfirm('${id}')">ไม่</button>
                                        </div>
                                    </div>
                                    <button class="delete-btn" onclick="toggleDeleteConfirm('${id}')" title="ลบมอนสเตอร์">
                                        <svg viewBox="0 0 24 24" width="35" height="35" stroke="#3e2723" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            <line x1="10" y1="11" x2="10" y2="17"></line>
                                            <line x1="14" y1="11" x2="14" y2="17"></line>
                                        </svg>
                                    </button>
                                    <button class="edit-btn" onclick="openEditModal('${id}')" title="แก้ไขข้อมูล">
                                        <svg viewBox="0 0 24 24" width="35" height="35" stroke="#3e2723" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                                        </svg>
                                    </button>
                                </div>
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
                    book.insertAdjacentHTML('beforeend', pageHTML);
                }
            }
        });
    });
    updateNavigation();
}

window.handleSearch = function(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    let filtered = [];
    
    if (term === "") {
        filtered = allMonstersArray;
    } else {
        filtered = allMonstersArray.filter(item => 
            item.data.name.toLowerCase().includes(term)
        );
    }
    
    if (currentSection > 1) {
        scrollToSection(1);
    }
    
    renderMonsterGrid(filtered);
}

function updateNavigation() {
    sections = document.querySelectorAll('.section'); 
    totalSections = sections.length;
    const dotContainer = document.querySelector('.nav-dots');
    if(dotContainer) {
        dotContainer.innerHTML = ''; 
        sections.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (index === currentSection) dot.classList.add('active');
            dot.addEventListener('click', () => scrollToSection(index));
            dotContainer.appendChild(dot);
        });
    }
}

loadMonsters(); 

// --- ระบบ Scroll ---
function scrollToSection(index) {
    if (index < 0 || index >= totalSections) return;
    currentSection = index;
    container.style.transform = `translateY(-${currentSection * 100}vh)`;
    sections.forEach(sec => sec.classList.remove('active'));
    sections[currentSection].classList.add('active');
    const allDots = document.querySelectorAll('.dot');
    allDots.forEach(dot => dot.classList.remove('active'));
    if(allDots[currentSection]) allDots[currentSection].classList.add('active');
    isScrolling = true;
    setTimeout(() => { isScrolling = false; }, 1000);
}
window.scrollToSection = scrollToSection;

window.addEventListener('wheel', (e) => {
    if (modal.classList.contains('show') || document.getElementById('addMonsterModal').classList.contains('show') || document.getElementById('editMonsterModal').classList.contains('show')) return;
    if (isScrolling) return;
    if (e.deltaY > 0) scrollToSection(currentSection + 1);
    else scrollToSection(currentSection - 1);
});

window.addEventListener('keydown', (e) => {
    if (modal.classList.contains('show') || document.getElementById('addMonsterModal').classList.contains('show') || document.getElementById('editMonsterModal').classList.contains('show')) return;
    if (isScrolling) return;
    if (e.key === 'ArrowDown') scrollToSection(currentSection + 1);
    if (e.key === 'ArrowUp') scrollToSection(currentSection - 1);
});

// --- ระบบ Modal ---
function openModal(monsterId) {
    modal.classList.add('show');
    const allContents = document.querySelectorAll('.monster-detail-layout');
    allContents.forEach(content => { content.style.display = 'none'; });
    const targetContent = document.getElementById('content-' + monsterId);
    if (targetContent) targetContent.style.display = 'flex';
}

function closeModal() {
    modal.classList.remove('show');
    document.querySelectorAll('.delete-confirm').forEach(el => el.classList.remove('show-confirm'));
}
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});
window.closeModal = closeModal;

window.openAddModal = function() { document.getElementById('addMonsterModal').classList.add('show'); }
window.closeAddModal = function() { document.getElementById('addMonsterModal').classList.remove('show'); }


window.openEditModal = function(id) {
    const m = monstersData[id];
    if (m) {
        document.getElementById('editMonsterId').value = id;
        document.getElementById('editName').value = m.name;
        document.getElementById('editThumbnail').value = m.thumbnail;
        document.getElementById('editDetailImage').value = m.detailImage;
        document.getElementById('editDescription').value = m.description;
        document.getElementById('editWeaknessText').value = m.weaknessText;
        document.getElementById('editWeaknessChart').value = m.weaknessChart || '';
        document.getElementById('editMonsterModal').classList.add('show');
    }
}
window.closeEditModal = function() { document.getElementById('editMonsterModal').classList.remove('show'); }
document.getElementById('editMonsterModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('editMonsterModal')) closeEditModal();
});

document.getElementById('editMonsterForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerHTML = "⏳ กำลังอัปเดต..."; btn.disabled = true;
    const id = document.getElementById('editMonsterId').value;
    
    const updatedData = {
        name: document.getElementById('editName').value,
        thumbnail: document.getElementById('editThumbnail').value,
        detailImage: document.getElementById('editDetailImage').value,
        description: document.getElementById('editDescription').value,
        weaknessText: document.getElementById('editWeaknessText').value,
        weaknessChart: document.getElementById('editWeaknessChart').value
    };

    try {
        await updateDoc(doc(db, "monsters", id), updatedData);
        alert("✅ แก้ไขเรียบร้อย!");
        closeEditModal(); closeModal(); loadMonsters();
    } catch (error) { alert("❌ เกิดข้อผิดพลาด"); } 
    finally { btn.innerHTML = "บันทึกการแก้ไข"; btn.disabled = false; }
});

window.toggleDeleteConfirm = function(id) {
    const confirmBox = document.getElementById(`confirm-${id}`);
    if (confirmBox) confirmBox.classList.toggle('show-confirm');
}
window.deleteMonster = async function(id) {
    try {
        closeModal();
        await deleteDoc(doc(db, "monsters", id));
        alert("🗑️ ลบข้อมูลเรียบร้อยแล้ว!"); loadMonsters(); 
    } catch (error) { alert("❌ เกิดข้อผิดพลาดในการลบ"); }
}

var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
var isMuted = true;

window.onYouTubeIframeAPIReady = function() {
    player = new YT.Player('youtube-player', {
        height: '0', width: '0', videoId: 'po_t8I9FC2Y',
        playerVars: { 'autoplay': 1, 'loop': 1, 'controls': 0, 'playlist': 'po_t8I9FC2Y' },
        events: { 'onReady': onPlayerReady }
    });
}
function onPlayerReady(event) { event.target.mute(); event.target.playVideo(); }

document.addEventListener('click', function(e) {
    if (e.target.id === 'muteBtn' || e.target.closest('#muteBtn')) return;
    if (player && typeof player.unMute === 'function' && player.isMuted()) {
        player.unMute(); player.setVolume(15); isMuted = false;
        const btn = document.getElementById("muteBtn"); if(btn) btn.innerHTML = "🔊 Mute Music";
    }
}, { once: true });

window.toggleMute = function() {
    const btn = document.getElementById("muteBtn");
    if (!player) return;
    if (isMuted) { player.unMute(); btn.innerHTML = "🔊 Mute Music"; isMuted = false; } 
    else { player.mute(); btn.innerHTML = "🔇 Unmute Music"; isMuted = true; }
}

let touchStartY = 0;
let touchEndY = 0;

window.addEventListener('touchmove', e => {
    if (modal.classList.contains('show') || 
        document.getElementById('addMonsterModal').classList.contains('show') || 
        document.getElementById('editMonsterModal').classList.contains('show')) {
        return; 
    }
    e.preventDefault(); 
}, { passive: false }); 

window.addEventListener('touchstart', e => {
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

window.addEventListener('touchend', e => {
    if (modal.classList.contains('show') || 
        document.getElementById('addMonsterModal').classList.contains('show') || 
        document.getElementById('editMonsterModal').classList.contains('show')) return;
    
    if (isScrolling) return;

    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50; 
    if (touchStartY - touchEndY > swipeThreshold) {
        scrollToSection(currentSection + 1);
    } else if (touchEndY - touchStartY > swipeThreshold) {
        scrollToSection(currentSection - 1);
    }
}

window.openLoginModal = function() {
    const modal = document.getElementById('login-modal');
    if (modal) modal.style.display = 'flex';
}

window.closeLoginModal = function() {
    const modal = document.getElementById('login-modal');
    if (modal) modal.style.display = 'none';
}

window.handleSuccessfulLogin = function() {
    document.getElementById('btn-login').style.display = 'none';
    document.getElementById('btn-logout').style.display = 'flex'; 
    document.body.classList.add('admin-logged-in');
    window.isAdminLoggedIn = true; 
}

window.logoutAdmin = function() {
    document.getElementById('btn-logout').style.display = 'none';
    document.getElementById('btn-login').style.display = 'flex'; 
    document.body.classList.remove('admin-logged-in');
    window.isAdminLoggedIn = false;
    alert("Logged out successfully.");
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            const user = this.querySelector('input[type="text"]').value;
            const pass = this.querySelector('input[type="password"]').value;

            if (user === "root" && pass === "root") {
                window.closeLoginModal();
                window.handleSuccessfulLogin();
                this.reset(); 
            } else {
                alert("Invalid Username or Password.");
                this.querySelector('input[type="password"]').value = ""; 
            }
        });
    }
});

// Helper function: Converts an image file into a Base64 text string
function convertFileToBase64(fileInput) {
    return new Promise((resolve, reject) => {
        const file = fileInput.files[0];
        if (!file) {
            resolve(""); // Return empty string if no file is selected
            return;
        }

        // Check file size (1MB limit = 1,048,576 bytes)
        if (file.size > 1048576) {
            reject("ไฟล์ใหญ่เกินไป! กรุณาใช้รูปภาพขนาดไม่เกิน 1MB");
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

document.getElementById('addMonsterForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerHTML = "⏳ กำลังบันทึก..."; btn.disabled = true;

    try {
        // Convert the files to Base64 strings instead of grabbing the useless '.value'
        const thumbnailBase64 = await convertFileToBase64(document.getElementById('newThumbnail'));
        const detailImageBase64 = await convertFileToBase64(document.getElementById('newDetailImage'));
        const weaknessChartBase64 = await convertFileToBase64(document.getElementById('newWeaknessChart'));

        const newMonsterData = {
            name: document.getElementById('newName').value,
            thumbnail: thumbnailBase64,
            detailImage: detailImageBase64,
            description: document.getElementById('newDescription').value,
            weaknessText: document.getElementById('newWeaknessText').value,
            weaknessChart: weaknessChartBase64,
            createdAt: Date.now() 
        };

        await addDoc(collection(db, "monsters"), newMonsterData);
        alert("✅ เพิ่มสำเร็จ!");
        closeAddModal(); 
        e.target.reset(); 
        loadMonsters(); 
    } catch (error) { 
        console.error(error);
        alert("❌ " + error); 
    } finally { 
        btn.innerHTML = "บันทึกข้อมูลมอนสเตอร์"; 
        btn.disabled = false; 
    }
});