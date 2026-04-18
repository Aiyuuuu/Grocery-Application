const fs = require('fs');
const lines = fs.readFileSync("/home/ayan/.config/Code/User/workspaceStorage/35198e0a4d8a51e3f86156f01a6daa5a/GitHub.copilot-chat/transcripts/12d27073-0aa5-490b-997c-6a24065d742f.jsonl", "utf8").split('\n');
const items = lines.filter(l => l.trim()).map(l => JSON.parse(l));
let text = '';
for (let i = 0; i < items.length; i++) {
  const item = items[i];
  if (item.type === 'response' && item.text && item.text.includes('const isSubUnit =')) {
    text += item.text;
  }
}
fs.writeFileSync('old_logic.txt', text);
