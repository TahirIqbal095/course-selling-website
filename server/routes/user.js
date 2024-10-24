const { Router } = require("express");

const userRouter = Router();

userRouter.post("/signup", (req, res) => {
    const { name, email, password } = req.body;
    res.json({
        message: "user sign in",
    });
});

userRouter.post("/login", (req, res) => {
    res.json({
        message: "you are logged in",
    });
});

userRouter.get("/purchases", (req, res) => {
    res.json({
        message: "no courses purchased yet",
    });
});

module.exports = {
    userRouter: userRouter,
};
