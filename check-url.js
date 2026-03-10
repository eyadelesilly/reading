import https from 'https';

const url = 'https://covers.openlibrary.org/b/id/6509920-M.jpg';
https.get(url, (res) => {
  console.log(res.statusCode);
  console.log(res.headers.location);
});
