const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const projectController = require('../controllers/project.controller');

// Public routes
router.get('/', projectController.getAll);
router.get('/:id', projectController.getOne);

// Protected routes (require JWT)
router.post('/', auth, upload, projectController.create);
router.put('/:id', auth, upload, projectController.update);
router.delete('/:id', auth, projectController.remove);

module.exports = router;
