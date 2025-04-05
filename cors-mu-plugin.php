<?php
/**
 * Plugin Name: CORS Media Headers
 * Description: Adds CORS headers to media files
 * Version: 1.0
 * Author: Site Admin
 */

// Send CORS headers for media files
function cors_media_headers() {
    // Only for media files
    if (strpos($_SERVER['REQUEST_URI'], '/wp-content/uploads/') !== false) {
        $extension = pathinfo($_SERVER['REQUEST_URI'], PATHINFO_EXTENSION);
        $extension = strtolower($extension);
        
        if (in_array($extension, ['mp4', 'webm', 'ogg', 'mp3', 'wav'])) {
            header('Access-Control-Allow-Origin: *');
            header('Access-Control-Allow-Methods: GET, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type');
            
            // If this is a preflight request, exit early
            if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
                status_header(200);
                exit();
            }
        }
    }
}

// Hook into WordPress as early as possible
add_action('plugins_loaded', 'cors_media_headers', 1);
add_action('init', 'cors_media_headers', 1);
add_action('send_headers', 'cors_media_headers', 1); 