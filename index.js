#!/usr/bin/env node

import inquirer from "inquirer";
import fs from "fs-extra";
import chalk from "chalk";
import express from 'express';
import path from "path";
import { fileURLToPath } from "url";
import { createSchema } from './createSchema.js';



// fixes directory name in ES modules:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




// step 1: ask user

const askUser = async () => {
    return await inquirer.prompt([
        {
            type: "input",
            name: 'port',
            message: "Port for backend server (default: 5000):",
            default: 5000,
        },
        {
            type: 'input',
            name: 'mongoUri',
            message: "MongoDB URI (Atlas only):",
        }
    ])
}

// step 2: create stuff now

const createProject = async ({ port, mongoUri }) => {
    const templatesDir = path.join(__dirname, "templates");

    console.log(chalk.blue("Creating backend folder..."));

    await fs.ensureDir('backend');
    await fs.copy(path.join(templatesDir, 'backend'), 'backend');

    // inject config file
    const configContent = `export const MONGO_URI = "${mongoUri}";\nexport const PORT=${port};\n`;
    await fs.writeFile('backend/config.js', configContent);

    console.log(chalk.green("Backend folder created!"));

    // inject the dashboard page

    const dashboardSource = path.join(templatesDir, 'dashboard.jsx');
    const isAppRouter = fs.existsSync('app');

    const dashboardDest = isAppRouter
        ? path.join('app', 'dashboard', 'page.jsx')
        : path.join('pages', 'dashboard.jsx');

    await fs.ensureDir(path.dirname(dashboardDest));

    await fs.copyFile(dashboardSource, dashboardDest);

    console.log(chalk.green("Dashboard page created!"));
}

// step 3: run it at all

const main = async () => {
    const answers = await askUser();
    await createProject(answers);
}

// for commands:
const args = process.argv.slice(2);
const command = args[0];
const name = args[1];

if (command == 'create-schema' && name) {
    await createSchema(name);
}
else {
    main();
}