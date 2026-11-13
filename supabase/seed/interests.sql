-- BC Connect Seed Data: Interests & Academic Levels
-- Created: 2026-11-12

-- ============================================
-- ACADEMIC LEVELS
-- ============================================

INSERT INTO academic_levels (id, name, code, order_index) VALUES
    ('e0000000-0000-0000-0000-000000000001', 'DUT 1', 'DUT1', 1),
    ('e0000000-0000-0000-0000-000000000002', 'DUT 2', 'DUT2', 2),
    ('e0000000-0000-0000-0000-000000000003', 'Licence 1', 'L1', 3),
    ('e0000000-0000-0000-0000-000000000004', 'Licence 2', 'L2', 4),
    ('e0000000-0000-0000-0000-000000000005', 'Licence 3', 'L3', 5),
    ('e0000000-0000-0000-0000-000000000006', 'Master 1', 'M1', 6),
    ('e0000000-0000-0000-0000-000000000007', 'Master 2', 'M2', 7),
    ('e0000000-0000-0000-0000-000000000008', 'Doctorat', 'DOC', 8)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    order_index = EXCLUDED.order_index;

-- ============================================
-- INTERESTS CATALOG
-- ============================================

-- Technology & Sciences
INSERT INTO interests (id, name, slug, category, icon_name) VALUES
    ('f0000000-0000-0000-0000-000000000001', 'Intelligence Artificielle', 'ia', 'technologie', 'cpu'),
    ('f0000000-0000-0000-0000-000000000002', 'Programmation', 'programmation', 'technologie', 'code'),
    ('f0000000-0000-0000-0000-000000000003', 'Cybersécurité', 'cybersecurite', 'technologie', 'shield'),
    ('f0000000-0000-0000-0000-000000000004', 'Data Science', 'data-science', 'technologie', 'database'),
    ('f0000000-0000-0000-0000-000000000005', 'Développement Web', 'dev-web', 'technologie', 'globe'),
    ('f0000000-0000-0000-0000-000000000006', 'Développement Mobile', 'dev-mobile', 'technologie', 'smartphone'),
    ('f0000000-0000-0000-0000-000000000007', 'IoT & Objets Connectés', 'iot', 'technologie', 'wifi'),
    ('f0000000-0000-0000-0000-000000000008', 'Robotique', 'robotique', 'technologie', 'bot'),
    ('f0000000-0000-0000-0000-000000000009', 'Blockchain & Crypto', 'blockchain', 'technologie', 'bitcoin'),
    ('f0000000-0000-0000-0000-000000000010', 'Réalité Virtuelle/Augmentée', 'vr-ar', 'technologie', 'headset'),
    ('f0000000-0000-0000-0000-000000000011', 'Physique', 'physique', 'sciences', 'atom'),
    ('f0000000-0000-0000-0000-000000000012', 'Chimie', 'chimie', 'sciences', 'flask-conical'),
    ('f0000000-0000-0000-0000-000000000013', 'Biologie', 'biologie', 'sciences', 'dna'),
    ('f0000000-0000-0000-0000-000000000014', 'Mathématiques', 'mathematiques', 'sciences', 'calculator'),
    ('f0000000-0000-0000-0000-000000000015', 'Astronomie', 'astronomie', 'sciences', 'star'),
    ('f0000000-0000-0000-0000-000000000016', 'Sciences de l\'environnement', 'environnement', 'sciences', 'leaf'),
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    icon_name = EXCLUDED.icon_name;

-- Arts & Culture
INSERT INTO interests (id, name, slug, category, icon_name) VALUES
    ('f0000000-0000-0000-0000-000000000017', 'Musique', 'musique', 'arts', 'music'),
    ('f0000000-0000-0000-0000-000000000018', 'Cinéma', 'cinema', 'arts', 'film'),
    ('f0000000-0000-0000-0000-000000000019', 'Séries TV', 'series-tv', 'arts', 'tv'),
    ('f0000000-0000-0000-0000-000000000020', 'Théâtre', 'theatre', 'arts', 'drama'),
    ('f0000000-0000-0000-0000-000000000021', 'Danse', 'danse', 'arts', 'sparkles'),
    ('f0000000-0000-0000-0000-000000000022', 'Peinture & Dessin', 'peinture-dessin', 'arts', 'palette'),
    ('f0000000-0000-0000-0000-000000000023', 'Photographie', 'photographie', 'arts', 'camera'),
    ('f0000000-0000-0000-0000-000000000024', 'Design Graphique', 'design-graphique', 'arts', 'pen-tool'),
    ('f0000000-0000-0000-0000-000000000025', 'Mode & Stylisme', 'mode', 'arts', 'shirt'),
    ('f0000000-0000-0000-0000-000000000026', 'Architecture', 'architecture', 'arts', 'building-2'),
    ('f0000000-0000-0000-0000-000000000027', 'Littérature', 'litterature', 'arts', 'book-open'),
    ('f0000000-0000-0000-0000-000000000028', 'Poésie', 'poesie', 'arts', 'feather'),
    ('f0000000-0000-0000-0000-000000000029', 'Bande Dessinée / Manga', 'bd-manga', 'arts', 'book'),
    ('f0000000-0000-0000-0000-000000000030', 'Histoire', 'histoire', 'culture', 'landmark'),
    ('f0000000-0000-0000-0000-000000000031', 'Philosophie', 'philosophie', 'culture', 'brain'),
    ('f0000000-0000-0000-0000-000000000032', 'Musées & Expositions', 'musees', 'culture', 'building'),
    ('f0000000-0000-0000-0000-000000000033', 'Patrimoine Culturel', 'patrimoine', 'culture', 'monument')
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    icon_name = EXCLUDED.icon_name;

