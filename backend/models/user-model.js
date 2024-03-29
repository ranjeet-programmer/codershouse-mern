const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    phone: {
      type: String,
      required: true,
    },

    activated: {
      type: Boolean,
      required: false,
      default: false,
    },

    name: {
      type: String,
      required: false,
    },

    avatar: {
      type: String,
      required: false,
      get: (avatar) => {
        if (avatar) {
          return `http://localhost:5000${avatar}`;
        }

        return avatar;
      },
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
  }
);

module.exports = mongoose.model("User", userSchema, "users");
