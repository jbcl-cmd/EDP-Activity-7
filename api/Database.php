<?php
class Database {
    public $pdo;

    private $host     = '127.0.0.1';
    private $port     = '3307';        
    private $dbname   = 'school_system';
    private $username = 'root';
    private $password = '';            

    public function __construct() {
        // Connect WITHOUT dbname first to ensure database exists
        $dsn_setup = "mysql:host={$this->host};port={$this->port};charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        
        try {
            $setupPdo = new PDO($dsn_setup, $this->username, $this->password, $options);
            // Auto-create database if it doesn't exist
            $setupPdo->exec("CREATE DATABASE IF NOT EXISTS `{$this->dbname}`");
            
            // Now connect specifically to the database
            $dsn = "mysql:host={$this->host};port={$this->port};dbname={$this->dbname};charset=utf8mb4";
            $this->pdo = new PDO($dsn, $this->username, $this->password, $options);
            
            // Auto-initialize tables so the user doesn't have to manually run SQL!
            $this->initializeTables();
            
        } catch (PDOException $e) {
            http_response_code(500);
            die(json_encode(["status" => "error", "message" => "Database connection failed (Make sure your XAMPP port is " . $this->port . "): " . $e->getMessage()]));
        }
    }

    private function initializeTables() {
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS user_ (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(150) NOT NULL UNIQUE,
                contact_number VARCHAR(50),
                address VARCHAR(255),
                account_status ENUM('Active', 'Inactive') DEFAULT 'Active',
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS student_ (
                student_id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(150),
                contact_number VARCHAR(50),
                address VARCHAR(255),
                status VARCHAR(50) DEFAULT 'Active'
            );

            CREATE TABLE IF NOT EXISTS course_ (
                course_id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                credits INT DEFAULT 3
            );

            CREATE TABLE IF NOT EXISTS department_ (
                dept_id INT AUTO_INCREMENT PRIMARY KEY,
                dept_name VARCHAR(255) NOT NULL
            );

            CREATE TABLE IF NOT EXISTS enrollment_ (
                enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
                enrollment_code VARCHAR(50) NOT NULL,
                student_id INT,
                course_id INT,
                enrollment_date DATE,
                status VARCHAR(50) DEFAULT 'Enrolled',
                FOREIGN KEY (student_id) REFERENCES student_(student_id),
                FOREIGN KEY (course_id) REFERENCES course_(course_id)
            );
        ");

        try {
            $this->pdo->exec("ALTER TABLE user_ ADD COLUMN address VARCHAR(255)");
        } catch (PDOException $e) {}
        try {
            $this->pdo->exec("ALTER TABLE student_ ADD COLUMN contact_number VARCHAR(50)");
        } catch (PDOException $e) {}
        try {
            $this->pdo->exec("ALTER TABLE student_ ADD COLUMN address VARCHAR(255)");
        } catch (PDOException $e) {}
        try {
            $this->pdo->exec("ALTER TABLE student_ ADD COLUMN inactive_reason VARCHAR(50) DEFAULT NULL");
        } catch (PDOException $e) {}

        // Insert default admin if no users exist
        $stmt = $this->pdo->query("SELECT COUNT(*) FROM user_");
        if ($stmt->fetchColumn() == 0) {
            $hash = password_hash('admin123', PASSWORD_DEFAULT);
            $insert = $this->pdo->prepare("INSERT INTO user_ (first_name, last_name, email, contact_number, address, account_status, password) VALUES ('System', 'Admin', 'admin@schoolofrock.edu', '123-456-7890', 'Main Campus', 'Active', :hash)");
            $insert->execute([':hash' => $hash]);
        } else {
            // Ensure the existing admin has an address for testing recovery
            $this->pdo->exec("UPDATE user_ SET address = 'Main Campus' WHERE email = 'admin@schoolofrock.edu' AND (address IS NULL OR address = '')");
        }
        
        // Insert mock data if no students exist
        $stmt = $this->pdo->query("SELECT COUNT(*) FROM student_");
        if ($stmt->fetchColumn() == 0) {
            $this->pdo->exec("
                INSERT INTO student_ (name, email) VALUES ('Juan Dela Cruz', 'juan@example.com'), ('Maria Clara', 'maria@example.com');
                INSERT INTO course_ (title) VALUES ('Intro to Programming'), ('Data Structures'), ('Web Development');
                INSERT INTO department_ (dept_name) VALUES ('Computer Science');
                INSERT INTO enrollment_ (enrollment_code, student_id, course_id, enrollment_date) VALUES ('ENR-1001', 1, 1, '2026-04-20'), ('ENR-1002', 2, 3, '2026-04-21');
            ");
        }
    }

    public function getConnection() {
        return $this->pdo;
    }
}
?>
