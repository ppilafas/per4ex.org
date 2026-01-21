// Direct test of Catalyst API with the provided key
async function testCatalystDirect() {
  console.log('Testing Catalyst API directly...');

  const API_KEY = '41YFXJxJN4Gnws954lxbgeQuOmFd6vHCwlh1Fh_7cOE';
  const TENANT_ID = 'anonymous';
  const BASE_URL = 'https://catalyst-service.fly.dev/v1';

  try {
    // First test health check
    console.log('Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    console.log('Health status:', healthResponse.status);

    // Now test chat streaming
    console.log('Testing chat streaming...');
    const response = await fetch(`${BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'X-Tenant-Id': TENANT_ID,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello, who is Per4ex?' }],
        session_id: 'direct_test_' + Date.now()
      })
    });

    console.log('Chat response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      return;
    }

    if (!response.body) {
      console.error('No response body');
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    console.log('Streaming response:');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content || data.text) {
              const text = data.content || data.text;
              process.stdout.write(text);
              fullText += text;
            }
          } catch (e) {
            // Ignore parse errors
          }
        } else if (line.startsWith('event: ')) {
          console.log(`Event: ${line}`);
        }
      }
    }

    console.log('\n\nFull response:', fullText);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testCatalystDirect();
