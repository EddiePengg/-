const express = require("express");
const router = express.Router();
const Item = require("./modal");
const { getAll, deleteOne, patchOne, postOne } = require("./controlers");
const { checkSECRETKEY, queryHandler } = require("../util");

router.use(checkSECRETKEY);

// 查询卡密
router.get("/", queryHandler, getAll);

// 修改卡密
router.patch("/:id", patchOne);

// 删除卡密
router.delete("/:id", deleteOne);

// 增加卡密
router.post("/", postOne);

module.exports = router;
