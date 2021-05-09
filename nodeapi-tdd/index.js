const bcrypt = require('bcrypt');
const app = require('./src/app');
const sequelize = require('./src/config/database');
const User = require('./src/models/User');
const TokenService = require('./src/services/TokenService');

// Function to add an initial set of users in the system
const addUsers = async (activeUserCount, inactiveUserCount = 0) => {
  const hash = await bcrypt.hash('P4ssword', 10);

  for (let i = 0; i < activeUserCount + inactiveUserCount; i++) {
    await User.create({
      username: `user${i + 1}`,
      email: `user${i + 1}@mail.com`,
      inactive: i >= activeUserCount,
      password: hash,
    });
  }
};

// Synchronize the ORM with database
sequelize.sync({ force: true }).then(async () => {
  await addUsers(25);
});

// Clean tokens
TokenService.scheduleCleanup();

// Start listening on port 3000
app.listen(3000, () => console.log('Express REST API Running!'));
