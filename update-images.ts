import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf-8');

// Replace cover images
content = content.replace(/https:\/\/picsum\.photos\/seed\/[^/]+\/400\/600/g, (match) => {
  // We need to extract the title from the same line to make a good prompt.
  // Actually, it's easier to just use a regex that captures the title.
  return match;
});

// Let's do it with a more specific regex
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('insertReading.run(')) {
    const match = lines[i].match(/insertReading\.run\('[^']+', '([^']+)'/);
    if (match) {
      const title = match[1];
      const encodedPrompt = encodeURIComponent(`${title} book cover design`);
      lines[i] = lines[i].replace(/https:\/\/picsum\.photos\/seed\/[^/]+\/400\/600/, `https://image.pollinations.ai/prompt/${encodedPrompt}?width=400&height=600&nologo=true`);
    }
  } else if (lines[i].includes('insertCharacter.run(')) {
    const match = lines[i].match(/insertCharacter\.run\('[^']+', '[^']+', '([^']+)'/);
    if (match) {
      const name = match[1];
      const encodedPrompt = encodeURIComponent(`${name} character portrait`);
      lines[i] = lines[i].replace(/https:\/\/picsum\.photos\/seed\/[^/]+\/200\/200/, `https://image.pollinations.ai/prompt/${encodedPrompt}?width=200&height=200&nologo=true`);
    }
  }
}

fs.writeFileSync('server.ts', lines.join('\n'));
console.log('Done replacing images in server.ts');
