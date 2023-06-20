const consoleColors = require('../consoleColors');
const credentials = require('../../../credentials.json');

async function logIntoBuropro(page) {
  console.log(consoleColors.step, 'Log into Buropro');

  console.log('go to the login page...');
  await page.goto('https://www.buroprocitation.ca/admin');

  console.log('fill in the login fields and log in...');
  try {
    // Fill in the login fields
    for (const letter of credentials.buroproPartner) {
      await page.type('input[name="oucLogin$txtPartner$txt"]', letter);
      await page.waitForTimeout(50);
    }
    for (const letter of credentials.buroproUsername) {
      await page.type('input[name="oucLogin$txtUserName$txt"]', letter);
      await page.waitForTimeout(50);
    }
    for (const letter of credentials.buroproPassword) {
      await page.type('input[name="oucLogin$txtPassword$txt"]', letter);
      await page.waitForTimeout(50);
    }

    // Click on the login button
    const loginButton = await page.$('#oucLogin_cmdLogin');
    await loginButton.click();
    await page.waitForNavigation();

    // Check if the login was successful
    const errorMessage = await page.$('td.ErrorMessage');
    if (!errorMessage) {
      console.log(consoleColors.success, 'Login successful');
    } else {
      console.log(consoleColors.error, 'Error while logging');
      await page.screenshot({ path: 'error_logs/buropro-login-error.png' });
      console.log('See: error_logs/buropro-login-error.png');
      console.log(consoleColors.error, 'process.exit();');
      process.exit();
    }
  } catch (error) {
    console.log(consoleColors.error, 'Error while logging');
    await page.screenshot({ path: 'error_logs/buropro-login-error.png' });
    console.log('See: error_logs/buropro-login-error.png');
    console.log(error);
    console.log(consoleColors.error, 'process.exit();');
    process.exit();
  }
}

module.exports = logIntoBuropro;
