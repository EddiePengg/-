const express = require("express");
const mongoose = require("mongoose");
const app = express();
const dotenv = require("dotenv");
const morgan = require("morgan");
const AppError = require("./AppError");

// 加载环境变量
dotenv.config();

// Body parser middleware
app.use(express.json());

app.use(morgan("dev"));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => console.log("MongoDB 数据库连接成功"))
  .catch((err) => {
    console.log("数据库连接失败");
    console.log(err);
    process.exit(1);
  });

// Basic Route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// 卡密(kami)路由
const KamiRouter = require("./kami/router");
app.use("/api/kami", KamiRouter);

// 账号(Account)路由
const AccountRouter = require("./Account/router");
app.use("/api/account", AccountRouter);

// 小红书（xhsAccount）路由
const xhsAccount = require("./xhsAccount/router");
app.use("/api/xhs", xhsAccount);

//处理未捕获的路由
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 集中错误处理
const handleError = require("./handleError");
app.use(handleError);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(` 😸 服务器启动成功，端口： ${PORT}`));

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
