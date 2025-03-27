// favController.unit.test.js
const favController = require("../controllers/favController");
const { Favorite, User } = require("../models");
const axios = require("axios");
const { getGroqChatCompletion } = require("../helper/groqHelper");
const { sendWelcomeEmail } = require("../helper/emailService");

// Buat mock untuk res dan next
const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const next = jest.fn();

jest.mock("axios");
jest.mock("../helper/groqHelper");
jest.mock("../helper/emailService");

describe("favController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should return paginated and filtered characters", async () => {
      const req = {
        query: {
          house: "Gryffindor",
          q: "Harry",
          pageNumber: "1",
          pageSize: "10",
          sortBy: "name",
          sortOrder: "ASC",
        },
      };
      const res = createRes();
      // Mock axios response
      axios.get.mockResolvedValue({
        data: [
          { id: "1", name: "Harry Potter", house: "Gryffindor", image: "url1" },
          { id: "2", name: "Draco Malfoy", house: "Slytherin", image: "url2" },
          {
            id: "3",
            name: "Hermione Granger",
            house: "Gryffindor",
            image: "url3",
          },
        ],
      });

      await favController.getAll(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Data retrieved successfully",
          totalItems: 1, // karena hanya "Harry Potter" yang cocok dengan query "Harry"
          currentPage: 1,
        })
      );
    });

    it("should call next(error) when axios.get fails", async () => {
      const req = { query: {} };
      const res = createRes();
      const error = new Error("Axios error");
      axios.get.mockRejectedValue(error);

      await favController.getAll(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("add", () => {
    const mockUser = { id: 1, email: "test@example.com" };

    it("should return 400 if CharacterId or UserId is missing", async () => {
      const req = { params: {}, body: {}, user: mockUser };
      const res = createRes();

      await favController.add(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "CharacterId and UserId are required",
      });
    });

    it("should return 404 if character is not found", async () => {
      const req = {
        params: { CharacterId: "1" },
        body: { UserId: mockUser.id },
        user: mockUser,
      };
      const res = createRes();
      axios.get.mockResolvedValue({ data: [] });

      await favController.add(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Character not found" });
    });

    it("should return 400 if character is already in favorites", async () => {
      const req = {
        params: { CharacterId: "1" },
        body: { UserId: mockUser.id },
        user: mockUser,
      };
      const res = createRes();
      axios.get.mockResolvedValue({
        data: [{ id: "1", name: "Test", house: "Gryffindor", image: "url" }],
      });
      jest.spyOn(Favorite, "findOne").mockResolvedValue({ id: 10 });

      await favController.add(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Character is already in favorites",
      });
    });

    it("should successfully add favorite", async () => {
      const character = {
        id: "1",
        name: "Test",
        house: "Gryffindor",
        image: "url",
      };
      const req = {
        params: { CharacterId: "1" },
        body: { UserId: mockUser.id },
        user: mockUser,
      };
      const res = createRes();
      axios.get.mockResolvedValue({ data: [character] });
      jest.spyOn(Favorite, "findOne").mockResolvedValue(null);
      jest.spyOn(Favorite, "create").mockResolvedValue({
        id: 100,
        CharacterId: character.id,
        characterName: character.name,
        house: character.house,
        imageUrl: character.image,
        UserId: mockUser.id,
      });

      await favController.add(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Favorite character added successfully",
        })
      );
    });
  });

  describe("getCharacterDetail", () => {
    it("should return 404 if character is not found", async () => {
      const req = { params: { CharacterId: "1" } };
      const res = createRes();
      axios.get.mockResolvedValue({ data: [] });

      await favController.getCharacterDetail(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Character not found" });
    });

    it("should return character details successfully", async () => {
      const character = {
        id: "1",
        name: "Test",
        house: "Gryffindor",
        species: "Wizard",
        gender: "Male",
        patronus: "Stag",
        actor: "Actor",
        image: "url",
      };
      const req = { params: { CharacterId: "1" } };
      const res = createRes();
      axios.get.mockResolvedValue({ data: [character] });

      await favController.getCharacterDetail(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Character detail retrieved successfully",
        data: {
          id: character.id,
          name: character.name,
          house: character.house,
          species: character.species,
          gender: character.gender,
          patronus: character.patronus,
          actor: character.actor,
          imageUrl: character.image,
        },
      });
    });
  });

  describe("deleteFavorite", () => {
    const mockUser = { id: 1 };

    it("should return 404 if favorite not found", async () => {
      const req = { params: { CharacterId: "1" }, user: mockUser };
      const res = createRes();
      jest.spyOn(Favorite, "findOne").mockResolvedValue(null);

      await favController.deleteFavorite(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Favorite character not found",
      });
    });

    it("should call next(error) if destroy fails", async () => {
      const req = { params: { CharacterId: "1" }, user: mockUser };
      const res = createRes();
      const fakeFavorite = {
        id: 1,
        destroy: jest.fn().mockRejectedValue(new Error("Destroy error")),
      };
      jest.spyOn(Favorite, "findOne").mockResolvedValue(fakeFavorite);

      await favController.deleteFavorite(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("should successfully delete favorite", async () => {
      const req = { params: { CharacterId: "1" }, user: mockUser };
      const res = createRes();
      const fakeFavorite = { id: 1, destroy: jest.fn().mockResolvedValue() };
      jest.spyOn(Favorite, "findOne").mockResolvedValue(fakeFavorite);

      await favController.deleteFavorite(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Favorite character removed successfully",
      });
    });
  });

  describe("sortHat", () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      username: "tester",
      save: jest.fn().mockResolvedValue(),
    };

    it("should return 400 if answers is invalid", async () => {
      const req = { body: { answers: null }, user: { id: 1 } };
      const res = createRes();

      await favController.sortHat(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid input" });
    });

    it("should return 400 if Groq response is invalid (no houseData)", async () => {
      const req = { body: { answers: ["A", "B", "C", "D"] }, user: { id: 1 } };
      const res = createRes();
      getGroqChatCompletion.mockResolvedValue({});

      await favController.sortHat(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid Groq response" });
    });

    it("should return 400 if JSON.parse fails", async () => {
      const req = { body: { answers: ["A", "B", "C", "D"] }, user: { id: 1 } };
      const res = createRes();
      // Kirim content yang bukan JSON valid
      getGroqChatCompletion.mockResolvedValue({
        choices: [{ message: { content: "not a valid json" } }],
      });

      await favController.sortHat(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      // Pesan error bisa disesuaikan sesuai implementasi
    });

    it("should return 400 if parsedHouse.house is not a string", async () => {
      const req = { body: { answers: ["A", "B", "C", "D"] }, user: { id: 1 } };
      const res = createRes();
      getGroqChatCompletion.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({ house: 123, explanation: "Test" }),
            },
          },
        ],
      });

      await favController.sortHat(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "House must be a string",
      });
    });

    it("should return 404 if user is not found", async () => {
      const req = { body: { answers: ["A", "B", "C", "D"] }, user: { id: 1 } };
      const res = createRes();
      getGroqChatCompletion.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                house: "Gryffindor",
                explanation: "Test",
              }),
            },
          },
        ],
      });
      jest.spyOn(User, "findByPk").mockResolvedValue(null);

      await favController.sortHat(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
    });

    it("should successfully sort hat and send email", async () => {
      const req = { body: { answers: ["A", "B", "C", "D"] }, user: { id: 1 } };
      const res = createRes();
      const groqResponse = {
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
      getGroqChatCompletion.mockResolvedValue(groqResponse);
      jest.spyOn(User, "findByPk").mockResolvedValue(mockUser);
      sendWelcomeEmail.mockResolvedValue();

      await favController.sortHat(req, res, next);
      expect(mockUser.save).toHaveBeenCalled();
      expect(sendWelcomeEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.username,
        "Gryffindor"
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        house: "Gryffindor",
        explanation: "Test explanation",
        message: "Sorting completed and email sent!",
      });
    });
  });

  describe("getFavorites", () => {
    it("should call next(error) if Favorite.findAll fails", async () => {
      const req = { user: { id: 1 } };
      const res = createRes();
      const error = new Error("DB error");
      jest.spyOn(Favorite, "findAll").mockRejectedValue(error);

      await favController.getFavorites(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });

    it("should successfully retrieve favorites", async () => {
      const req = { user: { id: 1 } };
      const res = createRes();
      const fakeFavorites = [{ id: 1, name: "Test" }];
      jest.spyOn(Favorite, "findAll").mockResolvedValue(fakeFavorites);

      await favController.getFavorites(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Favorites retrieved successfully",
        data: fakeFavorites,
      });
    });
  });
});
