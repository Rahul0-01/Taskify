import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTasks } from '../features/taskSlice'; // Ensure this path is correct
import CountUp from 'react-countup';
import { FaTasks, FaHourglassHalf, FaCheckCircle } from 'react-icons/fa';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { tasks, loading, error } = useSelector((state) => state.task);

  // Fetch tasks when the component mounts
  useEffect(() => {
    dispatch(fetchTasks({ page: 0, size: 100, sortBy: 'dueDate' }))
      .then((response) => {
        console.log('Fetched tasks:', response.payload);
      });
  }, [dispatch]);

  console.log("Redux tasks =>", tasks);

  // Display loading or error messages
  if (loading)
    return (
      <p className="text-center text-gray-600 text-lg font-semibold">
        Loading tasks...
      </p>
    );
  if (error)
    return (
      <p className="text-center text-red-600 text-lg font-medium">{error}</p>
    );

  // Extract the tasks array from the paginated response.
  // The backend returns an object with a property "content" holding the tasks.
  const taskList = tasks?.content || [];

  // Calculate summary values using taskList
  const totalTasks = taskList.length;
  const pendingTasks = taskList.filter((task) => task.status === 'Pending').length;
  const completedTasks = taskList.filter((task) => task.status === 'Completed').length;
  const inprogressTasks = taskList.filter((task) => task.status === 'In progress').length;

  // Prepare data for the PieChart
  const data = [
    { name: 'Completed', value: completedTasks },
    { name: 'Pending', value: pendingTasks },
    { name: 'In Progress', value: inprogressTasks },
  ];
  const COLORS = ['#4ade80', '#facc15', '#60a5fa'];

  // Get recent tasks (last 5 tasks, reversed so the most recent is first)
  const recentTasks = taskList.slice(-5).reverse();

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-4xl font-bold text-center mb-10">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          {
            title: 'Total Tasks',
            value: totalTasks,
            icon: <FaTasks className="text-4xl text-green-500 mx-auto mb-4" />,
            bg: 'bg-green-100',
          },
          {
            title: 'Pending Tasks',
            value: pendingTasks,
            icon: <FaHourglassHalf className="text-4xl text-yellow-500 mx-auto mb-4" />,
            bg: 'bg-yellow-100',
          },
          {
            title: 'Completed Tasks',
            value: completedTasks,
            icon: <FaCheckCircle className="text-4xl text-purple-500 mx-auto mb-4" />,
            bg: 'bg-purple-100',
          },
        ].map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className={`${card.bg} p-8 rounded-2xl shadow-xl hover:scale-105 transition-transform duration-300 text-center`}
          >
            {card.icon}
            <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
            <p className="text-3xl font-bold">
              <CountUp end={card.value} duration={1.5} />
            </p>
          </motion.div>
        ))}
      </div>

      {/* Pie Chart */}
      <div className="flex justify-center mb-10">
        <PieChart width={350} height={350}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>

      {/* View All Tasks Button */}
      <div className="text-center mb-10">
        <Link to="/tasks">
          <button className="bg-purple-500 hover:bg-purple-600 text-white py-3 px-6 rounded-xl text-lg shadow-lg">
            View All Tasks
          </button>
        </Link>
      </div>

      {/* Recent Tasks Section */}
      <h2 className="text-2xl font-bold mt-12 mb-4 text-center">Recent Tasks</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recentTasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="p-4 shadow-md rounded-xl bg-gray-50 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300"
          >
            <div>
              <h3 className="font-semibold text-lg mb-2 truncate">{task.title}</h3>
              <span
                className={`text-sm font-semibold px-2 py-1 rounded-full inline-block mb-3 ${
                  task.status === 'Completed'
                    ? 'bg-green-200 text-green-800'
                    : task.status === 'Pending'
                    ? 'bg-yellow-200 text-yellow-800'
                    : 'bg-blue-200 text-blue-800'
                }`}
              >
                {task.status}
              </span>
            </div>
            <Link
              to={`/task/${task.id}`}
              className="text-purple-600 hover:underline self-end"
            >
              View Details
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
