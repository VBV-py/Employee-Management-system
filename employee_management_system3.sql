-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: employee_management_system
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

create database employee_management_system;
use employee_management_system

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `date` date NOT NULL,
  `check_in` datetime DEFAULT NULL,
  `check_out` datetime DEFAULT NULL,
  `status` enum('present','absent','half-day','late','on-leave') DEFAULT 'present',
  `note` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_id` (`employee_id`,`date`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
INSERT INTO `attendance` VALUES (2,3,'2025-04-16','2025-04-16 22:34:28','2025-04-16 22:34:31','late',NULL,'2025-04-16 17:04:27','2025-04-16 17:04:30'),(10,2,'2025-04-15','2025-04-15 09:01:00','2025-04-15 17:03:00','late',NULL,'2025-04-17 11:21:53','2025-04-17 11:21:53'),(11,2,'2025-04-17',NULL,NULL,'on-leave','On Sick Leave','2025-04-17 11:23:13','2025-04-17 11:23:13'),(12,2,'2025-04-18',NULL,NULL,'on-leave','On Sick Leave','2025-04-17 11:23:13','2025-04-17 11:23:13'),(13,2,'2025-04-19',NULL,NULL,'on-leave','On Sick Leave','2025-04-17 11:23:13','2025-04-17 11:23:13'),(14,2,'2025-04-20',NULL,NULL,'on-leave','On Sick Leave','2025-04-17 11:23:13','2025-04-17 11:23:13'),(15,2,'2025-04-26',NULL,NULL,'on-leave','On Annual Leave','2025-04-17 11:23:14','2025-04-17 11:23:14'),(16,2,'2025-04-27',NULL,NULL,'on-leave','On Annual Leave','2025-04-17 11:23:14','2025-04-17 11:23:14'),(17,2,'2025-04-28',NULL,NULL,'on-leave','On Annual Leave','2025-04-17 11:23:14','2025-04-17 11:23:14'),(18,3,'2025-04-17','2025-04-17 17:42:59','2025-04-17 17:43:02','late',NULL,'2025-04-17 12:12:58','2025-04-17 12:13:01');
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `before_attendance_insert` BEFORE INSERT ON `attendance` FOR EACH ROW BEGIN
DECLARE employee_dept INT;
DECLARE start_time TIME;

-- Get employee department info
SELECT department_id INTO employee_dept FROM employees WHERE id = NEW.employee_id;

-- Set default start time (9:00 AM)
SET start_time = '09:00:00';

-- If check_in time is after start time, mark as 'late'
IF NEW.check_in IS NOT NULL AND TIME(NEW.check_in) > start_time THEN
SET NEW.status = 'late';
END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,'IT','Information Technology Department','2025-04-15 20:20:18','2025-04-15 20:20:18'),(2,'HR','Human Resources Department','2025-04-15 20:20:18','2025-04-15 20:20:18'),(3,'Finance','Finance and Accounting Department','2025-04-15 20:20:18','2025-04-15 20:20:18'),(4,'Marketing','Marketing and Sales Department','2025-04-15 20:20:18','2025-04-15 20:20:18');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `designations`
--

DROP TABLE IF EXISTS `designations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `designations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `designations`
--

LOCK TABLES `designations` WRITE;
/*!40000 ALTER TABLE `designations` DISABLE KEYS */;
INSERT INTO `designations` VALUES (1,'Software Engineer','Develops and maintains software applications','2025-04-15 20:20:18','2025-04-15 20:20:18'),(2,'HR Manager','Manages human resources functions','2025-04-15 20:20:18','2025-04-15 20:20:18'),(3,'Financial Analyst','Analyzes financial data and prepares reports','2025-04-15 20:20:18','2025-04-15 20:20:18'),(4,'Marketing Specialist','Creates and implements marketing strategies','2025-04-15 20:20:18','2025-04-15 20:20:18');
/*!40000 ALTER TABLE `designations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_documents`
--

DROP TABLE IF EXISTS `employee_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `document_type` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `employee_documents_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_documents`
--

