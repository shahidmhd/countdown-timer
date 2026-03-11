import mongoose from "mongoose";

const TimerSchema = new mongoose.Schema(
  {
    shop: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    display: {
      color: { type: String, default: "#ff0000" },
      bgColor: { type: String, default: "#fff3cd" },
      size: { type: String, default: "medium" }, // small | medium | large
      position: { type: String, default: "top" }, // top | bottom
    },
    urgency: {
      enabled: { type: Boolean, default: true },
      triggerMinutes: { type: Number, default: 5 },
      type: { type: String, default: "pulse" }, // pulse | banner
    },
  },
  { timestamps: true }
);

const Timer = mongoose.model("Timer", TimerSchema);
export default Timer;