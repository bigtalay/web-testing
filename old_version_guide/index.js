let currentSection = 0;
let totalSections = 4; 
let isScrolling = false;
const container = document.getElementById('mainContainer');
let sections = document.querySelectorAll('.section');
const modal = document.getElementById('monsterModal');

window.isAdminLoggedIn = false; 

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

// Tell Firebase to use Long Polling to bypass firewalls
const db = initializeFirestore(app, {
    experimentalForceLongPolling: true
});

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

    let allItems = [...items];
    const itemsPerPage = 12;
    const pages = [];
    
    if (allItems.length === 0) {
        pages.push([]); 
    } else {
        for (let i = 0; i < allItems.length; i += itemsPerPage) {
            pages.push(allItems.slice(i, i + itemsPerPage));
        }
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
            newSection.id = ''; 
            newSection.classList.remove('sec2', 'sec3'); 
            newSection.classList.add('dynamic-page', `dynamic-page-${category}`); 
            
            const searchBox = newSection.querySelector('.search-container');
            if (searchBox) searchBox.remove();

            const title = newSection.querySelector('.monster-list-title');
            if(title) title.innerText = `${titleText} (Page ${pageIndex + 1})`;
            
            currentGrid = newSection.querySelector('.monster-grid');
            currentGrid.innerHTML = ''; 
            
            previousNode.parentNode.insertBefore(newSection, previousNode.nextSibling);
            previousNode = newSection;
        }

        const book = document.getElementById('bookContent');

        pageItems.forEach(item => {
            const m = item.data;
            const id = item.id;

            const cardHTML = `
                <div class="monster-card" id="card-${id}" style="background-image: url('${m.thumbnail}');">
                    <div class="monster-name-tag">${m.name}</div>
                </div>
            `;
            currentGrid.insertAdjacentHTML('beforeend', cardHTML);

            currentGrid.lastElementChild.addEventListener('click', () => {
                openModal(id);
            });

            if (!document.getElementById(`content-${id}`)) {
                const pageHTML = `
                    <div id="content-${id}" class="monster-detail-layout" style="display: none;">
                        <div class="monster-image-large">
                            <img src="${m.detailImage}" alt="${m.name}" onclick="openLightbox(this.src)" />
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

// ==========================================
// ✅ ฟังก์ชันค้นหาแบบใหม่: ดันกล่องไปอยู่ชิดขอบบนจอเสมอ
// ==========================================
window.handleSearch = function(searchTerm) {
    try {
        const term = searchTerm.toLowerCase().trim();
        let filtered = [];
        
        const searchContainer = document.querySelector('.search-container');
        let targetIndex = 1; // เริ่มต้นที่หน้า World
        
        if (term === "") {
            filtered = allMonstersArray;
            // ถ้าลบคำค้นหาทิ้ง ให้กล่องกลับไปอยู่จุดเดิม
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
                // คำนวณความสูงให้กล่องไปลอยอยู่ "ห่างจากขอบบน 40px" ของหน้าที่สไลด์ไป
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
// ==========================================

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
    
    // ป้องกันหน้าจอสไลด์เวลาที่เรากดลูกศรเลื่อนซ้ายขวาในช่องค้นหา
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

function closeModal() {
    modal.classList.remove('show');
    document.querySelectorAll('.delete-confirm').forEach(el => el.classList.remove('show-confirm'));
}
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});
window.closeModal = closeModal;

window.openAddModal = function() { 
    const catSelect = document.getElementById('newCategory');
    if(catSelect) { 
        const activeSection = document.querySelectorAll('.section, .dynamic-page')[currentSection];
        if (activeSection && (activeSection.id === 'sec-iceborne' || activeSection.classList.contains('dynamic-page-iceborne'))) {
            catSelect.value = 'iceborne';
        } else {
            catSelect.value = 'world';
        }
    }
    document.getElementById('addMonsterModal').classList.add('show'); 
}
window.closeAddModal = function() { document.getElementById('addMonsterModal').classList.remove('show'); }

document.getElementById('addMonsterForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    
    submitBtn.innerText = "กำลังอัปโหลดรูปภาพและบันทึก..."; 
    submitBtn.disabled = true;

    try {
        // 1. Upload images to ImgBB and get the URL strings
        const thumbnailURL = await uploadToImgBB(document.getElementById('newThumbnail'));
        const detailImageURL = await uploadToImgBB(document.getElementById('newDetailImage'));
        const weaknessChartURL = await uploadToImgBB(document.getElementById('newWeaknessChart'));

        // 2. Prepare the data object using those URLs
        const newMonsterData = {
            name: document.getElementById('newName').value,
            species: document.getElementById('newSpecies').value,
            habitats: document.getElementById('newHabitats').value,
            ailments: document.getElementById('newAilments').value,
            description: document.getElementById('newDescription').value,
            weaknessText: document.getElementById('newWeaknessText').value,
            thumbnail: thumbnailURL,       // Use the URL from ImgBB
            detailImage: detailImageURL,   // Use the URL from ImgBB
            weaknessChart: weaknessChartURL, // Use the URL from ImgBB
            createdAt: Date.now() 
        };

        // 3. Save to Firebase
        // Note: Make sure 'db' and 'collection' are imported/defined in your script
        await addDoc(collection(db, "monsters"), newMonsterData);

        // 4. Success UI updates
        alert("เพิ่มมอนสเตอร์สำเร็จ!");
        this.reset(); // Clear the form
        closeAddModal(); // Close the popup
        loadMonsters(); // Refresh the list on the screen

    } catch (error) {
        console.error("Error adding monster:", error);
        alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    }
});



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
window.closeEditModal = function() { document.getElementById('editMonsterModal').classList.remove('show'); }
document.getElementById('editMonsterModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('editMonsterModal')) closeEditModal();
});

// Replace your old convertFileToBase64 with this
async function uploadToImgBB(fileInput) {
    const file = fileInput.files[0];
    if (!file) return ""; // Return empty if no file selected

    const apiKey = "a29644d7e65dd033a1dd85cc6924c29e"; // Put your API key here
    const formData = new FormData();
    formData.append("image", file);

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: "POST",
            body: formData
        });
        const data = await response.json();
        
        if (data.success) {
            return data.data.url; // This is the direct link to the image
        } else {
            throw new Error("ImgBB Upload Failed: " + data.error.message);
        }
    } catch (error) {
        console.error("Upload error:", error);
        throw error;
    }
}



document.getElementById('editMonsterForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const id = document.getElementById('editMonsterId').value;
    const oldData = monstersData[id]; // Get current data to keep old images if no new ones
    
    submitBtn.innerText = "กำลังอัปเดต...";
    submitBtn.disabled = true;

    try {
        // Only upload if a file is actually selected in the input
        const thumbInput = document.getElementById('editThumbnail');
        const detailInput = document.getElementById('editDetailImage');
        const chartInput = document.getElementById('editWeaknessChart');

        const thumbnailURL = thumbInput.files.length > 0 ? await uploadToImgBB(thumbInput) : oldData.thumbnail;
        const detailImageURL = detailInput.files.length > 0 ? await uploadToImgBB(detailInput) : oldData.detailImage;
        const weaknessChartURL = chartInput.files.length > 0 ? await uploadToImgBB(chartInput) : oldData.weaknessChart;

        const updatedData = {
            name: document.getElementById('editName').value,
            description: document.getElementById('editDescription').value,
            weaknessText: document.getElementById('editWeaknessText').value,
            thumbnail: thumbnailURL,
            detailImage: detailImageURL,
            weaknessChart: weaknessChartURL
        };

        await updateDoc(doc(db, "monsters", id), updatedData);
        alert("แก้ไขเรียบร้อย!");
        closeEditModal(); closeModal(); loadMonsters();
    } catch (error) {
        alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
        submitBtn.innerText = "บันทึกการแก้ไข";
        submitBtn.disabled = false;
    }
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
    } catch (error) { 
        alert("❌ เกิดข้อผิดพลาดในการลบ: " + (error.message || error)); 
    }
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
    renderMonsterGrid(allMonstersArray); 
}

window.logoutAdmin = function() {
    document.getElementById('btn-logout').style.display = 'none';
    document.getElementById('btn-login').style.display = 'flex'; 
    document.body.classList.remove('admin-logged-in');
    window.isAdminLoggedIn = false;
    renderMonsterGrid(allMonstersArray); 
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

window.openLightbox = function(src) {
    const lightbox = document.getElementById('imageLightbox');
    const img = document.getElementById('lightboxImg');
    img.src = src;
    lightbox.style.display = 'flex';
}

window.closeLightbox = function() {
    document.getElementById('imageLightbox').style.display = 'none';
}

function updateNavigation() {
    sections = document.querySelectorAll('.section, .dynamic-page'); 
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