LOCK TABLES `employee_documents` WRITE;
/*!40000 ALTER TABLE `employee_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `employee_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_skills`
--

DROP TABLE IF EXISTS `employee_skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_skills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `skill_id` int NOT NULL,
  `proficiency_level` enum('beginner','intermediate','advanced','expert') DEFAULT 'beginner',
  `verified` tinyint(1) DEFAULT '0',
  `verified_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_id` (`employee_id`,`skill_id`),
  KEY `skill_id` (`skill_id`),
  KEY `verified_by` (`verified_by`),
  CONSTRAINT `employee_skills_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  CONSTRAINT `employee_skills_ibfk_2` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`),
  CONSTRAINT `employee_skills_ibfk_3` FOREIGN KEY (`verified_by`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_skills`
--

LOCK TABLES `employee_skills` WRITE;
/*!40000 ALTER TABLE `employee_skills` DISABLE KEYS */;
INSERT INTO `employee_skills` VALUES (2,3,1,'advanced',1,1,'2025-04-19 18:52:45','2025-04-19 18:52:45'),(3,3,2,'expert',1,1,'2025-04-19 18:52:56','2025-04-19 18:52:56'),(4,3,3,'beginner',1,1,'2025-04-19 18:53:52','2025-04-19 18:53:52'),(5,3,4,'beginner',1,1,'2025-04-19 18:54:02','2025-04-19 18:54:02');
/*!40000 ALTER TABLE `employee_skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_types`
--

DROP TABLE IF EXISTS `employee_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_types`
--

LOCK TABLES `employee_types` WRITE;
/*!40000 ALTER TABLE `employee_types` DISABLE KEYS */;
INSERT INTO `employee_types` VALUES (1,'Full-Time','Full-time permanent employee','2025-04-15 20:20:18','2025-04-15 20:20:18'),(2,'Part-Time','Part-time employee with limited hours','2025-04-15 20:20:18','2025-04-15 20:20:18'),(3,'Contract','Contract-based employee with fixed term','2025-04-15 20:20:18','2025-04-15 20:20:18'),(4,'Intern','Temporary internship position','2025-04-15 20:20:18','2025-04-15 20:20:18');
/*!40000 ALTER TABLE `employee_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(20) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `profile_image` varchar(255) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `hire_date` date NOT NULL,
  `department_id` int NOT NULL,
  `designation_id` int NOT NULL,
  `role_id` int NOT NULL,
  `employee_type_id` int NOT NULL,
  `is_supervisor` tinyint(1) DEFAULT '0',
  `reports_to` int DEFAULT NULL,
  `emergency_contact` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_id` (`employee_id`),
  UNIQUE KEY `email` (`email`),
  KEY `department_id` (`department_id`),
  KEY `designation_id` (`designation_id`),
  KEY `role_id` (`role_id`),
  KEY `employee_type_id` (`employee_type_id`),
  KEY `reports_to` (`reports_to`),
  CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  CONSTRAINT `employees_ibfk_2` FOREIGN KEY (`designation_id`) REFERENCES `designations` (`id`),
  CONSTRAINT `employees_ibfk_3` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `employees_ibfk_4` FOREIGN KEY (`employee_type_id`) REFERENCES `employee_types` (`id`),
  CONSTRAINT `employees_ibfk_5` FOREIGN KEY (`reports_to`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (1,'EMP-2023-001','John','Supervisor','supervisor@example.com','$2b$10$SSlZwGg7nd8iro.xqecsIuOFfQWu/HkJn.44D7Yr/KOskdSkep48m',NULL,NULL,NULL,NULL,NULL,'2025-04-16',1,1,2,1,1,NULL,NULL,1,NULL,'2025-04-15 20:22:04','2025-04-15 20:49:48'),(2,'EMP-2023-002','Jane','Employee','employee@example.com','$2b$10$SSlZwGg7nd8iro.xqecsIuOFfQWu/HkJn.44D7Yr/KOskdSkep48m',NULL,NULL,NULL,NULL,NULL,'2025-04-16',1,1,4,1,0,1,NULL,1,NULL,'2025-04-15 20:22:04','2025-04-15 20:49:48'),(3,'EMP-2025-001','Vaibhav','Thakur','vaibhav@gmail.com','$2b$10$fn3e4Df4EO4XH.tkOABCk.zLSYh3Q9e9lP4OI551B1nmx9oU1qo8i','9999999999','Lal Kuah ,Dadri',NULL,NULL,NULL,'2025-04-16',1,1,4,4,0,1,'9999999988',1,NULL,'2025-04-15 21:47:42','2025-04-19 20:18:48');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_employee_insert` AFTER INSERT ON `employees` FOR EACH ROW BEGIN
-- Insert leave balances for the new employee
INSERT INTO leave_balances (employee_id, leave_type_id, year, total_days)
SELECT NEW.id, id, YEAR(CURRENT_DATE), default_days
FROM leave_types;

-- Log the new employee creation
INSERT INTO system_logs (user_id, action, entity, entity_id, details)
VALUES (NULL, 'CREATE', 'employees', NEW.id, CONCAT('New employee created: ', NEW.first_name, ' ', NEW.last_name));

-- Create a welcome notification
INSERT INTO notifications (employee_id, title, message)
VALUES (NEW.id, 'Welcome to the Company', 'Welcome aboard! Please complete your profile and review your information.');
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `leave_balances`
--

DROP TABLE IF EXISTS `leave_balances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_balances` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `leave_type_id` int NOT NULL,
  `year` year NOT NULL,
  `total_days` int NOT NULL,
  `used_days` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_id` (`employee_id`,`leave_type_id`,`year`),
  KEY `leave_type_id` (`leave_type_id`),
  CONSTRAINT `leave_balances_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  CONSTRAINT `leave_balances_ibfk_2` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_balances`
--

LOCK TABLES `leave_balances` WRITE;
/*!40000 ALTER TABLE `leave_balances` DISABLE KEYS */;
INSERT INTO `leave_balances` VALUES (1,1,1,2025,20,0,'2025-04-15 20:22:04','2025-04-15 20:22:04'),(2,1,2,2025,10,0,'2025-04-15 20:22:04','2025-04-15 20:22:04'),(3,1,3,2025,5,0,'2025-04-15 20:22:04','2025-04-15 20:22:04'),(4,1,4,2025,90,0,'2025-04-15 20:22:04','2025-04-15 20:22:04'),(8,2,1,2025,20,3,'2025-04-15 20:22:04','2025-04-17 11:34:15'),(9,2,2,2025,10,4,'2025-04-15 20:22:04','2025-04-17 11:34:15'),(10,2,3,2025,5,0,'2025-04-15 20:22:04','2025-04-15 20:22:04'),(11,2,4,2025,90,0,'2025-04-15 20:22:04','2025-04-15 20:22:04'),(15,3,1,2025,20,0,'2025-04-15 21:47:42','2025-04-15 21:47:42'),(16,3,2,2025,10,0,'2025-04-15 21:47:42','2025-04-15 21:47:42'),(17,3,3,2025,5,0,'2025-04-15 21:47:42','2025-04-15 21:47:42'),(18,3,4,2025,90,0,'2025-04-15 21:47:42','2025-04-15 21:47:42');
/*!40000 ALTER TABLE `leave_balances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_balances_backup`
--

DROP TABLE IF EXISTS `leave_balances_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_balances_backup` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `leave_type_id` int NOT NULL,
  `year` year NOT NULL,
  `total_days` int NOT NULL,
  `used_days` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_id` (`employee_id`,`leave_type_id`,`year`),
  KEY `leave_type_id` (`leave_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_balances_backup`
--

LOCK TABLES `leave_balances_backup` WRITE;
/*!40000 ALTER TABLE `leave_balances_backup` DISABLE KEYS */;
INSERT INTO `leave_balances_backup` VALUES (1,1,1,2025,20,0,'2025-04-15 20:22:04','2025-04-15 20:22:04'),(2,1,2,2025,10,0,'2025-04-15 20:22:04','2025-04-15 20:22:04'),(3,1,3,2025,5,0,'2025-04-15 20:22:04','2025-04-15 20:22:04'),(4,1,4,2025,90,0,'2025-04-15 20:22:04','2025-04-15 20:22:04'),(8,2,1,2025,20,3,'2025-04-15 20:22:04','2025-04-17 10:18:07'),(9,2,2,2025,10,4,'2025-04-15 20:22:04','2025-04-17 09:18:36'),(10,2,3,2025,5,0,'2025-04-15 20:22:04','2025-04-15 20:22:04'),(11,2,4,2025,90,0,'2025-04-15 20:22:04','2025-04-15 20:22:04'),(15,3,1,2025,20,0,'2025-04-15 21:47:42','2025-04-15 21:47:42'),(16,3,2,2025,10,0,'2025-04-15 21:47:42','2025-04-15 21:47:42'),(17,3,3,2025,5,0,'2025-04-15 21:47:42','2025-04-15 21:47:42'),(18,3,4,2025,90,0,'2025-04-15 21:47:42','2025-04-15 21:47:42');
/*!40000 ALTER TABLE `leave_balances_backup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_requests`
--

DROP TABLE IF EXISTS `leave_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `leave_type_id` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_days` decimal(5,1) NOT NULL,
  `reason` text,
  `status` enum('pending','approved','rejected','cancelled') DEFAULT 'pending',
  `approved_by` int DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  KEY `leave_type_id` (`leave_type_id`),
  KEY `approved_by` (`approved_by`),
  CONSTRAINT `leave_requests_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  CONSTRAINT `leave_requests_ibfk_2` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`),
  CONSTRAINT `leave_requests_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_requests`
--

LOCK TABLES `leave_requests` WRITE;
/*!40000 ALTER TABLE `leave_requests` DISABLE KEYS */;
INSERT INTO `leave_requests` VALUES (1,2,2,'2025-04-18','2025-04-21',4.0,'Sick ','approved',1,'2025-04-17 11:23:13','Approved by supervisor','2025-04-17 09:17:43','2025-04-17 11:23:13'),(2,2,1,'2025-04-27','2025-04-29',3.0,'annual ','approved',1,'2025-04-17 11:23:14','Approved by supervisor','2025-04-17 10:08:09','2025-04-17 11:23:14');
/*!40000 ALTER TABLE `leave_requests` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_leave_request_update_recalc` AFTER UPDATE ON `leave_requests` FOR EACH ROW BEGIN
    DECLARE total_used DECIMAL(10,1); 

    
    IF (NEW.status = 'approved' AND OLD.status != 'approved') OR (NEW.status != 'approved' AND OLD.status = 'approved') THEN

        
        SELECT COALESCE(SUM(lr.total_days), 0)
        INTO total_used
        FROM leave_requests lr
        WHERE lr.employee_id = NEW.employee_id
          AND lr.leave_type_id = NEW.leave_type_id
          AND lr.status = 'approved'
          AND YEAR(lr.start_date) = YEAR(NEW.start_date); 

        
        UPDATE leave_balances
        SET used_days = total_used,
            updated_at = CURRENT_TIMESTAMP
        WHERE employee_id = NEW.employee_id
          AND leave_type_id = NEW.leave_type_id
          AND year = YEAR(NEW.start_date); 

        
        IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
             INSERT INTO notifications (employee_id, title, message)
             VALUES (NEW.employee_id, 'Leave Request Approved',
                     CONCAT('Your leave request (', (SELECT name FROM leave_types WHERE id = NEW.leave_type_id), ') from ', DATE_FORMAT(NEW.start_date, '%d %M %Y'),
                            ' to ', DATE_FORMAT(NEW.end_date, '%d %M %Y'), ' has been approved.'));
        END IF;

    END IF;

    
    INSERT INTO system_logs (user_id, action, entity, entity_id, details)
    VALUES (NEW.approved_by, 'UPDATE', 'leave_requests', NEW.id,
            CONCAT('Leave request status changed from ', OLD.status, ' to ', NEW.status));

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `leave_types`
--

DROP TABLE IF EXISTS `leave_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `default_days` int NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_types`
--

LOCK TABLES `leave_types` WRITE;
/*!40000 ALTER TABLE `leave_types` DISABLE KEYS */;
INSERT INTO `leave_types` VALUES (1,'Annual Leave',20,'Regular paid vacation leave','2025-04-15 20:20:18','2025-04-15 20:20:18'),(2,'Sick Leave',10,'Leave due to illness or medical reasons','2025-04-15 20:20:18','2025-04-15 20:20:18'),(3,'Personal Leave',5,'Leave for personal reasons','2025-04-15 20:20:18','2025-04-15 20:20:18'),(4,'Maternity Leave',90,'Leave for childbirth and child care','2025-04-15 20:20:18','2025-04-15 20:20:18');
/*!40000 ALTER TABLE `leave_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,1,'Welcome to the Company','Welcome aboard! Please complete your profile and review your information.',1,'2025-04-15 20:22:04'),(2,2,'Welcome to the Company','Welcome aboard! Please complete your profile and review your information.',1,'2025-04-15 20:22:04'),(3,2,'Project Assignment','You have been assigned to project: DBMS with role: Dev starting from 16 April 2025',1,'2025-04-15 21:14:07'),(4,3,'Welcome to the Company','Welcome aboard! Please complete your profile and review your information.',1,'2025-04-15 21:47:42'),(5,1,'Leave Request Pending','A leave request from Jane Employee is pending your approval.',1,'2025-04-17 09:17:43'),(6,2,'Leave Request Approved','Your leave request from 18 April 2025 to 21 April 2025 has been approved.',1,'2025-04-17 09:18:36'),(7,2,'Leave Request Approved','Your leave request from Fri Apr 18 2025 00:00:00 GMT+0530 (India Standard Time) to Mon Apr 21 2025 00:00:00 GMT+0530 (India Standard Time) has been approved. Comment: Approved by supervisor',1,'2025-04-17 09:18:36'),(8,1,'Leave Request Pending','A leave request from Jane Employee is pending your approval.',1,'2025-04-17 10:08:09'),(9,2,'Leave Request Approved','Your leave request from 27 April 2025 to 29 April 2025 has been approved.',1,'2025-04-17 10:18:07'),(10,2,'Leave Request Approved','Your leave request from Sun Apr 27 2025 00:00:00 GMT+0530 (India Standard Time) to Tue Apr 29 2025 00:00:00 GMT+0530 (India Standard Time) has been approved. Comment: Approved by supervisor',1,'2025-04-17 10:18:07'),(11,2,'Leave Request Approved','Your leave request from 18 April 2025 to 21 April 2025 has been approved.',1,'2025-04-17 11:23:13'),(12,2,'Leave Request Approved','Your leave request from Fri Apr 18 2025 00:00:00 GMT+0530 (India Standard Time) to Mon Apr 21 2025 00:00:00 GMT+0530 (India Standard Time) has been approved. Comment: Approved by supervisor',1,'2025-04-17 11:23:13'),(13,2,'Leave Request Approved','Your leave request from 27 April 2025 to 29 April 2025 has been approved.',1,'2025-04-17 11:23:14'),(14,2,'Leave Request Approved','Your leave request from Sun Apr 27 2025 00:00:00 GMT+0530 (India Standard Time) to Tue Apr 29 2025 00:00:00 GMT+0530 (India Standard Time) has been approved. Comment: Approved by supervisor',1,'2025-04-17 11:23:14');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `performance_reviews`
--

DROP TABLE IF EXISTS `performance_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `performance_reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `reviewer_id` int NOT NULL,
  `review_period_start` date NOT NULL,
  `review_period_end` date NOT NULL,
  `rating` decimal(3,2) DEFAULT NULL,
  `comments` text,
  `status` enum('draft','submitted','acknowledged','completed') DEFAULT 'draft',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  KEY `reviewer_id` (`reviewer_id`),
  CONSTRAINT `performance_reviews_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  CONSTRAINT `performance_reviews_ibfk_2` FOREIGN KEY (`reviewer_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `performance_reviews`
--

LOCK TABLES `performance_reviews` WRITE;
/*!40000 ALTER TABLE `performance_reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `performance_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_assignments`
--

DROP TABLE IF EXISTS `project_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `employee_id` int NOT NULL,
  `role` varchar(100) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `project_id` (`project_id`,`employee_id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `project_assignments_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  CONSTRAINT `project_assignments_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_assignments`
--

LOCK TABLES `project_assignments` WRITE;
/*!40000 ALTER TABLE `project_assignments` DISABLE KEYS */;
INSERT INTO `project_assignments` VALUES (1,1,2,'Dev','2025-04-16','2025-05-16','2025-04-15 21:14:07','2025-04-15 21:14:07');
/*!40000 ALTER TABLE `project_assignments` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_project_assignment` AFTER INSERT ON `project_assignments` FOR EACH ROW BEGIN
DECLARE project_name VARCHAR(100);

-- Get project name
SELECT name INTO project_name FROM projects WHERE id = NEW.project_id;

-- Create a notification
INSERT INTO notifications (employee_id, title, message)
VALUES (NEW.employee_id, 'Project Assignment',
CONCAT('You have been assigned to project: ', project_name,
' with role: ', NEW.role,
' starting from ', DATE_FORMAT(NEW.start_date, '%d %M %Y')));

-- Log the assignment
INSERT INTO system_logs (user_id, action, entity, entity_id, details)
VALUES (NULL, 'CREATE', 'project_assignments', NEW.id,
CONCAT('Employee ID ', NEW.employee_id, ' assigned to project: ', project_name));
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('planning','in-progress','completed','on-hold') DEFAULT 'planning',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES (1,'DBMS','EMS','2025-04-15','2025-05-15','on-hold','2025-04-15 20:56:06','2025-04-15 21:28:46');
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotion_history`
--

DROP TABLE IF EXISTS `promotion_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotion_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `from_designation_id` int NOT NULL,
  `to_designation_id` int NOT NULL,
  `effective_date` date NOT NULL,
  `reason` text,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  KEY `from_designation_id` (`from_designation_id`),
  KEY `to_designation_id` (`to_designation_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `promotion_history_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  CONSTRAINT `promotion_history_ibfk_2` FOREIGN KEY (`from_designation_id`) REFERENCES `designations` (`id`),
  CONSTRAINT `promotion_history_ibfk_3` FOREIGN KEY (`to_designation_id`) REFERENCES `designations` (`id`),
  CONSTRAINT `promotion_history_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotion_history`
--

LOCK TABLES `promotion_history` WRITE;
/*!40000 ALTER TABLE `promotion_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `promotion_history` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_promotion_insert` AFTER INSERT ON `promotion_history` FOR EACH ROW BEGIN
DECLARE from_designation VARCHAR(100);
DECLARE to_designation VARCHAR(100);
DECLARE employee_name VARCHAR(101);

-- Get designation names
SELECT name INTO from_designation FROM designations WHERE id = NEW.from_designation_id;
SELECT name INTO to_designation FROM designations WHERE id = NEW.to_designation_id;

-- Get employee name
SELECT CONCAT(first_name, ' ', last_name) INTO employee_name FROM employees WHERE id = NEW.employee_id;

 
-- Create a notification
INSERT INTO notifications (employee_id, title, message)
VALUES (NEW.employee_id, 'Promotion Notification',
CONCAT('Congratulations! You have been promoted from ', from_designation, ' to ', to_designation, ' effective ', DATE_FORMAT(NEW.effective_date, '%d %M %Y'), '.'));

-- Log the promotion
INSERT INTO system_logs (user_id, action, entity, entity_id, details)
VALUES (NEW.created_by, 'CREATE', 'promotion_history', NEW.id,
CONCAT('Employee ', employee_name, ' promoted from ', from_designation, ' to ', to_designation));
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Admin','Administrator with all privileges','2025-04-15 20:20:18','2025-04-15 20:20:18'),(2,'Manager','Department manager role','2025-04-15 20:20:18','2025-04-15 20:20:18'),(3,'Supervisor','Team supervisor role','2025-04-15 20:20:18','2025-04-15 20:20:18'),(4,'Regular Employee','Regular employee role','2025-04-15 20:20:18','2025-04-15 20:20:18');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salary_history`
--

DROP TABLE IF EXISTS `salary_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salary_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `effective_date` date NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `salary_history_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  CONSTRAINT `salary_history_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salary_history`
--

LOCK TABLES `salary_history` WRITE;
/*!40000 ALTER TABLE `salary_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `salary_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `skills`
--

DROP TABLE IF EXISTS `skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `skills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `skills`
--

LOCK TABLES `skills` WRITE;
/*!40000 ALTER TABLE `skills` DISABLE KEYS */;
INSERT INTO `skills` VALUES (1,'HTML',NULL,NULL,'2025-04-19 18:45:46','2025-04-19 18:45:46'),(2,'JS',NULL,NULL,'2025-04-19 18:52:56','2025-04-19 18:52:56'),(3,'CSS',NULL,NULL,'2025-04-19 18:53:52','2025-04-19 18:53:52'),(4,'React',NULL,NULL,'2025-04-19 18:54:02','2025-04-19 18:54:02');
/*!40000 ALTER TABLE `skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_logs`
--

DROP TABLE IF EXISTS `system_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `entity` varchar(100) DEFAULT NULL,
  `entity_id` int DEFAULT NULL,
  `details` text,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `system_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_logs`
--

LOCK TABLES `system_logs` WRITE;
/*!40000 ALTER TABLE `system_logs` DISABLE KEYS */;
INSERT INTO `system_logs` VALUES (1,NULL,'CREATE','employees',1,'New employee created: John Supervisor',NULL,NULL,'2025-04-15 20:22:04'),(2,NULL,'CREATE','employees',2,'New employee created: Jane Employee',NULL,NULL,'2025-04-15 20:22:04'),(3,1,'CREATE','projects',1,'Project created: DBMS',NULL,NULL,'2025-04-15 20:56:06'),(4,NULL,'CREATE','project_assignments',1,'Employee ID 2 assigned to project: DBMS',NULL,NULL,'2025-04-15 21:14:07'),(5,1,'UPDATE','projects',1,'Project updated: {\"name\":\"DBMS\",\"description\":\"EMS\",\"start_date\":\"2025-04-15\",\"end_date\":\"2025-05-15\",\"status\":\"on-hold\"}',NULL,NULL,'2025-04-15 21:28:46'),(6,NULL,'CREATE','employees',3,'New employee created: Vaibhav Thakur',NULL,NULL,'2025-04-15 21:47:42'),(7,1,'UPDATE','leave_requests',1,'Leave request status changed from pending to approved',NULL,NULL,'2025-04-17 09:18:36'),(8,1,'UPDATE','leave_requests',2,'Leave request status changed from pending to approved',NULL,NULL,'2025-04-17 10:18:07'),(9,NULL,'UPDATE','leave_requests',1,'Leave request status changed from approved to pending',NULL,NULL,'2025-04-17 11:23:01'),(10,NULL,'UPDATE','leave_requests',2,'Leave request status changed from approved to pending',NULL,NULL,'2025-04-17 11:23:01'),(11,1,'UPDATE','leave_requests',1,'Leave request status changed from pending to approved',NULL,NULL,'2025-04-17 11:23:13'),(12,1,'UPDATE','leave_requests',2,'Leave request status changed from pending to approved',NULL,NULL,'2025-04-17 11:23:14'),(13,3,'UPDATE','employees',3,'Updated fields: address, emergency_contact',NULL,NULL,'2025-04-19 20:18:48');
/*!40000 ALTER TABLE `system_logs` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-20 16:38:51
