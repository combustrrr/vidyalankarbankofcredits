-- ================================================================
-- SAMPLE DATA FOR DEVELOPMENT AND TESTING
-- Run this after the main migrations for development environment
-- ================================================================

-- Insert sample universities
INSERT INTO universities (id, name, code, address, phone, email, website, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Vidyalankar Institute of Technology', 'VIT', 'Mumbai, Maharashtra, India', '+91-22-1234-5678', 'info@vit.edu.in', 'https://vit.edu.in', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample degree programs
INSERT INTO degree_programs (id, university_id, program_name, program_code, duration_years, total_credits_required, is_active) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Bachelor of Technology', 'BTech', 4, 160, true),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Master of Technology', 'MTech', 2, 80, true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample branches
INSERT INTO branches (id, university_id, degree_program_id, branch_name, branch_code, is_active) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', 'Information Technology', 'INFT', true),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', 'Computer Science', 'COMP', true),
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', 'Electronics', 'ELEX', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample verticals (academic categories)
INSERT INTO academic_verticals (id, university_id, vertical_name, vertical_code, description, is_active) VALUES
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Basic Science Courses', 'BSC', 'Mathematics, Physics, Chemistry courses', true),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Engineering Science Courses', 'ESC', 'Core engineering subjects', true),
('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Professional Core Courses', 'PCC', 'Branch-specific core courses', true),
('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'Professional Elective Courses', 'PEC', 'Branch-specific elective courses', true),
('880e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'Ability Enhancement Courses', 'AEC', 'Communication and soft skills', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample academic year
INSERT INTO academic_years (id, university_id, year_name, start_date, end_date, is_current, is_active) VALUES
('990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '2024-25', '2024-06-01', '2025-05-31', true, true)
ON CONFLICT (id) DO NOTHING;

-- Insert test student accounts
INSERT INTO students (
    id, university_id, degree_program_id, branch_id, academic_year_id,
    student_id, roll_number, email, password_hash, 
    first_name, last_name, full_name, phone, 
    current_semester, degree, branch, semester,
    is_active, is_verified
) VALUES 
-- Test Student 1
(
    'aa0e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    '660e8400-e29b-41d4-a716-446655440001',
    '770e8400-e29b-41d4-a716-446655440001',
    '990e8400-e29b-41d4-a716-446655440001',
    'VIT2024001',
    '2024INFT001',
    'student1@vit.edu.in',
    '$2b$12$LQv3c1yqBwVHxkd/fYJc7eJJKvJJ0rQdBkOzMmQvHjA8Jp4lA8rU6', -- password: student123
    'Rahul',
    'Sharma',
    'Rahul Sharma',
    '+91-98765-43210',
    3,
    'BTech',
    'INFT',
    3,
    true,
    true
),
-- Test Student 2
(
    'aa0e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440000',
    '660e8400-e29b-41d4-a716-446655440001',
    '770e8400-e29b-41d4-a716-446655440001',
    '990e8400-e29b-41d4-a716-446655440001',
    'VIT2024002',
    '2024INFT002',
    'student2@vit.edu.in',
    '$2b$12$LQv3c1yqBwVHxkd/fYJc7eJJKvJJ0rQdBkOzMmQvHjA8Jp4lA8rU6', -- password: student123
    'Priya',
    'Patel',
    'Priya Patel',
    '+91-98765-43211',
    2,
    'BTech',
    'INFT',
    2,
    true,
    true
)
ON CONFLICT (id) DO NOTHING;

-- Success message
SELECT 'Sample data inserted successfully!' as status;
