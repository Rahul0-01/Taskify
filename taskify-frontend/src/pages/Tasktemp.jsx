import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { deleteTask, markTaskCompleted, viewTask } from '../features/taskSlice';
// Update path if needed
import api from '../api';

const TaskForUser = () => {
  const { userid } = useParams();
  const dispatch = useDispatch();
  const [tasks, setTasks] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    fetchTasksForUser();
  }, [userid]);

  const fetchTasksForUser = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await api.get(`/api/task/getByUser/${userid}`);
      setTasks(res.data);
    } catch (error) {
      console.error('Error fetching user tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    dispatch(deleteTask(id)).then(() => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    });
  };

  const handleToggleComplete = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(
        `/api/task/mark-complete/${id}?completed=${!currentStatus}`,
        {}
      );
      fetchTasksForUser(); // refresh list
    } catch (error) {
      console.error('Failed to toggle status', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h2 className="text-3xl font-bold text-center mb-6">Tasks for User ID: {userid}</h2>

      {loading ? (
        <p className="text-center">Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p className="text-center text-gray-400">No tasks found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white text-gray-900 p-4 rounded-lg shadow">
              <h3 className="text-xl font-bold">{task.title}</h3>
              <p className="text-gray-700">{task.description}</p>
              <p className="text-sm text-gray-500">Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</p>
              <p className={`mt-2 font-semibold ${task.completed ? 'text-green-600' : 'text-red-600'}`}>
                {task.completed ? 'Completed' : 'Incomplete'}
              </p>

              <div className="mt-4 space-x-2">
                <button
                  onClick={() => handleToggleComplete(task.id, task.completed)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                >
                  {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                </button>

                <button
                  onClick={() => handleDelete(task.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskForUser;
