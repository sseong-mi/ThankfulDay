const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nickname: String,
    email: String,
    password: String,
    tags: [{ word: String }],
    diary: [
      {
        date: Date,
        tagsUsed: [String],
        time: String,
        notes: String,
      },
    ],
  });

const User = mongoose.model('User', userSchema);

module.exports = User;
