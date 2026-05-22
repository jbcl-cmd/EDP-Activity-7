<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

require_once 'Database.php';

$db = new Database();
$pdo = $db->getConnection();

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents("php://input"), true) ?? $_POST;
if (!$action) $action = $data['action'] ?? '';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if ($action === 'list') {
            $users = $pdo->query("SELECT * FROM user_ ORDER BY created_at DESC")->fetchAll();
            echo json_encode(['status' => 'success', 'data' => $users]);
            exit;
        }
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if ($action === 'create') {
            // Check for duplicate email
            $check = $pdo->prepare("SELECT user_id FROM user_ WHERE email = :email");
            $check->execute([':email' => trim($data['email'])]);
            if ($check->fetch()) {
                echo json_encode(['status' => 'error', 'message' => 'A user with this email already exists.']);
                exit;
            }

            $stmt = $pdo->prepare("
                INSERT INTO user_ (first_name, last_name, email, contact_number, address, account_status, password)
                VALUES (:first_name, :last_name, :email, :contact_number, :address, :account_status, :password)
            ");
            $stmt->execute([
                ':first_name'      => trim($data['first_name']),
                ':last_name'       => trim($data['last_name']),
                ':email'           => trim($data['email']),
                ':contact_number'  => trim($data['contact_number'] ?? ''),
                ':address'         => trim($data['address'] ?? ''),
                ':account_status'  => $data['account_status'],
                ':password'        => password_hash($data['password'] ?? 'password123', PASSWORD_DEFAULT),
            ]);
            echo json_encode(['status' => 'success', 'message' => 'User added successfully.']);
            exit;
        }

        if ($action === 'update') {
            // Check for duplicate email on update
            $check = $pdo->prepare("SELECT user_id FROM user_ WHERE email = :email AND user_id != :id");
            $check->execute([':email' => trim($data['email']), ':id' => (int)$data['user_id']]);
            if ($check->fetch()) {
                echo json_encode(['status' => 'error', 'message' => 'Another user is already using this email.']);
                exit;
            }

            $params = [
                ':first_name'      => trim($data['first_name']),
                ':last_name'       => trim($data['last_name']),
                ':email'           => trim($data['email']),
                ':contact_number'  => trim($data['contact_number'] ?? ''),
                ':address'         => trim($data['address'] ?? ''),
                ':account_status'  => $data['account_status'],
                ':user_id'         => (int) $data['user_id'],
            ];

            $sql = "UPDATE user_
                    SET first_name     = :first_name,
                        last_name      = :last_name,
                        email          = :email,
                        contact_number = :contact_number,
                        address        = :address,
                        account_status = :account_status";

            if (!empty($data['password'])) {
                $sql .= ", password = :password";
                $params[':password'] = password_hash($data['password'], PASSWORD_DEFAULT);
            }

            $sql .= " WHERE user_id = :user_id";

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            echo json_encode(['status' => 'success', 'message' => 'User updated successfully.']);
            exit;
        }

        if ($action === 'delete') {
            $stmt = $pdo->prepare("DELETE FROM user_ WHERE user_id = :user_id");
            $stmt->execute([':user_id' => (int) $data['id']]);
            echo json_encode(['status' => 'success', 'message' => 'User deleted successfully.']);
            exit;
        }
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Server Error: ' . $e->getMessage()]);
    exit;
}
?>
