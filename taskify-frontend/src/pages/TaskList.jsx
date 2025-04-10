import React, { useEffect, useState } from 'react';
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

const TaskList = () => {
  const dispatch = useDispatch();
  const { tasks, loading, error, totalPages } = useSelector((state) => state.tasks);
  const [currentPage, setCurrentPage] = useState(0);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTaskData, setEditTaskData] = useState(null);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
  });

  // Decode userId from token
  const token = localStorage.getItem('token');
  let userId = null;
  if (token) {
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      userId = decoded.sub || decoded.id;
    } catch (e) {
      console.error('Invalid token');
    }
  }

  useEffect(() => {
    dispatch(fetchTasks(currentPage));
  }, [dispatch, currentPage]);

  const handleAddTask = () => {
    if (!newTask.title || !newTask.description || !newTask.dueDate) return;
    dispatch(addTask(newTask));
    setNewTask({ title: '', description: '', dueDate: '' });
    setShowAddModal(false);
  };

  const handleEditTask = () => {
    dispatch(updateTask(editTaskData));
    setEditTaskData(null);
    setShowEditModal(false);
  };

  // 🧠 FIX: Only show tasks assigned to this user, not ones they created for others
  const taskList = tasks?.content?.filter(
    (task) => task?.assignedTo?.id === Number(userId)
  ) || [];

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h2>My Tasks</h2>
        <button onClick={() => setShowAddModal(true)}>+ Add Task</button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="task-cards">
        <AnimatePresence>
          {taskList.length === 0 && !loading ? (
            <p>No tasks assigned to you.</p>
          ) : (
            taskList.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                layout
                className={`task-card ${task.completed ? 'completed' : ''}`}
              >
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <p><strong>Due:</strong> {task.dueDate}</p>
                <p><strong>Status:</strong> {task.completed ? 'Completed' : 'Pending'}</p>
                <div className="task-actions">
                  <button onClick={() => dispatch(markTaskCompleted({ ...task, completed: !task.completed }))}>
                    {task.completed ? 'Undo' : 'Complete'}
                  </button>
                  <button onClick={() => {
                    setEditTaskData(task);
                    setShowEditModal(true);
                  }}>
                    Edit
                  </button>
                  <button onClick={() => dispatch(deleteTask(task.id))}>
                    Delete
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={currentPage === i ? 'active' : ''}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Task</h3>
            <input
              type="text"
              placeholder="Title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <textarea
              placeholder="Description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            />
            <div className="modal-actions">
              <button onClick={handleAddTask}>Save</button>
              <button onClick={() => setShowAddModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditModal && editTaskData && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Task</h3>
            <input
              type="text"
              value={editTaskData.title}
              onChange={(e) => setEditTaskData({ ...editTaskData, title: e.target.value })}
            />
            <textarea
              value={editTaskData.description}
              onChange={(e) => setEditTaskData({ ...editTaskData, description: e.target.value })}
            />
            <input
              type="date"
              value={editTaskData.dueDate}
              onChange={(e) => setEditTaskData({ ...editTaskData, dueDate: e.target.value })}
            />
            <div className="modal-actions">
              <button onClick={handleEditTask}>Update</button>
              <button onClick={() => setShowEditModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
