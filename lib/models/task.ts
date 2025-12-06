import mongoose, { Schema, type Document, type Model } from "mongoose"

export type TaskStatus = "todo" | "in-progress" | "done"

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId
  title: string
  description: string
  assigneeId: mongoose.Types.ObjectId
  assigneeName: string
  status: TaskStatus
  dueDate: Date
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
}

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    assigneeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assigneeName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },
    dueDate: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

export const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema)
