document.addEventListener("DOMContentLoaded", () => {
  const signupData = JSON.parse(localStorage.getItem("signupData"));

  if (!signupData || !signupData.role) {
    // Nếu chưa có dữ liệu thì quay lại trang đăng nhập
    window.location.href = "dangnhap.html";
    return;
  }

  console.log("Xin chào:", signupData.fullname, "vai trò:", signupData.role);
  // Các code dashboard HLV cũ của ông chủ giữ nguyên
});
