const mongoose = require("mongoose");
const { Schema } = mongoose;

const KamiSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true, // 确保每个卡密是唯一的
  },
  status: {
    type: String,
    enum: ["unused", "used", "expired"], // 卡密状态：未使用、已使用、已过期
    default: "unused",
  },
  createdAt: {
    type: Date,
    default: Date.now, // 卡密创建时间
  },
  validDuration: {
    type: Number, // 卡密有效持续时间，以分钟为单位
    required: true, // 这个字段是必填的
    validate: {
      validator: validateValidDuration,
      message: "你没有输入正确的validDuration", // 当验证失败时，将返回此错误消息
    },
  },
});

// 自定义验证函数
function validateValidDuration(value) {
  // 设定合法的有效期范围，例如大于0的数值
  if (value <= 0) {
    return false; // 如果值不合法，返回false
  }
  return true; // 如果值合法，返回true
}

// 导出CardCode模型
module.exports = mongoose.model("kami", KamiSchema);
