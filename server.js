const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.text({ type: '*/*' })); // Accept raw text body
app.use(cors()); // Allow cross-origin requests (for executors)

// Proxy endpoint: POST to /execute with raw URL in body
app.post('/execute', async (req, res) => {
  const rawUrl = req.body.trim();
  
  if (!rawUrl || !rawUrl.startsWith('http')) {
    return res.status(400).send('Invalid URL provided in body');
  }

  try {
    const response = await fetch(rawUrl);
    
    if (!response.ok) {
      return res.status(response.status).send(`Fetch failed: ${response.statusText}`);
    }

    // Get content type and body
    const contentType = response.headers.get('content-type') || 'text/plain';
    const body = await response.text();

    // Set headers to mimic the original
    res.set('Content-Type', contentType);
    res.send(body);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).send('Proxy fetch failed');
  }
});

// Health check endpoint (optional, for testing)
app.get('/', (req, res) => {
  res.send('Roblox Proxy Server is running! POST to /execute with a raw URL in the body.');
});

// Listen
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
