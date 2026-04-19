const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// 🧠 Temporary storage (in-memory DB)
const bills = [];

// Home route
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// ✅ CREATE BILL
app.post("/api/bill", (req, res) => {
  const { name, phone, email, gst, address, items } = req.body;

  if (!name || !items || items.length === 0) {
    return res.status(400).json({
      error: "Name and at least one item are required"
    });
  }

  let total = 0;

  items.forEach((item) => {
    const qty = Number(item.qty) || 0;
    const price = Number(item.price) || 0;
    total += qty * price;
  });

  const billId = "BILL-" + Date.now();

  const bill = {
    billId,
    customerName: name,
    phone,
    email,
    gst,
    address,
    items,
    total,
    createdAt: new Date()
  };

  // ✅ STORE BILL
  bills.push(bill);

  console.log("Saved Bills:", bills);

  res.json({
    success: true,
    billId
  });
});

// ✅ GET BILL FOR RECEIPT PAGE
app.get("/bill/:id", (req, res) => {
  const bill = bills.find(b => b.billId === req.params.id);

  if (!bill) {
    return res.status(404).json({ error: "Bill not found" });
  }

  res.json(bill);
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;