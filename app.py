from flask import Flask, render_template, request, redirect, url_for, g
import sqlite3
from datetime import datetime
import os

app = Flask(__name__)
DATABASE = 'mesajlar.db'

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db

with app.app_context():
    db = sqlite3.connect(DATABASE)
    db.execute('''CREATE TABLE IF NOT EXISTS mesajlar
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  isim TEXT NOT NULL,
                  mesaj TEXT NOT NULL,
                  tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    db.commit()
    print("✅ Veritabanı hazır!")

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        isim = request.form['isim'].strip()
        mesaj = request.form['mesaj'].strip()
        if isim and mesaj:
            conn = get_db()
            conn.execute('INSERT INTO mesajlar (isim, mesaj) VALUES (?, ?)', (isim, mesaj))
            conn.commit()
        return redirect(url_for('index'))

    conn = get_db()
    mesajlar = conn.execute('SELECT * FROM mesajlar ORDER BY tarih DESC').fetchall()
    return render_template('index.html', mesajlar=mesajlar, su_an=datetime.now())

if __name__ == '__main__':
    app.run(debug=True)
