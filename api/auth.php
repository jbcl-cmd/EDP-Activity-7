<?php
session_start();
header('Content-Type: application/json');
require_once 'Database.php';

$action = $_GET['action'] ?? $_POST['action'] ?? '';
$data = json_decode(file_get_contents("php://input"), true) ?? $_POST;
$action = $data['action'] ?? $action;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        if ($action === 'login') {
            $username = trim($data['username'] ?? '');
            $password = $data['password'] ?? '';

            if ($username && $password) {
                $db = new Database();
                $pdo = $db->getConnection();
                
                $stmt = $pdo->prepare("SELECT * FROM user_ WHERE email = :user1 OR first_name = :user2");
                $stmt->execute([':user1' => $username, ':user2' => $username]);
                $user = $stmt->fetch();

                if ($user && password_verify($password, $user['password'])) {
                    if ($user['account_status'] === 'Active') {
                        $_SESSION['user_id'] = $user['user_id'];
                        $_SESSION['name'] = $user['first_name'] . ' ' . $user['last_name'];
                        echo json_encode(['status' => 'success']);
                    } else {
                        echo json_encode(['status' => 'error', 'message' => 'Your account is inactive.']);
                    }
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Invalid username or password.']);
                }
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Please fill in all fields.']);
            }
            exit;
        }
        
        if ($action === 'signup') {
            $first_name = trim($data['first_name'] ?? '');
            $last_name = trim($data['last_name'] ?? '');
            $email = trim($data['email'] ?? '');
            $contact_number = trim($data['contact_number'] ?? '');
            $address = trim($data['address'] ?? '');
            $password = $data['password'] ?? '';

            if ($first_name && $last_name && $email && $address && $password) {
                $db = new Database();
                $pdo = $db->getConnection();
                
                $stmt = $pdo->prepare("SELECT user_id FROM user_ WHERE email = :email");
                $stmt->execute([':email' => $email]);
                if ($stmt->fetch()) {
                    echo json_encode(['status' => 'error', 'message' => 'Email is already registered.']);
                    exit;
                }

                $stmt = $pdo->prepare("
                    INSERT INTO user_ (first_name, last_name, email, contact_number, address, account_status, password)
                    VALUES (:first_name, :last_name, :email, :contact_number, :address, 'Active', :password)
                ");
                $stmt->execute([
                    ':first_name'      => $first_name,
                    ':last_name'       => $last_name,
                    ':email'           => $email,
                    ':contact_number'  => $contact_number,
                    ':address'         => $address,
                    ':password'        => password_hash($password, PASSWORD_DEFAULT),
                ]);
                
                // Auto login after signup
                $userId = $pdo->lastInsertId();
                $_SESSION['user_id'] = $userId;
                $_SESSION['name'] = $first_name . ' ' . $last_name;
                
                echo json_encode(['status' => 'success']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Please fill in all required fields.']);
            }
            exit;
        }
        
        if ($action === 'recover') {
            $email = trim($data['email'] ?? '');
            $address = trim($data['address'] ?? '');
            $newPassword = $data['new_password'] ?? '';
            
            if ($email && $address && $newPassword) {
                $db = new Database();
                $pdo = $db->getConnection();
                
                $stmt = $pdo->prepare("SELECT * FROM user_ WHERE email = :email");
                $stmt->execute([':email' => $email]);
                $user = $stmt->fetch();
                
                if ($user) {
                    if (strtolower(trim($user['address'] ?? '')) === strtolower($address)) {
                        $hash = password_hash($newPassword, PASSWORD_DEFAULT);
                        $update = $pdo->prepare("UPDATE user_ SET password = :password WHERE email = :email");
                        $update->execute([':password' => $hash, ':email' => $email]);
                        echo json_encode(['status' => 'success', 'message' => "Your password has been successfully reset! You can now login."]);
                    } else {
                        echo json_encode(['status' => 'error', 'message' => 'The address provided does not match our records.']);
                    }
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'No account found with that email.']);
                }
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Please fill in all recovery fields.']);
            }
            exit;
        }
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Server Error: ' . $e->getMessage()]);
        exit;
    }
}

if ($action === 'logout') {
    session_destroy();
    echo json_encode(['status' => 'success']);
    exit;
}

if ($action === 'check') {
    if (isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'authenticated', 'name' => $_SESSION['name']]);
    } else {
        echo json_encode(['status' => 'unauthenticated']);
    }
    exit;
}

// Fallback if no action matched
echo json_encode(['status' => 'error', 'message' => "Invalid request. Action received: '$action'"]);
exit;
?>
