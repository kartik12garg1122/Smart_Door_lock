"""Test the EXACT flow: base64 encode -> send to /recognize -> check response."""
import cv2, base64, requests, time, warnings, numpy as np
warnings.filterwarnings('ignore')

cap = cv2.VideoCapture(0)
for _ in range(10): cap.read()

# Capture and encode the SAME way react-webcam does
frames = []
for i in range(3):
    ret, frame = cap.read()
    if ret:
        # react-webcam outputs JPEG base64 with data URI prefix
        _, buf = cv2.imencode('.jpg', frame)
        b64 = base64.b64encode(buf).decode('utf-8')
        data_uri = f"data:image/jpeg;base64,{b64}"
        frames.append(data_uri)
        
        # Also test decode locally
        if i == 0:
            # Simulate what decode_base64_image does
            b64_clean = data_uri.split(",")[1]
            img_data = base64.b64decode(b64_clean)
            from PIL import Image
            import io
            img = Image.open(io.BytesIO(img_data)).convert('RGB')
            img_arr = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
            print(f"Local decode test: shape={img_arr.shape}, dtype={img_arr.dtype}")
            
            # Test DeepFace on this decoded array
            from deepface import DeepFace
            try:
                results = DeepFace.represent(img_path=img_arr, model_name='Facenet', enforce_detection=False)
                print(f"Local DeepFace test: SUCCESS, dim={len(results[0]['embedding'])}")
            except Exception as e:
                print(f"Local DeepFace test: FAILED: {e}")
    time.sleep(0.1)
cap.release()

print(f"\nSending {len(frames)} frames to /recognize (b64 length: {len(frames[0])} chars)...")
try:
    r = requests.post('http://localhost:5000/recognize', json={'images': frames}, timeout=120)
    print(f"Status: {r.status_code}")
    if r.status_code == 200 or r.headers.get('content-type', '').startswith('application/json'):
        try:
            print(f"Response: {r.json()}")
        except:
            print(f"Raw (first 500): {r.text[:500]}")
    else:
        # Extract error from HTML
        import re
        match = re.search(r'<h1>(.*?)</h1>', r.text)
        error = match.group(1) if match else 'Unknown'
        match2 = re.search(r'errormsg.*?>(.*?)<', r.text, re.DOTALL)
        detail = match2.group(1).strip() if match2 else ''
        print(f"Error: {error}: {detail}")
        
        # Find the actual traceback line
        tb_lines = re.findall(r'<pre class="line current">(.*?)</pre>', r.text)
        for line in tb_lines:
            clean = re.sub(r'<.*?>', '', line).strip()
            print(f"  at: {clean}")
except Exception as e:
    print(f"Request error: {e}")
