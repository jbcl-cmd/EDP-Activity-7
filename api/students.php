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
            $students = $pdo->query("SELECT * FROM student_ ORDER BY name ASC")->fetchAll();
            echo json_encode(['status' => 'success', 'data' => $students]);
            exit;
        }
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if ($action === 'create') {
            $status = $data['status'] ?? 'Active';
            $inactiveReason = ($status === 'Inactive') ? ($data['inactive_reason'] ?? null) : null;

            $stmt = $pdo->prepare("
                INSERT INTO student_ (name, email, contact_number, address, status, inactive_reason)
                VALUES (:name, :email, :contact_number, :address, :status, :inactive_reason)
            ");
            $stmt->execute([
                ':name'            => trim($data['name']),
                ':email'           => trim($data['email']),
                ':contact_number'  => trim($data['contact_number'] ?? ''),
                ':address'         => trim($data['address'] ?? ''),
                ':status'          => $status,
                ':inactive_reason' => $inactiveReason,
            ]);
            echo json_encode(['status' => 'success', 'message' => 'Student added successfully.']);
            exit;
        }

        if ($action === 'update') {
            $status = $data['status'] ?? 'Active';
            $inactiveReason = ($status === 'Inactive') ? ($data['inactive_reason'] ?? null) : null;
            $studentId = (int) $data['student_id'];

            $stmt = $pdo->prepare("
                UPDATE student_
                SET name            = :name,
                    email           = :email,
                    contact_number  = :contact_number,
                    address         = :address,
                    status          = :status,
                    inactive_reason = :inactive_reason
                WHERE student_id = :student_id
            ");
            $stmt->execute([
                ':name'            => trim($data['name']),
                ':email'           => trim($data['email']),
                ':contact_number'  => trim($data['contact_number'] ?? ''),
                ':address'         => trim($data['address'] ?? ''),
                ':status'          => $status,
                ':inactive_reason' => $inactiveReason,
                ':student_id'      => $studentId,
            ]);

            // Update enrollment status based on student status
            if ($status === 'Inactive' && $inactiveReason) {
                // Set all this student's "Enrolled" enrollments to the inactive reason
                $enrollStmt = $pdo->prepare("
                    UPDATE enrollment_ SET status = :reason 
                    WHERE student_id = :sid AND status = 'Enrolled'
                ");
                $enrollStmt->execute([':reason' => $inactiveReason, ':sid' => $studentId]);
            } else if ($status === 'Active') {
                // Restore enrollments back to "Enrolled" when student is reactivated
                $enrollStmt = $pdo->prepare("
                    UPDATE enrollment_ SET status = 'Enrolled' 
                    WHERE student_id = :sid AND status IN ('Dropped', 'Transferred', 'Leave of Absence')
                ");
                $enrollStmt->execute([':sid' => $studentId]);
            }

            echo json_encode(['status' => 'success', 'message' => 'Student updated successfully.']);
            exit;
        }

        if ($action === 'delete') {
            $stmt = $pdo->prepare("DELETE FROM student_ WHERE student_id = :student_id");
            $stmt->execute([':student_id' => (int) $data['id']]);
            echo json_encode(['status' => 'success', 'message' => 'Student deleted successfully.']);
            exit;
        }
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Server Error: ' . $e->getMessage()]);
    exit;
}
?>
