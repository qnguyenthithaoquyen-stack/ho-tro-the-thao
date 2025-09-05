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
const searchEmailInput = document.getElementById('search-email');
const searchBtn = document.getElementById('search-btn');
const messageArea = document.getElementById('message-area');
const athleteInfoDiv = document.getElementById('athlete-info');
const foundAthleteNameEl = document.getElementById('found-athlete-name');
const foundAthleteDobEl = document.getElementById('found-athlete-dob');
const foundAthleteCityEl = document.getElementById('found-athlete-city');
const addBtn = document.getElementById('add-btn');
const logoutButton = document.getElementById('logoutButton');

let currentCoach = null;
let foundAthleteData = null;

// --- Hàm hiển thị thông báo ---
function showMessage(type, text) {
    messageArea.className = `message ${type}`;
    messageArea.textContent = text;
    messageArea.style.display = 'block';
}

// --- Hàm chính để khởi chạy trang ---
function initializePage() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentCoach = user;
        } else {
            window.location.href = 'dangnhap.html';
        }
    });

    searchBtn.addEventListener('click', handleSearch);
    addBtn.addEventListener('click', handleAddAthlete);

    logoutButton.addEventListener('click', () => {
        signOut(auth).then(() => {
            window.location.href = 'dangnhap.html';
        });
    });
}

// --- Xử lý sự kiện tìm kiếm ---
async function handleSearch() {
    const emailToSearch = searchEmailInput.value.trim();
    if (!emailToSearch) {
        showMessage('error', 'Vui lòng nhập email để tìm kiếm.');
        return;
    }

    // Reset giao diện
    athleteInfoDiv.style.display = 'none';
    messageArea.style.display = 'none';
    addBtn.disabled = true;

    try {
        const q = query(
            collection(db, "users"),
            where("email", "==", emailToSearch),
            where("role", "==", "athlete")
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            showMessage('error', 'Không tìm thấy VĐV với email này hoặc người dùng không phải là VĐV.');
        } else {
            // Lấy thông tin của VĐV đầu tiên tìm thấy
            const athleteDoc = querySnapshot.docs[0];
            foundAthleteData = athleteDoc.data();

            // Hiển thị thông tin
            foundAthleteNameEl.textContent = foundAthleteData.fullName;
            foundAthleteDobEl.textContent = foundAthleteData.dateOfBirth || 'Chưa cập nhật';
            foundAthleteCityEl.textContent = foundAthleteData.city || 'Chưa cập nhật';
            
            athleteInfoDiv.style.display = 'block';
            showMessage('success', 'Đã tìm thấy VĐV!');
            addBtn.disabled = false; // Kích hoạt nút thêm
        }
    } catch (error) {
        console.error("Lỗi khi tìm kiếm:", error);
        showMessage('error', 'Đã xảy ra lỗi khi tìm kiếm. Vui lòng kiểm tra Console (F12) để tạo chỉ mục nếu cần.');
    }
}

// --- Xử lý sự kiện thêm VĐV ---
async function handleAddAthlete() {
    if (!currentCoach || !foundAthleteData) {
        showMessage('error', 'Không có thông tin HLV hoặc VĐV. Vui lòng thử lại.');
        return;
    }

    addBtn.disabled = true;
    addBtn.textContent = 'Đang thêm...';

    try {
        // Tạo một document mới trong subcollection "managed_athletes" của HLV
        const managedAthleteRef = doc(db, "users", currentCoach.uid, "managed_athletes", foundAthleteData.uid);
        
        // Lưu toàn bộ thông tin của VĐV vào document này
        await setDoc(managedAthleteRef, foundAthleteData);

        showMessage('success', `Đã thêm ${foundAthleteData.fullName} vào danh sách của bạn!`);
        
        // Tự động quay về trang tổng quan sau 2 giây
        setTimeout(() => {
            window.location.href = 'coach-dashboard.html';
        }, 2000);

    } catch (error) {
        console.error("Lỗi khi thêm VĐV:", error);
        showMessage('error', 'Đã xảy ra lỗi khi thêm VĐV.');
        addBtn.disabled = false;
        addBtn.textContent = 'Thêm vào danh sách';
    }
}

// --- Chạy hàm khởi tạo khi trang đã tải xong ---
document.addEventListener('DOMContentLoaded', initializePage);

