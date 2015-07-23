<?php
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

/**
This script redirects all calls to the real Web Service.
This is required to allow AJAX calls as cross-domain requests are normally not allowed.
*/

// URL of the target script
$url = "http://host.bisswanger.com/dhbw/calendar.php";

// Attach GET fields to URL
$get = "";

foreach ($_GET as $key => $value)
{
    $key = htmlspecialchars($key);
    $value = htmlspecialchars($value);
    if ($get != "")
    {
        $get .= "&";
    }
    $get .= "$key=$value";
}

if ($get != "")
{
    $url .= "?" . $get;
}

// Handle POST fields
$post = array();

foreach ($_POST as $key => $value)
{
    $key = htmlspecialchars($key);
    $value = htmlspecialchars($value);

    $post[$key] = $value;
}

// Handle FILE attachments
$header = "";

foreach ($_FILES as $key => $value)
{
    $header = array('Content-Type: multipart/form-data');
	$post[htmlspecialchars($key)] = new CurlFile($value['tmp_name'], $value['type'], $value['name']);
}

// Init cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
curl_setopt($ch, CURLOPT_HEADER, FALSE);
curl_setopt ($ch, CURLOPT_CONNECTTIMEOUT, 20);
curl_setopt ($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);

if (count($post) > 0)
{
    curl_setopt($ch, CURLOPT_POST, TRUE);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
}

if ($header != "")
{
    curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
}

// Execute request
$result = curl_exec($ch);

// Redirect content type
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
header("Content-Type: " . $contentType);

// Close connection
curl_close($ch);

// return web service result
print $result;

// vim: set ft=php shiftwidth=4 noexpandtab eol ff=unix :
