import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, X, Mic, SendHorizonal, VolumeX } from 'lucide-react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { parseDate } from "chrono-node";

// --- Google AI API Key and SDK Initialization ---
const googleAiApiKey = process.env.REACT_APP_GOOGLE_AI_API_KEY;

// --- Taskify Backend Configuration ---
const TASKIFY_BACKEND_URL = process.env.REACT_APP_TASKIFY_BACKEND_URL;

// --- Define Tools/Functions for Taskify Backend ---
const taskifyTools = [
  {
    functionDeclarations: [
      {
        name: "createTask",
        description: "Creates a new task. Admins can assign it to a specific user using userId or assignedTo.id.",
        parameters: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING", description: "Title of the task." },
            description: { type: "STRING", description: "Description of the task." },
            dueDate: { type: "STRING", description: "Due date of the task (ISO format)." },
            priority: { type: "STRING", description: "Priority of the task (e.g., HIGH, MEDIUM, LOW)." },
            status: { type: "STRING", description: "Initial status of the task." },
            userId: { type: "NUMBER", description: "User ID to assign the task to (used by admin)." },
            assignedTo: {
              type: "OBJECT",
              properties: {
                id: { type: "NUMBER", description: "ID of the user to assign the task to." }
              }
            }
          },
          required: ["title"]
        }
      },
      {
        name: "getAllTask",
        description: "Retrieves all tasks (non-paginated).",
        parameters: {
          type: "OBJECT",
          properties: {}
        }
      },
      {
        name: "getTaskById",
        description: "Retrieves a specific task by ID.",
        parameters: {
          type: "OBJECT",
          properties: {
            taskId: { type: "NUMBER", description: "ID of the task." }
          },
          required: ["taskId"]
        }
      },
      {
        name: "updateTask",
        description: "Updates an existing task by ID.",
        parameters: {
          type: "OBJECT",
          properties: {
            taskId: { type: "NUMBER", description: "ID of the task to update." },
            updatedTask: {
              type: "OBJECT",
              description: "Updated fields of the task.",
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
          properties: {
            taskId: { type: "NUMBER", description: "ID of the task to delete." }
          },
          required: ["taskId"]
        }
      },
      {
        name: "getTasksByStatus",
        description: "Gets tasks filtered by their status.",
        parameters: {
          type: "OBJECT",
          properties: {
            status: { type: "STRING", description: "Status to filter by." }
          },
          required: ["status"]
        }
      },
      {
        name: "getTasksByPriority",
        description: "Gets tasks filtered by their priority.",
        parameters: {
          type: "OBJECT",
          properties: {
            priority: { type: "STRING", description: "Priority to filter by." }
          },
          required: ["priority"]
        }
      },
      {
        name: "getTasksByDueDate",
        description: "Gets tasks filtered by due date.",
        parameters: {
          type: "OBJECT",
          properties: {
            dueDate: { type: "STRING", description: "Due date in YYYY-MM-DD format." }
          },
          required: ["dueDate"]
        }
      },
      {
        name: "assignTask",
        description: "Assigns a task to a user.",
        parameters: {
          type: "OBJECT",
          properties: {
            taskId: { type: "NUMBER", description: "ID of the task." },
            assignedUser: {
              type: "OBJECT",
              properties: {
                id: { type: "NUMBER", description: "ID of the user to assign the task to." }
              }
            }
          },
          required: ["taskId", "assignedUser"]
        }
      },
      {
        name: "updateTaskStatus",
        description: "Updates the status of a task.",
        parameters: {
          type: "OBJECT",
          properties: {
            taskId: { type: "NUMBER", description: "ID of the task." },
            status: { type: "STRING", description: "New status for the task." }
          },
          required: ["taskId", "status"]
        }
      },
      {
        name: "getTasksByUser",
        description: "Gets all tasks assigned to a specific user.",
        parameters: {
          type: "OBJECT",
          properties: {
            userId: { type: "NUMBER", description: "ID of the user." }
          },
          required: ["userId"]
        }
      },
      {
        name: "getTasksByDateRange",
        description: "Gets tasks within a specific date range.",
        parameters: {
          type: "OBJECT",
          properties: {
            startDate: { type: "STRING", description: "Start date in YYYY-MM-DD format." },
            endDate: { type: "STRING", description: "End date in YYYY-MM-DD format." }
          },
          required: ["startDate", "endDate"]
        }
      },
      {
        name: "markTaskAsCompleted",
        description: "Marks a task as completed.",
        parameters: {
          type: "OBJECT",
          properties: {
            taskId: { type: "NUMBER", description: "ID of the task." }
          },
          required: ["taskId"]
        }
      },
      {
        name: "getAllTaskPaged",
        description: "Retrieves paginated and sorted tasks.",
        parameters: {
          type: "OBJECT",
          properties: {
            page: { type: "NUMBER", description: "Page number (starting from 0)." },
            size: { type: "NUMBER", description: "Number of tasks per page." },
            sortBy: { type: "STRING", description: "Field to sort by (e.g., dueDate, priority)." }
          },
          required: ["page", "size", "sortBy"]
        }
      }
    ]
  }
];

