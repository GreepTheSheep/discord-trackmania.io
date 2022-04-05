CREATE DATABASE IF NOT EXISTS `discord-tmio` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON `discord-tmio`.* TO `trackmaniaio-bot`@`localhost` IDENTIFIED BY 'trackmaniaio';
USE `discord-tmio`;

CREATE TABLE IF NOT EXISTS `players` ( `accountId` VARCHAR(128) NOT NULL , `discordId` VARCHAR(64) NOT NULL , PRIMARY KEY (`accountId`));
CREATE TABLE IF NOT EXISTS `totd_channels` ( `guildId` VARCHAR(64) NOT NULL , `userId` VARCHAR(64) NOT NULL , `channelId` VARCHAR(64) NOT NULL , `roleId` VARCHAR(64) NULL , PRIMARY KEY (`guildId`), UNIQUE (`channelId`));

--CREATE TABLE IF NOT EXISTS `map_thumbnails` ( `mapUid` VARCHAR(100) NOT NULL , `link` TEXT NOT NULL , PRIMARY KEY (`mapUid`));
--CREATE TABLE IF NOT EXISTS `totd-wr_channels` ( `guildId` VARCHAR(64) NOT NULL , `userId` VARCHAR(64) NOT NULL , `channelId` VARCHAR(64) NOT NULL , PRIMARY KEY (`guildId`), UNIQUE (`channelId`));
--CREATE TABLE IF NOT EXISTS `news_channels` ( `guildId` VARCHAR(64) NOT NULL , `userId` VARCHAR(64) NOT NULL , `channelId` VARCHAR(64) NOT NULL , PRIMARY KEY (`guildId`), UNIQUE (`channelId`));
--CREATE TABLE IF NOT EXISTS `map-wr_channels` ( `guildId` VARCHAR(64) NOT NULL , `userId` VARCHAR(64) NOT NULL , `channelId` VARCHAR(64) NOT NULL , `mapUid` VARCHAR(64) NOT NULL , PRIMARY KEY (`guildId`, `mapUid`));
--CREATE TABLE IF NOT EXISTS `map_thumbnail_cache` ( `mapUid` VARCHAR(100) NOT NULL , `thumbnail` TEXT NOT NULL , PRIMARY KEY (`mapUid`));
--CREATE TABLE IF NOT EXISTS `prefix` (`guildId` varchar(100) NOT NULL, `prefix` varchar(10) NOT NULL DEFAULT 'tm!', PRIMARY KEY (`guildId`))
