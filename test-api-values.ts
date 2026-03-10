import fetch from 'node-fetch';
fetch('http://localhost:3000/api/values')
  .then(res => res.text())
  .then(text => console.log('Response:', text))
  .catch(err => console.error('Error:', err));
