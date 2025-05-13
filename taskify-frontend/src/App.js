import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ThemeToggle from "./ThemeToggle";      
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
import YourPageWrapper from "./YourPageWrapper"; 


function App() {
  return (
    <>
    <YourPageWrapper>
      <Navbar />

      {/* Theme toggle UI */}
      <div className="p-4 flex justify-end">
        <ThemeToggle />
      </div>

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

      </YourPageWrapper>


    </>
  );
}

export default App;
