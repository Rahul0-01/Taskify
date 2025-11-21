import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Mic, VolumeX } from 'lucide-react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { parseDate } from "chrono-node";
import api from '../api';

// --- Google AI API Key and SDK Initialization ---
const googleAiApiKey = process.env.REACT_APP_GOOGLE_AI_API_KEY;
const TASKIFY_BACKEND_URL = process.env.REACT_APP_TASKIFY_BACKEND_URL;
const MODEL_NAME = process.env.REACT_APP_GOOGLE_MODEL || "gemini-pro";

// --- Define Tools/Functions for Taskify Backend ---
const taskifyTools = [
  {
    functionDeclarations: [
      {
        name: "createTask",
        description: "Creates a new task.",
        parameters: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING", description: "Title of the task." },
            description: { type: "STRING", description: "Description of the task." },
            dueDate: { type: "STRING", description: "Due date (ISO format)." },
            priority: { type: "STRING", description: "Priority (HIGH, MEDIUM, LOW)." },
            status: { type: "STRING", description: "Initial status." },
            userId: { type: "NUMBER", description: "User ID to assign to." },
            assignedTo: {
              type: "OBJECT",
              properties: { id: { type: "NUMBER" } }
            }
          },
          required: ["title"]
        }
      },
      {
        name: "getAllTask",
        description: "Retrieves all tasks.",
        parameters: { type: "OBJECT", properties: {} }
      },
      {
        name: "getTaskById",
        description: "Retrieves a task by ID.",
        parameters: {
          type: "OBJECT",
          properties: { taskId: { type: "NUMBER" } },
          required: ["taskId"]
        }
      },
      {
        name: "updateTask",
        description: "Updates a task by ID.",
        parameters: {
          type: "OBJECT",
          properties: {
            taskId: { type: "NUMBER" },
            updatedTask: {
              type: "OBJECT",
              properties: {
                title: { type: "STRING" },
                description: { type: "STRING" },
                dueDate: { type: "STRING" },
                priority: { type: "STRING" },
                status: { type: "STRING" }
              }
            }
          },
          required: ["taskId"]
        }
      },
      {
        name: "deleteTask",
        description: "Deletes a task by ID.",
        parameters: {
          type: "OBJECT",
          properties: { taskId: { type: "NUMBER" } },
          required: ["taskId"]
        }
      },
      {
        name: "getTasksByStatus",
        description: "Gets tasks by status.",
        parameters: {
          type: "OBJECT",
          properties: { status: { type: "STRING" } },
          required: ["status"]
        }
      },
      {
        name: "getTasksByPriority",
        description: "Gets tasks by priority.",
        parameters: {
          type: "OBJECT",
          properties: { priority: { type: "STRING" } },
          required: ["priority"]
        }
      },
      {
        name: "getTasksByDueDate",
        description: "Gets tasks by due date.",
        parameters: {
          type: "OBJECT",
          properties: { dueDate: { type: "STRING" } },
          required: ["dueDate"]
        }
      },
      {
        name: "assignTask",
        description: "Assigns a task to a user.",
        parameters: {
          type: "OBJECT",
          properties: {
            taskId: { type: "NUMBER" },
            assignedUser: {
              type: "OBJECT",
              properties: { id: { type: "NUMBER" } }
            }
          },
          required: ["taskId", "assignedUser"]
        }
      },
      {
        name: "getTasksByUser",
        description: "Gets tasks for a user.",
        parameters: {
          type: "OBJECT",
          properties: { userId: { type: "NUMBER" } },
          required: ["userId"]
        }
      },
      {
        name: "markTaskAsCompleted",
        description: "Marks a task as completed.",
        parameters: {
          type: "OBJECT",
          properties: { taskId: { type: "NUMBER" } },
          required: ["taskId"]
        }
      }
    ]
  }
];

