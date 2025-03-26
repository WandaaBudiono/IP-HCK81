const request = require("supertest");
const app = require("../app");
const { User } = require("../models");
const { comparePassword } = require("../helper/bcrypt");
const { signToken } = require("../helper/jwt");

jest.mock("../models");
jest.mock("../helper/bcrypt");
jest.mock("../helper/jwt");

describe("User Controller Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /register", () => {
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
  });

  describe("POST /login", () => {
    it("should log in a user and return 200 status with access token", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        password: "hashedpassword",
      };

      User.findOne.mockResolvedValue(mockUser);
      comparePassword.mockReturnValue(true); // Simulasi password cocok
      signToken.mockReturnValue("mockedAccessToken");

      const response = await request(app).post("/users/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        access_token: "mockedAccessToken",
      });
      expect(User.findOne).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
      expect(comparePassword).toHaveBeenCalledWith(
        "password123",
        "hashedpassword"
      );
      expect(signToken).toHaveBeenCalledWith({ id: mockUser.id });
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
      comparePassword.mockReturnValue(false); // Simulasi password salah

      const response = await request(app).post("/users/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Email/Password is Invalid" });
    });
  });
});
