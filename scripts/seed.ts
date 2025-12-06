import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error("MONGODB_URI environment variable is required")
  process.exit(1)
}

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["admin", "employee"], default: "employee" },
    password: { type: String, required: true },
  },
  { timestamps: true },
)

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assigneeName: { type: String, required: true },
    status: { type: String, enum: ["todo", "in-progress", "done"], default: "todo" },
    dueDate: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
)

async function seed() {
  console.log("Connecting to MongoDB...")
  await mongoose.connect(MONGODB_URI!)

  const User = mongoose.models.User || mongoose.model("User", UserSchema)
  const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema)


  console.log("Clearing existing data...")
  await User.deleteMany({})
  await Task.deleteMany({})

  console.log("Creating users...")
  const hashedPassword = await bcrypt.hash("password123", 12)

  const admin = await User.create({
    email: "admin@company.com",
    name: "Admin User",
    role: "admin",
    password: hashedPassword,
  })

  const eddie = await User.create({
    email: "Ayyan@company.com",
    name: "Ayyan",
    role: "employee",
    password: hashedPassword,
  })

  const sarah = await User.create({
    email: "Sufiyan@company.com",
    name: "Sufiyan",
    role: "employee",
    password: hashedPassword,
  })

  const jamik = await User.create({
    email: "Nouman@company.com",
    name: "Nouman",
    role: "employee",
    password: hashedPassword,
  })

  // Create tasks
  console.log("Creating tasks...")
  await Task.create([
    {
      title: "Design System Update",
      description: "Update the design system components to match new brand guidelines",
      assigneeId: eddie._id,
      assigneeName: eddie.name,
      status: "in-progress",
      dueDate: new Date("2025-01-15"),
      createdBy: admin._id,
    },
    {
      title: "API Integration",
      description: "Integrate the new payment gateway API",
      assigneeId: jamik._id,
      assigneeName: jamik.name,
      status: "todo",
      dueDate: new Date("2025-01-20"),
      createdBy: admin._id,
    },
    {
      title: "User Testing",
      description: "Conduct user testing sessions for the new dashboard",
      assigneeId: eddie._id,
      assigneeName: eddie.name,
      status: "done",
      dueDate: new Date("2025-01-10"),
      createdBy: admin._id,
    },
    {
      title: "Documentation",
      description: "Write documentation for the new features",
      assigneeId: sarah._id,
      assigneeName: sarah.name,
      status: "todo",
      dueDate: new Date("2025-01-25"),
      createdBy: admin._id,
    },
    {
      title: "Performance Optimization",
      description: "Optimize database queries for better performance",
      assigneeId: jamik._id,
      assigneeName: jamik.name,
      status: "in-progress",
      dueDate: new Date("2025-01-18"),
      createdBy: admin._id,
    },
  ])

  console.log("Seed completed successfully!")
  console.log("\nDemo accounts (all use password: password123):")
  console.log("  Admin: admin@company.com")
  console.log("  Employee: Ayyan@company.com")
  console.log("  Employee: Sufiyan@company.com")
  console.log("  Employee: Nouman@company.com")

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
