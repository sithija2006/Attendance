from flask import Flask, request, jsonify
from flask_cors import CORS
import face_recognition
import cv2
import numpy as np
import base64
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Store known faces and names
known_face_encodings = []
known_face_names = []

# Store attendance logs
attendance_logs = []

# Store attendance status for current session
attendance_marked = set()

@app.route('/upload', methods=['POST'])
def upload_face():
    """Admin uploads a face and name."""
    name = request.form['name']
    image_file = request.files['image']

    # Load the uploaded image
    image = face_recognition.load_image_file(image_file)
    face_encodings = face_recognition.face_encodings(image)

    if len(face_encodings) > 0:
        known_face_encodings.append(face_encodings[0])
        known_face_names.append(name)
        return jsonify({"status": "success", "message": f"{name} added successfully!"})
    else:
        return jsonify({"status": "error", "message": "No face detected in the uploaded image!"})

@app.route('/verify', methods=['POST'])
def verify_face():
    """Verify a live face with known faces."""
    image_data = request.json['image']
    image_bytes = base64.b64decode(image_data.split(',')[1])
    nparr = np.frombuffer(image_bytes, np.uint8)
    live_image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Process the live image
    live_face_encodings = face_recognition.face_encodings(live_image)
    if len(live_face_encodings) > 0:
        matches = face_recognition.compare_faces(known_face_encodings, live_face_encodings[0])
        if True in matches:
            matched_index = matches.index(True)
            matched_name = known_face_names[matched_index]
            
            # Check if the employee has already marked attendance
            if matched_name in attendance_marked:
                return jsonify({"status": "error", "message": f"{matched_name} has already marked attendance!"})

            # Add to attendance logs and prevent further marking
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            attendance_logs.append({"name": matched_name, "timestamp": timestamp})
            attendance_marked.add(matched_name)
            
            return jsonify({"status": "success", "name": matched_name})
        else:
            return jsonify({"status": "error", "message": "Face not recognized!"})
    else:
        return jsonify({"status": "error", "message": "No face detected in the live image!"})

@app.route('/logs', methods=['GET'])
def get_logs():
    """Fetch attendance logs."""
    return jsonify(attendance_logs)

if __name__ == '__main__':
    app.run(debug=True)
