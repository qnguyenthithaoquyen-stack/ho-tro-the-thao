# Nội dung cho file pose_image.py

import cv2
import mediapipe as mp
import numpy as np
from pathlib import Path
from utils import calculate_angle

def process_image(image_path, sport):
    mp_pose = mp.solutions.pose
    pose = mp_pose.Pose(static_image_mode=True, min_detection_confidence=0.5)
    mp_drawing = mp.solutions.drawing_utils

    image = cv2.imread(str(image_path))
    
    # Cấu hình file output
    output_dir = Path('static/results')
    output_dir.mkdir(exist_ok=True)
    input_filename = Path(image_path).name
    output_filename = f"processed_{input_filename}"
    output_path = output_dir / output_filename

    # Xử lý ảnh
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = pose.process(image_rgb)

    feedback_list = []
    score = 100

    if results.pose_landmarks:
        landmarks = results.pose_landmarks.landmark

        # Logic phân tích cho môn "Xuất phát"
        if sport == 'xuatphat':
            shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x, landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
            hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
            knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
            ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
            
            back_angle = calculate_angle(shoulder, hip, knee)
            knee_angle = calculate_angle(hip, knee, ankle)
            
            if not (30 <= back_angle <= 60):
                score -= 30
                feedback_list.append("Lưng chưa đủ thẳng, cần gập người hơn.")
            
            if not (80 <= knee_angle <= 110):
                score -= 30
                feedback_list.append("Góc gối chưa tối ưu, cần gập sâu hơn.")

        # Vẽ khung xương lên ảnh
        mp_drawing.draw_landmarks(
            image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
            mp_drawing.DrawingSpec(color=(245,117,66), thickness=2, circle_radius=2),
            mp_drawing.DrawingSpec(color=(245,66,230), thickness=2, circle_radius=2)
        )

    # Lưu ảnh kết quả
    cv2.imwrite(str(output_path), image)

    analysis_data = {
        'overall_accuracy': max(0, score),
        'feedback': feedback_list if feedback_list else ["Tư thế khá tốt, không có lỗi lớn!"]
    }
    
    return str(output_path).replace('\\', '/'), analysis_data