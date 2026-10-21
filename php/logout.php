<?php
// ============================================================
//  StudySpot – Logout Handler
//  Destroys the PHP session and serves a tiny HTML page that
//  clears localStorage before redirecting to login.html.
// ============================================================

session_start();
session_destroy();

// Serve a small HTML page so JS can clear localStorage too
header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Logging out…</title>
</head>
<body>
  <script>
    // Clear all StudySpot user keys from localStorage
    localStorage.removeItem('study_user');
    localStorage.removeItem('studyspot_user');
    // Redirect to login
    window.location.replace('../login.html');
  </script>
  <noscript>
    <meta http-equiv="refresh" content="0;url=../login.html" />
  </noscript>
</body>
</html>
