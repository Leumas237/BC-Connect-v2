-- BC Connect Seed Data: Institutions
-- Created: 2026-11-12

-- ============================================
-- IUT FOTSO VICTOR BANDJOUN
-- ============================================

INSERT INTO institutions (id, name, slug, domain, logo_url, primary_color, secondary_color, address, city, country, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'IUT Fotso Victor de Bandjoun',
    'iut-fv-bandjoun',
    'iut-fv.edu.cm',
    null,
    '#E91E63',
    '#9C27B0',
    'BP 134 Bandjoun',
    'Bandjoun',
    'Cameroon',
    true
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    domain = EXCLUDED.domain,
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color,
    address = EXCLUDED.address,
    city = EXCLUDED.city,
    country = EXCLUDED.country,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- ============================================
-- FACULTIES
-- ============================================

INSERT INTO faculties (id, institution_id, name, code) VALUES
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Génie Informatique et Télécommunications', 'GIT'),
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Génie Industriel', 'GI'),
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Génie Civil', 'GC'),
    ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Génie Électrique', 'GE'),
    ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Génie Mécanique', 'GM'),
    ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Génie Chimique', 'GCH'),
    ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Sciences de Gestion', 'SG')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    code = EXCLUDED.code;

-- ============================================
-- DEPARTMENTS
-- ============================================

-- GIT Departments
INSERT INTO departments (id, faculty_id, name, code) VALUES
    ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Informatique', 'INFO'),
    ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Télécommunications', 'TELECOM'),
    ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'Réseaux et Systèmes', 'RS')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;

-- GI Departments
INSERT INTO departments (id, faculty_id, name, code) VALUES
    ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 'Génie de la Production', 'GPROD'),
    ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', 'Maintenance Industrielle', 'MAINT')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;

-- GC Departments
INSERT INTO departments (id, faculty_id, name, code) VALUES
    ('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000003', 'Bâtiment et Travaux Publics', 'BTP'),
    ('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000003', 'Hydraulique', 'HYDRO')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;

-- GE Departments
INSERT INTO departments (id, faculty_id, name, code) VALUES
    ('c0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000004', 'Électrotechnique', 'ELECTRO'),
    ('c0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000004', 'Automatique et Informatique Industrielle', 'AII')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;

-- GM Departments
INSERT INTO departments (id, faculty_id, name, code) VALUES
    ('c0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000005', 'Conception Mécanique', 'CMECA'),
    ('c0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000005', 'Fabrication Mécanique', 'FMECA')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;

-- GCH Departments
INSERT INTO departments (id, faculty_id, name, code) VALUES
    ('c0000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000006', 'Génie des Procédés', 'GPROC'),
    ('c0000000-0000-0000-0000-000000000013', 'b0000000-0000-0000-0000-000000000006', 'Chimie Industrielle', 'CHIMIE')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;

-- SG Departments
INSERT INTO departments (id, faculty_id, name, code) VALUES
    ('c0000000-0000-0000-0000-000000000014', 'b0000000-0000-0000-0000-000000000007', 'Gestion des Entreprises', 'GESTION'),
    ('c0000000-0000-0000-0000-000000000015', 'b0000000-0000-0000-0000-000000000007', 'Comptabilité et Finance', 'COMPTA'),
    ('c0000000-0000-0000-0000-000000000016', 'b0000000-0000-0000-0000-000000000007', 'Marketing', 'MKT')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;

-- ============================================
-- ACADEMIC PROGRAMS
-- ============================================

-- Informatique programs
INSERT INTO academic_programs (id, department_id, name, code, duration_years) VALUES
    ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Licence Informatique', 'L-INFO', 3),
    ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Master Informatique', 'M-INFO', 2),
    ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'DUT Informatique', 'DUT-INFO', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code, duration_years = EXCLUDED.duration_years;

