// Import các hàm cần thiết từ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// --- Cấu hình Firebase ---
// Đảm bảo cấu hình này khớp với toàn bộ dự án của bạn
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

// --- Chạy mã sau khi toàn bộ trang HTML đã được tải ---
document.addEventListener('DOMContentLoaded', () => {
    // Lấy các phần tử HTML cần thiết
    const searchBtn = document.getElementById('search-btn');
    const addBtn = document.getElementById('add-btn');
    const athleteEmailInput = document.getElementById('athleteEmail');
    const messageDiv = document.getElementById('message');
    const athleteInfoDiv = document.getElementById('athlete-info');
    const foundAthleteNameEl = document.getElementById('found-athlete-name');
    const foundAthleteDobEl = document.getElementById('found-athlete-dob');

    // Biến để lưu trữ thông tin tìm được
    let foundAthleteData = null;
    let foundAthleteId = null;
    let currentCoach = null;

    // "Hàng rào" bảo mật: Kiểm tra trạng thái đăng nhập
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Nếu có người dùng đăng nhập, lưu lại thông tin
            currentCoach = user;
        } else {
            // Nếu không, chuyển về trang đăng nhập
            window.location.href = 'dangnhap.html';
        }
    });

    // Gắn chức năng cho nút "Tìm kiếm"
    searchBtn.addEventListener('click', async () => {
        const email = athleteEmailInput.value.trim();
        if (!email) {
            showMessage('Vui lòng nhập email.', 'error');
            return;
        }

        // Đặt lại giao diện trước khi tìm kiếm
        athleteInfoDiv.style.display = 'none';
        addBtn.disabled = true;

        try {
            // Tạo truy vấn để tìm người dùng có email và vai trò là "athlete"
            const q = query(collection(db, "users"), where("email", "==", email), where("role", "==", "athlete"));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                // Nếu không tìm thấy
                showMessage('Không tìm thấy VĐV với email này hoặc người dùng không phải là VĐV.', 'error');
            } else {
                // Nếu tìm thấy
                foundAthleteData = querySnapshot.docs[0].data();
                foundAthleteId = querySnapshot.docs[0].id;
                
                showMessage('Đã tìm thấy VĐV!', 'success');
                foundAthleteNameEl.textContent = foundAthleteData.fullName;
                foundAthleteDobEl.textContent = foundAthleteData.dateOfBirth || 'Chưa cập nhật'; // Hiển thị ngày sinh
                athleteInfoDiv.style.display = 'block';
                addBtn.disabled = false; // Kích hoạt nút "Thêm"
            }
        } catch (error) {
            console.error("Lỗi tìm kiếm: ", error);
            showMessage('Đã xảy ra lỗi khi tìm kiếm. Vui lòng kiểm tra Console (F12) để tạo chỉ mục nếu cần.', 'error');
        }
    });

    // Gắn chức năng cho nút "Thêm vào danh sách"
    addBtn.addEventListener('click', async () => {
        if (!foundAthleteData || !currentCoach) return;

        try {
            const coachId = currentCoach.uid;
            // Tạo một tài liệu mới trong bộ sưu tập con 'managed_athletes' của HLV
            await setDoc(doc(db, `users/${coachId}/managed_athletes`, foundAthleteId), {
                fullName: foundAthleteData.fullName,
                uid: foundAthleteId,
                dateOfBirth: foundAthleteData.dateOfBirth || null // Lưu cả ngày sinh
            });
            alert('Thêm VĐV thành công!');
            // Chuyển về trang tổng quan sau khi thêm
            window.location.href = 'coach-dashboard.html';
        } catch (error) {
            console.error("Lỗi khi thêm VĐV: ", error);
            showMessage('Không thể thêm VĐV vào danh sách.', 'error');
        }
    });

    // Hàm trợ giúp để hiển thị thông báo
    function showMessage(msg, type) {
        messageDiv.textContent = msg;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
    }
});

