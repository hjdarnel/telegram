'use server';

import { checkSWF } from '@/lib/sfw';

export async function testSWF(_prevState: any, formData: FormData) {
  const message = formData.get('message') as string;
  
  if (!message) {
    return { error: 'Please provide a message to test' };
  }

  try {
    const result = await checkSWF(message);
    const isToxic = result && result.length > 0 && 
      (result[0].label === 'TOXIC' || result[0].label === 'toxic') && 
      result[0].score > 0.85;
    
    return {
      message,
      result,
      isToxic,
      filteredMessage: isToxic 
        ? `REDACTED! Toxic score of ${Math.round(result[0].score * 100)}%`
        : message
    };
  } catch (error) {
    return { 
      error: `Error testing SWF: ${error}` 
    };
  }
}