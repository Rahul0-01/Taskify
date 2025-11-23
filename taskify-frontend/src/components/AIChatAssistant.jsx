import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Mic, VolumeX, MicOff, Activity, Send } from "lucide-react";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { parseDate } from "chrono-node";
import api from "../api";

// --- Config ---
const GOOGLE_AI_API_KEY = process.env.REACT_APP_GOOGLE_AI_API_KEY;
const TASKIFY_BACKEND_URL = process.env.REACT_APP_TASKIFY_BACKEND_URL;
const MODEL_NAME = process.env.REACT_APP_GOOGLE_MODEL || "gemini-pro";

// --- Tools / function declarations ---
const taskifyTools = [
  {
    functionDeclarations: [
      {
        name: "createTask",
        description: "Creates a new task. Use this when the user wants to add or create a task.",
        parameters: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            description: { type: "STRING" },
            dueDate: { type: "STRING", description: "ISO date string or null if not specified" },
            priority: { type: "STRING" },
            status: { type: "STRING" },
            userId: { type: "NUMBER" },
            assignedTo: { type: "OBJECT", properties: { id: { type: "NUMBER" } } }
          },
          required: ["title"]
        }
      },
      {
        name: "getAllTask",
        description: "Retrieves all tasks. Use this when the user asks to see, list, or read their tasks.",
        parameters: { type: "OBJECT", properties: {} }
      },
      {
        name: "getTaskById",
        description: "Retrieves a task by ID.",
        parameters: { type: "OBJECT", properties: { taskId: { type: "NUMBER" } }, required: ["taskId"] }
      },
      {
        name: "updateTask",
        description: "Updates a task by ID.",
        parameters: {
          type: "OBJECT",
          properties: {
            taskId: { type: "NUMBER" },
            updatedTask: { type: "OBJECT" }
          },
          required: ["taskId"]
        }
      },
      {
        name: "deleteTask",
        description: "Deletes a task by ID.",
        parameters: { type: "OBJECT", properties: { taskId: { type: "NUMBER" } }, required: ["taskId"] }
      },
      {
        name: "markTaskAsCompleted",
        description: "Marks a task as completed.",
        parameters: { type: "OBJECT", properties: { taskId: { type: "NUMBER" } }, required: ["taskId"] }
      }
    ]
  }
];

// --- Google AI initialization ---
let genAI = null;
let model = null;
if (GOOGLE_AI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);
    model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: { maxOutputTokens: 1000 },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE }
      ],
      tools: taskifyTools
    });
  } catch (e) {
    console.error("Google AI SDK init failed:", e);
  }
}

