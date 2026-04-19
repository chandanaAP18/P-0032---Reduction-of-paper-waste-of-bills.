const { test, expect } = require('@playwright/test');

test('Billing flow test', async ({ page }) => {
  await page.goto('http://127.0.0.1:8080/receipt.html');

  await page.fill('#customerName', 'Ravi Kumar');

  await page.fill('#itemName', 'Pen');
  await page.fill('#qty', '2');
  await page.fill('#price', '10');
  await page.click('#addItemBtn');

  await page.fill('#itemName', 'Notebook');
  await page.fill('#qty', '1');
  await page.fill('#price', '50');
  await page.click('#addItemBtn');

  await page.click('#generateBill');

  await expect(page.locator('#subtotal')).toContainText('70');
  await expect(page.locator('#receipt')).toBeVisible();
});