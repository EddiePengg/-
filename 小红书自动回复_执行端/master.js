import os from "os";
import fs from "fs";
import path from "path";
import axios from "axios";
import { fork } from "child_process";
import { readOrCreateConfig } from "./util.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 请求任务
async function requestTasks() {
  try {
    const apiClient = axios.create({
      baseURL: process.env.apiUrl,
    });

    const response = await apiClient.get("/api/xhs/");

    return response.data.data;
  } catch (error) {
    console.error("Error requesting tasks:", error.message);
    return [];
  }
}

// 启动子程序
function startWorkers(tasks) {
  tasks.forEach((task, index) => {
    const worker = fork(path.resolve(__dirname, "worker.js"));
    worker.send({ task });
    worker.on("message", (message) => {
      console.log(`Worker ${index} finished task:`, message);
    });
  });
}

async function main() {
  const config = await readOrCreateConfig();

  console.log("🍃 配置文件", config);

  // 遍历配置对象，将每个键值对设置为 process.env 的属性
  Object.keys(config).forEach((key) => {
    process.env[key] = config[key];
  });

  const tasks = await requestTasks();

  if (tasks.length > 0) {
    console.log(`Received ${tasks.length} tasks`);
    startWorkers(tasks);
  } else {
    console.log("No tasks received");
  }
}

main();
