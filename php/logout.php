<?php
// ============================================================
//  StudySpot – Logout Handler
// ============================================================

session_start();
session_destroy();

header('Location: ../login.html');
exit;
