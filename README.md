# StudySpot 🏠📚

A web app where Sri Lankan students can find and review quiet study spaces near
them — libraries, cafes, co-working spaces, and university common areas —
with details on opening hours, Wi-Fi availability, noise level, and cost.
Built especially for students in boarding houses without a good study
environment at home.

UI designed in **Figma**, built with **HTML / CSS / JavaScript** on the
frontend and **PHP + MySQL** on the backend (XAMPP-friendly).

---

## 📁 Project Structure

```
studyspotnew/
├── .vscode/              VS Code workspace settings
├── css/
│   └── style.css         Shared stylesheet (colors, layout, components)
├── database/
│   └── schema.sql        MySQL schema + sample data (import via phpMyAdmin)
├── images/
│   └── figma-reference/  Exported Figma page designs (for reference only)
├── js/
│   └── main.js           Shared front-end behaviour (nav, stepper, stars, etc.)
├── php/
│   ├── db.php             Database connection (PDO)
│   ├── login.php          Handles login form
│   ├── register.php       Handles sign-up form
│   ├── forgot_password.php Handles password reset link requests (MySQL password_resets)
│   ├── reset_password.php  Handles updating password with verified reset token
│   ├── logout.php         Destroys session
│   ├── get-spaces.php     Returns spaces as JSON (search/filter)
│   ├── book.php           Creates a booking
│   ├── pay.php            Marks a booking as paid (demo)
│   ├── add-review.php     Saves a review
│   ├── toggle_favorite.php  Adds/removes a favorite (fetch API)
│   ├── get_favorites.php    Returns favorited spaces for user (MySQL)
│   ├── get_user_bookings.php Returns upcoming/completed/cancelled bookings for user (MySQL)
│   ├── get_booking_detail.php Returns single booking information with space details (MySQL)
│   ├── cancel_booking.php   Cancels an upcoming booking in MySQL
│   ├── update-profile.php   Updates name/email (account-settings.html)
│   ├── update-password.php  Changes password (account-settings.html)
│   ├── get_faqs.php         Returns FAQs from MySQL with auto-table seeding
│   ├── get_dashboard_data.php Returns live dashboard metrics & upcoming bookings
│   ├── get_profile_data.php Returns user profile, favorites & reviews
│   ├── contact.php          Handles contact form inquiries & saves to MySQL
│   ├── seed_database.php    Seeds database for Dashboard, Profile & Contact
│   ├── get_booking_confirmation.php Returns confirmed booking details from DB
│   ├── get_user_bookings.php Returns all bookings for user from DB
│   ├── admin_stats.php      Provides live counts for users, spaces, bookings
│   ├── admin_spaces.php     Full CRUD & status toggling for study spaces
│   ├── admin_users.php      Lists and manages user accounts
│   ├── admin_bookings.php   Manages booking statuses
│   └── admin_reviews.php    Review moderation and management
├── index.html             Home
├── login.html
├── register.html
├── forgot-password.html    Forgot password (matches Figma design)
├── forgot.html            Forgot password routing alias
├── reset-password.html     Reset password with token verification
├── explore.html           Search & filter study spaces
├── map.html                Map view + nearby list
├── space-detail.html       Single space details + reviews
├── booking.html             Booking form
├── payment.html             Payment form
├── confirmation.html        Booking confirmed
├── dashboard.html          User Dashboard (Upcoming Bookings, Favorites, Quick Actions)
├── my-dashboard.html       Dashboard routing alias
├── contact.html            Contact Us & Help support page (Send message + Get in touch)
├── contact-us.html         Contact routing alias
├── profile.html            Profile Overview (User profile, Saved favorites, My reviews)
├── user-profile.html       Profile routing alias
├── my-bookings.html         Upcoming / completed / cancelled bookings
├── account-settings.html     Update name/email/password
├── recently-viewed.html      Spaces you've opened (tracked via localStorage)
├── favourites.html           Saved spaces
├── write-review.html         Submit a review
├── help.html                  Help & FAQ ("About Us" in the nav)
├── about.html                 About Us routing alias
├── faq.html                   FAQ routing alias
├── admin-dashboard.html       Admin Dashboard (spaces, users, bookings, reviews)
├── admin.html                 Admin Dashboard shortcut
└── README.md
```

