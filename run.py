from main_app import create_app

app = create_app()

if __name__ == '__main__':
    # Chạy server, host='0.0.0.0' để có thể truy cập từ máy khác trong cùng mạng
    app.run(host='0.0.0.0', port=5000, debug=True)