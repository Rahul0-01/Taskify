import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTasks,
  addTask,
  updateTask,
  deleteTask,
  markTaskCompleted,
} from '../features/taskSlice';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AutoCompleteInput from '../AutoCompleteInput';
import YourPageWrapper from "../YourPageWrapper";
import { fireConfetti } from "../utils/confetti";
import { Calendar, Flag, CheckCircle } from 'lucide-react';



// Framer Motion Variants
const headerVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, rotate: -2 },
  visible: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.4 } },
  hover: { scale: 1.03, rotate: 1, transition: { duration: 0.2 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

const TaskList = () => {
  const dispatch = useDispatch();
  const { tasks = {}, loading = false } = useSelector((state) => state.task || {});


  // Pagination & Sorting
  const [page, setPage] = useState(0);
  const [size] = useState(6);
  const [sortBy, setSortBy] = useState('dueDate');

  // Add Task Modal
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    status: 'Pending',
    completed: false,
  });

  // Edit Task Modal
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editTask, setEditTask] = useState({
    id: null,
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    status: 'Pending',
    completed: false,
  });

  // Fetch tasks on mount or when pagination/sort changes  
  useEffect(() => {
    dispatch(fetchTasks({ page, size, sortBy })).then((response) => {
      if (response.payload?.content?.length === 0 && page > 0) {
        setPage(page - 1);
      }
    });
  }, [page, size, sortBy, dispatch]);

  const taskList = tasks?.content || [];

  // Handler to add a new task
  const handleAddTask = () => {
    const formattedDate = newTask.dueDate
      ? new Date(newTask.dueDate).toISOString().slice(0, 19)
      : null;
    const taskToSend = { ...newTask, dueDate: formattedDate };
    dispatch(addTask(taskToSend)).then(() => {
      setShowAddTaskModal(false);
      setNewTask({
        title: '',
        description: '',
        dueDate: '',
        priority: 'Medium',
        status: 'Pending',
        completed: false,
      });
    });
  };

  // Handler to update an existing task
  const handleEditTask = () => {
    const formattedDate = editTask.dueDate
      ? new Date(editTask.dueDate).toISOString().slice(0, 19)
      : null;
    const taskToUpdate = { ...editTask, dueDate: formattedDate };
    dispatch(updateTask({ id: editTask.id, updatedTask: taskToUpdate })).then(() => {
      setShowEditTaskModal(false);
      setEditTask({
        id: null,
        title: '',
        description: '',
        dueDate: '',
        priority: 'Medium',
        status: 'Pending',
        completed: false,
      });
    });
  };

  // Open Edit Modal with pre-filled details
  const openEditModal = (task) => {
    setEditTask({
      ...task,
      dueDate: task.dueDate ? task.dueDate.substring(0, 10) : '',
    });
    setShowEditTaskModal(true);
  };

  // Delete Task Handler
  const handleDeleteTask = (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch(deleteTask(id));
    }
  };

  // Mark a task as complete
  const handleCompleteTask = (id) => {
    dispatch(markTaskCompleted(id));
    fireConfetti();
  };

  // Pagination
  const goToNextPage = () => {
    if (taskList.length === size) setPage(page + 1);
  };
  const goToPrevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#232526] to-[#414345] flex items-center justify-center">
        <p className="text-white text-xl font-semibold">Loading tasks...</p>
      </div>
    );
  }

  return (
    <YourPageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-[#232526] to-[#414345] dark:from-gray-900 dark:to-gray-800 p-6 text-white">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <motion.header
            variants={headerVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <h1 className="text-5xl font-extrabold text-white tracking-tight">
              Task Manager
            </h1>
          </motion.header>

          {/* Controls */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-white font-medium">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
              </select>
            </div>
            <button
              onClick={() => setShowAddTaskModal(true)}
              className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-xl shadow transition-all duration-200"
            >
              Add Task
            </button>
          </div>

          {/* Task Grid */}
          {taskList.length === 0 ? (
            <p className="text-center text-white text-xl">
              No tasks found! Create your first task.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {taskList.map((task) => (
                <motion.div
                  key={task.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-teal-400/40"
                >
                  {/* Task ID Badge */}
                  <span className="inline-block bg-teal-600 text-white text-xs font-bold px-2 py-1 rounded mb-2">
                    ID: {task.id}
                  </span>

                  {/* Title */}
                  <h3 className="text-xl font-semibold mb-2 text-white">
                    {task.title}
                  </h3>

                  {/* Priority */}
                  <p className={`text-sm font-medium mb-1 flex items-center gap-1 ${task.priority === 'High'
                    ? 'text-red-400'
                    : task.priority === 'Medium'
                      ? 'text-orange-300'
                      : 'text-green-400'
                    }`}>
                    <Flag size={14} /> Priority: {task.priority}
                  </p>

                  {/* Status */}
                  <p className={`text-sm font-medium mb-1 flex items-center gap-1 ${task.status === 'Completed'
                    ? 'text-green-400'
                    : task.status === 'In Progress'
                      ? 'text-yellow-400'
                      : 'text-gray-400'
                    }`}>
                    <CheckCircle size={14} /> Status: {task.status}
                  </p>

                  {/* Due Date */}
                  <p className="text-sm text-gray-300 mb-4 flex items-center gap-1">
                    <Calendar size={14} />
                    Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                  </p>
                  <div className="flex justify-between gap-2 mb-2">
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg transition duration-200"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => openEditModal(task)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg transition duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition duration-200"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="text-center mt-2">
                    <Link
                      to={`/task/${task.id}`}
                      className="text-teal-300 hover:underline font-medium transition"
                    >
                      View Details
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={goToPrevPage}
              disabled={page === 0}
              className="bg-white/10 text-white px-4 py-2 rounded disabled:opacity-50 transition-colors duration-200"
            >
              Prev
            </button>
            <span className="self-center font-medium text-white">Page {page + 1}</span>
            <button
              onClick={goToNextPage}
              disabled={taskList.length < size}
              className="bg-white/10 text-white px-4 py-2 rounded disabled:opacity-50 transition-colors duration-200"
            >
              Next
            </button>
          </div>

          {/* Add Task Modal */}
          <AnimatePresence>
            {showAddTaskModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
              >
                <motion.div
                  variants={modalVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="backdrop-blur-xl bg-white/5 border border-white/10 text-white rounded-2xl w-96 shadow-2xl p-6 space-y-4"
                >
                  <h2 className="text-2xl font-bold text-center">Add New Task</h2>
                  <AutoCompleteInput
                    value={newTask.title}
                    onChange={(val) => setNewTask({ ...newTask, title: val })}
                    placeholder="Title"
                  />

                  <AutoCompleteInput
                    value={newTask.description}
                    onChange={(val) => setNewTask({ ...newTask, description: val })}
                    placeholder="Description"
                  />

                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) =>
                      setNewTask({ ...newTask, dueDate: e.target.value })
                    }
                    className="w-full bg-gray-700 text-white border border-gray-600 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                  <select
                    value={newTask.priority}
                    onChange={(e) =>
                      setNewTask({ ...newTask, priority: e.target.value })
                    }
                    className="w-full bg-gray-700 text-white border border-gray-600 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                  <select
                    value={newTask.status}
                    onChange={(e) =>
                      setNewTask({ ...newTask, status: e.target.value })
                    }
                    className="w-full bg-gray-700 text-white border border-gray-600 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newTask.completed}
                      onChange={(e) =>
                        setNewTask({ ...newTask, completed: e.target.checked })
                      }
                      className="mr-2"
                    />
                    <label className="font-medium text-white">Completed</label>
                  </div>
                  <div className="flex justify-end gap-4 mt-4">
                    <button
                      onClick={handleAddTask}
                      className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition duration-200"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowAddTaskModal(false)}
                      className="text-teal-300 hover:underline font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Edit Task Modal */}
          <AnimatePresence>
            {showEditTaskModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
              >
                <motion.div
                  variants={modalVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="backdrop-blur-xl bg-white/5 border border-white/10 text-white rounded-2xl w-96 shadow-2xl p-6 space-y-4"
                >
                  <h2 className="text-2xl font-bold text-center">Edit Task</h2>
                  <AutoCompleteInput
                    value={editTask.title}
                    onChange={(val) => setEditTask({ ...editTask, title: val })}
                  />

                  <AutoCompleteInput
                    value={editTask.description}
                    onChange={(val) => setEditTask({ ...editTask, description: val })}
                  />

                  <input
                    type="date"
                    value={editTask.dueDate}
                    onChange={(e) =>
                      setEditTask({ ...editTask, dueDate: e.target.value })
                    }
                    className="w-full bg-gray-700 text-white border border-gray-600 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                  <select
                    value={editTask.priority}
                    onChange={(e) =>
                      setEditTask({ ...editTask, priority: e.target.value })
                    }
                    className="w-full bg-gray-700 text-white border border-gray-600 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                  <select
                    value={editTask.status}
                    onChange={(e) =>
                      setEditTask({ ...editTask, status: e.target.value })
                    }
                    className="w-full bg-gray-700 text-white border border-gray-600 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editTask.completed}
                      onChange={(e) =>
                        setEditTask({ ...editTask, completed: e.target.checked })
                      }
                      className="mr-2"
                    />
                    <label className="font-medium text-white">Completed</label>
                  </div>
                  <div className="flex justify-end gap-4 mt-4">
                    <button
                      onClick={handleEditTask}
                      className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition duration-200"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => setShowEditTaskModal(false)}
                      className="text-teal-300 hover:underline font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </YourPageWrapper>
  );
};

export default TaskList;
