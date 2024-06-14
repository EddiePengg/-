const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// 小红书账号模型
const xiaohongshuSchema = new Schema({
  mail: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  expire_time: {
    type: Date,
    required: true,
  },
  note: {
    type: String,
    default: "",
  },
  auto_login: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // 卡密创建时间
  },
  snsNickName: {
    type: String,
    required: true, // 根据需求设置为必填项
  },
  snsAvatar: {
    type: String,
    required: true, // 根据需求设置为必填项
  },
  porchUserId: {
    type: String,
    default: "", // 暂无用处，但保留字段
  },
  snsUserId: {
    type: String,
    required: true, // 账号唯一标识
  },
  accessToken: {
    type: String,
    required: true, // 访问令牌
  },
  group: String,
});

// 虚拟属性，关联平台账号
xiaohongshuSchema.virtual("account", {
  ref: "Account",
  localField: "_id",
  foreignField: "xiaohongshu_list",
});

xiaohongshuSchema.set("toObject", { virtuals: true });
xiaohongshuSchema.set("toJSON", { virtuals: true });

const Xiaohongshu = mongoose.model("Xiaohongshu", xiaohongshuSchema);

module.exports = Xiaohongshu;
