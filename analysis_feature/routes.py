from flask import Blueprint, request, jsonify, render_template, session, redirect, url_for
from firebase_admin import storage
import subprocess
import uuid
import os

analysis_bp = Blueprint(
    'analysis_bp', 
    __name__,
    template_folder='templates',
    static_folder='static'
)

@analysis_bp.route('/')
def index():
    # Chỉ cho phép truy cập nếu đã đăng nhập
    if 'user' not in session:
        return redirect(url_for('main_bp.dangnhap_page'))
    return render_template('phantich.html')

@analysis_bp.route('/analyze', methods=['POST'])
def analyze():
    if 'user' not in session:
        return jsonify({'error': 'Chưa xác thực'}), 401

    file = request.files.get('file')
    sport = request.form.get('sport')

    if not file:
        return jsonify({'error': 'Không có file'}), 400

    try:
        bucket = storage.bucket()
        filename = f"uploads/{uuid.uuid4()}_{file.filename}"
        blob = bucket.blob(filename)
        
        blob.upload_from_file(file, content_type=file.content_type)
        blob.make_public()
        public_url = blob.public_url

        # Gọi script phân tích với URL công khai của file
        # Đường dẫn đến các script trong cùng module
        module_path = os.path.dirname(__file__)
        analyzer_script_path = os.path.join(module_path, 'analyze_video.py')
        
        # Chạy subprocess để phân tích
        subprocess.run([
            'python', str(analyzer_script_path),
            '--video_url', public_url,
            '--sport', sport,
            '--filename', filename # Gửi tên file để xử lý output
        ], check=True, capture_output=True, text=True, encoding='utf-8')

        # Đọc kết quả từ file JSON (do analyze_video.py tạo ra)
        with open('results.json', 'r', encoding='utf-8') as f:
            analysis_data = json.load(f)

        return jsonify({'status': 'success', 'analysis': analysis_data})

    except Exception as e:
        return jsonify({'error': str(e)}), 500