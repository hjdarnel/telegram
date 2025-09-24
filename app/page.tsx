import React from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import Telegram from '@/components/Telegram';

export default function Home() {
  return (
    <main className="text-center p-4 md:p-[50px]">
      <h2 className="text-xl md:text-2xl">Send me a telegram!</h2>
      <p className="text-sm md:text-base mb-6">Type something and it will print on my thermal printer.</p>
      <div className="max-w-4xl mx-auto">
          <Telegram />
      </div>
    </main>
  );
}
