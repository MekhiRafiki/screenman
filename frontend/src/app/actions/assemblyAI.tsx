export async function getAssemblyToken() {
    try {
        const API_KEY = 'dbaa9118ad6c4311921bf47cdb6f391e';    
        
        const response = await fetch('https://api.assemblyai.com/v2/realtime/token', {
            mode: 'no-cors',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                expires_in: 60 // 1 minute usage
            })
        });

        if (!response.ok) {
            throw new Error(`AssemblyAI API error: ${response.status}`);
        }

        const data = await response.json();
        return data.token;
    } catch (error) {
        console.error('Failed to create AssemblyAI token:', error);
        return null;
    }
}