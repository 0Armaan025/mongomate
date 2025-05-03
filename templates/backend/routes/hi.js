import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    return res.json({
        status: 200,
        message: 'it works, hello from backend!'
    });
});

export default router;