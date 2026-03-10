import Database from 'better-sqlite3';

const db = new Database('school_reading_week.db');

const readings = db.prepare('SELECT id, title, coverImage FROM readings').all();
console.log(readings);
