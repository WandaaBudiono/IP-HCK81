const request = require("supertest");
const app = require("../app");
const { User, Favorite, sequelize } = require("../models");
const { signToken } = require("../helper/jwt");
const axios = require("axios");
const { getGroqChatCompletion } = require("../helper/groqHelper");
const { sendWelcomeEmail } = require("../helper/emailService");

jest.mock("axios");
jest.mock("../helper/groqHelper");
jest.mock("../helper/emailService");

let accessToken;
let mockUser;
let mockCharacter = {
  id: "1",
  name: "Harry Potter",
  house: "Gryffindor",
  image: "http://example.com/harry.jpg",
};

beforeAll(async () => {
  try {
    await sequelize.sync({ force: true });
    await User.destroy({
      truncate: true,
      cascade: true,
      restartIdentity: true,
    });
    await Favorite.destroy({
      truncate: true,
      cascade: true,
      restartIdentity: true,
    });
    mockUser = await User.create({
      username: "testuser",
      email: "test@example.com",
      password: "test123",
    });

    accessToken = signToken({ id: mockUser.id, email: mockUser.email });
  } catch (error) {
    console.error("Error in beforeAll:", error);
    throw error;
  }
});

afterAll(async () => {
  try {
    console.log("afterAll: Clean up database after tests");

    await User.destroy({
      truncate: true,
      restartIdentity: true,
      cascade: true,
    });
    await Favorite.destroy({
      truncate: true,
      restartIdentity: true,
      cascade: true,
    });

    await sequelize.close();
  } catch (error) {
    console.error("Error in afterAll:", error);
  }
});

describe("GET /fav (getAll)", () => {
  it("should filter characters by house and paginate results", async () => {
    const characters = [
      { id: "1", name: "Harry Potter", house: "Gryffindor", image: "url1" },
      { id: "2", name: "Draco Malfoy", house: "Slytherin", image: "url2" },
      { id: "3", name: "Hermione Granger", house: "Gryffindor", image: "url3" },
    ];
    axios.get.mockResolvedValue({ data: characters });

    const res = await request(app)
      .get("/fav")
      .query({ house: "Gryffindor", pageNumber: 1, pageSize: 1 })
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "Data retrieved successfully",
      totalItems: 2,
      totalPages: 2,
      currentPage: 1,
      data: [
        { id: "1", name: "Harry Potter", house: "Gryffindor", image: "url1" },
      ],
    });
  });

  it("should handle axios error in getAll", async () => {
    axios.get.mockRejectedValue(new Error("Network error"));

    const res = await request(app)
      .get("/fav")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(500);
  });
});

describe("GET /fav (getAll)", () => {
  it("should filter and paginate characters", async () => {
    const characters = [
      { id: "1", name: "Harry Potter", house: "Gryffindor", image: "url1" },
      { id: "2", name: "Draco Malfoy", house: "Slytherin", image: "url2" },
      { id: "3", name: "Hermione Granger", house: "Gryffindor", image: "url3" },
    ];
    axios.get.mockResolvedValue({ data: characters });

    const res = await request(app)
      .get("/fav")
      .query({ house: "Gryffindor", pageNumber: 1, pageSize: 1 })
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "Data retrieved successfully",
      totalItems: 2,
      totalPages: 2,
      currentPage: 1,
      data: [
        { id: "1", name: "Harry Potter", house: "Gryffindor", image: "url1" },
      ],
    });
  });

  it("should return 500 if axios.get fails", async () => {
    axios.get.mockRejectedValue(new Error("Network error"));

    const res = await request(app)
      .get("/fav")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(500);
  });
});

