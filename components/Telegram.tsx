import { TelegramForm } from './TelegramForm';

interface TelegramProps {
  enablePicture?: boolean;
}

export default function Telegram({ enablePicture = false }: TelegramProps) {
  return (
    <div>
      <TelegramForm enablePicture={enablePicture} />
    </div>
  );
}
