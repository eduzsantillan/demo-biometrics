import json
import os
from flask import Flask, jsonify, request
from deepface import DeepFace
import base64
from PIL import Image,ExifTags
from io import BytesIO
import numpy as np
from pymongo import MongoClient
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 
models = [
  "VGG-Face", 
  "Facenet", 
  "Facenet512", 
  "OpenFace", 
  "DeepFace", 
  "DeepID", 
  "ArcFace", 
  "Dlib", 
  "SFace",
  "GhostFaceNet",
]
ORIENTATION_180 = 3
ORIENTATION_270 = 6
ORIENTATION_90 = 8
MODEL_NAME = models[8]
SOURCE_IMAGE = 'source.jpg'
TARGET_IMAGE = 'target.jpg'

MONGO_URI = os.getenv('MONGO_URI', 'default')
client = MongoClient(MONGO_URI)
db = client['your_db']
collection = db['user']


@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if 'email' not in data or 'name' not in data or 'target' not in data:
        return jsonify({'error': 'email, name, and target keys are required'}), 400
    
    email = data['email']
    name = data['name']
    img_in_base64 = data['target']
    
    if collection.find_one({'email': email}):
        return jsonify({'error': 'User already exists'}), 409
    decode_image(img_in_base64, TARGET_IMAGE)
    
    user_data = {
        'email': email,
        'name': name,
        'image_path': img_in_base64
    }
    collection.insert_one(user_data)
    delete_files([TARGET_IMAGE])
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if 'email' not in data or 'target' not in data:
        return jsonify({'error': 'email and target keys are required'}), 400
    
    email = data['email']
    img_in_base64 = data['target']
    user = collection.find_one({'email': email})
    if user is None:
        return jsonify({'error': 'User not found'}), 404
    
    return compare(img_in_base64, user['image_path'])

@app.route('/verify', methods=['POST'])
def verify():
    data = request.get_json()
    if 'image' not in data:
        return jsonify({'error': 'image key is required'}), 400
    decode_image(data['image'], TARGET_IMAGE)
    try:
        results = DeepFace.extract_faces(
            img_path = TARGET_IMAGE,
            enforce_detection = True,
        )
    except Exception as e:
        return jsonify({
            'message': 'No face detected in the image ',
            'verified': False
            }), 400
    delete_files([TARGET_IMAGE])
    results = [ { **result, 'face': numpy_to_list(result['face']) } for result in results ]
    json_data = json.dumps(results)
    data = json.loads(json_data)
    face_count = sum(1 for item in data if "face" in item)

    if face_count > 1:
        return jsonify({
            'message': 'Multiple faces detected in the image',
            'verified': False
            }), 400
    
    if face_count == 1:
        return jsonify({
            'message': 'Face detected in the image',
            'verified': True
            }), 200

def compare(target, source):
    if target is None or source is None:
        return jsonify({'error': 'target and source keys are required'}), 400
    decode_image(source, SOURCE_IMAGE)
    decode_image(target, TARGET_IMAGE)
    result = DeepFace.verify(
        img1_path = SOURCE_IMAGE,
        img2_path = TARGET_IMAGE,
        model_name = MODEL_NAME,
        enforce_detection = False,
    )
    delete_files([TARGET_IMAGE, SOURCE_IMAGE])
    return jsonify(result)

def decode_image(encoded_image, temp_file_path):
    if encoded_image.startswith("data:image/jpeg;base64,"):
        encoded_image = encoded_image.replace("data:image/jpeg;base64,", "")
    image_data = base64.b64decode(encoded_image)
    image = Image.open(BytesIO(image_data))

    for orientation in ExifTags.TAGS.keys():
        if ExifTags.TAGS[orientation] == 'Orientation':
            break

    exif = image._getexif()
    if exif is not None:  
        exif = dict(exif.items())
        if orientation in exif:
            if exif[orientation] == 3:
                image = image.rotate(180, expand=True)
            elif exif[orientation] == 6:
                image = image.rotate(270, expand=True)
            elif exif[orientation] == 8:
                image = image.rotate(90, expand=True)

    image.save(temp_file_path,image.format)

def delete_files(files_to_delete):
    for filename in files_to_delete:
        if os.path.exists(filename):
            print(f"Deleting {filename}")
            os.remove(filename)

def numpy_to_list(data):
    if isinstance(data, np.ndarray):
        return numpy_to_list(data.tolist())
    elif isinstance(data, list):
        return [numpy_to_list(item) for item in data]
    else:
        return data

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80)
