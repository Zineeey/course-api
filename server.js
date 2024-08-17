const express = require('express');
require('dotenv').config();
const app = express();
const courseRouter = require('./routes/CourseRoutes');
const userRouter = require('./routes/UserRoutes');
const mongoose = require('mongoose');

app.use(express.json());

app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});


app.use('/api/course', courseRouter)
app.use('/api/users', userRouter)


mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log(err);
    }); 


