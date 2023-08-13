const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

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

const Product = require('../models/product');

router.get('/', (req, res, next) => {
  Product.find()
    .select('-__v')
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        products: docs.map(doc => {
          return {
            name: doc.name,
            price: doc.price,
            _id: doc._id,
            productImage: doc.productImage,
            request: {
              type: 'GET',
              url: 'http://localhost:3000/products/' + doc._id,
            },
          };
        }),
      };
      console.log('Form db', docs);
      res.status(200).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.post('/', upload.single('productImage'), (req, res, next) => {
  console.log(req.file);
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path,
  });

  product
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: 'Created product successfully!',
        createdProduct: {
          name: result.name,
          price: result.price,
          _id: result._id,
          productImage: result.productImage,
          request: {
            type: 'POST',
            url: 'http://localhost:3000/products/' + result._id,
          },
        },
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.get('/:productId', (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
    .select('-__v')
    .exec()
    .then(doc => {
      console.log('Form db', doc);
      if (doc)
        res.status(200).json({
          product: doc,
          request: {
            type: `GET/${doc._id}`,
            url: 'http://localhost:3000/products/' + doc._id,
          },
        });
      else res.status(404).json({ message: 'No valid product' });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.patch('/:id', (req, res, next) => {
  const id = req.params.id;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Product.findByIdAndUpdate({ _id: id }, { $set: updateOps }, { new: true })
    .exec()
    .then(result =>
      res.status(200).json({
        message: 'Product updated',
        request: {
          type: 'PATCH',
          url: 'http://localhost:3000/products/' + id,
        },
      })
    )
    .catch(err => res.status(500).json({ error: err }));
});

router.delete('/:productId', (req, res, next) => {
  const id = req.params.productId;
  Product.deleteOne({ _id: id })
    .exec()
    .then(result => {
      res.status(200).json({
        message: 'Product deleted',
        request: {
          type: 'POST',
          url: 'http://localhost:3000/products/' + id,
          body: { name: 'String', price: 'Number' },
        },
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

module.exports = router;