-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: studyspot
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `studyspot`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `studyspot` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `studyspot`;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bookings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `place_id` int(11) NOT NULL,
  `booking_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `people` int(11) DEFAULT 1,
  `total_price` decimal(10,2) DEFAULT 0.00,
  `status` enum('pending','upcoming','completed','cancelled') DEFAULT 'pending',
  `payment_ref` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `place_id` (`place_id`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`place_id`) REFERENCES `places` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,1,5,'2026-09-12','10:00:00','12:00:00',1,500.00,'upcoming','SS-100231','2026-09-23 04:12:06'),(2,1,8,'2026-09-15','14:00:00','16:00:00',2,0.00,'upcoming','SS-100232','2026-09-23 04:12:06'),(3,1,2,'2026-08-20','09:00:00','11:00:00',1,350.00,'completed','SS-100198','2026-09-23 04:12:06'),(4,1,3,'2026-08-11','08:00:00','17:00:00',1,300.00,'completed','SS-100177','2026-09-23 04:12:06'),(5,1,1,'2026-07-30','13:00:00','16:00:00',3,0.00,'completed','SS-100120','2026-09-23 04:12:06'),(6,1,6,'2026-08-02','10:00:00','12:00:00',1,600.00,'cancelled','SS-100150','2026-09-23 04:12:06');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `favorites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `place_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_fav` (`user_id`,`place_id`),
  KEY `place_id` (`place_id`),
  CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`place_id`) REFERENCES `places` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
INSERT INTO `favorites` VALUES (1,1,1,'2026-09-23 04:12:06'),(2,1,2,'2026-09-23 04:12:06'),(3,1,3,'2026-09-23 04:12:06'),(4,1,4,'2026-09-23 04:12:06');
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `place_images`
--

DROP TABLE IF EXISTS `place_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `place_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `place_id` int(11) NOT NULL,
  `image` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `place_id` (`place_id`),
  CONSTRAINT `place_images_ibfk_1` FOREIGN KEY (`place_id`) REFERENCES `places` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `place_images`
--

