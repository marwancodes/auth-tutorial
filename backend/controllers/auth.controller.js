import bcrypt from 'bcrypt';
import crypto from 'crypto';
import validator from 'validator';

import { User } from '../models/user.model.js';

import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } from '../mailtrap/emails.js';


//****************************** Singup Endpoint *******************************/
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

        await sendVerificationEmail(newUser.email, verificationToken);

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

//****************************** Verify Email Endpoint *******************************/
export const verifyEmail = async (req, res) => {
    const { code } = req.body;
    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationExpiresAt: { $gt: Date.now() } // Check if token is still valid
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
        }

        user.isVerified = true;
        user.verificationToken = undefined; // Clear the verification token from database
        user.verificationExpiresAt = undefined; // Clear the expiration time from database
        await user.save();

        await sendWelcomeEmail(user.email, user.name); // function to send a welcome email after verification

        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            user: {
                ...user._doc, // Spread operator to include all user fields
                password: undefined, // Exclude password from response
            }
        });

    } catch (error) {
        console.error('Error verifying email:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}

//****************************** Login Endpoint *******************************/
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        generateTokenAndSetCookie(res, user._id);

        user.lastLogin = Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                ...user._doc, // Spread operator to include all user fields
                password: undefined, // Exclude password from response
            }
        });

    } catch (error) {
        console.error('Error logging in:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

//****************************** Logout Endpoint *******************************/
export const logout = async (req, res) => {
    res.clearCookie("token"); // Clear the token cookie
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};

//****************************** Forgot Password Endpoint *******************************/
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex'); // Generate a random token
        const resetTokenExpiresAt = Date.now() + 3600000; // Token valid for 1 hour
        
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;

        await user.save();

        // Send reset password email
        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

        res.status(200).json({ success: true, message: "Password reset link sent to your email" });

    } catch (err) {
        console.log('Error in forgot password:', err);
        return res.status(400).json({ success: false, message: err.message });
    }
}