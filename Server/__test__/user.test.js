const request = require("supertest");
const app = require("../app");
const { User } = require("../models");
const { comparePassword } = require("../helper/bcrypt");
const { signToken } = require("../helper/jwt");
const { OAuth2Client } = require("google-auth-library");

jest.mock("../models");
jest.mock("../helper/bcrypt");
jest.mock("../helper/jwt");

jest.mock("../middleware/authentication", () => {
  return (req, res, next) => {
    req.user = { id: "1" };
    next();
  };
});

const fakeVerifyIdToken = jest.fn();
OAuth2Client.prototype.verifyIdToken = fakeVerifyIdToken;

describe("User Controller Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /users/register", () => {
    it("should register a new user and return 201 status", async () => {
      const mockUser = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
        password: "hashedpassword",
      };

      User.create.mockResolvedValue(mockUser);

      const response = await request(app).post("/users/register").send({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
      });
      expect(User.create).toHaveBeenCalledWith({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });
    });

    it("should return 400 if required fields are missing", async () => {
      const response = await request(app).post("/users/register").send({
        username: "",
        email: "",
        password: "",
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "All fields are required" });
    });

    it("should return 500 if User.create throws an error", async () => {
      User.create.mockRejectedValue(new Error("Create error"));

      const response = await request(app).post("/users/register").send({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: "Internal server error" });
    });
  });

  describe("POST /users/login", () => {
    it("should log in a user and return 200 status with access token", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        password: "hashedpassword",
      };

      User.findOne.mockResolvedValue(mockUser);
      comparePassword.mockReturnValue(true);
      signToken.mockReturnValue("mockedAccessToken");

      const response = await request(app).post("/users/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ access_token: "mockedAccessToken" });
      expect(User.findOne).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
      expect(comparePassword).toHaveBeenCalledWith(
        "password123",
        "hashedpassword"
      );
      expect(signToken).toHaveBeenCalledWith({ id: mockUser.id });
    });

    it("should return 400 if email is not provided", async () => {
      const response = await request(app).post("/users/login").send({
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Email is required" });
    });

    it("should return 400 if password is not provided", async () => {
      const response = await request(app).post("/users/login").send({
        email: "test@example.com",
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Password is required" });
    });

    it("should return 401 if email is not found", async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app).post("/users/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Email/Password is Invalid" });
    });

    it("should return 401 if password is incorrect", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        password: "hashedpassword",
      };

      User.findOne.mockResolvedValue(mockUser);
      comparePassword.mockReturnValue(false);

      const response = await request(app).post("/users/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Email/Password is Invalid" });
    });

    it("should return 500 if an error occurs during login", async () => {
      User.findOne.mockRejectedValue(new Error("Login error"));

      const response = await request(app).post("/users/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: "Internal server error" });
    });
  });

  describe("POST /users/googleLogin", () => {
    it("should create a new user via google and return 201 status", async () => {
      const fakePayload = {
        email: "googleuser@example.com",
        name: "Google User",
      };
      fakeVerifyIdToken.mockResolvedValue({
        getPayload: () => fakePayload,
      });

      const mockUser = {
        id: 2,
        username: "Google User",
        email: "googleuser@example.com",
      };
      User.findOrCreate.mockResolvedValue([mockUser, true]);
      signToken.mockReturnValue("googleAccessToken");

      const response = await request(app)
        .post("/users/googleLogin")
        .send({ googleToken: "validGoogleToken" });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: "User created successfully",
        access_token: "googleAccessToken",
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
        },
      });
      expect(fakeVerifyIdToken).toHaveBeenCalled();
      expect(User.findOrCreate).toHaveBeenCalled();
      expect(signToken).toHaveBeenCalledWith({ id: mockUser.id });
    });

    it("should log in an existing user via google and return 200 status", async () => {
      const fakePayload = {
        email: "existing@example.com",
        name: "Existing User",
      };
      fakeVerifyIdToken.mockResolvedValue({
        getPayload: () => fakePayload,
      });

      const mockUser = {
        id: 3,
        username: "Existing User",
        email: "existing@example.com",
      };
      User.findOrCreate.mockResolvedValue([mockUser, false]);
      signToken.mockReturnValue("existingAccessToken");

      const response = await request(app)
        .post("/users/googleLogin")
        .send({ googleToken: "validGoogleToken" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "User logged in",
        access_token: "existingAccessToken",
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
        },
      });
      expect(fakeVerifyIdToken).toHaveBeenCalled();
      expect(User.findOrCreate).toHaveBeenCalled();
      expect(signToken).toHaveBeenCalledWith({ id: mockUser.id });
    });

    it("should return 500 if an error occurs during google login", async () => {
      fakeVerifyIdToken.mockRejectedValue(new Error("Google Error"));

      const response = await request(app)
        .post("/users/googleLogin")
        .send({ googleToken: "invalidToken" });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: "Internal server error" });
    });
  });

  describe("GET /users/profile", () => {
    it("should return user profile with status 200", async () => {
      const mockUser = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
      };

      User.findByPk.mockResolvedValue(mockUser);

      const response = await request(app)
        .get("/users/profile")
        .set("user-id", "1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
      expect(User.findByPk).toHaveBeenCalledWith("1", {
        attributes: { exclude: ["password"] },
      });
    });

    it("should return 404 if user is not found", async () => {
      User.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .get("/users/profile")
        .set("user-id", "1");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "User not found" });
    });

    it("should return 500 if an error occurs in getUserProfile", async () => {
      User.findByPk.mockRejectedValue(new Error("Profile error"));

      const response = await request(app)
        .get("/users/profile")
        .set("user-id", "1");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: "Internal server error" });
    });
  });
});
