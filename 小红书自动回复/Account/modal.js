const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// 账号模型
const accountSchema = new Schema({
  phone: {
    type: Number,
    required: true,
    validate: {
      validator: function (v) {
        return /^\d{11}$/.test(v);
      },
      message: (props) => `${props.value} 不是一个有效的11位手机号!`,
    },
  },
  password: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    default: "",
  },
  xiaohongshu_list: [
    {
      type: Schema.Types.ObjectId,
      ref: "Xiaohongshu",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now, // 卡密创建时间
  },
});

accountSchema.pre("find", function (next) {
  this.populate("xiaohongshu_list");
  next();
});

accountSchema.pre("findOne", function (next) {
  this.populate("xiaohongshu_list");
  next();
});

accountSchema.pre("findById", function (next) {
  this.populate("xiaohongshu_list");
  next();
});

const Account = mongoose.model("Account", accountSchema);

module.exports = Account;
