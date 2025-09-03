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

// Lấy các phần tử trên trang
const logoutButton = document.getElementById('logout-btn');
const userNameSpan = document.getElementById('user-name');
const goalsListContainer = document.getElementById('goals-list');
const selectedGoalContainer = document.getElementById('selected-goal');
const completionMessageContainer = document.getElementById('completion-message');
const selectedGoalContent = document.getElementById('selected-goal-content');
const completeBtn = document.getElementById('complete-btn');
const resetBtn = document.getElementById('reset-btn');
const selectButtons = document.querySelectorAll('.task-action button');

// Các phần tử của Modal
const suggestionModal = document.getElementById('suggestion-modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.getElementById('close-modal-btn');

// === HÀNG RÀO XÁC THỰC ===
// Lắng nghe sự thay đổi trạng thái đăng nhập để bảo vệ trang
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Người dùng đã đăng nhập, tiến hành lấy thông tin
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().role === 'athlete') {
            // Nếu người dùng tồn tại và có vai trò là VĐV, hiển thị tên của họ
            if (userNameSpan && docSnap.data().fullName) {
                userNameSpan.textContent = docSnap.data().fullName;
            }
        } else {
            // Nếu không có thông tin hoặc vai trò không phải VĐV, không cho phép truy cập
            alert('Bạn không có quyền truy cập trang này.');
            window.location.href = 'dangnhap.html'; // Chuyển về trang đăng nhập chính xác
        }
    } else {
        // Người dùng chưa đăng nhập, chuyển họ về trang đăng nhập
        window.location.href = 'dangnhap.html';
    }
});

// === CHỨC NĂNG NÚT ĐĂNG XUẤT ===
if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        signOut(auth).catch((error) => console.error('Lỗi khi đăng xuất:', error));
        // onAuthStateChanged sẽ tự động phát hiện việc đăng xuất và chuyển hướng người dùng
    });
}

// === LOGIC TƯƠNG TÁC GIAO DIỆN ===

// Dữ liệu gợi ý bài tập (có thể mở rộng trong tương lai)
const suggestions = {
    strength: [
        { name: 'Chống đẩy', img: 'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg?auto=compress&cs=tinysrgb&w=600' },
        { name: 'Hít xà', img: 'https://images.pexels.com/photos/3490360/pexels-photo-3490360.jpeg?auto=compress&cs=tinysrgb&w=600' },
        { name: 'Kéo tạ đơn', img: 'https://images.pexels.com/photos/6550853/pexels-photo-6550853.jpeg?auto=compress&cs=tinysrgb&w=600' },
        { name: 'Đẩy tạ qua đầu', img: 'https://images.pexels.com/photos/1229356/pexels-photo-1229356.jpeg?auto=compress&cs=tinysrgb&w=600' }
    ]
};

// Hàm mở pop-up (modal) gợi ý bài tập
function openSuggestionModal(type) {
    const data = suggestions[type];
    modalTitle.textContent = 'Gợi ý bài tập sức mạnh';
    modalBody.innerHTML = ''; // Xóa nội dung cũ

    // Tạo các thẻ bài tập và thêm vào modal
    data.forEach(item => {
        const cardHTML = `
            <div class="suggestion-card" data-task-name="${item.name}">
                <img src="${item.img}" alt="${item.name}">
                <p>${item.name}</p>
            </div>
        `;
        modalBody.insertAdjacentHTML('beforeend', cardHTML);
    });

    // Gán sự kiện click cho các thẻ bài tập vừa tạo
    document.querySelectorAll('.suggestion-card').forEach(card => {
        card.addEventListener('click', () => {
            const taskName = card.dataset.taskName;
            const originalTaskElement = document.querySelector(`.task-item[data-goal="${type}"]`);
            
            // Sao chép mục tiêu gốc và cập nhật tên bài tập
            const clonedTask = originalTaskElement.cloneNode(true);
            clonedTask.querySelector('h3').textContent = taskName;
            clonedTask.querySelector('.task-action').remove();

            // Hiển thị mục tiêu đã chọn
            selectedGoalContent.innerHTML = '';
            selectedGoalContent.appendChild(clonedTask);

            // Ẩn/hiện các khu vực phù hợp
            suggestionModal.classList.remove('visible');
            goalsListContainer.classList.add('hidden');
            selectedGoalContainer.classList.remove('hidden');
        });
    });

    // Hiển thị modal
    suggestionModal.classList.add('visible');
}

// Gán sự kiện cho nút đóng và vùng nền của modal
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


// Gán sự kiện cho các nút "Chọn" ban đầu
selectButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const selectedTask = e.target.closest('.task-item');
        const goalType = selectedTask.dataset.goal;

        if (goalType === 'strength') {
            // Nếu là bài tập sức mạnh, mở modal gợi ý
            openSuggestionModal(goalType);
        } else {
            // Nếu là các bài tập khác, hiển thị trực tiếp
            const clonedTask = selectedTask.cloneNode(true);
            clonedTask.querySelector('.task-action').remove();
            
            selectedGoalContent.innerHTML = '';
            selectedGoalContent.appendChild(clonedTask);

            goalsListContainer.classList.add('hidden');
            selectedGoalContainer.classList.remove('hidden');
        }
    });
});

// Gán sự kiện cho nút "Hoàn thành" và "Chọn mục tiêu khác"
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

