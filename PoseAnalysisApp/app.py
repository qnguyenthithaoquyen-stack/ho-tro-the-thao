import os
import subprocess
import json
from flask import Flask, request, jsonify, render_template, url_for
from pathlib import Path

app = Flask(__name__)

# --- Cấu hình các đường dẫn ---
# Tạo các thư mục cần thiết nếu chúng chưa tồn tại
BASE_DIR = Path(__file__).resolve().parent
UPLOAD_FOLDER = BASE_DIR / 'uploads'
RESULTS_FOLDER = BASE_DIR / 'static' / 'results'
UPLOAD_FOLDER.mkdir(exist_ok=True)
RESULTS_FOLDER.mkdir(parents=True, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/')
def index():
    """Trang chủ, hiển thị giao diện upload."""
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    """
    Endpoint nhận file, thực hiện phân tích và trả về kết quả.
    """
    if 'file' not in request.files:
        return jsonify({'error': 'Không có file nào được gửi lên.'}), 400

    file = request.files['file']
    sport = request.form.get('sport')

    if file.filename == '':
        return jsonify({'error': 'Chưa chọn file nào.'}), 400

    if file and sport:
        # Lưu file người dùng upload
        filepath = UPLOAD_FOLDER / file.filename
        file.save(filepath)

        # Gọi script phân tích video bằng subprocess
        try:
            # Sử dụng 'python' hoặc 'python3' tùy thuộc vào môi trường của bạn
            subprocess.run([
                'python', 'analyze_video.py',
                '--video_path', str(filepath),
                '--sport', sport
            ], check=True, capture_output=True, text=True, encoding='utf-8')
        except subprocess.CalledProcessError as e:
            # Ghi lại lỗi nếu script phân tích thất bại
            print("Lỗi khi chạy analyze_video.py:")
            print(e.stdout)
            print(e.stderr)
            return jsonify({'error': 'Quá trình phân tích video thất bại.'}), 500

        # Đọc kết quả từ file JSON do script phân tích tạo ra
        try:
            with open('results.json', 'r', encoding='utf-8') as f:
                analysis_data = json.load(f)
        except FileNotFoundError:
            return jsonify({'error': 'Không tìm thấy file kết quả phân tích.'}), 500
            
        # Đọc lịch sử để vẽ biểu đồ
        try:
            with open('history.csv', 'r', encoding='utf-8') as f:
                # Đọc 5 dòng cuối
                lines = f.readlines()[-5:]
                # Bỏ qua header nếu nó nằm trong 5 dòng cuối
                if 'timestamp' in lines[0]:
                    lines = lines[1:]
                history_data = [line.strip().split(',') for line in lines]
        except FileNotFoundError:
            history_data = []

        # Gộp tất cả dữ liệu và gửi về cho frontend
        response_data = {
            'analysis': analysis_data,
            'history': history_data
        }
        return jsonify(response_data)

    return jsonify({'error': 'Thiếu file hoặc môn thể thao.'}), 400

if __name__ == '__main__':
    app.run(debug=True)
    