This mirrors the structure your team is already using (`css/`, `database/`,
`images/`, `js/`, `php/`, plus one `.html` file per page).

---

## 🛠️ Setup (XAMPP / local)

1. Install [XAMPP](https://www.apachefriends.org/) and start **Apache** + **MySQL**.
2. Copy the `studyspotnew` folder into `htdocs` (e.g. `C:\xampp\htdocs\studyspotnew`).
3. Open `http://localhost/phpmyadmin`, create nothing manually — instead:
   - Go to **Import**, choose `database/schema.sql`, and run it.
   - This creates the `studyspot_db` database with sample study spaces.
4. Check `php/db.php` — default XAMPP credentials (`root`, no password) are
   already set. Update if your MySQL user/password is different.
5. Visit `http://localhost/studyspotnew/index.html` in your browser.

---

## 👥 Team Workflow (5 members)

Suggested role split:
- **UI/UX (Figma → HTML/CSS)** — keep pages pixel-matched to `images/figma-reference/`
- **Frontend (JS)** — wire up `js/main.js`, forms, fetch calls to `php/*.php`
- **Backend (PHP/API)** — `php/` folder, session handling, validation
- **Database** — `database/schema.sql`, queries, relationships
- **QA / Coordinator** — test each flow end-to-end, manage GitHub issues/board

### Git branches
- `main` — always stable/working
- `develop` — integration branch
- `feature/<name>-<page>` — one branch per page/feature, e.g. `feature/sahan-booking`

### Workflow
1. Create a feature branch from `develop`.
2. Commit small, focused changes.
3. Open a Pull Request into `develop`.
4. At least one teammate reviews before merging.
5. Periodically merge `develop` → `main` once tested.

---

## 🔑 Key User Flows

1. **Sign up / Login** → `register.html` / `login.html` → `php/register.php` / `php/login.php`
2. **Find a space** → `explore.html` (filters) or `map.html`
3. **View details** → `space-detail.html?id=<space_id>`
4. **Book it** → `booking.html` → `php/book.php` → `payment.html` → `php/pay.php` → `confirmation.html`
5. **Review it** → `write-review.html` → `php/add-review.php`
6. **Manage account** → `profile.html`, `my-bookings.html`, `favourites.html`

---

## 🩹 Troubleshooting

**Fatal error: Table 'studyspot_db.users' doesn't exist**
You haven't imported the database yet. Go to `http://localhost/phpmyadmin` →
**Import** → choose `database/schema.sql` → **Go**. This creates
`studyspot_db` with all 5 tables (`users`, `spaces`, `bookings`, `reviews`,
`favorites`) and sample data.

**URL shows `studyspotnew/studyspotnew/...`**
The folder got extracted one level too deep — you now have
`htdocs\studyspotnew\studyspotnew\index.html` instead of
`htdocs\studyspotnew\index.html`. Move everything from the inner
`studyspotnew` folder up one level (or delete the outer wrapper folder and
rename the inner one), so that `htdocs\studyspotnew\index.html` exists
directly.

**Icons look like empty boxes / missing**
The site uses self-contained inline SVG icons (see `js/main.js`) — no
internet connection or external font needed. If icons are still missing,
hard-refresh the page (Ctrl+Shift+R) so the browser reloads the latest
`js/main.js`, and check the browser console (F12) for JS errors.

**Map page shows a grey box instead of the map**
`map.html` embeds a free OpenStreetMap iframe, which does need an internet
connection (it loads map tiles from openstreetmap.org). If you'd rather use
Google Maps, replace the `<iframe>` in `map.html` with the Google Maps
JavaScript API and your own API key.

---



- `images/figma-reference/` holds the exported Figma designs — use them as the
  visual source of truth when styling pages.
- Replace the emoji placeholders (📚☕💼🎓) in card thumbnails with real
  photos once you have them — just point `<img>` tags at files you add to `images/`.
- `map.html` currently shows a placeholder box — plug in Google Maps
  JavaScript API or Leaflet + OpenStreetMap and use `spaces.latitude` /
  `spaces.longitude` from the database for real markers.
- Passwords are hashed with PHP's `password_hash()` — never store plain text
  passwords.
- The payment form is a **demo only** (no real card processing) — do not use
  real card details, and do not connect it to a real payment gateway without
  proper PCI-compliant handling.

Last updated: October 28, 2026