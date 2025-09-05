// Import các hàm cần thiết từ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// --- Cấu hình Firebase ---
const firebaseConfig = {
    apiKey: "AIzaSyA2dXWCyjL2xgCSyeW9QQ7RvjI_O7kFHJw",
    authDomain: "sporthealthdata.firebaseapp.com",
    projectId: "sporthealthdata",
    storageBucket: "sporthealthdata.appspot.com",
    messagingSenderId: "789054240877",
    appId: "1:789054240877:web:04a400c9ea586523a86764",
};

// --- Khởi tạo Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- DOM Elements ---
const searchBtn = document.getElementById('search-btn');
const addAthleteBtn = document.getElementById('add-athlete-btn');
const messageContainer = document.getElementById('message-container');
const resultContainer = document.getElementById('result-container');
const logoutButton = document.getElementById('logoutButtonTop');
const emailInput = document.getElementById('athlete-email');

// --- Biến toàn cục ---
let currentCoach = null;
let foundAthleteData = null;

// --- Hàm chính để khởi chạy trang ---
function initializePage() {
    // Xác thực người dùng
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentCoach = user;
        } else {
            // Nếu chưa đăng nhập, chuyển về trang đăng nhập
            window.location.href = 'dangnhap.html';
        }
    });

    // Gán sự kiện cho các nút
    logoutButton.addEventListener('click', () => {
        signOut(auth).then(() => {
            window.location.href = 'dangnhap.html';
        });
    });

    searchBtn.addEventListener('click', handleSearch);
    addAthleteBtn.addEventListener('click', handleAddAthlete);
}

// --- Chức năng Tìm kiếm VĐV ---
async function handleSearch() {
    const email = emailInput.value.trim();
    if (!email) {
        showMessage('Vui lòng nhập email.', 'error');
        return;
    }

    // Reset trạng thái giao diện
    resultContainer.style.display = 'none';
    addAthleteBtn.disabled = true;
    foundAthleteData = null;
    messageContainer.innerHTML = '';

    try {
        // Tạo truy vấn để tìm người dùng có email và vai trò là 'athlete'
        const q = query(collection(db, "users"), where("email", "==", email), where("role", "==", "athlete"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            showMessage('Không tìm thấy VĐV với email này hoặc người dùng không phải là VĐV.', 'error');
        } else {
            // Lấy thông tin VĐV tìm thấy
            const athleteDoc = querySnapshot.docs[0];
            foundAthleteData = { id: athleteDoc.id, ...athleteDoc.data() };

            // Hiển thị thông tin lên giao diện
            document.getElementById('found-athlete-name').textContent = foundAthleteData.fullName;
            document.getElementById('found-athlete-dob').textContent = foundAthleteData.dateOfBirth || 'Chưa cập nhật';

            resultContainer.style.display = 'block';
            addAthleteBtn.disabled = false;
            showMessage('Đã tìm thấy VĐV!', 'success');
        }
    } catch (error) {
        console.error("Lỗi khi tìm kiếm:", error);
        showMessage('Đã xảy ra lỗi khi tìm kiếm. Vui lòng kiểm tra Console (F12) để tạo chỉ mục nếu cần.', 'error');
    }
}

// --- Chức năng Thêm VĐV vào danh sách quản lý của HLV ---
async function handleAddAthlete() {
    if (!currentCoach || !foundAthleteData) {
        showMessage('Lỗi: Mất thông tin HLV hoặc VĐV. Vui lòng thử tìm kiếm lại.', 'error');
        return;
    }

    try {
        // Tạo một tham chiếu đến tài liệu VĐV trong bộ sưu tập con của HLV
        const athleteRef = doc(db, "users", currentCoach.uid, "managed_athletes", foundAthleteData.id);
        
        // Lưu các thông tin cần thiết của VĐV vào đó
        await setDoc(athleteRef, {
            uid: foundAthleteData.id,
            fullName: foundAthleteData.fullName,
            email: foundAthleteData.email,
            dateOfBirth: foundAthleteData.dateOfBirth || null
        });

        alert('Thêm VĐV vào danh sách thành công!');
        window.location.href = 'coach-dashboard.html'; // Tự động quay về trang tổng quan

    } catch (error) {
        console.error("Lỗi khi thêm VĐV:", error);
        showMessage('Đã xảy ra lỗi khi thêm VĐV vào danh sách.', 'error');
    }
}

// --- Hàm tiện ích để hiển thị thông báo ---
function showMessage(text, type) {
    messageContainer.innerHTML = `<div class="message ${type}">${text}</div>`;
}

// --- Chạy hàm khởi tạo sau khi toàn bộ trang đã tải xong ---
document.addEventListener('DOMContentLoaded', initializePage);
