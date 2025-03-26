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
  it("should retrieve all favorite characters", async () => {
    jest.spyOn(Favorite, "findAll").mockResolvedValue([
      {
        id: 1,
        CharacterId: mockCharacter.id,
        characterName: mockCharacter.name,
        house: mockCharacter.house,
        imageUrl: mockCharacter.image,
        UserId: mockUser.id,
      },
    ]);

    const res = await request(app)
      .get("/fav")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "Data retrieved successfully",
      data: [
        {
          id: 1,
          CharacterId: mockCharacter.id,
          characterName: mockCharacter.name,
          house: mockCharacter.house,
          imageUrl: mockCharacter.image,
          UserId: mockUser.id,
        },
      ],
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
});
