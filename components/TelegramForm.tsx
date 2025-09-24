'use client';

import { printTelegram } from '@/lib/telegram';
import { useActionState, useState } from 'react';
import { TelegramPreview } from './TelegramPreview';

export function TelegramForm() {
  const [state, formAction] = useActionState(printTelegram, { body: '', name: '' });
  const [previewName, setPreviewName] = useState('Alex Johnson');
  const [previewMessage, setPreviewMessage] = useState('Hey there! Hope you\'re having a wonderful day. I just wanted to send you a quick message to say hello and let you know I\'m thinking of you. These telegram receipts are pretty cool, aren\'t they? Take care and talk soon!');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <form action={formAction} className="space-y-3">
            <input
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Name"
              type="text"
              name="name"
              required
              maxLength={25}
              defaultValue={(state.name as string) || 'Alex Johnson'}
              onChange={(e) => setPreviewName(e.target.value)}
            />
            <textarea
              className="w-full p-2 border border-gray-300 rounded resize-none"
              placeholder="Message. Be nice, AI will judge"
              name="message"
              id="message"
              rows={5}
              maxLength={500}
              defaultValue="Hey there! Hope you're having a wonderful day. I just wanted to send you a quick message to say hello and let you know I'm thinking of you. These telegram receipts are pretty cool, aren't they? Take care and talk soon!"
              onChange={(e) => setPreviewMessage(e.target.value)}
            />
            <button 
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            >
              Send
            </button>
          </form>
          
          {state.body && (
            <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded text-green-800">
              {state.body}
            </div>
          )}
        </div>
        
        <div className="flex justify-center md:justify-start">
          <TelegramPreview name={previewName} message={previewMessage} />
        </div>
      </div>
    </div>
  );
}
