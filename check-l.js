import https from 'https';

const url = 'https://covers.openlibrary.org/b/id/15125223-L.jpg';
https.get(url, (res) => {
  console.log(res.statusCode);
});
