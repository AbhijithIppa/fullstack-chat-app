import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import authRoutes from '../routes/auth.route.js';
import messageRoutes from '../routes/message.route.js';

// Create a test-specific app
const createTestApp = () => {
  const app = express();
  
  app.use(express.json());
  app.use(cookieParser());
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );

  app.use("/api/auth", authRoutes);
  app.use("/api/messages", messageRoutes);

  return app;
};

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Override mongoose connection for tests
  await mongoose.disconnect();
  await mongoose.connect(mongoUri);
  
  // Create test app
  app = createTestApp();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Signup API', () => {
  const validUserData = {
    fullName: 'Test User',
    email: 'testuser@example.com',
    password: 'password123'
  };

  it('should successfully create a new user', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send(validUserData);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.fullName).toBe(validUserData.fullName);
    expect(response.body.email).toBe(validUserData.email);

    const user = await User.findOne({ email: validUserData.email });
    expect(user).toBeTruthy();
  });

  it('should fail if email already exists', async () => {
    // First, create a user
    await User.create({
      fullName: 'Existing User',
      email: 'existing@example.com',
      password: await bcrypt.hash('password123', 10)
    });

    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        fullName: 'Another User',
        email: 'existing@example.com',
        password: 'newpassword123'
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('message', 'Email already exists');
  });

  it('should fail if required fields are missing', async () => {
    const incompleteData = {
      fullName: 'Test User',
      email: 'testuser@example.com'
    };

    const response = await request(app)
      .post('/api/auth/signup')
      .send(incompleteData);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('message', 'All fields are required');
  });

  it('should fail if password is too short', async () => {
    const shortPasswordData = {
      fullName: 'Test User',
      email: 'testuser@example.com',
      password: '123'
    };

    const response = await request(app)
      .post('/api/auth/signup')
      .send(shortPasswordData);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('message', 'Password must be at least 6 characters');
  });
});