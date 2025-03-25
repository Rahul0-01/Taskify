import React, { useState, useEffect, useCallback } from 'react';

import axios from 'axios';

const TaskList = () => {

   // State for tasks, loading, and pagination controls
   

   const [page, setPage] = useState(0);
   const [size, setSize] = useState(6);
   const [sortBy, setSortBy] = useState('dueDate');
   const [totalPages, setTotalPages] = useState(0);
   
  // State for tasks and loading indicator
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for controlling the Add Task Modal and its form fields
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');
  const [newTaskStatus, setNewTaskStatus] = useState('Pending');
  const [newTaskCompleted, setNewTaskCompleted] = useState(false);

  // State for controlling the Edit Task Modal and its form fields
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDescription, setEditTaskDescription] = useState('');
  const [editTaskDueDate, setEditTaskDueDate] = useState('');
  const [editTaskPriority, setEditTaskPriority] = useState('Medium');
  const [editTaskStatus, setEditTaskStatus] = useState('Pending');
  const [editTaskCompleted, setEditTaskCompleted] = useState(false);

  // Base URL for API calls (backend on port 8080)
  const BASE_URL = 'http://localhost:8080/api/task';

  // Fetch tasks when component mounts
  // Define fetchAllTasks first
  const fetchAllTasks = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/getAllTaskPaged`, {
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        params: { page, size, sortBy },
      });
      setTasks(response.data); // response.data is directly the array
      setTotalPages(1); // Set to 1 because backend doesn’t send pagination data
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [page, size, sortBy]);
  
  // Then use the useEffect with fetchAllTasks as dependency
  useEffect(() => {
    fetchAllTasks();
  }, [fetchAllTasks]);

 
// Handlers for pagination controls
const goToNextPage = () => {
  if (page < totalPages - 1) setPage(page + 1);
};

const goToPrevPage = () => {
  if (page > 0) setPage(page - 1);
};



  // Handler to add a new task
  const handleAddTask = async () => {
    try {
      const token = localStorage.getItem('token');
      // Format due date as ISO string (append T00:00:00 if needed)
      const formattedDueDate = newTaskDueDate ? `${newTaskDueDate}T00:00:00` : '';
      const newTask = {
        title: newTaskTitle,
        description: newTaskDescription,
        dueDate: formattedDueDate,
        priority: newTaskPriority,
        status: newTaskStatus,
        completed: newTaskCompleted,
      };
      const response = await axios.post(`${BASE_URL}/create`, newTask, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (response.status === 200) {
        setShowAddTaskModal(false);
        resetAddForm();
        fetchAllTasks();
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  // Handler to update an existing task
  const handleUpdateTask = async () => {
    try {
      const token = localStorage.getItem('token');
      const formattedDueDate = editTaskDueDate ? `${editTaskDueDate}T00:00:00` : '';
      const updatedTask = {
        title: editTaskTitle,
        description: editTaskDescription,
        dueDate: formattedDueDate,
        priority: editTaskPriority,
        status: editTaskStatus,
        completed: editTaskCompleted,
      };
      const response = await axios.put(`${BASE_URL}/update/${editTaskId}`, updatedTask, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (response.status === 200) {
        setShowEditTaskModal(false);
        resetEditForm();
        fetchAllTasks();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Handler to open the Edit Task modal and populate form fields
  const openEditModal = (task) => {
    setEditTaskId(task.id);
    setEditTaskTitle(task.title);
    setEditTaskDescription(task.description);
    // Extract date portion from dueDate if available
    setEditTaskDueDate(task.dueDate ? task.dueDate.substring(0, 10) : '');
    setEditTaskPriority(task.priority || 'Medium');
    setEditTaskStatus(task.status || 'Pending');
    setEditTaskCompleted(task.completed);
    setShowEditTaskModal(true);
  };

  // Handler to delete a task
  const deleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASE_URL}/delete/${id}`, {
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      });
      fetchAllTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Handler to mark a task as completed
  const markAsCompleted = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${BASE_URL}/markAsCompleted/${taskId}`, null, {
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      });
      fetchAllTasks();
    } catch (error) {
      console.error('Error marking task as completed:', error);
    }
  };

  // Reset Add Task form fields
  const resetAddForm = () => {
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskDueDate('');
    setNewTaskPriority('Medium');
    setNewTaskStatus('Pending');
    setNewTaskCompleted(false);
  };

  // Reset Edit Task form fields
  const resetEditForm = () => {
    setEditTaskId(null);
    setEditTaskTitle('');
    setEditTaskDescription('');
    setEditTaskDueDate('');
    setEditTaskPriority('Medium');
    setEditTaskStatus('Pending');
    setEditTaskCompleted(false);
  };

  if (loading) return <p className="text-center text-gray-600">Loading tasks...</p>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-8">Task List</h1>
      
      {/* Sorting and Filtering Controls */}
      <div className="flex justify-center items-center gap-4 mb-6">
        <div>
          <label className="mr-2">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border p-1 rounded"
          >
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
          </select>
        </div>
        {/* You can add additional filters or a search bar here */}
      </div>

      <div className="flex justify-end mb-6">
  <button
    onClick={() => setShowAddTaskModal(true)}
    className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded transition-colors duration-200"
  >
    Add Task
  </button>
</div>

      {/* Tasks Grid */}
      {loading ? (
  <p className="text-center text-gray-600 text-xl">Loading tasks...</p>
) : tasks?.length === 0 ? (
  <p className="text-center text-gray-600 text-xl">No tasks found! Create your first task.</p>
) : (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 place-items-center">
    {tasks.map((task) => (
      <div key={task.id} className="bg-white shadow-lg p-6 rounded-2xl w-80 border border-gray-200 hover:scale-105 transition-transform duration-200">
        <h3 className="text-xl font-semibold mb-2">{task.title}</h3>
        <p className="text-gray-600 mb-2">{task.description}</p>
        <p className="text-sm text-gray-500 mb-1">Priority: {task.priority || 'N/A'}</p>
        <p className="text-sm text-gray-500 mb-1">Status: {task.status || 'N/A'}</p>
        <p className="text-sm text-gray-500 mb-4">
          Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
        </p>
        <div className="flex justify-between gap-2">
          <button onClick={() => markAsCompleted(task.id)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition-colors duration-200">Complete</button>
          <button onClick={() => openEditModal(task)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors duration-200">Edit</button>
          <button onClick={() => deleteTask(task.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors duration-200">Delete</button>
        </div>
      </div>
    ))}
  </div>
)}

      
      {/* Pagination Controls */}
      <div className="flex justify-center mt-8 gap-4">
        <button 
          onClick={goToPrevPage} 
          disabled={page === 0} 
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="self-center">Page {page + 1} of {totalPages}</span>
        <button 
          onClick={goToNextPage} 
          disabled={page >= totalPages - 1} 
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Add Task Modal */}      
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-center">Add New Task</h2>
            <input
              type="text"
              placeholder="Title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full border p-2 rounded mb-3"
            />
            <textarea
              placeholder="Description"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              className="w-full border p-2 rounded mb-3"
            />
            <input
              type="date"
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
              className="w-full border p-2 rounded mb-3"
            />
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value)}
              className="w-full border p-2 rounded mb-3"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
            <select
              value={newTaskStatus}
              onChange={(e) => setNewTaskStatus(e.target.value)}
              className="w-full border p-2 rounded mb-3"
            >
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={newTaskCompleted}
                onChange={(e) => setNewTaskCompleted(e.target.checked)}
                className="mr-2"
              />
              <label>Completed</label>
            </div>
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={handleAddTask}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Task Modal */}
      {showEditTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-center">Edit Task</h2>
            <input
              type="text"
              placeholder="Title"
              value={editTaskTitle}
              onChange={(e) => setEditTaskTitle(e.target.value)}
              className="w-full border p-2 rounded mb-3"
            />
            <textarea
              placeholder="Description"
              value={editTaskDescription}
              onChange={(e) => setEditTaskDescription(e.target.value)}
              className="w-full border p-2 rounded mb-3"
            />
            <input
              type="date"
              value={editTaskDueDate}
              onChange={(e) => setEditTaskDueDate(e.target.value)}
              className="w-full border p-2 rounded mb-3"
            />
            <select
              value={editTaskPriority}
              onChange={(e) => setEditTaskPriority(e.target.value)}
              className="w-full border p-2 rounded mb-3"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
            <select
              value={editTaskStatus}
              onChange={(e) => setEditTaskStatus(e.target.value)}
              className="w-full border p-2 rounded mb-3"
            >
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={editTaskCompleted}
                onChange={(e) => setEditTaskCompleted(e.target.checked)}
                className="mr-2"
              />
              <label>Completed</label>
            </div>
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={handleUpdateTask}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
              >
                Update
              </button>
              <button
                onClick={() => setShowEditTaskModal(false)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;