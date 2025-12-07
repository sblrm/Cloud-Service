const express = require('express');
const responseTime = require('response-time');
const client = require('prom-client');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// In-Memory Database untuk To-Do List
// ============================================
let todos = [
  { id: 1, title: 'Setup monitoring stack', completed: false, createdAt: new Date() },
  { id: 2, title: 'Create Grafana dashboard', completed: false, createdAt: new Date() },
  { id: 3, title: 'Configure alerts', completed: false, createdAt: new Date() },
];
let nextId = 4;

// ============================================
// Prometheus Client Configuration
// ============================================

// Enable default metrics collection (CPU, Memory, etc.)
const register = new client.Registry();

// Add default metrics (process metrics)
client.collectDefaultMetrics({
  register,
  prefix: 'nodejs_app_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
});

// ============================================
// Custom Metrics Definition
// ============================================

// Counter: Total HTTP Requests
const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// Histogram: HTTP Request Duration
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register],
});

// Gauge: Active Connections
const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  registers: [register],
});

// ============================================
// Custom Business Metrics untuk To-Do List
// ============================================

// Gauge: Total Todos
const totalTodos = new client.Gauge({
  name: 'todo_total',
  help: 'Total number of todos',
  registers: [register],
});

// Gauge: Completed Todos
const completedTodos = new client.Gauge({
  name: 'todo_completed',
  help: 'Number of completed todos',
  registers: [register],
});

// Counter: Todos Created
const todosCreated = new client.Counter({
  name: 'todo_created_total',
  help: 'Total number of todos created',
  registers: [register],
});

// Counter: Todos Deleted
const todosDeleted = new client.Counter({
  name: 'todo_deleted_total',
  help: 'Total number of todos deleted',
  registers: [register],
});

// Counter: Todos Completed
const todosCompletedCounter = new client.Counter({
  name: 'todo_completed_total',
  help: 'Total number of todos marked as completed',
  registers: [register],
});

// Function to update todo metrics
function updateTodoMetrics() {
  totalTodos.set(todos.length);
  completedTodos.set(todos.filter(t => t.completed).length);
}

// Initialize metrics
updateTodoMetrics();

// ============================================
// Middleware
// ============================================

app.use(express.json());

// Serve static files (frontend)
app.use(express.static('public'));

// Track active connections
app.use((req, res, next) => {
  activeConnections.inc();
  res.on('finish', () => {
    activeConnections.dec();
  });
  next();
});

// Measure response time and record metrics
app.use(responseTime((req, res, time) => {
  const route = req.route ? req.route.path : req.path;
  const statusCode = res.statusCode;
  const method = req.method;

  // Record request count
  httpRequestTotal.labels(method, route, statusCode).inc();

  // Record request duration (convert ms to seconds)
  httpRequestDuration.labels(method, route, statusCode).observe(time / 1000);
}));

// ============================================
// Application Routes
// ============================================

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    todosCount: todos.length,
  });
});

// Main Endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'To-Do List API with Prometheus Monitoring',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      metrics: 'GET /metrics',
      todos: {
        list: 'GET /api/todos',
        create: 'POST /api/todos',
        get: 'GET /api/todos/:id',
        update: 'PUT /api/todos/:id',
        delete: 'DELETE /api/todos/:id',
        complete: 'PATCH /api/todos/:id/complete',
      },
    },
    stats: {
      total: todos.length,
      completed: todos.filter(t => t.completed).length,
      pending: todos.filter(t => !t.completed).length,
    },
  });
});

// ============================================
// To-Do List API Endpoints
// ============================================

// GET /api/todos - Get all todos
app.get('/api/todos', (req, res) => {
  res.json({
    success: true,
    count: todos.length,
    data: todos,
  });
});

// POST /api/todos - Create new todo
app.post('/api/todos', (req, res) => {
  const { title } = req.body;

  if (!title || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Title is required',
    });
  }

  const newTodo = {
    id: nextId++,
    title: title.trim(),
    completed: false,
    createdAt: new Date(),
  };

  todos.push(newTodo);
  todosCreated.inc();
  updateTodoMetrics();

  res.status(201).json({
    success: true,
    message: 'Todo created successfully',
    data: newTodo,
  });
});

