import express from 'express';
import mongoose from 'mongoose';
import { MONGO_URI, PORT } from "./config.js";
import path from 'path';
import fs from 'fs-extra';

const app = express();

app.use(express.json());

const routesPath = path.join('./routes');

fs.readdirSync(routesPath).forEach(file => {
    const route = file.replace('.js', '');
    import(`./routes/${file}`).then(module => {
        app.use(`/api/${route}`, module.default);
    });
});

// connect to mongodb

mongoose.connect(MONGO_URI).then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((err) => {
    console.error('MongoDB error:', err.message);

});