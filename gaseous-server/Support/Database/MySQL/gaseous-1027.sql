CREATE TABLE GameSaves (
    `Id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `UserId` VARCHAR(45) NOT NULL,
    `RomId` BIGINT NOT NULL,
    `IsMediaGroup` TINYINT NOT NULL,
    `CoreName` VARCHAR(45) NOT NULL,
    `MD5` VARCHAR(32) NOT NULL,
    `Timestamp` DATETIME NOT NULL,
    `File` LONGBLOB NOT NULL
);