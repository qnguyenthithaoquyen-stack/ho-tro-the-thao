# Nội dung cho file test_pose_render.py

from pose_video import process_video
from pose_image import process_image
import os

# --- THAY ĐỔI CÁC GIÁ TRỊ NÀY ĐỂ KIỂM THỬ ---
# Đặt TEST_MODE = 'video' hoặc 'image'
TEST_MODE = 'video' 

# Cung cấp đường dẫn đến file bạn muốn test
# Ví dụ: 'test_samples/my_video.mp4' hoặc 'test_samples/my_image.jpg'
# Bạn cần tạo thư mục test_samples và bỏ file vào đó
INPUT_FILE_PATH = 'uploads/run.mp4' 

# Chọn môn thể thao để test
SPORT_TO_TEST = 'xuatphat'
# ------------------------------------------------

def run_test():
    """Chạy kiểm thử cho ảnh hoặc video."""
    if not os.path.exists(INPUT_FILE_PATH):
        print(f"Lỗi: Không tìm thấy file '{INPUT_FILE_PATH}'.")
        print("Vui lòng tạo file và đặt vào đúng đường dẫn để kiểm thử.")
        return

    print(f"--- Bắt đầu kiểm thử cho file: {INPUT_FILE_PATH} ---")
    print(f"--- Môn thể thao: {SPORT_TO_TEST} ---")

    if TEST_MODE == 'video':
        output_path, analysis_data = process_video(INPUT_FILE_PATH, SPORT_TO_TEST)
    elif TEST_MODE == 'image':
        output_path, analysis_data = process_image(INPUT_FILE_PATH, SPORT_TO_TEST)
    else:
        print(f"Lỗi: Chế độ test '{TEST_MODE}' không hợp lệ. Vui lòng chọn 'video' hoặc 'image'.")
        return

    print("\n--- Phân tích hoàn tất! ---")
    print(f"Video/Ảnh kết quả đã được lưu tại: {output_path}")
    print("\n--- Dữ liệu phân tích ---")
    for key, value in analysis_data.items():
        print(f"- {key.replace('_', ' ').title()}: {value}")
    print("\n--- Kiểm thử kết thúc ---")

if __name__ == '__main__':
    run_test()
    