const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../src/models/User.model');

// Test database connection
beforeAll(async () => {
  // Connect to test database
  await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/smitBackend_test');
});

afterAll(async () => {
  // Clean up and close connection
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  // Clear collections before each test
  await User.deleteMany({});
});

describe('Authentication Endpoints', () => {
  describe('POST /api/admin/signup', () => {
    it('should create a new admin account', async () => {
      const adminData = {
        email: 'admin@test.com',
        firstName: 'Test',
        lastName: 'Admin',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/admin/signup')
        .send(adminData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(adminData.email);
      expect(response.body.data.isAdmin).toBe(true);
      expect(response.body.token).toBeDefined();
    });

    it('should return error for missing required fields', async () => {
      const adminData = {
        email: 'admin@test.com',
        firstName: 'Test'
        // Missing lastName and password
      };

      const response = await request(app)
        .post('/api/admin/signup')
        .send(adminData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required fields');
    });
  });

  describe('POST /api/admin/login', () => {
    beforeEach(async () => {
      // Create a test admin
      const admin = new User({
        email: 'admin@test.com',
        firstName: 'Test',
        lastName: 'Admin',
        password: await require('bcryptjs').hash('password123', 10),
        isAdmin: true
      });
      await admin.save();
    });

    it('should login admin with valid credentials', async () => {
      const loginData = {
        email: 'admin@test.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/admin/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isAdmin).toBe(true);
      expect(response.body.token).toBeDefined();
    });

    it('should return error for invalid credentials', async () => {
      const loginData = {
        email: 'admin@test.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/admin/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should return error for non-admin user', async () => {
      // Create a regular user
      const user = new User({
        email: 'user@test.com',
        firstName: 'Test',
        lastName: 'User',
        password: await require('bcryptjs').hash('password123', 10),
        isAdmin: false
      });
      await user.save();

      const loginData = {
        email: 'user@test.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/admin/login')
        .send(loginData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Admin access required');
    });
  });

  describe('POST /api/user/signup', () => {
    it('should create a new user account', async () => {
      const userData = {
        email: 'user@test.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/user/signup')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.isAdmin).toBe(false);
      expect(response.body.token).toBeDefined();
    });
  });

  describe('POST /api/user/login', () => {
    beforeEach(async () => {
      // Create a test user
      const user = new User({
        email: 'user@test.com',
        firstName: 'Test',
        lastName: 'User',
        password: await require('bcryptjs').hash('password123', 10),
        isAdmin: false
      });
      await user.save();
    });

    it('should login user with valid credentials', async () => {
      const loginData = {
        email: 'user@test.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/user/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isAdmin).toBe(false);
      expect(response.body.token).toBeDefined();
    });
  });
});

describe('Protected Routes', () => {
  let adminToken;
  let adminId;

  beforeEach(async () => {
    // Create a test admin and get token
    const admin = new User({
      email: 'admin@test.com',
      firstName: 'Test',
      lastName: 'Admin',
      password: await require('bcryptjs').hash('password123', 10),
      isAdmin: true
    });
    await admin.save();
    adminId = admin._id;

    const loginResponse = await request(app)
      .post('/api/admin/login')
      .send({
        email: 'admin@test.com',
        password: 'password123'
      });
    adminToken = loginResponse.body.token;
  });

  describe('GET /api/admin/users', () => {
    it('should return all users for authenticated admin', async () => {
      // Create a test user
      const user = new User({
        email: 'user@test.com',
        firstName: 'Test',
        lastName: 'User',
        password: await require('bcryptjs').hash('password123', 10),
        isAdmin: false
      });
      await user.save();

      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2); // admin + user
      expect(response.body.data.some(u => u.isAdmin)).toBe(true);
      expect(response.body.data.some(u => !u.isAdmin)).toBe(true);
    });

    it('should return 401 without token', async () => {
      await request(app)
        .get('/api/admin/users')
        .expect(401);
    });
  });

  describe('POST /api/admin/user', () => {
    it('should create a new user for authenticated admin', async () => {
      const userData = {
        email: 'newuser@test.com',
        firstName: 'New',
        lastName: 'User',
        password: 'password123',
        isAdmin: false
      };

      const response = await request(app)
        .post('/api/admin/user')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.isAdmin).toBe(false);
    });

    it('should create a new admin user for authenticated admin', async () => {
      const adminData = {
        email: 'newadmin@test.com',
        firstName: 'New',
        lastName: 'Admin',
        password: 'password123',
        isAdmin: true
      };

      const response = await request(app)
        .post('/api/admin/user')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(adminData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(adminData.email);
      expect(response.body.data.isAdmin).toBe(true);
    });
  });
});
