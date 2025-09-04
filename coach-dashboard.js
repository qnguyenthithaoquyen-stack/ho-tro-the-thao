// Import các hàm cần thiết từ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

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
const logoutButton = document.getElementById('logout-btn');
const athleteListContainer = document.getElementById('athlete-list');
const athleteDetailsContent = document.getElementById('athlete-details-content');
const athletePrompt = document.getElementById('athlete-prompt');
const athleteNameHeading = document.getElementById('athlete-name-heading');
const actionButtons = document.querySelectorAll('.action-btn');

let unsubscribeSensor = null; // Biến để lưu hàm hủy lắng nghe sensor
let unsubscribeAthletes = null; // Biến để lưu hàm hủy lắng nghe danh sách VĐV

// === HÀNG RÀO XÁC THỰC ===
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists() && userDocSnap.data().role === 'coach') {
            initializeDashboard(user.uid);
        } else {
            // Không phải coach, đăng xuất và chuyển hướng
            signOut(auth);
            window.location.href = 'dangnhap.html';
        }
    } else {
        // Chưa đăng nhập, chuyển hướng
        window.location.href = 'dangnhap.html';
    }
});

// Hàm khởi tạo các chức năng chính của trang
function initializeDashboard(coachId) {
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            // Hủy tất cả các listener trước khi đăng xuất
            if (unsubscribeSensor) unsubscribeSensor();
            if (unsubscribeAthletes) unsubscribeAthletes();
            signOut(auth).catch(error => console.error("Lỗi khi đăng xuất:", error));
        });
    }
    listenForAthletes(coachId);
}

// === LẮNG NGHE DANH SÁCH VĐV THỜI GIAN THỰC ===
function listenForAthletes(coachId) {
    const athletesRef = collection(db, 'users', coachId, 'managed_athletes');
    
    unsubscribeAthletes = onSnapshot(athletesRef, async (snapshot) => {
        athleteListContainer.innerHTML = '';
        if (snapshot.empty) {
            athleteListContainer.innerHTML = '<li style="padding: 12px; color: #888;">Chưa có vận động viên nào.</li>';
            return;
        }

        const athletePromises = snapshot.docs.map(athleteIdDoc => {
            const athleteId = athleteIdDoc.id;
            return getDoc(doc(db, 'users', athleteId));
        });
        
        const athleteDocs = await Promise.all(athletePromises);

        athleteDocs.forEach(athleteSnap => {
            if (athleteSnap.exists()) {
                const athleteData = athleteSnap.data();
                const athleteInitial = athleteData.fullName.charAt(0).toUpperCase();
                const athleteItemHTML = `
                    <li class="athlete-item" data-id="${athleteSnap.id}">
                        <div class="athlete-initial">${athleteInitial}</div>
                        <p>${athleteData.fullName}</p>
                    </li>
                `;
                athleteListContainer.insertAdjacentHTML('beforeend', athleteItemHTML);
            }
        });

        // Gán lại sự kiện click sau khi danh sách được cập nhật
        document.querySelectorAll('.athlete-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.athlete-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                displayAthleteDetails(item.dataset.id);
            });
        });
    });
}

// === HIỂN THỊ CHI TIẾT VÀ LẮNG NGHE SENSOR THỜI GIAN THỰC ===
async function displayAthleteDetails(athleteId) {
    // Hủy lắng nghe sensor cũ trước khi tạo cái mới
    if (unsubscribeSensor) {
        unsubscribeSensor();
    }

    const athleteDocRef = doc(db, 'users', athleteId);
    const athleteDocSnap = await getDoc(athleteDocRef);

    if (athleteDocSnap.exists()) {
        const data = athleteDocSnap.data();

        // Hiển thị thông tin
        athletePrompt.style.display = 'none';
        athleteDetailsContent.style.display = 'block';
        athleteNameHeading.textContent = `Chi tiết của ${data.fullName}`;
        document.getElementById('stat-age').textContent = data.age || '--';

        // Lắng nghe dữ liệu sensor thời gian thực
        const sensorDocRef = doc(db, "sensor_data", athleteId);
        unsubscribeSensor = onSnapshot(sensorDocRef, (doc) => {
            const heartRateEl = document.getElementById('stat-heart-rate');
            const spo2El = document.getElementById('stat-spo2');
            const bloodPressureEl = document.getElementById('stat-blood-pressure');

            if (doc.exists()) {
                const sensorData = doc.data();
                heartRateEl.textContent = sensorData.heart_rate || '--';
                spo2El.textContent = sensorData.spo2 || '--';
                bloodPressureEl.textContent = sensorData.blood_pressure || '--';
            } else {
                // Reset nếu không có dữ liệu sensor
                heartRateEl.textContent = '--';
                spo2El.textContent = '--';
                bloodPressureEl.textContent = '--';
            }
        });
        
        // Kích hoạt các nút hành động
        actionButtons.forEach(button => button.classList.remove('disabled'));
    } else {
        // Xử lý trường hợp không tìm thấy VĐV
        athleteDetailsContent.style.display = 'none';
        athletePrompt.style.display = 'block';
        athletePrompt.textContent = 'Không thể tải thông tin chi tiết của VĐV.';
    }
}
