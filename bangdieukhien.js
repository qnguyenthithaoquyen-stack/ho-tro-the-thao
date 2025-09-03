document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = firebase.firestore();

    auth.onAuthStateChanged(user => {
        if (user) {
            db.collection('users').doc(user.uid).get()
                .then(doc => {
                    if (doc.exists) {
                        const userRole = doc.data().role;
                        if (userRole === 'coach') {
                            window.location.replace('coach-dashboard.html');
                        } else if (userRole === 'athlete') {
                            window.location.replace('athlete-dashboard.html');
                        } else {
                            // Nếu vai trò chưa được đặt, có thể gửi họ đến trang xác nhận
                            window.location.replace('xacnhan-vaitro.html');
                        }
                    } else {
                        // Nếu không có dữ liệu, gửi đến trang xác nhận
                        window.location.replace('xacnhan-vaitro.html');
                    }
                })
                .catch(error => {
                    console.error("Lỗi lấy dữ liệu:", error);
                    window.location.replace('dangnhap.html');
                });
        } else {
            window.location.replace('dangnhap.html');
        }
    });
});
