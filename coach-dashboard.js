document.addEventListener('DOMContentLoaded', () => {
    console.log('Trang tổng quan của huấn luyện viên đã sẵn sàng!');

    const athleteItems = document.querySelectorAll('.athlete-item');
    const detailsSection = document.getElementById('detailsSection');
    const athleteNameEl = document.getElementById('athleteName');
    const heartRateEl = document.getElementById('heartRate');
    const spo2El = document.getElementById('spo2');
    const bloodPressureEl = document.getElementById('bloodPressure');
    const accelerationEl = document.getElementById('acceleration');

    // Dữ liệu giả lập cho các vận động viên
    const athleteData = {
        1: { name: 'Nguyễn Văn A', heartRate: 75, spo2: 98, bloodPressure: '120/80', acceleration: 1.5 },
        2: { name: 'Trần Thị B', heartRate: 80, spo2: 97, bloodPressure: '110/70', acceleration: 1.2 },
        3: { name: 'Lê Văn C', heartRate: 72, spo2: 99, bloodPressure: '125/85', acceleration: 1.8 },
    };

    // Hàm để hiển thị thông tin chi tiết của VĐV
    function showAthleteDetails(athleteId) {
        const data = athleteData[athleteId];
        if (data) {
            athleteNameEl.textContent = `Chi tiết của ${data.name}`;
            heartRateEl.textContent = data.heartRate;
            spo2El.textContent = data.spo2;
            bloodPressureEl.textContent = data.bloodPressure;
            accelerationEl.textContent = data.acceleration;
            detailsSection.style.display = 'block'; // Hiển thị phần chi tiết
        }
    }

    // Thêm sự kiện click cho mỗi VĐV trong danh sách
    athleteItems.forEach(item => {
        item.addEventListener('click', () => {
            const athleteId = item.getAttribute('data-athlete-id');
            showAthleteDetails(athleteId);
        });
    });

    // Sự kiện cho nút "Thêm VĐV"
    const addAthleteBtn = document.querySelector('.add-athlete-btn');
    addAthleteBtn.addEventListener('click', () => {
        alert('Chức năng thêm vận động viên mới!');
        // Thêm logic để mở form/modal thêm VĐV
    });
});
