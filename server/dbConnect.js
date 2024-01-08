const { CURSOR_FLAGS } = require('mongodb');
const mongoose = require('mongoose');

module.exports = async () => {
    const mongoUri = 'mongodb+srv://userlogin:userlogin1234@logindata.xd4zdev.mongodb.net/?retryWrites=true&w=majority'

    try {
        const connect = await mongoose.connect(mongoUri, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        });
        console.log(`mongoDB Connected: ${connect.connection.host}`);
    }
    catch (error) {
        console.log(error);
    }

};   