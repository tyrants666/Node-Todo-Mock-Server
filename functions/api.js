
const data = require('../db.json')

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers
    };
  }

  const path = event.path.replace('/api/', '');
  const segments = path.split('/');

  if (segments[0] === 'tasks') {
    if (segments.length === 1) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data.tasks)
      };
    } else if (segments.length === 2) {
      const task = data.tasks.find(t => t.id === parseInt(segments[1]));
      if (task) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(task)
        };
      }
    }
  }

  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({ error: 'Not found' })
  };
};