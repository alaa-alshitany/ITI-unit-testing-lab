const fastify = require('fastify')({ logger: true });
const startDB = require('./helpers/DB');
const utils = require('./helpers/utils');
const User = require('./models/user');
fastify.register(startDB);

const addUser = async (request, reply) => {
    try {
        const userBody = request.body;
        if (!userBody.firstName || !userBody.lastName || !userBody.age || !userBody.job) {
            throw new Error('Incomplete user data');
        }
        userBody.fullName = utils.getFullName(userBody.firstName, userBody.lastName);
        delete userBody.firstName;
        delete userBody.lastName;
        const user = new User(userBody);
        const addedUser = await user.save();
        return addedUser;

    } catch (error) {
        throw new Error(error.message);
    }
}

const getAllUsers = async (request, reply) => {
    try {
        const users = await User.find({});
        return users;
    } catch (error) {
        throw new Error(error.message);
    }
}

const getSingleUser = async (request, reply) => {
    try {
        const { id } = request.params;
        const user = await User.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    } catch (error) {
        throw new Error(error.message);
    }
}

const deleteUser = async (request, reply) => {
    try {
        const { id } = request.params;
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            throw new Error('User not found');
        }
        return { deleted: 1 };
    } catch (error) {
        throw new Error(error.message);
    }
}

fastify.post('/users', addUser);
fastify.get('/users', getAllUsers);
fastify.get('/users/:id', getSingleUser);
fastify.delete('/users/:id', deleteUser);

fastify.setErrorHandler(function (error, request, reply) {
    reply.status(500).send({ error: error.message });
});

fastify.listen({ port: 3000 }, (err) => {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
});
module.exports = { addUser, getAllUsers, getSingleUser, deleteUser };
