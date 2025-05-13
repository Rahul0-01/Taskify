// src/pages/UserDetailsPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  addTask,
  updateTask,
  deleteTask,
  markTaskCompleted,
} from '../features/taskSlice';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import getSmartSuggestion from '../utils/SmartSuggestion';
import AutoCompleteInput from '../AutoCompleteInput'; 

const BASE_URL = 'http://localhost:8080/api/task';

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  hover: { scale: 1.04, transition: { duration: 0.2 } },
};
const modalBackdrop = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const modalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

export default function UserDetailsPage() {
  const { userid } = useParams();
  const dispatch = useDispatch();
  const token = localStorage.getItem('token');
  const currentUserId = localStorage.getItem('userId');
  const roles = localStorage.getItem('roles');
  const isAdmin = roles && roles.includes('ADMIN');

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectingId, setProjectingId] = useState(null);

  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    status: 'Pending',
  });
  const [suggestion, setSuggestion] = useState(null);

  const [showEdit, setShowEdit] = useState(false);
  const [editTask, setEditTask] = useState({
    id: null,
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    status: 'Pending',
  });

  const fetchUserTasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/getByUser/${userid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (userid) fetchUserTasks();
  }, [userid]);

  const handleAdd = () => {
    if (!newTask.title.trim()) return alert('Title required');
    if (isAdmin && userid === currentUserId) {
      alert("As an admin, please assign tasks from the user's detail page.");
      return;
    }
    const payload = {
      ...newTask,
      dueDate: newTask.dueDate
        ? new Date(newTask.dueDate).toISOString().slice(0, 19)
        : null,
      assignedTo: { id: +userid },
    };
    dispatch(addTask(payload))
      .unwrap()
      .then(() => {
        setShowAdd(false);
        setNewTask({ title: '', description: '', dueDate: '', priority: 'Medium', status: 'Pending' });
        setSuggestion(null);
        fetchUserTasks();
      })
      .catch(console.error);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this task?')) return;
    dispatch(deleteTask(id))
      .unwrap()
      .then(() => setTasks((t) => t.filter((x) => x.id !== id)))
      .catch(console.error);
  };

  const handleToggle = (id) => {
    dispatch(markTaskCompleted(id))
      .unwrap()
      .then(fetchUserTasks)
      .catch(console.error);
  };

  const openEdit = (t) => {
    setEditTask({
      id: t.id,
      title: t.title,
      description: t.description,
      dueDate: t.dueDate ? t.dueDate.slice(0, 10) : '',
      priority: t.priority,
      status: t.status,
    });
    setShowEdit(true);
  };

  const handleSave = () => {
    const payload = {
      ...editTask,
      dueDate: editTask.dueDate
        ? new Date(editTask.dueDate).toISOString().slice(0, 19)
        : null,
    };
    dispatch(updateTask({ id: editTask.id, updatedTask: payload }))
      .unwrap()
      .then(() => {
        setShowEdit(false);
        fetchUserTasks();
      })
      .catch(console.error);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
      <motion.h1
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="text-4xl font-extrabold text-center mb-8 tracking-wider"
      >
        User {userid}’s Task Board
      </motion.h1>

      <div className="text-center mb-8">
        <motion.button
          onClick={() => {
            // reset state and open
            setNewTask({ title: '', description: '', dueDate: '', priority: 'Medium', status: 'Pending' });
            setSuggestion(null);
            setShowAdd(true);
          }}
          whileTap={{ scale: 0.9 }}
          className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 rounded-full shadow-lg transition"
        >
          + Add New Task
        </motion.button>
      </div>

      {/* Task Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {tasks.map((t) => (
          <motion.div
            key={t.id}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            className="holo-card relative p-6 cursor-pointer"
            onClick={() => {
              setProjectingId(t.id);
              setTimeout(() => setProjectingId(null), 600);
            }}
          >
            <h3 className="text-2xl font-bold mb-2 text-cyan-300">{t.title}</h3>
            <span className="inline-block bg-teal-600 text-white text-xs font-bold px-2 py-1 rounded mb-2">
                ID: {t.id}
              </span>
            <p className="text-sm text-gray-400 mb-1">
              <strong>Due:</strong> {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'}
            </p>
            <p className="text-sm mb-1">
              <strong>Priority:</strong> <span className="text-cyan-300">{t.priority}</span>
            </p>
            <p className="text-sm mb-4">
              <strong>Status:</strong> <span className="text-cyan-300">{t.status}</span>
            </p>
            <div className="mt-auto flex flex-wrap gap-2">
              <motion.button
                onClick={() => handleToggle(t.id)}
                whileTap={{ scale: 0.9 }}
                className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 rounded-full text-sm"
              >
                {t.completed ? 'Mark Incomplete' : 'Mark Complete'}
              </motion.button>
              <motion.button
                onClick={() => openEdit(t)}
                whileTap={{ scale: 0.9 }}
                className="px-3 py-1 bg-cyan-400 text-black hover:bg-cyan-500 rounded-full text-sm"
              >
                Edit
              </motion.button>
              <motion.button
                onClick={() => handleDelete(t.id)}
                whileTap={{ scale: 0.9 }}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-full text-sm"
              >
                Delete
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <motion.div
              className="bg-gray-800 text-white rounded-xl p-6 w-96 shadow-lg space-y-4"
              variants={modalVariants}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Add New Task</h2>
                <button onClick={() => setShowAdd(false)} className="text-red-400">
                  ✖
                </button>
              </div>

              {/* Title */}
              <AutoCompleteInput
  value={newTask.title}
  onChange={(val) => setNewTask({ ...newTask, title: val })}
  placeholder="Title"
/>

              {/* Description */}
              <AutoCompleteInput
  value={newTask.description}
  onChange={(val) => setNewTask({ ...newTask, description: val })}
  isTextArea={true}
  placeholder="Description"
/>

              {/* Due Date */}
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="w-full p-2 bg-gray-700 rounded focus:outline-none"
              />

              {/* Priority & Status */}
              <div className="flex justify-between">
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="w-1/2 mr-2 p-2 bg-gray-700 rounded"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
                <select
                  value={newTask.status}
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                  className="w-1/2 p-2 bg-gray-700 rounded"
                >
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>

              {/* Smart Suggestion */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const s = getSmartSuggestion(newTask.title, '');
                    setSuggestion(s);
                  }}
                  className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-md text-white transition"
                >
                  💡 Smart Suggestion
                </button>
                {suggestion && (
                  <div className="bg-cyan-900 p-3 rounded space-y-2">
                    <p className="text-cyan-200">
                      🤖 <strong>Suggested:</strong> {suggestion}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setNewTask((p) => ({ ...p, title: suggestion }));
                          setSuggestion(null);
                        }}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-black px-3 py-1 rounded"
                      >
                        Use
                      </button>
                      <button
                        onClick={() => setSuggestion(null)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Save */}
              <motion.button
                onClick={handleAdd}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold p-2 rounded"
              >
                Save Task
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Task Modal (unchanged) */}
      <AnimatePresence>
        {showEdit && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <motion.div
              className="bg-gray-800 text-white rounded-xl p-6 w-96 shadow-lg space-y-4"
              variants={modalVariants}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Edit Task</h2>
                <button onClick={() => setShowEdit(false)} className="text-red-400">
                  ✖
                </button>
              </div>

              <AutoCompleteInput
  value={editTask.title}
  onChange={(val) => setEditTask({ ...editTask, title: val })}
  placeholder="Title"

/>
         <AutoCompleteInput
  value={editTask.description}
  onChange={(val) => setEditTask({ ...editTask, description: val })}
  isTextArea={true}
  placeholder="Description"
/>
              <input
                type="date"
                value={editTask.dueDate}
                onChange={(e) => setEditTask({ ...editTask, dueDate: e.target.value })}
                className="w-full p-2 bg-gray-700 rounded"
              />
              <div className="flex justify-between">
                <select
                  value={editTask.priority}
                  onChange={(e) => setEditTask({ ...editTask, priority: e.target.value })}
                  className="w-1/2 mr-2 p-2 bg-gray-700 rounded"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
                <select
                  value={editTask.status}
                  onChange={(e) => setEditTask({ ...editTask, status: e.target.value })}
                  className="w-1/2 p-2 bg-gray-700 rounded"
                >
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>
              <motion.button
                onClick={handleSave}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-green-500 hover:bg-green-600 text-black font-bold p-2 rounded"
              >
                Update Task
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