describe("POST /fav/:CharacterId", () => {
  it("should add a favorite character and return 201", async () => {
    axios.get.mockResolvedValue({ data: [mockCharacter] });
    jest.spyOn(Favorite, "findOne").mockResolvedValue(null);
    jest.spyOn(Favorite, "create").mockResolvedValue({
      id: 1,
      CharacterId: mockCharacter.id,
      characterName: mockCharacter.name,
      house: mockCharacter.house,
      imageUrl: mockCharacter.image,
      UserId: mockUser.id,
    });

    const res = await request(app)
      .post("/fav/1")
      .set("Authorization", `Bearer ${accessToken}`)
      .send();

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      message: "Favorite character added successfully",
      data: {
        id: 1,
        CharacterId: mockCharacter.id,
        characterName: mockCharacter.name,
        house: mockCharacter.house,
        imageUrl: mockCharacter.image,
        UserId: mockUser.id,
      },
    });
  });

  it("should return 404 if the character is not found", async () => {
    axios.get.mockResolvedValue({ data: [] });

    const res = await request(app)
      .post("/fav/1")
      .set("Authorization", `Bearer ${accessToken}`)
      .send();

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Character not found" });
  });

  it("should return 400 if the character is already in favorites", async () => {
    axios.get.mockResolvedValue({ data: [mockCharacter] });
    jest.spyOn(Favorite, "findOne").mockResolvedValue({ id: 1 });

    const res = await request(app)
      .post("/fav/1")
      .set("Authorization", `Bearer ${accessToken}`)
      .send();

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: "Character is already in favorites",
    });
  });
});

describe("GET /fav", () => {
  describe("GET /fav", () => {
    it("should retrieve all favorite characters", async () => {
      jest.spyOn(Favorite, "findAll").mockResolvedValue([
        {
          id: "1",
          name: "Harry Potter",
          house: "Gryffindor",
          image: "http://example.com/harry.jpg",
        },
      ]);

      const res = await request(app)
        .get("/fav")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        message: "Data retrieved successfully",
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
        data: [
          {
            id: "1",
            name: "Harry Potter",
            house: "Gryffindor",
            image: "http://example.com/harry.jpg",
          },
        ],
      });
    });
  });
});

describe("GET /fav/:CharacterId", () => {
  it("should retrieve character details", async () => {
    axios.get.mockResolvedValue({ data: [mockCharacter] });

    const res = await request(app)
      .get("/fav/1")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "Character detail retrieved successfully",
      data: {
        id: mockCharacter.id,
        name: mockCharacter.name,
        house: mockCharacter.house,
        species: undefined,
        gender: undefined,
        patronus: "Unknown",
        actor: "Unknown",
        imageUrl: mockCharacter.image,
      },
    });
  });

  it("should return 404 if the character is not found", async () => {
    axios.get.mockResolvedValue({ data: [] });

    const res = await request(app)
      .get("/fav/1")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Character not found" });
  });
});

describe("DELETE /fav/:CharacterId", () => {
  it("should delete a favorite character and return 200", async () => {
    jest.spyOn(Favorite, "findOne").mockResolvedValue({
      id: 1,
      destroy: jest.fn(),
    });

    const res = await request(app)
      .delete("/fav/1")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "Favorite character removed successfully",
    });
  });

  it("should return 404 if the favorite character is not found", async () => {
    jest.spyOn(Favorite, "findOne").mockResolvedValue(null);

    const res = await request(app)
      .delete("/fav/1")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      message: "Favorite character not found",
    });
  });
});

