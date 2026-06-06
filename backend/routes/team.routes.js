const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const teamController = require('../controllers/team.controller');

// Public routes
router.get('/', teamController.getAll);
router.get('/:id', teamController.getOne);

// Protected routes (require JWT)
router.post('/', auth, upload, teamController.create);
router.put('/:id', auth, upload, teamController.update);
router.delete('/:id', auth, teamController.remove);

module.exports = router;
