<?php
// api/config.php

// Zorunlu: alan adın
define('YSY_DOMAIN', 'yavuzselimyigit.com');

// İsteğe bağlı: SMTP kullanacaksan (PHPMailer ile) burayı doldurursun.
// Şimdilik mail() kullanıyoruz; PHPMailer'e geçince aktif edeceğiz.
define('YSY_SMTP_HOST', 'smtp.hostinger.com'); // çoğu Hostinger kurulumunda bu
define('YSY_SMTP_PORT', 465);
define('YSY_SMTP_USER', 'mail@yavuzselimyigit.com');
define('YSY_SMTP_PASS', 'BURAYA_GIZLI_SIFRE'); // .env mantığı yoksa en azından hPanel’de gizli tut
