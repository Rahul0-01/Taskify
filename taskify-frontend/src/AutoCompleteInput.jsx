import React, { useEffect, useState } from 'react';

const AutoCompleteInput = () => {
  const [dictionary, setDictionary] = useState([]);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    // Fetch the dictionary from public folder
    fetch('/WordsDictionary.json')
      .then(res => res.json())
      .then(data => setDictionary(Object.keys(data)));
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setInput(value);

    if (value.trim() === '') {
      setSuggestions([]);
      return;
    }

    const matches = dictionary
      .filter(word => word.toLowerCase().startsWith(value.toLowerCase()))
      .slice(0, 5); // Top 5 suggestions

    setSuggestions(matches);
  };

  const handleSuggestionClick = (word) => {
    setInput(word);
    setSuggestions([]);
  };

  return (
    <div className="relative w-80 mx-auto mt-10">
      <input
        type="text"
        value={input}
        onChange={handleChange}
        className="border p-2 w-full rounded"
        placeholder="Start typing..."
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-10 bg-white border w-full rounded shadow max-h-40 overflow-auto">
          {suggestions.map((word, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(word)}
              className="p-2 cursor-pointer hover:bg-gray-100"
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
