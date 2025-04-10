import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import TaskList from "./pages/TaskList";
import TaskDetail from "./pages/TaskDetail";
import TaskDetail_1 from "./pages/TaskDetail_1";
import Register from "./pages/Register";
import AdminPage from './pages/AdminPage';
import ProtectedRoute from "./ProtectedRoute"; 
import UserDetailsPage from "./pages/UsersDetailsPage";  
import Taskforuser from "./pages/Tasktemp";
import AutoCompleteInput from './AutoCompleteInput';



function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/users/:userid" element={<UserDetailsPage />} />
        <Route path="/admin/tasks/:userid" element={<Taskforuser />} />

        {/* ✅ New test route to check autocomplete */}
        <Route path="/test-autocomplete" element={<AutoCompleteInput />} />

        {/* ✅ Protected Routes */}
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TaskList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/task/:id"
          element={
            <ProtectedRoute>
              <TaskDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/task_1/:id"
          element={
            <ProtectedRoute>
              <TaskDetail_1 />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