-- Télécommunications programs
INSERT INTO academic_programs (id, department_id, name, code, duration_years) VALUES
    ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', 'Licence Télécommunications', 'L-TELECOM', 3),
    ('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 'Master Télécommunications', 'M-TELECOM', 2),
    ('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000002', 'DUT Télécommunications', 'DUT-TELECOM', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code, duration_years = EXCLUDED.duration_years;

-- Réseaux et Systèmes programs
INSERT INTO academic_programs (id, department_id, name, code, duration_years) VALUES
    ('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000003', 'Licence Réseaux et Systèmes', 'L-RS', 3),
    ('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000003', 'Master Réseaux et Systèmes', 'M-RS', 2),
    ('d0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000003', 'DUT Réseaux et Systèmes', 'DUT-RS', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code, duration_years = EXCLUDED.duration_years;

-- Génie de la Production programs
INSERT INTO academic_programs (id, department_id, name, code, duration_years) VALUES
    ('d0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000004', 'Licence Génie de la Production', 'L-GPROD', 3),
    ('d0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000004', 'Master Génie de la Production', 'M-GPROD', 2),
    ('d0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000004', 'DUT Génie de la Production', 'DUT-GPROD', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code, duration_years = EXCLUDED.duration_years;

-- Maintenance Industrielle programs
INSERT INTO academic_programs (id, department_id, name, code, duration_years) VALUES
    ('d0000000-0000-0000-0000-000000000013', 'c0000000-0000-0000-0000-000000000005', 'Licence Maintenance Industrielle', 'L-MAINT', 3),
    ('d0000000-0000-0000-0000-000000000014', 'c0000000-0000-0000-0000-000000000005', 'Master Maintenance Industrielle', 'M-MAINT', 2),
    ('d0000000-0000-0000-0000-000000000015', 'c0000000-0000-0000-0000-000000000005', 'DUT Maintenance Industrielle', 'DUT-MAINT', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code, duration_years = EXCLUDED.duration_years;

-- BTP programs
INSERT INTO academic_programs (id, department_id, name, code, duration_years) VALUES
    ('d0000000-0000-0000-0000-000000000016', 'c0000000-0000-0000-0000-000000000006', 'Licence BTP', 'L-BTP', 3),
    ('d0000000-0000-0000-0000-000000000017', 'c0000000-0000-0000-0000-000000000006', 'Master BTP', 'M-BTP', 2),
    ('d0000000-0000-0000-0000-000000000018', 'c0000000-0000-0000-0000-000000000006', 'DUT BTP', 'DUT-BTP', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code, duration_years = EXCLUDED.duration_years;

-- Hydraulique programs
INSERT INTO academic_programs (id, department_id, name, code, duration_years) VALUES
    ('d0000000-0000-0000-0000-000000000019', 'c0000000-0000-0000-0000-000000000007', 'Licence Hydraulique', 'L-HYDRO', 3),
    ('d0000000-0000-0000-0000-000000000020', 'c0000000-0000-0000-0000-000000000007', 'Master Hydraulique', 'M-HYDRO', 2),
    ('d0000000-0000-0000-0000-000000000021', 'c0000000-0000-0000-0000-000000000007', 'DUT Hydraulique', 'DUT-HYDRO', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code, duration_years = EXCLUDED.duration_years;

-- Électrotechnique programs
INSERT INTO academic_programs (id, department_id, name, code, duration_years) VALUES
    ('d0000000-0000-0000-0000-000000000022', 'c0000000-0000-0000-0000-000000000008', 'Licence Électrotechnique', 'L-ELECTRO', 3),
    ('d0000000-0000-0000-0000-000000000023', 'c0000000-0000-0000-0000-000000000008', 'Master Électrotechnique', 'M-ELECTRO', 2),
    ('d0000000-0000-0000-0000-000000000024', 'c0000000-0000-0000-0000-000000000008', 'DUT Électrotechnique', 'DUT-ELECTRO', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code, duration_years = EXCLUDED.duration_years;

-- AII programs
INSERT INTO academic_programs (id, department_id, name, code, duration_years) VALUES
    ('d0000000-0000-0000-0000-000000000025', 'c0000000-0000-0000-0000-000000000009', 'Licence AII', 'L-AII', 3),
    ('d0000000-0000-0000-0000-000000000026', 'c0000000-0000-0000-0000-000000000009', 'Master AII', 'M-AII', 2),
    ('d0000000-0000-0000-0000-000000000027', 'c0000000-0000-0000-0000-000000000009', 'DUT AII', 'DUT-AII', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code, duration_years = EXCLUDED.duration_years;

-- Conception Mécanique programs
INSERT INTO academic_programs (id, department_id, name, code, duration_years) VALUES
    ('d0000000-0000-0000-0000-000000000028', 'c0000000-0000-0000-0000-000000000010', 'Licence Conception Mécanique', 'L-CMECA', 3),
    ('d0000000-0000-0000-0000-000000000029', 'c0000000-0000-0000-0000-000000000010', 'Master Conception Mécanique', 'M-CMECA', 2),
    ('d0000000-0000-0000-0000-000000000030', 'c0000000-0000-0000-0000-000000000010', 'DUT Conception Mécanique', 'DUT-CMECA', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code, duration_years = EXCLUDED.duration_years;

-- Fabrication Mécanique programs
INSERT INTO academic_programs (id, department_id, name, code, duration_years) VALUES
    ('d0000000-0000-0000-0000-000000000031', 'c0000000-0000-0000-0000-000000000011', 'Licence Fabrication Mécanique', 'L-FMECA', 3),
    ('d0000000-0000-0000-0000-000000000032', 'c0000000-0000-0000-0000-000000000011', 'Master Fabrication Mécanique', 'M-FMECA', 2),
    ('d0000000-0000-0000-0000-000000000033', 'c0000000-0000-0000-0000-000000000011', 'DUT Fabrication Mécanique', 'DUT-FMECA', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code, duration_years = EXCLUDED.duration_years;

-- Génie des Procédés programs
INSERT INTO academic_programs (id, department_id, name, code, duration_years) VALUES
    ('d0000000-0000-0000-0000-000000000034', 'c0000000-0000-0000-0000-000000000012', 'Licence Génie des Procédés', 'L-GPROC', 3),
    ('d0000000-0000-0000-0000-000000000035', 'c0000000-0000-0000-0000-000000000012', 'Master Génie des Procédés', 'M-GPROC', 2),
    ('d0000000-0000-0000-0000-000000000036', 'c0000000-0000-0000-0000-000000000012', 'DUT Génie des Procédés', 'DUT-GPROC', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code, duration_years = EXCLUDED.duration_years;

-- Chimie Industrielle programs
INSERT INTO academic_programs (id, department_id, name, code, duration_years) VALUES
    ('d0000000-0000-0000-0000-000000000037', 'c0000000-0000-0000-0000-000000000013', 'Licence Chimie Industrielle', 'L-CHIMIE', 3),
    ('d0000000-0000-0000-0000-000000000038', 'c0000000-0000-0000-0000-000000000013', 'Master Chimie Industrielle', 'M-CHIMIE', 2),
    ('d0000000-0000-0000-0000-000000000039', 'c0000000-0000-0000-0000-000000000013', 'DUT Chimie Industrielle', 'DUT-CHIMIE', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code, duration_years = EXCLUDED.duration_years;

-- Gestion des Entreprises programs
INSERT INTO academic_programs (id, department_id, name, code, duration_years) VALUES
    ('d0000000-0000-0000-0000-000000000040', 'c0000000-0000-0000-0000-000000000014', 'Licence Gestion', 'L-GESTION', 3),
    ('d0000000-0000-0000-0000-000000000041', 'c0000000-0000-0000-0000-000000000014', 'Master Gestion', 'M-GESTION', 2),
    ('d0000000-0000-0000-0000-000000000042', 'c0000000-0000-0000-0000-000000000014', 'DUT Gestion', 'DUT-GESTION', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code, duration_years = EXCLUDED.duration_years;

-- Comptabilité et Finance programs
INSERT INTO academic_programs (id, department_id, name, code, duration_years) VALUES
    ('d0000000-0000-0000-0000-000000000043', 'c0000000-0000-0000-0000-000000000015', 'Licence Comptabilité', 'L-COMPTA', 3),
    ('d0000000-0000-0000-0000-000000000044', 'c0000000-0000-0000-0000-000000000015', 'Master Comptabilité', 'M-COMPTA', 2),
    ('d0000000-0000-0000-0000-000000000045', 'c0000000-0000-0000-0000-000000000015', 'DUT Comptabilité', 'DUT-COMPTA', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code, duration_years = EXCLUDED.duration_years;

-- Marketing programs
INSERT INTO academic_programs (id, department_id, name, code, duration_years) VALUES
    ('d0000000-0000-0000-0000-000000000046', 'c0000000-0000-0000-0000-000000000016', 'Licence Marketing', 'L-MKT', 3),
    ('d0000000-0000-0000-0000-000000000047', 'c0000000-0000-0000-0000-000000000016', 'Master Marketing', 'M-MKT', 2),
    ('d0000000-0000-0000-0000-000000000048', 'c0000000-0000-0000-0000-000000000016', 'DUT Marketing', 'DUT-MKT', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code, duration_years = EXCLUDED.duration_years;

-- ============================================
-- DEFAULT AD SLOTS FOR IUT FV
-- ============================================

INSERT INTO ad_slots (institution_id, slot_key, slot_name, description, max_banners, display_order) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'discover_top', 'Découverte - Haut', 'Bannière en haut de la page de découverte', 1, 1),
    ('a0000000-0000-0000-0000-000000000001', 'discover_bottom', 'Découverte - Bas', 'Bannière en bas de la page de découverte', 1, 2),
    ('a0000000-0000-0000-0000-000000000001', 'matches_sidebar', 'Matchs - Sidebar', 'Bannière dans la sidebar de la page matchs', 1, 3),
    ('a0000000-0000-0000-0000-000000000001', 'messages_banner', 'Messages - Bannière', 'Bannière en haut de la liste des conversations', 1, 4),
    ('a0000000-0000-0000-0000-000000000001', 'profile_sidebar', 'Profil - Sidebar', 'Bannière dans la sidebar du profil', 1, 5)
ON CONFLICT (institution_id, slot_key) DO UPDATE SET
    slot_name = EXCLUDED.slot_name,
    description = EXCLUDED.description,
    max_banners = EXCLUDED.max_banners,
    display_order = EXCLUDED.display_order,
    is_enabled = true,
    updated_at = NOW();