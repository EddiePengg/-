const Xiaohongshu = require("./modal");
const { catchAsync } = require("../util");
const axios = require("axios");

const createXiaohongshu = catchAsync(async (req, res) => {
  const xiaohongshu = await Xiaohongshu.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      xiaohongshu,
    },
  });
});

const deleteXiaohongshu = catchAsync(async (req, res) => {
  const xiaohongshu = await Xiaohongshu.findByIdAndDelete(req.params.id);

  if (!xiaohongshu) {
    return res.status(404).json({
      status: "error",
      message: "No Xiaohongshu account found with that ID",
    });
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

const updateXiaohongshu = catchAsync(async (req, res) => {
  const xiaohongshu = await Xiaohongshu.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!xiaohongshu) {
    return res.status(404).json({
      status: "error",
      message: "No Xiaohongshu account found with that ID",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      xiaohongshu,
    },
  });
});

const getAllXiaohongshu = catchAsync(async (req, res) => {
  const xiaohongshus = await Xiaohongshu.find(req.queryObj)
    .populate("account")
    .sort(req.sortBy)
    .select(req.fields)
    .skip(req.skip)
    .limit(req.limit);

  res.status(200).json({
    status: "success",
    data: xiaohongshus,
    length: xiaohongshus.length,
  });
});

// 用来过滤过期账号
const filter = catchAsync(async (req, res) => {
  const days = parseInt(req.query.days, 10);
  if (isNaN(days)) {
    return res
      .status(400)
      .json({ status: "error", message: "Invalid days parameter" });
  }

  const currentDate = new Date();
  const futureDate = new Date(
    currentDate.getTime() + days * 24 * 60 * 60 * 1000
  );

  const filteredAccounts = await Xiaohongshu.find({
    expire_time: { $lt: futureDate },
  });

  res.json({
    status: "success",
    data: filteredAccounts,
  });
});

// 用来登录小红书

const loginXiaohongshu = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const LOGIN_SETUP =
    "https://customer.xiaohongshu.com/api/cas/loginWithAccount";
  const LOGIN_URL = "https://pro.xiaohongshu.com/api/edith/eros/login";

  // 检查请求中的邮箱和密码
  if (!email || !password) {
    return res
      .status(400)
      .json({ status: "fail", message: "Email and password are required." });
  }

  // 第一步：获取token
  const response_step1 = await axios.post(LOGIN_SETUP, {
    account: email,
    password: password,
    service: "https://pro.xiaohongshu.com",
  });

  const { data: data_step1 } = response_step1;

  const token = data_step1.data;

  // 第二步：获取用户信息

  const response_step2 = await axios.post(LOGIN_URL, {
    ticket: token,
  });

  const { data: data_step2 } = response_step2;

  // console.log(data_step2);

  if (data_step2.success) {
    // 添加这部分代码检查 snsUserId 是否已经存在
    const xiaohongshuAccount = await Xiaohongshu.findOne({
      snsUserId: data_step2.data.accounts[0].snsUserId,
    });
    if (xiaohongshuAccount) {
      return res
        .status(400)
        .json({ status: "fail", message: "当前账号已经被添加" });
    }

    // 登录成功后，存储登录信息到小红书账号
    const newUser = new Xiaohongshu({
      mail: email,
      password: password,
      expire_time: new Date(Date.now() - 1), // 创建后立即过期
      note: "",
      auto_login: true,
      snsNickName: data_step2.data.accounts[0].snsNickName || "",
      snsAvatar: data_step2.data.accounts[0].snsAvatar || "",
      porchUserId: data_step2.data.accounts[0].porchUserId || "",
      snsUserId: data_step2.data.accounts[0].snsUserId,
      accessToken: data_step2.data.accessToken,
    });

    await newUser.save();

    // 对Account进行更新，增加指向新增的小红书账号的引用

    // console.log(req.account);

    req.account.xiaohongshu_list.push(newUser._id);
    await req.account.save();

    return res.status(200).json({
      status: "success",
      message: "Login successful and data stored in database.",
    });
  } else {
    return res
      .status(401)
      .json({ status: "fail", message: data.alertMsg || "Login failed" });
  }
});

module.exports = {
  createXiaohongshu,
  deleteXiaohongshu,
  updateXiaohongshu,
  getAllXiaohongshu,
  filter,
  loginXiaohongshu,
};
