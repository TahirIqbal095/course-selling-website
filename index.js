require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const { userRouter } = require("./server/routes/user");
const { courseRouter } = require("./server/routes/courses");
const { adminRouter } = require("./server/routes/admin");

const DATABASE_URL = process.env.MONGODB_URL;

const app = express();
app.use(express.json());

app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/course", courseRouter);

async function main() {
    await mongoose.connect(DATABASE_URL);

    app.listen(3000, () => {
        console.log("listening on port 3000");
    });
}

main();