// Initialize Google AI
let genAI, model;
if (googleAiApiKey) {
  try {
    genAI = new GoogleGenerativeAI(googleAiApiKey);
    model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: { maxOutputTokens: 1000 },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
      tools: taskifyTools,
    });
  } catch (e) {
    console.error("Failed to initialize Google AI SDK:", e);
  }
}

const AIChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", content: "Hi! I'm Taskify Assistant. How can I help you manage tasks?" },
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const chatScrollRef = useRef(null);
  const recognitionRef = useRef(null);
  const wakeRecognitionRef = useRef(null);
  const isWakeListening = useRef(false);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // --- Backend Helper ---
  const callTaskifyBackend = async (endpoint, method = "GET", body = null) => {
    if (!TASKIFY_BACKEND_URL) return { success: false, error: "Backend URL not configured." };
    try {
      const url = `${TASKIFY_BACKEND_URL}${endpoint}`;
      const config = { headers: { "Content-Type": "application/json" } };
      let res;
      if (method === "GET" || method === "DELETE") {
        res = await api[method.toLowerCase()](url, config);
      } else {
        res = await api[method.toLowerCase()](url, body, config);
      }
      if (res.status === 204) return { success: true, data: null };
      return { success: true, data: res.data };
    } catch (e) {
      console.error(`Error calling ${endpoint}:`, e);
      return { success: false, error: e.message };
    }
  };

  // --- Main Send Handler ---
  const handleSend = useCallback(async (textOverride) => {
    if (!genAI || !model) {
      setMessages(prev => [...prev, { role: "ai", content: "⚠️ AI Service not initialized." }]);
      return;
    }
    const textToSend = textOverride || input;
    if (!String(textToSend).trim()) return;

    const userMsg = { role: "user", content: textToSend };
    setIsLoading(true);
    setMessages(prev => [...prev, userMsg]);
    if (!textOverride) setInput("");
    setSpeechError("");

    // Prepare history
    const history = messages
      .concat(userMsg)
      .filter(m => ["user", "ai", "function"].includes(m.role))
      .slice(1)
      .map(m => ({ role: m.role === "ai" ? "model" : m.role, parts: [{ text: m.content }] }));

    try {
      const chatSession = model.startChat({ history });
      const result = await chatSession.sendMessage(textToSend);
      const resp = result.response;
      const fc = resp.candidates?.[0]?.content?.parts?.[0]?.functionCall;

      if (fc) {
        const { name, args = {} } = fc;
        setMessages(prev => [...prev, { role: "ai", content: `🧠 Performing: ${name}...` }]);
        let resultMsg = "";

        // Execute tool
        switch (name) {
          case "createTask": {
            if (!args.title) { resultMsg = "⚠️ Title required."; break; }
            const dateMatch = parseDate(textToSend);
            if (dateMatch) args.dueDate = `${dateMatch.toISOString().split("T")[0]}T00:00:00`;
            if (!args.dueDate) { resultMsg = "⚠️ Due date required."; break; }

            const res = await callTaskifyBackend("/api/task/create", "POST", {
              title: args.title,
              description: args.description,
              dueDate: args.dueDate,
              priority: args.priority || "Low",
              status: args.status || "Pending",
              userId: args.userId,
              assignedTo: args.assignedTo,
            });
            resultMsg = res.success ? `✅ Task "${args.title}" created.` : `❌ Error: ${res.error}`;
            break;
          }
          case "deleteTask": {
            const id = Number(args.taskId);
            if (isNaN(id)) { resultMsg = "⚠️ Invalid ID."; break; }
            const res = await callTaskifyBackend(`/api/task/delete/${id}`, "DELETE");
            resultMsg = res.success ? `✅ Task ${id} deleted.` : `❌ Error: ${res.error}`;
            break;
          }
          case "getAllTask": {
            const res = await callTaskifyBackend("/api/task/getAllTask", "GET");
            resultMsg = res.success
              ? `✅ Tasks:\n` + res.data.map(t => `- ${t.title} (ID: ${t.id})`).join("\n")
              : `❌ Error: ${res.error}`;
            break;
          }
          case "getTaskById": {
            const id = Number(args.taskId);
            if (isNaN(id)) { resultMsg = "⚠️ Invalid ID."; break; }
            const res = await callTaskifyBackend(`/api/task/getTask/${id}`, "GET");
            resultMsg = res.success ? `✅ Task: ${res.data.title}` : `❌ Error: ${res.error}`;
            break;
          }
          case "updateTask": {
            const id = Number(args.taskId);
            if (isNaN(id)) { resultMsg = "⚠️ Invalid ID."; break; }
            const existing = await callTaskifyBackend(`/api/task/getTask/${id}`, "GET");
            if (!existing.success) { resultMsg = `❌ Error fetching task: ${existing.error}`; break; }

            const dateMatch = parseDate(textToSend);
            if (dateMatch) args.updatedTask = { ...args.updatedTask, dueDate: `${dateMatch.toISOString().split("T")[0]}T00:00:00` };

            const updated = { ...existing.data, ...args.updatedTask };
            const res = await callTaskifyBackend(`/api/task/update/${id}`, "PUT", updated);
            resultMsg = res.success ? `✅ Task ${id} updated.` : `❌ Error: ${res.error}`;
            break;
          }
          case "markTaskAsCompleted": {
            const id = Number(args.taskId);
            if (isNaN(id)) { resultMsg = "⚠️ Invalid ID."; break; }
            const res = await callTaskifyBackend(`/api/task/markAsCompleted/${id}`, "PUT");
            resultMsg = res.success ? `✅ Task ${id} completed.` : `❌ Error: ${res.error}`;
            break;
          }
          default:
            resultMsg = `⚠️ Unknown tool: ${name}`;
        }

        setMessages(prev => {
          const newMsgs = [...prev];
          const lastIdx = newMsgs.length - 1;
          if (newMsgs[lastIdx].content.includes("Performing")) {
            newMsgs[lastIdx] = { role: "ai", content: resultMsg };
          } else {
            newMsgs.push({ role: "ai", content: resultMsg });
          }
          return newMsgs;
        });
      } else {
        const text = resp.text();
        setMessages(prev => [...prev, { role: "ai", content: text }]);
        // Cancel any currently playing utterances before speaking the new one
        try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
        const utt = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utt);
      }
    } catch (e) {
      console.error("AI Error:", e);
      setMessages(prev => [...prev, { role: "ai", content: "⚠️ Error processing request." }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, messages]);

  // --- Speech Recognition (Active Chat) ---
  const startListening = useCallback(() => {
    if (listening || isLoading) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSpeechError("Speech API not supported."); return; }

    // Stop wake word listener temporarily
    if (wakeRecognitionRef.current) {
      try { wakeRecognitionRef.current.stop(); } catch (e) { }
    }

    try {
      recognitionRef.current = new SR();
      const recog = recognitionRef.current;
      recog.lang = "en-US";
      recog.interimResults = false;
      recog.maxAlternatives = 1;
      recog.continuous = false;

      recog.onstart = () => setListening(true);
      recog.onresult = (e) => {
        const t = e.results[e.results.length - 1][0].transcript.trim();
        if (t) handleSend(t);
        setListening(false);
      };
      recog.onerror = (e) => {
        if (e.error !== "no-speech") setSpeechError(`Error: ${e.error}`);
        setListening(false);
      };
      recog.onend = () => {
        setListening(false);
        // Resume wake word if chat is still open (or closed, logic depends on preference)
        // Actually, if chat is open, we might want to stay ready? 
        // For now, we only resume wake word if we are NOT listening anymore.
      };
      recog.start();
    } catch (e) {
      console.error("Start listening failed:", e);
      setSpeechError("Could not start mic.");
    }
  }, [listening, isLoading, handleSend]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) { }
      setListening(false);
    }
  }, []);

  // --- Wake Word Listener ---
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    wakeRecognitionRef.current = new SR();
    const wake = wakeRecognitionRef.current;
    wake.continuous = true;
    wake.interimResults = false;
    wake.lang = "en-US";

    wake.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      if (transcript.includes("hey taskify") || transcript.includes("hey buddy")) {
        setIsOpen(true);
        // Small delay to switch context
        setTimeout(() => startListening(), 500);
      }
    };

    wake.onerror = (e) => {
      // Ignore common errors like 'no-speech' or 'aborted' to keep it running
      if (e.error === 'not-allowed') {
        console.warn("Wake word mic access denied.");
        isWakeListening.current = false;
      }
    };

    wake.onend = () => {
      // If not actively listening, try to restart wake listener.
      if (!listening) {
        try {
          wake.start();
          isWakeListening.current = true;
        } catch (e) {
          // If start keeps throwing, set a short backoff to avoid infinite loops.
          setTimeout(() => {
            try { wake.start(); isWakeListening.current = true; } catch (err) { /* swallow */ }
          }, 1000);
        }
      } else {
        // If we're actively listening, just mark that wake is not active for now.
        isWakeListening.current = false;
      }
    };

    // Start wake word listener initially
    try {
      wake.start();
      isWakeListening.current = true;
    } catch (e) {
      console.warn("Wake word start failed:", e);
    }

    return () => {
      if (wake) {
        try { wake.stop(); } catch (e) { }
      }
      isWakeListening.current = false;
    };
  }, [startListening, listening]); // Re-bind if startListening changes

  // Manage Wake Word State based on `isOpen` and `listening`
  useEffect(() => {
    const wake = wakeRecognitionRef.current;
    if (!wake) return;

    if (listening) {
      // If active listening is on, pause wake word
      try { wake.stop(); isWakeListening.current = false; } catch (e) { }
    } else {
      // If not listening, ensure wake word is running (unless we want it off when chat is open?)
      // Let's keep wake word running only if chat is CLOSED, or maybe always?
      // Usually wake word is for when you are NOT interacting.
      // If chat is open, maybe we don't need wake word? 
      // Let's say: Wake word is ALWAYS active unless we are actively recording a query.
      if (!isWakeListening.current) {
        try {
          wake.start();
          isWakeListening.current = true;
        } catch (e) {
          // console.warn("Resume wake failed:", e);
        }
      }
    }
  }, [listening, isOpen]);


  return (
    <>
      {/* FAB */}
      <div className="fixed bottom-5 right-5 z-50">
        <button
          className={`p-4 rounded-full text-white shadow-xl transition-all duration-300 hover:scale-110 
            ${isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}
          `}
          onClick={() => {
            setIsOpen(!isOpen);
            if (isOpen) {
              stopListening();
              window.speechSynthesis.cancel();
            }
          }}
          disabled={!genAI}
        >
          {isOpen ? <X size={24} /> : <Bot size={24} />}
        </button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-5 w-96 max-w-[90vw] h-[60vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col z-50 border border-slate-200 dark:border-slate-700 overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
          >
            <div className="p-3 border-b border-slate-200 dark:border-slate-700 text-center bg-slate-50 dark:bg-slate-800">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Taskify Assistant</h3>
            </div>

            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`p-3 rounded-xl max-w-[85%] ${msg.role === "user"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none"
                    }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl rounded-bl-none animate-pulse">...</div>
                </div>
              )}
              {speechError && <div className="text-xs text-red-500 text-center">{speechError}</div>}
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type or speak..."
                  className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-white"
                  disabled={listening || isLoading}
                />
                <button onClick={() => window.speechSynthesis.cancel()} className="text-slate-400 hover:text-slate-600">
                  <VolumeX size={18} />
                </button>
                <button
                  onClick={listening ? stopListening : startListening}
                  className={`p-2 rounded-full transition-colors ${listening ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-blue-500'}`}
                >
                  <Mic size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatAssistant;