const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const PDFDocument = require('pdfkit');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Register a User
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password } = req.body;
    try {
        const users = await User.findOne({ email }).select("+password");

        if (users) {
            return next(new ErrorHandler("User is already exist please login", 401));
        }

        const user = await User.create({
            name: name,
            email: email,
            password: password,
        });
        sendToken(user, 201, res);
    } catch (error) {
        return next(new ErrorHandler("Failed to Sign up"))
    }
});

// Login User
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    // const { body } = req
    const { email, password } = req.body;
    // Checking if user has given password and email both
    try {
        if (!email || !password) {
            return next(new ErrorHandler("Please Enter Email & Password", 400));
        }
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return next(new ErrorHandler("Invalid Email or Password", 401));
        }
        const isPasswordMatched = await user.comparePassword(password);
        if (!isPasswordMatched) {
            return next(new ErrorHandler("Invalid Email or Password", 401));
        }
        sendToken(user, 200, res);
    } catch (error) {
        return next(new ErrorHandler("Not Authorized"))
    }
});


// Logout User
exports.logout = catchAsyncErrors(async (req, res, next) => {
    try {
        res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
        });

        res.status(200).json({
            success: true,
            message: "Logged Out",
        });
    } catch (error) {
        return next(new ErrorHandler("Logout Failed"))
    }
});

const genAI = new GoogleGenerativeAI("AIzaSyAM1T6li4pgjil1q55wbC_UvYq-cbNJs2I");
const answer = async (question) => {
    try {
        // For text-only input, use the gemini-pro model
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = question
        const result = await model.generateContent(prompt);
        // const response = await result.response;
        const res = result.response;
        const text = res.text();
        // console.log(text);
        return text
    } catch (error) {
        window.alert(error)
    }
}

// Creating PDF
exports.generatePdf = catchAsyncErrors(async (req, res, next) => {
    try {
        const { text } = req.body;
        // Create a PDF document
        const doc = new PDFDocument();
        const fileName = 'output.pdf';
        // Set content disposition to force the browser to download the file
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/pdf');
        // Pipe the PDF content to the response
        doc.pipe(res);
        doc.fontSize(21).text("Blueprint According to your Response").moveDown()
        doc.fontSize(12).text(text).moveDown()

        // Finalize the PDF
        doc.end();
    } catch (error) {
        // Handle errors
        console.error(error);
        return next(error);
    }
});

exports.generateResponse = catchAsyncErrors(async (req, res) => {
    try {
        const { tPrompt } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(tPrompt);
        const gemRes = result.response;
        const text = gemRes.text();
        res.status(200).json(text);
    } catch (error) {
        // Handle errors
        console.error(error);
        return next(error);
    }
});