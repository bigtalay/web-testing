let currentSection = 0;
let totalSections = 4; 
let isScrolling = false;
const container = document.getElementById('mainContainer');
let sections = document.querySelectorAll('.section');
const modal = document.getElementById('monsterModal');

window.isAdminLoggedIn = false; 
window.adminMode = 'normal'; 
window.selectedForDelete = []; 

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { initializeFirestore, collection, getDocs, addDoc, deleteDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const db = initializeFirestore(app, { experimentalForceLongPolling: true });

let monstersData = {};
let allMonstersArray = []; 

async function loadMonsters() {
    try {
        const snapshot = await getDocs(collection(db, "monsters"));
        allMonstersArray = [];
        monstersData = {}; 
        snapshot.forEach((doc) => {
            const m = doc.data();
            monstersData[doc.id] = m;
            allMonstersArray.push({ type: 'monster', id: doc.id, data: m });
        });
        allMonstersArray.sort((a, b) => (a.data.createdAt || 0) - (b.data.createdAt || 0));

        const searchInput = document.getElementById('searchInput');
        if (searchInput && searchInput.value.trim() !== "") {
            handleSearch(searchInput.value);
        } else {
            renderMonsterGrid(allMonstersArray);
        }
    } catch (error) {
        console.error("Firebase Error: ", error);
        alert("❌ เกิดข้อผิดพลาดในการดึงข้อมูลจาก Firebase:\n" + error.message);
    } finally {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) loadingScreen.style.display = 'none';
    }
}

function renderMonsterGrid(monstersToRender) {
    const book = document.getElementById('bookContent');
    document.querySelectorAll('.dynamic-page').forEach(el => el.remove());
    book.innerHTML = ''; 

    const worldMonsters = monstersToRender.filter(m => m.data.category !== 'iceborne'); 
    const iceborneMonsters = monstersToRender.filter(m => m.data.category === 'iceborne');

    renderCategory(worldMonsters, 'sec-world', 'Monster List (World)', 'world');
    renderCategory(iceborneMonsters, 'sec-iceborne', 'Monster List (Iceborne)', 'iceborne');
    updateNavigation();
}

function renderCategory(items, baseSectionId, titleText, category) {
    const baseSec = document.getElementById(baseSectionId);
    if (!baseSec) return;
    
    let targetGrid = baseSec.querySelector('.monster-grid');
    targetGrid.innerHTML = '';

    const itemsPerPage = 12;
    const pages = [];
    if (items.length === 0) { pages.push([]); } 
    else {
        for (let i = 0; i < items.length; i += itemsPerPage) { pages.push(items.slice(i, i + itemsPerPage)); }
    }

    let previousNode = baseSec;

    pages.forEach((pageItems, pageIndex) => {
        let currentGrid;
        if (pageIndex === 0) {
            currentGrid = targetGrid;
            const title = baseSec.querySelector('.monster-list-title');
            if(title) title.innerText = titleText;
        } else {
            const newSection = baseSec.cloneNode(true);
            newSection.id = ''; newSection.classList.remove('sec2', 'sec3'); newSection.classList.add('dynamic-page', `dynamic-page-${category}`); 
            const searchBox = newSection.querySelector('.search-container'); if (searchBox) searchBox.remove();
            const title = newSection.querySelector('.monster-list-title'); if(title) title.innerText = `${titleText} (Page ${pageIndex + 1})`;
            currentGrid = newSection.querySelector('.monster-grid'); currentGrid.innerHTML = ''; 
            previousNode.parentNode.insertBefore(newSection, previousNode.nextSibling); previousNode = newSection;
        }

        const book = document.getElementById('bookContent');

        pageItems.forEach(item => {
            const m = item.data; const id = item.id;
            
            const cardHTML = `
                <div class="monster-card ${window.selectedForDelete.includes(id) ? 'selected-for-delete' : ''}" id="card-${id}" style="background-image: url('${m.thumbnail}');">
                    <div class="monster-name-tag">${m.name}</div>
                </div>
            `;
            currentGrid.insertAdjacentHTML('beforeend', cardHTML);

            const cardEl = currentGrid.lastElementChild;
            cardEl.addEventListener('click', () => {
                if (window.adminMode === 'edit') {
                    openEditModal(id); 
                } else if (window.adminMode === 'delete') {
                    toggleMonsterSelection(id, cardEl); 
                } else {
                    openModal(id); 
                }
            });

            if (!document.getElementById(`content-${id}`)) {
                const pageHTML = `
                    <div id="content-${id}" class="monster-detail-layout" style="display: none;">
                        <div class="monster-image-large">
                            <img src="${m.detailImage}" alt="${m.name}" onclick="openLightbox(this.src)" />
                        </div>
                        <div class="monster-info">
                            <h2>${m.name}</h2>
                            <div class="info-section">
                                <h3>General Info</h3>
                                <p style="margin-bottom: 5px;"><strong>🦖 ประเภท (Species):</strong> ${m.species || 'ไม่ระบุ'}</p>
                                <p style="margin-bottom: 5px;"><strong>📍 สถานที่พบ (Habitats):</strong> ${m.habitats || 'ไม่ระบุ'}</p>
                                <p style="margin-bottom: 15px;"><strong>☠️ สถานะผิดปกติ (Ailments):</strong> ${m.ailments || 'ไม่มี'}</p>
                                <p>${m.description}</p>
                            </div>
                            <div class="info-section">
                                <h3>Weakness</h3>
                                <p>${m.weaknessText}</p>
                                ${m.weaknessChart ? `<img src="${m.weaknessChart}" class="weakness-img" onclick="openLightbox(this.src)">` : ''}
                            </div>
                        </div>
                    </div>
                `;
                book.insertAdjacentHTML('beforeend', pageHTML);
            }
        });
    });
}

