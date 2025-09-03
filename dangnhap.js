document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const email = loginForm.email.value;
            const password = loginForm.password.value;
            const submitButton = loginForm.querySelector('.submit-btn');

            if (!email || !password) {
                alert('Vui lòng nhập đầy đủ email và mật khẩu.');
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = 'Đang xử lý...';

            auth.signInWithEmailAndPassword(email, password)
                .then(userCredential => {
                    console.log('Đăng nhập thành công:', userCredential.user.uid);
                    // Chuyển đến trang kiểm tra vai trò
                    window.location.href = 'bangdieukhien.html';
                })
                .catch(error => {
                    alert(`Đăng nhập thất bại: ${error.message}`);
                    submitButton.disabled = false;
                    submitButton.textContent = 'Đăng Nhập';
                });
        });
    }
});
