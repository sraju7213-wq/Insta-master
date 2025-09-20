
import React, { useState } from 'react';
import { GeneratedContent } from '../types';
import ClipboardIcon from './icons/ClipboardIcon';
import CheckIcon from './icons/CheckIcon';

interface GeneratedOutputProps {
  content: GeneratedContent | null;
}

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 p-1.5 rounded-md bg-gray-600 hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-brand-primary"
      aria-label="Copy"
    >
      {copied ? <CheckIcon className="w-5 h-5 text-brand-secondary" /> : <ClipboardIcon className="w-5 h-5 text-gray-300" />}
    </button>
  );
};

const GeneratedOutput: React.FC<GeneratedOutputProps> = ({ content }) => {
  if (!content) {
    return null;
  }

  const hashtagsString = content.hashtags.map(h => `#${h}`).join(' ');

  return (
    <div className="mt-8 space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-brand-text mb-4">Generated Captions</h2>
        <div className="space-y-4">
          {content.captions.map((caption, index) => (
            <div key={index} className="relative bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-md">
              <p className="text-brand-text-secondary pr-12 whitespace-pre-wrap">{caption}</p>
              <CopyButton textToCopy={caption} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-brand-text mb-4">Generated Hashtags</h2>
        <div className="relative bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-md">
            <p className="text-brand-secondary text-sm flex flex-wrap gap-2">
                {content.hashtags.map(tag => <span key={tag}>#{tag}</span>)}
            </p>
          <CopyButton textToCopy={hashtagsString} />
        </div>
      </div>
    </div>
  );
};

export default GeneratedOutput;