window.toggleMode = function(mode) {
    if (!window.isAdminLoggedIn) return;

    document.querySelector('.edit-tool').classList.remove('active-mode');
    document.querySelector('.delete-tool').classList.remove('active-mode');
    document.body.classList.remove('edit-mode', 'delete-mode');
    document.getElementById('deleteActionBar').classList.remove('show');
    
    window.selectedForDelete = []; 
    document.querySelectorAll('.monster-card').forEach(card => card.classList.remove('selected-for-delete'));

    if (window.adminMode === mode) {
        window.adminMode = 'normal';
        return;
    }

    window.adminMode = mode;
    
    if (mode === 'edit') {
        document.querySelector('.edit-tool').classList.add('active-mode');
        document.body.classList.add('edit-mode');
    } else if (mode === 'delete') {
        document.querySelector('.delete-tool').classList.add('active-mode');
        document.body.classList.add('delete-mode');
        document.getElementById('deleteActionBar').classList.add('show');
        updateDeleteCount();
    }
}

window.toggleMonsterSelection = function(id, cardEl) {
    const index = window.selectedForDelete.indexOf(id);
    if (index > -1) {
        window.selectedForDelete.splice(index, 1);
        cardEl.classList.remove('selected-for-delete');
    } else {
        window.selectedForDelete.push(id);
        cardEl.classList.add('selected-for-delete');
    }
    updateDeleteCount();
}

function updateDeleteCount() {
    const count = window.selectedForDelete.length;
    const textEl = document.getElementById('deleteCountText');
    const confirmBtn = document.querySelector('.delete-action-bar .confirm');
    
    if (count > 0) {
        textEl.innerText = `เตรียมลบมอนสเตอร์ ${count} ตัว`;
        confirmBtn.style.display = 'block';
    } else {
        textEl.innerText = `คลิกเลือกมอนสเตอร์ที่ต้องการลบ (0 ตัว)`;
        confirmBtn.style.display = 'none';
    }
}

