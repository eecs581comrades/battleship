const generatedIds = new Set(); // Using a Set to store unique IDs
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const configPath = path.join('../front/assets', 'config.json');

export function updateClientId(newClientId) {
  // Read the file
  fs.readFile(configPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading config file:', err);
      return;
    }

    try {
      // Parse the JSON data
      let config = JSON.parse(data);

      // Update the ClientId
      config.ClientId = newClientId;

      // Stringify the updated object
      const updatedConfig = JSON.stringify(config, null, 2);

      // Write the updated content back to the file
      fs.writeFile(configPath, updatedConfig, 'utf8', (err) => {
        if (err) {
          console.error('Error writing to config file:', err);
        } else {
          console.log('ClientId updated successfully!');
        }
      });
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
    }
  });
}

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

 