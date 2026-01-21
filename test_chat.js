// Simple test script to verify Catalyst chat integration
async function testChat() {
  console.log('Testing Catalyst chat integration via Next.js API...');

  try {
    const response = await fetch('http://localhost:3003/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello, who is Per4ex?' }],
        session_id: 'test_session_' + Date.now()
      })
    });

    if (!response.ok) {
      console.error('API Error:', response.status, response.statusText);
      return;
    }

    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

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
              console.log(text);
              fullText += text;
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }

    console.log('\nFull response:', fullText);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testChat();
