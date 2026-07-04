CREATE TABLE `checkins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`registrationId` int NOT NULL,
	`qrCodeToken` varchar(64) NOT NULL,
	`qrCodeDataUrl` text,
	`status` enum('pending','checked_in','cancelled') NOT NULL DEFAULT 'pending',
	`checkedInAt` timestamp,
	`checkedInBy` int,
	`checkedInMethod` enum('qr_scan','manual','admin') DEFAULT 'qr_scan',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `checkins_id` PRIMARY KEY(`id`),
	CONSTRAINT `checkins_qrCodeToken_unique` UNIQUE(`qrCodeToken`)
);
