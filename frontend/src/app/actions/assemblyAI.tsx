import { AssemblyAI } from "assemblyai";

export async function getAssemblyToken() {
    try {
        const API_KEY = 'dbaa9118ad6c4311921bf47cdb6f391e';    
        const client = new AssemblyAI({
          apiKey: API_KEY
        })
    
        const token = await client.realtime.createTemporaryToken({ expires_in: 60*1 }) // 1 minute usage
    
    
        return token
      } catch (error) {
        console.error('Failed to create AssemblyAI connection info:', error);
        return null
      }
}