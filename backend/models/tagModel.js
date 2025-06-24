import mongoose from "mongoose";

const TagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    color: {
      type: String,
      required: true,
      match: /^#([0-9A-F]{3}){1,2}$/i,
    },
  },
  { timestamps: true }
);

const Tag = mongoose.model("Tag", TagSchema);
export default Tag;