-- Sports & Bien-être
INSERT INTO interests (id, name, slug, category, icon_name) VALUES
    ('f0000000-0000-0000-0000-000000000034', 'Football', 'football', 'sport', 'football'),
    ('f0000000-0000-0000-0000-000000000035', 'Basketball', 'basketball', 'sport', 'basketball'),
    ('f0000000-0000-0000-0000-000000000036', 'Volleyball', 'volleyball', 'sport', 'volleyball'),
    ('f0000000-0000-0000-0000-000000000037', 'Tennis', 'tennis', 'sport', 'tennis'),
    ('f0000000-0000-0000-0000-000000000038', 'Natation', 'natation', 'sport', 'waves'),
    ('f0000000-0000-0000-0000-000000000039', 'Course à pied', 'course', 'sport', 'running'),
    ('f0000000-0000-0000-0000-000000000040', 'Fitness / Musculation', 'fitness', 'sport', 'dumbbell'),
    ('f0000000-0000-0000-0000-000000000041', 'Yoga', 'yoga', 'bien-etre', 'flower-2'),
    ('f0000000-0000-0000-0000-000000000042', 'Méditation', 'meditation', 'bien-etre', 'sparkle'),
    ('f0000000-0000-0000-0000-000000000043', 'Randonnée', 'randonnee', 'sport', 'mountain'),
    ('f0000000-0000-0000-0000-000000000044', 'Cyclisme', 'cyclisme', 'sport', 'bike'),
    ('f0000000-0000-0000-0000-000000000045', 'Arts Martiaux', 'arts-martiaux', 'sport', 'fist'),
    ('f0000000-0000-0000-0000-000000000046', 'Danse Sportive', 'danse-sportive', 'sport', 'zap'),
    ('f0000000-0000-0000-0000-000000000047', 'E-sport', 'esport', 'sport', 'gamepad-2'),
    ('f0000000-0000-0000-0000-000000000048', 'Nutrition & Cuisine Saine', 'nutrition', 'bien-etre', 'apple'),
    ('f0000000-0000-0000-0000-000000000049', 'Développement Personnel', 'dev-personnel', 'bien-etre', 'trending-up')
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    icon_name = EXCLUDED.icon_name;

-- Gaming & Divertissement
INSERT INTO interests (id, name, slug, category, icon_name) VALUES
    ('f0000000-0000-0000-0000-000000000050', 'Jeux Vidéo', 'jeux-video', 'gaming', 'gamepad'),
    ('f0000000-0000-0000-0000-000000000051', 'Jeux de Société', 'jeux-societe', 'gaming', 'puzzle'),
    ('f0000000-0000-0000-0000-000000000052', 'Jeux de Rôle (JDR)', 'jdr', 'gaming', 'dice'),
    ('f0000000-0000-0000-0000-000000000053', 'Jeux de Cartes', 'jeux-cartes', 'gaming', 'square'),
    ('f0000000-0000-0000-0000-000000000054', 'Streaming / Twitch', 'streaming', 'gaming', 'tv-2'),
    ('f0000000-0000-0000-0000-000000000055', 'Speedrunning', 'speedrunning', 'gaming', 'timer'),
    ('f0000000-0000-0000-0000-000000000056', 'Cosplay', 'cosplay', 'gaming', 'mask'),
    ('f0000000-0000-0000-0000-000000000057', 'Retrogaming', 'retrogaming', 'gaming', 'cpu'),
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    icon_name = EXCLUDED.icon_name;

-- Entrepreneuriat & Carrière
INSERT INTO interests (id, name, slug, category, icon_name) VALUES
    ('f0000000-0000-0000-0000-000000000058', 'Entrepreneuriat', 'entrepreneuriat', 'entrepreneuriat', 'rocket'),
    ('f0000000-0000-0000-0000-000000000059', 'Startups', 'startups', 'entrepreneuriat', 'zap'),
    ('f0000000-0000-0000-0000-000000000060', 'Investissement', 'investissement', 'entrepreneuriat', 'trending-up'),
    ('f0000000-0000-0000-0000-000000000061', 'Marketing Digital', 'marketing-digital', 'entrepreneuriat', 'megaphone'),
    ('f0000000-0000-0000-0000-000000000062', 'Gestion de Projet', 'gestion-projet', 'entrepreneuriat', 'clipboard-list'),
    ('f0000000-0000-0000-0000-000000000063', 'Leadership', 'leadership', 'entrepreneuriat', 'users'),
    ('f0000000-0000-0000-0000-000000000064', 'Innovation', 'innovation', 'entrepreneuriat', 'lightbulb'),
    ('f0000000-0000-0000-0000-000000000065', 'Freelance', 'freelance', 'entrepreneuriat', 'briefcase'),
    ('f0000000-0000-0000-0000-000000000066', 'Économie', 'economie', 'entrepreneuriat', 'coins'),
    ('f0000000-0000-0000-0000-000000000067', 'Finance Personnelle', 'finance-personnelle', 'entrepreneuriat', 'wallet'),
    ('f0000000-0000-0000-0000-000000000068', 'Réseautage Professionnel', 'reseautage-pro', 'entrepreneuriat', 'handshake'),
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    icon_name = EXCLUDED.icon_name;

