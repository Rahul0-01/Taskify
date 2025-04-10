// src/utils/SmartSuggestion.js

const keywords = [
    "Fix UI Bugs",
    "Add Error Handling",
    "Write API Documentation",
    "Improve Test Coverage",
    "Optimize Database Queries",
    "Integrate New API",
    "Code Review for Team",
    "Update Sprint Backlog",
    "Client Feedback Implementation",
    "Add Unit Tests"
  ];
  
   function getSmartSuggestion(title = "", userName = "") {
    const task = keywords[Math.floor(Math.random() * keywords.length)];
  
    if (title && title.length > 3) {
      return `${title} - ${task}`;
    }
  
    return `Assign ${task}${userName ? ` to ${userName}` : ""}`;
  }
  
  export default getSmartSuggestion;