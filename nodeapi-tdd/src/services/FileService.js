const fs = require('fs');
const path = require('path');
const config = require('config');
const FileType = require('file-type');
const { randomString } = require('../shared/generator');
const FileAttachment = require('../models/FileAttachment');

const { uploadDir, profileDir, attachmentDir } = config;
const profileFolder = path.join('.', uploadDir, profileDir);
const attachmentFolder = path.join('.', uploadDir, attachmentDir);

const createFolders = () => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  if (!fs.existsSync(profileFolder)) {
    fs.mkdirSync(profileFolder);
  }

  if (!fs.existsSync(attachmentFolder)) {
    fs.mkdirSync(attachmentFolder);
  }
};

const saveProfileImage = async (base64File) => {
  const filename = randomString(32);
  const filePath = path.join(profileFolder, filename);

  await fs.promises.writeFile(filePath, base64File, 'base64');
  return filename;
};

const deleteProfileImage = async (filename) => {
  const filePath = path.join(profileFolder, filename);
  await fs.promises.unlink(filePath);
};

const isLessThan2MB = (buffer) => {
  return buffer.length < 2 * 1024 * 1024;
};

const isSupportedFileType = async (buffer) => {
  const type = await FileType.fromBuffer(buffer);
  return !type
    ? false
    : type.mime === 'image/png' || type.mime === 'image/jpeg';
};

const saveAttachment = async (file) => {
  const type = await FileType.fromBuffer(file.buffer);
  let fileType;
  let filename = randomString(32);
  if (type) {
    fileType = type.mime;
    filename += `.${type.ext}`;
  }

  await fs.promises.writeFile(
    path.join(attachmentFolder, filename),
    file.buffer
  );
  await FileAttachment.create({
    filename: filename,
    uploadDate: new Date(),
    fileType: fileType,
  });
};

module.exports = {
  createFolders,
  saveProfileImage,
  deleteProfileImage,
  isLessThan2MB,
  isSupportedFileType,
  saveAttachment,
};
