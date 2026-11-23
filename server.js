const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, "public")));
app.get("/api/status", (_req, res) => res.json({ ok: true, product: "PixelStudio Pro", ai: "not-configured" }));
app.listen(PORT, () => console.log(`PixelStudio Pro running on port ${PORT}`));