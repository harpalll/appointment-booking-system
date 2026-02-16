import express from "express";
import authRoutes from "./routes/authRoutes";
import serviceRoutes from "./routes/serviceRoutes";
import appointmentsRoutes from "./routes/appointmentsRoute";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/services", serviceRoutes);
app.use("/appointments", appointmentsRoutes);

app.get("/api/healthCheck", (req, res) => {
  res.status(200).json({ message: "server is up and running" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
