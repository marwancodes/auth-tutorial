import { User } from '../models/user.model.js';
import bcrypt from 'bcrypt';
import validator from 'validator';
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';



export const signup = async (req, res) => {
    const { email, password, name } = req.body;

    try {
        // Validate input
        if (!email || !password || !name) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // Validate email, password, and name by Validator
        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }
        if (!validator.isStrongPassword(password, { min: 6 })) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long and contain a mix of letters, numbers, and symbols' });
        }
        if (!validator.isLength(name, { min: 2 })) {
            return res.status(400).json({ success: false, message: 'Name must be at least 2 characters long' });
        }

        // Check if user already exists
        const userAlreadyExists = await User.findOne({ email });
        console.log("userAlreadyExists", userAlreadyExists);

        if (userAlreadyExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString(); // This function should generate a unique verification code

        // Create new user
        const newUser = new User({
            email,
            password: hashedPassword,
            name,
            verificationToken,
            verificationExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // Token valid for 24 hours
        });

        await newUser.save();
        
        // jwt
        generateTokenAndSetCookie(res, newUser._id);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: {
                ...newUser._doc, // Spread operator to include all user fields
                password: undefined, // Exclude password from response
            }
        });

    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};





export const login = async (req, res) => {
    const coco = "123456";
    const salt = await bcrypt.genSalt(10);
    const hashedCoco = await bcrypt.hash(coco, salt);
    console.log(coco ,hashedCoco);
    res.send('login route is working!');
};


export const logout = async (req, res) => {
    res.send('logout route is working!');
};

