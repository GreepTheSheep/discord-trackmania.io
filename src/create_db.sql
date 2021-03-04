-- CREATE DATABASE IF NOT EXISTS 'trackmaniaio-bot' CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- GRANT ALL PRIVILEGES ON 'trackmaniaio-bot'.* TO 'trackmaniaio-bot'@'localhost' IDENTIFIED BY 'trackmaniaio';

CREATE TABLE IF NOT EXISTS `totd_thumbnail_cache` ( `mapUid` VARCHAR(100) NOT NULL , `date` DATE NOT NULL , `thumbnail` TEXT NOT NULL , PRIMARY KEY (`mapUid`));
CREATE TABLE IF NOT EXISTS `totd-wr_channels` ( `guildId` VARCHAR(64) NOT NULL , `userId` VARCHAR(64) NOT NULL , `channelId` VARCHAR(64) NOT NULL , PRIMARY KEY (`guildId`), UNIQUE (`channelId`));
CREATE TABLE IF NOT EXISTS `totd_channels` ( `guildId` VARCHAR(64) NOT NULL , `userId` VARCHAR(64) NOT NULL , `channelId` VARCHAR(64) NOT NULL , PRIMARY KEY (`guildId`), UNIQUE (`channelId`));
CREATE TABLE IF NOT EXISTS `news_channels` ( `guildId` VARCHAR(64) NOT NULL , `userId` VARCHAR(64) NOT NULL , `channelId` VARCHAR(64) NOT NULL , PRIMARY KEY (`guildId`), UNIQUE (`channelId`));
CREATE TABLE IF NOT EXISTS `players` ( `accountId` VARCHAR(128) NOT NULL , `discordId` VARCHAR(64) NOT NULL , PRIMARY KEY (`accountId`));
