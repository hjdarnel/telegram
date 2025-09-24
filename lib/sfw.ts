'use server';
import PipelineSingleton from './pipeline';

export async function checkSWF(message: string) {
  try {
    console.log('Checking SWF for message:', message.substring(0, 50) + (message.length > 50 ? '...' : ''));
    const classifier = await PipelineSingleton.getInstance();
    const result = await classifier(message);
    
    console.log('SWF Classification result:', result);
    
    // The toxic-bert model returns classifications with labels like 'TOXIC' or 'NON_TOXIC'
    // and confidence scores. We'll return the full result for flexibility.
    return result;
  } catch (error) {
    console.error('Error in checkSWF:', error);
    // Return a safe default in case of error
    return [{ label: 'NON_TOXIC', score: 0 }];
  }
}
