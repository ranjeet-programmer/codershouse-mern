require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const router = require("./routes");
const DBConnect = require("./database");
const PORT = process.env.PORT || 5500;
const cookieParser = require("cookie-parser");
DBConnect();

app.use(cookieParser());
const corsOptions = {
  origin: ["http://localhost:3000"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use("/storage", express.static("storage"));
app.use(express.json({ limit: "8mb" }));
app.use(router);

app.get("/", (req, res) => {
  res.send("Hello from express js");
});

app.listen(5000, () => {
  console.log(`Server is running on port ${PORT}`);
});
