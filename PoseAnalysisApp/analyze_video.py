import argparse
import json
import os
from pathlib import Path
from pose_video import process_video
from utils import save_analysis_to_history

def analyze(video_path, sport):
    """
    Hàm chính để phân tích video và tạo báo cáo.
    """
    # Xử lý video để lấy dữ liệu phân tích và đường dẫn video output
    output_video_path, analysis_data = process_video(video_path, sport)
    
    # --- Tạo báo cáo dựa trên dữ liệu phân tích ---
    accuracy = analysis_data.get('overall_accuracy', 0)
    suggestions = analysis_data.get('feedback', [])
    
    rating = "Cần cải thiện"
    rating_class = "Cần-cải-thiện"
    motivation = "Hãy xem lại các gợi ý và thử lại nhé!"
    
    if accuracy >= 90:
        rating = "Tuyệt vời"
        rating_class = "Tuyệt-vời"
        motivation = "Bạn đã làm rất tốt! Một tư thế hoàn hảo."
    elif accuracy >= 75:
        rating = "Tốt"
        rating_class = "Tốt"
        motivation = "Làm tốt lắm! Chỉ cần chỉnh một vài chi tiết nhỏ nữa thôi."
    elif accuracy >= 60:
        rating = "Trung bình"
        rating_class = "Trung-bình"
        motivation = "Khá ổn! Hãy tập trung vào các điểm cần cải thiện nhé."

    # --- Chuẩn bị dữ liệu để trả về ---
    results = {
        'output_path': output_video_path,
        'rating': rating,
        'rating_class': rating_class,
        'accuracy': accuracy,
        'motivation': motivation,
        'suggestions': suggestions
    }

    # Lưu kết quả vào file JSON để app.py có thể đọc
    with open('results.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=4)
        
    # Lưu vào lịch sử (CSV)
    save_analysis_to_history(sport, accuracy, suggestions)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Phân tích tư thế video.')
    parser.add_argument('--video_path', type=str, required=True, help='Đường dẫn đến video cần phân tích.')
    parser.add_argument('--sport', type=str, required=True, help='Môn thể thao (ví dụ: xuatphat).')
    
    args = parser.parse_args()
    
    analyze(args.video_path, args.sport)
    