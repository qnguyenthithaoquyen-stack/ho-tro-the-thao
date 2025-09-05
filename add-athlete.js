// Import các hàm cần thiết từ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

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

// Bọc toàn bộ mã trong sự kiện DOMContentLoaded để đảm bảo HTML đã tải xong
document.addEventListener('DOMContentLoaded', () => {
    // --- Lấy các phần tử HTML cần thiết ---
    const searchBtn = document.getElementById('search-btn');
    const addBtn = document.getElementById('add-btn');
    const athleteEmailInput = document.getElementById('athleteEmail');
    const messageDiv = document.getElementById('message');
    const athleteInfoDiv = document.getElementById('athlete-info');
    const foundAthleteNameEl = document.getElementById('found-athlete-name');
    const foundAthleteDobEl = document.getElementById('found-athlete-dob');
    const logoutButton = document.getElementById('logoutButton');

    // Biến để lưu trữ thông tin tìm được
    let foundAthleteData = null;
    let foundAthleteId = null;
    let currentCoach = null;

    // "Hàng rào" bảo mật: Kiểm tra trạng thái đăng nhập
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Nếu có người dùng đăng nhập, kiểm tra vai trò
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists() && userDoc.data().role === 'coach') {
                currentCoach = user; // Lưu thông tin HLV
            } else {
                alert("Bạn không có quyền truy cập trang này.");
                signOut(auth);
            }
        } else {
            // Nếu không có ai đăng nhập, chuyển về trang đăng nhập
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
                showMessage('Không tìm thấy VĐV với email này hoặc người dùng không phải là VĐV.', 'error');
            } else {
                foundAthleteData = querySnapshot.docs[0].data();
                foundAthleteId = querySnapshot.docs[0].id;
                
                showMessage('Đã tìm thấy VĐV!', 'success');
                foundAthleteNameEl.textContent = foundAthleteData.fullName;
                foundAthleteDobEl.textContent = foundAthleteData.dateOfBirth || 'Chưa cập nhật';
                athleteInfoDiv.style.display = 'block';
                addBtn.disabled = false;
            }
        } catch (error) {
            console.error("Lỗi tìm kiếm: ", error);
            showMessage('Đã xảy ra lỗi khi tìm kiếm. Vui lòng kiểm tra Console (F12).', 'error');
        }
    });

    // Gắn chức năng cho nút "Thêm vào danh sách"
    addBtn.addEventListener('click', async () => {
        if (!foundAthleteData || !currentCoach) return;

        try {
            const coachId = currentCoach.uid;
            // Tạo một tham chiếu đến tài liệu VĐV trong bộ sưu tập con của HLV
            const athleteDocRef = doc(db, `users/${coachId}/managed_athletes`, foundAthleteId);

            // Ghi dữ liệu của VĐV vào tài liệu đó
            await setDoc(athleteDocRef, {
                fullName: foundAthleteData.fullName,
                uid: foundAthleteId,
                dateOfBirth: foundAthleteData.dateOfBirth || null,
                sport: foundAthleteData.sport || null,
            });
            alert('Thêm VĐV thành công!');
            window.location.href = 'coach-dashboard.html';
        } catch (error) {
            console.error("Lỗi khi thêm VĐV: ", error);
            showMessage('Không thể thêm VĐV vào danh sách.', 'error');
        }
    });
    
    // Gắn chức năng cho nút Đăng xuất
    logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        signOut(auth);
    });

    // Hàm trợ giúp để hiển thị thông báo
    function showMessage(msg, type) {
        messageDiv.textContent = msg;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
    }
});
