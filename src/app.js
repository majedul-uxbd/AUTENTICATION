require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const { authRoutes } = require("./routes/auth.route.js");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(
    express.urlencoded({
        extended: true,
        limit: "10mb",
        parameterLimit: 10000,
    })
);

app.use("/api/auth", authRoutes);


// app.use("/", (req, res) => {
//     return res.status(200).send({
//         status: "success",
//         message: "Welcome to the CRM Server"
//     })
// })

const staticFilePath = path.join(__dirname, "/../uploads");
app.use("/uploads", express.static(staticFilePath));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.warn(
        `Application started and listening on http://localhost:${PORT}`
    );
});