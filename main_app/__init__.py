from flask import Flask
import firebase_admin
from firebase_admin import credentials
import os

def create_app():
    app = Flask(__name__, instance_relative_config=True)
    
    # Cấu hình secret key cho session
    app.secret_key = os.urandom(24)

    # --- KHỞI TẠO FIREBASE ADMIN ---
    try:
        cred_path = os.path.join(app.instance_path, 'serviceAccountKey.json')
        cred = credentials.Certificate(cred_path)
        
        # THAY 'your-project-id' bằng ID dự án của bạn
        firebase_admin.initialize_app(cred, {
            'storageBucket': 'your-project-id.appspot.com' 
        })
        print("Firebase App initialized successfully!")
    except Exception as e:
        print(f"Error initializing Firebase App: {e}")

    with app.app_context():
        # --- PHẦN QUAN TRỌNG NHẤT NẰM Ở ĐÂY ---
        
        # 1. Import cả hai blueprint
        from analysis_feature.routes import analysis_bp
        from .views import main_bp # Import blueprint từ file views.py
        
        # 2. Đăng ký cả hai blueprint với ứng dụng chính
        app.register_blueprint(main_bp) # <-- DÒNG NÀY CÓ THỂ BẠN ĐÃ THIẾU
        app.register_blueprint(analysis_bp, url_prefix='/analysis')

    return app
