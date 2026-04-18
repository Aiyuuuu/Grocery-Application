const fs = require('fs');
const transcript = fs.readFileSync("/home/ayan/.config/Code/User/workspaceStorage/35198e0a4d8a51e3f86156f01a6daa5a/GitHub.copilot-chat/transcripts/12d27073-0aa5-490b-997c-6a24065d742f.jsonl", "utf8");
const lines = transcript.split('\n');
for (let i = Math.max(0, lines.length - 200); i < lines.length; i++) {
  if (lines[i].includes('ProductCard') || lines[i].includes('ProductDetailsPage')) {
    // console.log(lines[i].substring(0, 500));
  }
}