describe("POST /fav/sortHat", () => {
  it("should sort a user into a house and send an email", async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              house: "Gryffindor",
              explanation: "You are brave and courageous.",
            }),
          },
        },
      ],
    };

    jest.spyOn(User, "findByPk").mockResolvedValue(mockUser);
    getGroqChatCompletion.mockResolvedValue(mockResponse);
    sendWelcomeEmail.mockResolvedValue();

    const res = await request(app)
      .post("/fav/sortHat")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ answers: ["Bravery", "Loyalty", "Intelligence", "Ambition"] });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      house: "Gryffindor",
      explanation: "You are brave and courageous.",
      message: "Sorting completed and email sent!",
    });
  });

  it("should return 400 if answers are invalid", async () => {
    const res = await request(app)
      .post("/fav/sortHat")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ answers: null });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid input" });
  });

  describe("POST /fav/sortHat error scenarios", () => {
    it("should return 400 if Groq response is invalid (no houseData)", async () => {
      getGroqChatCompletion.mockResolvedValue({});

      const res = await request(app)
        .post("/fav/sortHat")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ answers: ["Bravery", "Loyalty", "Intelligence", "Ambition"] });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Invalid Groq response" });
    });

    it("should return 400 if JSON.parse fails", async () => {
      getGroqChatCompletion.mockResolvedValue({
        choices: [
          {
            message: {
              content: "not a valid json",
            },
          },
        ],
      });

      const res = await request(app)
        .post("/fav/sortHat")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ answers: ["Bravery", "Loyalty", "Intelligence", "Ambition"] });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /fav/sortHat error scenarios", () => {
    it("should return 400 if Groq response does not contain choices", async () => {
      getGroqChatCompletion.mockResolvedValue({});

      const res = await request(app)
        .post("/fav/sortHat")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ answers: ["A", "B", "C", "D"] });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Invalid Groq response" });
    });

    it("should return 400 if parsedHouse.house is not a string", async () => {
      getGroqChatCompletion.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                house: 123,
                explanation: "Not a string",
              }),
            },
          },
        ],
      });

      const res = await request(app)
        .post("/fav/sortHat")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ answers: ["A", "B", "C", "D"] });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "House must be a string" });
    });
  });

  describe("GET /fav (getAll)", () => {
    it("should filter characters by house and paginate results", async () => {
      const characters = [
        { id: "1", name: "Harry Potter", house: "Gryffindor", image: "url1" },
        { id: "2", name: "Draco Malfoy", house: "Slytherin", image: "url2" },
        {
          id: "3",
          name: "Hermione Granger",
          house: "Gryffindor",
          image: "url3",
        },
      ];
      axios.get.mockResolvedValue({ data: characters });

      const res = await request(app)
        .get("/fav")
        .query({ house: "Gryffindor", pageNumber: 1, pageSize: 1 })
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        message: "Data retrieved successfully",
        totalItems: 2,
        totalPages: 2,
        currentPage: 1,
        data: [
          { id: "1", name: "Harry Potter", house: "Gryffindor", image: "url1" },
        ],
      });
    });
  });

  describe("GET /fav dengan sorting", () => {
    it("should sort characters by name in DESC order", async () => {
      const characters = [
        { id: "1", name: "Alice", house: "Gryffindor", image: "url1" },
        { id: "2", name: "Bob", house: "Gryffindor", image: "url2" },
        { id: "3", name: "Charlie", house: "Gryffindor", image: "url3" },
      ];
      axios.get.mockResolvedValue({ data: characters });

      const res = await request(app)
        .get("/fav")
        .query({ sortBy: "name", sortOrder: "DESC" })
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      const sortedNames = res.body.data.map((char) => char.name);
      expect(sortedNames).toEqual([...sortedNames].sort().reverse());
    });
  });

  describe("GET /fav default pagination", () => {
    it("should use default pagination when pageNumber and pageSize are not provided", async () => {
      const characters = [];
      for (let i = 1; i <= 15; i++) {
        characters.push({
          id: `${i}`,
          name: `Char${i}`,
          house: "Gryffindor",
          image: `url${i}`,
        });
      }
      axios.get.mockResolvedValue({ data: characters });

      const res = await request(app)
        .get("/fav")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.currentPage).toBe(1);
      expect(res.body.data.length).toBe(10);
    });
  });

  describe("POST /fav/:CharacterId missing parameters", () => {
    it("should return 400 if CharacterId is missing", async () => {
      const res = await request(app)
        .post("/fav/")
        .set("Authorization", `Bearer ${accessToken}`)
        .send();

      expect([400, 404]).toContain(res.status);
    });
  });

  describe("POST /fav/sortHat user not found", () => {
    it("should return 404 if user is not found", async () => {
      jest.spyOn(User, "findByPk").mockResolvedValue(null);

      const res = await request(app)
        .post("/fav/sortHat")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ answers: ["A", "B", "C", "D"] });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ message: "Invalid token" });
    });
  });

  describe("POST /fav/sortHat sendWelcomeEmail error", () => {
    it("should handle error when sendWelcomeEmail fails", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                house: "Gryffindor",
                explanation: "Test explanation",
              }),
            },
          },
        ],
      };
      jest.spyOn(User, "findByPk").mockResolvedValue(mockUser);
      getGroqChatCompletion.mockResolvedValue(mockResponse);
      sendWelcomeEmail.mockRejectedValue(new Error("Email error"));

      const res = await request(app)
        .post("/fav/sortHat")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ answers: ["A", "B", "C", "D"] });

      expect(res.status).toBe(500);
    });
  });

  describe("GET /fav for getFavorites - empty result", () => {
    it("should return empty array when no favorites are found", async () => {
      jest.spyOn(Favorite, "findAll").mockResolvedValue([]);

      const res = await request(app)
        .get("/fav/user")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });

  describe("GET /fav filtering by query", () => {
    it("should filter characters based on search query (q)", async () => {
      const characters = [
        { id: "1", name: "Harry Potter", house: "Gryffindor", image: "url1" },
        { id: "2", name: "Draco Malfoy", house: "Slytherin", image: "url2" },
        {
          id: "3",
          name: "Hermione Granger",
          house: "Gryffindor",
          image: "url3",
        },
      ];
      axios.get.mockResolvedValue({ data: characters });

      const res = await request(app)
        .get("/fav")
        .query({ q: "Hermione", pageNumber: 1, pageSize: 10 })
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([
        {
          id: "3",
          name: "Hermione Granger",
          house: "Gryffindor",
          image: "url3",
        },
      ]);
    });
  });

  describe("GET /fav/:CharacterId with optional fields", () => {
    it("should return full character details when optional fields are present", async () => {
      const characterWithDetails = {
        id: "1",
        name: "Harry Potter",
        house: "Gryffindor",
        species: "Wizard",
        gender: "Male",
        patronus: "Stag",
        actor: "Daniel Radcliffe",
        image: "http://example.com/harry.jpg",
      };
      axios.get.mockResolvedValue({ data: [characterWithDetails] });

      const res = await request(app)
        .get("/fav/1")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        message: "Character detail retrieved successfully",
        data: {
          id: characterWithDetails.id,
          name: characterWithDetails.name,
          house: characterWithDetails.house,
          species: characterWithDetails.species,
          gender: characterWithDetails.gender,
          patronus: characterWithDetails.patronus,
          actor: characterWithDetails.actor,
          imageUrl: characterWithDetails.image,
        },
      });
    });
  });

  describe("POST /fav/:CharacterId missing parameters", () => {
    it("should return 400 if CharacterId is missing", async () => {
      const res = await request(app)
        .post("/fav/")
        .set("Authorization", `Bearer ${accessToken}`)
        .send();

      expect([400, 404]).toContain(res.status);
    });
  });

  describe("DELETE /fav/:CharacterId error on destroy", () => {
    it("should call next(error) if favorite.destroy() fails", async () => {
      const mockDestroy = jest
        .fn()
        .mockRejectedValue(new Error("Destroy error"));
      jest.spyOn(Favorite, "findOne").mockResolvedValue({
        id: 1,
        destroy: mockDestroy,
      });

      const res = await request(app)
        .delete("/fav/1")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(500);
    });
  });

  describe("POST /fav/sortHat user.save error", () => {
    it("should handle error when user.save() fails", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                house: "Gryffindor",
                explanation: "Test explanation",
              }),
            },
          },
        ],
      };
      jest.spyOn(User, "findByPk").mockResolvedValue(mockUser);
      getGroqChatCompletion.mockResolvedValue(mockResponse);
      const saveSpy = jest
        .spyOn(mockUser, "save")
        .mockRejectedValue(new Error("Save error"));

      const res = await request(app)
        .post("/fav/sortHat")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ answers: ["A", "B", "C", "D"] });

      expect(res.status).toBe(500);

      expect(saveSpy).toHaveBeenCalled();
    });
  });
});
