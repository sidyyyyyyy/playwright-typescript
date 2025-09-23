#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Common emoji patterns found in the codebase
const emojiPatterns = [
  // Common emojis used in console.log statements
  /🎯/g, /📝/g, /🔐/g, /🏥/g, /✅/g, /❌/g, /⚠️/g, /🔄/g, /📊/g, /👤/g, /📥/g, /🎉/g, /🚀/g, /💡/g, /🔧/g, /⌨️/g, /📋/g, /📁/g, /🚨/g,
  // Additional emojis
  /🎪/g, /🎨/g, /🎭/g, /🎪/g, /🎯/g, /🎲/g, /🎳/g, /🎴/g, /🎵/g, /🎶/g, /🎸/g, /🎹/g, /🎺/g, /🎻/g, /🎼/g, /🎽/g, /🎾/g, /🎿/g, /🏀/g, /🏁/g, /🏂/g, /🏃/g, /🏄/g, /🏅/g, /🏆/g, /🏇/g, /🏈/g, /🏉/g, /🏊/g, /🏋/g, /🏌/g, /🏍/g, /🏎/g, /🏏/g, /🏐/g, /🏑/g, /🏒/g, /🏓/g, /🏔/g, /🏕/g, /🏖/g, /🏗/g, /🏘/g, /🏙/g, /🏚/g, /🏛/g, /🏜/g, /🏝/g, /🏞/g, /🏟/g, /🏠/g, /🏡/g, /🏢/g, /🏣/g, /🏤/g, /🏥/g, /🏦/g, /🏧/g, /🏨/g, /🏩/g, /🏪/g, /🏫/g, /🏬/g, /🏭/g, /🏮/g, /🏯/g, /🏰/g, /🏱/g, /🏲/g, /🏳/g, /🏴/g, /🏵/g, /🏶/g, /🏷/g, /🏸/g, /🏹/g, /🏺/g, /🏻/g, /🏼/g, /🏽/g, /🏾/g, /🏿/g,
  // More emojis
  /🐀/g, /🐁/g, /🐂/g, /🐃/g, /🐄/g, /🐅/g, /🐆/g, /🐇/g, /🐈/g, /🐉/g, /🐊/g, /🐋/g, /🐌/g, /🐍/g, /🐎/g, /🐏/g, /🐐/g, /🐑/g, /🐒/g, /🐓/g, /🐔/g, /🐕/g, /🐖/g, /🐗/g, /🐘/g, /🐙/g, /🐚/g, /🐛/g, /🐜/g, /🐝/g, /🐞/g, /🐟/g, /🐠/g, /🐡/g, /🐢/g, /🐣/g, /🐤/g, /🐥/g, /🐦/g, /🐧/g, /🐨/g, /🐩/g, /🐪/g, /🐫/g, /🐬/g, /🐭/g, /🐮/g, /🐯/g, /🐰/g, /🐱/g, /🐲/g, /🐳/g, /🐴/g, /🐵/g, /🐶/g, /🐷/g, /🐸/g, /🐹/g, /🐺/g, /🐻/g, /🐼/g, /🐽/g, /🐾/g, /🐿/g, /👀/g, /👁/g, /👂/g, /👃/g, /👄/g, /👅/g, /👆/g, /👇/g, /👈/g, /👉/g, /👊/g, /👋/g, /👌/g, /👍/g, /👎/g, /👏/g, /👐/g, /👑/g, /👒/g, /👓/g, /👔/g, /👕/g, /👖/g, /👗/g, /👘/g, /👙/g, /👚/g, /👛/g, /👜/g, /👝/g, /👞/g, /👟/g, /👠/g, /👡/g, /👢/g, /👣/g, /👤/g, /👥/g, /👦/g, /👧/g, /👨/g, /👩/g, /👪/g, /👫/g, /👬/g, /👭/g, /👮/g, /👯/g, /👰/g, /👱/g, /👲/g, /👳/g, /👴/g, /👵/g, /👶/g, /👷/g, /👸/g, /👹/g, /👺/g, /👻/g, /👼/g, /👽/g, /👾/g, /👿/g, /💀/g, /💁/g, /💂/g, /💃/g, /💄/g, /💅/g, /💆/g, /💇/g, /💈/g, /💉/g, /💊/g, /💋/g, /💌/g, /💍/g, /💎/g, /💏/g, /💐/g, /💑/g, /💒/g, /💓/g, /💔/g, /💕/g, /💖/g, /💗/g, /💘/g, /💙/g, /💚/g, /💛/g, /💜/g, /💝/g, /💞/g, /💟/g, /💠/g, /💡/g, /💢/g, /💣/g, /💤/g, /💥/g, /💦/g, /💧/g, /💨/g, /💩/g, /💪/g, /💫/g, /💬/g, /💭/g, /💮/g, /💯/g, /💰/g, /💱/g, /💲/g, /💳/g, /💴/g, /💵/g, /💶/g, /💷/g, /💸/g, /💹/g, /💺/g, /💻/g, /💼/g, /💽/g, /💾/g, /💿/g, /📀/g, /📁/g, /📂/g, /📃/g, /📄/g, /📅/g, /📆/g, /📇/g, /📈/g, /📉/g, /📊/g, /📋/g, /📌/g, /📍/g, /📎/g, /📏/g, /📐/g, /📑/g, /📒/g, /📓/g, /📔/g, /📕/g, /📖/g, /📗/g, /📘/g, /📙/g, /📚/g, /📛/g, /📜/g, /📝/g, /📞/g, /📟/g, /📠/g, /📡/g, /📢/g, /📣/g, /📤/g, /📥/g, /📦/g, /📧/g, /📨/g, /📩/g, /📪/g, /📫/g, /📬/g, /📭/g, /📮/g, /📯/g, /📰/g, /📱/g, /📲/g, /📳/g, /📴/g, /📵/g, /📶/g, /📷/g, /📸/g, /📹/g, /📺/g, /📻/g, /📼/g, /📽/g, /📾/g, /📿/g, /🔀/g, /🔁/g, /🔂/g, /🔃/g, /🔄/g, /🔅/g, /🔆/g, /🔇/g, /🔈/g, /🔉/g, /🔊/g, /🔋/g, /🔌/g, /🔍/g, /🔎/g, /🔏/g, /🔐/g, /🔑/g, /🔒/g, /🔓/g, /🔔/g, /🔕/g, /🔖/g, /🔗/g, /🔘/g, /🔙/g, /🔚/g, /🔛/g, /🔜/g, /🔝/g, /🔞/g, /🔟/g, /🔠/g, /🔡/g, /🔢/g, /🔣/g, /🔤/g, /🔥/g, /🔦/g, /🔧/g, /🔨/g, /🔩/g, /🔪/g, /🔫/g, /🔬/g, /🔭/g, /🔮/g, /🔯/g, /🔰/g, /🔱/g, /🔲/g, /🔳/g, /🔴/g, /🔵/g, /🔶/g, /🔷/g, /🔸/g, /🔹/g, /🔺/g, /🔻/g, /🔼/g, /🔽/g, /🕐/g, /🕑/g, /🕒/g, /🕓/g, /🕔/g, /🕕/g, /🕖/g, /🕗/g, /🕘/g, /🕙/g, /🕚/g, /🕛/g, /🕜/g, /🕝/g, /🕞/g, /🕟/g, /🕠/g, /🕡/g, /🕢/g, /🕣/g, /🕤/g, /🕥/g, /🕦/g, /🕧/g, /🕯/g, /🕰/g, /🕱/g, /🕲/g, /🕳/g, /🕴/g, /🕵/g, /🕶/g, /🕷/g, /🕸/g, /🕹/g, /🕺/g, /🖀/g, /🖁/g, /🖂/g, /🖃/g, /🖄/g, /🖅/g, /🖆/g, /🖇/g, /🖈/g, /🖉/g, /🖊/g, /🖋/g, /🖌/g, /🖍/g, /🖎/g, /🖏/g, /🖐/g, /🖑/g, /🖒/g, /🖓/g, /🖔/g, /🖕/g, /🖖/g, /🖗/g, /🖘/g, /🖙/g, /🖚/g, /🖛/g, /🖜/g, /🖝/g, /🖞/g, /🖟/g, /🖠/g, /🖡/g, /🖢/g, /🖣/g, /🖤/g, /🖥/g, /🖦/g, /🖧/g, /🖨/g, /🖩/g, /🖪/g, /🖫/g, /🖬/g, /🖭/g, /🖮/g, /🖯/g, /🖰/g, /🖱/g, /🖲/g, /🖳/g, /🖴/g, /🖵/g, /🖶/g, /🖷/g, /🖸/g, /🖹/g, /🖺/g, /🖻/g, /🖼/g, /🖽/g, /🖾/g, /🖿/g, /🗀/g, /🗁/g, /🗂/g, /🗃/g, /🗄/g, /🗅/g, /🗆/g, /🗇/g, /🗈/g, /🗉/g, /🗊/g, /🗋/g, /🗌/g, /🗍/g, /🗎/g, /🗏/g, /🗐/g, /🗑/g, /🗒/g, /🗓/g, /🗔/g, /🗕/g, /🗖/g, /🗗/g, /🗘/g, /🗙/g, /🗚/g, /🗛/g, /🗜/g, /🗝/g, /🗞/g, /🗟/g, /🗠/g, /🗡/g, /🗢/g, /🗣/g, /🗤/g, /🗥/g, /🗦/g, /🗧/g, /🗨/g, /🗩/g, /🗪/g, /🗫/g, /🗬/g, /🗭/g, /🗮/g, /🗯/g, /🗰/g, /🗱/g, /🗲/g, /🗳/g, /🗴/g, /🗵/g, /🗶/g, /🗷/g, /🗸/g, /🗹/g, /🗺/g, /🗻/g, /🗼/g, /🗽/g, /🗾/g, /🗿/g,
  // Additional common emojis
  /⚡/g, /⚪/g, /⚫/g, /⚰/g, /⚱/g, /⚽/g, /⚾/g, /⛄/g, /⛅/g, /⛈/g, /⛎/g, /⛏/g, /⛑/g, /⛓/g, /⛔/g, /⛩/g, /⛪/g, /⛰/g, /⛱/g, /⛲/g, /⛳/g, /⛴/g, /⛵/g, /⛷/g, /⛸/g, /⛹/g, /⛺/g, /⛻/g, /⛼/g, /⛽/g, /⛾/g, /⛿/g, /✂/g, /✅/g, /✈/g, /✉/g, /✊/g, /✋/g, /✌/g, /✍/g, /✎/g, /✏/g, /✐/g, /✑/g, /✒/g, /✓/g, /✔/g, /✕/g, /✖/g, /✗/g, /✘/g, /✙/g, /✚/g, /✛/g, /✜/g, /✝/g, /✞/g, /✟/g, /✠/g, /✡/g, /✢/g, /✣/g, /✤/g, /✥/g, /✦/g, /✧/g, /✨/g, /✩/g, /✪/g, /✫/g, /✬/g, /✭/g, /✮/g, /✯/g, /✰/g, /✱/g, /✲/g, /✳/g, /✴/g, /✵/g, /✶/g, /✷/g, /✸/g, /✹/g, /✺/g, /✻/g, /✼/g, /✽/g, /✾/g, /✿/g, /❀/g, /❁/g, /❂/g, /❃/g, /❄/g, /❅/g, /❆/g, /❇/g, /❈/g, /❉/g, /❊/g, /❋/g, /❌/g, /❍/g, /❎/g, /❏/g, /❐/g, /❑/g, /❒/g, /❓/g, /❔/g, /❕/g, /❖/g, /❗/g, /❘/g, /❙/g, /❚/g, /❛/g, /❜/g, /❝/g, /❞/g, /❟/g, /❠/g, /❡/g, /❢/g, /❣/g, /❤/g, /❥/g, /❦/g, /❧/g, /❨/g, /❩/g, /❪/g, /❫/g, /❬/g, /❭/g, /❮/g, /❯/g, /❰/g, /❱/g, /❲/g, /❳/g, /❴/g, /❵/g, /❶/g, /❷/g, /❸/g, /❹/g, /❺/g, /❻/g, /❼/g, /❽/g, /❾/g, /❿/g, /➀/g, /➁/g, /➂/g, /➃/g, /➄/g, /➅/g, /➆/g, /➇/g, /➈/g, /➉/g, /➊/g, /➋/g, /➌/g, /➍/g, /➎/g, /➏/g, /➐/g, /➑/g, /➒/g, /➓/g, /➔/g, /➕/g, /➖/g, /➗/g, /➘/g, /➙/g, /➚/g, /➛/g, /➜/g, /➝/g, /➞/g, /➟/g, /➠/g, /➡/g, /➢/g, /➣/g, /➤/g, /➥/g, /➦/g, /➧/g, /➨/g, /➩/g, /➪/g, /➫/g, /➬/g, /➭/g, /➮/g, /➯/g, /➰/g, /➱/g, /➲/g, /➳/g, /➴/g, /➵/g, /➶/g, /➷/g, /➸/g, /➹/g, /➺/g, /➻/g, /➼/g, /➽/g, /➾/g, /➿/g
];

