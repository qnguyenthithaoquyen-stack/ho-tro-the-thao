// Import các hàm cần thiết từ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Cấu hình Firebase của bạn
const firebaseConfig = {
    apiKey: "AIzaSyA2dXWCyjL2xgCSyeW9QQ7RvjI_O7kFHJw",
    authDomain: "sporthealthdata.firebaseapp.com",
    projectId: "sporthealthdata",
    storageBucket: "sporthealthdata.appspot.com",
    messagingSenderId: "789054240877",
    appId: "1:789054240877:web:04a400c9ea586523a86764",
    measurementId: "G-ZWS9C7P359"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// =================================================================================
// HÀNG RÀO XÁC THỰC VÀ LẤY DỮ LIỆU NGƯỜI DÙNG
// =================================================================================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Người dùng đã đăng nhập -> Tiếp tục hiển thị trang
        console.log("User is signed in:", user);
        
        // Lấy dữ liệu người dùng từ Firestore
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const userData = docSnap.data();
            
            // Tìm element trong HTML có id là "user-name"
            const userNameElement = document.getElementById('user-name');
            
            // Nếu tìm thấy, cập nhật nội dung của nó bằng tên người dùng
            if (userNameElement) {
                userNameElement.textContent = userData.fullName;
            }
        } else {
            console.log("Không tìm thấy dữ liệu người dùng trong Firestore!");
        }
    } else {
        // Người dùng chưa đăng nhập -> Chuyển hướng về trang đăng nhập
        console.log("User is not signed in. Redirecting to login page.");
        window.location.href = 'dangnhap.html';
    }
});

// =================================================================================
// LOGIC CỦA TRANG TỔNG QUAN (TƯƠNG TÁC, MODAL,...)
// =================================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Xử lý đăng xuất
    const logoutButton = document.getElementById('logout-btn');
    if(logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            signOut(auth).catch((error) => {
                console.error('Lỗi khi đăng xuất:', error);
            });
        });
    }

    // Lấy các element cần thiết từ DOM
    const goalsListContainer = document.getElementById('goals-list');
    const selectedGoalContainer = document.getElementById('selected-goal');
    const completionMessageContainer = document.getElementById('completion-message');
    const selectedGoalContent = document.getElementById('selected-goal-content');
    const completeBtn = document.getElementById('complete-btn');
    const resetBtn = document.getElementById('reset-btn');
    const selectButtons = document.querySelectorAll('.task-action button');
    
    // Elements của Modal
    const suggestionModal = document.getElementById('suggestion-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // Dữ liệu gợi ý (có thể mở rộng sau này)
    const suggestions = {
        strength: [
            { name: 'Chống đẩy', img: 'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg?auto=compress&cs=tinysrgb&w=600' },
            { name: 'Hít xà', img: 'https://images.pexels.com/photos/3490360/pexels-photo-3490360.jpeg?auto=compress&cs=tinysrgb&w=600' },
            { name: 'Kéo tạ đơn', img: 'https://images.pexels.com/photos/6550853/pexels-photo-6550853.jpeg?auto=compress&cs=tinysrgb&w=600' },
            { name: 'Đẩy tạ qua đầu', img: 'https://images.pexels.com/photos/1229356/pexels-photo-1229356.jpeg?auto=compress&cs=tinysrgb&w=600' }
        ]
    };

    function openSuggestionModal(type) {
        const data = suggestions[type];
        let title = (type === 'strength') ? 'Gợi ý bài tập sức mạnh' : 'Gợi ý';
        
        modalTitle.textContent = title;
        modalBody.innerHTML = ''; // Xóa nội dung cũ

        data.forEach(item => {
            const card = `
                <div class="suggestion-card" data-task-name="${item.name}">
                    <img src="${item.img}" alt="${item.name}">
                    <p>${item.name}</p>
                </div>
            `;
            modalBody.innerHTML += card;
        });

        document.querySelectorAll('.suggestion-card').forEach(card => {
            card.addEventListener('click', () => {
                const taskName = card.dataset.taskName;
                const originalTaskElement = document.querySelector(`.task-item[data-goal="${type}"]`);
                const clonedTask = originalTaskElement.cloneNode(true);
                
                clonedTask.querySelector('h3').textContent = taskName;
                clonedTask.querySelector('.task-action').remove();

                selectedGoalContent.innerHTML = '';
                selectedGoalContent.appendChild(clonedTask);

                suggestionModal.classList.remove('visible');
                goalsListContainer.classList.add('hidden');
                selectedGoalContainer.classList.remove('hidden');
            });
        });

        suggestionModal.classList.add('visible');
    }
    
    if(closeModalBtn) {
        closeModalBtn.addEventListener('click', () => suggestionModal.classList.remove('visible'));
    }
    if(suggestionModal){
        suggestionModal.addEventListener('click', (e) => {
            if (e.target === suggestionModal) {
                suggestionModal.classList.remove('visible');
            }
        });
    }

    selectButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const selectedTask = e.target.closest('.task-item');
            const goalType = selectedTask.dataset.goal;
            
            if (goalType === 'strength') {
                openSuggestionModal(goalType);
            } else {
                const clonedTask = selectedTask.cloneNode(true);
                clonedTask.querySelector('.task-action').remove();
                
                selectedGoalContent.innerHTML = '';
                selectedGoalContent.appendChild(clonedTask);

                goalsListContainer.classList.add('hidden');
                selectedGoalContainer.classList.remove('hidden');
            }
        });
    });
    
    if(completeBtn) {
        completeBtn.addEventListener('click', () => {
            selectedGoalContainer.classList.add('hidden');
            completionMessageContainer.classList.remove('hidden');
        });
    }

    if(resetBtn) {
        resetBtn.addEventListener('click', () => {
            completionMessageContainer.classList.add('hidden');
            goalsListContainer.classList.remove('hidden');
        });
    }
});

