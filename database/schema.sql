-- ============================================================
--  StudySpot Database Schema
--  Character Set : utf8mb4
-- ============================================================

DROP DATABASE IF EXISTS studyspot_db;
CREATE DATABASE studyspot_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE studyspot_db;

-- ------------------------------------------------------------
-- Table: users
-- ------------------------------------------------------------
CREATE TABLE users (
    id            INT            NOT NULL AUTO_INCREMENT,
    full_name     VARCHAR(150)   NOT NULL,
    email         VARCHAR(150)   NOT NULL,
    password_hash VARCHAR(255)   NOT NULL,
    created_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: spaces
-- ------------------------------------------------------------
CREATE TABLE spaces (
    id             INT                                                  NOT NULL AUTO_INCREMENT,
    name           VARCHAR(200)                                         NOT NULL,
    type           ENUM('library','cafe','coworking','university')      NOT NULL,
    address        VARCHAR(300)                                         NOT NULL,
    district       VARCHAR(100)                                         NOT NULL,
    latitude       DECIMAL(10,7)                                        NOT NULL,
    longitude      DECIMAL(10,7)                                        NOT NULL,
    wifi           TINYINT(1)                                           NOT NULL DEFAULT 1,
    noise_level    ENUM('quiet','moderate','loud')                      NOT NULL DEFAULT 'moderate',
    opening_time   TIME                                                 NOT NULL,
    closing_time   TIME                                                 NOT NULL,
    cost_per_hour  DECIMAL(8,2)                                         NOT NULL DEFAULT 0.00,
    description    TEXT,
    image_url      VARCHAR(500),
    rating         DECIMAL(2,1)                                         NOT NULL DEFAULT 0,
    total_reviews  INT                                                  NOT NULL DEFAULT 0,
    created_at     TIMESTAMP                                            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: bookings
-- ------------------------------------------------------------
CREATE TABLE bookings (
    id             INT                                                              NOT NULL AUTO_INCREMENT,
    user_id        INT                                                              NOT NULL,
    space_id       INT                                                              NOT NULL,
    booking_date   DATE                                                             NOT NULL,
    start_time     TIME                                                             NOT NULL,
    end_time       TIME                                                             NOT NULL,
    total_cost     DECIMAL(8,2)                                                     NOT NULL DEFAULT 0.00,
    status         ENUM('pending','confirmed','cancelled','completed')              NOT NULL DEFAULT 'pending',
    payment_status ENUM('unpaid','paid')                                            NOT NULL DEFAULT 'unpaid',
    created_at     TIMESTAMP                                                        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_bookings_user  FOREIGN KEY (user_id)  REFERENCES users  (id) ON DELETE CASCADE,
    CONSTRAINT fk_bookings_space FOREIGN KEY (space_id) REFERENCES spaces (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: reviews
-- ------------------------------------------------------------
CREATE TABLE reviews (
    id         INT          NOT NULL AUTO_INCREMENT,
    user_id    INT          NOT NULL,
    space_id   INT          NOT NULL,
    rating     TINYINT      NOT NULL,
    comment    TEXT,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_reviews_user  FOREIGN KEY (user_id)  REFERENCES users  (id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_space FOREIGN KEY (space_id) REFERENCES spaces (id) ON DELETE CASCADE,
    CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: favorites
-- ------------------------------------------------------------
CREATE TABLE favorites (
    id         INT       NOT NULL AUTO_INCREMENT,
    user_id    INT       NOT NULL,
    space_id   INT       NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uf (user_id, space_id),
    CONSTRAINT fk_favorites_user  FOREIGN KEY (user_id)  REFERENCES users  (id) ON DELETE CASCADE,
    CONSTRAINT fk_favorites_space FOREIGN KEY (space_id) REFERENCES spaces (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  Sample Data – 5 Study Spaces in Sri Lanka
-- ============================================================
INSERT INTO spaces
    (name, type, address, district, latitude, longitude, wifi, noise_level, opening_time, closing_time, cost_per_hour, description, image_url, rating, total_reviews)
VALUES
(
    'Colombo Public Library',
    'library',
    '17 Sir Marcus Fernando Mawatha, Colombo 07',
    'Colombo',
    6.9147800,
    79.8635900,
    1,
    'quiet',
    '08:00:00',
    '20:00:00',
    0.00,
    'One of the largest public libraries in Sri Lanka, offering a peaceful reading environment with dedicated study halls, free Wi-Fi, and an extensive collection of academic and general literature.',
    'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800',
    4.5,
    128
),
(
    'Caffè Nero – One Galle Face',
    'cafe',
    'Level 1, One Galle Face Mall, Galle Road, Colombo 02',
    'Colombo',
    6.8921300,
    79.8479400,
    1,
    'moderate',
    '07:00:00',
    '22:00:00',
    250.00,
    'A stylish café inside One Galle Face Mall with high-speed Wi-Fi, comfortable seating and plenty of natural light — ideal for solo work sessions or small group study over a cup of specialty coffee.',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
    4.2,
    87
),
(
    'HiveYard Coworking – Kandy',
    'coworking',
    '12 Peradeniya Road, Kandy 20000',
    'Kandy',
    7.2913600,
    80.6337200,
    1,
    'moderate',
    '08:00:00',
    '21:00:00',
    350.00,
    'Kandy\'s premium coworking hub offering hot desks, private booths, high-speed fibre internet, printing facilities and a rooftop lounge with a scenic view of the Kandy hills.',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    4.6,
    54
),
(
    'University of Kelaniya – Central Library',
    'university',
    'University of Kelaniya, Kelaniya 11600',
    'Gampaha',
    7.0048200,
    79.9202100,
    1,
    'quiet',
    '08:00:00',
    '18:00:00',
    0.00,
    'The central academic library of the University of Kelaniya. Open to registered students and academic staff, providing access to journals, digital resources, thesis archives and quiet study carrels.',
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
    4.3,
    212
),
(
    'The Study – Galle Fort',
    'cafe',
    '28 Leyn Baan Street, Galle Fort, Galle 80000',
    'Galle',
    6.0268300,
    80.2170500,
    1,
    'quiet',
    '09:00:00',
    '20:00:00',
    200.00,
    'A charming heritage café nestled within the 17th-century Dutch Fort walls. Offers a curated study menu, strong coffee, reliable Wi-Fi and a tranquil atmosphere perfect for focused study or remote work.',
    'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800',
    4.8,
    76
);
