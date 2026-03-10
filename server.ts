import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('school_reading_week.db');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS readings (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    gradeLevel TEXT,
    coverImage TEXT,
    isActive INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS characters (
    id TEXT PRIMARY KEY,
    readingId TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    image TEXT,
    FOREIGN KEY(readingId) REFERENCES readings(id)
  );

  CREATE TABLE IF NOT EXISTS values_table (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    weight REAL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    classId TEXT,
    name TEXT
  );

  CREATE TABLE IF NOT EXISTS rankings (
    id TEXT PRIMARY KEY,
    studentId TEXT NOT NULL,
    characterId TEXT NOT NULL,
    compositeScore REAL NOT NULL,
    submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(studentId) REFERENCES students(id),
    FOREIGN KEY(characterId) REFERENCES characters(id)
  );

  CREATE TABLE IF NOT EXISTS ranking_scores (
    id TEXT PRIMARY KEY,
    rankingId TEXT NOT NULL,
    valueId TEXT NOT NULL,
    score INTEGER NOT NULL,
    justification TEXT,
    FOREIGN KEY(rankingId) REFERENCES rankings(id),
    FOREIGN KEY(valueId) REFERENCES values_table(id)
  );

  CREATE TABLE IF NOT EXISTS student_achievements (
    id TEXT PRIMARY KEY,
    studentId TEXT NOT NULL,
    badgeId TEXT NOT NULL,
    earnedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(studentId) REFERENCES students(id),
    UNIQUE(studentId, badgeId)
  );
`);

// Insert default values if not exists
const valuesCount = db.prepare('SELECT COUNT(*) as count FROM values_table').get() as { count: number };
if (valuesCount.count === 0) {
  const insertValue = db.prepare('INSERT INTO values_table (id, name, description) VALUES (?, ?, ?)');
  insertValue.run('v1', 'Think Critically & Solve Problems', 'Analyzing information objectively and making reasoned judgments to overcome challenges.');
  insertValue.run('v2', 'Take Personal Responsibility', 'Being accountable for your actions, decisions, and their consequences.');
  insertValue.run('v3', 'Collaborate With Others', 'Working effectively and respectfully with diverse teams to achieve a common goal.');
  insertValue.run('v4', 'Act With Integrity', 'Being honest, ethical, and having strong moral principles in all situations.');
  insertValue.run('v5', 'Engage With the World Around Me', 'Being an active, informed, and responsible citizen in the local and global community.');
  insertValue.run('v6', 'Pursue My Passions & Purpose', 'Discovering and dedicating oneself to meaningful interests and goals.');
}

// Insert some mock data for readings and characters if empty
const readingsCount = db.prepare('SELECT COUNT(*) as count FROM readings').get() as { count: number };
if (readingsCount.count === 0) {
  const insertReading = db.prepare('INSERT INTO readings (id, title, description, gradeLevel, coverImage) VALUES (?, ?, ?, ?, ?)');
  insertReading.run('r1', 'The Land of Sad Oranges', 'A story about a family\'s journey into displacement.', '9-12', 'https://covers.openlibrary.org/b/id/6796839-M.jpg');
  insertReading.run('r2', 'Harry Potter and the Philosopher\'s Stone', 'A novel about a young wizard.', '6-8', 'https://covers.openlibrary.org/b/id/6509920-M.jpg');
  insertReading.run('r3', '"The Museum"', 'A story of a Sudanese student in Scotland.', '9-12', 'https://covers.openlibrary.org/b/id/8063264-M.jpg');
  insertReading.run('r4', 'Island Man', 'A poem about a man living between two worlds.', '9-12', 'https://covers.openlibrary.org/b/id/652142-M.jpg');
  insertReading.run('r5', 'The Émigrée', 'A poem about an exile\'s memory of her home city.', '9-12', 'https://covers.openlibrary.org/b/id/8157718-M.jpg');
  insertReading.run('r6', 'I Still Believe in Miracles', 'A story about moving beyond self-focus.', '9-12', 'https://covers.openlibrary.org/b/id/8282225-M.jpg');
  insertReading.run('r7', 'Identity', 'A poem about choosing to be authentic.', '9-12', 'https://covers.openlibrary.org/b/id/6717853-M.jpg');
  insertReading.run('r8', 'To Kill a Mockingbird', 'A novel about empathy and moral responsibility.', '9-12', 'https://covers.openlibrary.org/b/id/14351077-M.jpg');
  insertReading.run('r9', 'The Ones Who Walk Away from Omelas', 'A short story about a city whose happiness depends on suffering.', '11-12', 'https://covers.openlibrary.org/b/id/39784-M.jpg');
  insertReading.run('r10', 'The Veldt', 'A science fiction short story about an automated nursery.', '9-12', 'https://covers.openlibrary.org/b/id/9345484-M.jpg');
  insertReading.run('r11', 'The Hunger Games', 'A dystopian novel about resistance.', '9-12', 'https://covers.openlibrary.org/b/id/12646537-M.jpg');
  insertReading.run('r12', '"Do Not Reconcile"', 'A poem about refusing a polluted peace.', '11-12', 'https://covers.openlibrary.org/b/id/12964169-M.jpg');
  insertReading.run('r13', 'Mythos', 'A retelling of Greek myths.', '9-12', 'https://covers.openlibrary.org/b/id/8238803-M.jpg');
  insertReading.run('r14', 'The Return of the Spirit', 'A novel set during the 1919 revolution in Cairo.', '11-12', 'https://covers.openlibrary.org/b/id/4763508-M.jpg');
  insertReading.run('r15', 'Animal Farm', 'An allegorical novella about a rebellion.', '9-12', 'https://covers.openlibrary.org/b/id/11261770-M.jpg');
  insertReading.run('r16', 'The American Embassy', 'A story about a mother\'s grief and a visa interview.', '11-12', 'https://covers.openlibrary.org/b/id/11320253-M.jpg');
  insertReading.run('r17', 'The Baghdad Clock', 'A novel about memory and friendship as war approaches.', '11-12', 'https://covers.openlibrary.org/b/id/15125223-M.jpg');

  const insertCharacter = db.prepare('INSERT INTO characters (id, readingId, name, description, image) VALUES (?, ?, ?, ?, ?)');
  
  // The Land of Sad Oranges
  insertCharacter.run('c1', 'r1', 'The Narrator', 'A young child experiencing the 1948 Nakba who observes his family\'s journey into displacement.', 'https://covers.openlibrary.org/b/id/6796839-M.jpg');
  insertCharacter.run('c2', 'r1', 'The Father', 'A man overwhelmed by the loss of his orange groves and dignity, eventually driven to despair.', 'https://covers.openlibrary.org/b/id/6796839-M.jpg');
  insertCharacter.run('c3', 'r1', 'Riyad', 'The narrator\'s brother who sits quietly on the roof of the lorry during the evacuation.', 'https://covers.openlibrary.org/b/id/6796839-M.jpg');

  // Harry Potter
  insertCharacter.run('c4', 'r2', 'Harry Potter', 'A student who demonstrates agency by asking the Sorting Hat not to place him in Slytherin.', 'https://covers.openlibrary.org/b/id/6509920-M.jpg');
  insertCharacter.run('c5', 'r2', 'Ron Weasley', 'Harry\'s friend who is sorted into Gryffindor after appearing "pale green" with nerves.', 'https://covers.openlibrary.org/b/id/6509920-M.jpg');
  insertCharacter.run('c6', 'r2', 'Professor McGonagall', 'The stern, black-haired witch who leads the first-years into the Great Hall for sorting.', 'https://covers.openlibrary.org/b/id/6509920-M.jpg');

  // The Museum
  insertCharacter.run('c7', 'r3', 'Shadia', 'A Sudanese student in Scotland struggling with culture shock and isolation.', 'https://covers.openlibrary.org/b/id/8063264-M.jpg');
  insertCharacter.run('c8', 'r3', 'Bryan', 'A Scottish student with an earring and long hair who offers Shadia his academic notes.', 'https://covers.openlibrary.org/b/id/8063264-M.jpg');
  insertCharacter.run('c9', 'r3', 'Asafa', 'A wise, older Ethiopian student who helps Shadia navigate the Scottish university system.', 'https://covers.openlibrary.org/b/id/8063264-M.jpg');

  // Island Man
  insertCharacter.run('c10', 'r4', 'Island Man', 'A man living in London who wakes up with the "sound of blue surf in his head," living between two worlds.', 'https://covers.openlibrary.org/b/id/652142-M.jpg');

  // The Émigrée
  insertCharacter.run('c11', 'r5', 'The Speaker', 'An exile who maintains a "sunlight-clear" memory of her unreachable home city despite news of war.', 'https://covers.openlibrary.org/b/id/8157718-M.jpg');

  // I Still Believe in Miracles
  insertCharacter.run('c12', 'r6', 'The Narrator', 'A person struggling with the internal battle to move beyond self-focus to act with kindness.', 'https://covers.openlibrary.org/b/id/8282225-M.jpg');

  // Identity
  insertCharacter.run('c13', 'r7', 'The "Tall, Ugly Weed"', 'A personified metaphor representing the choice to be authentic and free rather than a "pleasant-smelling flower" in a pot.', 'https://covers.openlibrary.org/b/id/6717853-M.jpg');

  // To Kill a Mockingbird
  insertCharacter.run('c14', 'r8', 'Scout Finch', 'The young narrator who is taught by her father to see the world from another person\'s point of view.', 'https://covers.openlibrary.org/b/id/14351077-M.jpg');
  insertCharacter.run('c15', 'r8', 'Atticus Finch', 'A lawyer and father who frames empathy as a moral responsibility to "climb into someone\'s skin".', 'https://covers.openlibrary.org/b/id/14351077-M.jpg');
  insertCharacter.run('c16', 'r8', 'Walter Cunningham', 'A schoolmate from a poor family who demonstrates the "unseen" struggles of others to Scout.', 'https://covers.openlibrary.org/b/id/14351077-M.jpg');

  // The Ones Who Walk Away from Omelas
  insertCharacter.run('c17', 'r9', 'The Child', 'A "feeble-minded" child kept in a dark basement whose misery is the price of the city\'s happiness.', 'https://covers.openlibrary.org/b/id/39784-M.jpg');
  insertCharacter.run('c18', 'r9', 'The Flute-player', 'A child playing music whose talent is made possible by the collective knowledge of the suffering child.', 'https://covers.openlibrary.org/b/id/39784-M.jpg');
  insertCharacter.run('c19', 'r9', 'The Ones Who Walk Away', 'Citizens who choose to leave the "perfect" city alone because they cannot accept happiness built on suffering.', 'https://covers.openlibrary.org/b/id/39784-M.jpg');

  // The Veldt
  insertCharacter.run('c20', 'r10', 'George Hadley', 'A father who becomes concerned when his children\'s automated nursery begins to feel "too real".', 'https://covers.openlibrary.org/b/id/9345484-M.jpg');
  insertCharacter.run('c21', 'r10', 'Lydia Hadley', 'A mother who feels unnecessary and replaced by the automated "Happylife Home".', 'https://covers.openlibrary.org/b/id/9345484-M.jpg');
  insertCharacter.run('c22', 'r10', 'Wendy and Peter', 'Children who become dangerously attached to a fictional African veldt and turn against their parents.', 'https://covers.openlibrary.org/b/id/9345484-M.jpg');

  // The Hunger Games
  insertCharacter.run('c23', 'r11', 'Katniss Everdeen', 'A protagonist who uses a symbolic act of care—decorating a body with flowers—as resistance against the Capitol.', 'https://covers.openlibrary.org/b/id/12646537-M.jpg');
  insertCharacter.run('c24', 'r11', 'Rue', 'A young tribute from District 11 whose death becomes a catalyst for unity and rebellion.', 'https://covers.openlibrary.org/b/id/12646537-M.jpg');

  // "Do Not Reconcile"
  insertCharacter.run('c25', 'r12', 'The Dying Warrior', 'The speaker of the poem who urges his brother to refuse a "polluted peace" at the cost of dignity.', 'https://covers.openlibrary.org/b/id/12964169-M.jpg');
  insertCharacter.run('c26', 'r12', 'Al-Yamama', 'The speaker\'s niece, a child who sits silent in the ashes of her burned home.', 'https://covers.openlibrary.org/b/id/12964169-M.jpg');

  // Mythos
  insertCharacter.run('c27', 'r13', 'Prometheus', 'A Titan who fashions humans from clay and defies Zeus to give them the "divine fire" of consciousness.', 'https://covers.openlibrary.org/b/id/8238803-M.jpg');
  insertCharacter.run('c28', 'r13', 'Zeus', 'The King of the Gods who views humanity as "pets" and forbids them from having fire.', 'https://covers.openlibrary.org/b/id/8238803-M.jpg');

  // The Return of the Spirit
  insertCharacter.run('c29', 'r14', 'Mohsen', 'A sensitive teenage boy living with his extended family in Cairo during the 1919 revolution.', 'https://covers.openlibrary.org/b/id/4763508-M.jpg');
  insertCharacter.run('c30', 'r14', 'Zanouba', 'A middle-aged woman who manages the household and turns to superstition to cope with powerlessness.', 'https://covers.openlibrary.org/b/id/4763508-M.jpg');

  // Animal Farm
  insertCharacter.run('c31', 'r15', 'Snowball', 'A vivacious pig who helps lead the rebellion and writes the "Seven Commandments".', 'https://covers.openlibrary.org/b/id/11261770-M.jpg');
  insertCharacter.run('c32', 'r15', 'Napoleon', 'A fierce-looking boar who helps lead the animals but has a reputation for getting his own way.', 'https://covers.openlibrary.org/b/id/11261770-M.jpg');

  // The American Embassy
  insertCharacter.run('c33', 'r16', 'The Narrator', 'A mother who refuses to "perform" her grief to satisfy a bureaucratic visa interviewer.', 'https://covers.openlibrary.org/b/id/11320253-M.jpg');

  // The Baghdad Clock
  insertCharacter.run('c34', 'r17', 'The Narrator', 'A girl who uses memory and friendship to maintain her identity as war approaches her neighborhood.', 'https://covers.openlibrary.org/b/id/15125223-M.jpg');
  insertCharacter.run('c35', 'r17', 'Nadia', 'The narrator\'s close friend who experiences troubling dreams that reflect the community\'s shared fear.', 'https://covers.openlibrary.org/b/id/15125223-M.jpg');
}


async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  app.get('/api/image-proxy', async (req, res) => {
    const imageUrl = req.query.url as string;
    if (!imageUrl) {
      return res.status(400).send('Missing url parameter');
    }
    try {
      const response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      if (!response.ok) {
        return res.status(response.status).send('Failed to fetch image');
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      res.set('Content-Type', response.headers.get('content-type') || 'image/jpeg');
      res.set('Cache-Control', 'public, max-age=86400');
      res.send(buffer);
    } catch (error) {
      console.error('Image proxy error:', error);
      res.status(500).send('Failed to proxy image');
    }
  });

  app.get('/api/readings', (req, res) => {
    try {
      const readings = db.prepare('SELECT * FROM readings WHERE isActive = 1').all();
      res.json(readings);
    } catch (error) {
      console.error('Error fetching readings:', error);
      res.status(500).json({ error: 'Failed to fetch readings' });
    }
  });

  app.get('/api/readings/:id', (req, res) => {
    try {
      const reading = db.prepare('SELECT * FROM readings WHERE id = ?').get(req.params.id);
      if (reading) {
        res.json(reading);
      } else {
        res.status(404).json({ error: 'Reading not found' });
      }
    } catch (error) {
      console.error('Error fetching reading:', error);
      res.status(500).json({ error: 'Failed to fetch reading' });
    }
  });

  app.get('/api/readings/:id/characters', (req, res) => {
    try {
      const characters = db.prepare('SELECT * FROM characters WHERE readingId = ?').all(req.params.id);
      res.json(characters);
    } catch (error) {
      console.error('Error fetching characters:', error);
      res.status(500).json({ error: 'Failed to fetch characters' });
    }
  });

  app.get('/api/values', (req, res) => {
    try {
      const values = db.prepare('SELECT * FROM values_table').all();
      res.json(values);
    } catch (error) {
      console.error('Error fetching values:', error);
      res.status(500).json({ error: 'Failed to fetch values' });
    }
  });

  app.post('/api/students/login', (req, res) => {
    try {
      const { classId, name } = req.body;
      const id = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const insert = db.prepare('INSERT INTO students (id, classId, name) VALUES (?, ?, ?)');
      insert.run(id, classId, name || 'Anonymous');
      
      res.json({ id, classId, name: name || 'Anonymous' });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/rankings', (req, res) => {
    const { studentId, characterId, scores } = req.body;
    // scores is an array of { valueId, score, justification }
    
    if (!studentId || !characterId || !scores || !Array.isArray(scores)) {
      return res.status(400).json({ error: 'Invalid ranking data' });
    }

    const rankingId = `ranking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let compositeScore = 0;
    
    const insertRanking = db.prepare('INSERT INTO rankings (id, studentId, characterId, compositeScore) VALUES (?, ?, ?, ?)');
    const insertScore = db.prepare('INSERT INTO ranking_scores (id, rankingId, valueId, score, justification) VALUES (?, ?, ?, ?, ?)');
    
    const transaction = db.transaction(() => {
      for (const s of scores) {
        compositeScore += s.score;
      }
      insertRanking.run(rankingId, studentId, characterId, compositeScore);
      
      for (const s of scores) {
        const scoreId = `score_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        insertScore.run(scoreId, rankingId, s.valueId, s.score, s.justification || null);
      }

      // Check achievements
      const earnedBadges: string[] = [];
      const insertAchievement = db.prepare('INSERT OR IGNORE INTO student_achievements (id, studentId, badgeId) VALUES (?, ?, ?)');
      
      // 1. Thoughtful Evaluator
      const hasDetailedJustification = scores.some((s: any) => s.justification && s.justification.length > 50);
      if (hasDetailedJustification) {
        const res = insertAchievement.run(`ach_${Date.now()}_te`, studentId, 'thoughtful_evaluator');
        if (res.changes > 0) earnedBadges.push('thoughtful_evaluator');
      }
      
      // 2. Value Master
      const valueCounts = db.prepare(`
        SELECT rs.valueId, COUNT(DISTINCT r.characterId) as charCount
        FROM ranking_scores rs
        JOIN rankings r ON rs.rankingId = r.id
        WHERE r.studentId = ? AND rs.score = 5
        GROUP BY rs.valueId
        HAVING charCount >= 3
      `).all(studentId) as any[];
      
      if (valueCounts.length > 0) {
        const res = insertAchievement.run(`ach_${Date.now()}_vm`, studentId, 'value_master');
        if (res.changes > 0) earnedBadges.push('value_master');
      }
      
      // 3. Early Bird
      const deadline = new Date('2026-03-10T00:00:00Z');
      if (new Date() < deadline) {
        const res = insertAchievement.run(`ach_${Date.now()}_eb`, studentId, 'early_bird');
        if (res.changes > 0) earnedBadges.push('early_bird');
      }
      
      return earnedBadges;
    });

    try {
      const earnedBadges = transaction();
      res.json({ success: true, rankingId, compositeScore, earnedBadges });
    } catch (error) {
      console.error('Error saving ranking:', error);
      res.status(500).json({ error: 'Failed to save ranking' });
    }
  });

  app.get('/api/students/:id/achievements', (req, res) => {
    const studentId = req.params.id;
    const achievements = db.prepare('SELECT * FROM student_achievements WHERE studentId = ?').all(studentId);
    res.json(achievements);
  });

  app.get('/api/analytics/readings/:id', (req, res) => {
    const readingId = req.params.id;
    
    // Get all characters for this reading
    const characters = db.prepare('SELECT * FROM characters WHERE readingId = ?').all(readingId) as any[];
    
    // Get all values
    const values = db.prepare('SELECT * FROM values_table').all() as any[];
    
    const analytics = characters.map(char => {
      // Get average composite score
      const avgComposite = db.prepare('SELECT AVG(compositeScore) as avg FROM rankings WHERE characterId = ?').get(char.id) as { avg: number };
      
      // Get average per value
      const valueScores = values.map(val => {
        const avgScore = db.prepare(`
          SELECT AVG(rs.score) as avg 
          FROM ranking_scores rs 
          JOIN rankings r ON rs.rankingId = r.id 
          WHERE r.characterId = ? AND rs.valueId = ?
        `).get(char.id, val.id) as { avg: number };
        
        return {
          valueId: val.id,
          valueName: val.name,
          averageScore: avgScore.avg || 0
        };
      });
      
      return {
        ...char,
        averageCompositeScore: avgComposite.avg || 0,
        valueScores
      };
    });
    
    // Sort by composite score descending
    analytics.sort((a, b) => b.averageCompositeScore - a.averageCompositeScore);
    
    res.json(analytics);
  });

  app.get('/api/analytics/leaderboard', (req, res) => {
    // Get all characters
    const characters = db.prepare('SELECT c.*, r.title as readingTitle FROM characters c JOIN readings r ON c.readingId = r.id').all() as any[];
    
    // Get all values
    const values = db.prepare('SELECT * FROM values_table').all() as any[];
    
    const analytics = characters.map(char => {
      // Get average composite score
      const avgComposite = db.prepare('SELECT AVG(compositeScore) as avg FROM rankings WHERE characterId = ?').get(char.id) as { avg: number };
      
      // Get average per value
      const valueScores = values.map(val => {
        const avgScore = db.prepare(`
          SELECT AVG(rs.score) as avg 
          FROM ranking_scores rs 
          JOIN rankings r ON rs.rankingId = r.id 
          WHERE r.characterId = ? AND rs.valueId = ?
        `).get(char.id, val.id) as { avg: number };
        
        return {
          valueId: val.id,
          valueName: val.name,
          averageScore: avgScore.avg || 0
        };
      });
      
      return {
        ...char,
        averageCompositeScore: avgComposite.avg || 0,
        valueScores
      };
    });
    
    // Sort by composite score descending
    analytics.sort((a, b) => b.averageCompositeScore - a.averageCompositeScore);
    
    res.json(analytics);
  });

  // Admin endpoints
  app.post('/api/readings', async (req, res) => {
    let { title, description, gradeLevel, coverImage } = req.body;
    
    if (!coverImage) {
      try {
        const response = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}`);
        const data = await response.json() as any;
        if (data.docs && data.docs.length > 0) {
          const coverId = data.docs.find((doc: any) => doc.cover_i)?.cover_i;
          if (coverId) {
            coverImage = `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
          }
        }
      } catch (error) {
        console.error('Failed to fetch cover image:', error);
      }
    }

    const id = `reading_${Date.now()}`;
    const insert = db.prepare('INSERT INTO readings (id, title, description, gradeLevel, coverImage) VALUES (?, ?, ?, ?, ?)');
    insert.run(id, title, description, gradeLevel, coverImage || null);
    res.json({ id, title, description, gradeLevel, coverImage });
  });

  app.put('/api/readings/:id', async (req, res) => {
    let { title, description, gradeLevel, coverImage } = req.body;

    if (!coverImage) {
      try {
        const response = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}`);
        const data = await response.json() as any;
        if (data.docs && data.docs.length > 0) {
          const coverId = data.docs.find((doc: any) => doc.cover_i)?.cover_i;
          if (coverId) {
            coverImage = `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
          }
        }
      } catch (error) {
        console.error('Failed to fetch cover image:', error);
      }
    }

    const update = db.prepare('UPDATE readings SET title = ?, description = ?, gradeLevel = ?, coverImage = ? WHERE id = ?');
    update.run(title, description, gradeLevel, coverImage || null, req.params.id);
    res.json({ id: req.params.id, title, description, gradeLevel, coverImage });
  });

  app.delete('/api/readings/:id', (req, res) => {
    db.prepare('DELETE FROM readings WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.post('/api/readings/:id/characters', (req, res) => {
    const { name, description, image } = req.body;
    const id = `char_${Date.now()}`;
    const insert = db.prepare('INSERT INTO characters (id, readingId, name, description, image) VALUES (?, ?, ?, ?, ?)');
    insert.run(id, req.params.id, name, description, image);
    res.json({ id, readingId: req.params.id, name, description, image });
  });

  app.put('/api/characters/:id', (req, res) => {
    const { name, description, image } = req.body;
    const update = db.prepare('UPDATE characters SET name = ?, description = ?, image = ? WHERE id = ?');
    update.run(name, description, image, req.params.id);
    res.json({ id: req.params.id, name, description, image });
  });

  app.delete('/api/characters/:id', (req, res) => {
    db.prepare('DELETE FROM characters WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.put('/api/values/:id', (req, res) => {
    const { name, description } = req.body;
    const update = db.prepare('UPDATE values_table SET name = ?, description = ? WHERE id = ?');
    update.run(name, description, req.params.id);
    res.json({ id: req.params.id, name, description });
  });

  // Global API error handler
  app.use('/api', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('API Error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
