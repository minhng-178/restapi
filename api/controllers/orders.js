const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/product');

exports.order_get_all = (req, res, next) => {
  Order.find()
    .select('-__v')
    .populate('product', 'name')
    .exec()
    .then(docs => {
      res.status(200).json({
        message: 'Orders were fetched',
        count: docs.length,
        oders: docs.map(doc => {
          return {
            product: doc.product,
            quantity: doc.quantity,
            _id: doc._id,
            request: {
              type: 'GET',
              url: 'http://localhost:3000/orders/' + doc._id,
            },
          };
        }),
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.order_create_order = (req, res, next) => {
  Product.findById(req.body.productId)
    .then(product => {
      if (!product)
        return res.status(404).json({ message: 'Product not found!' });
      const order = new Order({
        _id: new mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        product: req.body.productId,
      });
      return order.save();
    })
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: 'Orders were created',
        order: {
          product: result.product,
          quantity: result.quantity,
          _id: result._id,
        },
        request: {
          type: 'GET',
          url: 'http://localhost:3000/orders/' + result._id,
        },
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.orders_get_order = (req, res, next) => {
  Order.findById(req.params.orderId)
    .populate('product')
    .exec()
    .then(order => {
      if (!order) return res.status(404).json({ message: 'Order not found!' });
      res.status(200).json({
        message: 'Orders details',
        order: order,
        request: {
          type: 'GET',
          url: 'http://localhost:3000/orders/',
        },
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.order_delete_order = (req, res, next) => {
  const id = req.params.orderId;
  Order.deleteOne({ _id: id })
    .exec()
    .then(order => {
      if (!order) return res.status(404).json({ message: 'Order not found!' });
      res.status(200).json({
        message: 'Order deleted',
        request: {
          type: 'POST',
          url: 'http://localhost:3000/orders/' + id,
          body: { productId: 'String', quantity: 'Number' },
        },
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};
