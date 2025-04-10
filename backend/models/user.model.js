import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  images: [
    {
      name: String,
      url: String,
      res_url: String,
      res_count: Number,
      createdAt: { type: Date, default: Date.now },
    }
  ],

}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
