const Account = require("./modal");
const { catchAsync } = require("../util");
const jwt = require("jsonwebtoken");

const createAccount = catchAsync(async (req, res) => {
  const account = await Account.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      account,
    },
  });
});

const deleteAccount = catchAsync(async (req, res) => {
  const account = await Account.findByIdAndDelete(req.params.id);

  if (!account) {
    return res.status(404).json({
      status: "error",
      message: "No account found with that ID",
    });
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

const updateAccount = catchAsync(async (req, res) => {
  const account = await Account.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!account) {
    return res.status(404).json({
      status: "error",
      message: "No account found with that ID",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      account,
    },
  });
});

const getAllAccounts = catchAsync(async (req, res) => {
  const accounts = await Account.find(req.queryObj)
    .sort(req.sortBy)
    .select(req.fields)
    .skip(req.skip)
    .limit(req.limit);

  res.status(200).json({
    status: "success",
    data: accounts,
    length: accounts.length,
  });
});

const login = catchAsync(async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res
      .status(400)
      .json({ status: "fail", message: "Phone and password are required." });
  }

  // 查找账号
  const account = await Account.findOne({ phone });
  if (!account) {
    return res
      .status(401)
      .json({ status: "fail", message: "Invalid phone or password." });
  }

  // 验证密码

  if (account.password !== password) {
    return res
      .status(401)
      .json({ status: "fail", message: "Invalid phone or password." });
  }

  // 生成 JWT
  const token = jwt.sign(
    { accountId: account._id, phone: account.phone },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.status(200).json({ status: "success", token });
});

module.exports = {
  createAccount,
  deleteAccount,
  updateAccount,
  getAllAccounts,
  login,
};
