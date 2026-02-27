const ADMIN_PASSWORD = "admin123";

        // --- สถานะแอปพลิเคชัน (State & Mock Data) ---
        let isAdmin = false;
        let currentViewingId = null;

        let monsters = [
            {
                id: "m1", 
                name: "Rathalos",
                thumb: "https://monsterhunterworld.wiki.fextralife.com/file/Monster-Hunter-World/mhw-rathalos_render_001.png",
                image: "https://d1lss44jz7tayy.cloudfront.net/space/crop/show/tv/video/asset/2018/01/29/mhw_rathalos_ps4_pro_1080p_1517228308.jpg",
                desc: "จ้าวแห่งท้องฟ้า (King of the Skies) มังกรบินที่มีความสามารถในการพ่นลูกไฟและมีกรงเล็บอาบยาพิษ",
                tips: "พก Flash Pods (ระเบิดแสง) ไปเยอะๆ เมื่อมันบินขึ้นฟ้าให้ยิง Flash ใส่หน้า มันจะร่วงลงมาให้เราตีฟรีๆ ตัดหางได้เพื่อลดรัศมีการโจมตี",
                weakness: ["มังกร", "สายฟ้า"]
            },
            {
                id: "m2", 
                name: "Great Jagras",
                thumb: "https://monsterhunterworld.wiki.fextralife.com/file/Monster-Hunter-World/great_jagras_render_001.png",
                image: "https://images.pushsquare.com/b9ad781b0a850/monster-hunter-world-great-jagras.large.jpg",
                desc: "มอนสเตอร์สำหรับผู้เริ่มต้น มักจะกลืนเหยื่อทั้งตัวทำให้ท้องป่องและใช้ท้องกลิ้งทับเรา",
                tips: "มอนสเตอร์ฝึกหัด โจมตีไปที่ท้องตอนที่มันป่องสุดๆ จะทำให้มันล้มได้ง่ายมาก การเคลื่อนไหวช้า หลบออกด้านข้างได้สบาย",
                weakness: ["ไฟ", "สายฟ้า"]
            },
            {
                id: "m3", 
                name: "Anjanath",
                thumb: "https://monsterhunterworld.wiki.fextralife.com/file/Monster-Hunter-World/mhw-anjanath_render_001.png",
                image: "https://gamewith-en.akamaized.net/article/thumbnail/rectangle/2180.jpg",
                desc: "ไดโนเสาร์จอมเกรี้ยวกราด อาศัยในป่าทึบ เมื่อโกรธจะมีครีบโผล่ที่หลังและพ่นไฟได้",
                tips: "ระวังท่ากัดและพ่นไฟตรงหน้า พยายามอยู่ด้านข้างหรือระหว่างขาของมันเพื่อโจมตี เมื่อครีบจมูกมันโผล่ ให้ตีที่จมูกให้แตก",
                weakness: ["น้ำ", "น้ำแข็ง"]
            }
        ];

        // --- ฟังก์ชันหลักในการแสดงผลหน้าจอ (Render UI) ---
        const grid = document.getElementById('monsterGrid');
        
        function renderMonsters(searchQuery = "") {
            grid.innerHTML = ""; 
            
            // กรองข้อมูลตามที่ค้นหา
            const filtered = monsters.filter(m => 
                m.name.toLowerCase().includes(searchQuery.toLowerCase())
            );

            // ถ้าเป็น Admin ให้สร้างปุ่ม "เพิ่มมอนสเตอร์" ไว้ล่วงหน้า
            if (isAdmin) {
                const addCard = document.createElement('div');
                addCard.className = 'monster-card add-card';
                addCard.style.display = 'flex';
                addCard.onclick = () => openFormModal();
                addCard.innerHTML = `
                    <svg viewBox="0 0 24 24">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                    เพิ่มมอนสเตอร์
                `;
                grid.appendChild(addCard);
            }

            // แสดงรายการมอนสเตอร์
            filtered.forEach(m => {
                const card = document.createElement('div');
                card.className = 'monster-card';
                card.style.backgroundImage = `url('${m.thumb}')`;
                card.onclick = () => openDetailModal(m.id);
                card.innerHTML = `
                    <div class="card-overlay">
                        <h3 class="card-name">${m.name}</h3>
                    </div>
                `;
                grid.appendChild(card);
            });

            // กรณีไม่พบมอนสเตอร์ที่ค้นหา
            if (filtered.length === 0) {
                grid.innerHTML += `<p style="grid-column: 1/-1; text-align:center; color: #888;">ไม่พบมอนสเตอร์ที่ค้นหา</p>`;
            }
        }

        // แปลงข้อความจุดอ่อน เป็นไอคอนสวยงาม
        function getElementBadge(elementName) {
            const icons = {
                "ไฟ": { icon: "🔥", color: "#e74c3c", text: "Fire" },
                "น้ำ": { icon: "💧", color: "#3498db", text: "Water" },
                "สายฟ้า": { icon: "⚡", color: "#f1c40f", text: "Thunder" },
                "น้ำแข็ง": { icon: "❄️", color: "#00d2d3", text: "Ice" },
                "มังกร": { icon: "🐉", color: "#8e44ad", text: "Dragon" }
            };
            const el = elementName.trim();
            
            if (icons[el]) {
                return `
                    <span class="weak-badge" style="color: ${icons[el].color}; border-color: ${icons[el].color};">
                        ${icons[el].icon} ${icons[el].text}
                    </span>
                `;
            }
            return `<span class="weak-badge">🎯 ${el}</span>`;
        }

        // --- ระบบควบคุมป๊อปอัป (Modal Controls) ---
        function closeModal(e, modalId, force = false) {
            const modal = document.getElementById(modalId);
            if (force || e.target === modal) {
                modal.classList.remove('active');
            }
        }

        function openDetailModal(id) {
            const m = monsters.find(x => x.id === id);
            if (!m) return;
            
            currentViewingId = id;

            // ใส่ข้อมูลลงในหน้าจอรายละเอียด
            document.getElementById('viewName').innerText = m.name;
            document.getElementById('viewImage').src = m.image;
            document.getElementById('viewDesc').innerText = m.desc;
            document.getElementById('viewTips').innerText = m.tips || "ไม่มีข้อมูลเพิ่มเติม";
            
            // แสดงจุดอ่อน
            const weakContainer = document.getElementById('viewWeakness');
            weakContainer.innerHTML = "";
            if (m.weakness && m.weakness.length > 0) {
                m.weakness.forEach(w => { 
                    weakContainer.innerHTML += getElementBadge(w); 
                });
            } else {
                weakContainer.innerHTML = "<span>ไม่มีข้อมูล</span>";
            }

            // แสดง/ซ่อน ปุ่มแก้ไขและลบตามสิทธิ์
            document.getElementById('detailAdminControls').style.display = isAdmin ? 'flex' : 'none';
            document.getElementById('detailModal').classList.add('active');
        }

        function openFormModal(editId = null) {
            const form = document.getElementById('monsterForm');
            const title = document.getElementById('formTitle');
            
            if (editId) {
                // กรณีแก้ไขข้อมูล (Edit)
                const m = monsters.find(x => x.id === editId);
                title.innerText = "✏️ แก้ไขข้อมูล: " + m.name;
                document.getElementById('formId').value = m.id;
                document.getElementById('formName').value = m.name;
                document.getElementById('formThumb').value = m.thumb;
                document.getElementById('formImage').value = m.image;
                document.getElementById('formDesc').value = m.desc;
                document.getElementById('formTips').value = m.tips;
                document.getElementById('formWeakness').value = m.weakness.join(", ");
            } else {
                // กรณีเพิ่มข้อมูลใหม่ (Add)
                form.reset();
                title.innerText = "➕ เพิ่มมอนสเตอร์ใหม่";
                document.getElementById('formId').value = "";
            }
            
            document.getElementById('formModal').classList.add('active');
        }

        function openEditModal() {
            document.getElementById('detailModal').classList.remove('active');
            openFormModal(currentViewingId);
        }

        // --- ระบบจัดการข้อมูล CRUD (Admin Operations) ---
        function handleFormSubmit(e) {
            e.preventDefault();
            
            const id = document.getElementById('formId').value;
            const weakInput = document.getElementById('formWeakness').value;
            
            const newData = {
                name: document.getElementById('formName').value,
                thumb: document.getElementById('formThumb').value,
                image: document.getElementById('formImage').value,
                desc: document.getElementById('formDesc').value,
                tips: document.getElementById('formTips').value,
                weakness: weakInput ? weakInput.split(",").map(s => s.trim()) : []
            };

            if (id) {
                // แก้ไขข้อมูลเดิม
                const index = monsters.findIndex(x => x.id === id);
                if (index !== -1) {
                    monsters[index] = { ...monsters[index], ...newData };
                    showToast("✅ อัปเดตข้อมูลเรียบร้อย!");
                }
            } else {
                // เพิ่มข้อมูลใหม่
                newData.id = "m" + Date.now();
                monsters.push(newData);
                showToast("✨ เพิ่มมอนสเตอร์ตัวใหม่แล้ว!");
            }

            document.getElementById('formModal').classList.remove('active');
            renderMonsters();
        }

        function deleteCurrentMonster() {
            if (confirm(`⚠️ คุณแน่ใจหรือไม่ว่าจะลบข้อมูลนี้ทิ้ง?`)) {
                monsters = monsters.filter(x => x.id !== currentViewingId);
                document.getElementById('detailModal').classList.remove('active');
                showToast("🗑️ ลบมอนสเตอร์ออกจากสารบบแล้ว");
                renderMonsters();
            }
        }

        // --- ระบบล็อกอินและฟังก์ชันช่วยเหลือ (Auth & Utils) ---
        function toggleLoginModal() {
            if (isAdmin) {
                // ออกจากระบบ (Logout)
                isAdmin = false;
                document.getElementById('authBtn').innerText = "Login Admin";
                document.getElementById('authBtn').style.color = "";
                document.getElementById('authBtn').style.borderColor = "";
                showToast("🔒 ออกจากระบบ (โหมดผู้ใช้ทั่วไป)");
                renderMonsters();
            } else {
                // เปิดหน้าล็อกอิน (Login)
                document.getElementById('loginPassword').value = "";
                document.getElementById('loginModal').classList.add('active');
            }
        }

        function attemptLogin() {
            const pw = document.getElementById('loginPassword').value;
            
            if (pw === ADMIN_PASSWORD) {
                isAdmin = true;
                document.getElementById('loginModal').classList.remove('active');
                document.getElementById('authBtn').innerHTML = "⚙️ Logout Admin";
                document.getElementById('authBtn').style.color = "#D4AF37";
                document.getElementById('authBtn').style.borderColor = "#D4AF37";
                showToast("🔓 เข้าสู่ระบบ Admin เรียบร้อย เปิดโหมดแก้ไข");
                renderMonsters(); 
            } else {
                showToast("❌ รหัสผ่านไม่ถูกต้อง");
            }
        }

        // แสดงกล่องแจ้งเตือนสวยงามที่มุมจอ
        function showToast(message) {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            
            toast.className = 'toast';
            toast.innerText = message;
            container.appendChild(toast);
            
            setTimeout(() => {
                toast.style.animation = "slideIn 0.3s reverse forwards";
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        // --- จับเหตุการณ์ต่างๆ (Event Listeners) ---
        document.getElementById('searchInput').addEventListener('input', (e) => {
            renderMonsters(e.target.value);
        });

        // เริ่มต้นการทำงานเมื่อโหลดหน้าเว็บเสร็จ
        window.onload = () => {
            renderMonsters();
        };