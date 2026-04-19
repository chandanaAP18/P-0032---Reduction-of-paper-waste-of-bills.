const { test, expect } = require('@playwright/test');

test('Full Billing Flow - Add Item → GST → Receipt', async ({ page }) => {

  // 1. Open billing page
  await page.goto('http://localhost:5500/receipt.html');

  // 2. Enter customer name
  await page.fill('#customerName', 'Ravi Kumar');

  // 3. Add Item 1
  await page.fill('#itemName', 'Pen');
  await page.fill('#qty', '2');
  await page.fill('#price', '10');
  await page.click('#addItemBtn');

  // 4. Add Item 2
  await page.fill('#itemName', 'Notebook');
  await page.fill('#qty', '1');
  await page.fill('#price', '50');
  await page.click('#addItemBtn');

  // 5. Generate bill
  await page.click('#generateBill');

  // 6. Verify Subtotal
  await expect(page.locator('#subtotal')).toContainText('70');

  // 7. Verify GST is calculated (example 18%)
  const gst = await page.locator('#gst').textContent();
  expect(parseFloat(gst)).toBeGreaterThan(0);

  // 8. Verify Final Total exists
  await expect(page.locator('#finalTotal')).not.toBeEmpty();

  // 9. Verify receipt is generated
  await expect(page.locator('#receipt')).toBeVisible();

});