window.openFullScreenDeleteConfirm = function() {
    if (window.selectedForDelete.length === 0) return;
    
    const listEl = document.getElementById('deleteNamesList');
    listEl.innerHTML = '';
    
    window.selectedForDelete.forEach(id => {
        const mName = monstersData[id].name;
        listEl.innerHTML += `<div>- ${mName}</div>`;
    });
    
    document.getElementById('fullScreenDeleteModal').classList.add('show');
}
window.closeFullScreenDeleteConfirm = function() {
    document.getElementById('fullScreenDeleteModal').classList.remove('show');
}

window.executeMassDelete = async function() {
    if (window.selectedForDelete.length === 0) return;
    
    const btn = document.querySelector('.game-button.danger');
    btn.innerText = "กำลังลบข้อมูล... ⏳";
    btn.disabled = true;

    try {
        for (let i = 0; i < window.selectedForDelete.length; i++) {
            await deleteDoc(doc(db, "monsters", window.selectedForDelete[i]));
        }
        alert("✅ ลบข้อมูลสำเร็จเรียบร้อย!");
        
        closeFullScreenDeleteConfirm();
        toggleMode('normal');
        loadMonsters();
        
    } catch (error) {
        alert("❌ เกิดข้อผิดพลาดในการลบ: " + error.message);
    } finally {
        btn.innerText = "ยืนยันการลบถาวร";
        btn.disabled = false;
    }
}

window.handleSearch = function(searchTerm) {
    try {
        const term = searchTerm.toLowerCase().trim();
        let filtered = [];
        const searchContainer = document.querySelector('.search-container');
        let targetIndex = 1; 
        
        if (term === "") {
            filtered = allMonstersArray;
            if (searchContainer) {
                searchContainer.classList.remove('is-searching');
                searchContainer.style.top = '';
                searchContainer.style.transform = '';
            }
        } else {
            filtered = allMonstersArray.filter(item => {
                const mName = item.data.name || "";
                return mName.toLowerCase().includes(term);
            });
        }
        
        renderMonsterGrid(filtered);

        if (window.adminMode === 'delete') {
            window.selectedForDelete.forEach(id => {
                const card = document.getElementById(`card-${id}`);
                if (card) card.classList.add('selected-for-delete');
            });
        }

        if (term !== "") {
            const hasWorld = filtered.some(m => m.data.category !== 'iceborne');
            const hasIceborne = filtered.some(m => m.data.category === 'iceborne');
            const sectionsArray = Array.from(document.querySelectorAll('.section, .dynamic-page'));
            
            if (!hasWorld && hasIceborne) {
                targetIndex = sectionsArray.findIndex(sec => sec.id === 'sec-iceborne' || sec.classList.contains('dynamic-page-iceborne'));
                if (targetIndex === -1) targetIndex = 2; 
            } else if (hasWorld) {
                targetIndex = sectionsArray.findIndex(sec => sec.id === 'sec-world' || sec.classList.contains('dynamic-page-world'));
                if (targetIndex === -1) targetIndex = 1; 
            }

            if (searchContainer) {
                searchContainer.classList.add('is-searching');
                const offsetVH = (targetIndex - 1) * 100;
                searchContainer.style.top = `calc(${offsetVH}vh + 40px)`;
            }
        } else {
            targetIndex = 1;
        }
        scrollToSection(targetIndex);
    } catch (err) {
        console.error("Search Error:", err);
    }
}

// ================= ระบบหยุดการเลื่อนจอเมื่อเปิด Popup =================
function isModalOpen() {
    const lb = document.getElementById('imageLightbox');
    return modal.classList.contains('show') || 
        document.getElementById('addMonsterModal').classList.contains('show') || 
        document.getElementById('editMonsterModal').classList.contains('show') || 
        document.getElementById('fullScreenDeleteModal').classList.contains('show') ||
        (lb && lb.style.display === 'flex');
}

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
    if (isModalOpen()) return;
    if (isScrolling) return;
    if (e.deltaY > 0) scrollToSection(currentSection + 1);
    else scrollToSection(currentSection - 1);
});

