const express = require('express');
const { RankCard } = require('rankcard');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

const app = express();
const port = process.env.PORT || 5050;

app.get('/rankCard', async (req, res) => {
  const { name, level, color, facebookSenderId, progress, rank, currentXp, requiredXp, showXp } = req.query;

  if (!name || !facebookSenderId) {
    return res.status(400).send('Wrong parameters. Please provide "name" and "facebookSenderId".');
  }

  // Get Facebook profile picture
  try {
    const avatarResponse = await axios.get(
      `https://graph.facebook.com/${facebookSenderId}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
      { responseType: 'arraybuffer' }
    );

    const avatarImage = Buffer.from(avatarResponse.data, 'binary');

    const card = new RankCard()
      .setName(name)
      .setLevel(level || 'Level 1')
      .setColor(color || 'auto')
      .setAvatar(avatarImage)
      .setProgress(parseInt(progress) || 0)
      .setRank(rank || 'N/A')
      .setCurrentXp(currentXp || '0')
      .setRequiredXp(requiredXp || '0')
      .setShowXp(showXp === 'true');

    const cardBuffer = await card.build();

    // Save the rank up card image to tmp directory with a specific filename
    const rankCardFilePath = path.join(__dirname, `./tmp/rankup.png`);
    fs.writeFileSync(rankCardFilePath, cardBuffer);

    // Save the Facebook profile picture to tmp directory with a specific filename
    const avatarFilePath = path.join(__dirname, `./tmp/users.jpg`);
    fs.writeFileSync(avatarFilePath, avatarImage);

    // Send the saved rank up card image as a response
    res.sendFile(rankCardFilePath);
  } catch (error) {
    console.error('Error fetching Facebook profile picture:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
