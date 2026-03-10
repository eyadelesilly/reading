import https from 'https';

const urls = [
  'https://covers.openlibrary.org/b/id/6796839-M.jpg',
  'https://covers.openlibrary.org/b/id/6509920-M.jpg',
  'https://covers.openlibrary.org/b/id/8063264-M.jpg',
  'https://covers.openlibrary.org/b/id/15125223-M.jpg'
];

urls.forEach(url => {
  https.get(url, (res) => {
    let size = 0;
    res.on('data', (chunk) => {
      size += chunk.length;
    });
    res.on('end', () => {
      console.log(`URL: ${url}, Status: ${res.statusCode}, Size: ${size}, Type: ${res.headers['content-type']}`);
    });
  });
});
