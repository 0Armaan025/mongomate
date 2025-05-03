import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import templates from './templates/schemas.js';

function formatSchemaFields(fieldsObj) {
    return Object.entries(fieldsObj)
        .map(([key, type]) => `  ${key}: ${type},`)
        .join('\n');
}

async function createSchema(name) {
    const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
    const schemaName = `${capitalized}Schema`;

    const fields = templates[name];
    if (!fields) {
        console.log(chalk.red(`❌ No template found for schema '${name}'`));
        return;
    }

    const schemaString = `
import mongoose from 'mongoose';

const ${schemaName} = new mongoose.Schema({
${formatSchemaFields(fields)}
});

export const ${capitalized} = mongoose.model('${capitalized}', ${schemaName});
`.trim();

    const schemasPath = path.join('backend', 'schemas');
    const schemaFilePath = path.join(schemasPath, `${name}.js`);

    await fs.ensureDir(schemasPath);
    await fs.writeFile(schemaFilePath, schemaString);
    console.log(chalk.green(`✅ Schema '${name}' created at ${schemaFilePath}`));

    // Update models.js
    const modelFilePath = path.join('backend', 'models.js');
    const exportLine = `export { ${capitalized} } from './schemas/${name}.js';\n`;

    await fs.ensureFile(modelFilePath);
    const modelContent = await fs.readFile(modelFilePath, 'utf-8');

    if (!modelContent.includes(exportLine)) {
        await fs.appendFile(modelFilePath, exportLine);
        console.log(chalk.green(`✅ Model '${capitalized}' added to models.js`));
    }

    // Update schemas.json
    const schemaListPath = path.join('backend', 'schemas.json');
    let data = [];

    if (fs.existsSync(schemaListPath)) {
        data = JSON.parse(await fs.readFile(schemaListPath, 'utf8'));
    }

    if (!data.includes(name)) {
        data.push(name);
        await fs.writeFile(schemaListPath, JSON.stringify(data, null, 2));
        console.log(chalk.green(`✅ '${name}' added to schemas.json`));
    }

    // Create route
    await fs.ensureDir(path.join('backend', 'routes'));

    const routeString = `
import express from 'express';
import { ${capitalized} } from '../models.js';

const router = express.Router();

// GET all
router.get('/', async (req, res) => {
  const data = await ${capitalized}.find();
  res.json(data);
});

// GET by ID
router.get('/:id', async (req, res) => {
  const item = await ${capitalized}.findById(req.params.id);
  res.json(item);
});

// CREATE
router.post('/', async (req, res) => {
  const created = new ${capitalized}(req.body);
  const saved = await created.save();
  res.json(saved);
});

// UPDATE
router.put('/:id', async (req, res) => {
  const updated = await ${capitalized}.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// DELETE
router.delete('/:id', async (req, res) => {
  await ${capitalized}.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;
`.trim();

    const routeFilePath = path.join('backend', 'routes', `${name}.js`);
    await fs.writeFile(routeFilePath, routeString);
    console.log(chalk.green(`✅ Route for '${name}' created at ${routeFilePath}`));
}

export { createSchema };
