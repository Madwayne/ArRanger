import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Инициализация базы данных
def init_db():
    with sqlite3.connect('tracks.db') as conn:
        cursor = conn.cursor()
    
    # Создание таблиц
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS tracks (
                track_id INTEGER PRIMARY KEY AUTOINCREMENT,
                track_name TEXT NOT NULL,
                created_datetime TEXT NOT NULL,
                updated_datetime TEXT NOT NULL,
                show_timeline BOOLEAN NOT NULL,
                bpm INTEGER NOT NULL,
                signature_numerator INTEGER NOT NULL,
                signature_denominator INTEGER NOT NULL
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sections (
                track_id INTEGER,
                section_id INTEGER,
                section_name TEXT NOT NULL,
                section_color TEXT NOT NULL,
                comment TEXT,
                duration INTEGER NOT NULL,
                section_position INTEGER NOT NULL,
                FOREIGN KEY (track_id) REFERENCES tracks (track_id)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS lines (
                track_id INTEGER,
                line_id INTEGER,
                line_name TEXT NOT NULL,
                line_sound TEXT,
                line_comment TEXT,
                line_position INTEGER NOT NULL,
                FOREIGN KEY (track_id) REFERENCES tracks (track_id)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS cells (
                section_id INTEGER,
                line_id INTEGER,
                value TEXT,
                FOREIGN KEY (section_id) REFERENCES sections (section_id),
                FOREIGN KEY (line_id) REFERENCES lines (line_id)
            )
        ''')
        
        conn.commit()

# Функция для получения следующего доступного ID
def get_next_id(cursor, table_name, track_id=None):
    if track_id is not None:
        if table_name == 'sections':
            cursor.execute('SELECT MAX(section_id) FROM sections WHERE track_id = ?', (track_id,))
        elif table_name == 'lines':
            cursor.execute('SELECT MAX(line_id) FROM lines WHERE track_id = ?', (track_id,))
        else:
            cursor.execute(f'SELECT MAX(id) FROM {table_name} WHERE track_id = ?', (track_id,))
    else:
        if table_name == 'sections':
            cursor.execute('SELECT MAX(section_id) FROM sections')
        elif table_name == 'lines':
            cursor.execute('SELECT MAX(line_id) FROM lines')
        else:
            cursor.execute(f'SELECT MAX(id) FROM {table_name}')
    
    row = cursor.fetchone()
    if row and row[0] is not None:
        return row[0] + 1
    else:
        return 1

# Получить список треков
@app.route('/tracks', methods=['GET'])
def get_tracks():
    conn = sqlite3.connect('tracks.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT track_id, track_name, created_datetime, updated_datetime
        FROM tracks
        ORDER BY updated_datetime DESC
    ''')
    
    tracks = []
    for row in cursor.fetchall():
        tracks.append({
            'track_id': row[0],
            'track_name': row[1],
            'created_datetime': row[2],
            'updated_datetime': row[3]
        })
    
    conn.close()
    return jsonify(tracks)

# Создать трек
@app.route('/tracks', methods=['POST'])
def create_track():
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    conn = sqlite3.connect('tracks.db')
    cursor = conn.cursor()
    
    # Вставка трека
    cursor.execute('''
        INSERT INTO tracks (
            track_name, created_datetime, updated_datetime,
            show_timeline, bpm, signature_numerator, signature_denominator
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        data.get('settings', {}).get('trackName', ''),
        datetime.now().isoformat(),
        datetime.now().isoformat(),
        data.get('settings', {}).get('showTimeline', False),
        data.get('settings', {}).get('bpm', 120),
        data.get('settings', {}).get('signatureNumerator', 4),
        data.get('settings', {}).get('signatureDenominator', 4)
    ))
    
    track_id = cursor.lastrowid
    
    # Вставка секций
    for section in data.get('sections', []):
        cursor.execute('''
            INSERT INTO sections (
                track_id, section_id, section_name, section_color,
                comment, duration, section_position
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            track_id,
            get_next_id(cursor, 'sections', track_id),
            section['name'],
            section['color'],
            section['comment'],
            section['duration'],
            section['number']
        ))
    
    # Вставка линий
    for line in data.get('lines', []):
        cursor.execute('''
            INSERT INTO lines (
                track_id, line_id, line_name, line_sound,
                line_comment, line_position
            ) VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            track_id,
            get_next_id(cursor, 'lines', track_id),
            line['name'],
            line['sound'],
            line['comment'],
            line['number']
        ))
    
    # Вставка ячеек
    for desc in data.get('descriptions', []):
        # Получаем section_id и line_id
        cursor.execute('''
            SELECT section_id FROM sections
            WHERE track_id = ? AND section_position = ?
        ''', (track_id, desc['sectionNumber']))
        section_row = cursor.fetchone()
        
        cursor.execute('''
            SELECT line_id FROM lines
            WHERE track_id = ? AND line_position = ?
        ''', (track_id, desc['lineNumber']))
        line_row = cursor.fetchone()
        
        if section_row and line_row:
            cursor.execute('''
                INSERT INTO cells (section_id, line_id, value)
                VALUES (?, ?, ?)
            ''', (section_row[0], line_row[0], desc['description']))
    
    conn.commit()
    conn.close()
    
    return jsonify({'track_id': track_id}), 201

# Получить трек
@app.route('/tracks/<int:track_id>', methods=['GET'])
def get_track(track_id):
    conn = sqlite3.connect('tracks.db')
    cursor = conn.cursor()
    
    # Получаем трек
    cursor.execute('''
        SELECT track_name, show_timeline, bpm, signature_numerator, signature_denominator
        FROM tracks
        WHERE track_id = ?
    ''', (track_id,))
    
    track_row = cursor.fetchone()
    if not track_row:
        conn.close()
        return jsonify({'error': 'Track not found'}), 404
    
    # Получаем секции
    cursor.execute('''
        SELECT section_id, section_name, section_color, comment, duration, section_position
        FROM sections
        WHERE track_id = ?
        ORDER BY section_position
    ''', (track_id,))
    
    sections = []
    section_map = {}  # Для сопоставления section_id с номером
    for row in cursor.fetchall():
        section_map[row[0]] = row[5]  # section_id -> section_position
        sections.append({
            'number': row[5],
            'name': row[1],
            'color': row[2],
            'comment': row[3] or '',
            'duration': row[4]
        })
    
    # Получаем линии
    cursor.execute('''
        SELECT line_id, line_name, line_sound, line_comment, line_position
        FROM lines
        WHERE track_id = ?
        ORDER BY line_position
    ''', (track_id,))
    
    lines = []
    line_map = {}  # Для сопоставления line_id с номером
    for row in cursor.fetchall():
        line_map[row[0]] = row[4]  # line_id -> line_position
        lines.append({
            'number': row[4],
            'name': row[1],
            'sound': row[2] or '',
            'comment': row[3] or ''
        })
    
    # Получаем описания
    cursor.execute('''
        SELECT section_id, line_id, value
        FROM cells
        WHERE section_id IN (SELECT section_id FROM sections WHERE track_id = ?)
        AND line_id IN (SELECT line_id FROM lines WHERE track_id = ?)
    ''', (track_id, track_id))
    
    descriptions = []
    for row in cursor.fetchall():
        section_position = section_map.get(row[0])
        line_position = line_map.get(row[1])
        if section_position is not None and line_position is not None:
            descriptions.append({
                'sectionNumber': section_position,
                'lineNumber': line_position,
                'description': row[2]
            })
    
    conn.close()
    
    track_data = {
        'settings': {
            'trackName': track_row[0],
            'showTimeline': track_row[1],
            'bpm': track_row[2],
            'signatureNumerator': track_row[3],
            'signatureDenominator': track_row[4]
        },
        'sections': sections,
        'lines': lines,
        'descriptions': descriptions
    }
    
    return jsonify(track_data)

# Сохранить трек
@app.route('/tracks/<int:track_id>', methods=['PUT'])
def update_track(track_id):
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    conn = sqlite3.connect('tracks.db')
    cursor = conn.cursor()
    
    # Обновляем трек
    cursor.execute('''
        UPDATE tracks
        SET track_name = ?, updated_datetime = ?,
            show_timeline = ?, bpm = ?, signature_numerator = ?, signature_denominator = ?
        WHERE track_id = ?
    ''', (
        data.get('settings', {}).get('trackName', ''),
        datetime.now().isoformat(),
        data.get('settings', {}).get('showTimeline', False),
        data.get('settings', {}).get('bpm', 120),
        data.get('settings', {}).get('signatureNumerator', 4),
        data.get('settings', {}).get('signatureDenominator', 4),
        track_id
    ))
    
    # Удаляем старые секции, линии и ячейки
    cursor.execute('DELETE FROM cells WHERE section_id IN (SELECT section_id FROM sections WHERE track_id = ?)', (track_id,))
    cursor.execute('DELETE FROM sections WHERE track_id = ?', (track_id,))
    cursor.execute('DELETE FROM lines WHERE track_id = ?', (track_id,))
    
    # Вставка новых секций
    for section in data.get('sections', []):
        cursor.execute('''
            INSERT INTO sections (
                track_id, section_id, section_name, section_color,
                comment, duration, section_position
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            track_id,
            get_next_id(cursor, 'sections', track_id),
            section['name'],
            section['color'],
            section['comment'],
            section['duration'],
            section['number']
        ))
    
    # Вставка новых линий
    for line in data.get('lines', []):
        cursor.execute('''
            INSERT INTO lines (
                track_id, line_id, line_name, line_sound,
                line_comment, line_position
            ) VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            track_id,
            get_next_id(cursor, 'lines', track_id),
            line['name'],
            line['sound'],
            line['comment'],
            line['number']
        ))
    
    # Вставка новых ячеек
    for desc in data.get('descriptions', []):
        # Получаем section_id и line_id
        cursor.execute('''
            SELECT section_id FROM sections
            WHERE track_id = ? AND section_position = ?
        ''', (track_id, desc['sectionNumber']))
        section_row = cursor.fetchone()
        
        cursor.execute('''
            SELECT line_id FROM lines
            WHERE track_id = ? AND line_position = ?
        ''', (track_id, desc['lineNumber']))
        line_row = cursor.fetchone()
        
        if section_row and line_row:
            cursor.execute('''
                INSERT INTO cells (section_id, line_id, value)
                VALUES (?, ?, ?)
            ''', (section_row[0], line_row[0], desc['description']))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Track updated successfully'})

# Удалить трек
@app.route('/tracks/<int:track_id>', methods=['DELETE'])
def delete_track(track_id):
    conn = sqlite3.connect('tracks.db')
    cursor = conn.cursor()
    
    # Удаляем ячейки
    cursor.execute('DELETE FROM cells WHERE section_id IN (SELECT section_id FROM sections WHERE track_id = ?)', (track_id,))
    
    # Удаляем секции и линии
    cursor.execute('DELETE FROM sections WHERE track_id = ?', (track_id,))
    cursor.execute('DELETE FROM lines WHERE track_id = ?', (track_id,))
    
    # Удаляем трек
    cursor.execute('DELETE FROM tracks WHERE track_id = ?', (track_id,))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Track deleted successfully'})

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)