'use server';
import { headers } from 'next/headers';
import { checkSWF } from './sfw';
import { client, encoder } from './printer';
import { revalidatePath } from 'next/cache';
import { loadImage } from 'canvas';

let count = 0;

const rateLimit = new Map<string | null, number>();

export async function printTelegram(_prevState: any, data: FormData) {
  const ip =
    (await headers()).get('x-forwarded-for') ||
    (await headers()).get('x-real-ip');
  
  const lastRequest = rateLimit.get(ip);
  console.log({
    ip, lastRequest, lastRequestIso: lastRequest ? new Date(lastRequest).toLocaleString('en-US', { timeZone: 'America/Chicago' }) : 'N/A',
    nowIso: new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })
  });
  
  if (lastRequest && Date.now() - lastRequest < 15000) {
    console.log('Rate limited');
    return {
      body: 'Rate limited'
    };
  }

  rateLimit.set(ip, Date.now());
  const message = (data.get('message') || '').slice(0, 10000) as string;
  const name = (data.get('name') || '').slice(0, 30) as string;
  const imageData = data.get('image') as string | null;

  console.log(`
Printing message:
${name}: ${message}
`);
  
  // Check for toxic content
  const result = await checkSWF(message as string);
  const isToxic = result && result.length > 0 && 
    (result[0].label === 'toxic') && 
    result[0].score > 0.85;
  
  const printedMessage = isToxic
    ? `REDACTED! Toxic score of ${Math.round(result[0].score * 100)}%`
    : message;
    
  if (isToxic) {
    console.log('💀', result[0].score, message);
    return {
      body: printedMessage
    };
  }
  const encodedMessage = encoder
    .initialize()
    .bold()
    .align('center')
    .height(2)
    .width(2)
    .line('TELEGRAM')
    .width(1)
    .height(1)
    .newline()
    .newline()
    .align('left')
    .line(`SENT: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}`)
    .newline()
    .line(`FROM: ${name?.toUpperCase() || 'ANONYMOUS'}`)
    .newline()
    .newline()
    .align('center')
    .line('='.repeat(40))
    .newline()
    .newline()
    .line(`MESSAGE:`)
    .align('left')
    .line(`${message}`)
    .newline()
    .newline();

  // Handle optional image printing
  if (imageData) {
    try {
      const image = await loadImage(imageData);
      encodedMessage
        .align('center')
        .line('='.repeat(40))
        .newline()
        .newline()
        .line('IMAGE:')
        .newline()
        .image(image, image.width, image.height, 'floydsteinberg')
        .newline()
        .newline();
    } catch (error) {
      console.error('Error processing image for printing:', error);
      encodedMessage
        .align('center')
        .line('='.repeat(40))
        .newline()
        .newline()
        .line('IMAGE: [Error processing image]')
        .newline()
        .newline();
    }
  }

  encodedMessage
    .align('center')
    .line('='.repeat(40))
    .newline()
    .newline()
    .height(2)
    .width(2)
    .line('TELEGRAM RECEIVED')
    .height(1)
    .width(1)
    .newline()
    .line(`ID: ${Date.now().toString().slice(-8)}`)
    .newline()
    .newline()
    .newline()
    .newline()
    .newline()
    .newline()
    .newline()
    .cut('full');
  
  const finalEncodedMessage = encodedMessage.encode();
  client?.write(finalEncodedMessage);
  count++;

  return {
    body: `Printed message: ${message}${imageData ? ' (with image)' : ''}`,
    message,
    name
  };
}
