// ryuko

console.clear();
const { spawn } = require("child_process");
const chalk = require('chalk');
const path = require('path');

global.countRestart = 0; // initialize restart count

function startBot(message) {
    if (message) {
        console.info(chalk.blue(message.toUpperCase()));
    }

    const child = spawn("node", ["--trace-warnings", "--async-stack-traces", "--no-warnings", "main.js"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true
    });

    child.on("close", (codeExit) => {
        if (codeExit !== 0 && global.countRestart < 5) {
            global.countRestart += 1;
            console.info(chalk.yellow(`Restart attempt ${global.countRestart}/5`));
            setTimeout(() => {
                startBot("restarting server");
            }, 2000); // wait 2 seconds before restarting to prevent rapid looping
        } else if (codeExit !== 0) {
            console.error(chalk.red("Bot crashed too many times. Exiting."));
            process.exit(codeExit);
        }
    });

    child.on("error", (error) => {
        console.error(chalk.red("An error occurred: " + error.message));
    });
}

startBot();
