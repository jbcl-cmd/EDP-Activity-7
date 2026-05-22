<?php
session_start();
header('Content-Type: application/json');
require_once 'Database.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

$action = $_GET['action'] ?? '';

if ($action === 'generate') {
    $type = $_GET['type'] ?? '';
    $dateFrom = $_GET['dateFrom'] ?? '';
    $dateTo = $_GET['dateTo'] ?? '';

    try {
        $db = new Database();
        $pdo = $db->getConnection();

        $data = [];
        $columns = [];
        $summary = [];

        if ($type === 'Student Master List') {
            $columns = [
                ['key' => 'student_id', 'label' => 'Student ID'],
                ['key' => 'name', 'label' => 'Full Name'],
                ['key' => 'email', 'label' => 'Email Address'],
                ['key' => 'contact_number', 'label' => 'Contact Number'],
                ['key' => 'address', 'label' => 'Address'],
                ['key' => 'status', 'label' => 'Status'],
                ['key' => 'inactive_reason', 'label' => 'Inactive Reason']
            ];
            $data = $pdo->query("SELECT student_id, name, email, contact_number, address, status, inactive_reason FROM student_ ORDER BY student_id")->fetchAll();
            
            // Summary for chart (Active vs Inactive)
            $activeCount = 0;
            $inactiveCount = 0;
            foreach ($data as $row) {
                if ($row['status'] === 'Active') $activeCount++;
                else $inactiveCount++;
            }
            $summary = [
                ['category' => 'Active Students', 'count' => $activeCount],
                ['category' => 'Inactive Students', 'count' => $inactiveCount]
            ];

        } else if ($type === 'Enrollment Summary') {
            $columns = [
                ['key' => 'enrollment_code', 'label' => 'Enrollment Code'],
                ['key' => 'student_name', 'label' => 'Student Name'],
                ['key' => 'course_title', 'label' => 'Course Title'],
                ['key' => 'enrollment_date', 'label' => 'Enrollment Date'],
                ['key' => 'status', 'label' => 'Status']
            ];
            $query = "SELECT e.enrollment_code, s.name as student_name, c.title as course_title, e.enrollment_date, e.status 
                      FROM enrollment_ e 
                      JOIN student_ s ON e.student_id = s.student_id 
                      JOIN course_ c ON e.course_id = c.course_id";
            
            $params = [];
            if ($dateFrom && $dateTo) {
                $query .= " WHERE e.enrollment_date BETWEEN :dateFrom AND :dateTo";
                $params[':dateFrom'] = $dateFrom;
                $params[':dateTo'] = $dateTo;
            }
            $query .= " ORDER BY e.enrollment_date DESC";
            
            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            $data = $stmt->fetchAll();
            
            // Summary for chart (Enrollments per course)
            $courseCounts = [];
            foreach ($data as $row) {
                $course = $row['course_title'];
                if (!isset($courseCounts[$course])) $courseCounts[$course] = 0;
                $courseCounts[$course]++;
            }
            foreach ($courseCounts as $course => $count) {
                $summary[] = ['category' => $course, 'count' => $count];
            }

        } else if ($type === 'User Accounts Report') {
            $columns = [
                ['key' => 'user_id', 'label' => 'User ID'],
                ['key' => 'full_name', 'label' => 'Full Name'],
                ['key' => 'email', 'label' => 'Email Address'],
                ['key' => 'contact_number', 'label' => 'Contact Number'],
                ['key' => 'address', 'label' => 'Address'],
                ['key' => 'account_status', 'label' => 'Account Status'],
                ['key' => 'created_at', 'label' => 'Date Created']
            ];
            $data = $pdo->query("SELECT user_id, CONCAT(first_name, ' ', last_name) as full_name, email, contact_number, address, account_status, DATE_FORMAT(created_at, '%Y-%m-%d') as created_at FROM user_ ORDER BY user_id")->fetchAll();
            
            // Summary for chart (Active vs Inactive)
            $activeCount = 0;
            $inactiveCount = 0;
            foreach ($data as $row) {
                if ($row['account_status'] === 'Active') $activeCount++;
                else $inactiveCount++;
            }
            $summary = [
                ['category' => 'Active Users', 'count' => $activeCount],
                ['category' => 'Inactive Users', 'count' => $inactiveCount]
            ];
        }

        // Get current user name for signature
        $userStmt = $pdo->prepare("SELECT first_name, last_name FROM user_ WHERE user_id = :uid");
        $userStmt->execute([':uid' => $_SESSION['user_id']]);
        $currentUser = $userStmt->fetch();
        $firstName = $currentUser ? $currentUser['first_name'] : 'System';
        $lastName  = $currentUser ? $currentUser['last_name'] : 'Admin';

        echo json_encode([
            'status' => 'success', 
            'report_type' => $type, 
            'columns' => $columns,
            'data' => $data,
            'summary' => $summary,
            'prepared_by' => $firstName . ' ' . $lastName,
            'prepared_by_first' => $firstName,
            'prepared_by_last' => $lastName,
            'generated_at' => date('F d, Y h:i A'),
            'date_from' => $dateFrom,
            'date_to' => $dateTo
        ]);
    } catch (Throwable $e) {
        echo json_encode([
            'status' => 'error', 
            'message' => 'Report generation failed: ' . $e->getMessage()
        ]);
    }
}
?>
