from flask import Flask
import firebase_admin
from firebase_admin import credentials

def create_app():
    app = Flask(__name__, instance_relative_config=True)

    # KHỞI TẠO FIREBASE ADMIN
    try:
        # Đường dẫn đến file key trong thư mục instance
        cred = credentials.Certificate(app.root_path + '/../instance/serviceAccountKey.json') 
        firebase_admin.initialize_app(cred, {
            'storageBucket': 'your-project-id.appspot.com' # THAY 'your-project-id' bằng ID dự án của bạn
        })
        print("Firebase App initialized successfully!")
    except Exception as e:
        print(f"Error initializing Firebase App: {e}")

    with app.app_context():
        # Import và đăng ký các Blueprint
        from analysis_feature.routes import analysis_bp
        app.register_blueprint(analysis_bp, url_prefix='/analysis')

        # Đăng ký các route chính của bạn tại đây
        from . import views
        app.register_blueprint(views.main_bp)

    return app