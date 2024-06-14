import inquirer from "inquirer";
import os from "os";
import fs from "fs";
import path from "path";
import axios from "axios";

// 读取或创建配置文件
export async function readOrCreateConfig() {
  // 获取系统特定目录
  function getConfigFilePath() {
    const homeDir = os.homedir();
    const configDir =
      process.platform === "win32"
        ? path.join(homeDir, "AppData", "Local", "AutoReply")
        : path.join(homeDir, ".config", "AutoReply");
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    return path.join(configDir, "config.json");
  }

  const configFilePath = getConfigFilePath();

  // 检查是否存在 -r 参数
  const resetConfig = process.argv.includes("-r");

  if (resetConfig && fs.existsSync(configFilePath)) {
    // 如果存在 -r 参数并且配置文件存在，删除配置文件
    fs.unlinkSync(configFilePath);
  }

  let config;

  if (fs.existsSync(configFilePath)) {
    // 如果配置文件存在，读取配置文件
    config = JSON.parse(fs.readFileSync(configFilePath));
  } else {
    // 如果配置文件不存在，询问用户
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "machineName",
        message: "请输入机器名字:",
        default: os.hostname(), // 默认值为机器名
      },
      {
        type: "list",
        name: "apiUrl",
        message: "请选择API地址:",
        choices: ["http://localhost:18888"],
      },
      {
        type: "number",
        name: "numberOfTasks",
        message: "请输入要执行的任务数量:",
        default: 5, // 默认任务数量
      },
    ]);

    // 将用户输入的信息写入配置文件
    fs.writeFileSync(configFilePath, JSON.stringify(answers, null, 2));
    config = answers;
  }

  return config;
}