window.addEventListener('keydown', (e) => {
    if (isModalOpen()) return;
    if (document.activeElement === document.getElementById('searchInput')) return;
    if (isScrolling) return;
    if (e.key === 'ArrowDown') scrollToSection(currentSection + 1);
    if (e.key === 'ArrowUp') scrollToSection(currentSection - 1);
});

function openModal(monsterId) {
    modal.classList.add('show');
    const allContents = document.querySelectorAll('.monster-detail-layout');
    allContents.forEach(content => { content.style.display = 'none'; });
    const targetContent = document.getElementById('content-' + monsterId);
    if (targetContent) targetContent.style.display = 'flex';
}
function closeModal() { modal.classList.remove('show'); }
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
window.closeModal = closeModal;

window.openAddModal = function() { 
    toggleMode('normal');
    const catSelect = document.getElementById('newCategory');
    if(catSelect) { 
        const activeSection = document.querySelectorAll('.section, .dynamic-page')[currentSection];
        if (activeSection && (activeSection.id === 'sec-iceborne' || activeSection.classList.contains('dynamic-page-iceborne'))) { catSelect.value = 'iceborne'; } 
        else { catSelect.value = 'world'; }
    }
    document.getElementById('addMonsterModal').classList.add('show'); 
}
window.closeAddModal = function() { document.getElementById('addMonsterModal').classList.remove('show'); }

window.openEditModal = function(id) {
    const m = monstersData[id];
    if (m) {
        document.getElementById('editMonsterId').value = id;
        document.getElementById('editCategory').value = m.category || 'world';
        document.getElementById('editName').value = m.name;
        document.getElementById('editSpecies').value = m.species || '';
        document.getElementById('editHabitats').value = m.habitats || '';
        document.getElementById('editAilments').value = m.ailments || '';
        document.getElementById('editDescription').value = m.description;
        document.getElementById('editWeaknessText').value = m.weaknessText;
        document.getElementById('editMonsterModal').classList.add('show');
    }
}
window.closeEditModal = function() { 
    document.getElementById('editMonsterModal').classList.remove('show'); 
    toggleMode('normal'); 
}
document.getElementById('editMonsterModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('editMonsterModal')) closeEditModal();
});

async function uploadToImgBB(fileInput) {
    const file = fileInput.files[0];
    if (!file) return ""; 

    const apiKey = "a29644d7e65dd033a1dd85cc6924c29e"; 
    const formData = new FormData();
    formData.append("image", file);

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, { method: "POST", body: formData });
        const data = await response.json();
        
        if (data.success) { return data.data.url; } 
        else { throw new Error("ImgBB Upload Failed: " + data.error.message); }
    } catch (error) { throw error; }
}

document.getElementById('addMonsterForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "กำลังอัปโหลดรูปภาพและบันทึก..."; submitBtn.disabled = true;

    try {
        const thumbnailURL = await uploadToImgBB(document.getElementById('newThumbnail'));
        const detailImageURL = await uploadToImgBB(document.getElementById('newDetailImage'));
        const weaknessChartURL = await uploadToImgBB(document.getElementById('newWeaknessChart'));

        const newMonsterData = {
            category: document.getElementById('newCategory').value,
            name: document.getElementById('newName').value,
            species: document.getElementById('newSpecies').value,
            habitats: document.getElementById('newHabitats').value,
            ailments: document.getElementById('newAilments').value,
            description: document.getElementById('newDescription').value,
            weaknessText: document.getElementById('newWeaknessText').value,
            thumbnail: thumbnailURL, detailImage: detailImageURL, weaknessChart: weaknessChartURL,
            createdAt: Date.now() 
        };
        await addDoc(collection(db, "monsters"), newMonsterData);
        alert("เพิ่มมอนสเตอร์สำเร็จ!"); this.reset(); closeAddModal(); loadMonsters();
    } catch (error) {
        alert("เกิดข้อผิดพลาด: " + error.message);
    } finally { submitBtn.innerText = originalText; submitBtn.disabled = false; }
});

