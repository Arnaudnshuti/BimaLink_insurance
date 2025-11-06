-- ============================================================================
-- BimaLink Sample Data
-- ============================================================================
-- This script creates sample data for testing the BimaLink application
-- Password for all users: password123
-- ============================================================================

-- Insert Admin User (role: ROLE_ADMIN)
INSERT INTO users (username, email, password, role, enabled, created_at, updated_at)
VALUES (
    'admin',
    'admin@bimalink.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- password123
    'ROLE_ADMIN',
    true,
    NOW(),
    NOW()
);

-- Insert Agent Users (role: ROLE_AGENT)
INSERT INTO users (username, email, password, role, enabled, created_at, updated_at)
VALUES 
    ('agent1', 'agent1@bimalink.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ROLE_AGENT', true, NOW(), NOW()),
    ('agent2', 'agent2@bimalink.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ROLE_AGENT', true, NOW(), NOW()),
    ('agent3', 'agent3@bimalink.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ROLE_AGENT', true, NOW(), NOW());

-- Insert Customer Users (role: ROLE_CUSTOMER)
INSERT INTO users (username, email, password, role, enabled, created_at, updated_at)
VALUES 
    ('customer1', 'customer1@bimalink.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ROLE_CUSTOMER', true, NOW(), NOW()),
    ('customer2', 'customer2@bimalink.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ROLE_CUSTOMER', true, NOW(), NOW()),
    ('customer3', 'customer3@bimalink.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ROLE_CUSTOMER', true, NOW(), NOW());

-- Get user IDs for foreign key references
DO $$ 
DECLARE
    admin_id BIGINT;
    agent1_id BIGINT;
    agent2_id BIGINT;
    agent3_id BIGINT;
    customer1_id BIGINT;
    customer2_id BIGINT;
    customer3_id BIGINT;
BEGIN
    SELECT id INTO admin_id FROM users WHERE username = 'admin';
    SELECT id INTO agent1_id FROM users WHERE username = 'agent1';
    SELECT id INTO agent2_id FROM users WHERE username = 'agent2';
    SELECT id INTO agent3_id FROM users WHERE username = 'agent3';
    SELECT id INTO customer1_id FROM users WHERE username = 'customer1';
    SELECT id INTO customer2_id FROM users WHERE username = 'customer2';
    SELECT id INTO customer3_id FROM users WHERE username = 'customer3';

    -- Insert Agent Profiles
    INSERT INTO agents (user_id, agent_code, full_name, phone, nrc_number, address, commission_rate, status, total_policies_sold, total_premiums, total_commissions, created_at, updated_at)
    VALUES 
        (agent1_id, 'AG0001', 'John Doe', '+1234567890', 'NR123456789', '123 Main St, City', 10.00, 'ACTIVE', 25, 50000.00, 5000.00, NOW(), NOW()),
        (agent2_id, 'AG0002', 'Jane Smith', '+2345678901', 'NR987654321', '456 Oak Ave, City', 12.00, 'ACTIVE', 30, 75000.00, 9000.00, NOW(), NOW()),
        (agent3_id, 'AG0003', 'Mike Johnson', '+3456789012', 'NR111222333', '789 Elm Rd, City', 10.00, 'ACTIVE', 15, 30000.00, 3000.00, NOW(), NOW());

    -- Insert Customer Profiles
    INSERT INTO customers (user_id, customer_code, full_name, phone, nrc_number, address, date_of_birth, created_at, updated_at)
    VALUES 
        (customer1_id, 'CU0001', 'Alice Brown', '+4567890123', 'NR444555666', '321 Pine St, City', '1990-05-15', NOW(), NOW()),
        (customer2_id, 'CU0002', 'Bob White', '+5678901234', 'NR777888999', '654 Maple Dr, City', '1985-08-20', NOW(), NOW()),
        (customer3_id, 'CU0003', 'Charlie Green', '+6789012345', 'NR000111222', '987 Cedar Ln, City', '1992-12-10', NOW(), NOW());

    -- Get agent IDs for policies
    DECLARE
        ag1_id BIGINT;
        ag2_id BIGINT;
        ag3_id BIGINT;
        cu1_id BIGINT;
        cu2_id BIGINT;
        cu3_id BIGINT;
    BEGIN
        SELECT id INTO ag1_id FROM agents WHERE agent_code = 'AG0001';
        SELECT id INTO ag2_id FROM agents WHERE agent_code = 'AG0002';
        SELECT id INTO ag3_id FROM agents WHERE agent_code = 'AG0003';
        SELECT id INTO cu1_id FROM customers WHERE customer_code = 'CU0001';
        SELECT id INTO cu2_id FROM customers WHERE customer_code = 'CU0002';
        SELECT id INTO cu3_id FROM customers WHERE customer_code = 'CU0003';

        -- Insert Sample Policies
        INSERT INTO policies (policy_number, agent_id, customer_id, policy_type, premium_amount, coverage_amount, start_date, end_date, status, payment_status, created_at, updated_at)
        VALUES 
            ('POL001', ag1_id, cu1_id, 'motor', 500.00, 50000.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', 'ACTIVE', 'PAID', NOW(), NOW()),
            ('POL002', ag1_id, cu2_id, 'microinsurance', 200.00, 10000.00, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '335 days', 'ACTIVE', 'PAID', NOW(), NOW()),
            ('POL003', ag2_id, cu1_id, 'health', 800.00, 100000.00, CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '350 days', 'ACTIVE', 'PAID', NOW(), NOW()),
            ('POL004', ag2_id, cu3_id, 'travel', 300.00, 20000.00, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '355 days', 'ACTIVE', 'PAID', NOW(), NOW()),
            ('POL005', ag3_id, cu2_id, 'motor', 600.00, 60000.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', 'PENDING', 'PENDING', NOW(), NOW()),
            ('POL006', ag1_id, cu3_id, 'microinsurance', 250.00, 15000.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', 'ACTIVE', 'PAID', NOW(), NOW());

    END;
END $$;

-- ============================================================================
-- Sample Data Inserted Successfully!
-- ============================================================================
-- Test Credentials:
-- 
-- Admin:
--   Email: admin@bimalink.com
--   Password: password123
-- 
-- Agents:
--   Email: agent1@bimalink.com (John Doe)
--   Email: agent2@bimalink.com (Jane Smith)
--   Email: agent3@bimalink.com (Mike Johnson)
--   Password: password123 (for all)
-- 
-- Customers:
--   Email: customer1@bimalink.com (Alice Brown)
--   Email: customer2@bimalink.com (Bob White)
--   Email: customer3@bimalink.com (Charlie Green)
--   Password: password123 (for all)
-- 
-- Sample Data:
--   - 3 Agents with different performance metrics
--   - 3 Customers with profiles
--   - 6 Policies with different types and statuses
-- 
-- ============================================================================

