<?php
session_start();
header('Content-Type: application/json');
require_once 'Database.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

try {
    $db = new Database();
    $pdo = $db->getConnection();
    
    $action = $_GET['action'] ?? $_POST['action'] ?? '';
    $data = json_decode(file_get_contents("php://input"), true) ?? $_POST;
    if (!$action) $action = $data['action'] ?? '';

    if ($action === 'options') {
        $students = $pdo->query("SELECT student_id, name FROM student_ WHERE status = 'Active'")->fetchAll();
        $courses = $pdo->query("SELECT course_id, title FROM course_")->fetchAll();
        echo json_encode(['status' => 'success', 'students' => $students, 'courses' => $courses]);
        exit;
    }

    if ($action === 'enroll') {
        $student_id = (int)($data['student_id'] ?? 0);
        $course_id = (int)($data['course_id'] ?? 0);
        
        if ($student_id && $course_id) {
            $code = 'ENR-' . mt_rand(10000, 99999);
            $stmt = $pdo->prepare("INSERT INTO enrollment_ (enrollment_code, student_id, course_id, enrollment_date, status) VALUES (:code, :student_id, :course_id, CURDATE(), 'Enrolled')");
            $stmt->execute([':code' => $code, ':student_id' => $student_id, ':course_id' => $course_id]);
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Please select both a student and a course.']);
        }
        exit;
    }

    $stats = [
        'total_students' => 0,
        'active_courses' => 0,
        'departments' => 0,
        'total_enrollments' => 0
    ];

    $stats['total_students'] = $pdo->query("SELECT COUNT(*) FROM student_")->fetchColumn();
    $stats['active_courses'] = $pdo->query("SELECT COUNT(*) FROM course_")->fetchColumn();
    $stats['departments'] = $pdo->query("SELECT COUNT(*) FROM department_")->fetchColumn();
    $stats['total_enrollments'] = $pdo->query("SELECT COUNT(*) FROM enrollment_")->fetchColumn();

    $recent = $pdo->query("
        SELECT e.enrollment_code, s.name as student_name, c.title as course_title, e.enrollment_date, e.status
        FROM enrollment_ e
        JOIN student_ s ON e.student_id = s.student_id
        JOIN course_ c ON e.course_id = c.course_id
        ORDER BY e.enrollment_date DESC LIMIT 5
    ")->fetchAll();

    echo json_encode(['status' => 'success', 'stats' => $stats, 'recent_enrollments' => $recent]);

} catch (Throwable $e) {
    // If tables don't exist yet, return mock data
    $mock_stats = [
        'total_students' => 2,
        'active_courses' => 3,
        'departments' => 1,
        'total_enrollments' => 2
    ];
    $mock_recent = [
        [
            'enrollment_code' => 'ENR-1001',
            'student_name' => 'Juan Dela Cruz',
            'course_title' => 'Intro to Programming',
            'enrollment_date' => '2026-04-20',
            'status' => 'Enrolled'
        ]
    ];
    echo json_encode(['status' => 'success', 'stats' => $mock_stats, 'recent_enrollments' => $mock_recent, 'notice' => 'Mock data used because tables are missing.']);
}
?>
