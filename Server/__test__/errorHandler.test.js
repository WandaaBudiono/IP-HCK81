const errorHandler = require("../middleware/errorHandler");
const httpMocks = require("node-mocks-http");

describe("errorHandler middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
  });

  it("should handle Unauthorized error", () => {
    const error = new Error("Unauthorized access");
    error.name = "Unauthorized";

    errorHandler(error, req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res._getJSONData()).toEqual({ message: error.message });
  });

  it("should handle InvalidToken error", () => {
    const error = new Error("Token error");
    error.name = "InvalidToken";

    errorHandler(error, req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res._getJSONData()).toEqual({ message: "Invalid token" });
  });

  it("should handle JsonWebTokenError error", () => {
    const error = new Error("JWT error");
    error.name = "JsonWebTokenError";

    errorHandler(error, req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res._getJSONData()).toEqual({ message: "Invalid token" });
  });

  it("should handle NotFound error", () => {
    const error = new Error("Resource not found");
    error.name = "NotFound";

    errorHandler(error, req, res, next);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toEqual({ message: error.message });
  });

  it("should handle BadRequest error", () => {
    const error = new Error("Bad request data");
    error.name = "BadRequest";

    errorHandler(error, req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ message: error.message });
  });

  it("should handle SequelizeValidationError", () => {
    const error = new Error("Validation error");
    error.name = "SequelizeValidationError";
    error.errors = [{ message: "Invalid field" }];

    errorHandler(error, req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ message: "Invalid field" });
  });

  it("should handle SequelizeUniqueConstraintError", () => {
    const error = new Error("Unique constraint error");
    error.name = "SequelizeUniqueConstraintError";
    error.errors = [{ message: "Unique field already exists" }];

    errorHandler(error, req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      message: "Unique field already exists",
    });
  });

  it("should handle Forbidden error", () => {
    const error = new Error("Access forbidden");
    error.name = "Forbidden";

    errorHandler(error, req, res, next);

    expect(res.statusCode).toBe(403);
    expect(res._getJSONData()).toEqual({ message: error.message });
  });

  it("should handle generic errors and return 500", () => {
    const error = new Error("Some server error");
    error.name = "OtherError";

    errorHandler(error, req, res, next);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({
      message: "Internal server error from error handler",
    });
  });
});
