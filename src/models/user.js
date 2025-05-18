const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// User Model
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 50, // Fixed typo: maxLenght → maxLength
    },
    lastName: {
      type: String,
      required: true,
    },
    emailId: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email :" + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter Strong password :" + value);
        }
      },
    },
    age: {
      type: Number,
      required: false,
      min: 18,
    },
    gender: {
      type: String,
      required: false,
      trim: true,
      validate(value) {
        if (
          !["male", "female", "others", "Male", "Female", "Others"].includes(
            value
          )
        ) {
          throw new Error("Not a valid gender (Male , Female and other)");
        }
      },
    },
    about: {
      type: String,
      // default: "Dev is in search for someone here",
    },
    photoURL: {
      type: String,
      default:
        "https://img.freepik.com/free-vector/user-blue-gradient_78370-4692.jpg?t=st=1740779693~exp=1740783293~hmac=3ffc11733917c931bddeec957e8fa649e6a1590282b3210d816ccbf54dab2e94&w=900",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid URL :" + value);
        }
      },
    },
    skills: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index
userSchema.index({ firstName: 1, lastName: 1 });

// Fixed JWT method - removed async, using process.env.JWT_SECRET
userSchema.methods.getjwt = function () {
  // JWT sign is not async - removed await
  const token = jwt.sign(
    { userId: this._id.toString() }, // Changed _id to userId to match auth middleware
    process.env.JWT_SECRET, // Use environment variable instead of hardcoded secret
    { expiresIn: "1d" }
  );

  return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const passwordHash = this.password; // Simplified - removed unnecessary variable
  return await bcrypt.compare(passwordInputByUser, passwordHash); // Simplified return
};

// Export model once - removed duplicate registration
module.exports = mongoose.model("User", userSchema);
