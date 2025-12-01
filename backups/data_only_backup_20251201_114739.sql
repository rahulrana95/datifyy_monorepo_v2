--
-- PostgreSQL database dump
--

\restrict OIbugYd4fRAtURglDBsP00dsbb0vE1EUxwj8iJ5lg8Tro9P4gpbnbrJ6QI5ytnO

-- Dumped from database version 15.14
-- Dumped by pg_dump version 15.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: devuser
--

INSERT INTO public.users VALUES (1, 'admin@datifyy.com', 'Admin User', '2025-11-11 15:40:19.726084', '2025-11-11 15:40:19.726084', NULL, NULL, false, false, 'PENDING', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (2, 'test@datifyy.com', 'Test User', '2025-11-11 15:40:19.726084', '2025-11-11 15:40:19.726084', NULL, NULL, false, false, 'PENDING', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (3, 'john.doe@example.com', 'John Doe', '2025-10-12 18:59:01.816787', '2025-11-11 18:59:01.816787', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTZnu', NULL, true, false, 'ACTIVE', NULL, NULL, NULL, NULL, NULL, 'https://i.pravatar.cc/300?img=12', '1995-06-15', 'MALE');
INSERT INTO public.users VALUES (4, 'sarah.johnson@example.com', 'Sarah Johnson', '2025-10-17 18:59:01.816787', '2025-11-11 18:59:01.816787', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTZnu', NULL, true, false, 'ACTIVE', NULL, NULL, NULL, NULL, NULL, 'https://i.pravatar.cc/300?img=5', '1997-03-22', 'FEMALE');
INSERT INTO public.users VALUES (5, 'rahul.sharma@example.com', 'Rahul Sharma', '2025-10-22 18:59:01.816787', '2025-11-11 18:59:01.816787', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTZnu', NULL, true, false, 'ACTIVE', NULL, NULL, NULL, NULL, NULL, 'https://i.pravatar.cc/300?img=33', '1991-11-08', 'MALE');
INSERT INTO public.users VALUES (6, 'priya.patel@example.com', 'Priya Patel', '2025-10-27 18:59:01.816787', '2025-11-11 18:59:01.816787', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTZnu', NULL, true, false, 'ACTIVE', NULL, NULL, NULL, NULL, NULL, 'https://i.pravatar.cc/300?img=9', '1994-07-30', 'FEMALE');
INSERT INTO public.users VALUES (7, 'michael.chen@example.com', 'Michael Chen', '2025-11-01 18:59:01.816787', '2025-11-11 18:59:01.816787', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTZnu', NULL, true, false, 'ACTIVE', NULL, NULL, NULL, NULL, NULL, 'https://i.pravatar.cc/300?img=15', '1988-01-12', 'MALE');
INSERT INTO public.users VALUES (8, 'emily.williams@example.com', 'Emily Williams', '2025-11-04 18:59:01.816787', '2025-11-11 18:59:01.816787', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTZnu', NULL, true, false, 'ACTIVE', NULL, NULL, NULL, NULL, NULL, 'https://i.pravatar.cc/300?img=20', '1996-09-18', 'FEMALE');
INSERT INTO public.users VALUES (9, 'arjun.mehta@example.com', 'Arjun Mehta', '2025-11-06 18:59:01.816787', '2025-11-11 18:59:01.816787', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTZnu', NULL, true, false, 'ACTIVE', NULL, NULL, NULL, NULL, NULL, 'https://i.pravatar.cc/300?img=51', '1993-04-25', 'MALE');
INSERT INTO public.users VALUES (10, 'lisa.anderson@example.com', 'Lisa Anderson', '2025-11-08 18:59:01.816787', '2025-11-11 18:59:01.816787', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTZnu', NULL, true, false, 'ACTIVE', NULL, NULL, NULL, NULL, NULL, 'https://i.pravatar.cc/300?img=10', '1992-12-03', 'FEMALE');
INSERT INTO public.users VALUES (11, 'david.kumar@example.com', 'David Kumar', '2025-11-09 18:59:01.816787', '2025-11-11 18:59:01.816787', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTZnu', NULL, true, false, 'ACTIVE', NULL, NULL, NULL, NULL, NULL, 'https://i.pravatar.cc/300?img=68', '1995-08-14', 'MALE');
INSERT INTO public.users VALUES (12, 'aisha.khan@example.com', 'Aisha Khan', '2025-11-10 18:59:01.816787', '2025-11-11 18:59:01.816787', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTZnu', NULL, true, false, 'ACTIVE', NULL, NULL, NULL, NULL, NULL, 'https://i.pravatar.cc/300?img=16', '1998-02-20', 'FEMALE');
INSERT INTO public.users VALUES (13, 'pending.user@example.com', 'Pending User', '2025-11-11 18:59:01.816787', '2025-11-11 18:59:01.816787', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTZnu', NULL, false, false, 'PENDING', NULL, NULL, NULL, NULL, NULL, NULL, '1996-05-10', 'MALE');
INSERT INTO public.users VALUES (18, 'testuser456@example.com', 'Test User', '2025-11-11 19:20:40.605935', '2025-11-11 19:20:40.605935', '$2a$12$FaJuUrOlT77SCtOpu6Gh1uW2b2/iY8Fjyf6shKDx58noLJerEUS9G', NULL, false, false, 'PENDING', 'z0iv4FYq7itrcCGgDvzNwr68WZC8XOtWAC9XglbHh4c=', '2025-11-12 19:20:40.587578', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (19, 'grpcuser4@example.com', 'gRPC User 4', '2025-11-11 19:23:23.596804', '2025-11-11 19:23:23.596804', '$2a$12$sVuAyfBFkwCN86AutFoKAO5jjrlrp4utsE0ra8X8fJfhE3E8A6jJ2', NULL, false, false, 'PENDING', 'unAqt9duYBSPePKbpf-B-fhcv5Jdmz3_EBlX6ICvOjU=', '2025-11-12 19:23:23.579596', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (20, 'admin@admin.com', 'Test User', '2025-11-11 19:31:06.744241', '2025-11-11 19:31:06.744241', '$2a$12$fZed.UNu34qsFmAKp5EOu.E9KFn0jVFusVze3M8xR8.fFrQL/ZIPK', NULL, false, false, 'PENDING', '4qdFVG8aFTzEdgL-9JYpOv3flVuZ127edtbN_lRFTTM=', '2025-11-12 19:31:06.730736', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (21, 'grpcui@example.com', 'gRPC UI User
gRPC UI User', '2025-11-11 19:37:20.504669', '2025-11-11 19:37:20.504669', '$2a$12$GxdPMP2IAe7OB.OiXCXJpuKHoGdVyWS5O3qMm87KMdSvWV87UEp5i', NULL, false, false, 'PENDING', 'UxRj58qRJZPl9oivrL95s3PdTkTvwf9KJT4wdtWRMiI=', '2025-11-12 19:37:20.496773', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (105, 'test2@test.com', 'Sarah Anderson', '2025-11-23 10:56:12.342789', '2025-11-23 10:56:12.342789', 'hashedpassword', NULL, true, false, 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, '1995-03-15', 'FEMALE');
INSERT INTO public.users VALUES (106, 'test3@test.com', 'Michael Chen', '2025-11-23 10:56:43.518281', '2025-11-23 10:56:43.518281', 'hashedpassword', NULL, true, false, 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, '1992-07-20', 'MALE');
INSERT INTO public.users VALUES (26, 'manualtest@example.com', 'Manual Test User', '2025-11-12 15:53:31.044348', '2025-11-12 16:03:11.17253', '$2a$12$hrZ9bM0u4kEjF2Po0SASYOa92zXyggdPzmzqQukmoi/DnUSar3Cgu', NULL, false, false, 'PENDING', 'O7x40Q00YauiC8uxDqZ9Pep7qIBJ2JDGyzJE8bSBzwc=', '2025-11-13 15:53:31.030147', NULL, NULL, '2025-11-12 16:03:11.17253', NULL, NULL, NULL);
INSERT INTO public.users VALUES (51, 'test1@test.com', 'RahulRana', '2025-11-12 19:10:35.015309', '2025-11-23 11:08:48.095731', '$2a$12$FI6smULLudcO3Tc46r3FreJCtr1.kK.UIS3mEaA9CZQqaJ6EooISW', '+1234567890', false, false, 'ACTIVE', '8qEvVzSc4U908Q0RXdTT2a8LzgreCMKGEJUO7ZCM5ks=', '2025-11-13 19:10:34.957817', NULL, NULL, '2025-11-19 14:44:22.128821', NULL, '1995-05-10', 'MALE');
INSERT INTO public.users VALUES (52, 'a@b.com', 'Priya', '2025-11-12 19:31:37.332602', '2025-11-23 12:21:04.937978', '$2a$12$eripeSKhwTfgvsKCVUAnuOklgDX5WwVi8fbpSAcvnOh4/9CwA0VEe', NULL, false, false, 'PENDING', '4jgFejnKkqYjX1Ym8LY5ar2u27hvFpEF6GJNS8MIMyE=', '2025-11-13 19:31:37.277927', NULL, NULL, '2025-11-12 19:32:00.579457', NULL, NULL, 'FEMALE');
INSERT INTO public.users VALUES (53, 'partnertest@example.com', 'Partner Test', '2025-11-16 14:44:04.479886', '2025-11-23 12:21:04.941972', '$2a$12$vDV9fg0SFym9QBOMzZ5hK.jrZW2TOE7pMzBuyREzzhDo/K3Ea4OsK', NULL, false, false, 'PENDING', 'qWNo0uTowS1ii_oBjTMd7Qkjq7_IJ1VbP3sFs4dctbY=', '2025-11-17 14:44:04.473425', NULL, NULL, NULL, NULL, NULL, 'FEMALE');
INSERT INTO public.users VALUES (43, 'integration-1762969793@example.com', 'Test User', '2025-11-12 17:49:53.887533', '2025-11-12 17:49:53.887533', 'hash', NULL, true, false, 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (45, 'blocker-1762969793@example.com', 'Test User', '2025-11-12 17:49:53.959648', '2025-11-12 17:49:53.959648', 'hash', NULL, true, false, 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (46, 'blocked-1762969793@example.com', 'Test User', '2025-11-12 17:49:53.964557', '2025-11-12 17:49:53.964557', 'hash', NULL, true, false, 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (47, 'reporter-1762969793@example.com', 'Test User', '2025-11-12 17:49:53.990741', '2025-11-12 17:49:53.990741', 'hash', NULL, true, false, 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (48, 'reported-1762969793@example.com', 'Test User', '2025-11-12 17:49:54.004669', '2025-11-12 17:49:54.004669', 'hash', NULL, true, false, 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (49, 'prefs-1762969794@example.com', 'Test User', '2025-11-12 17:49:54.031753', '2025-11-12 17:49:54.031753', 'hash', NULL, true, false, 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (50, 'userprefs-1762969794@example.com', 'Test User', '2025-11-12 17:49:54.05222', '2025-11-12 17:49:54.05222', 'hash', NULL, true, false, 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (54, 'testcurl@example.com', 'Test User', '2025-11-19 12:51:24.612403', '2025-11-19 12:51:24.612403', '$2a$12$WOHEpSkHOv9I5jJedwLB.ujXHRgoC5.pE5ZS1LhOey13VDU8Wcp76', NULL, false, false, 'PENDING', 'kaXFrvPcbpOdhndvge_nkIes5xQgdnT0QYC35gAexX8=', '2025-11-20 12:51:24.523861', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (55, 'test-prefs-1732027201@example.com', 'Test User', '2025-11-19 16:12:56.555309', '2025-11-19 16:12:56.555309', '$2a$12$JIKkmL2S2z13nKuk5Qm59eNfLhuTjbBgk2g17DNPlgm52QLFY.rvC', NULL, false, false, 'PENDING', 'g6B2IqOEYSkACP63b4PfDopLiq94fPnxzFzh6XiSOkw=', '2025-11-20 16:12:56.52144', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (56, 'test-camel-case@example.com', 'Test User', '2025-11-19 16:22:33.72925', '2025-11-19 16:22:33.72925', '$2a$12$.NfBPqD31ckHE/77fSMxr.7fxECyzvlMgrYQr0A85Ai14t7LVQS6a', NULL, false, false, 'PENDING', 'E-DtI7t0XoqdKBxk4NoG30Mp_ldsHw9UpZH88cYwnTY=', '2025-11-20 16:22:33.70945', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (90, 'test_admin_curation_1@test.com', 'Alice', '2025-11-23 09:41:37.372895', '2025-11-23 09:41:37.372895', 'hashedpassword', NULL, true, false, 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, '1997-11-23', 'FEMALE');
INSERT INTO public.users VALUES (91, 'test_admin_curation_2@test.com', 'Bob', '2025-11-23 09:41:37.379936', '2025-11-23 09:41:37.379936', 'hashedpassword', NULL, true, false, 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, '1995-11-23', 'MALE');
INSERT INTO public.users VALUES (92, 'test_admin_curation_3@test.com', 'Charlie', '2025-11-23 09:41:37.385622', '2025-11-23 09:41:37.385622', 'hashedpassword', NULL, true, false, 'ACTIVE', NULL, NULL, NULL, NULL, NULL, NULL, '2000-11-23', 'MALE');


--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: devuser
--

INSERT INTO public.admin_users VALUES (2, NULL, 'genie@datifyy.com', 'Date Genie', '$2a$12$i2WwSQr28rSRUEPGS5gd7e6tzwuO1QVDqa66zqwCM9i5/FJefgG4.', 'genie', true, true, NULL, '2025-11-19 19:46:22.09501', '2025-11-19 19:53:26.061771', NULL);
INSERT INTO public.admin_users VALUES (1, NULL, 'admin@datifyy.com', 'Super Admin', '$2a$12$i2WwSQr28rSRUEPGS5gd7e6tzwuO1QVDqa66zqwCM9i5/FJefgG4.', 'super_admin', true, true, '2025-11-19 21:08:15.077625', '2025-11-19 19:46:22.085273', '2025-11-19 21:08:15.077625', NULL);


--
-- Data for Name: admin_sessions; Type: TABLE DATA; Schema: public; Owner: devuser
--



--
-- Data for Name: availability_slots; Type: TABLE DATA; Schema: public; Owner: devuser
--

INSERT INTO public.availability_slots VALUES (61, 51, 1764073800, 1764077400, 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-23 10:55:58.602821+00', '2025-11-23 10:55:58.602821+00');
INSERT INTO public.availability_slots VALUES (62, 51, 1764160200, 1764163800, 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-23 10:55:58.602821+00', '2025-11-23 10:55:58.602821+00');
INSERT INTO public.availability_slots VALUES (63, 51, 1764246600, 1764250200, 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-23 10:55:58.602821+00', '2025-11-23 10:55:58.602821+00');
INSERT INTO public.availability_slots VALUES (64, 51, 1764333000, 1764336600, 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-23 10:55:58.602821+00', '2025-11-23 10:55:58.602821+00');
INSERT INTO public.availability_slots VALUES (65, 51, 1764419400, 1764423000, 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-23 10:55:58.602821+00', '2025-11-23 10:55:58.602821+00');
INSERT INTO public.availability_slots VALUES (66, 51, 1764505800, 1764509400, 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-23 10:55:58.602821+00', '2025-11-23 10:55:58.602821+00');
INSERT INTO public.availability_slots VALUES (67, 51, 1764592200, 1764595800, 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-23 10:55:58.602821+00', '2025-11-23 10:55:58.602821+00');
INSERT INTO public.availability_slots VALUES (68, 105, 1764073800, 1764077400, 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-23 10:56:27.934923+00', '2025-11-23 10:56:27.934923+00');
INSERT INTO public.availability_slots VALUES (69, 105, 1764160200, 1764163800, 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-23 10:56:27.934923+00', '2025-11-23 10:56:27.934923+00');
INSERT INTO public.availability_slots VALUES (70, 105, 1764246600, 1764250200, 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-23 10:56:27.934923+00', '2025-11-23 10:56:27.934923+00');
INSERT INTO public.availability_slots VALUES (71, 106, 1764073800, 1764077400, 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-23 10:56:43.529556+00', '2025-11-23 10:56:43.529556+00');
INSERT INTO public.availability_slots VALUES (72, 106, 1764160200, 1764163800, 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-23 10:56:43.529556+00', '2025-11-23 10:56:43.529556+00');
INSERT INTO public.availability_slots VALUES (73, 106, 1764246600, 1764250200, 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-23 10:56:43.529556+00', '2025-11-23 10:56:43.529556+00');
INSERT INTO public.availability_slots VALUES (74, 106, 1764333000, 1764336600, 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-23 10:56:43.529556+00', '2025-11-23 10:56:43.529556+00');
INSERT INTO public.availability_slots VALUES (76, 52, 1764007200, 1764010800, 'online', NULL, NULL, 'Mumbai', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-23 12:24:09.857537+00', '2025-11-23 12:24:09.857537+00');
INSERT INTO public.availability_slots VALUES (77, 52, 1764093600, 1764097200, 'online', NULL, NULL, 'Mumbai', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-23 12:24:09.857537+00', '2025-11-23 12:24:09.857537+00');
INSERT INTO public.availability_slots VALUES (78, 52, 1764180000, 1764183600, 'online', NULL, NULL, 'Mumbai', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-23 12:24:09.857537+00', '2025-11-23 12:24:09.857537+00');
INSERT INTO public.availability_slots VALUES (79, 53, 1764010800, 1764014400, 'online', NULL, NULL, 'Delhi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-23 12:24:09.857537+00', '2025-11-23 12:24:09.857537+00');
INSERT INTO public.availability_slots VALUES (80, 53, 1764097200, 1764100800, 'online', NULL, NULL, 'Delhi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-23 12:24:09.857537+00', '2025-11-23 12:24:09.857537+00');
INSERT INTO public.availability_slots VALUES (81, 53, 1764270000, 1764273600, 'online', NULL, NULL, 'Delhi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-23 12:24:09.857537+00', '2025-11-23 12:24:09.857537+00');


--
-- Data for Name: scheduled_dates; Type: TABLE DATA; Schema: public; Owner: devuser
--

INSERT INTO public.scheduled_dates VALUES (1, 3, 105, 1, '2025-11-25 19:00:00', 60, 'scheduled', 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Google Meet: https://meet.google.com/datifyy-1764097200-J

Calendar Info:
📅 Date Details:
• When: Tuesday, November 25, 2025 at 7:00 PM UTC
• Duration: 60 minutes
• End Time: 8:00 PM UTC
• Participants: John Doe & Sarah Anderson
• Location: https://meet.google.com/datifyy-1764097200-J

This is your Datifyy curated date! 💝
', 'Scheduled by genie 1 from curated match 13', '2025-11-23 16:55:58.097453', '2025-11-23 16:55:58.097453', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: curated_matches; Type: TABLE DATA; Schema: public; Owner: devuser
--

INSERT INTO public.curated_matches VALUES (10, 105, 106, 75.00, true, 'Sarah and Michael demonstrate strong compatibility across several key areas. They perfectly align on age preferences, with both individuals falling squarely within each other''s desired age ranges. Their gender preferences are also a perfect match. Lifestyle compatibility, specifically regarding drinking habits, is excellent as both state ''Socially'' and prefer a partner with the same habit. A significant positive is their shared interest in ''travel,'' providing a strong common ground for joint activities and experiences. While their education levels differ (Masters vs. Bachelors), neither has an explicit preference, preventing this from being a mismatch. Similarly, their primary occupations and some interests (photography, yoga for Sarah; coding, fitness for Michael) diverge, but these can be seen as opportunities for new shared experiences or respected individual pursuits rather than incompatibilities. The lack of location information prevents an assessment in that area. Overall, the mutual fulfillment of core preferences, especially age, gender, and lifestyle, along with a shared prominent interest, points to a high potential for a successful romantic match.', '{"Age Compatibility","Gender Preference Match","Shared Interest: Travel","Lifestyle Compatibility (Drinking Socially)","Mutual Fulfillment of Age Preference","Mutual Fulfillment of Gender Preference","Mutual Fulfillment of Lifestyle Preference"}', '{"Differing Primary Interests (e.g., photography/yoga vs. coding/fitness)","Differing Education Levels (no stated preference, but not identical)","Location (No information provided)"}', 'Gemini', 'gemini-1.5-flash', 'pending', 1, NULL, '2025-11-23 11:03:54.814531', '2025-11-23 11:03:54.814531');
INSERT INTO public.curated_matches VALUES (12, 105, 51, 10.00, false, 'The compatibility between Sarah Anderson and RahulRana is extremely low, primarily due to a critical discrepancy in RahulRana''s profile and a significant age preference mismatch from his side.

**Critical Profile Discrepancy:** RahulRana''s structured profile lists his age as 30, but his bio explicitly states: ''My name is Alex Chen, and I''m a 14-year-old...''. This contradiction raises serious concerns about the authenticity or accuracy of the profile, making any romantic match highly problematic.

**Age Compatibility:** While Sarah (30) falls perfectly within her preferred age range (25-35) for a partner like Rahul (30), Rahul''s age preference (34-40) is not met by Sarah (30). This indicates a significant barrier from Rahul''s perspective, as he is seeking an older partner.

**Gender Preference:** Both users'' gender preferences align. Sarah prefers males, and Rahul is male. Rahul''s preference (interpreted as female) is met by Sarah, who is female. This is the strongest point of mutual alignment.

**Shared Interests and Hobbies:** Sarah lists ''travel, photography, yoga'' as interests. Rahul''s interests field is empty. If the bio''s mention of ''robotics'' and ''soccer'' were to be considered (despite the age contradiction), there would still be no explicit shared interests. This lack of common ground in hobbies is a negative factor.

**Lifestyle Compatibility:** Both Sarah and Rahul state their drinking lifestyle as ''Socially'' or ''DRINKING_SOCIALLY'', which is a perfect match. Sarah''s preference for a socially drinking partner is also met.

**Location & Education:** No information is provided for location or education for Rahul, preventing assessment in these areas.

**Mutual Attraction Potential:** Sarah might find Rahul''s profile appealing based on his age, gender, and lifestyle matching her preferences. However, Rahul is highly unlikely to find Sarah appealing, as her age falls outside his stated preference. Furthermore, the significant profile discrepancy severely undermines any potential for mutual attraction or trust.', '{"User 1''s Age Preference (25-35) is met by User 2 (30)","User 1''s Gender Preference (MALE) is met by User 2 (MALE)","User 2''s Gender Preference (FEMALE) is met by User 1 (FEMALE)","Shared Lifestyle: Social Drinking","User 1''s Lifestyle Preference (Socially) is met by User 2 (Socially)"}', '{"User 2''s Age Preference (34-40) is NOT met by User 1 (30)","Lack of Explicit Shared Interests","User 2 Profile Discrepancy (Age 30 vs. Bio stating 14-year-old Alex Chen)","Unknown Location Compatibility","Unknown Education Compatibility"}', 'Gemini', 'gemini-1.5-flash', 'rejected', 1, NULL, '2025-11-23 11:09:21.091167', '2025-11-23 16:41:06.715975');
INSERT INTO public.curated_matches VALUES (11, 106, 51, 0.00, false, 'The compatibility between Michael Chen and User 2 (identified as RahulRana but self-described as Alex Chen, 14 years old) is extremely low, rendering a romantic match inappropriate and non-existent. The most critical factor is the severe age disparity: Michael is 33, while Alex is 14. This age gap makes a romantic relationship ethically problematic, and in many jurisdictions, illegal. Michael''s age preference (23-33) does not include Alex''s age (14), and Alex''s stated preference (34-40) does not include Michael''s age (33), indicating a mutual lack of age compatibility. Furthermore, Michael''s gender preference is ''FEMALE'', while Alex is ''MALE'', a direct mismatch. Although some superficial commonalities exist in interests (Michael''s ''coding'' and Alex''s ''robotics/programming''; Michael''s ''fitness'' and Alex''s ''soccer''), and ''Drinking: Socially'' is listed for both, the latter is a highly problematic and inconsistent data point for a 14-year-old and cannot be considered a genuine lifestyle match. The vast difference in life stages (adult vs. minor) and fundamental preferences completely override any minor shared interests.', '{"Interests (conceptual overlap in tech/programming and physical activity)","Lifestyle (Drinking: Socially - based on provided data, but inconsistent with User 2''s age)"}', '{"Age compatibility (severe mismatch, Michael 33 vs. Alex 14)","Gender preference match (Michael prefers FEMALE, Alex is MALE)","Life stage (adult vs. minor)","Mutual attraction potential (non-existent due to age and gender mismatches)","Ethical and legal considerations (romantic relationship between 33 and 14 is inappropriate)"}', 'Gemini', 'gemini-1.5-flash', 'review_later', 1, NULL, '2025-11-23 11:04:20.48204', '2025-11-23 16:41:11.975032');
INSERT INTO public.curated_matches VALUES (13, 3, 105, 85.00, true, 'John and Sarah demonstrate high compatibility across several critical factors, indicating strong potential for a romantic match. Their ages align perfectly, with both being 30 and falling precisely within each other''s preferred age ranges (John: 24-32; Sarah: 25-35). Gender preferences are also a direct match, with John being male and seeking a female partner, and Sarah being female and seeking a male partner. Furthermore, their lifestyles regarding alcohol consumption are identical, both stating ''Socially,'' which suggests shared social habits and expectations. A significant area of common ground lies in their shared passion for exploration and travel; John''s bio mentions loving to ''explore the world,'' and Sarah expresses a love for ''traveling.'' This shared interest provides a robust foundation for joint activities and experiences, with other interests like John''s ''hiking'' and Sarah''s ''photography'' potentially complementing each other on adventures.

The primary uncertainty, and a crucial factor for any romantic connection, is location proximity. John is located in San Francisco, but Sarah''s location is not specified in her profile. While neither user explicitly stated a location preference, the absence of Sarah''s location means their geographical compatibility remains unconfirmed. If Sarah is not within a reasonable distance of San Francisco, this would present a significant logistical challenge to forming a relationship. Education levels are neutral as John''s education is unspecified, and neither stated a preference. Despite the geographical unknown, the strong alignment in fundamental preferences and shared core interests suggests a very promising match.', '{"Age Compatibility","Gender Preference Match","Lifestyle (Drinking) Compatibility","Shared Interest in Travel/Exploration","Mutual Alignment with Partner Preferences"}', '{"Unconfirmed Location Proximity"}', 'Gemini', 'gemini-1.5-flash', 'scheduled', 1, 1, '2025-11-23 16:33:35.632717', '2025-11-23 16:55:58.104315');


--
-- Data for Name: date_activity_log; Type: TABLE DATA; Schema: public; Owner: devuser
--



--
-- Data for Name: date_suggestions; Type: TABLE DATA; Schema: public; Owner: devuser
--

INSERT INTO public.date_suggestions VALUES (1, 3, 105, 13, 85.00, 'John and Sarah demonstrate high compatibility across several critical factors, indicating strong potential for a romantic match. Their ages align perfectly, with both being 30 and falling precisely within each other''s preferred age ranges (John: 24-32; Sarah: 25-35). Gender preferences are also a direct match, with John being male and seeking a female partner, and Sarah being female and seeking a male partner. Furthermore, their lifestyles regarding alcohol consumption are identical, both stating ''Socially,'' which suggests shared social habits and expectations. A significant area of common ground lies in their shared passion for exploration and travel; John''s bio mentions loving to ''explore the world,'' and Sarah expresses a love for ''traveling.'' This shared interest provides a robust foundation for joint activities and experiences, with other interests like John''s ''hiking'' and Sarah''s ''photography'' potentially complementing each other on adventures.

The primary uncertainty, and a crucial factor for any romantic connection, is location proximity. John is located in San Francisco, but Sarah''s location is not specified in her profile. While neither user explicitly stated a location preference, the absence of Sarah''s location means their geographical compatibility remains unconfirmed. If Sarah is not within a reasonable distance of San Francisco, this would present a significant logistical challenge to forming a relationship. Education levels are neutral as John''s education is unspecified, and neither stated a preference. Despite the geographical unknown, the strong alignment in fundamental preferences and shared core interests suggests a very promising match.', 'accepted', NULL, '2025-11-23 16:50:58.769011', '2025-11-23 16:51:22.869271', '2025-11-23 16:51:22.867483');
INSERT INTO public.date_suggestions VALUES (2, 105, 3, 13, 85.00, 'John and Sarah demonstrate high compatibility across several critical factors, indicating strong potential for a romantic match. Their ages align perfectly, with both being 30 and falling precisely within each other''s preferred age ranges (John: 24-32; Sarah: 25-35). Gender preferences are also a direct match, with John being male and seeking a female partner, and Sarah being female and seeking a male partner. Furthermore, their lifestyles regarding alcohol consumption are identical, both stating ''Socially,'' which suggests shared social habits and expectations. A significant area of common ground lies in their shared passion for exploration and travel; John''s bio mentions loving to ''explore the world,'' and Sarah expresses a love for ''traveling.'' This shared interest provides a robust foundation for joint activities and experiences, with other interests like John''s ''hiking'' and Sarah''s ''photography'' potentially complementing each other on adventures.

The primary uncertainty, and a crucial factor for any romantic connection, is location proximity. John is located in San Francisco, but Sarah''s location is not specified in her profile. While neither user explicitly stated a location preference, the absence of Sarah''s location means their geographical compatibility remains unconfirmed. If Sarah is not within a reasonable distance of San Francisco, this would present a significant logistical challenge to forming a relationship. Education levels are neutral as John''s education is unspecified, and neither stated a preference. Despite the geographical unknown, the strong alignment in fundamental preferences and shared core interests suggests a very promising match.', 'accepted', NULL, '2025-11-23 16:50:58.774202', '2025-11-23 16:51:32.652832', '2025-11-23 16:51:32.652688');


--
-- Data for Name: date_rejections; Type: TABLE DATA; Schema: public; Owner: devuser
--



--
-- Data for Name: devices; Type: TABLE DATA; Schema: public; Owner: devuser
--



--
-- Data for Name: partner_preferences; Type: TABLE DATA; Schema: public; Owner: devuser
--

INSERT INTO public.partner_preferences VALUES (1, 3, '["FEMALE"]', 24, 32, 50, NULL, NULL, '[1, 2]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', false, '[]', '2025-11-11 18:59:01.825387', '2025-11-23 16:32:16.928346', 0, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', 0, '[]', '[]', '[]', 0, false, 0, '[]', '[]', '[]', '[]', '[]', 0, 0, 0, '[]', '[]', '[]', 0, 0, 0, 0, '[]', '[]', '[]', '[]', '[]', 0, '[]', 0, '[]', false, '[]', 0, 30, false, 0, '[]', '[]', '[]');
INSERT INTO public.partner_preferences VALUES (2, 4, '["MALE"]', 26, 35, 40, NULL, NULL, '[1]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', true, '[]', '2025-11-11 18:59:01.825387', '2025-11-23 16:32:16.928346', 0, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', 0, '[]', '[]', '[]', 0, false, 0, '[]', '[]', '[]', '[]', '[]', 0, 0, 0, '[]', '[]', '[]', 0, 0, 0, 0, '[]', '[]', '[]', '[]', '[]', 0, '[]', 0, '[]', false, '[]', 0, 30, false, 0, '[]', '[]', '[]');
INSERT INTO public.partner_preferences VALUES (3, 5, '["FEMALE"]', 26, 34, 30, NULL, NULL, '[2]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', false, '[]', '2025-11-11 18:59:01.825387', '2025-11-23 16:32:16.928346', 0, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', 0, '[]', '[]', '[]', 0, false, 0, '[]', '[]', '[]', '[]', '[]', 0, 0, 0, '[]', '[]', '[]', 0, 0, 0, 0, '[]', '[]', '[]', '[]', '[]', 0, '[]', 0, '[]', false, '[]', 0, 30, false, 0, '[]', '[]', '[]');
INSERT INTO public.partner_preferences VALUES (4, 6, '["MALE"]', 27, 38, 25, NULL, NULL, '[1, 6]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', false, '[]', '2025-11-11 18:59:01.825387', '2025-11-23 16:32:16.928346', 0, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', 0, '[]', '[]', '[]', 0, false, 0, '[]', '[]', '[]', '[]', '[]', 0, 0, 0, '[]', '[]', '[]', 0, 0, 0, 0, '[]', '[]', '[]', '[]', '[]', 0, '[]', 0, '[]', false, '[]', 0, 30, false, 0, '[]', '[]', '[]');
INSERT INTO public.partner_preferences VALUES (5, 7, '["FEMALE"]', 28, 36, 100, NULL, NULL, '[1, 2]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', false, '[]', '2025-11-11 18:59:01.825387', '2025-11-23 16:32:16.928346', 0, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', 0, '[]', '[]', '[]', 0, false, 0, '[]', '[]', '[]', '[]', '[]', 0, 0, 0, '[]', '[]', '[]', 0, 0, 0, 0, '[]', '[]', '[]', '[]', '[]', 0, '[]', 0, '[]', false, '[]', 0, 30, false, 0, '[]', '[]', '[]');
INSERT INTO public.partner_preferences VALUES (10, 18, '[]', 18, 99, 50, NULL, NULL, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', false, '[]', '2025-11-11 19:20:40.613116', '2025-11-23 16:32:16.928346', 0, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', 0, '[]', '[]', '[]', 0, false, 0, '[]', '[]', '[]', '[]', '[]', 0, 0, 0, '[]', '[]', '[]', 0, 0, 0, 0, '[]', '[]', '[]', '[]', '[]', 0, '[]', 0, '[]', false, '[]', 0, 30, false, 0, '[]', '[]', '[]');
INSERT INTO public.partner_preferences VALUES (11, 19, '[]', 18, 99, 50, NULL, NULL, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', false, '[]', '2025-11-11 19:23:23.608449', '2025-11-23 16:32:16.928346', 0, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', 0, '[]', '[]', '[]', 0, false, 0, '[]', '[]', '[]', '[]', '[]', 0, 0, 0, '[]', '[]', '[]', 0, 0, 0, 0, '[]', '[]', '[]', '[]', '[]', 0, '[]', 0, '[]', false, '[]', 0, 30, false, 0, '[]', '[]', '[]');
INSERT INTO public.partner_preferences VALUES (12, 20, '[]', 18, 99, 50, NULL, NULL, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', false, '[]', '2025-11-11 19:31:06.748943', '2025-11-23 16:32:16.928346', 0, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', 0, '[]', '[]', '[]', 0, false, 0, '[]', '[]', '[]', '[]', '[]', 0, 0, 0, '[]', '[]', '[]', 0, 0, 0, 0, '[]', '[]', '[]', '[]', '[]', 0, '[]', 0, '[]', false, '[]', 0, 30, false, 0, '[]', '[]', '[]');
INSERT INTO public.partner_preferences VALUES (13, 21, '[]', 18, 99, 50, NULL, NULL, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', false, '[]', '2025-11-11 19:37:20.508621', '2025-11-23 16:32:16.928346', 0, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', 0, '[]', '[]', '[]', 0, false, 0, '[]', '[]', '[]', '[]', '[]', 0, 0, 0, '[]', '[]', '[]', 0, 0, 0, 0, '[]', '[]', '[]', '[]', '[]', 0, '[]', 0, '[]', false, '[]', 0, 30, false, 0, '[]', '[]', '[]');
INSERT INTO public.partner_preferences VALUES (18, 26, '[]', 18, 99, 50, NULL, NULL, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', false, '[]', '2025-11-12 15:53:31.050255', '2025-11-23 16:32:16.928346', 0, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', 0, '[]', '[]', '[]', 0, false, 0, '[]', '[]', '[]', '[]', '[]', 0, 0, 0, '[]', '[]', '[]', 0, 0, 0, 0, '[]', '[]', '[]', '[]', '[]', 0, '[]', 0, '[]', false, '[]', 0, 30, false, 0, '[]', '[]', '[]');
INSERT INTO public.partner_preferences VALUES (112, 106, '["FEMALE"]', 23, 33, 50, NULL, NULL, '[]', '[]', '[]', '[]', '[]', '["Socially", "Never"]', '["Never"]', '[]', '[]', false, '[]', '2025-11-23 10:56:43.525489', '2025-11-23 16:32:16.928346', 0, '["Regularly", "Sometimes"]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', 0, '[]', '[]', '[]', 0, false, 0, '[]', '[]', '[]', '[]', '[]', 0, 0, 0, '[]', '[]', '[]', 0, 0, 0, 0, '[]', '[]', '[]', '[]', '[]', 0, '[]', 0, '[]', false, '[]', 0, 30, false, 0, '[]', '[]', '[]');
INSERT INTO public.partner_preferences VALUES (43, 52, '["MALE"]', 18, 99, 50, NULL, NULL, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', false, '[]', '2025-11-12 19:31:37.343523', '2025-11-23 16:32:16.928346', 0, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', 0, '[]', '[]', '[]', 0, false, 0, '[]', '[]', '[]', '[]', '[]', 0, 0, 0, '[]', '[]', '[]', 0, 0, 0, 0, '[]', '[]', '[]', '[]', '[]', 0, '[]', 0, '[]', false, '[]', 0, 30, false, 0, '[]', '[]', '[]');
INSERT INTO public.partner_preferences VALUES (44, 53, '["MALE"]', 25, 35, 100, 160, 180, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', true, '[]', '2025-11-16 14:44:04.496154', '2025-11-23 16:32:16.928346', 0, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', 0, '[]', '[]', '[]', 0, false, 0, '[]', '[]', '[]', '[]', '[]', 0, 0, 0, '[]', '[]', '[]', 0, 0, 0, 0, '[]', '[]', '[]', '[]', '[]', 0, '[]', 0, '[]', false, '[]', 0, 30, false, 0, '[]', '[]', '[]');
INSERT INTO public.partner_preferences VALUES (35, 43, '[]', 21, 35, 50, NULL, NULL, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', false, '[]', '2025-11-12 17:49:53.903383', '2025-11-23 16:32:16.928346', 0, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', 0, '[]', '[]', '[]', 0, false, 0, '[]', '[]', '[]', '[]', '[]', 0, 0, 0, '[]', '[]', '[]', 0, 0, 0, 0, '[]', '[]', '[]', '[]', '[]', 0, '[]', 0, '[]', false, '[]', 0, 30, false, 0, '[]', '[]', '[]');
INSERT INTO public.partner_preferences VALUES (36, 45, '[]', 21, 35, 50, NULL, NULL, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', false, '[]', '2025-11-12 17:49:53.963333', '2025-11-23 16:32:16.928346', 0, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', 0, '[]', '[]', '[]', 0, false, 0, '[]', '[]', '[]', '[]', '[]', 0, 0, 0, '[]', '[]', '[]', 0, 0, 0, 0, '[]', '[]', '[]', '[]', '[]', 0, '[]', 0, '[]', false, '[]', 0, 30, false, 0, '[]', '[]', '[]');
INSERT INTO public.partner_preferences VALUES (37, 46, '[]', 21, 35, 50, NULL, NULL, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', false, '[]', '2025-11-12 17:49:53.965887', '2025-11-23 16:32:16.928346', 0, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', 0, '[]', '[]', '[]', 0, false, 0, '[]', '[]', '[]', '[]', '[]', 0, 0, 0, '[]', '[]', '[]', 0, 0, 0, 0, '[]', '[]', '[]', '[]', '[]', 0, '[]', 0, '[]', false, '[]', 0, 30, false, 0, '[]', '[]', '[]');
INSERT INTO public.partner_preferences VALUES (38, 47, '[]', 21, 35, 50, NULL, NULL, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', false, '[]', '2025-11-12 17:49:53.99544', '2025-11-23 16:32:16.928346', 0, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', 0, '[]', '[]', '[]', 0, false, 0, '[]', '[]', '[]', '[]', '[]', 0, 0, 0, '[]', '[]', '[]', 0, 0, 0, 0, '[]', '[]', '[]', '[]', '[]', 0, '[]', 0, '[]', false, '[]', 0, 30, false, 0, '[]', '[]', '[]');
INSERT INTO public.partner_preferences VALUES (39, 48, '[]', 21, 35, 50, NULL, NULL, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', false, '[]', '2025-11-12 17:49:54.012948', '2025-11-23 16:32:16.928346', 0, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', 0, '[]', '[]', '[]', 0, false, 0, '[]', '[]', '[]', '[]', '[]', 0, 0, 0, '[]', '[]', '[]', 0, 0, 0, 0, '[]', '[]', '[]', '[]', '[]', 0, '[]', 0, '[]', false, '[]', 0, 30, false, 0, '[]', '[]', '[]');
INSERT INTO public.partner_preferences VALUES (40, 49, '[]', 25, 40, 100, NULL, NULL, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', true, '[]', '2025-11-12 17:49:54.034709', '2025-11-23 16:32:16.928346', 0, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', 0, '[]', '[]', '[]', 0, false, 0, '[]', '[]', '[]', '[]', '[]', 0, 0, 0, '[]', '[]', '[]', 0, 0, 0, 0, '[]', '[]', '[]', '[]', '[]', 0, '[]', 0, '[]', false, '[]', 0, 30, false, 0, '[]', '[]', '[]');
INSERT INTO public.partner_preferences VALUES (41, 50, '[]', 21, 35, 50, NULL, NULL, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', false, '[]', '2025-11-12 17:49:54.055101', '2025-11-23 16:32:16.928346', 0, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', 0, '[]', '[]', '[]', 0, false, 0, '[]', '[]', '[]', '[]', '[]', 0, 0, 0, '[]', '[]', '[]', 0, 0, 0, 0, '[]', '[]', '[]', '[]', '[]', 0, '[]', 0, '[]', false, '[]', 0, 30, false, 0, '[]', '[]', '[]');
INSERT INTO public.partner_preferences VALUES (45, 1, '["FEMALE"]', 25, 35, 50, 160, 180, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', true, '[]', '2025-11-16 19:29:33.466842', '2025-11-23 16:32:16.928346', 0, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', 0, '[]', '[]', '[]', 0, false, 0, '[]', '[]', '[]', '[]', '[]', 0, 0, 0, '[]', '[]', '[]', 0, 0, 0, 0, '[]', '[]', '[]', '[]', '[]', 0, '[]', 0, '[]', false, '[]', 0, 30, false, 0, '[]', '[]', '[]');
INSERT INTO public.partner_preferences VALUES (46, 54, '["MALE", "FEMALE"]', 25, 35, 100, 160, 185, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', true, '[]', '2025-11-19 12:51:24.647585', '2025-11-23 16:32:16.928346', 2, '[1, 2]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', 0, '[]', '[]', '[]', 0, false, 0, '[1, 2]', '[]', '[]', '[]', '[]', 2, 0, 0, '[]', '[]', '[]', 0, 0, 0, 0, '[]', '[]', '[]', '[]', '[]', 3, '[]', 0, '[]', true, '[]', 5, 14, true, 80, '[]', '[]', '[]');
INSERT INTO public.partner_preferences VALUES (49, 55, '["MALE", "FEMALE"]', 25, 35, 100, 160, 185, '[1, 2]', '[3, 4, 5]', '[]', '[1]', '[1, 2]', '[1, 2]', '[1]', '[1]', '[1, 2]', true, '[]', '2025-11-19 16:12:56.571653', '2025-11-23 16:32:16.928346', 2, '[1, 2, 3]', '["INTJ", "ENFP"]', '[1]', '[2, 3]', '[2]', '[1, 2]', '[]', '[]', '[]', 0, '[]', '[]', '[]', 0, false, 0, '[1, 2, 3]', '[]', '[]', '[]', '[]', 2, 2, 1, '[2, 3, 4]', '[1]', '[]', 0, 0, 0, 2, '[1]', '[1]', '[1, 2]', '[]', '[]', 3, '[1]', 2, '[]', true, '[]', 5, 14, true, 80, '[]', '[]', '[]');
INSERT INTO public.partner_preferences VALUES (53, 56, '[]', 18, 99, 50, NULL, NULL, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', false, '[]', '2025-11-19 16:22:33.765485', '2025-11-23 16:32:16.928346', 0, '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', 0, '[]', '[]', '[]', 0, false, 0, '[]', '[]', '[]', '[]', '[]', 0, 0, 0, '[]', '[]', '[]', 0, 0, 0, 0, '[]', '[]', '[]', '[]', '[]', 0, '[]', 0, '[]', false, '[]', 0, 30, false, 0, '[]', '[]', '[]');
INSERT INTO public.partner_preferences VALUES (96, 90, '["MALE", "FEMALE"]', 23, 33, 50, NULL, NULL, '[]', '["Bachelor''s", "Master''s"]', '[]', '[]', '[]', '["Socially", "Never"]', '["Never"]', '[]', '[]', false, '[]', '2025-11-23 09:41:37.377209', '2025-11-23 16:32:16.928346', 0, '["Regularly", "Sometimes"]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', 0, '[]', '[]', '[]', 0, false, 0, '[]', '[]', '[]', '[]', '[]', 0, 0, 0, '[]', '[]', '[]', 0, 0, 0, 0, '[]', '[]', '[]', '[]', '[]', 0, '[]', 0, '[]', false, '["coding", "technology", "outdoors"]', 0, 30, false, 0, '[]', '[]', '[]');
INSERT INTO public.partner_preferences VALUES (97, 91, '["MALE", "FEMALE"]', 25, 35, 50, NULL, NULL, '[]', '["Bachelor''s", "Master''s"]', '[]', '[]', '[]', '["Socially", "Never"]', '["Never"]', '[]', '[]', false, '[]', '2025-11-23 09:41:37.382846', '2025-11-23 16:32:16.928346', 0, '["Regularly", "Sometimes"]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', 0, '[]', '[]', '[]', 0, false, 0, '[]', '[]', '[]', '[]', '[]', 0, 0, 0, '[]', '[]', '[]', 0, 0, 0, 0, '[]', '[]', '[]', '[]', '[]', 0, '[]', 0, '[]', false, '["coding", "technology", "outdoors"]', 0, 30, false, 0, '[]', '[]', '[]');
INSERT INTO public.partner_preferences VALUES (98, 92, '["MALE", "FEMALE"]', 20, 30, 50, NULL, NULL, '[]', '["Bachelor''s", "Master''s"]', '[]', '[]', '[]', '["Socially", "Never"]', '["Never"]', '[]', '[]', false, '[]', '2025-11-23 09:41:37.388962', '2025-11-23 16:32:16.928346', 0, '["Regularly", "Sometimes"]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', 0, '[]', '[]', '[]', 0, false, 0, '[]', '[]', '[]', '[]', '[]', 0, 0, 0, '[]', '[]', '[]', 0, 0, 0, 0, '[]', '[]', '[]', '[]', '[]', 0, '[]', 0, '[]', false, '["coding", "technology", "outdoors"]', 0, 30, false, 0, '[]', '[]', '[]');
INSERT INTO public.partner_preferences VALUES (111, 105, '["MALE"]', 25, 35, 50, NULL, NULL, '[]', '[]', '[]', '[]', '[]', '["Socially", "Never"]', '["Never"]', '[]', '[]', false, '[]', '2025-11-23 10:56:27.932348', '2025-11-23 16:32:16.928346', 0, '["Regularly", "Sometimes"]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', '[]', 0, '[]', '[]', '[]', 0, false, 0, '[]', '[]', '[]', '[]', '[]', 0, 0, 0, '[]', '[]', '[]', 0, 0, 0, 0, '[]', '[]', '[]', '[]', '[]', 0, '[]', 0, '[]', false, '[]', 0, 30, false, 0, '[]', '[]', '[]');
INSERT INTO public.partner_preferences VALUES (42, 51, '["FEMALE"]', 34, 40, 123, 160, 199, '[3, 2]', '[2, 6]', '[6, 2]', '[1]', '[2]', '[1, 2]', '[1]', '[1]', '[3, 2]', true, '[]', '2025-11-12 19:10:35.052756', '2025-11-23 16:32:16.928346', 2, '[1]', '[]', '[3]', '[1]', '[2]', '[1]', '["jat"]', '[]', '[]', 1, '[]', '[]', '[]', 0, true, 1, '[1, 2, 3]', '[1]', '[]', '[5]', '[]', 2, 2, 1, '[6]', '[2]', '["computer", "finance"]', 34, 1, 1, 2, '[1]', '[1]', '[1]', '[]', '[]', 3, '[1]', 2, '[]', true, '[2, 6]', 2, 14, true, 80, '[]', '[]', '[]');


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: devuser
--

INSERT INTO public.sessions VALUES ('sess_3_1762887542', 3, NULL, '2025-11-18 18:59:01.842159', '2025-11-11 18:59:01.842159', NULL, NULL, NULL, NULL, true, '2025-11-11 18:59:01.842159');
INSERT INTO public.sessions VALUES ('sess_4_1762887542', 4, NULL, '2025-11-18 18:59:01.842159', '2025-11-11 18:59:01.842159', NULL, NULL, NULL, NULL, true, '2025-11-11 18:59:01.842159');
INSERT INTO public.sessions VALUES ('sess_5_1762887542', 5, NULL, '2025-11-18 18:59:01.842159', '2025-11-11 18:59:01.842159', NULL, NULL, NULL, NULL, true, '2025-11-11 18:59:01.842159');
INSERT INTO public.sessions VALUES ('sess_6_1762887542', 6, NULL, '2025-11-18 18:59:01.842159', '2025-11-11 18:59:01.842159', NULL, NULL, NULL, NULL, true, '2025-11-11 18:59:01.842159');
INSERT INTO public.sessions VALUES ('sess_7_1762887542', 7, NULL, '2025-11-18 18:59:01.842159', '2025-11-11 18:59:01.842159', NULL, NULL, NULL, NULL, true, '2025-11-11 18:59:01.842159');
INSERT INTO public.sessions VALUES ('sess_18_1762888840', 18, NULL, '2025-11-18 19:20:40.614519', '2025-11-11 19:20:40.614841', NULL, NULL, NULL, NULL, true, '2025-11-11 19:20:40.614841');
INSERT INTO public.sessions VALUES ('sess_19_1762889003', 19, NULL, '2025-11-18 19:23:23.609432', '2025-11-11 19:23:23.609692', NULL, NULL, NULL, NULL, true, '2025-11-11 19:23:23.609692');
INSERT INTO public.sessions VALUES ('sess_20_1762889466', 20, NULL, '2025-11-18 19:31:06.74961', '2025-11-11 19:31:06.749825', NULL, NULL, NULL, NULL, true, '2025-11-11 19:31:06.749825');
INSERT INTO public.sessions VALUES ('sess_21_1762889840', 21, NULL, '2025-11-18 19:37:20.509406', '2025-11-11 19:37:20.509638', NULL, NULL, NULL, NULL, true, '2025-11-11 19:37:20.509638');
INSERT INTO public.sessions VALUES ('sess_26_1762962811', 26, NULL, '2025-11-19 15:53:31.051678', '2025-11-12 15:53:31.051943', NULL, NULL, NULL, NULL, true, '2025-11-12 15:53:31.051943');
INSERT INTO public.sessions VALUES ('sess_26_1762962828', 26, NULL, '2025-11-19 15:53:48.153079', '2025-11-12 15:53:48.153565', NULL, NULL, NULL, NULL, true, '2025-11-12 15:53:48.153565');
INSERT INTO public.sessions VALUES ('sess_26_1762962857', 26, NULL, '2025-11-19 15:54:17.754064', '2025-11-12 15:54:17.754683', NULL, NULL, NULL, NULL, true, '2025-11-12 15:54:17.754683');
INSERT INTO public.sessions VALUES ('sess_26_1762963391', 26, NULL, '2025-11-19 16:03:11.165199', '2025-11-12 16:03:11.16681', NULL, NULL, NULL, NULL, true, '2025-11-12 16:03:40.505093');
INSERT INTO public.sessions VALUES ('sess_51_1762974635', 51, NULL, '2025-11-19 19:10:35.055741', '2025-11-12 19:10:35.056517', NULL, NULL, NULL, NULL, false, '2025-11-12 19:10:35.056517');
INSERT INTO public.sessions VALUES ('sess_51_1762974661', 51, NULL, '2025-11-19 19:11:01.761577', '2025-11-12 19:11:01.762188', NULL, NULL, NULL, NULL, true, '2025-11-12 19:11:01.762188');
INSERT INTO public.sessions VALUES ('sess_51_1762975124', 51, NULL, '2025-11-19 19:18:44.813634', '2025-11-12 19:18:44.816102', NULL, NULL, NULL, NULL, true, '2025-11-12 19:18:44.816102');
INSERT INTO public.sessions VALUES ('sess_52_1762975897', 52, NULL, '2025-11-19 19:31:37.345879', '2025-11-12 19:31:37.346215', NULL, NULL, NULL, NULL, true, '2025-11-12 19:31:37.346215');
INSERT INTO public.sessions VALUES ('sess_52_1762975920', 52, NULL, '2025-11-19 19:32:00.573746', '2025-11-12 19:32:00.574408', NULL, NULL, NULL, NULL, true, '2025-11-12 19:32:00.574408');
INSERT INTO public.sessions VALUES ('sess_51_1763008583', 51, NULL, '2025-11-20 04:36:23.365733', '2025-11-13 04:36:23.369245', NULL, NULL, NULL, NULL, true, '2025-11-13 04:36:23.369245');
INSERT INTO public.sessions VALUES ('sess_51_1763048731', 51, NULL, '2025-11-20 15:45:31.722381', '2025-11-13 15:45:31.724987', NULL, NULL, NULL, NULL, true, '2025-11-13 15:45:31.724987');
INSERT INTO public.sessions VALUES ('sess_51_1763227077', 51, NULL, '2025-11-22 17:17:57.980989', '2025-11-15 17:17:57.982795', 'device_12345', NULL, NULL, NULL, true, '2025-11-15 17:17:57.982795');
INSERT INTO public.sessions VALUES ('sess_51_1763227133', 51, NULL, '2025-11-22 17:18:53.772113', '2025-11-15 17:18:53.772585', 'device_12345', NULL, NULL, NULL, false, '2025-11-15 17:19:04.006643');
INSERT INTO public.sessions VALUES ('sess_51_1763227848', 51, NULL, '2025-11-22 17:30:48.978883', '2025-11-15 17:30:48.979605', NULL, NULL, NULL, NULL, true, '2025-11-15 17:30:48.979605');
INSERT INTO public.sessions VALUES ('sess_51_1763227862', 51, NULL, '2025-11-22 17:31:02.778464', '2025-11-15 17:31:02.778798', NULL, NULL, NULL, NULL, true, '2025-11-15 17:31:02.778798');
INSERT INTO public.sessions VALUES ('sess_51_1763229011', 51, NULL, '2025-11-22 17:50:11.030784', '2025-11-15 17:50:11.031948', NULL, NULL, NULL, NULL, true, '2025-11-15 17:50:11.031948');
INSERT INTO public.sessions VALUES ('sess_51_1763267744', 51, NULL, '2025-11-23 04:35:44.457129', '2025-11-16 04:35:44.458282', NULL, NULL, NULL, NULL, true, '2025-11-16 04:35:44.458282');
INSERT INTO public.sessions VALUES ('sess_51_1763269414', 51, NULL, '2025-11-23 05:03:34.063358', '2025-11-16 05:03:34.064273', NULL, NULL, NULL, NULL, true, '2025-11-16 05:03:34.064273');
INSERT INTO public.sessions VALUES ('sess_51_1763269584', 51, NULL, '2025-11-23 05:06:24.848168', '2025-11-16 05:06:24.848646', NULL, NULL, NULL, NULL, true, '2025-11-16 05:06:24.848646');
INSERT INTO public.sessions VALUES ('sess_51_1763270692', 51, NULL, '2025-11-23 05:24:52.333557', '2025-11-16 05:24:52.334485', 'device_12345', NULL, NULL, NULL, true, '2025-11-16 05:24:52.334485');
INSERT INTO public.sessions VALUES ('sess_53_1763304244', 53, NULL, '2025-11-23 14:44:04.498622', '2025-11-16 14:44:04.499257', NULL, NULL, NULL, NULL, true, '2025-11-16 14:44:04.499257');
INSERT INTO public.sessions VALUES ('sess_54_1763556684', 54, NULL, '2025-11-26 12:51:24.655142', '2025-11-19 12:51:24.656548', NULL, NULL, NULL, NULL, true, '2025-11-19 12:51:24.656548');
INSERT INTO public.sessions VALUES ('sess_51_1763563462', 51, NULL, '2025-11-26 14:44:22.117783', '2025-11-19 14:44:22.121388', 'device_12345', NULL, NULL, NULL, true, '2025-11-19 14:44:22.121388');
INSERT INTO public.sessions VALUES ('sess_55_1763568776', 55, NULL, '2025-11-26 16:12:56.574277', '2025-11-19 16:12:56.574902', NULL, NULL, NULL, NULL, true, '2025-11-19 16:12:56.574902');
INSERT INTO public.sessions VALUES ('sess_56_1763569353', 56, NULL, '2025-11-26 16:22:33.769539', '2025-11-19 16:22:33.770025', NULL, NULL, NULL, NULL, true, '2025-11-19 16:22:33.770025');


--
-- Data for Name: user_blocks; Type: TABLE DATA; Schema: public; Owner: devuser
--



--
-- Data for Name: user_photos; Type: TABLE DATA; Schema: public; Owner: devuser
--

INSERT INTO public.user_photos VALUES (1, 3, 'photo_1_1', 'https://i.pravatar.cc/600?img=12', 'https://i.pravatar.cc/150?img=12', 1, true, NULL, '2025-11-11 18:59:01.825387');
INSERT INTO public.user_photos VALUES (2, 3, 'photo_1_2', 'https://i.pravatar.cc/600?img=13', 'https://i.pravatar.cc/150?img=13', 2, false, NULL, '2025-11-11 18:59:01.825387');
INSERT INTO public.user_photos VALUES (3, 4, 'photo_2_1', 'https://i.pravatar.cc/600?img=5', 'https://i.pravatar.cc/150?img=5', 1, true, NULL, '2025-11-11 18:59:01.825387');
INSERT INTO public.user_photos VALUES (4, 4, 'photo_2_2', 'https://i.pravatar.cc/600?img=6', 'https://i.pravatar.cc/150?img=6', 2, false, NULL, '2025-11-11 18:59:01.825387');


--
-- Data for Name: user_preferences; Type: TABLE DATA; Schema: public; Owner: devuser
--

INSERT INTO public.user_preferences VALUES (1, 43, true, true, false, true, true, true, true, false, true, true, true, true, false, false, true, true, false, false, 50, 7, 'en', 'light', '2025-11-12 17:49:53.913072', '2025-11-12 17:49:53.913072');
INSERT INTO public.user_preferences VALUES (2, 50, false, true, false, false, false, false, false, false, false, false, false, false, false, true, false, true, false, false, 50, 7, 'es', 'dark', '2025-11-12 17:49:54.056889', '2025-11-12 17:49:54.057693');
INSERT INTO public.user_preferences VALUES (3, 51, true, true, false, true, true, true, true, false, true, true, true, true, false, false, true, true, false, false, 50, 7, 'en', 'light', '2025-11-16 06:06:17.932028', '2025-11-16 06:06:17.932028');


--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: devuser
--

INSERT INTO public.user_profiles VALUES (1, 3, 'Software engineer who loves hiking and trying new restaurants. Looking for someone to explore the world with!', '[{"label": "Software Engineer", "category": 1}]', 'Tech Corp', NULL, '[{"label": "BS Computer Science", "level": 4}]', NULL, 180, '{"city": "San Francisco", "country": "USA"}', NULL, '[{"label": "Hiking", "category": 14}, {"label": "Travel", "category": 1}, {"label": "Cooking", "category": 5}]', '[{"code": 1, "label": "English", "proficiency": 4}]', '[1, 2]', 'SOCIALLY', 'NEVER', 'OFTEN', 'ANYTHING', 'AGNOSTIC', NULL, NULL, 'DOG_LOVER', 'DONT_HAVE_WANT', NULL, NULL, NULL, NULL, '[]', 85, true, false, '2025-11-11 18:59:01.825387', '2025-11-11 18:59:01.825387');
INSERT INTO public.user_profiles VALUES (2, 4, 'Creative soul with a passion for design and art. Coffee enthusiast and bookworm. Let''s create something beautiful together!', '[{"label": "Designer", "category": 19}]', 'Creative Studio', NULL, '[{"label": "MFA Design", "level": 5}]', NULL, 165, '{"city": "New York", "country": "USA"}', NULL, '[{"label": "Art", "category": 10}, {"label": "Reading", "category": 8}, {"label": "Photography", "category": 2}]', '[{"code": 1, "label": "English", "proficiency": 4}, {"code": 2, "label": "Spanish", "proficiency": 2}]', '[1]', 'RARELY', 'NEVER', 'SOMETIMES', 'VEGETARIAN', 'SPIRITUAL', NULL, NULL, 'CAT_LOVER', 'OPEN_TO_CHILDREN', NULL, NULL, NULL, NULL, '[]', 90, true, false, '2025-11-11 18:59:01.825387', '2025-11-11 18:59:01.825387');
INSERT INTO public.user_profiles VALUES (3, 5, 'Cardiologist who believes in living life to the fullest. Fitness enthusiast and foodie. Looking for my partner in crime!', '[{"label": "Doctor", "category": 6}]', 'City Hospital', NULL, '[{"label": "MD Cardiology", "level": 8}]', NULL, 175, '{"city": "Mumbai", "country": "India"}', NULL, '[{"label": "Fitness", "category": 6}, {"label": "Cooking", "category": 5}, {"label": "Travel", "category": 1}]', '[{"code": 1, "label": "English", "proficiency": 4}, {"code": 12, "label": "Hindi", "proficiency": 4}]', '[2]', 'SOCIALLY', 'NEVER', 'DAILY', 'ANYTHING', 'HINDU', NULL, NULL, 'NO_PETS', 'DONT_HAVE_WANT', NULL, NULL, NULL, NULL, '[]', 95, true, false, '2025-11-11 18:59:01.825387', '2025-11-11 18:59:01.825387');
INSERT INTO public.user_profiles VALUES (4, 6, 'Marketing guru by day, adventure seeker by weekend. Love trying new cuisines and meeting new people!', '[{"label": "Marketing Manager", "category": 34}]', 'Brand Agency', NULL, '[{"label": "MBA Marketing", "level": 6}]', NULL, 162, '{"city": "Bangalore", "country": "India"}', NULL, '[{"label": "Travel", "category": 1}, {"label": "Yoga", "category": 7}, {"label": "Dancing", "category": 11}]', '[{"code": 1, "label": "English", "proficiency": 4}, {"code": 12, "label": "Hindi", "proficiency": 3}, {"code": 17, "label": "Gujarati", "proficiency": 4}]', '[1, 6]', 'SOCIALLY', 'NEVER', 'OFTEN', 'VEGETARIAN', 'HINDU', NULL, NULL, 'NO_PETS', 'NOT_SURE', NULL, NULL, NULL, NULL, '[]', 88, true, false, '2025-11-11 18:59:01.825387', '2025-11-11 18:59:01.825387');
INSERT INTO public.user_profiles VALUES (5, 7, 'Startup founder passionate about building products that matter. Tech geek, travel junkie, and wine enthusiast.', '[{"label": "Entrepreneur", "category": 14}]', 'Startup Inc', NULL, '[{"label": "MS Business", "level": 5}]', NULL, 178, '{"city": "Singapore", "country": "Singapore"}', NULL, '[{"label": "Entrepreneurship", "category": 18}, {"label": "Travel", "category": 1}, {"label": "Wine Tasting", "category": 19}]', '[{"code": 1, "label": "English", "proficiency": 4}, {"code": 8, "label": "Mandarin", "proficiency": 2}]', '[1, 2]', 'REGULARLY', 'NEVER', 'SOMETIMES', 'ANYTHING', 'ATHEIST', NULL, NULL, 'WANT_SOMEDAY', 'OPEN_TO_CHILDREN', NULL, NULL, NULL, NULL, '[]', 92, true, false, '2025-11-11 18:59:01.825387', '2025-11-11 18:59:01.825387');
INSERT INTO public.user_profiles VALUES (10, 18, NULL, '[]', NULL, NULL, '[]', NULL, NULL, NULL, NULL, '[]', '[]', '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', 0, true, false, '2025-11-11 19:20:40.610424', '2025-11-11 19:20:40.610424');
INSERT INTO public.user_profiles VALUES (11, 19, NULL, '[]', NULL, NULL, '[]', NULL, NULL, NULL, NULL, '[]', '[]', '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', 0, true, false, '2025-11-11 19:23:23.606215', '2025-11-11 19:23:23.606215');
INSERT INTO public.user_profiles VALUES (12, 20, NULL, '[]', NULL, NULL, '[]', NULL, NULL, NULL, NULL, '[]', '[]', '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', 0, true, false, '2025-11-11 19:31:06.746966', '2025-11-11 19:31:06.746966');
INSERT INTO public.user_profiles VALUES (13, 21, NULL, '[]', NULL, NULL, '[]', NULL, NULL, NULL, NULL, '[]', '[]', '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', 0, true, false, '2025-11-11 19:37:20.506932', '2025-11-11 19:37:20.506932');
INSERT INTO public.user_profiles VALUES (94, 105, 'Love traveling and photography', '{"title": "Marketing Manager"}', NULL, NULL, '{"level": "Masters"}', NULL, NULL, NULL, NULL, '["travel", "photography", "yoga"]', '[]', '[]', 'Socially', 'Never', 'Regularly', 'Vegetarian', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', 80, true, false, '2025-11-23 10:56:27.923736', '2025-11-23 10:56:27.923736');
INSERT INTO public.user_profiles VALUES (18, 26, NULL, '[]', NULL, NULL, '[]', NULL, NULL, NULL, NULL, '[]', '[]', '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', 0, true, false, '2025-11-12 15:53:31.047855', '2025-11-12 15:53:31.047855');
INSERT INTO public.user_profiles VALUES (35, 43, NULL, '[]', NULL, NULL, '[]', NULL, NULL, NULL, NULL, '[]', '[]', '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', 50, true, false, '2025-11-12 17:49:53.898761', '2025-11-12 17:49:53.898761');
INSERT INTO public.user_profiles VALUES (36, 45, NULL, '[]', NULL, NULL, '[]', NULL, NULL, NULL, NULL, '[]', '[]', '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', 50, true, false, '2025-11-12 17:49:53.961603', '2025-11-12 17:49:53.961603');
INSERT INTO public.user_profiles VALUES (37, 46, NULL, '[]', NULL, NULL, '[]', NULL, NULL, NULL, NULL, '[]', '[]', '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', 50, true, false, '2025-11-12 17:49:53.965301', '2025-11-12 17:49:53.965301');
INSERT INTO public.user_profiles VALUES (38, 47, NULL, '[]', NULL, NULL, '[]', NULL, NULL, NULL, NULL, '[]', '[]', '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', 50, true, false, '2025-11-12 17:49:53.992814', '2025-11-12 17:49:53.992814');
INSERT INTO public.user_profiles VALUES (39, 48, NULL, '[]', NULL, NULL, '[]', NULL, NULL, NULL, NULL, '[]', '[]', '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', 50, true, false, '2025-11-12 17:49:54.01133', '2025-11-12 17:49:54.01133');
INSERT INTO public.user_profiles VALUES (40, 49, NULL, '[]', NULL, NULL, '[]', NULL, NULL, NULL, NULL, '[]', '[]', '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', 50, true, false, '2025-11-12 17:49:54.033511', '2025-11-12 17:49:54.033511');
INSERT INTO public.user_profiles VALUES (41, 50, NULL, '[]', NULL, NULL, '[]', NULL, NULL, NULL, NULL, '[]', '[]', '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', 50, true, false, '2025-11-12 17:49:54.053754', '2025-11-12 17:49:54.053754');
INSERT INTO public.user_profiles VALUES (43, 52, NULL, '[]', NULL, NULL, '[]', NULL, NULL, NULL, NULL, '[]', '[]', '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', 0, true, false, '2025-11-12 19:31:37.33922', '2025-11-12 19:31:37.33922');
INSERT INTO public.user_profiles VALUES (44, 53, NULL, '[]', NULL, NULL, '[]', NULL, NULL, NULL, NULL, '[]', '[]', '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', 0, true, false, '2025-11-16 14:44:04.490347', '2025-11-16 14:44:04.490347');
INSERT INTO public.user_profiles VALUES (45, 54, NULL, '[]', NULL, NULL, '[]', NULL, NULL, NULL, NULL, '[]', '[]', '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', 0, true, false, '2025-11-19 12:51:24.632152', '2025-11-19 12:51:24.632152');
INSERT INTO public.user_profiles VALUES (46, 55, NULL, '[]', NULL, NULL, '[]', NULL, NULL, NULL, NULL, '[]', '[]', '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', 0, true, false, '2025-11-19 16:12:56.565804', '2025-11-19 16:12:56.565804');
INSERT INTO public.user_profiles VALUES (47, 56, NULL, '[]', NULL, NULL, '[]', NULL, NULL, NULL, NULL, '[]', '[]', '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', 0, true, false, '2025-11-19 16:22:33.751008', '2025-11-19 16:22:33.751008');
INSERT INTO public.user_profiles VALUES (95, 106, 'Tech enthusiast and fitness lover', '{"title": "Software Engineer"}', NULL, NULL, '{"level": "Bachelors"}', NULL, NULL, NULL, NULL, '["coding", "fitness", "travel"]', '[]', '[]', 'Socially', 'Never', 'Regularly', 'Anything', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', 75, true, false, '2025-11-23 10:57:35.247114', '2025-11-23 10:57:35.247114');
INSERT INTO public.user_profiles VALUES (42, 51, 'My name is Alex Chen, and I''m a 14-year-old who loves exploring the world around me. I''m passionate about robotics and spend most of my free time building and programming small machines in my garage workshop. Soccer is my favorite sport, and I play as a midfielder for my school''s team. I have a younger sister named Emma wh', '[]', 'TechCorp v1', 'Senior Engineer v1', '[]', 'nsitv1', 185, NULL, 'asdabangaelorev1 ads', '[]', '[]', '[]', 'DRINKING_SOCIALLY', 'SMOKING_UNSPECIFIED', 'WORKOUT_SOMETIMES', 'DIETARY_VEGETARIAN', 'RELIGION_MUSLIM', 'IMPORTANCE_UNSPECIFIED', 'POLITICAL_CONSERVATIVE', 'PET_UNSPECIFIED', 'CHILDREN_UNSPECIFIED', 'My n', 'COMMUNICATION_PHONE_CALLER', 'LOVE_LANGUAGE_RECEIVING_GIFTS', 'SLEEP_SCHEDULE_NIGHT_OWL', '[]', 65, true, false, '2025-11-12 19:10:35.045722', '2025-11-23 11:08:19.599674');
INSERT INTO public.user_profiles VALUES (79, 90, 'Test bio for Alice', '{"title": "Software Engineer", "company": "Tech Corp"}', NULL, NULL, '{"field": "Computer Science", "level": "Bachelor''s"}', NULL, NULL, NULL, NULL, '["coding", "hiking", "reading"]', '[]', '[]', 'Socially', 'Never', 'Regularly', 'Vegetarian', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', 75, true, false, '2025-11-23 09:41:37.375362', '2025-11-23 09:41:37.375362');
INSERT INTO public.user_profiles VALUES (80, 91, 'Test bio for Bob', '{"title": "Software Engineer", "company": "Tech Corp"}', NULL, NULL, '{"field": "Computer Science", "level": "Bachelor''s"}', NULL, NULL, NULL, NULL, '["coding", "hiking", "reading"]', '[]', '[]', 'Socially', 'Never', 'Regularly', 'Vegetarian', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', 75, true, false, '2025-11-23 09:41:37.381131', '2025-11-23 09:41:37.381131');
INSERT INTO public.user_profiles VALUES (81, 92, 'Test bio for Charlie', '{"title": "Software Engineer", "company": "Tech Corp"}', NULL, NULL, '{"field": "Computer Science", "level": "Bachelor''s"}', NULL, NULL, NULL, NULL, '["coding", "hiking", "reading"]', '[]', '[]', 'Socially', 'Never', 'Regularly', 'Vegetarian', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', 75, true, false, '2025-11-23 09:41:37.387167', '2025-11-23 09:41:37.387167');


--
-- Data for Name: user_reports; Type: TABLE DATA; Schema: public; Owner: devuser
--



--
-- Data for Name: verification_codes; Type: TABLE DATA; Schema: public; Owner: devuser
--



--
-- Name: admin_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.admin_sessions_id_seq', 1, false);


--
-- Name: admin_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.admin_users_id_seq', 2, true);


--
-- Name: availability_slots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.availability_slots_id_seq', 81, true);


--
-- Name: curated_matches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.curated_matches_id_seq', 13, true);


--
-- Name: date_activity_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.date_activity_log_id_seq', 1, false);


--
-- Name: date_rejections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.date_rejections_id_seq', 1, false);


--
-- Name: date_suggestions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.date_suggestions_id_seq', 2, true);


--
-- Name: devices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.devices_id_seq', 1, false);


--
-- Name: partner_preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.partner_preferences_id_seq', 115, true);


--
-- Name: scheduled_dates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.scheduled_dates_id_seq', 1, true);


--
-- Name: user_blocks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.user_blocks_id_seq', 1, true);


--
-- Name: user_photos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.user_photos_id_seq', 4, true);


--
-- Name: user_preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.user_preferences_id_seq', 3, true);


--
-- Name: user_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.user_profiles_id_seq', 95, true);


--
-- Name: user_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.user_reports_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.users_id_seq', 106, true);


--
-- Name: verification_codes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.verification_codes_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--

\unrestrict OIbugYd4fRAtURglDBsP00dsbb0vE1EUxwj8iJ5lg8Tro9P4gpbnbrJ6QI5ytnO

