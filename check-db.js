import Database from 'better-sqlite3';

const db = new Database('school_reading_week.db');

const characters = db.prepare('SELECT id, name, image FROM characters').all();
console.log(characters);
