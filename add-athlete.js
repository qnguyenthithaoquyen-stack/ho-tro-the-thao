// Import các hàm cần thiết từ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

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

// Bọc toàn bộ mã trong DOMContentLoaded để đảm bảo HTML đã sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    // Lấy các phần tử HTML
    const emailInput = document.getElementById('athlete-email');
    const searchButton = document.getElementById('search-btn');
    const messageContainer = document.getElementById('message-container');
    const resultContainer = document.getElementById('athlete-result');
    const athleteNameSpan = document.getElementById('athlete-name');
    const athleteAgeSpan = document.getElementById('athlete-age');
    const addButton = document.getElementById('add-btn');
    const logoutButton = document.getElementById('logout-btn');

    let currentCoachId = null;
    let foundAthleteId = null;

    // === HÀNG RÀO XÁC THỰC ===
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);
            // Đảm bảo người dùng tồn tại và có vai trò là 'coach'
            if (userDocSnap.exists() && userDocSnap.data().role === 'coach') {
                currentCoachId = user.uid;
            } else {
                // Nếu không phải coach, đăng xuất và chuyển về trang đăng nhập
                signOut(auth);
                window.location.href = 'dangnhap.html';
            }
        } else {
            // Nếu chưa đăng nhập, chuyển về trang đăng nhập
            window.location.href = 'dangnhap.html';
        }
    });

    // Xử lý sự kiện cho nút Đăng xuất
    if(logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            signOut(auth).catch(error => console.error("Lỗi khi đăng xuất:", error));
        });
    }

    // Xử lý sự kiện cho nút Tìm kiếm
    if(searchButton) {
        searchButton.addEventListener('click', async () => {
            const email = emailInput.value.trim();
            if (!email) {
                showMessage('Vui lòng nhập email.', 'error');
                return;
            }
            
            // Reset trạng thái giao diện
            resultContainer.style.display = 'none';
            addButton.disabled = true;
            foundAthleteId = null;

            try {
                // Tạo truy vấn để tìm người dùng có email và vai trò là 'athlete'
                const q = query(collection(db, "users"), where("email", "==", email), where("role", "==", "athlete"));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    showMessage('Không tìm thấy VĐV nào với email này hoặc người dùng không phải là VĐV.', 'error');
                } else {
                    const athleteDoc = querySnapshot.docs[0];
                    const athleteData = athleteDoc.data();
                    foundAthleteId = athleteDoc.id;

                    // Hiển thị thông tin tìm được
                    athleteNameSpan.textContent = athleteData.fullName;
                    
                    if (athleteData.age) {
                        athleteAgeSpan.textContent = athleteData.age;
                    } else {
                        athleteAgeSpan.textContent = 'Chưa cập nhật';
                    }
                    
                    resultContainer.style.display = 'block';
                    addButton.disabled = false; // Kích hoạt nút Thêm
                    showMessage('Đã tìm thấy VĐV!', 'success');
                }
            } catch (error) {
                console.error("Lỗi khi tìm kiếm:", error);
                showMessage('Đã xảy ra lỗi khi tìm kiếm. Vui lòng kiểm tra Console (F12) để tạo chỉ mục nếu cần.', 'error');
            }
        });
    }

    // Xử lý sự kiện cho nút "Thêm vào danh sách"
    if(addButton) {
        addButton.addEventListener('click', async () => {
            if (!foundAthleteId || !currentCoachId) {
                showMessage('Không có thông tin VĐV hoặc HLV để thực hiện.', 'error');
                return;
            }

            try {
                // Tạo một tham chiếu đến tài liệu trong bộ sưu tập con
                const managedAthleteRef = doc(db, 'users', currentCoachId, 'managed_athletes', foundAthleteId);
                
                // Ghi dữ liệu vào tài liệu đó
                await setDoc(managedAthleteRef, { 
                    name: athleteNameSpan.textContent, 
                    addedAt: new Date() 
                }); 

                showMessage(`Đã thêm VĐV ${athleteNameSpan.textContent} vào danh sách quản lý.`, 'success');
                addButton.disabled = true;
                addButton.textContent = 'Đã thêm';
                
                // Tự động quay về trang tổng quan sau 2 giây
                setTimeout(() => {
                    window.location.href = 'coach-dashboard.html';
                }, 2000);

            } catch (error) {
                console.error("Lỗi khi thêm VĐV:", error);
                showMessage('Đã xảy ra lỗi khi thêm VĐV.', 'error');
            }
        });
    }

    // Hàm trợ giúp để hiển thị thông báo
    function showMessage(text, type) {
        if(messageContainer) {
            messageContainer.textContent = text;
            messageContainer.className = `message ${type}`;
            messageContainer.style.display = 'block';
        }
    }
});

