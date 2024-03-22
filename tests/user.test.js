const it = require("ava").default;
const chai = require("chai");
const expect = chai.expect;
const startDB = require('../helpers/DB');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { addUser, getAllUsers, deleteUser, getSingleUser } = require('../index'); 
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
            job: "Devops",
        },
    };
    const expectedResult = {
        fullName: "Alaa Walid",
        age: 24,
        job: "Devops",
    };
    sinon.stub(utils, 'getFullName').callsFake((fname, lname) => {
        expect(fname).to.be.equal(request.body.firstName);
        expect(lname).to.be.equal(request.body.lastName);
        return 'Alaa Walid'
    });
    const actualResult = await addUser(request);
    const result = {
        ...expectedResult,
        _v: actualResult._v,
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
        { fullName: "Alaa Walid", age: 24, job: "Devops" },
        { fullName: "Doha Walid", age: 27, job: "Backend" },
        { fullName: "Tasnim Walid", age: 22, job: "Frontend" },
    ];

    await User.insertMany(users);
    const actualResult = await getAllUsers();
    expect(actualResult).to.be.a("array");
    expect(actualResult).to.have.lengthOf(3);

    for (let i = 0; i < users.length; i++) {
        expect(actualResult[i].fullName).to.equal(users[i].fullName);
        expect(actualResult[i].age).to.equal(users[i].age);
        expect(actualResult[i].job).to.equal(users[i].job);
    }

    t.teardown(async () => {
        await User.deleteMany({});
    });
    t.pass();
});

it("Delete User", async (t) => {
    // setup
    const user = new User({
        firstName: "ibrahim",
        lastName: "walid",
        age: 15,
        job: "student",
    });
    await user.save();

    const request = {
        params: {
            id: user._id.toString(),
        },
    };

    const actualResult = await deleteUser(request);
    expect(actualResult).to.deep.equal({ deleted: 1 });
    const deletedUser = await User.findById(user._id);
    expect(deletedUser).to.be.null;

    t.pass();
});

it("Get Single User", async (t) => {
    // setup
    const user = new User({
        firstName: "mohamed",
        lastName: "walid",
        age: 18,
        job: "student",
    });
    await user.save();

    const request = {
        params: {
            id: user._id.toString(),
        },
    };
    const actualResult = await getSingleUser(request);
    expect(actualResult._id.toString()).to.equal(user._id.toString());
    expect(actualResult.firstName).to.equal(user.firstName);
    expect(actualResult.lastName).to.equal(user.lastName);
    expect(actualResult.age).to.equal(user.age);
    expect(actualResult.job).to.equal(user.job);

    t.pass();
});
