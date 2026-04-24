CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`whatsapp` varchar(20) NOT NULL,
	`city` varchar(100) NOT NULL,
	`event` varchar(100) NOT NULL DEFAULT 'TOP Destemidos Pioneiros',
	`status` enum('new','contacted','registered','confirmed') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`city` varchar(100) NOT NULL,
	`event` varchar(100) NOT NULL,
	`quote` text NOT NULL,
	`avatarUrl` text,
	`rating` int NOT NULL DEFAULT 5,
	`featured` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`)
);
