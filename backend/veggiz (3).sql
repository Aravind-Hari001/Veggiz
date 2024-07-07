-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 07, 2024 at 07:51 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `veggiz`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `mobile` varchar(10) NOT NULL,
  `password` varchar(15) NOT NULL,
  `status` varchar(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `mobile`, `password`, `status`) VALUES
(1, '1234567890', 'admin001', '0'),
(2, '1234509876', 'delivery001', '1');

-- --------------------------------------------------------

--
-- Table structure for table `catagories`
--

CREATE TABLE `catagories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `group_id` int(11) NOT NULL,
  `name` varchar(15) NOT NULL,
  `image` varchar(50) NOT NULL,
  `show` int(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `catagories`
--

INSERT INTO `catagories` (`id`, `group_id`, `name`, `image`, `show`) VALUES
(1, 10, 'rice', 'b5rice2.avif', 1),
(2, 10, 'milk', 'b97milk2.avif', 1),
(4, 10, 'Cookies', 'b15cookie.avif', 1),
(12, 3, 'dog foods', 'g77dog food.avif', 1),
(14, 10, 'Ice Creame', 'g87cookie.avif', 0);

-- --------------------------------------------------------

--
-- Table structure for table `group`
--

CREATE TABLE `group` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `group`
--

INSERT INTO `group` (`id`, `name`) VALUES
(3, 'animal food'),
(10, 'Organic');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(5) NOT NULL,
  `product` varchar(225) NOT NULL,
  `price` varchar(5) NOT NULL,
  `payment` varchar(1) NOT NULL,
  `payment_type` varchar(1) NOT NULL,
  `pay_id` varchar(20) NOT NULL,
  `delivery_status` int(1) NOT NULL DEFAULT 0,
  `date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `product`, `price`, `payment`, `payment_type`, `pay_id`, `delivery_status`, `date`) VALUES
(4, 2, '17:1;29:1;27:1;=0', '583', '0', '', '', 0, '2024-03-04 02:48:30'),
(32, 3, '17:1;27:1;=0', '485', '0', '1', '', 0, '2024-03-05 07:01:53'),
(33, 3, '17:1;27:1;=0', '485', '0', '1', '', 0, '2024-03-05 07:03:54'),
(39, 5, '17:1;27:1;=0', '485', '0', '1', '', 0, '2024-03-05 07:23:42'),
(79, 23, '7:1:0;19:1:0;=0', '350', '0', '0', '0', 0, '2024-06-05 15:48:02'),
(80, 23, '16:1:0;19:1:0;=0', '350', '0', '0', '0', 0, '2024-06-05 15:51:41'),
(81, 23, '19:1:0;=0', '350', '0', '0', '0', 0, '2024-06-05 15:54:03'),
(84, 23, '19:1:0;=0', '350', '0', '0', '0', 0, '2024-06-07 06:25:21'),
(85, 23, '7:3:0;=0', '108', '0', '0', '0', 0, '2024-06-07 07:02:45'),
(86, 23, '7:3:0;=0', '108', '0', '0', '0', 0, '2024-06-07 07:03:54'),
(89, 33, '19:1:0;=0', '350', '0', '0', '0', 0, '2024-06-07 08:22:23'),
(90, 34, '19:1:0;=0', '350', '0', '0', '0', 0, '2024-06-07 08:28:45'),
(91, 35, '19:1:0;=0', '350', '0', '0', '0', 0, '2024-06-07 08:31:24');

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE `product` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `catagory_id` int(4) NOT NULL,
  `product_name` varchar(50) NOT NULL,
  `price` varchar(20) NOT NULL,
  `measures` varchar(20) NOT NULL,
  `discount` int(2) NOT NULL,
  `image` varchar(50) NOT NULL,
  `veg` int(1) NOT NULL,
  `life_time` varchar(8) NOT NULL,
  `orgin` varchar(15) NOT NULL,
  `package_type` varchar(15) NOT NULL,
  `description` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`id`, `catagory_id`, `product_name`, `price`, `measures`, `discount`, `image`, `veg`, `life_time`, `orgin`, `package_type`, `description`) VALUES
