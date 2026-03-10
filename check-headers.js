import https from 'https';

const urls = [
  'https://covers.openlibrary.org/b/id/6796839-M.jpg',
  'https://covers.openlibrary.org/b/id/15125223-M.jpg'
];

urls.forEach(url => {
  https.get(url, (res) => {
    console.log(`URL: ${url}`);
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
  });
});
