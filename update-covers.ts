import Database from 'better-sqlite3';

const db = new Database('school_reading_week.db');

// Ensure column exists
try {
  db.exec('ALTER TABLE readings ADD COLUMN coverImage TEXT;');
  console.log('Added coverImage column.');
} catch (e: any) {
  console.log('Column coverImage might already exist:', e.message);
}

async function fetchCoverImage(title: string): Promise<string | null> {
  try {
    const response = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}`);
    const data = await response.json() as any;
    if (data.docs && data.docs.length > 0) {
      const coverId = data.docs.find((doc: any) => doc.cover_i)?.cover_i;
      if (coverId) {
        return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`; // Reasonably sized
      }
    }
  } catch (error) {
    console.error(`Failed to fetch cover image for ${title}:`, error);
  }
  return null;
}

async function updateCovers() {
  const readings = db.prepare('SELECT id, title FROM readings').all() as { id: string, title: string }[];
  
  for (const reading of readings) {
    console.log(`Fetching cover for: ${reading.title}`);
    const coverUrl = await fetchCoverImage(reading.title);
    if (coverUrl) {
      db.prepare('UPDATE readings SET coverImage = ? WHERE id = ?').run(coverUrl, reading.id);
      console.log(`Updated ${reading.title} with ${coverUrl}`);
    } else {
      console.log(`No cover found for ${reading.title}`);
    }
    // Be nice to the API
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  console.log('Finished updating covers.');
}

updateCovers();
