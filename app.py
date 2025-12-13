from flask import Flask, render_template, request, jsonify, session
from datetime import datetime
import json
import os
import uuid

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'ultra-mega-super-key-2024')

# Basit mesaj depolama (gerçek projede veritabanı kullanın)
MESSAGES_FILE = 'messages.json'

def load_messages():
    try:
        with open(MESSAGES_FILE, 'r') as f:
            return json.load(f)
    except:
        return []

def save_messages(messages):
    with open(MESSAGES_FILE, 'w') as f:
        json.dump(messages, f, indent=2)

@app.route('/')
def index():
    if 'visitor_id' not in session:
        session['visitor_id'] = str(uuid.uuid4())[:8]
    
    messages = load_messages()
    return render_template('index.html', 
                         messages=messages,
                         visitor_id=session['visitor_id'],
                         current_time=datetime.now())

@app.route('/api/messages', methods=['GET', 'POST'])
def handle_messages():
    if request.method == 'POST':
        data = request.json
        messages = load_messages()
        
        new_message = {
            'id': str(uuid.uuid4()),
            'name': data.get('name', 'Anonim'),
            'message': data.get('message', ''),
            'time': datetime.now().strftime('%H:%M'),
            'date': datetime.now().strftime('%d.%m.%Y'),
            'visitor_id': session.get('visitor_id', 'unknown')
        }
        
        messages.append(new_message)
        save_messages(messages)
        
        return jsonify({'success': True, 'message': new_message})
    
    # GET isteği
    messages = load_messages()
    return jsonify({'messages': messages})

@app.route('/api/stats')
def get_stats():
    messages = load_messages()
    return jsonify({
        'total_messages': len(messages),
        'unique_visitors': len(set(m.get('visitor_id', '') for m in messages)),
        'server_time': datetime.now().strftime('%H:%M:%S')
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)