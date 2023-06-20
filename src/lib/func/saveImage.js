const fs = require('fs');
const path = require('path');
const url = require('url');

const consoleColors = require('../consoleColors');

const imageFolder = 'saved_images';

async function saveImage(page, imageUrl, internalCode, noImageURL) {
  try {
    const parsedUrl = url.parse(imageUrl);
    const extension = path.extname(parsedUrl.pathname);
    const imagePath = path.join(imageFolder, `${internalCode}${extension}`);

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    const viewSource = await page.goto(imageUrl);

    if (noImageURL) {
      const newURL = page.url();
      if (newURL === noImageURL) {
        return false;
      }
    }

    fs.writeFileSync(imagePath, await viewSource.buffer());
    console.log(consoleColors.success, 'image saved successfully:', imagePath);

    await page.goBack();
    return true;
  } catch (error) {
    console.log(consoleColors.error, 'Error while saving image');
    console.log(consoleColors.error, error);
    return false;
  }
}

module.exports = saveImage;
