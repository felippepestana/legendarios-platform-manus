CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`leadId` int,
	`stripeSessionId` varchar(255) NOT NULL,
	`stripePaymentIntentId` varchar(255),
	`event` varchar(100) NOT NULL DEFAULT 'TOP Destemidos Pioneiros',
	`paymentMethod` enum('pix','card') NOT NULL,
	`orderStatus` enum('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
	`amountCents` int NOT NULL,
	`customerName` varchar(255),
	`customerEmail` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_stripeSessionId_unique` UNIQUE(`stripeSessionId`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(255);