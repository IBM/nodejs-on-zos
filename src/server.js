const express = require('express');
const db2 = require('./db2');
const assert = require('assert');

// Check if the required environment variables exist.
assert.notEqual(process.env.WAZI_SANDBOX_DB2_IP, '');
assert.notEqual(process.env.WAZI_SANDBOX_DB2_PORT, '');
assert.notEqual(process.env.WAZI_SANDBOX_USER, '');
assert.notEqual(process.env.WAZI_SANDBOX_PASSWORD, '');

const app = express();
app.use(express.json());

// Start the server.
if (process.env.NODE_ENV !== 'test') {
    app.listen(1339, () => {
        console.log('Server is running and listening at port http://localhost:1339');
    });
}

// Create the [GET] / Rest API.
app.get('/', (request, response) => {
    response
        .status(200)
        .send('Hello from the Node.js application!');
});

// Create the [GET] /users Rest API.
app.get('/users', async (request, response) => {
    try {

        let users = await db2.findAll();
        response.status(200).json(users);

    } catch (err) {
        response.status(500).send(err.message);
    }
});

// Create the [GET] /user/:email Rest API.
app.get('/user/:email', async (request, response) => {

    try {

        const user = await db2.findByEmail(request.params.email);

        if (!user)
            response.status(404).send(`The user with email '${request.params.email}' doesn't exist`);
        else
            response.status(200).json(user);

    } catch (err) {
        response.status(500).send(err.message);
    }
});

// Create the [POST] /user Rest API.
app.post('/user', async (request, response) => {

    try {

        await db2.create(request.body);
        response.status(201).json(request.body);

    } catch (err) {
        response.status(500).send(err.message);
    }
});

// Create the [DELETE] /user/:email Rest API.
app.delete('/user/:email', async (request, response) => {

    try {

        const result = await db2.delete(request.params.email);

        if (!result)
            response.status(404).send(`The user with the email ${request.params.email} doesn't exist`);
        else
            response.status(200).send(`The user with the email ${request.params.email} has been deleted`);

    } catch (err) {
        response.status(500).send(err.message);
    }
});

// Create the [PATCH] /user/:email Rest API.
app.patch('/user/:email', async (request, response) => {

    const firstname = request.query.firstname ? request.query.firstname.toString() : null;
    const lastname = request.query.lastname ? request.query.lastname.toString() : null;

    try {
        
        const result = await db2.update(request.params.email, firstname, lastname);

        if (!result)
            response.status(404).send(`The user with the email ${request.params.email} doesn't exist`);
        else
            response.status(200).json(result);

    } catch(err) {
        response.status(500).send(err.message);
    }
});

module.exports = app;