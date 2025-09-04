// Import các hàm cần thiết từ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

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

// Lấy các phần tử HTML
const searchBtn = document.getElementById('search-btn');
const addToListBtn = document.getElementById('add-to-list-btn');
const resultContainer = document.getElementById('result-container');
const messageContainer = document.getElementById('message-container');
let foundAthlete = null; // Biến lưu thông tin VĐV tìm được
let currentCoachId = null;

// Hàng rào xác thực
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentCoachId = user.uid;
    } else {
        window.location.href = 'dangnhap.html';
    }
});

// Chức năng tìm kiếm VĐV
searchBtn.addEventListener('click', async () => {
    const email = document.getElementById('athleteEmail').value.trim();
    if (!email) {
        showMessage('Vui lòng nhập email.', 'error');
        return;
    }

    resetState();

    try {
        // Tạo truy vấn để tìm người dùng có email và vai trò là 'athlete'
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where("email", "==", email), where("role", "==", "athlete"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            showMessage('Không tìm thấy VĐV với email này.', 'error');
        } else {
            // Lấy thông tin VĐV
            const athleteDoc = querySnapshot.docs[0];
            foundAthlete = { id: athleteDoc.id, ...athleteDoc.data() };

            // Hiển thị thông tin và kích hoạt nút "Thêm"
            document.getElementById('result-name').textContent = foundAthlete.fullName;
            document.getElementById('result-age').textContent = foundAthlete.age;
            resultContainer.style.display = 'block';
            addToListBtn.disabled = false;
            showMessage('Đã tìm thấy VĐV!', 'success');
        }
    } catch (error) {
        console.error("Lỗi khi tìm kiếm VĐV:", error);
        showMessage('Đã xảy ra lỗi khi tìm kiếm.', 'error');
    }
});

// Chức năng thêm VĐV vào danh sách của HLV
addToListBtn.addEventListener('click', async () => {
    if (!foundAthlete || !currentCoachId) return;

    try {
        // Tạo một document trong subcollection 'managed_athletes' của HLV
        // ID của document này chính là ID của VĐV
        const coachAthleteRef = doc(db, 'users', currentCoachId, 'managed_athletes', foundAthlete.id);
        
        // setDoc chỉ cần tạo document rỗng để lưu liên kết
        await setDoc(coachAthleteRef, { addedAt: new Date() });

        showMessage('Đã thêm VĐV vào danh sách thành công!', 'success');
        addToListBtn.disabled = true;

        // Tự động chuyển về trang tổng quan sau 2 giây
        setTimeout(() => {
            window.location.href = 'coach-dashboard.html';
        }, 2000);

    } catch (error) {
        console.error("Lỗi khi thêm VĐV:", error);
        showMessage('Đã xảy ra lỗi khi thêm VĐV.', 'error');
    }
});


// Hàm hiển thị thông báo
function showMessage(msg, type) {
    messageContainer.innerHTML = `<p class="message ${type}">${msg}</p>`;
}

// Hàm reset trạng thái giao diện
function resetState() {
    foundAthlete = null;
    resultContainer.style.display = 'none';
    addToListBtn.disabled = true;
    messageContainer.innerHTML = '';
}

// Chức năng đăng xuất chung
const logoutButton = document.getElementById('logout-btn');
if(logoutButton) {
    logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        signOut(auth).catch(error => console.error("Lỗi khi đăng xuất:", error));
    });
}

