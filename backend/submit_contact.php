<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set JSON header
header('Content-Type: application/json');

// Database configuration
$db_host = "localhost";
$db_user = "root";
$db_password = "";
$db_name = "dg_knitting_db";

// Create connection
$conn = new mysqli($db_host, $db_user, $db_password, $db_name);

// Check connection
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $conn->connect_error]);
    exit;
}

// Check if form was submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Get and sanitize form data
    $name = $conn->real_escape_string(trim($_POST['name'] ?? ''));
    $email = $conn->real_escape_string(trim($_POST['email'] ?? ''));
    $phone = $conn->real_escape_string(trim($_POST['phone'] ?? ''));
    $company = $conn->real_escape_string(trim($_POST['company'] ?? ''));
    $subject = $conn->real_escape_string(trim($_POST['subject'] ?? ''));
    $message = $conn->real_escape_string(trim($_POST['message'] ?? ''));
    $consent = isset($_POST['consent']) ? 1 : 0;
    
    // Get IP address
    $ip_address = $_SERVER['REMOTE_ADDR'] ?? '';
    
    // Validate required fields
    $errors = [];
    if (empty($name)) $errors[] = "Name is required";
    if (empty($email)) $errors[] = "Email is required";
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = "Invalid email format";
    if (empty($subject)) $errors[] = "Subject is required";
    if (empty($message)) $errors[] = "Message is required";
    if (!$consent) $errors[] = "You must accept the privacy policy";
    
    if (!empty($errors)) {
        echo json_encode(["success" => false, "message" => implode(", ", $errors)]);
        exit;
    }
    
    // Check if table exists, if not create it
    $check_table = "SHOW TABLES LIKE 'contact_submissions'";
    $table_result = $conn->query($check_table);
    
    if ($table_result->num_rows == 0) {
        // Create table
        $create_table = "CREATE TABLE contact_submissions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL,
            phone VARCHAR(20),
            company VARCHAR(100),
            subject VARCHAR(200),
            message TEXT NOT NULL,
            consent TINYINT DEFAULT 1,
            ip_address VARCHAR(45),
            status VARCHAR(20) DEFAULT 'new',
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";
        
        if (!$conn->query($create_table)) {
            echo json_encode(["success" => false, "message" => "Failed to create table: " . $conn->error]);
            exit;
        }
    }
    
    // Insert into database
    $sql = "INSERT INTO contact_submissions (name, email, phone, company, subject, message, consent, ip_address, status) 
            VALUES ('$name', '$email', '$phone', '$company', '$subject', '$message', $consent, '$ip_address', 'new')";
    
    if ($conn->query($sql) === TRUE) {
        $insert_id = $conn->insert_id;
        
        // ========== FILE LOGGING WITH ERROR CHECKING ==========
        // Get absolute path to project root
        $project_root = dirname(__DIR__);
        $log_dir = $project_root . '/logs/';
        
        // Try multiple possible paths
        $possible_paths = [
            __DIR__ . '/../logs/',
            dirname(__DIR__) . '/logs/',
            'C:/xampp/htdocs/DG Knitting site/logs/'
        ];
        
        $log_saved = false;
        $log_error = '';
        
        foreach ($possible_paths as $path) {
            if (!file_exists($path)) {
                mkdir($path, 0777, true);
            }
            
            if (is_writable($path) || !file_exists($path)) {
                $log_file = $path . 'inquiries.log';
                $log_entry = "[" . date('Y-m-d H:i:s') . "] ID: $insert_id\n";
                $log_entry .= "Name: $name\n";
                $log_entry .= "Email: $email\n";
                $log_entry .= "Phone: " . ($phone ?: 'Not provided') . "\n";
                $log_entry .= "Company: " . ($company ?: 'Not provided') . "\n";
                $log_entry .= "Subject: $subject\n";
                $log_entry .= "IP Address: $ip_address\n";
                $log_entry .= "Message:\n$message\n";
                $log_entry .= str_repeat("=", 60) . "\n\n";
                
                if (file_put_contents($log_file, $log_entry, FILE_APPEND) !== false) {
                    $log_saved = true;
                    break;
                } else {
                    $log_error = "Cannot write to $path";
                }
            } else {
                $log_error = "Path $path is not writable";
            }
        }
        
        // If logs can't be saved to file, try to save to a debug file in the same directory
        if (!$log_saved) {
            $debug_file = __DIR__ . '/debug_log.txt';
            $debug_entry = "[" . date('Y-m-d H:i:s') . "] ERROR: " . $log_error . "\n";
            $debug_entry .= "ID: $insert_id, Name: $name, Email: $email\n";
            file_put_contents($debug_file, $debug_entry, FILE_APPEND);
        }
        
        // Return success
        echo json_encode([
            "success" => true,
            "message" => "Thank you for reaching out! We'll get back to you within 24 hours.",
            "id" => $insert_id
        ]);
        
    } else {
        echo json_encode(["success" => false, "message" => "Database error: " . $conn->error]);
    }
    
    $conn->close();
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
}
?>