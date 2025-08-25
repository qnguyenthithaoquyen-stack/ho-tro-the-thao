import cv2
import mediapipe as mp
import numpy as np
from pathlib import Path
from utils import calculate_angle

def process_video(video_path, sport):
    mp_pose = mp.solutions.pose
    pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)
    mp_drawing = mp.solutions.drawing_utils

    cap = cv2.VideoCapture(str(video_path))

    # Cấu hình video output
    output_dir = Path('static/results')
    output_dir.mkdir(exist_ok=True)
    input_filename = Path(video_path).name
    output_filename = f"processed_{input_filename}"
    output_path = output_dir / output_filename
    
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(str(output_path), fourcc, fps, (width, height))

    feedback_list = []
    accuracy_scores = []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Chuyển màu và xử lý frame
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False
        results = pose.process(image)
        image.flags.writeable = True
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        # Trích xuất landmarks
        try:
            landmarks = results.pose_landmarks.landmark
            
            # --- Logic phân tích cho môn "Xuất phát" ---
            if sport == 'xuatphat':
                # Các điểm landmarks cần thiết
                shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x, landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
                hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
                knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
                ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
                
                # Tính các góc
                back_angle = calculate_angle(shoulder, hip, knee)
                knee_angle = calculate_angle(hip, knee, ankle)
                
                # Phân tích và cho điểm
                score = 100
                if not (30 <= back_angle <= 60):
                    score -= 30
                    feedback_list.append("Lưng chưa đủ thẳng, cần gập người hơn.")
                
                if not (80 <= knee_angle <= 110):
                    score -= 30
                    feedback_list.append("Góc gối chưa tối ưu, cần gập sâu hơn.")
                
                accuracy_scores.append(max(0, score))

            # --- Thêm logic cho các môn thể thao khác ở đây ---
            # if sport == 'nhaycao':
            #     ...

        except:
            pass # Bỏ qua frame nếu không nhận diện được

        # Vẽ khung xương
        mp_drawing.draw_landmarks(
            image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
            mp_drawing.DrawingSpec(color=(245,117,66), thickness=2, circle_radius=2), 
            mp_drawing.DrawingSpec(color=(245,66,230), thickness=2, circle_radius=2) 
        )

        out.write(image)

    # Dọn dẹp
    cap.release()
    out.release()
    cv2.destroyAllWindows()
    
    # Tính toán kết quả cuối cùng
    overall_accuracy = int(np.mean(accuracy_scores)) if accuracy_scores else 0
    unique_feedback = sorted(list(set(feedback_list)))
    
    analysis_data = {
        'overall_accuracy': overall_accuracy,
        'feedback': unique_feedback if unique_feedback else ["Tư thế khá tốt, không có lỗi lớn!"]
    }
    
    # Trả về đường dẫn tương đối để HTML có thể dùng
    return str(output_path).replace('\\', '/'), analysis_data
