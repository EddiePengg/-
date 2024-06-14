import axios from "axios";
import XHSAccount from "./xhsAccount.js";

process.on("message", async (message) => {
  const { task } = message;
  try {
    console.log(`Worker received task: ${task}`);

    const worker = new XHSAccount(task);

    process.send({ status: "success", result: response.data });
  } catch (error) {
    console.error("Error executing task:", error);
    process.send({ status: "failure", error: error.message });
  } finally {
    process.exit(); // 任务完成后退出子程序
  }
});
