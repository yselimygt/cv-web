<?php
// api/sendmail.php
header('Content-Type: application/json; charset=UTF-8');

require_once __DIR__ . '/config.php';

// Sadece POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Method not allowed']);
  exit;
}

// Origin kontrolü (same-site)
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = [
  'https://' . YSY_DOMAIN,
  'http://'  . YSY_DOMAIN,
];
if ($origin && !in_array($origin, $allowed, true)) {
  // İstersen CORS açabilirsin ama form aynı domainden gelecek.
  // header('Access-Control-Allow-Origin: https://'.YSY_DOMAIN);
  http_response_code(403);
  echo json_encode(['error' => 'Forbidden']);
  exit;
}

// Anti-CSRF (isteğe bağlı): referer domain kontrolü
if (!empty($_SERVER['HTTP_REFERER']) && strpos($_SERVER['HTTP_REFERER'], YSY_DOMAIN) === false) {
  http_response_code(403);
  echo json_encode(['error' => 'Invalid referer']);
  exit;
}

// Rate-limit (çok basit): IP başına dakika başına 1 istek
session_start();
$ip = $_SERVER['REMOTE_ADDR'] ?? 'x';
$now = time();
if (!isset($_SESSION['last_submit'])) $_SESSION['last_submit'] = [];
$last = $_SESSION['last_submit'][$ip] ?? 0;
if ($now - $last < 60) {
  http_response_code(429);
  echo json_encode(['error' => 'Çok hızlısın. Lütfen 1 dakika sonra tekrar dene.']);
  exit;
}

// Girdi al
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$msg = trim($data['msg'] ?? '');
$honeypot = trim($data['website'] ?? ''); // honeypot; UI’da görünmeyecek

// Basit doğrulamalar
if ($honeypot !== '') {
  http_response_code(400);
  echo json_encode(['error' => 'Spam algılandı.']);
  exit;
}
if ($name === '' || $email === '' || $msg === '') {
  http_response_code(400);
  echo json_encode(['error' => 'Tüm alanlar zorunlu.']);
  exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(['error' => 'Geçersiz e-posta.']);
  exit;
}
if (mb_strlen($name) > 120 || mb_strlen($email) > 200 || mb_strlen($msg) > 4000) {
  http_response_code(400);
  echo json_encode(['error' => 'Alan sınırı aşıldı.']);
  exit;
}

// Basit XSS temizliği
$safeName  = htmlspecialchars($name, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$safeEmail = htmlspecialchars($email, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$safeMsg   = nl2br(htmlspecialchars($msg, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'));

// Alıcı
$to = 'mail@' . YSY_DOMAIN;
$subject = "Yeni Mesaj (Portföy Formu) - {$safeName}";

// HTML içerik
$html = <<<HTML
<h3>Portföy İletişim Formu</h3>
<p><strong>Ad Soyad:</strong> {$safeName}</p>
<p><strong>E-posta:</strong> {$safeEmail}</p>
<p><strong>Mesaj:</strong><br>{$safeMsg}</p>
<hr>
<p style="font-size:12px;color:#666">Gönderim zamanı: {date('Y-m-d H:i:s')}</p>
HTML;

// Düz metin (fallback)
$text = "Portföy İletişim Formu\n"
      . "Ad Soyad: {$name}\n"
      . "E-posta: {$email}\n\n"
      . "Mesaj:\n{$msg}\n";

// Header’lar
$from = 'Portfolio Form <mail@' . YSY_DOMAIN . '>'; // kendi domaininden
$headers = [];
$headers[] = "MIME-Version: 1.0";
$headers[] = "Content-Type: text/html; charset=UTF-8";
$headers[] = "From: {$from}";
$headers[] = "Reply-To: {$safeName} <{$email}>";
$headers[] = "X-Mailer: PHP/" . phpversion();
$headers[] = "X-Origin-Domain: " . YSY_DOMAIN;

// Hostinger’de envelope sender (-f) ayarlamak SPAM riskini azaltır
$additional_params = "-f mail@" . YSY_DOMAIN;

// Gönder
$ok = @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $html, implode("\r\n", $headers), $additional_params);

if ($ok) {
  $_SESSION['last_submit'][$ip] = $now;
  echo json_encode(['success' => true]);
} else {
  http_response_code(500);
  echo json_encode(['error' => 'Mail gönderimi başarısız.']);
}
