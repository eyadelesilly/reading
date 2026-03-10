import Database from 'better-sqlite3';

const db = new Database('school_reading_week.db');

const updateReadings = db.prepare("UPDATE readings SET coverImage = REPLACE(coverImage, '-L.jpg', '-M.jpg')");
updateReadings.run();

const updateCharacters = db.prepare("UPDATE characters SET image = REPLACE(image, '-L.jpg', '-M.jpg')");
updateCharacters.run();

console.log('Database updated successfully!');
