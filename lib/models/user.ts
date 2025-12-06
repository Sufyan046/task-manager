import mongoose, { Schema, type Document, type Model } from "mongoose"

export type UserRole = "admin" | "employee"

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  email: string
  name: string
  role: UserRole
  password: string
  createdAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee",
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
