const express = require('express');
const router = express.Router();
const controller = require('../controllers/productController');

router.get('/', controller.showForm);
router.get('/:situation', controller.showFormWithSituation);
router.post('/register', controller.register);
router.get('/remove/:codigo&:imagem', controller.remove);
router.get('/form-edit/:codigo', controller.showEditForm);
router.post('/edit', controller.edit);

module.exports = router;
