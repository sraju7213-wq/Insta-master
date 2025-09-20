import React, { useState, useCallback } from 'react';
import { Brand, GeneratedContent } from './types';
import { BRANDS } from './constants';
import { generateContent } from './services/geminiService';
import GeneratedOutput from './components/GeneratedOutput';
import Loader from './components/Loader';
import PhotoIcon from './components/icons/PhotoIcon';

const App: React.FC = () => {
  const [selectedBrandId, setSelectedBrandId] = useState<string>(BRANDS[0].id);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [textInput, setTextInput] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBrandId(e.target.value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    // Also reset the file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!imageFile && !textInput.trim()) {
      setError('Please provide either an image or a text description.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setGeneratedContent(null);
    
    const selectedBrand = BRANDS.find(b => b.id === selectedBrandId);
    if (!selectedBrand) {
      setError('Selected brand not found.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await generateContent(selectedBrand, imageFile, textInput);
      setGeneratedContent(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedBrandId, imageFile, textInput]);

  const selectedBrand = BRANDS.find(b => b.id === selectedBrandId) as Brand;

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
            InstaGenius AI
          </h1>
          <p className="text-brand-text-secondary mt-2 text-lg">Your AI-Powered Instagram Content Assistant</p>
        </header>

        <main className="bg-brand-surface p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-700">
          <div className="space-y-6">
            {/* Brand Selector */}
            <div>
              <label htmlFor="brand-selector" className="block text-sm font-medium text-brand-text-secondary mb-2">1. Select Your Brand Account</label>
              <select
                id="brand-selector"
                value={selectedBrandId}
                onChange={handleBrandChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg py-3 px-4 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition"
              >
                {BRANDS.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>
            
            <div className="text-center text-brand-text-secondary font-semibold">OR</div>

            {/* Input Methods */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Uploader */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-brand-text-secondary mb-2">2a. Upload an Image</label>
                {imagePreview ? (
                  <div className="relative group">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                    <button 
                      onClick={removeImage} 
                      className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ) : (
                  <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-gray-800 transition">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <PhotoIcon className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click to upload</span></p>
                    </div>
                    <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                )}
              </div>
              
              {/* Text Input */}
              <div className="flex flex-col">
                <label htmlFor="text-input" className="block text-sm font-medium text-brand-text-secondary mb-2">2b. Describe the Context</label>
                <textarea
                  id="text-input"
                  rows={5}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={`e.g., "A photo of our new minimalist oak coffee table in a sunlit living room."`}
                  className="w-full h-full bg-gray-800 border border-gray-600 rounded-lg p-4 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition resize-none"
                />
              </div>
            </div>

            {/* Generate Button */}
            <div className="pt-4">
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-brand-primary to-indigo-500 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity transform hover:scale-105"
              >
                {isLoading ? 'Generating...' : '✨ Generate Content'}
              </button>
            </div>
          </div>
          
          {error && <div className="mt-6 p-4 bg-red-900 border border-red-700 text-red-200 rounded-lg">{error}</div>}
          
          {isLoading ? <Loader /> : <GeneratedOutput content={generatedContent} />}

        </main>
      </div>
    </div>
  );
};

export default App;