// Function to remove emojis from text
function removeEmojis(text) {
  let cleanedText = text;
  emojiPatterns.forEach(pattern => {
    cleanedText = cleanedText.replace(pattern, '');
  });
  
  // Remove extra spaces that might be left after emoji removal
  cleanedText = cleanedText.replace(/\s+/g, ' ').trim();
  
  return cleanedText;
}

// Function to process a single file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const cleanedContent = removeEmojis(content);
    
    if (content !== cleanedContent) {
      fs.writeFileSync(filePath, cleanedContent, 'utf8');
      console.log(`Cleaned: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Function to recursively find and process files
function processDirectory(dirPath, extensions = ['.ts', '.js', '.tsx', '.jsx', '.md', '.json']) {
  let processedCount = 0;
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other common directories to avoid
        if (!['node_modules', '.git', 'dist', 'build', 'coverage', 'reports'].includes(item)) {
          processedCount += processDirectory(fullPath, extensions);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          if (processFile(fullPath)) {
            processedCount++;
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error.message);
  }
  
  return processedCount;
}

// Main execution
function main() {
  console.log('Starting emoji removal process...');
  console.log('Processing TypeScript, JavaScript, and Markdown files...');
  
  const startTime = Date.now();
  const processedCount = processDirectory('.');
  const endTime = Date.now();
  
  console.log(`\nProcess completed!`);
  console.log(`Files processed: ${processedCount}`);
  console.log(`Time taken: ${endTime - startTime}ms`);
  
  if (processedCount > 0) {
    console.log('\nAll emoji icons have been removed from the codebase!');
  } else {
    console.log('\nNo emoji icons found in the codebase.');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { removeEmojis, processFile, processDirectory };