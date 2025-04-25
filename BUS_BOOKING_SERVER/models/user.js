import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
  google_id: { type: String },
  phone: { type: String },
  name: { type: String },
  email: { type: String }, // No index definition here, handled in setupIndexes.js
  user_photo: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Add validation to ensure either email or phone is provided
UserSchema.pre("validate", function (next) {
  if (!this.email && !this.phone) {
    this.invalidate("contact", "Either email or phone is required");
  }
  next();
});

const User = mongoose.model("User", UserSchema);

export default User;
