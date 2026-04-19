const request = require("supertest");
const app = require("../server");

describe("Backend API Tests", () => {

  test("GET / should return server message", async () => {
    const res = await request(app).get("/");

    expect(res.statusCode).toBe(200);
    expect(res.text).toBeDefined();
  });

});