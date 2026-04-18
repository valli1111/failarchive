from flask import Flask, request, jsonify, send_from_directory, Response
import sqlite3, os, time, json, hashlib, xml.etree.ElementTree as ET

app = Flask(__name__, static_folder='public')
DB = os.path.join(os.path.dirname(__file__), 'db', 'failarchive.db')
ADMIN_TOKEN = 'failarchive-admin-2024'

def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    os.makedirs(os.path.dirname(DB), exist_ok=True)
    conn = get_db()
    conn.executescript('''
        CREATE TABLE IF NOT EXISTS entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            company TEXT,
            industry TEXT NOT NULL,
            category TEXT NOT NULL,
            tags TEXT DEFAULT '[]',
            story TEXT NOT NULL,
            what_went_wrong TEXT NOT NULL,
            what_learned TEXT NOT NULL,
            recovery TEXT,
            impact_level INTEGER DEFAULT 3,
            author TEXT DEFAULT 'Anonymous',
            upvotes INTEGER DEFAULT 0,
            been_there INTEGER DEFAULT 0,
            views INTEGER DEFAULT 0,
            status TEXT DEFAULT 'approved',
            featured INTEGER DEFAULT 0,
            company_stage TEXT,
            time_lost TEXT,
            created_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS tips (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entry_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            author TEXT DEFAULT 'Anonymous',
            experience_years INTEGER,
            upvotes INTEGER DEFAULT 0,
            created_at INTEGER NOT NULL,
            FOREIGN KEY (entry_id) REFERENCES entries(id)
        );
        CREATE TABLE IF NOT EXISTS reactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            target_type TEXT NOT NULL,
            target_id INTEGER NOT NULL,
            fingerprint TEXT NOT NULL,
            UNIQUE(type, target_type, target_id, fingerprint)
        );
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entry_id INTEGER NOT NULL,
            reason TEXT NOT NULL,
            created_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS newsletter (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            created_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_entries_status ON entries(status);
        CREATE INDEX IF NOT EXISTS idx_entries_created ON entries(created_at);
    ''')
    conn.commit()

    if conn.execute("SELECT COUNT(*) FROM entries").fetchone()[0] == 0:
        seed = [
            ('We hired too fast and burned through runway', 'StealthStartup', 'Startup', 'hiring', '["scaling","runway"]', 'Raised $1.2M seed, hired 18 in 3 months without PMF. 8 months later had to let 12 go.', 'Confused hiring activity with progress. Hired for dream state, not current stage.', 'Hire for your current stage only. Every hire before PMF is a liability.', 'Survived by cutting burn 70%, found PMF with 6 people.', 4, 'Founder', int(time.time())-86400*45, 'seed', '8 months + $400k', 1),
            ('We ignored churn for 18 months', 'B2B SaaS', 'SaaS', 'product', '["churn","metrics"]', 'New user numbers looked great. Nobody watched the back door. Customers quietly left. NRR hit 72%.', 'Vanity metrics felt good. Churn was slow and invisible.', 'Set up churn alerts day one. NRR is everything for SaaS. If below 100%, you lose money.', 'Built retention team, NRR recovered to 108% in 14 months.', 4, 'Growth Lead', int(time.time())-86400*21, 'series-a', '18 months misleading', 1),
            ('We built 6 months of features nobody wanted', None, 'Product', 'product', '["pmf","research"]', '6 months of "obvious" features. Zero usage. Never talked to actual users.', 'Mistook politeness in demos for validation. Fell in love with our solution.', 'Watch 5 real users try without your feature. One hour of observation saves 6 months.', None, 5, 'CPO', int(time.time())-86400*12, 'seed', '6 months + $200k', 0),
            ('We let one engineer become irreplaceable', 'AgencyFlow', 'Agency', 'operations', '["risk","documentation"]', 'Lead engineer knew everything. No docs. Left with 2 weeks notice. Lost 2 major clients.', 'Too busy to document. Ignored signs he was interviewing elsewhere.', 'Bus factor of 1 is existential risk. Every system needs 2+ people. Force documentation.', 'Hired 2, spent 4 months on knowledge transfer. Now have runbooks.', 5, 'CTO', int(time.time())-86400*6, 'growth', '3 months firefighting', 0),
            ('We raised at too high valuation and trapped ourselves', None, 'Startup', 'finance', '["valuation","fundraising"]', 'Raised Series A at 40x ARR in 2021 boom. Felt great. 18 months later market repriced. Needed more runway but down round would crater morale.', 'Optimized for headline valuation. Spent aggressively assuming next round would be higher.', 'Raise what you need at fair valuation. High valuation is liability if you can\'t grow into it. Keep 18+ months runway.', None, 4, 'CEO', int(time.time())-86400*3, 'series-a', 'Nearly killed company', 0),
        ]
        for s in seed:
            conn.execute('INSERT INTO entries (title,company,industry,category,tags,story,what_went_wrong,what_learned,recovery,impact_level,author,created_at,company_stage,time_lost,featured) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', s)
        conn.commit()
    conn.close()

