-- Switch to the mythomagic database
\c mythomagic;

-- Create the cards table
CREATE TABLE cards (
    card_id SERIAL PRIMARY KEY,
    card_name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    attack INT DEFAULT 0,
    defense INT DEFAULT 0,
    firecost INT DEFAULT 0,
    goldcost INT DEFAULT 0,
    woodcost INT DEFAULT 0,
    bloodcost INT DEFAULT 0,
    extracost INT DEFAULT 0,
    rtype VARCHAR(50) DEFAULT NULL
);

-- Insert 28 cards into the cards table
INSERT INTO cards (card_name, type, rtype) VALUES
('Card1', 'R','F'),
('Card2', 'R', 'W'),
('Card3', 'R', 'B'),
('Card4', 'R', 'W'),
('Card5', 'R', 'G'),
('Card6', 'R', 'G');

INSERT INTO cards (card_name, type, attack, defense, firecost, goldcost, woodcost, bloodcost, extracost) VALUES
('Card7', 'C', 2, 3, 0, 0, 1, 0, 2),
('Card8', 'C', 2, 3, 0, 0, 0, 0, 3),
('Card9', 'C', 2, 3, 0, 0, 1, 0, 2),
('Card10', 'C', 3, 2, 0, 0, 0, 1, 1),
('Card11', 'C', 6, 6, 0, 0, 2, 0, 2),
('Card12', 'C', 3, 3, 0, 0, 0, 1, 2),
('Card13', 'C', 3, 4, 1, 0, 0, 0, 3),
('Card14', 'C', 4, 4, 0, 1, 0, 0, 3),
('Card15', 'C', 2, 3, 1, 0, 0, 1, 1),
('Card16', 'C', 5, 6, 1, 0, 0, 0, 3),
('Card17', 'C', 3, 3, 0, 1, 1, 1, 0),
('Card18', 'C', 4, 4, 0, 0, 2, 0, 3);
