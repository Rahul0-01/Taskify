import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/task';

// Async actions
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async ({ page, size, sortBy }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/getAllTaskPaged`, {
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        params: { page, size, sortBy },
      });
      return response.data; // Expected to be a paginated object with a "content" property
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addTask = createAsyncThunk(
  'tasks/addTask',
  async (payload, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        return rejectWithValue("Authentication token is missing.");
      }

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      // Backward compatibility: if payload has a `task`, use that; otherwise treat it as the task object directly
      const task = payload.task || payload;
      const userId = payload.userId;

      const url = userId
        ? `${BASE_URL}/create?userId=${userId}`
        : `${BASE_URL}/create`;

      const response = await axios.post(url, task, { headers });
      return response.data;

    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, updatedTask }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${BASE_URL}/update/${id}`, updatedTask, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASE_URL}/delete/${id}`, {
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const viewTask = createAsyncThunk(
  'tasks/viewTask',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/getTask/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const markTaskCompleted = createAsyncThunk(
  'tasks/markCompleted',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${BASE_URL}/markAsCompleted/${id}`, null, {
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Slice
const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    // We store a paginated response object in "tasks"
    // Example structure: { content: [ ... ], totalElements: 0, totalPages: 0, size: 6, number: 0 }
    tasks: {},
    currentTask: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add task
      .addCase(addTask.fulfilled, (state, action) => {
        if (state.tasks && Array.isArray(state.tasks.content)) {
          state.tasks.content.push(action.payload);
          state.tasks.totalElements = (state.tasks.totalElements || 0) + 1;
        } else {
          state.tasks = {
            content: [action.payload],
            totalElements: 1,
            totalPages: 1,
            number: 0,
            size: 6,
          };
        }
      })
      // Update task
      .addCase(updateTask.fulfilled, (state, action) => {
        if (state.tasks && Array.isArray(state.tasks.content)) {
          state.tasks.content = state.tasks.content.map((task) =>
            task.id === action.payload.id ? action.payload : task
          );
        }
      })
      // Delete task
      .addCase(deleteTask.fulfilled, (state, action) => {
        if (state.tasks && Array.isArray(state.tasks.content)) {
          state.tasks.content = state.tasks.content.filter(
            (task) => task.id !== action.payload
          );
          state.tasks.totalElements = (state.tasks.totalElements || 1) - 1;
        }
      })
      // Mark task as completed
      .addCase(markTaskCompleted.fulfilled, (state, action) => {
        if (state.tasks && Array.isArray(state.tasks.content)) {
          state.tasks.content = state.tasks.content.map((task) =>
            task.id === action.payload.id ? action.payload : task
          );
        }
      })
      // View single task
      .addCase(viewTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(viewTask.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
      })
      .addCase(viewTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentTask = null;
      });
  },
});

export default taskSlice.reducer;