def get_fingerprint():
    return hashlib.md5((request.remote_addr or '0.0.0.0').encode()).hexdigest()[:12]

@app.route('/api/entries', methods=['GET'])
def get_entries():
    q = request.args.get('q', '').strip()
    cat = request.args.get('category', '').strip()
    sort = request.args.get('sort', 'recent')
    limit, offset = int(request.args.get('limit', 20)), int(request.args.get('offset', 0))

    conn = get_db()
    sql = 'SELECT e.*, (SELECT COUNT(*) FROM tips WHERE entry_id=e.id) as tip_count FROM entries e WHERE status="approved"'
    params = []
    if cat:
        sql += ' AND category=?'
        params.append(cat)
    if q:
        sql += ' AND (title LIKE ? OR story LIKE ? OR what_learned LIKE ?)'
        params += [f'%{q}%']*3
    sql += ' ORDER BY ' + ('featured DESC, created_at DESC' if sort=='recent' else 'upvotes DESC')
    sql += f' LIMIT {limit} OFFSET {offset}'
    rows = conn.execute(sql, params).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/entries/<int:id>', methods=['GET'])
def get_entry(id):
    conn = get_db()
    e = conn.execute('SELECT * FROM entries WHERE id=?', (id,)).fetchone()
    if not e:
        conn.close()
        return jsonify({'error': 'Not found'}), 404
    conn.execute('UPDATE entries SET views=views+1 WHERE id=?', (id,))
    conn.commit()
    tips = conn.execute('SELECT * FROM tips WHERE entry_id=? ORDER BY upvotes DESC', (id,)).fetchall()
    related = conn.execute('SELECT id,title,category FROM entries WHERE category=? AND id!=? AND status="approved" ORDER BY upvotes DESC LIMIT 3', (e['category'], id)).fetchall()
    conn.close()
    return jsonify({'entry': dict(e), 'tips': [dict(t) for t in tips], 'related': [dict(r) for r in related]})

