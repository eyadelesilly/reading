const titles = [
  'I Still Believe in Miracles',
  'Identity',
  'Do Not Reconcile',
  'Modern Arabic Poetry'
];

async function check() {
  for (const title of titles) {
    const searchUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(title)}&limit=1`;
    try {
      const res = await fetch(searchUrl);
      const data = await res.json();
      if (data.docs && data.docs.length > 0 && data.docs[0].cover_i) {
        console.log(`${title}: https://covers.openlibrary.org/b/id/${data.docs[0].cover_i}-L.jpg`);
      } else {
        console.log(`${title}: No cover found`);
      }
    } catch (e) {
      console.log(`${title}: Error`);
    }
  }
}
check();