document.getElementById('editMonsterForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const id = document.getElementById('editMonsterId').value;
    const oldData = monstersData[id]; 
    
    submitBtn.innerText = "กำลังอัปเดต..."; submitBtn.disabled = true;

    try {
        const thumbInput = document.getElementById('editThumbnail');
        const detailInput = document.getElementById('editDetailImage');
        const chartInput = document.getElementById('editWeaknessChart');

        const thumbnailURL = thumbInput.files.length > 0 ? await uploadToImgBB(thumbInput) : oldData.thumbnail;
        const detailImageURL = detailInput.files.length > 0 ? await uploadToImgBB(detailInput) : oldData.detailImage;
        const weaknessChartURL = chartInput.files.length > 0 ? await uploadToImgBB(chartInput) : oldData.weaknessChart;

        const updatedData = {
            category: document.getElementById('editCategory').value,
            name: document.getElementById('editName').value,
            species: document.getElementById('editSpecies').value,
            habitats: document.getElementById('editHabitats').value,
            ailments: document.getElementById('editAilments').value,
            description: document.getElementById('editDescription').value,
            weaknessText: document.getElementById('editWeaknessText').value,
            thumbnail: thumbnailURL, detailImage: detailImageURL, weaknessChart: weaknessChartURL
        };
        await updateDoc(doc(db, "monsters", id), updatedData);
        alert("แก้ไขเรียบร้อย!"); closeEditModal(); loadMonsters();
    } catch (error) {
        alert("เกิดข้อผิดพลาด: " + error.message);
    } finally { submitBtn.innerText = "บันทึกการแก้ไข"; submitBtn.disabled = false; }
});

var tag = document.createElement('script'); tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0]; firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var player; var isMuted = true;
window.onYouTubeIframeAPIReady = function() { player = new YT.Player('youtube-player', { height: '0', width: '0', videoId: 'po_t8I9FC2Y', playerVars: { 'autoplay': 1, 'loop': 1, 'controls': 0, 'playlist': 'po_t8I9FC2Y' }, events: { 'onReady': onPlayerReady } }); }
function onPlayerReady(event) { event.target.mute(); event.target.playVideo(); }
document.addEventListener('click', function(e) {
    if (e.target.id === 'muteBtn' || e.target.closest('#muteBtn')) return;
    if (player && typeof player.unMute === 'function' && player.isMuted()) { player.unMute(); player.setVolume(15); isMuted = false; const btn = document.getElementById("muteBtn"); if(btn) btn.innerHTML = "🔊 Mute Music"; }
}, { once: true });
window.toggleMute = function() { const btn = document.getElementById("muteBtn"); if (!player) return; if (isMuted) { player.unMute(); btn.innerHTML = "🔊 Mute Music"; isMuted = false; } else { player.mute(); btn.innerHTML = "🔇 Unmute Music"; isMuted = true; } }

let touchStartY = 0; let touchEndY = 0;
window.addEventListener('touchmove', e => { if (isModalOpen()) { return; } e.preventDefault(); }, { passive: false }); 
window.addEventListener('touchstart', e => { touchStartY = e.changedTouches[0].screenY; }, { passive: true });
window.addEventListener('touchend', e => {
    if (isModalOpen()) return;
    if (isScrolling) return; touchEndY = e.changedTouches[0].screenY; handleSwipe();
});
function handleSwipe() { const swipeThreshold = 50; if (touchStartY - touchEndY > swipeThreshold) { scrollToSection(currentSection + 1); } else if (touchEndY - touchStartY > swipeThreshold) { scrollToSection(currentSection - 1); } }

