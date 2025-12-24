let currentSection = 0;
const totalSections = 3;
let isScrolling = false;
const container = document.getElementById('mainContainer');
const dots = document.querySelectorAll('.dot');
const sections = document.querySelectorAll('.section');
const modal = document.getElementById('monsterModal');

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