// GET /api/todos/:id - Get single todo
app.get('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);

  if (!todo) {
    return res.status(404).json({
      success: false,
      error: 'Todo not found',
    });
  }

  res.json({
    success: true,
    data: todo,
  });
});

// PUT /api/todos/:id - Update todo
app.put('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title, completed } = req.body;
  const todoIndex = todos.findIndex(t => t.id === id);

  if (todoIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Todo not found',
    });
  }

  if (title !== undefined) {
    if (title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Title cannot be empty',
      });
    }
    todos[todoIndex].title = title.trim();
  }

  if (completed !== undefined) {
    const wasCompleted = todos[todoIndex].completed;
    todos[todoIndex].completed = completed;
    
    // Track completion
    if (!wasCompleted && completed) {
      todosCompletedCounter.inc();
    }
  }

  todos[todoIndex].updatedAt = new Date();
  updateTodoMetrics();

  res.json({
    success: true,
    message: 'Todo updated successfully',
    data: todos[todoIndex],
  });
});

// PATCH /api/todos/:id/complete - Toggle completion
app.patch('/api/todos/:id/complete', (req, res) => {
  const id = parseInt(req.params.id);
  const todoIndex = todos.findIndex(t => t.id === id);

  if (todoIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Todo not found',
    });
  }

  const wasCompleted = todos[todoIndex].completed;
  todos[todoIndex].completed = !wasCompleted;
  todos[todoIndex].updatedAt = new Date();

  if (!wasCompleted) {
    todosCompletedCounter.inc();
  }

  updateTodoMetrics();

  res.json({
    success: true,
    message: todos[todoIndex].completed ? 'Todo completed' : 'Todo marked as pending',
    data: todos[todoIndex],
  });
});

// DELETE /api/todos/:id - Delete todo
app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todoIndex = todos.findIndex(t => t.id === id);

  if (todoIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Todo not found',
    });
  }

  const deletedTodo = todos.splice(todoIndex, 1)[0];
  todosDeleted.inc();
  updateTodoMetrics();

  res.json({
    success: true,
    message: 'Todo deleted successfully',
    data: deletedTodo,
  });
});

// ============================================
// Utility Endpoints untuk Testing
// ============================================

// POST /api/todos/bulk - Create multiple todos (untuk load testing)
app.post('/api/todos/bulk', (req, res) => {
  const { count = 10 } = req.body;
  const newTodos = [];

  for (let i = 0; i < count; i++) {
    const newTodo = {
      id: nextId++,
      title: `Todo ${nextId - 1} - ${Date.now()}`,
      completed: false,
      createdAt: new Date(),
    };
    todos.push(newTodo);
    newTodos.push(newTodo);
    todosCreated.inc();
  }

  updateTodoMetrics();

  res.status(201).json({
    success: true,
    message: `${count} todos created`,
    count: newTodos.length,
    data: newTodos,
  });
});

// DELETE /api/todos - Clear all todos (untuk reset testing)
app.delete('/api/todos', (req, res) => {
  const count = todos.length;
  todos = [];
  nextId = 1;
  updateTodoMetrics();

  res.json({
    success: true,
    message: 'All todos deleted',
    count: count,
  });
});


// ============================================
// Metrics Endpoint (untuk Prometheus)
// ============================================
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// ============================================
// 404 Handler
// ============================================
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

// ============================================
// Error Handler
// ============================================
app.use((err, req, res, next) => {
  console.error('Error:', err);
  errorCount.labels(req.method, req.path, 500, 'unhandled_error').inc();
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// ============================================
// Start Server
// ============================================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 To-Do List API is running on port ${PORT}`);
  console.log(`📊 Metrics available at: http://localhost:${PORT}/metrics`);
  console.log(`💚 Health check at: http://localhost:${PORT}/health`);
  console.log(`📝 API endpoints at: http://localhost:${PORT}/api/todos`);
  console.log(`📈 Current stats: ${todos.length} todos (${todos.filter(t => t.completed).length} completed)`);
});