window.openLoginModal = function() { const modal = document.getElementById('login-modal'); if (modal) modal.style.display = 'flex'; }
window.closeLoginModal = function() { const modal = document.getElementById('login-modal'); if (modal) modal.style.display = 'none'; }
window.handleSuccessfulLogin = function() { document.getElementById('btn-login').style.display = 'none'; document.getElementById('btn-logout').style.display = 'flex'; document.body.classList.add('admin-logged-in'); window.isAdminLoggedIn = true; renderMonsterGrid(allMonstersArray); }
window.logoutAdmin = function() { 
    document.getElementById('btn-logout').style.display = 'none'; document.getElementById('btn-login').style.display = 'flex'; document.body.classList.remove('admin-logged-in'); window.isAdminLoggedIn = false; 
    toggleMode('normal'); 
    renderMonsterGrid(allMonstersArray); 
    alert("Logged out successfully."); 
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            const user = this.querySelector('input[type="text"]').value; const pass = this.querySelector('input[type="password"]').value;
            if (user === "root" && pass === "root") { window.closeLoginModal(); window.handleSuccessfulLogin(); this.reset(); } 
            else { alert("Invalid Username or Password."); this.querySelector('input[type="password"]').value = ""; }
        });
    }
});

// ==========================================
// ✅ ระบบ Lightbox ซูมและคลิกลากแพนภาพ
// ==========================================
let zoomLevel = 1;
let isDraggingImg = false;
let startX = 0, startY = 0, translateX = 0, translateY = 0;
const lightboxOverlay = document.getElementById('imageLightbox');
const lightboxImg = document.getElementById('lightboxImg');

window.openLightbox = function(src) { 
    lightboxImg.src = src; 
    lightboxOverlay.style.display = 'flex'; 
    // รีเซ็ตค่าการซูมและตำแหน่งทุกครั้งที่เปิดใหม่
    zoomLevel = 1;
    translateX = 0;
    translateY = 0;
    lightboxImg.style.transform = `translate(0px, 0px) scale(1)`;
    lightboxImg.style.transition = 'transform 0.3s ease'; // เด้งแบบนุ่มๆ
}

window.closeLightbox = function() { 
    lightboxOverlay.style.display = 'none'; 
}

// กดที่พื้นหลังดำให้ปิดหน้าต่าง
lightboxOverlay.addEventListener('click', function(e) {
    if (e.target === lightboxOverlay) {
        window.closeLightbox();
    }
});

// ใช้ลูกกลิ้งเมาส์เพื่อซูม
lightboxOverlay.addEventListener('wheel', function(e) {
    if (lightboxOverlay.style.display !== 'flex') return;
    e.preventDefault(); // ไม่ให้เผลอไปเลื่อนหน้าจอ
    
    lightboxImg.style.transition = 'transform 0.1s ease'; // ปรับความไวการซูมให้ลื่นไหล
    
    if (e.deltaY < 0) {
        zoomLevel += 0.15; // เลื่อนขึ้น = ซูมเข้า
    } else {
        zoomLevel -= 0.15; // เลื่อนลง = ซูมออก
    }
    
    // ล็อกระยะการซูมไม่ให้เล็กหรือใหญ่เกินไป
    zoomLevel = Math.min(Math.max(0.5, zoomLevel), 5); 
    lightboxImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoomLevel})`;
}, { passive: false });

// ลากเมาส์เพื่อแพนรูป
lightboxImg.addEventListener('mousedown', function(e) {
    e.preventDefault();
    isDraggingImg = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    lightboxImg.style.transition = 'none'; // ปิดดีเลย์ตอนลาก เพื่อให้ภาพติดมือ
    lightboxImg.style.cursor = 'grabbing';
});

window.addEventListener('mousemove', function(e) {
    if (!isDraggingImg) return;
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    lightboxImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoomLevel})`;
});

window.addEventListener('mouseup', function() {
    if (isDraggingImg) {
        isDraggingImg = false;
        lightboxImg.style.cursor = 'grab';
    }
});

function updateNavigation() {
    sections = document.querySelectorAll('.section, .dynamic-page'); totalSections = sections.length;
    const dotContainer = document.querySelector('.nav-dots');
    if(dotContainer) {
        dotContainer.innerHTML = ''; 
        sections.forEach((_, index) => {
            const dot = document.createElement('div'); dot.classList.add('dot');
            if (index === currentSection) dot.classList.add('active');
            dot.addEventListener('click', () => scrollToSection(index));
            dotContainer.appendChild(dot);
        });
    }
}

loadMonsters();