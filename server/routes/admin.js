require("dotenv").config();

const { Router } = require("express");
const jwt = require("jsonwebtoken");
const { adminModel, courseModel } = require("../db");
const { verify } = require("../middlewares/verifyUser");
const z = require("zod");
const bcrypt = require("bcrypt");
const _ = require("lodash");

const SECRET_ADMIN = process.env.JWT_SECRET_ADMIN;

const adminRouter = Router();

function generateToken(user) {
    return new Promise((resolve, reject) => {
        jwt.sign({ id: user._id }, SECRET_ADMIN, (err, token) => {
            if (err) reject(err);
            else resolve(token);
        });
    });
}

function removeUndefined(obj) {
    return _.omitBy(obj, _.isUndefined);
}

adminRouter.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    const emailSchema = z.string().email();
    const passwordSchema = z.string().min(6);

    const validEmail = emailSchema.safeParse(email);
    const validPassword = passwordSchema.safeParse(password);

    if (!validEmail.success) {
        return res.status(400).json({
            message: "enter the correct email",
        });
    }
    if (!validPassword.success) {
        return res.status(400).json({
            message: "the password should be at least 6 characters",
        });
    }

    try {
        const isUser = await adminModel.findOne({ email: email });

        if (isUser) {
            return res.status(409).json({
                message: "user already exist",
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        await adminModel.create({
            name: name,
            email: email,
            password: hashPassword,
        });

        res.status(201).json({
            message: "account created",
        });
    } catch (error) {
        res.status(500).json({
            error: error,
        });
    }
});

adminRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await adminModel.findOne({
            email,
        });

        if (!user) {
            return res.status(400).json({
                message: "user doesn't exist",
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "incorrect password",
            });
        }

        const token = await generateToken(user);
        if (!token) {
            return res.status(500).json({
                message: "Oops!! Something went wrong, please try again",
            });
        }

        res.setHeader("authorization", token);
        res.status(200).json({
            message: "you are logged in",
            creatorId: user._id,
        });
    } catch (error) {
        return res.status(500).json({
            error: error,
        });
    }
});

adminRouter.post("/course", verify(SECRET_ADMIN), async (req, res) => {
    const { title, discreption, price, image, creatorId } = req.body;

    const values = removeUndefined({
        title,
        discreption,
        price,
        image,
        creatorId,
    });

    try {
        const course = await courseModel.create(values);
        res.status(200).json({
            message: "course added",
            courseId: course._id,
        });
    } catch (error) {
        return res.status(500).json({
            error: error,
        });
    }
});

adminRouter.put("/course", verify(SECRET_ADMIN), async (req, res) => {
    const { courseId, title, discreption, image, price, creatorId } = req.body;

    const values = removeUndefined({
        title,
        discreption,
        image,

        price,
    });

    try {
        const courseUpdate = await courseModel.updateOne(
            {
                _id: courseId,
                creatorId: creatorId,
            },
            values
        );

        if (!courseUpdate) {
            return res.status(404).json({
                message: "course not found",
            });
        } else {
            return res.status(200).json({
                message: "course updated",
            });
        }
    } catch (err) {
        return res.status(500).json({
            error: err,
        });
    }
});

adminRouter.get("/courses/all", verify(SECRET_ADMIN), async (req, res) => {
    const { creatorId } = req.body;
    const courses = await courseModel.find({
        creatorId,
    });

    if (courses) {
        res.status(200).json({
            courses: courses,
        });
    } else {
        res.json({
            message: "no course available",
        });
    }
});

module.exports = {
    adminRouter: adminRouter,
};