(7, 2, 'avinn milk', '40;50;60', '250ml;350ml;500ml', 10, 'f31milk.avif', 1, '1 month', 'India', 'cover', ''),
(8, 1, 'ponni', '1000', '10kg', 2, 'j9rice3.avif', 0, '1 Year', 'India', 'Bag', ''),
(16, 2, 'arokiya milk', '50', '1Litter', 0, 'g15milk2.avif', 1, '1 month', 'India', 'cover', ''),
(17, 4, 'marry gold', '10;20', '200g;400g', 0, 'c40cookie.avif', 1, '5 month', 'India', 'Plastic Packet', 'undefined'),
(18, 2, 'abc milk', '10', '1Litter', 0, 'j33milk3.avif', 0, '1 month', 'India', 'cover', ''),
(19, 2, 'FC Full Cream', '350', '2Litter', 0, 'f34milk4.avif', 1, '', 'India', 'cover', ''),
(20, 2, 'Maaa milk', '60', '1 Litter', 2, 'g94milk5.avif', 1, '', 'India', 'cover', ''),
(21, 2, 'KC milk', '70', '1 Litter', 0, 'i66milk6.avif', 1, '', 'India', 'packet', ''),
(22, 2, 'Vennila', '70', '1 Litter', 0, 'j24milk7.avif', 0, '1 month', 'India', 'Cover', ''),
(23, 2, 'AKG Milk', '98', '2 Litter', 0, 'd68milk8.avif', 1, '', 'India', 'Cover', ''),
(24, 2, 'Hursha Full Cream Milk', '100', '1 Litter', 0, 'd7milk9.avif', 1, '', 'India', 'Cover', ''),
(25, 2, 'Gokulam Paall', '60', '1 Litter', 0, 'f81milk10.avif', 1, '', 'India', 'Cover', ''),
(26, 1, 'Basmathi', '1500', '5 Kg', 5, 'i37rice2.avif', 0, '1 Year', 'India', 'Bag', ''),
(27, 12, 'Dog Cookies', '500', '1kg', 5, 'g19dog cookie.avif', 1, '1 month', 'India', 'Glass Box', ''),
(28, 2, 'SriV Milk', '60', '1L', 5, 'e50milk11.avif', 1, '', 'India', 'Cover', ''),
(29, 12, 'Dog Chocolate', '100', '1 pack', 2, 'f26dog coocklet.avif', 1, '10 month', 'India', 'Wrapper', '');

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `amount` varchar(6) NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sales`
--

INSERT INTO `sales` (`id`, `amount`, `date`) VALUES
(1, '108', '2024-03-07 07:20:07'),
(2, '583', '2024-03-07 07:21:03'),
(3, '583', '2024-03-07 07:25:06'),
(4, '485', '2024-03-07 07:25:53'),
(5, '108', '2024-03-07 07:30:47'),
(7, '108', '2024-03-08 06:47:46'),
(8, '485', '2024-03-08 08:13:46'),
(9, '485', '2024-03-08 08:18:11'),
(10, '485', '2024-03-08 08:18:14'),
(11, '485', '2024-03-08 08:18:15'),
(12, '485', '2024-03-08 08:22:51'),
(13, '485', '2024-03-08 08:24:28'),
(14, '108', '2024-03-08 08:26:10'),
(15, '108', '2024-03-08 08:28:21'),
(16, '485', '2024-03-08 08:28:47'),
(17, '485', '2024-03-08 08:29:03'),
(18, '485', '2024-03-08 08:29:12'),
(19, '108', '2024-03-08 08:30:04'),
(20, '108', '2024-03-08 08:30:08'),
(21, '108', '2024-03-08 08:30:11'),
(22, '108', '2024-03-08 08:30:15'),
(23, '108', '2024-03-08 08:30:22'),
(24, '108', '2024-03-08 08:30:36'),
(25, '485', '2024-03-08 10:24:45'),
(26, '1000', '2024-03-08 10:33:35'),
(27, '108', '2024-03-08 10:35:42'),
(28, '583', '2024-03-08 11:35:13'),
(29, '485', '2024-03-08 11:35:18'),
(30, '2978', '2024-03-10 12:36:48'),
(31, '1000', '2024-03-10 12:38:22'),
(32, '1000', '2024-03-10 12:38:29'),
(33, '1058', '2024-03-15 03:11:54'),
(34, 'NaN', '2024-05-23 07:58:00'),
(35, '350', '2024-06-12 15:43:26'),
(36, '350', '2024-06-12 15:43:34');

-- --------------------------------------------------------

--
-- Table structure for table `tmp_user`
--

CREATE TABLE `tmp_user` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(25) NOT NULL,
  `mobile` varchar(10) NOT NULL,
  `address` varchar(50) NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tmp_user`
--

INSERT INTO `tmp_user` (`id`, `name`, `mobile`, `address`, `date`) VALUES
(25, 'dkj', '9876543210', 'hjhj', '2024-06-05 15:54:03'),
(27, 'dtrgfg', '9876543210', 'yjhh', '2024-06-05 16:00:02'),
(28, 'dsfmlk', '9876543210', 'jk', '2024-06-07 06:25:21'),
(29, 'dsf', '9876543210', 'dsf', '2024-06-07 07:02:45'),
(30, 'ggh', '9876543210', 'lhj', '2024-06-07 07:03:54'),
(31, 'rgj', '9876543210', 'hjvhbn', '2024-06-07 08:09:23'),
(33, 'saefg', '9876543250', 'jmn', '2024-06-07 08:22:23'),
(34, 'vvhhj', '8656000001', 'kbjjh', '2024-06-07 08:28:45'),
(35, 'bkjjn', '6567878990', 'jkb', '2024-06-07 08:31:24');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(25) NOT NULL,
  `mobile` varchar(10) NOT NULL,
  `email` varchar(30) NOT NULL,
  `address` varchar(50) NOT NULL,
  `password` varchar(15) NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `name`, `mobile`, `email`, `address`, `password`, `date`) VALUES
(3, 'Hari', '8976543210', 'abc@gmail.com', '9/23, Trp, Thayilpatti', 'abcd001@', '2024-03-03 12:47:13'),
(4, 'Krish', '9876543210', 'krish@gmail.com', '8/919, Sasinagar, sivakasi', 'abcd@001', '2024-03-14 06:20:20');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD UNIQUE KEY `id` (`id`);

--
-- Indexes for table `catagories`
--
ALTER TABLE `catagories`
  ADD UNIQUE KEY `id` (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `name_2` (`name`);

--
-- Indexes for table `group`
--
ALTER TABLE `group`
  ADD UNIQUE KEY `id` (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `name_2` (`name`),
  ADD UNIQUE KEY `name_3` (`name`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD UNIQUE KEY `id` (`id`);

--
-- Indexes for table `product`
--
ALTER TABLE `product`
  ADD UNIQUE KEY `id` (`id`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD UNIQUE KEY `id` (`id`);

--
-- Indexes for table `tmp_user`
--
ALTER TABLE `tmp_user`
  ADD UNIQUE KEY `id` (`id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD UNIQUE KEY `id` (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `mobile` (`mobile`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `catagories`
--
ALTER TABLE `catagories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `group`
--
ALTER TABLE `group`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=92;

--
-- AUTO_INCREMENT for table `product`
--
ALTER TABLE `product`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `tmp_user`
--
ALTER TABLE `tmp_user`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
