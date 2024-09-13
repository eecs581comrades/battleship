const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function generateUniqueId(length = 32) {
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

function updateUserId(userId){
    //read the json file
    const filePath = path.join(__dirname, 'config.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    // 2. Parse the JSON data into a JavaScript object
    let jsonData = JSON.parse(data);

    // 3. Modify the object (e.g., update the "age" property)
    jsonData.ClientId = userId;
    // 4. Write the updated object back to the JSON file
    fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
        if (err) {
        console.error('Error writing file:', err);
        } else {
        console.log('File updated successfully');
        }
    });
    });
}

function checkClientId(){
    const filePath = path.join(__dirname, 'config.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    // 2. Parse the JSON data into a JavaScript object
    let jsonData = JSON.parse(data);
    return jsonData.ClientId;
});
}

