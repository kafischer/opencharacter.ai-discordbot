const fetch = require('node-fetch');

const getImage = async (searchQuery) => {
  try {
    const response = await fetch(`https://lexica.art/api/v1/search?q=${searchQuery}`);
    const data = await response.json();

    if (data.images && data.images.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.images.length);
      console.log(data.images[randomIndex]);

      const imageUrl = data.images[randomIndex].srcSmall;
      console.log(`Image URL: ${imageUrl}`);
      return imageUrl;
    } else {
      console.log('No images found.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

module.exports = {
  getImage
};