@app.route('/api/entries', methods=['POST'])
def create_entry():
    d = request.json or {}
    for f in ['title','industry','category','story','what_went_wrong','what_learned']:
        if not str(d.get(f,'')).strip():
            return jsonify({'error': f'Missing {f}'}), 400
    conn = get_db()
    conn.execute('INSERT INTO entries (title,company,industry,category,tags,story,what_went_wrong,what_learned,recovery,impact_level,author,company_stage,time_lost,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        (d['title'].strip()[:200], d.get('company','').strip()[:100] or None, d['industry'].strip()[:60], d['category'].strip(), json.dumps(d.get('tags',[])[:8]), d['story'].strip(), d['what_went_wrong'].strip(), d['what_learned'].strip(), d.get('recovery','').strip() or None, max(1,min(5,int(d.get('impact_level',3)))), d.get('author','Anonymous').strip()[:80] or 'Anonymous', d.get('company_stage','').strip(), d.get('time_lost','').strip(), 'approved', int(time.time())))
    conn.commit()
    new_id = conn.lastrowid
    conn.close()
    return jsonify({'id': new_id}), 201

@app.route('/api/entries/<int:id>/upvote', methods=['POST'])
def upvote(id):
    fp = get_fingerprint()
    conn = get_db()
    try:
        conn.execute('INSERT INTO reactions (type,target_type,target_id,fingerprint) VALUES (?,?,?,?)', ('upvote','entry',id,fp))
        conn.execute('UPDATE entries SET upvotes=upvotes+1 WHERE id=?', (id,))
        conn.commit()
    except:
        pass
    count = conn.execute('SELECT upvotes FROM entries WHERE id=?', (id,)).fetchone()['upvotes']
    conn.close()
    return jsonify({'upvotes': count})

@app.route('/api/entries/<int:id>/been-there', methods=['POST'])
def been_there(id):
    fp = get_fingerprint()
    conn = get_db()
    try:
        conn.execute('INSERT INTO reactions (type,target_type,target_id,fingerprint) VALUES (?,?,?,?)', ('been','entry',id,fp))
        conn.execute('UPDATE entries SET been_there=been_there+1 WHERE id=?', (id,))
        conn.commit()
    except:
        pass
    count = conn.execute('SELECT been_there FROM entries WHERE id=?', (id,)).fetchone()['been_there']
    conn.close()
    return jsonify({'been_there': count})

@app.route('/api/entries/<int:id>/tips', methods=['POST'])
def add_tip(id):
    d = request.json or {}
    if not str(d.get('content','')).strip():
        return jsonify({'error': 'Required'}), 400
    conn = get_db()
    if not conn.execute('SELECT id FROM entries WHERE id=?', (id,)).fetchone():
        conn.close()
        return jsonify({'error': 'Entry not found'}), 404
    conn.execute('INSERT INTO tips (entry_id,content,author,experience_years,created_at) VALUES (?,?,?,?,?)',
        (id, d['content'].strip(), d.get('author','Anonymous').strip()[:80] or 'Anonymous', d.get('experience_years'), int(time.time())))
    conn.commit()
    conn.close()
    return jsonify({'ok': True}), 201

@app.route('/api/tips/<int:id>/upvote', methods=['POST'])
def upvote_tip(id):
    fp = get_fingerprint()
    conn = get_db()
    try:
        conn.execute('INSERT INTO reactions (type,target_type,target_id,fingerprint) VALUES (?,?,?,?)', ('upvote','tip',id,fp))
        conn.execute('UPDATE tips SET upvotes=upvotes+1 WHERE id=?', (id,))
        conn.commit()
    except:
        pass
    count = conn.execute('SELECT upvotes FROM tips WHERE id=?', (id,)).fetchone()['upvotes']
    conn.close()
    return jsonify({'upvotes': count})

@app.route('/api/stats', methods=['GET'])
def stats():
    conn = get_db()
    d = {
        'entries': conn.execute("SELECT COUNT(*) FROM entries WHERE status='approved'").fetchone()[0],
        'tips': conn.execute('SELECT COUNT(*) FROM tips').fetchone()[0],
        'upvotes': conn.execute("SELECT SUM(upvotes) FROM entries WHERE status='approved'").fetchone()[0] or 0,
    }
    conn.close()
    return jsonify(d)

@app.route('/rss.xml')
def rss():
    conn = get_db()
    entries = conn.execute("SELECT * FROM entries WHERE status='approved' ORDER BY created_at DESC LIMIT 20").fetchall()
    conn.close()
    rss = ET.Element('rss', version='2.0')
    ch = ET.SubElement(rss, 'channel')
    ET.SubElement(ch, 'title').text = 'FailArchive'
    ET.SubElement(ch, 'link').text = 'https://failarchive.com'
    ET.SubElement(ch, 'description').text = 'Real failures. Real lessons.'
    for e in entries:
        item = ET.SubElement(ch, 'item')
        ET.SubElement(item, 'title').text = e['title']
        ET.SubElement(item, 'description').text = e['what_learned']
        ET.SubElement(item, 'pubDate').text = time.strftime('%a, %d %b %Y %H:%M:%S +0000', time.gmtime(e['created_at']))
    return Response(ET.tostring(rss, encoding='unicode'), mimetype='application/rss+xml')

@app.route('/')
def index():
    return send_from_directory('public', 'index.html')

@app.route('/<path:p>')
def static_files(p):
    return send_from_directory('public', p)

if __name__ == '__main__':
    init_db()
    print('FailArchive running at http://localhost:5000')
    app.run(debug=False, port=5000)
