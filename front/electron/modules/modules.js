const generatedIds = new Set(); // Using a Set to store unique IDs
const crypto = require('crypto');
export function generateUniqueId(length = 6) {
  let id;
  do {
    id = crypto.randomBytes(length)
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, length);
  } while (generatedIds.has(id)); // Keep generating if the ID already exists

  generatedIds.add(id); // Add the new ID to the Set
  return id;
}

export function setUserIdCookie(userId){
    let expires = "";
    const date = new Date();
    date.setTime(date.getTime() + (1*24*60*60*1000));
    expires = "; expires=" + date.toUTCString;
    document.cookie - "userId=" + (userId || "") + expires + "; path=/";
}
 