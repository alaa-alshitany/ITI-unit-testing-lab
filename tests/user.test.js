const it = require("ava").default;
const chai = require("chai");
const expect = chai.expect;
const startDB = require('../helpers/DB');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { addUser, getAllUsers } = require('../index'); 
const User = require('../models/user');
const sinon = require("sinon");
const utils = require('../helpers/utils');

it.before(async (t) => {
    t.context.mongod = await MongoMemoryServer.create();
    process.env.MONGOURI = t.context.mongod.getUri('cloudUnitTesting');
    await startDB();
});

it.after(async (t) => {
    await t.context.mongod.stop({ doCleanUp: true });
});

it("create user successfully", async (t) => {
    // setup
    const request = {
        body: {
            firstName: "Alaa",
            lastName: "Walid",
            age: 24,
            job: "Devops Engineer",
        },
    };
    const expectedResult = {
        fullName: "Alaa Walid",
        age: 24,
        job: "Devops Engineer",
    };
    sinon.stub(utils, 'getFullName').callsFake((fname, lname) => {
        expect(fname).to.be.equal(request.body.firstName);
        expect(lname).to.be.equal(request.body.lastName);
        return 'Alaa Walid'
    });
    const actualResult = await addUser(request);
    const result = {
        ...expectedResult,
        __v: actualResult.__v,
        _id: actualResult._id
    };
    expect(actualResult).to.be.a('object');
    expect(actualResult._doc).to.deep.equal(result);
    t.teardown(async () => {
        await User.deleteMany({
            fullName: request.body.fullName,
        });
    });
    t.pass();
});

it("Get All Users", async (t) => {
    const users = [
        { first_name: "Alaa", last_name: "Walid", age: 24, job: "Devops" },
        { first_name: "Doha", last_name: "Walid", age: 27, job: "Backend" },
        { first_name: "Tasnim", last_name: "Walid", age: 22, job: "Frontend" },
    ];

    await User.insertMany(users);
    const actualResult = await getAllUsers();
    expect(actualResult).to.be.a("array");
    expect(actualResult).to.have.lengthOf(3);

    for (let i = 0; i < users.length; i++) {
        expect(actualResult[i].first_name).to.equal(users[i].first_name);
        expect(actualResult[i].last_name).to.equal(users[i].last_name);
        expect(actualResult[i].age).to.equal(users[i].age);
        expect(actualResult[i].job).to.equal(users[i].job);
    }

    t.teardown(async () => {
        await User.deleteMany({});
    });
    t.pass();
});
