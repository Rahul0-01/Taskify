import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { viewTask, markTaskCompleted, deleteTask, updateTask } from '../features/taskSlice';
import { motion } from 'framer-motion';

const TaskDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, currentTask } = useSelector((state) => state.task);

  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(null);


 

  useEffect(() => {
    dispatch(viewTask(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (currentTask) {
      setEditedTask({ ...currentTask });
    }
  }, [currentTask]);

  if (loading)
    return <p className="text-center text-lg font-semibold text-gray-600">Loading...</p>;
  if (error)
    return <p className="text-center text-lg text-red-600 font-medium">{error}</p>;
  if (!currentTask)
    return <p className="text-center text-lg text-gray-600">Task not found</p>;
  
  
  const handleComplete = () => {
    if (currentTask.status !== 'Completed') {
      const updatedTask = { ...currentTask, status: 'Completed' };
      dispatch(updateTask({ id: currentTask.id, updatedTask }))
        .then(() => {
          setEditedTask(updatedTask);
          dispatch(viewTask(currentTask.id));
        });
    }
  };
  

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch(deleteTask(currentTask.id)).then(() => navigate('/tasks'));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedTask((prev) => ({ ...prev, [name]: value }));
  };
  const handleSave = () => {
    const formattedDate = editedTask.dueDate
      ? new Date(editedTask.dueDate).toISOString().slice(0, 19)
      : null;
  
    const taskToUpdate = {
      ...editedTask,
      dueDate: formattedDate,
    };
  
    dispatch(updateTask({ id: editedTask.id, updatedTask: taskToUpdate }))
      .unwrap()
      .then(() => {
        setIsEditing(false);
        dispatch(viewTask(id));
      })
      .catch((err) => {
        console.error('Update failed:', err);
      });
  };
  
  
  
  

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-6"
    >
      <div className="w-full max-w-3xl bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-gray-200">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8 drop-shadow">
          📋 Task Details
        </h1>

        <div className="space-y-6">
          <div>
            {isEditing ? (
              <input
                type="text"
                name="title"
                value={editedTask.title}
                onChange={handleChange}
                className="w-full text-3xl font-semibold text-indigo-700 mb-2 px-3 py-2 rounded-xl border border-indigo-300"
              />
            ) : (
              <h2 className="text-3xl font-semibold text-indigo-700 mb-2">
                {currentTask.title}
              </h2>
            )}

            {isEditing ? (
              <textarea
                name="description"
                value={editedTask.description}
                onChange={handleChange}
                rows={4}
                className="w-full bg-white p-4 rounded-xl border border-gray-300 text-gray-700 whitespace-pre-line text-lg"
              />
            ) : (
              <div className="max-h-40 overflow-y-auto bg-white p-4 rounded-xl border border-gray-300 text-gray-700 whitespace-pre-line text-lg">
                {currentTask.description || 'No description provided.'}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-gray-500 text-sm">Priority</p>
              {isEditing ? (
                <select
                  name="priority"
                  value={editedTask.priority}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-full px-3 py-1 border border-blue-300 text-blue-700"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              ) : (
                <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                  {currentTask.priority}
                </span>
              )}
            </div>

            <div>
  <p className="text-gray-500 text-sm">Status</p>
  {isEditing ? (
    <select
      name="status"
      value={editedTask.status}
      onChange={handleChange}
      className="mt-1 w-full rounded-full px-3 py-1 border border-yellow-300 text-yellow-700"
    >
      <option value="Pending">Pending</option>
      <option value="In Progress">In Progress</option>
      <option value="Completed">Completed</option>
    </select>
  ) : (
    <span
      className={`inline-block mt-1 px-3 py-1 rounded-full font-medium ${
        currentTask.status === 'Completed'
          ? 'bg-green-100 text-green-700'
          : currentTask.status === 'In Progress'
          ? 'bg-blue-100 text-blue-700'
          : 'bg-yellow-100 text-yellow-700'
      }`}
    >
      {currentTask.status}
    </span>
  )}
</div>


            <div>
              <p className="text-gray-500 text-sm">Due Date</p>
              {isEditing ? (
                <input
                  type="date"
                  name="dueDate"
                  value={editedTask.dueDate?.slice(0, 10) || ''}
                  onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-full px-3 py-1"
                />
              ) : (
                <span className="inline-block mt-1 font-medium text-gray-700">
                  {currentTask.dueDate
                    ? new Date(currentTask.dueDate).toLocaleDateString()
                    : 'N/A'}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-6">
            {!isEditing && (
              <button
                onClick={handleComplete}
                disabled={currentTask.status === 'Completed'}
                className={`px-6 py-2 rounded-xl shadow transition-transform hover:scale-105 ${
                  currentTask.status === 'Completed'
                    ? 'bg-green-300 cursor-not-allowed text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                ✅ Mark as Complete
              </button>
            )}

            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl shadow transition-transform hover:scale-105"
            >
              🗑️ Delete Task
            </button>

            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl shadow transition-transform hover:scale-105"
                >
                  💾 Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedTask(currentTask);
                  }}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-xl shadow transition-transform hover:scale-105"
                >
                  ❌ Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-xl shadow transition-transform hover:scale-105"
              >
                ✏️ Edit Task
              </button>
            )}

<button
  onClick={() => navigate(-1)}
  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-xl shadow transition-transform hover:scale-105"
>
  ⬅️ Back to Tasks
</button>

          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskDetail;
