const request = require("supertest");
const app = require("../app"); // Ensure this points to your Express app
const { Favorite, User } = require("../models");
const axios = require("axios");
const { signToken } = require("../helper/jwt");
const { getGroqChatCompletion } = require("../helper/groqhelper");
const { sendWelcomeEmail } = require("../helper/emailService");

jest.mock("axios");
jest.mock("../models");
jest.mock("../helper/jwt");
jest.mock("../helper/groqhelper");
jest.mock("../helper/emailService");

describe("Favorite Controller Tests", () => {
  let accessToken;

  beforeEach(() => {
    accessToken = signToken({ id: 1 });
    jest.clearAllMocks();
  });

  describe("POST /fav/:CharacterId", () => {
    it("should add a favorite character and return 201 status", async () => {
      const mockCharacter = {
        id: "1",
        name: "Harry Potter",
        house: "Gryffindor",
        image: "http://example.com/harry.jpg",
      };

      axios.get.mockResolvedValue({ data: [mockCharacter] });
      Favorite.findOne.mockResolvedValue(null);
      Favorite.create.mockResolvedValue({
        id: 1,
        CharacterId: mockCharacter.id,
        characterName: mockCharacter.name,
        house: mockCharacter.house,
        imageUrl: mockCharacter.image,
        UserId: 1,
      });

      const response = await request(app)
        .post("/fav/1")
        .set("Authorization", `Bearer ${accessToken}`)
        .send();

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: "Favorite character added successfully",
        data: {
          id: 1,
          CharacterId: mockCharacter.id,
          characterName: mockCharacter.name,
          house: mockCharacter.house,
          imageUrl: mockCharacter.image,
          UserId: 1,
        },
      });
    });

    it("should return 404 if the character is not found", async () => {
      axios.get.mockResolvedValue({ data: [] });

      const response = await request(app)
        .post("/fav/1")
        .set("Authorization", `Bearer ${accessToken}`)
        .send();

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Character not found" });
    });

    it("should return 400 if the character is already in favorites", async () => {
      Favorite.findOne.mockResolvedValue({ id: 1 });

      const response = await request(app)
        .post("/fav/1")
        .set("Authorization", `Bearer ${accessToken}`)
        .send();

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Character is already in favorites",
      });
    });
  });

  describe("GET /fav", () => {
    it("should retrieve all favorite characters", async () => {
      Favorite.findAll.mockResolvedValue([
        {
          id: 1,
          CharacterId: "1",
          characterName: "Harry Potter",
          house: "Gryffindor",
          imageUrl: "http://example.com/harry.jpg",
          UserId: 1,
        },
      ]);

      const response = await request(app)
        .get("/fav")
        .set("Authorization", `Bearer ${accessToken}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Data retrieved successfully",
        data: [
          {
            id: 1,
            CharacterId: "1",
            characterName: "Harry Potter",
            house: "Gryffindor",
            imageUrl: "http://example.com/harry.jpg",
            UserId: 1,
          },
        ],
      });
    });
  });

  describe("GET /fav/:CharacterId", () => {
    it("should retrieve character details", async () => {
      const mockCharacter = {
        id: "1",
        name: "Harry Potter",
        house: "Gryffindor",
        species: "Human",
        gender: "Male",
        patronus: "Stag",
        actor: "Daniel Radcliffe",
        image: "http://example.com/harry.jpg",
      };

      axios.get.mockResolvedValue({ data: [mockCharacter] });

      const response = await request(app)
        .get("/fav/1")
        .set("Authorization", `Bearer ${accessToken}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Character detail retrieved successfully",
        data: {
          id: mockCharacter.id,
          name: mockCharacter.name,
          house: mockCharacter.house,
          species: mockCharacter.species,
          gender: mockCharacter.gender,
          patronus: mockCharacter.patronus,
          actor: mockCharacter.actor,
          imageUrl: mockCharacter.image,
        },
      });
    });

    it("should return 404 if the character is not found", async () => {
      axios.get.mockResolvedValue({ data: [] });

      const response = await request(app)
        .get("/fav/1")
        .set("Authorization", `Bearer ${accessToken}`)
        .send();

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Character not found" });
    });
  });

  describe("DELETE /fav/:CharacterId", () => {
    it("should delete a favorite character and return 200 status", async () => {
      Favorite.findOne.mockResolvedValue({
        id: 1,
        destroy: jest.fn(),
      });

      const response = await request(app)
        .delete("/fav/1")
        .set("Authorization", `Bearer ${accessToken}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Favorite character removed successfully",
      });
    });

    it("should return 404 if the favorite character is not found", async () => {
      Favorite.findOne.mockResolvedValue(null);

      const response = await request(app)
        .delete("/fav/1")
        .set("Authorization", `Bearer ${accessToken}`)
        .send();

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: "Favorite character not found",
      });
    });
  });

  describe("POST /fav/sortHat", () => {
    it("should sort a user into a house and send an email", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        username: "testuser",
        save: jest.fn(),
      };

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

      User.findByPk.mockResolvedValue(mockUser);
      getGroqChatCompletion.mockResolvedValue(mockResponse);
      sendWelcomeEmail.mockResolvedValue();

      const response = await request(app)
        .post("/fav/sortHat")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ answers: ["Bravery", "Loyalty", "Intelligence", "Ambition"] });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        house: "Gryffindor",
        explanation: "You are brave and courageous.",
        message: "Sorting completed and email sent!",
      });
    });

    it("should return 400 if answers are invalid", async () => {
      const response = await request(app)
        .post("/fav/sortHat")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ answers: null });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Invalid input" });
    });
  });
});
