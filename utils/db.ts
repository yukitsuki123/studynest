import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('studynest.db');

export async function initDB(): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    -- Migrations: add columns that may be missing on existing installs
    -- SQLite ignores "duplicate column" errors only via separate statements,
    -- so we run each ALTER TABLE individually below in the migration block.
  `);

  // Run migrations safely — each in its own try/catch so existing columns don't abort
  const migrations = [
    `ALTER TABLE courses ADD COLUMN archived INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE notes   ADD COLUMN template TEXT NOT NULL DEFAULT 'blank'`,
    `ALTER TABLE user_profile ADD COLUMN achievements TEXT NOT NULL DEFAULT '[]'`,
    `ALTER TABLE user_profile ADD COLUMN avatar_uri TEXT`,
    `CREATE TABLE IF NOT EXISTS user_profile (
      id TEXT PRIMARY KEY NOT NULL DEFAULT 'me',
      name TEXT NOT NULL DEFAULT 'Student',
      email TEXT NOT NULL DEFAULT '',
      university TEXT, major TEXT, year TEXT,
      avatar_emoji TEXT NOT NULL DEFAULT '🎓',
      avatar_bg TEXT NOT NULL DEFAULT '#8B4513',
      id_card_visible INTEGER NOT NULL DEFAULT 1,
      achievements TEXT NOT NULL DEFAULT '[]',
      avatar_uri TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY NOT NULL,
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL, url TEXT NOT NULL, note TEXT, added_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS grades (
      id TEXT PRIMARY KEY NOT NULL,
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      label TEXT NOT NULL, score REAL NOT NULL, max_score REAL NOT NULL,
      weight REAL NOT NULL DEFAULT 1, created_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS exams (
      id TEXT PRIMARY KEY NOT NULL,
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL, date INTEGER NOT NULL, location TEXT, notes TEXT, created_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS pomodoro_sessions (
      id TEXT PRIMARY KEY NOT NULL, course_id TEXT, duration INTEGER NOT NULL, completed_at INTEGER NOT NULL
    )`,
  ];
  for (const sql of migrations) {
    try { db.runSync(sql); } catch (_) { /* column/table already exists — skip */ }
  }

  // Ensure user_profile has at least one row
  try {
    db.runSync(`INSERT OR IGNORE INTO user_profile (id) VALUES ('me')`);
  } catch (_) {}

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS user_profile (
      id TEXT PRIMARY KEY NOT NULL DEFAULT 'me',
      name TEXT NOT NULL DEFAULT 'Student',
      email TEXT NOT NULL DEFAULT '',
      university TEXT,
      major TEXT,
      year TEXT,
      avatar_emoji TEXT NOT NULL DEFAULT '🎓',
      avatar_bg TEXT NOT NULL DEFAULT '#8B4513',
      id_card_visible INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, icon TEXT NOT NULL DEFAULT '📁',
      color TEXT NOT NULL DEFAULT '#8B4513', archived INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS course_files (
      id TEXT PRIMARY KEY NOT NULL, course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      name TEXT NOT NULL, uri TEXT NOT NULL DEFAULT '', type TEXT NOT NULL DEFAULT 'other',
      size INTEGER, added_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY NOT NULL, course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL, content TEXT NOT NULL DEFAULT '',
      template TEXT NOT NULL DEFAULT 'blank', updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY NOT NULL, course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL, done INTEGER NOT NULL DEFAULT 0, deadline INTEGER,
      priority TEXT NOT NULL DEFAULT 'medium', created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS study_sets (
      id TEXT PRIMARY KEY NOT NULL, course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL, created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS study_set_steps (
      id TEXT PRIMARY KEY NOT NULL, set_id TEXT NOT NULL REFERENCES study_sets(id) ON DELETE CASCADE,
      label TEXT NOT NULL, done INTEGER NOT NULL DEFAULT 0, position INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY NOT NULL, course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL, url TEXT NOT NULL, added_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY NOT NULL, course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL, url TEXT NOT NULL, note TEXT, added_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS grades (
      id TEXT PRIMARY KEY NOT NULL, course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      label TEXT NOT NULL, score REAL NOT NULL, max_score REAL NOT NULL,
      weight REAL NOT NULL DEFAULT 1, created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS exams (
      id TEXT PRIMARY KEY NOT NULL, course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL, date INTEGER NOT NULL, location TEXT, notes TEXT, created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS pomodoro_sessions (
      id TEXT PRIMARY KEY NOT NULL, course_id TEXT, duration INTEGER NOT NULL, completed_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL
    );
  `);
  seedIfEmpty();
}

function seedIfEmpty() {
  const row = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM courses');
  if (row && row.count > 0) return;

  const now = Date.now();
  const NOTE_1 = ['# Calculus — Lecture 7','','*March 18, 2026 · Prof. Karim*','','## Integration by Parts','','The formula is derived from the **product rule**:','','∫ u dv = uv − ∫ v du','','Choose *u* and *dv* using the **LIATE** rule:','- **L**ogarithmic','- **I**nverse trig','- **A**lgebraic','- **T**rigonometric','- **E**xponential','','## Example','','∫ x·eˣ dx → let u = x, dv = eˣdx','','Result: `x·eˣ − eˣ + C`'].join('\n');
  const NOTE_2 = ['# Wave Optics','','Light behaves as both a **wave** and a particle (photon).','','## Key Concepts','','- Superposition principle','- Constructive & destructive interference','- Diffraction patterns'].join('\n');

  db.withTransactionSync(() => {
    db.runSync('INSERT OR IGNORE INTO user_profile (id,name,email,avatar_emoji,avatar_bg) VALUES (?,?,?,?,?)',
      ['me','Student','student@university.edu','🎓','#8B4513']);

    const C = 'INSERT INTO courses (id,name,icon,color,archived,created_at,updated_at) VALUES (?,?,?,?,0,?,?)';
    db.runSync(C, ['c1','Mathematics','📐','#8B4513',now-8e8,now-7200000]);
    db.runSync(C, ['c2','Physics',    '🔬','#2C5F8A',now-7e8,now-86400000]);
    db.runSync(C, ['c3','English Lit','📖','#4A7C59',now-6e8,now-172800000]);
    db.runSync(C, ['c4','Statistics', '📊','#6B4C8A',now-5e8,now-259200000]);

    const F = 'INSERT INTO course_files (id,course_id,name,uri,type,size,added_at) VALUES (?,?,?,?,?,?,?)';
    db.runSync(F, ['f1','c1','Calculus_Chapter7.pdf',    '','pdf', 2400000,now-172800000]);
    db.runSync(F, ['f2','c1','Lecture 7 Notes',          'n1','note',1200,now-7200000]);
    db.runSync(F, ['f3','c1','Integration Formulas.pptx','','pptx',5800000,now-432000000]);
    db.runSync(F, ['f4','c1','Problem Set 3.docx',       '','docx',450000,now-691200000]);
    db.runSync(F, ['f5','c2','Waves_Lab_Report.pdf',     '','pdf', 1800000,now-259200000]);
    db.runSync(F, ['f6','c3','Hamlet_Analysis.docx',     '','docx',320000,now-345600000]);

    const N = 'INSERT INTO notes (id,course_id,title,content,template,updated_at) VALUES (?,?,?,?,?,?)';
    db.runSync(N, ['n1','c1','Lecture 7 Notes',    NOTE_1,'lecture',now-7200000]);
    db.runSync(N, ['n2','c2','Wave Optics Summary', NOTE_2,'summary',now-86400000]);

    const T = 'INSERT INTO todos (id,course_id,title,done,deadline,priority,created_at) VALUES (?,?,?,?,?,?,?)';
    db.runSync(T, ['t1','c1','Complete Problem Set 3',     0,now+172800000,'high',  now-86400000]);
    db.runSync(T, ['t2','c1','Review integration by parts',0,now+432000000,'medium',now-86400000]);
    db.runSync(T, ['t3','c1','Read Chapter 6 summary',     1,now-172800000,'low',   now-259200000]);
    db.runSync(T, ['t4','c3','Write Hamlet essay draft',   0,now+345600000,'high',  now-172800000]);
    db.runSync(T, ['t5','c2','Finish lab report',          0,now+518400000,'medium',now-86400000]);
    db.runSync(T, ['t6','c4','Statistics Quiz 2 revision', 1,now-86400000, 'high',  now-432000000]);

    const SS = 'INSERT INTO study_sets (id,course_id,title,created_at) VALUES (?,?,?,?)';
    db.runSync(SS, ['ss1','c1','Exam Preparation Checklist',now-604800000]);
    db.runSync(SS, ['ss2','c1','Derivative Rules Mastery',  now-432000000]);

    const ST = 'INSERT INTO study_set_steps (id,set_id,label,done,position) VALUES (?,?,?,?,?)';
    db.runSync(ST, ['sp1','ss1','Read all lecture notes',     1,0]);
    db.runSync(ST, ['sp2','ss1','Complete past exam papers',  1,1]);
    db.runSync(ST, ['sp3','ss1','Review integration formulas',1,2]);
    db.runSync(ST, ['sp4','ss1','Practice problem set 3',     0,3]);
    db.runSync(ST, ['sp5','ss1','Group study session',        0,4]);
    db.runSync(ST, ['sp6','ss2','Power rule exercises',       1,0]);
    db.runSync(ST, ['sp7','ss2','Chain rule practice',        0,1]);
    db.runSync(ST, ['sp8','ss2','Product & quotient rules',   0,2]);
    db.runSync(ST, ['sp9','ss2','Mixed problems quiz',        0,3]);

    // Links removed per user request

    const G = 'INSERT INTO grades (id,course_id,label,score,max_score,weight,created_at) VALUES (?,?,?,?,?,?,?)';
    db.runSync(G, ['g1','c1','Midterm Exam', 78,100,0.4,now-1296000000]);
    db.runSync(G, ['g2','c1','Assignment 1', 92,100,0.2,now-864000000]);
    db.runSync(G, ['g3','c2','Lab Report 1', 85,100,0.3,now-604800000]);

    const E = 'INSERT INTO exams (id,course_id,title,date,location,notes,created_at) VALUES (?,?,?,?,?,?,?)';
    db.runSync(E, ['e1','c1','Calculus Final Exam',   now+1296000000,'Hall A, Room 201','Bring calculator',now-86400000]);
    db.runSync(E, ['e2','c2','Physics Midterm',       now+864000000, 'Science Block B', 'Open book',      now-86400000]);
    db.runSync(E, ['e3','c3','English Essay Deadline',now+432000000, 'Online Submission','',              now-86400000]);
  });
}

// Additional table setup for new features — runs safely on both new and existing installs
export function initNewTables(): void {
  const extras = [
    `CREATE TABLE IF NOT EXISTS sticky_notes (
      id TEXT PRIMARY KEY NOT NULL, content TEXT NOT NULL DEFAULT '',
      color TEXT NOT NULL DEFAULT '#FFF9C4', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS daily_intentions (
      id TEXT PRIMARY KEY NOT NULL, date TEXT NOT NULL UNIQUE,
      intention TEXT NOT NULL, mood TEXT NOT NULL DEFAULT 'good', created_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS gratitude_entries (
      id TEXT PRIMARY KEY NOT NULL, course_id TEXT NOT NULL,
      content TEXT NOT NULL, created_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS study_streak (
      id TEXT PRIMARY KEY NOT NULL DEFAULT 'streak',
      last_date TEXT NOT NULL DEFAULT '', current_streak INTEGER NOT NULL DEFAULT 0,
      longest_streak INTEGER NOT NULL DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS trash (
      id TEXT PRIMARY KEY NOT NULL, type TEXT NOT NULL, title TEXT NOT NULL,
      data TEXT NOT NULL, deleted_at INTEGER NOT NULL
    )`,
    `INSERT OR IGNORE INTO study_streak (id, last_date, current_streak, longest_streak) VALUES ('streak','',0,0)`,
  ];
  for (const sql of extras) {
    try { db.runSync(sql); } catch (_) {}
  }
}
