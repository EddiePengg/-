const express = require("express");
const router = express.Router();
const Item = require("./modal");
const {
  createXiaohongshu,
  deleteXiaohongshu,
  updateXiaohongshu,
  getAllXiaohongshu,
  filter,
  loginXiaohongshu,
} = require("./control");
const { checkSECRETKEY, queryHandler, verifyJWTToken } = require("../util");

router.use(checkSECRETKEY); // 验证密钥

// 查询卡密
router.get("/", queryHandler, getAllXiaohongshu);

// 修改卡密
router.patch("/:id", updateXiaohongshu);

// 删除卡密
router.delete("/:id", deleteXiaohongshu);

// 增加卡密
router.post("/", createXiaohongshu);

router.get("/filter", filter);

router.post("/login", verifyJWTToken, loginXiaohongshu);

module.exports = router;
