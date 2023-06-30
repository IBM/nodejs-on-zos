
const app = require("../src/server");
const request = require('supertest')(app);

it("Test the Rest API at path /", async () => {

  const response = await request.get('/')
  expect(response.statusCode).toEqual(200);
  expect(response.text).toEqual("Hello from the Node.js application!");
});