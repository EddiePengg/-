import axios from "axios";

class XHSAccount {
  constructor(accountData) {
    this.mail = accountData.mail;
    this.password = accountData.password;
    this.expireTime = new Date(accountData.expire_time);
    this.note = accountData.note;
    this.autoLogin = accountData.auto_login ?? true;
    this.snsNickName = accountData.snsNickName;
    this.createdAt = new Date(accountData.createdAt);
    this.snsAvatar = accountData.snsAvatar;
    this.snsUserId = accountData.snsUserId;
    this.accessToken = accountData.accessToken;
    this.account = accountData.account;
    this.group = accountData.group;

    // Base URL for the XHS API
    this.apiClient = axios.create({
      baseURL: process.env.apiUrl,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
  }

  // 自动回复接口
  async autoReply(replyContent) {
    try {
      const response = await this.apiClient.post("/auto-reply", {
        userId: this.snsUserId,
        reply: replyContent,
      });
      return response.data;
    } catch (error) {
      console.error("Error in autoReply:", error);
      throw error;
    }
  }

  // 获取消息列表接口
  async getMessageList() {
    try {
      const response = await this.apiClient.get("/messages", {
        params: {
          userId: this.snsUserId,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error in getMessageList:", error);
      throw error;
    }
  }

  // 发送消息接口
  async sendMessage(receiverId, messageContent) {
    try {
      const response = await this.apiClient.post("/send-message", {
        userId: this.snsUserId,
        receiverId: receiverId,
        message: messageContent,
      });
      return response.data;
    } catch (error) {
      console.error("Error in sendMessage:", error);
      throw error;
    }
  }

  // Check if the account is expired
  isExpired() {
    return new Date() > this.expireTime;
  }
}

export default XHSAccount;