// Initialize Google AI SDK with tools
let genAI, model;
if (googleAiApiKey) {
  try {
    genAI = new GoogleGenerativeAI(googleAiApiKey);
    const generationConfig = { maxOutputTokens: 1000 };
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];
    model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig,
      safetySettings,
      tools: taskifyTools,
    });
    console.log("Google AI SDK Initialized with Taskify Tools.");
  } catch (e) {
    console.error("Failed to initialize Google AI SDK:", e);
    genAI = null;
    model = null;
  }
} else {
  console.error("ERROR: Google AI API Key not found.");
}

const AIChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", content: "Hi! I’m Taskify Assistant. How can I help you manage tasks?" },
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef(null);
  const chatScrollRef = useRef(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Helper: call Taskify backend with JWT and handle JSON or text responses
  const callTaskifyBackend = async (endpoint, method = "GET", body = null) => {
    if (!TASKIFY_BACKEND_URL) {
      return { success: false, error: "Backend URL not configured." };
    }
    const token = localStorage.getItem("token");
    try {
      const options = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      };
      if (body && ["POST", "PUT", "PATCH"].includes(method)) {
        options.body = JSON.stringify(body);
      }

      const res = await fetch(`${TASKIFY_BACKEND_URL}${endpoint}`, options);
      if (!res.ok) {
        let errText = await res.text();
        let errBody;
        try {
          errBody = JSON.parse(errText);
        } catch {
          errBody = errText;
        }
        const msg = errBody?.message || errBody || res.statusText;
        throw new Error(`Backend Error (${res.status}): ${msg}`);
      }

      if (res.status === 204) {
        return { success: true, data: null };
      }

      const ct = res.headers.get("content-type") || "";
      let data;
      if (ct.includes("application/json")) {
        data = await res.json();
      } else {
        data = await res.text();
      }
      return { success: true, data };
    } catch (e) {
      console.error(`Error calling ${endpoint}:`, e);
      return { success: false, error: e.message };
    }
  };

  // Main send handler
  const handleSend = async (textOverride) => {
    if (!genAI || !model) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "⚠️ AI Service not initialized. Check API Key and console errors." },
      ]);
      return;
    }
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    const userMsg = { role: "user", content: textToSend };
    setIsLoading(true);
    setMessages((prev) => [...prev, userMsg]);
    if (!textOverride) setInput("");
    setSpeechError("");

    const history = messages
      .concat(userMsg)
      .filter((m) => ["user", "ai", "function"].includes(m.role))
      .slice(1)
      .map((m) => ({ role: m.role === "ai" ? "model" : m.role, parts: [{ text: m.content }] }));

    try {
      const chatSession = model.startChat({ history });
      const result = await chatSession.sendMessage(textToSend);
      const resp = result.response;
      const fc = resp.candidates?.[0]?.content?.parts?.[0]?.functionCall;

      if (fc) {
        const { name, args = {} } = fc;
        setMessages((prev) => [...prev, { role: "ai", content: `🧠 Okay, performing: ${name}...` }]);
        let userMsgResult = "";

        switch (name) {
          case "createTask": {
            if (!args.title) {
              userMsgResult = "⚠️ Please provide a title.";
              break;
            }

            const dateMatch = parseDate(textToSend);
            if (dateMatch) {
              const dateOnly = dateMatch.toISOString().split("T")[0];
              args.dueDate = `${dateOnly}T00:00:00`;
            }

            if (!args.dueDate) {
              userMsgResult = "⚠️ Please provide a due date.";
              break;
            }

            const res = await callTaskifyBackend("/create", "POST", {
              title: args.title,
              description: args.description,
              dueDate: args.dueDate,
              priority: args.priority || "Low",
              status: args.status || "Pending",
              userId: args.userId,
              assignedTo: args.assignedTo,
            });

            userMsgResult = res.success
              ? `✅ Task "${args.title}" created${res.data?.id ? ` (ID: ${res.data.id})` : ""}.`
              : `❌ Error: ${res.error}`;
            break;
          }

          case "deleteTask": {
            const id = Number(args.taskId);
            if (isNaN(id)) {
              userMsgResult = "⚠️ Invalid task ID.";
              break;
            }
            const res = await callTaskifyBackend(`/delete/${id}`, "DELETE");
            userMsgResult = res.success ? `✅ Task ${id} deleted.` : `❌ Error: ${res.error}`;
            break;
          }

          case "getAllTask": {
            const res = await callTaskifyBackend("/getAllTask", "GET");
            userMsgResult = res.success
              ? `✅ Tasks:\n` + res.data.map((t) => `- ${t.title} (ID: ${t.id})`).join("\n")
              : `❌ Error: ${res.error}`;
            break;
          }

          case "getTaskById": {
            const id = Number(args.taskId);
            if (isNaN(id)) {
              userMsgResult = "⚠️ Invalid task ID.";
              break;
            }
            const res = await callTaskifyBackend(`/getTask/${id}`, "GET");
            userMsgResult = res.success
              ? `✅ Task: ${res.data.title} (ID: ${res.data.id})`
              : `❌ Error: ${res.error}`;
            break;
          }

        
          case "getTasksByStatus": {
            const res = await callTaskifyBackend(`/getByStatus/${args.status}`, "GET");
            userMsgResult = res.success
              ? `✅ Tasks with status "${args.status}":\n` + res.data.map((t) => `- ${t.title} (ID: ${t.id})`).join("\n")
              : `❌ Error: ${res.error}`;
            break;
          }

          case "getTasksByPriority": {
            if (!args.priority || typeof args.priority !== "string" || args.priority.length === 0) {
              userMsgResult = "❌ Error: Priority argument is missing or invalid.";
              break;
            }
            const formattedPriority =
              args.priority[0].toUpperCase() + args.priority.slice(1).toLowerCase();
            const res = await callTaskifyBackend(`/getByPriority/${formattedPriority}`, "GET");
            userMsgResult = res.success
              ? `✅ Tasks with priority "${args.priority}":\n` +
                res.data.map((t) => `- ${t.title} (ID: ${t.id})`).join("\n")
              : `❌ Error: ${res.error}`;
            break;
          }

          case "getTasksByDueDate": {
            if (!args.dueDate || typeof args.dueDate !== "string") {
              userMsgResult = "❌ Error: Due date argument is missing or invalid.";
              break;
            }
            const urlPath = `/getByDueDate?dueDate=${encodeURIComponent(args.dueDate)}`;
            const res = await callTaskifyBackend(urlPath, "GET");
            userMsgResult = res.success
              ? `✅ Tasks due on ${args.dueDate}:\n` + res.data.map((t) => `- ${t.title} (ID: ${t.id})`).join("\n")
              : `❌ Error: ${res.error}`;
            break;
          }

          case "assignTask": {
            const id = Number(args.taskId);
            if (isNaN(id) || !args.assignedUser?.id) {
              userMsgResult = "⚠️ Invalid task ID or assigned user ID.";
              break;
            }
            const res = await callTaskifyBackend(`/tasks/${id}/assign`, "PUT", args.assignedUser);
            userMsgResult = res.success ? `✅ Task ${id} assigned.` : `❌ Error: ${res.error}`;
            break;
          }

          case "updateTask": {
            const id = Number(args.taskId);
            if (isNaN(id)) {
              userMsgResult = "⚠️ Invalid task ID.";
              break;
            }

            // Step 1: Fetch existing task
            const existing = await callTaskifyBackend(`/getById/${id}`, "GET");
            if (!existing.success || !existing.data) {
              userMsgResult = `❌ Error fetching task ${id}: ${existing.error}`;
              break;
            }

            const dateMatch = parseDate(textToSend);
            if (dateMatch) {
              const dateOnly = dateMatch.toISOString().split("T")[0];
              args.updatedTask = {
                ...args.updatedTask,
                dueDate: `${dateOnly}T00:00:00`,
              };
            }

            // Step 2: Merge updates with existing task
            const updatedTask = {
              ...existing.data,
              ...args.updatedTask,
            };

            // Step 3: Send full task object
            const res = await callTaskifyBackend(`/update/${id}`, "PUT", updatedTask);
            userMsgResult = res.success ? `✅ Task ${id} updated.` : `❌ Error: ${res.error}`;
            break;
          }

          case "getTasksByUser": {
            const userId = Number(args.userId);
            if (isNaN(userId)) {
              userMsgResult = "⚠️ Invalid user ID.";
              break;
            }
            const res = await callTaskifyBackend(`/getByUser/${userId}`, "GET");
            userMsgResult = res.success
              ? `✅ Tasks for user ${userId}:\n` +
                res.data.map((t) => `- ${t.title} (ID: ${t.id})`).join("\n")
              : `❌ Error: ${res.error}`;
            break;
          }

          case "getTasksByDateRange": {
            const { startDate, endDate } = args;
            if (!startDate || !endDate) {
              userMsgResult = "⚠️ Please provide both startDate and endDate.";
              break;
            }
            const qp = new URLSearchParams({ startDate, endDate });
            const res = await callTaskifyBackend(`/tasks/date-range?${qp}`, "GET");
            userMsgResult = res.success
              ? `✅ Tasks in date range:\n` +
                res.data.map((t) => `- ${t.title} (ID: ${t.id})`).join("\n")
              : `❌ Error: ${res.error}`;
            break;
          }

          case "markTaskAsCompleted": {
            const id = Number(args.taskId);
            if (isNaN(id)) {
              userMsgResult = "⚠️ Invalid task ID.";
              break;
            }
            const res = await callTaskifyBackend(`/tasks/${id}/complete`, "PATCH");
            userMsgResult = res.success ? `✅ Task ${id} marked as completed.` : `❌ Error: ${res.error}`;
            break;
          }

          case "getAllTaskPaged": {
            const { page, size, sortBy } = args;
            const qp = new URLSearchParams({ page, size, sortBy });
            const res = await callTaskifyBackend(`/tasks/paged?${qp}`, "GET");
            userMsgResult = res.success
              ? `✅ Paged Tasks:\n` +
                res.data.content.map((t) => `- ${t.title} (ID: ${t.id})`).join("\n")
              : `❌ Error: ${res.error}`;
            break;
          }

          case "showTasks": {
            const qp = new URLSearchParams();
            if (args.dateFilter) qp.append("date", args.dateFilter);
            if (args.statusFilter) qp.append("status", args.statusFilter);
            const res = await callTaskifyBackend(`/tasks${qp.toString() ? `?${qp}` : ""}`, "GET");
            if (res.success && Array.isArray(res.data)) {
              userMsgResult =
                res.data.length === 0
                  ? "✅ No tasks found."
                  : "✅ Tasks:\n" + res.data.map((t) => `- ${t.title} [${t.status || 'N/A'}]${t.dueDate ? ` (Due: ${t.dueDate})` : ''} (ID: ${t.id})`)    .join("\n");
            } else {
              userMsgResult = res.success ? "⚠️ Unexpected data." : `❌ Error: ${res.error}`;
            }
            break;
          }

          default:
            userMsgResult = `⚠️ Cannot perform: ${name}.`;
        }

        setMessages((prev) => {
          const idx = prev.map((m) => m.content).lastIndexOf(`🧠 Okay, performing: ${name}...`);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = { role: "ai", content: userMsgResult };
            return copy;
          }
          return [...prev, { role: "ai", content: userMsgResult }];
        });
      } else {
        const text = resp.text();
        setMessages((prev) => [...prev, { role: "ai", content: text }]);
        const utt = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utt);
      }
    } catch (e) {
      console.error("AI Error:", e);
      let msg = e.message || String(e);
      if (msg.includes("SAFETY")) msg = "Blocked by safety.";
      else if (msg.includes("API key")) msg = "Invalid API key.";
      else if (msg.includes("429")) msg = "Quota exceeded.";
      else if (msg.includes("fetch")) msg = "Network error.";
      setMessages((prev) => [...prev, { role: "ai", content: `⚠️ ${msg}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    if (listening || isLoading) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setSpeechError("Speech API not supported.");
      return;
    }
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
      else setSpeechError("No speech detected.");
      setListening(false);
    };
    recog.onerror = (e) => {
      setSpeechError(`Speech Error: ${e.error}`);
      setListening(false);
    };
    recog.onend = () => setListening(false);
    try {
      recog.start();
    } catch {
      setSpeechError("Could not start listening.");
    }
  };
  const stopListening = () => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-5 right-5 z-50">
        <button
          className={`
            p-4 rounded-full text-white shadow-xl
            transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2
            ${isOpen
              ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:ring-red-500'
              : 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:ring-blue-500'
            }
            disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100
          `}
          onClick={() => {
            if (!genAI || !model) return;
            setIsOpen(!isOpen);
            if (isOpen) {
              stopListening(); // Stop listening if closing
              window.speechSynthesis.cancel(); // Stop speaking if closing
            }
          }}
          disabled={!genAI || !model}
          aria-label={isOpen ? "Close chat" : "Open chat assistant"}
        >
          {isOpen ? <X size={24} /> : <Bot size={24} />}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <motion.div
          className="fixed bottom-24 right-5 w-96 max-w-[calc(100vw-2.5rem)] h-[60vh] max-h-[500px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col z-50 border border-slate-200 dark:border-slate-700 overflow-hidden"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }} // Added exit animation
          transition={{ duration: 0.25, ease: "easeOut" }} // Slightly smoother transition
        >
          {/* Header (Optional but recommended for context) */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-700 text-center">
             <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Chat Assistant</h3>
          </div>

          {/* Message Display Area */}
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 text-sm scroll-smooth">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-3 rounded-xl break-words max-w-[85%] ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white rounded-br-none" // User message style
                      : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100 rounded-bl-none" // Assistant message style
                  }`}
                >
                  {/* Consider using Markdown rendering here if applicable */}
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Loading Indicator: Three dots */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700 rounded-bl-none inline-flex items-center space-x-1.5">
                  <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-pulse delay-75"></span>
                  <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-pulse delay-150"></span>
                  <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-pulse delay-300"></span>
                </div>
              </div>
            )}

            {/* Status/Error Messages */}
            {speechError && (
              <div className="px-3 py-1 text-xs text-red-600 dark:text-red-400 text-center bg-red-50 dark:bg-red-900/30 rounded">{speechError}</div>
            )}
            {!genAI && !googleAiApiKey && (
              <div className="px-3 py-1 text-xs text-red-600 dark:text-red-400 text-center bg-red-50 dark:bg-red-900/30 rounded">
                ⚠️ AI Service failed: API Key missing. Check console.
              </div>
            )}
            {!genAI && googleAiApiKey && (
              <div className="px-3 py-1 text-xs text-red-600 dark:text-red-400 text-center bg-red-50 dark:bg-red-900/30 rounded">
                ⚠️ AI Service failed to initialize. Check console for errors.
              </div>
            )}
            {genAI && !TASKIFY_BACKEND_URL && (
              <div className="px-3 py-1 text-xs text-orange-600 dark:text-orange-400 text-center bg-orange-50 dark:bg-orange-900/30 rounded">
                ⚠️ Backend URL not configured. Task actions may fail.
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-300 dark:border-slate-600 rounded-full px-3 py-1.5 shadow-inner transition-all duration-300">
              {/* Input Field */}
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={genAI && model ? "Type or speak..." : "AI unavailable"}
                className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 disabled:opacity-60"
                disabled={listening || isLoading || !genAI || !model}
                rows={1} // Keep it single line visually unless needed otherwise
              />

              {/* Stop Speaking Button */}
              <button
                onClick={() => window.speechSynthesis.cancel()}
                title="Stop speaking"
                disabled={isLoading} // Only disable if loading, maybe check if speaking?
                className="rounded-full p-2 transition-colors duration-200 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Stop text-to-speech output"
              >
                <VolumeX size={18} /> {/* Use a more specific icon */}
              </button>

              {/* Mic Button */}
              <button
                onClick={listening ? stopListening : startListening}
                title={listening ? "Stop listening" : "Start voice input"}
                disabled={isLoading || !genAI || !model}
                className={`rounded-full p-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  listening
                    ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
                aria-label={listening ? "Stop voice input" : "Start voice input"}
              >
                <Mic size={18} />
              </button>

              {/* Send Button (Icon) */}
              <button
                onClick={handleSend}
                disabled={!input.trim() || listening || isLoading || !genAI || !model}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-blue-400"
                aria-label="Send message"
              >
                <SendHorizonal size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default AIChatAssistant;
