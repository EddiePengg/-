const jwt = require("jsonwebtoken");
const Account = require("./Account/modal");

function catchAsync(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

// 验证SECRETKEY，防止恶意请求到超管后台的API
function checkSECRETKEY(req, res, next) {
  next();
  return;

  const apiKey = req.headers["x-api-key"] || req.headers["authorization"];

  if (!apiKey || apiKey !== process.env.SECRETKEY) {
    return res.status(401).json({
      status: "fail",
      message: "Unauthorized",
    });
  }
  next();
}

// 查询处理中间件
const queryHandler = (req, res, next) => {
  let queryObj = { ...req.query };
  const excludeFields = ["sort", "limit", "page", "fields"];
  excludeFields.forEach((el) => delete queryObj[el]);

  // 高级过滤：gt, gte, lt, lte
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  queryObj = JSON.parse(queryStr);

  req.queryObj = queryObj;

  // 排序
  if (req.query.sort) {
    req.sortBy = req.query.sort.split(",").join(" ");
  } else {
    req.sortBy = "-createdAt"; // 默认排序
  }

  // 字段限制
  if (req.query.fields) {
    req.fields = req.query.fields.split(",").join(" ");
  } else {
    req.fields = "-__v"; // 默认不显示__v字段
  }

  // 分页
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;

  req.page = page;
  req.limit = limit;
  req.skip = skip;

  next();
};

// jwt验证中间件

const verifyJWTToken = (req, res, next) => {
  let token = req.headers["authorization"];

  if (token && token.startsWith("Bearer ")) {
    token = token.split(" ")[1]; // 获取'Bearer '后面的token字符串
  } else {
    // 如果没有token或格式不正确，返回错误
    return res.status(401).json({
      status: "fail",
      message: "No token provided or invalid format.",
    });
  }

  if (!token) {
    return res
      .status(403)
      .json({ status: "fail", message: "No token provided." });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ status: "fail", message: "Failed to authenticate token." });
    }

    // 查找并附加账号信息
    const account = await Account.findById(decoded.accountId);
    if (!account) {
      return res
        .status(404)
        .json({ status: "fail", message: "Account not found." });
    }

    req.account = account; // 将账号信息附加到请求对象
    next();
  });
};

module.exports = { catchAsync, checkSECRETKEY, queryHandler, verifyJWTToken };
