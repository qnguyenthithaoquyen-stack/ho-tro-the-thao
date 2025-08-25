from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for
from firebase_admin import auth, firestore

main_bp = Blueprint('main_bp', __name__)

db = firestore.client()

# --- CÁC ROUTE HIỂN THỊ GIAO DIỆN ---
@main_bp.route('/')
def index():
    return render_template('index.html')

@main_bp.route('/dangnhap')
def dangnhap_page():
    return render_template('dangnhap.html')

@main_bp.route('/dangki')
def dangki_page():
    return render_template('dangki.html')
    
@main_bp.route('/dashboard')
def dashboard():
    # Kiểm tra xem người dùng đã đăng nhập chưa
    if 'user' in session:
        user_role = session['user'].get('role')
        if user_role == 'coach':
            return render_template('coach-dashboard.html')
        elif user_role == 'athlete':
            return render_template('athlete-dashboard.html')
    # Nếu chưa đăng nhập, chuyển về trang đăng nhập
    return redirect(url_for('main_bp.dangnhap_page'))
    
@main_bp.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('main_bp.index'))

# --- CÁC ROUTE API XỬ LÝ LOGIC ---
@main_bp.route('/api/register', methods=['POST'])
def api_register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    if not all([email, password, role]):
        return jsonify({'status': 'error', 'message': 'Thiếu thông tin'}), 400

    try:
        user = auth.create_user(email=email, password=password)
        user_data = {'email': user.email, 'role': role}
        db.collection('users').document(user.uid).set(user_data)
        return jsonify({'status': 'success', 'message': 'Tạo tài khoản thành công!'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

@main_bp.route('/api/verify-token', methods=['POST'])
def api_verify_token():
    try:
        token = request.json['token']
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']
        
        user_doc = db.collection('users').document(uid).get()
        if user_doc.exists:
            user_info = user_doc.to_dict()
            session['user'] = {'uid': uid, 'email': user_info.get('email'), 'role': user_info.get('role')}
            return jsonify({'status': 'success', 'role': user_info.get('role')})
        else:
            return jsonify({'status': 'error', 'message': 'Không tìm thấy thông tin người dùng.'}), 404
    except Exception as e:
        return jsonify({'status': 'error', 'message': 'Token không hợp lệ.'}), 401
    