const data = require('../db.json');
const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '2592000', // 30 days
    'Access-Control-Allow-Credentials': 'true'
  };

  // Log the request details
  console.log('Request Method:', event.httpMethod);
  console.log('Request Headers:', JSON.stringify(event.headers, null, 2));
  console.log('Request Path:', event.path);

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return {
      statusCode: 204,
      headers,
      body:''
    };
  }

  const segments = event.path.replace('/api/', '').split('/');

  if (segments[0] === 'tasks') {
    const taskId = segments.length > 1 ? parseInt(segments[1]) : null;

    switch (event.httpMethod) {
      case 'GET':
        if (taskId === null) {
          return { statusCode: 200, headers, body: JSON.stringify(data.tasks) };
        } else {
          const task = data.tasks.find(t => t.id === taskId);
          return task
            ? { statusCode: 200, headers, body: JSON.stringify(task) }
            : { statusCode: 404, headers, body: JSON.stringify({ error: 'Task not found' }) };
        }

      case 'POST':
        const newTask = JSON.parse(event.body);
        newTask.id = Math.max(...data.tasks.map(t => t.id)) + 1;
        data.tasks.push(newTask);
        await saveData();
        return { statusCode: 201, headers, body: JSON.stringify(newTask) };

      case 'PUT':
        if (taskId === null) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'Task ID is required' }) };
        }
        const taskIndex = data.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) {
          return { statusCode: 404, headers, body: JSON.stringify({ error: 'Task not found' }) };
        }
        const updatedTask = { ...data.tasks[taskIndex], ...JSON.parse(event.body), id: taskId };
        data.tasks[taskIndex] = updatedTask;
        await saveData();
        return { statusCode: 200, headers, body: JSON.stringify(updatedTask) };

      case 'DELETE':
        if (taskId === null) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'Task ID is required' }) };
        }
        const initialLength = data.tasks.length;
        data.tasks = data.tasks.filter(t => t.id !== taskId);
        if (data.tasks.length === initialLength) {
          return { statusCode: 404, headers, body: JSON.stringify({ error: 'Task not found' }) };
        }
        await saveData();
        return { statusCode: 204, headers };

      default:
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
  }

  return { statusCode: 404, headers, body: JSON.stringify({ error: 'Not found' }) };
};

async function saveData() {
  const filePath = path.join(__dirname, '..', 'db.json');
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
}