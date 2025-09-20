
import React from 'react';

const Loader: React.FC = () => {
  const messages = [
    "Crafting the perfect caption...",
    "Analyzing brand voice...",
    "Finding viral hashtags...",
    "Brewing creativity...",
    "Consulting the AI muses...",
  ];
  const [message, setMessage] = React.useState(messages[0]);

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 2500);

    return () => clearInterval(intervalId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-4 my-8">
      <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-brand-text-secondary text-lg">{message}</p>
    </div>
  );
};

export default Loader;
