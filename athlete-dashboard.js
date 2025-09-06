// Import các hàm cần thiết từ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, query, onSnapshot, orderBy } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

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

// --- Bắt đầu mã chính sau khi trang tải xong ---
document.addEventListener('DOMContentLoaded', () => {

    // Lấy các phần tử trên trang
    const logoutButton = document.getElementById('logout-btn');
    const userNameSpan = document.getElementById('user-name');
    const goalsListContainer = document.getElementById('goals-list');
    const selectedGoalContainer = document.getElementById('selected-goal');
    const completionMessageContainer = document.getElementById('completion-message');
    const selectedGoalContent = document.getElementById('selected-goal-content');
    const completeBtn = document.getElementById('complete-btn');
    const resetBtn = document.getElementById('reset-btn');
    
    // Các phần tử của Modal
    const suggestionModal = document.getElementById('suggestion-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // === HÀNG RÀO XÁC THỰC ===
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists() && docSnap.data().role === 'athlete') {
                if (userNameSpan && docSnap.data().fullName) {
                    userNameSpan.textContent = docSnap.data().fullName;
                }
                // Khởi chạy các chức năng của trang
                initializeDashboard(user);
            } else {
                alert('Bạn không có quyền truy cập trang này.');
                window.location.href = 'dangnhap.html';
            }
        } else {
            window.location.href = 'dangnhap.html';
        }
    });

    function initializeDashboard(user) {
        // === CHỨC NĂNG NÚT ĐĂNG XUẤT ===
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                signOut(auth).catch((error) => console.error('Lỗi khi đăng xuất:', error));
            });
        }

        // === CHỨC NĂNG MỚI: LẮNG NGHE BÀI TẬP TỪ HLV ===
        listenForExercises(user.uid);

        // === CÁC CHỨC NĂNG CŨ VẪN ĐƯỢC GIỮ NGUYÊN ===
        setupExistingUIInteractions();
    }
    
    // --- HÀM MỚI ---
    // Lắng nghe các bài tập được giao theo thời gian thực
    function listenForExercises(athleteId) {
        if (!goalsListContainer) return;

        const exercisesColRef = collection(db, "users", athleteId, "exercises");
        const q = query(exercisesColRef, orderBy("createdAt", "desc"));

        onSnapshot(q, (snapshot) => {
            // Xóa các mục tiêu cũ (trừ thẻ h2) để hiển thị bài tập mới
            while (goalsListContainer.children.length > 1) {
                goalsListContainer.removeChild(goalsListContainer.lastChild);
            }
            
            if (snapshot.empty) {
                // Nếu không có bài tập nào, có thể giữ lại các mục tiêu tĩnh hoặc hiển thị thông báo
                // Ở đây, chúng ta sẽ hiển thị thông báo
                const noExerciseItem = document.createElement('p');
                noExerciseItem.textContent = 'Bạn chưa có bài tập nào được giao.';
                noExerciseItem.style.color = '#6c757d';
                goalsListContainer.appendChild(noExerciseItem);
            } else {
                snapshot.forEach(doc => {
                    const exercise = doc.data();
                    const exerciseDiv = document.createElement('div');
                    exerciseDiv.className = 'task-item run'; // Dùng class CSS có sẵn
                    
                    exerciseDiv.innerHTML = `
                        <div class="task-info">
                            <div class="task-icon run">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                            </div>
                            <div class="task-details">
                                <h3>${exercise.title || 'Bài tập mới'}</h3>
                                <p>Bài tập từ HLV - Hạn chót: ${exercise.dueDate || 'Chưa có'}</p>
                            </div>
                        </div>
                        <div class="task-action">
                            <button class="btn-run">Chọn</button>
                        </div>
                    `;
                    goalsListContainer.appendChild(exerciseDiv);
                });
            }
        });
    }


    // --- CÁC HÀM CŨ ĐƯỢC GIỮ NGUYÊN ---
    function setupExistingUIInteractions() {
        const selectButtons = document.querySelectorAll('.task-action button');

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
            modalTitle.textContent = 'Gợi ý bài tập sức mạnh';
            modalBody.innerHTML = '';

            data.forEach(item => {
                const cardHTML = `
                    <div class="suggestion-card" data-task-name="${item.name}">
                        <img src="${item.img}" alt="${item.name}">
                        <p>${item.name}</p>
                    </div>
                `;
                modalBody.insertAdjacentHTML('beforeend', cardHTML);
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

        if(completeBtn){
            completeBtn.addEventListener('click', () => {
                selectedGoalContainer.classList.add('hidden');
                completionMessageContainer.classList.remove('hidden');
            });
        }

        if(resetBtn){
            resetBtn.addEventListener('click', () => {
                completionMessageContainer.classList.add('hidden');
                goalsListContainer.classList.remove('hidden');
            });
        }
    }
});