LOCK TABLES `place_images` WRITE;
/*!40000 ALTER TABLE `place_images` DISABLE KEYS */;
INSERT INTO `place_images` VALUES (1,1,'national-library-2.jpg'),(2,1,'national-library-3.jpg'),(3,1,'national-library-4.jpg'),(4,1,'national-library-5.jpg'),(5,1,'national-library-6.jpg'),(6,2,'cafe-kumbuk-2.jpg'),(7,2,'cafe-kumbuk-3.jpg'),(8,3,'hub-lanka-2.jpg'),(9,3,'hub-lanka-3.jpg'),(10,4,'uoc-library-2.jpg'),(11,4,'national-library-2.jpg'),(12,5,'library-cafe-2.jpg'),(13,5,'cafe-kumbuk-3.jpg'),(14,6,'book-haven-2.jpg'),(15,7,'book-haven-2.jpg'),(16,7,'national-library-4.jpg'),(17,8,'green-space-2.jpg');
/*!40000 ALTER TABLE `place_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `places`
--

DROP TABLE IF EXISTS `places`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `places` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `type` enum('library','cafe','coworking','university') NOT NULL,
  `city` varchar(100) NOT NULL,
  `address` varchar(255) NOT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `distance_km` decimal(4,1) DEFAULT 0.0,
  `wifi` enum('none','free','paid') DEFAULT 'free',
  `wifi_note` varchar(100) DEFAULT 'High Speed',
  `noise_level` enum('very_quiet','quiet','moderate','lively') DEFAULT 'quiet',
  `noise_note` varchar(100) DEFAULT 'Perfect for deep focus',
  `cost_type` enum('free','1-200','201-500','500+') DEFAULT 'free',
  `cost_label` varchar(60) DEFAULT 'Free',
  `price` decimal(10,2) DEFAULT 0.00,
  `open_time` time DEFAULT '08:00:00',
  `close_time` time DEFAULT '20:00:00',
  `open_days` varchar(60) DEFAULT 'Monday - Sunday',
  `description` text DEFAULT NULL,
  `cover_image` varchar(255) DEFAULT NULL,
  `facilities` varchar(255) DEFAULT 'Power Outlets,Parking,Air Conditioning,Drinking Water,Restrooms',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `places`
--

LOCK TABLES `places` WRITE;
/*!40000 ALTER TABLE `places` DISABLE KEYS */;
INSERT INTO `places` VALUES (1,'National Library Colombo','library','Colombo','Colombo 07, Sri Lanka',6.9061000,79.8612000,0.8,'free','High Speed','very_quiet','Perfect for deep focus','free','Free',0.00,'08:00:00','20:00:00','Monday - Sunday','The National Library Colombo is a peaceful and spacious environment ideal for focused study and research. It offers a wide collection of books, comfortable seating and free Wi-Fi for students.','national-library.jpg','Power Outlets,Parking,Air Conditioning,Drinking Water,Restrooms','2026-09-23 04:12:06'),(2,'Cafe Kumbuk','cafe','Colombo','Colombo 06, Sri Lanka',6.8790000,79.8610000,1.2,'free','Free Wi-Fi','quiet','Soft background music','201-500','LKR 200 - 500',350.00,'07:00:00','22:00:00','Monday - Sunday','A cosy garden cafe with plenty of natural light, long tables and power outlets at almost every seat. Good for short study sessions and group work.','cafe-kumbuk.jpg','Power Outlets,Parking,Air Conditioning,Drinking Water,Restrooms','2026-09-23 04:12:06'),(3,'Hub Lanka Co-working Space','coworking','Colombo','Colombo 03, Sri Lanka',6.9210000,79.8480000,1.5,'free','High Speed Wi-Fi','quiet','Quiet working floor','201-500','LKR 300 / day',300.00,'06:30:00','19:00:00','Monday - Saturday','A professional co-working space with dedicated desks, meeting rooms, unlimited coffee and very fast internet. Day passes are available for students.','hub-lanka.jpg','Power Outlets,Parking,Air Conditioning,Drinking Water,Restrooms','2026-09-23 04:12:06'),(4,'University of Colombo Library','university','Colombo','Colombo 03, Sri Lanka',6.9020000,79.8600000,2.1,'free','Free Wi-Fi','very_quiet','Silent reading hall','free','Free',0.00,'07:00:00','22:30:00','Monday - Sunday','The main university library with silent reading halls, reference sections and group discussion rooms. Open to visiting students with a valid ID.','uoc-library.jpg','Power Outlets,Parking,Air Conditioning,Drinking Water,Restrooms','2026-09-23 04:12:06'),(5,'The Library Cafe','cafe','Kandy','Peradeniya Road, Kandy',7.2906000,80.6337000,0.8,'free','Free Wi-Fi','quiet','Calm and comfortable','201-500','LKR 500',500.00,'08:00:00','21:00:00','Monday - Sunday','Book-lined walls, wooden tables and filter coffee. One of the calmest study cafes in Kandy, popular with university students.','library-cafe.jpg','Power Outlets,Parking,Air Conditioning,Drinking Water,Restrooms','2026-09-23 04:12:06'),(6,'Mind Space','coworking','Peradeniya','Peradeniya, Kandy',7.2560000,80.5970000,1.4,'paid','Paid Wi-Fi','very_quiet','Dedicated silent zone','500+','LKR 600 / day',600.00,'08:00:00','20:00:00','Monday - Saturday','A small co-working studio built for students, with silent pods, whiteboards and a study lounge.','mind-space.jpg','Power Outlets,Parking,Air Conditioning,Drinking Water,Restrooms','2026-09-23 04:12:06'),(7,'Book Haven','library','Kandy','Dalada Veediya, Kandy',7.2930000,80.6350000,2.0,'free','Free Wi-Fi','quiet','Quiet most of the day','1-200','LKR 150',150.00,'09:00:00','19:00:00','Monday - Sunday','A community library and reading room with a large fiction and reference collection, plus a quiet upstairs study area.','book-haven.jpg','Power Outlets,Parking,Air Conditioning,Drinking Water,Restrooms','2026-09-23 04:12:06'),(8,'Green Space','university','Kandy','University of Peradeniya, Kandy',7.2540000,80.5950000,3.2,'free','Free Wi-Fi','moderate','Open air, light chatter','free','Free',0.00,'07:00:00','18:00:00','Monday - Sunday','Open air study lawns and shaded seating inside the Peradeniya campus. Best in the morning before it gets busy.','green-space.jpg','Power Outlets,Parking,Air Conditioning,Drinking Water,Restrooms','2026-09-23 04:12:06');
/*!40000 ALTER TABLE `places` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recently_viewed`
--

DROP TABLE IF EXISTS `recently_viewed`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `recently_viewed` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `place_id` int(11) NOT NULL,
  `viewed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_view` (`user_id`,`place_id`),
  KEY `place_id` (`place_id`),
  CONSTRAINT `recently_viewed_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `recently_viewed_ibfk_2` FOREIGN KEY (`place_id`) REFERENCES `places` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recently_viewed`
--

LOCK TABLES `recently_viewed` WRITE;
/*!40000 ALTER TABLE `recently_viewed` DISABLE KEYS */;
/*!40000 ALTER TABLE `recently_viewed` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `place_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rating` tinyint(4) NOT NULL,
  `noise_level` varchar(30) DEFAULT NULL,
  `wifi_quality` varchar(30) DEFAULT NULL,
  `value_for_money` varchar(30) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `place_id` (`place_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`place_id`) REFERENCES `places` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,1,2,5,'Very Quiet','Excellent','Excellent','Very quiet and comfortable. Perfect place for long study sessions!','2026-09-18 04:12:06'),(2,1,1,5,'Very Quiet','Good','Excellent','Huge reading hall and plenty of power outlets.','2026-09-11 04:12:06'),(3,1,3,4,'Quiet','Good','Excellent','Gets a little busy after 4pm but still great.','2026-09-03 04:12:06'),(4,2,1,4,'Quiet','Good','Good','Nice coffee, good wifi. Bit pricey for a full day.','2026-09-20 04:12:06'),(5,3,1,5,'Quiet','Excellent','Good','Fastest internet I have used in Colombo.','2026-09-15 04:12:06'),(6,4,2,5,'Very Quiet','Good','Excellent','Free and very silent. My favourite exam week spot.','2026-09-21 04:12:06'),(7,5,1,5,'Quiet','Good','Good','Lovely atmosphere in Kandy, friendly staff.','2026-09-17 04:12:06');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Sahan Perera','sahan@example.com','$2y$10$zIl.N41sf10AUJEQbBtbMOC5YDxup8sA7.rAHZVHoiJZN7q6pT2KK',NULL,'2026-09-23 04:12:06'),(2,'Tharushi D.','tharushi@example.com','$2y$10$zIl.N41sf10AUJEQbBtbMOC5YDxup8sA7.rAHZVHoiJZN7q6pT2KK',NULL,'2026-09-23 04:12:06'),(3,'Nimal Fernando','nimal@example.com','$2y$10$zIl.N41sf10AUJEQbBtbMOC5YDxup8sA7.rAHZVHoiJZN7q6pT2KK',NULL,'2026-09-23 04:12:06');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-30  9:27:12
