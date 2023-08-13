const mongoose = require('mongoose');
const Product = require('../models/product');

exports.product_get_all = (req, res, next) => {
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
};

exports.product_create_product = (req, res, next) => {
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
};

exports.product_get_product = (req, res, next) => {
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
};

exports.product_edit_product = (req, res, next) => {
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
};

exports.product_delete_product = (req, res, next) => {
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
};
