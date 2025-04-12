// src/components/AutoCompleteInput.jsx
import React, { useEffect, useState, useRef } from 'react';

const AutoCompleteInput = ({ value, onChange, placeholder = "Start typing..." }) => {
  const [dictionary, setDictionary] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef();

  useEffect(() => {
    fetch('/WordsDictionary.json')
      .then(res => res.json())
      .then(data => setDictionary(data));
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(val); // Update parent
    const words = val.trim().split(' ');
    const lastWord = words[words.length - 1];

    if (!lastWord) return setSuggestions([]);

    const matches = Object.entries(dictionary)
      .filter(([word]) => word.toLowerCase().startsWith(lastWord.toLowerCase()))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);

    setSuggestions(matches);
  };

  const handleSuggestionClick = (word) => {
    const words = value.trim().split(' ');
    words[words.length - 1] = word;
    const newInput = words.join(' ') + ' ';
    onChange(newInput);
    setSuggestions([]);

    // Focus input again
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        className="w-full bg-gray-700 text-white placeholder-gray-300 border border-gray-600 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
        placeholder={placeholder}
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-10 bg-white text-black w-full rounded shadow max-h-40 overflow-auto">
          {suggestions.map((word, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(word)}
              className="p-2 cursor-pointer hover:bg-gray-200"
            >
              {word}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutoCompleteInput;
