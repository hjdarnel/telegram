'use client';

interface TelegramPreviewProps {
  name: string;
  message: string;
}

export function TelegramPreview({ name, message }: TelegramPreviewProps) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: '2-digit', 
    year: 'numeric' 
  });
  const timeStr = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: true 
  });

  if (!name && !message) {
    return null;
  }

  return (
    <div className="bg-white text-black font-mono text-xs p-4 py-8 max-w-xs mx-auto shadow-lg border border-gray-300 ">
      <div className="text-center mb-6">
        <h3 className="font-bold text-lg tracking-wider">TELEGRAM</h3>
      </div>
      
      <div className="mb-6 text-left">
        <div suppressHydrationWarning ><strong>SENT:</strong> {dateStr}, {timeStr}</div>
        <div className="mt-1"><strong>FROM:</strong> {name.toUpperCase() || 'ANONYMOUS'}</div>
      </div>
      
      <div className="border-t border-dashed border-gray-400 pt-4 mb-6">
        <div className="mb-1"><strong>MESSAGE:</strong></div>
        <div className="whitespace-pre-wrap break-words">
          {message || '(No message)'}
        </div>
      </div>
      
      <div className="border-t border-dashed border-gray-400 pt-8 text-center">
        <div className="font-bold text-lg">TELEGRAM RECEIVED</div>
        <div className="text-xs mt-1" suppressHydrationWarning >ID: {Date.now().toString().slice(-8)}</div>
      </div>
    </div>
  );
}