const AIChatAssistant = () => {
  // 1. Authentication Gate
  // We check this on every render. If no token, we return null at the end.
  // We still call hooks to adhere to Rules of Hooks, but we won't render UI.
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "ai", content: "Hi! I'm Taskify Assistant. How can I help you manage tasks?" }]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [speechError, setSpeechError] = useState("");

  const chatScrollRef = useRef(null);
  const recognitionRef = useRef(null);
  const mountedRef = useRef(true);

  // Scroll to bottom on updates
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isProcessing, speechError]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopListening();
      cancelSpeech();
    };
  }, []);

  // --- Helpers ---

  const cancelSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const speak = (text) => {
    if (!("speechSynthesis" in window)) return;
    cancelSpeech();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 1.0;
    window.speechSynthesis.speak(utt);
  };

  // --- Backend Interaction ---
  const callTaskifyBackend = async (endpoint, method = "GET", body = null) => {
    try {
      const config = { headers: { "Content-Type": "application/json" } };
      let res;
      // Use the 'api' instance directly with relative path. 
      if (method === "GET" || method === "DELETE") {
        res = await api[method.toLowerCase()](endpoint, config);
      } else {
        res = await api[method.toLowerCase()](endpoint, body, config);
      }
      if (res.status === 204) return { success: true, data: null };
      return { success: true, data: res.data };
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Unknown error";
      return { success: false, error: message };
    }
  };

  // --- AI Logic ---

  // Ensure history starts with 'user' role for Gemini API
  const buildHistoryForModel = (currentMessages, incomingUserMsg) => {
    const filtered = currentMessages.filter(m => ["user", "ai", "function"].includes(m.role));
    const combined = incomingUserMsg ? [...filtered, incomingUserMsg] : filtered;

    let mapped = combined.map(m => ({
      role: m.role === "ai" ? "model" : m.role,
      parts: [{ text: m.content }]
    }));

    // Find first user message
    const firstUserIdx = mapped.findIndex(m => m.role === "user");
    if (firstUserIdx === -1) return []; // Should not happen if we just added one
    return mapped.slice(firstUserIdx);
  };

  const handleSend = useCallback(async (textOverride) => {
    const textToSend = textOverride ?? input;
    if (!String(textToSend).trim()) return;

    // UI Updates
    const userMsg = { role: "user", content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    if (!textOverride) setInput("");
    setIsProcessing(true);
    setSpeechError("");
    cancelSpeech(); // Stop any previous speech

    if (!model) {
      setMessages(prev => [...prev, { role: "ai", content: "AI not configured (missing API key)." }]);
      setIsProcessing(false);
      return;
    }

    try {
      const history = buildHistoryForModel(messages, userMsg);
      const chatSession = model.startChat({ history });

      const result = await chatSession.sendMessage(textToSend);
      const response = await result.response;
      const fc = response.candidates?.[0]?.content?.parts?.[0]?.functionCall;

      if (fc) {
        const { name, args = {} } = fc;
        // Show "Processing..." state in chat if needed, or just keep isProcessing true
        // We'll add a temporary AI message for feedback

        let resultMsg = "";

        switch (name) {
          case "createTask": {
            const dateMatch = parseDate(textToSend);
            // Default to null if no date found, or use args.dueDate if model parsed it
            const dueDate = dateMatch
              ? `${dateMatch.toISOString().split("T")[0]}T00:00:00`
              : (args.dueDate || null);

            const payload = {
              title: args.title || "Untitled Task",
              description: args.description || "",
              dueDate,
              priority: args.priority || "Low",
              status: args.status || "Pending",
              userId: args.userId, // Backend usually infers from token, but if model provides it...
              assignedTo: args.assignedTo
            };

            const res = await callTaskifyBackend("/api/task/create", "POST", payload);
            resultMsg = res.success ? `✅ Task "${payload.title}" created.` : `❌ Failed to create task: ${res.error}`;
            break;
          }
          case "getAllTask": {
            // Use getAllTaskPaged as getAllTask (all) might be restricted or non-existent
            const res = await callTaskifyBackend("/api/task/getAllTaskPaged?page=0&size=10&sortBy=dueDate", "GET");
            if (res.success) {
              // Paged response usually has 'content' array
              const tasks = res.data?.content || (Array.isArray(res.data) ? res.data : []);

              if (tasks.length === 0) {
                resultMsg = "You have no tasks.";
              } else {
                resultMsg = `Here are your tasks:\n` + tasks.slice(0, 5).map(t => `• ${t.title}`).join("\n");
                if (tasks.length > 5) resultMsg += `\n...and ${res.data.totalElements - 5} more.`;
              }
            } else {
              resultMsg = `❌ Failed to fetch tasks: ${res.error}`;
            }
            break;
          }
          case "getTaskById": {
            const id = Number(args.taskId);
            if (isNaN(id)) { resultMsg = "Invalid Task ID"; break; }
            const res = await callTaskifyBackend(`/api/task/getTask/${id}`, "GET");
            resultMsg = res.success ? `Task: ${res.data.title}\nStatus: ${res.data.status}` : `❌ ${res.error}`;
            break;
          }
          case "deleteTask": {
            const id = Number(args.taskId);
            if (isNaN(id)) { resultMsg = "Invalid Task ID"; break; }
            const res = await callTaskifyBackend(`/api/task/delete/${id}`, "DELETE");
            resultMsg = res.success ? `✅ Task ${id} deleted.` : `❌ ${res.error}`;
            break;
          }
          case "markTaskAsCompleted": {
            const id = Number(args.taskId);
            if (isNaN(id)) { resultMsg = "Invalid Task ID"; break; }
            // Try PUT first
            let res = await callTaskifyBackend(`/api/task/markAsCompleted/${id}`, "PUT");
            resultMsg = res.success ? `✅ Task ${id} marked as completed.` : `❌ ${res.error}`;
            break;
          }
          default:
            resultMsg = `Function ${name} not supported yet.`;
        }

        setMessages(prev => [...prev, { role: "ai", content: resultMsg }]);
        speak(resultMsg);

      } else {
        // Text response
        const text = response.text();
        setMessages(prev => [...prev, { role: "ai", content: text }]);
        speak(text);
      }

    } catch (e) {
      console.error("AI Error:", e);
      setMessages(prev => [...prev, { role: "ai", content: "Sorry, I encountered an error processing that." }]);
    } finally {
      if (mountedRef.current) setIsProcessing(false);
    }
  }, [input, messages]);


  // --- Microphone Logic (Manual Only) ---

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(async () => {
    if (isListening || isProcessing) return; // Prevent double activation

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setSpeechError("Speech Recognition not supported.");
      return;
    }

    // Check permissions first (optional but good practice)
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: "microphone" });
        if (result.state === "denied") {
          setSpeechError("Microphone permission denied.");
          return;
        }
      }
    } catch (e) { /* ignore permission check error */ }

    try {
      const recognition = new SR();
      recognitionRef.current = recognition;

      recognition.lang = "en-US";
      recognition.continuous = false; // Stop after one sentence
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError("");
        cancelSpeech(); // Stop TTS if speaking
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript && transcript.trim()) {
          // Stop immediately
          stopListening();
          // Send
          handleSend(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.warn("Speech Error:", event.error);
        if (event.error === "not-allowed") {
          setSpeechError("Microphone access denied.");
        } else if (event.error === "no-speech") {
          // Just stop silently
        } else if (event.error !== "aborted") {
          setSpeechError("Error listening.");
        }
        stopListening();
      };

      recognition.onend = () => {
        // Just reset UI state. Do NOT restart.
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognition.start();

    } catch (e) {
      console.error("Start listening failed:", e);
      setSpeechError("Could not start microphone.");
      setIsListening(false);
    }
  }, [isListening, isProcessing, handleSend, stopListening]);


  // --- Render ---

  // 1. Auth Gate Check
  if (!token) return null;

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsOpen(prev => {
              const next = !prev;
              if (!next) {
                stopListening();
                cancelSpeech();
              }
              return next;
            });
          }}
          className={`p-4 rounded-full shadow-2xl flex items-center justify-center transition-colors duration-300
            ${isOpen ? "bg-red-500 hover:bg-red-600 text-white" : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"}`}
        >
          {isOpen ? <X size={24} /> : <Bot size={28} />}
        </motion.button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[80vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col z-50 border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white">Taskify Assistant</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    {isListening ? (
                      <span className="text-red-500 flex items-center gap-1 font-medium">
                        <Activity size={10} className="animate-pulse" /> Listening...
                      </span>
                    ) : isProcessing ? (
                      <span className="text-blue-600 font-medium animate-pulse">Thinking...</span>
                    ) : (
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Online</span>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMessages([{ role: "ai", content: "Hi! I'm Taskify Assistant. How can I help you manage tasks?" }])}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            </div>

            {/* Messages */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm
                    ${m.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-none border border-slate-100 dark:border-slate-700"}`}
                  >
                    {m.content}
                  </div>
                </motion.div>
              ))}

              {isProcessing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-slate-100 dark:border-slate-700 flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </motion.div>
              )}

              {speechError && (
                <div className="text-xs text-red-500 text-center py-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  {speechError}
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-full px-1 py-1 pl-4 border border-transparent focus-within:border-blue-500 transition-colors">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
                  placeholder={isListening ? "Listening..." : "Type a message..."}
                  className="flex-1 bg-transparent outline-none text-sm text-slate-800 dark:text-white placeholder:text-slate-400"
                  disabled={isProcessing || isListening}
                />

                {/* Mic Button */}
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={isProcessing}
                  className={`p-2 rounded-full transition-all duration-300 transform hover:scale-105
                    ${isListening
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse"
                      : "text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700"}`}
                  title={isListening ? "Stop listening" : "Start voice command"}
                >
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>

                {/* Send Button */}
                <button
                  onClick={() => handleSend()}
                  disabled={isProcessing || (!input.trim() && !isListening)}
                  className={`p-2 rounded-full transition-all duration-300
                    ${(input.trim())
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:scale-105"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"}`}
                >
                  <Send size={18} />
                </button>
              </div>

              <div className="mt-2 text-[10px] text-center text-slate-400">
                AI can make mistakes. Check important info.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatAssistant;
