import numpy as np
import csv
from datetime import datetime
import os

def calculate_angle(a, b, c):
    """Tính góc giữa 3 điểm a, b, c (góc tại b)."""
    a = np.array(a)  # First
    b = np.array(b)  # Mid
    c = np.array(c)  # End
    
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    
    if angle > 180.0:
        angle = 360 - angle
        
    return angle

def save_analysis_to_history(sport, accuracy, suggestions):
    """Lưu kết quả phân tích vào file history.csv."""
    filepath = 'history.csv'
    file_exists = os.path.isfile(filepath)
    
    with open(filepath, 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        # Ghi header nếu file mới được tạo
        if not file_exists or os.path.getsize(filepath) == 0:
            writer.writerow(['timestamp', 'sport', 'accuracy', 'suggestions'])
            
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        # Nối các gợi ý thành một chuỗi duy nhất
        suggestions_str = " | ".join(suggestions)
        writer.writerow([timestamp, sport, accuracy, suggestions_str])
        