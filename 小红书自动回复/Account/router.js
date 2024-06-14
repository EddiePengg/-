const express = require("express");
const router = express.Router();
const Item = require("./modal");
const {
  createAccount,
  deleteAccount,
  updateAccount,
  getAllAccounts,
  login,
} = require("./controlers");
const { checkSECRETKEY, queryHandler } = require("../util");

router.use(checkSECRETKEY);

// 查询卡密
router.get("/", queryHandler, getAllAccounts);

// 修改卡密
router.patch("/:id", updateAccount);

// 删除卡密
router.delete("/:id", deleteAccount);

// 增加卡密
router.post("/", createAccount);

// 登录账号

router.post("/login", login);

module.exports = router;
