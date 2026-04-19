const urlParams = new URLSearchParams(window.location.search);
const billId = urlParams.get("id");

async function loadReceipt() {
  if (!billId) {
    alert("No bill ID found!");
    return;
  }

  const response = await fetch(`http://localhost:5000/bill/${billId}`);
  const data = await response.json();

  // ✅ Customer Details
  document.getElementById("customer-details").innerHTML = `
    <strong>${data.customerName}</strong><br/>
    ${data.phone}<br/>
    ${data.email}<br/>
    ${data.address}
  `;

  // ✅ Items Table
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  let subtotal = 0;

  data.items.forEach(item => {
    const amount = item.qty * item.price;
    subtotal += amount;

    const row = `
      <tr>
        <td>${item.name}</td>
        <td>-</td>
        <td>${item.qty}</td>
        <td>₹${item.price}</td>
        <td>18%</td>
        <td>₹${amount}</td>
      </tr>
    `;

    tbody.innerHTML += row;
  });

  // ✅ GST Calculation
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  // ✅ Update totals
  const tfoot = document.querySelector("tfoot");

  tfoot.innerHTML = `
    <tr>
      <td colspan="5">Subtotal</td>
      <td>₹${subtotal.toFixed(2)}</td>
    </tr>
    <tr>
      <td colspan="5">CGST 9%</td>
      <td>₹${(gst/2).toFixed(2)}</td>
    </tr>
    <tr>
      <td colspan="5">SGST 9%</td>
      <td>₹${(gst/2).toFixed(2)}</td>
    </tr>
    <tr class="total">
      <td colspan="5"><strong>Total Amount</strong></td>
      <td><strong>₹${total.toFixed(2)}</strong></td>
    </tr>
  `;
}

loadReceipt();