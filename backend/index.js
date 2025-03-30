import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables first
dotenv.config({ path: path.join(__dirname, '.env') });

// Verify required environment variables
const requiredEnvVars = [
  'MONGO',
  'JWT_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL',
  'CLIENT_URL',
  'SESSION_SECRET',
  'GEMINI_API_KEY',
  'PORT',
  'NODE_ENV'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});

import express from 'express';
import mongoose from 'mongoose';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import DonorForm from './routes/donor.route.js';
import notificationRouter from './routes/notification.route.js';
import analyticsRouter from './routes/analytics.route.js';
import aiRouter from './routes/ai.routes.js';
import cors from 'cors';
import chatRoutes from './routes/chat.route.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Chat from './models/chat.model.js';
import passport from 'passport';
import session from 'express-session';
import './config/passport.js';

const app = express();

// Apply CORS before other middleware
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'https://sharables.vercel.app',
            'https://sharables.vercel.app/',
            process.env.CORS_ORIGIN
        ].filter(Boolean); // Remove any undefined/null values
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use(express.json());

// Session configuration with Railway-specific settings
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
}));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      'https://sharables.vercel.app',
      'https://sharables.vercel.app/',
      process.env.CORS_ORIGIN
    ].filter(Boolean),
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store active users
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join', (userId) => {
    activeUsers.set(userId, socket.id);
    console.log('User joined:', userId);
  });

  socket.on('sendMessage', async ({ chatId, message }) => {
    try {
      const chat = await Chat.findById(chatId).populate('donorId requesterId');
      if (!chat) {
        console.error('Chat not found:', chatId);
        return;
      }

      if (chat.donorId._id.toString() === chat.requesterId._id.toString()) {
        console.error('Self-chat is not allowed');
        return;
      }
      
      const recipientId = message.senderId === chat.donorId._id.toString()
        ? chat.requesterId._id.toString()
        : chat.donorId._id.toString();
      
      const recipientSocketId = activeUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('newMessage', {
          chatId,
          message: {
            ...message,
            senderId: message.senderId
          }
        });
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        break;
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/uploads', express.static(path.resolve('uploads')));
app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/donor', DonorForm);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/ai', aiRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(statusCode).json({
        success: false,
        message,
        statusCode,
    });
});

// Serve static files from the frontend build directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// Connect to MongoDB with retry logic
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Start server
const PORT = process.env.PORT;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});