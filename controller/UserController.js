const User = require('../model/UserModel');
const validator = require('validator');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const createToken = (_id) => {
    return jwt.sign({_id}, process.env.SECRET, {expiresIn: '3d'});
}

const Signup = async (req, res) => {
    try {
        const { fullName, email, password, role } = req.body;

        if (!email || !password || !fullName) {
            throw Error('All Fields are Required!');
        }

        if (!validator.isEmail(email)) {
            throw Error('Invalid Email Address!');
        }

        if (password.length < 8) {
            throw Error('Password should be at least 8 characters long!');
        }

        const exists = await User.findOne({ email });
        if (exists) {
            throw Error('Email already exists!');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            fullName,
            email,
            password: hashedPassword,
            role
        });

        const savedUser = await user.save();

        const token = createToken(savedUser._id);

        res.status(200).json({
            message: 'User Logged In!',
            fullName: user.fullName,
            token
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const GetUsers = async (req, res) => {
    try{
        const users = await User.find();
        res.status(200).json(users);
    }catch(error){
        res.status(400).json({ message: error.message });
    }
}

const Login = async(req, res) => { 
    try{
        const { email, password } = req.body;


        if (!email || !password) {
            throw Error('All Fields are Required!');
        }

        const user = await User.findOne({ email });

        if (!user) {
            throw Error('Invalid Email or Password!');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            throw Error('Invalid Email or Password!');
        }

        const token = createToken(user._id);

        res.status(200).json({
            message: 'User Logged In!',
            fullName: user.fullName,
            token
        });

    }catch(error){
        res.status(400).json({ message: error.message });
    }
}


module.exports = {
    Signup,
    Login,
    GetUsers
}