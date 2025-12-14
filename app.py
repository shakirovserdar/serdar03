from flask import Flask, render_template, request, jsonify, session
from datetime import datetime
import json
import os
import uuid
import requests

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'ultra-mega-super-key-2024')

# Basit mesaj depolama
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

def get_client_ip():
    """Kullanıcının gerçek IP adresini al"""
    if request.headers.get('X-Forwarded-For'):
        ip = request.headers.get('X-Forwarded-For').split(',')[0]
    else:
        ip = request.remote_addr
    return ip

def get_location_info(ip_address):
    """IP adresinden konum bilgilerini al"""
    try:
        # Free IP Geolocation API
        response = requests.get(f'http://ip-api.com/json/{ip_address}?fields=status,country,city,lat,lon,timezone,isp', timeout=3)
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'success':
                return {
                    'country': data.get('country', 'Bilinmiyor'),
                    'city': data.get('city', 'Bilinmiyor'),
                    'timezone': data.get('timezone', 'Europe/Moscow'),
                    'isp': data.get('isp', 'Bilinmiyor')
                }
    except:
        pass
    
    # Fallback to default (Krasnodar)
    return {
        'country': 'Rusya',
        'city': 'Krasnodar',
        'timezone': 'Europe/Moscow',
        'isp': 'Bilinmiyor'
    }

@app.route('/')
def index():
    if 'visitor_id' not in session:
        session['visitor_id'] = str(uuid.uuid4())[:8]
    
    # IP ve konum bilgilerini al
    client_ip = get_client_ip()
    location_info = get_location_info(client_ip)
    
    # Saati kullanıcının zaman dilimine göre ayarla
    from datetime import datetime, timezone
    import pytz
    
    try:
        user_timezone = pytz.timezone(location_info['timezone'])
        user_time = datetime.now(user_timezone)
    except:
        user_timezone = pytz.timezone('Europe/Moscow')
        user_time = datetime.now(user_timezone)
    
    messages = load_messages()
    
    return render_template('index.html', 
                         messages=messages,
                         visitor_id=session['visitor_id'],
                         current_time=user_time,
                         client_ip=client_ip,
                         location_info=location_info,
                         user_timezone=location_info['timezone'])

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

@app.route('/api/userinfo')
def get_user_info():
    client_ip = get_client_ip()
    location_info = get_location_info(client_ip)
    
    # Kullanıcı ajanından cihaz bilgisi
    user_agent = request.headers.get('User-Agent', '')
    
    return jsonify({
        'ip': client_ip,
        'country': location_info['country'],
        'city': location_info['city'],
        'timezone': location_info['timezone'],
        'isp': location_info['isp'],
        'user_agent': user_agent
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)