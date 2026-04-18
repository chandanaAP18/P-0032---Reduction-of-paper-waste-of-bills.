document.addEventListener("DOMContentLoaded", () => {
  const data = JSON.parse(localStorage.getItem("receiptData"));

  if (!data) return;

  // Customer details
  document.getElementById("customer-details").innerHTML = `
    <strong>${data.customerName}</strong><br>
    ${data.phone}<br>
    ${data.email}
  `;

  // Table
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  let subtotal = 0;

  data.items.forEach(item => {
    const amount = item.qty * item.price;
    subtotal += amount;

    tbody.innerHTML += `
      <tr>
        <td>${item.name}</td>
        <td>-</td>
        <td>${item.qty}</td>
        <td>₹${item.price}</td>
        <td>18%</td>
        <td>₹${amount}</td>
      </tr>
    `;
  });

  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  document.querySelector("tfoot").innerHTML = `
    <tr>
      <td colspan="5">Subtotal</td>
      <td>₹${subtotal.toFixed(2)}</td>
    </tr>
    <tr>
      <td colspan="5">GST 18%</td>
      <td>₹${gst.toFixed(2)}</td>
    </tr>
    <tr>
      <td colspan="5"><strong>Total</strong></td>
      <td><strong>₹${total.toFixed(2)}</strong></td>
    </tr>
  `;
});