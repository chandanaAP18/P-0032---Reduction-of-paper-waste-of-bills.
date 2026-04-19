async function generateBill() {
  const data = {
    name: document.getElementById("name").value,
    phone: document.getElementById("phone").value,
    email: document.getElementById("email").value,
    gst: document.getElementById("gst").value,
    address: document.getElementById("address").value,
    items: [
      {
        name: document.getElementById("item1").value,
        qty: document.getElementById("qty1").value,
        price: document.getElementById("price1").value
      }
    ]
  };

  try {
    const res = await fetch("http://localhost:5000/api/bill", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    // ✅ REDIRECT TO RECEIPT PAGE
    window.location.href = `receipt.html?id=${result.billId}`;

  } catch (err) {
    console.error(err);
    alert("Backend not connected");
  }
}
function addItem() {
  const container = document.getElementById("items-container");

  const div = document.createElement("div");
  div.className = "item-row";

  div.innerHTML = `
    <input placeholder="Item name" class="item-name">
    <input type="number" placeholder="Qty" class="item-qty">
    <input type="number" placeholder="Price" class="item-price">
  `;

  container.appendChild(div);
}