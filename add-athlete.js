// Import các hàm cần thiết từ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, addDoc, query, where, getDocs, limit } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

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

let currentCoach = null;
let foundAthlete = null; // Biến để lưu thông tin VĐV tìm thấy

// === Lấy các elements từ HTML ===
const emailInput = document.getElementById('athlete-email');
const searchBtn = document.getElementById('search-btn');
const searchResultDiv = document.getElementById('search-result');
const resultNameSpan = document.getElementById('result-name');
const resultAgeSpan = document.getElementById('result-age');
const addBtn = document.getElementById('add-btn');
const logoutButton = document.getElementById('logout-btn');

// === HÀNG RÀO XÁC THỰC: Chỉ HLV mới được vào trang này ===
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().role === 'coach') {
            currentCoach = user; // Lưu lại thông tin HLV
        } else {
            // Nếu không phải HLV, đuổi về trang đăng nhập
            alert('Bạn không có quyền truy cập trang này.');
            window.location.href = 'dangnhap.html';
        }
    } else {
        // Nếu chưa đăng nhập, đuổi về trang đăng nhập
        window.location.href = 'dangnhap.html';
    }
});

// === CHỨC NĂNG NÚT TÌM KIẾM ===
searchBtn.addEventListener('click', async () => {
    const emailToSearch = emailInput.value.trim();
    if (!emailToSearch) {
        alert("Vui lòng nhập email của VĐV.");
        return;
    }

    // Reset lại giao diện mỗi khi tìm kiếm
    searchResultDiv.classList.add('hidden');
    addBtn.disabled = true;
    foundAthlete = null;
    searchBtn.disabled = true;
    searchBtn.textContent = 'Đang tìm...';

    try {
        // Tạo câu lệnh truy vấn Firestore
        const q = query(
            collection(db, "users"), 
            where("email", "==", emailToSearch), // Tìm theo email
            where("role", "==", "athlete"),    // Chỉ tìm người có vai trò là VĐV
            limit(1)                           // Chỉ cần 1 kết quả là đủ
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            // Nếu không tìm thấy
            alert("Không tìm thấy VĐV nào có email này hoặc người dùng không phải là VĐV.");
        } else {
            // Nếu tìm thấy
            const athleteDoc = querySnapshot.docs[0];
            foundAthlete = {
                uid: athleteDoc.id,
                ...athleteDoc.data()
            };
            
            // Hiển thị thông tin tìm được ra màn hình
            resultNameSpan.textContent = foundAthlete.fullName;
            resultAgeSpan.textContent = foundAthlete.age;
            searchResultDiv.classList.remove('hidden');

            // Kích hoạt nút "Thêm vào danh sách"
            addBtn.disabled = false;
        }
    } catch (error) {
        console.error("Lỗi khi tìm kiếm VĐV:", error);
        alert("Đã có lỗi xảy ra trong quá trình tìm kiếm.");
    } finally {
        // Khôi phục lại trạng thái nút tìm kiếm
        searchBtn.disabled = false;
        searchBtn.textContent = 'Tìm kiếm';
    }
});

// === CHỨC NĂNG NÚT THÊM VÀO DANH SÁCH ===
addBtn.addEventListener('click', async () => {
    if (!currentCoach || !foundAthlete) {
        alert("Không thể thực hiện. Vui lòng tìm kiếm VĐV trước.");
        return;
    }

    addBtn.disabled = true;
    addBtn.textContent = 'Đang thêm...';

    try {
        const coachId = currentCoach.uid;
        // Tạo một document mới trong sub-collection "athletes" của HLV
        const athletesCollectionRef = collection(db, 'users', coachId, 'athletes');

        // Sao chép thông tin VĐV tìm được vào danh sách của HLV
        await addDoc(athletesCollectionRef, {
            fullName: foundAthlete.fullName,
            age: foundAthlete.age,
            sport: foundAthlete.sport || "Chưa xác định",
            athleteUid: foundAthlete.uid 
        });

        alert(`Đã thêm thành công VĐV ${foundAthlete.fullName} vào danh sách của bạn!`);
        window.location.href = 'coach-dashboard.html'; // Chuyển về trang tổng quan

    } catch (error) {
        console.error("Lỗi khi thêm VĐV vào danh sách:", error);
        alert("Đã xảy ra lỗi. Vui lòng thử lại.");
        addBtn.disabled = false;
        addBtn.textContent = 'Thêm vào danh sách';
    }
});


// === CHỨC NĂNG NÚT ĐĂNG XUẤT ===
if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        signOut(auth).catch((error) => console.error('Lỗi khi đăng xuất:', error));
    });
}

