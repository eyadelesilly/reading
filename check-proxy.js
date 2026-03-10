import http from 'http';

const url = 'http://localhost:3000/api/image-proxy?url=' + encodeURIComponent('https://covers.openlibrary.org/b/id/6796839-M.jpg');
http.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(data);
  });
});
