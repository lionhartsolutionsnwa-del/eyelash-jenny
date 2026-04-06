-- Update admin user roles
-- Jenny is the employee; Mo and Edison are managers
UPDATE admin_users SET role = 'employee' WHERE phone = '+14793297979'; -- Jenny
UPDATE admin_users SET role = 'manager' WHERE phone = '+18328606170'; -- Edison
UPDATE admin_users SET role = 'manager' WHERE phone = '+14799667198'; -- Mo
