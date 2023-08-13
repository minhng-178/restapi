const express = require('express');
const router = express.Router();
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');
const ProductController = require('../controllers/products');

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')
    cb(null, true);
  else cb(null, false);
};

const upload = multer({
  dest: './uploads/',
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

router.get('/', ProductController.product_get_all);
router.post(
  '/',
  checkAuth,
  upload.single('productImage'),
  ProductController.product_create_product
);
router.get('/:productId', ProductController.product_get_product);
router.patch('/:id', checkAuth, ProductController.product_edit_product);
router.delete(
  '/:productId',
  checkAuth,
  ProductController.product_delete_product
);

module.exports = router;
