// secretService.js
const AWS = require('aws-sdk');

const secretsManager = new AWS.SecretsManager(); // Use your region

async function getEpraSecrets() {
  try {
    const result = await secretsManager.getSecretValue({ SecretId: 'epraServerSecrets' }).promise();
    console.log('Fetched epraServerSecrets:', result);
    return JSON.parse(result.SecretString); // Convert to JS object
  } catch (err) {
    console.error('Failed to fetch epraServerSecrets:', err);
    throw err;
  }
}

module.exports = { getEpraSecrets };
