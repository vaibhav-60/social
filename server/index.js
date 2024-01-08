
const express = require('express');
const dotenv = require('dotenv');
const dbConnect = require('./dbConnect');
const authRouter = require('./routers/authRouter');
const postRouter = require('./routers/postRouter');
const morgan = require('morgan');
const userRouter = require('./routers/userRouter');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const cloudinary = require("cloudinary").v2;



dotenv.config("./.env");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_NAME,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
// middlewares
app.use(express.json({ limit: '10mb' }));
app.use(morgan('common'));
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}))

app.use('/auth', authRouter);
app.use('/post', postRouter);
app.use('/user', userRouter);
app.get('/', (req, res) => {
    res.send('backened working')
})

const PORT = process.env.PORT;
dbConnect();
app.listen(PORT, () => {
    console.log(`the port is listening on ${PORT}`)
})