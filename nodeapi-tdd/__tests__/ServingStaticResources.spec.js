const request = require('supertest');
const fs = require('fs');
const path = require('path');
const config = require('config');
const app = require('../src/app');

const { uploadDir, profileDir } = config;
const profileFolder = path.join('.', uploadDir, profileDir);

describe('Profile Images', () => {
  const copyFile = () => {
    const filePath = path.join('.', '__tests__', 'resources', 'test-png.png');
    const storedFileName = 'test-file';
    const targetPath = path.join(profileFolder, storedFileName);
    fs.copyFileSync(filePath, targetPath);
    return storedFileName;
  };

  it('Returns 404 when file not found', async () => {
    const response = await request(app).get('/images/123456');
    expect(response.status).toBe(404);
  });

  it('Returns 200 ok when file exist', async () => {
    const storedFileName = copyFile();
    const response = await request(app).get('/images/' + storedFileName);
    expect(response.status).toBe(200);
  });

  it('Returns cache for 1 year in response', async () => {
    const storedFileName = copyFile();
    const response = await request(app).get('/images/' + storedFileName);
    const oneYearInSeconds = 365 * 24 * 60 * 60;
    expect(response.header['cache-control']).toContain(
      `max-age=${oneYearInSeconds}`
    );
  });
});
