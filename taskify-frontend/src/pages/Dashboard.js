import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BASE_URL = 'http://localhost:8080/api/task'; // change if different

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_URL}/getAllTask`, {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === 'Completed').length;
  const pendingTasks = tasks.filter((task) => task.status === 'Pending').length;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-100 p-6 rounded-2xl shadow-md text-center">
          <h2 className="text-xl font-semibold mb-2">Total Tasks</h2>
          <p className="text-3xl">{totalTasks}</p>
        </div>
        <div className="bg-yellow-100 p-6 rounded-2xl shadow-md text-center">
          <h2 className="text-xl font-semibold mb-2">Pending Tasks</h2>
          <p className="text-3xl">{pendingTasks}</p>
        </div>
        <div className="bg-blue-100 p-6 rounded-2xl shadow-md text-center">
          <h2 className="text-xl font-semibold mb-2">Completed Tasks</h2>
          <p className="text-3xl">{completedTasks}</p>
        </div>
      </div>
      <div className="flex justify-center">
        <button
          className="bg-purple-500 text-white px-6 py-3 rounded-xl shadow hover:bg-purple-600"
          onClick={() => navigate('/tasks')}
        >
          View All Tasks
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
