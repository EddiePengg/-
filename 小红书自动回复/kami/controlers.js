const Kami = require("./modal");
const { v4: uuidv4 } = require("uuid");
const { catchAsync } = require("../util");

const getAll = catchAsync(async (req, res) => {
  const kamis = await Kami.find(req.queryObj)
    .sort(req.sortBy)
    .select(req.fields)
    .skip(req.skip)
    .limit(req.limit);

  res.json({ status: "success", data: kamis, length: kamis.length });
});

const deleteOne = async (req, res) => {
  const deletedKami = await Kami.findByIdAndDelete(req.params.id);
  if (deletedKami == null) {
    return res.status(404).json({ status: "error", message: "未找到该卡密" });
  }
  res.json({ status: "success", message: "删除成功" });
};

const patchOne = catchAsync(async (req, res) => {
  const kami = await Kami.findById(req.params.id);
  if (kami == null) {
    return res.status(404).json({ message: "未找到该卡密" });
  }
  if (req.body.code != null) {
    kami.code = req.body.code;
  }
  if (req.body.status != null) {
    kami.status = req.body.status;
  }
  if (req.body.validDuration != null) {
    kami.validDuration = req.body.validDuration;
  }
  const updatedKami = await kami.save();
  res.json({
    status: "success",
    data: updatedKami,
  });
});

/**
 * ### 新建卡密
 * - 只接受validDuration有效天数，其他字段由后台自动生成
 */
const postOne = catchAsync(async (req, res) => {
  // 检查req.body是否只包含validDuration字段
  const allowedFields = new Set(["validDuration"]);
  for (const field of Object.keys(req.body)) {
    if (!allowedFields.has(field)) {
      return res.status(400).json({ message: `不可识别的字段: ${field}` });
    }
  }

  // 自动生成code字段
  const code = generateUniqueCode(); // 假设你有一个生成唯一code的函数

  const kami = new Kami({
    code: code,
    status: "unused", // 固定为"unused"
    validDuration: req.body.validDuration,
  });

  const newKami = await kami.save();
  res.status(201).json({
    status: "success",
    data: newKami,
  });
});

function generateUniqueCode() {
  return uuidv4();
}

module.exports = {
  getAll,
  deleteOne,
  patchOne,
  postOne,
};
