const mongoose = require('mongoose');

async function connect() {
  try {
    await mongoose.connect(
      'mongodb+srv://blog_dev:' +
        process.env.MONGO_ATLAS_PW +
        '@cluster0.vmko02b.mongodb.net/'
    );
    console.log('Connect successfully!!!');
  } catch (error) {
    console.log('Connect failure!!!');
  }
}

module.exports = { connect };