-- Voyages & Aventure
INSERT INTO interests (id, name, slug, category, icon_name) VALUES
    ('f0000000-0000-0000-0000-000000000069', 'Voyages', 'voyages', 'voyages', 'plane'),
    ('f0000000-0000-0000-0000-000000000070', 'Backpacking', 'backpacking', 'voyages', 'backpack'),
    ('f0000000-0000-0000-0000-000000000071', 'Road Trip', 'road-trip', 'voyages', 'car'),
    ('f0000000-0000-0000-0000-000000000072', 'Camping', 'camping', 'voyages', 'tent'),
    ('f0000000-0000-0000-0000-000000000073', 'Découverte de Cultures', 'decouverte-cultures', 'voyages', 'globe'),
    ('f0000000-0000-0000-0000-000000000074', 'Photographie de Voyage', 'photo-voyage', 'voyages', 'camera'),
    ('f0000000-0000-0000-0000-000000000075', 'Langues Étrangères', 'langues', 'voyages', 'languages'),
    ('f0000000-0000-0000-0000-000000000076', 'Gastronomie Locale', 'gastronomie', 'voyages', 'utensils'),
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    icon_name = EXCLUDED.icon_name;

-- Social & Humanitaire
INSERT INTO interests (id, name, slug, category, icon_name) VALUES
    ('f0000000-0000-0000-0000-000000000077', 'Bénévolat', 'benevolat', 'social', 'heart-handshake'),
    ('f0000000-0000-0000-0000-000000000078', 'Associations Étudiantes', 'associations-etudiantes', 'social', 'users'),
    ('f0000000-0000-0000-0000-000000000079', 'Droits Humains', 'droits-humains', 'social', 'scale'),
    ('f0000000-0000-0000-0000-000000000080', 'Écologie / Climat', 'ecologie', 'social', 'globe'),
    ('f0000000-0000-0000-0000-000000000081', 'Protection Animale', 'protection-animale', 'social', 'paw-print'),
    ('f0000000-0000-0000-0000-000000000082', 'Éducation pour Tous', 'education', 'social', 'graduation-cap'),
    ('f0000000-0000-0000-0000-000000000083', 'Santé Publique', 'sante-publique', 'social', 'heart-pulse'),
    ('f0000000-0000-0000-0000-000000000084', 'Aide Humanitaire', 'aide-humanitaire', 'social', 'package'),
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    icon_name = EXCLUDED.icon_name;

-- Mode de Vie & Loisirs
INSERT INTO interests (id, name, slug, category, icon_name) VALUES
    ('f0000000-0000-0000-0000-000000000085', 'Cuisine / Pâtisserie', 'cuisine', 'loisirs', 'chef-hat'),
    ('f0000000-0000-0000-0000-000000000086', 'Pâtisserie', 'patisserie', 'loisirs', 'cake'),
    ('f0000000-0000-0000-0000-000000000087', 'Lecture', 'lecture', 'loisirs', 'book-open'),
    ('f0000000-0000-0000-0000-000000000088', 'Écriture', 'ecriture', 'loisirs', 'pen'),
    ('f0000000-0000-0000-0000-000000000089', 'Blogging / Vlogging', 'blogging', 'loisirs', 'video'),
    ('f0000000-0000-0000-0000-000000000090', 'Podcasts', 'podcasts', 'loisirs', 'mic'),
    ('f0000000-0000-0000-0000-000000000091', 'DIY / Bricolage', 'diy', 'loisirs', 'hammer'),
    ('f0000000-0000-0000-0000-000000000092', 'Jardinage', 'jardinage', 'loisirs', 'sprout'),
    ('f0000000-0000-0000-0000-000000000093', 'Animaux de Compagnie', 'animaux', 'loisirs', 'heart'),
    ('f0000000-0000-0000-0000-000000000094', 'Mode & Shopping', 'mode-shopping', 'loisirs', 'shopping-bag'),
    ('f0000000-0000-0000-0000-000000000095', 'Beauté & Soins', 'beaute-soins', 'loisirs', 'sparkles'),
    ('f0000000-0000-0000-0000-000000000096', 'Décoration Intérieure', 'deco-interieure', 'loisirs', 'home'),
    ('f0000000-0000-0000-0000-000000000097', 'Collection', 'collection', 'loisirs', 'archive'),
    ('f0000000-0000-0000-0000-000000000098', 'Autres', 'autres', 'autres', 'more-horizontal')
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    icon_name = EXCLUDED.icon_name;