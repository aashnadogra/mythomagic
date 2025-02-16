-- Switch to the mythomagic database
\c mythomagic;

-- Create the cards table
CREATE TABLE cards (
    card_id SERIAL PRIMARY KEY,
    card_name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    attack INT NOT NULL,
    defense INT NOT NULL
);

-- Insert 28 cards into the cards table
INSERT INTO cards (card_name, type, attack, defense) VALUES
('Card1', 'Type1', 10, 20),
('Card2', 'Type2', 15, 25),
('Card3', 'Type1', 20, 30),
('Card4', 'Type2', 25, 35),
('Card5', 'Type1', 30, 40),
('Card6', 'Type2', 35, 45),
('Card7', 'C', 2, 3),
('Card8', 'C', 2, 3),
('Card9', 'C', 2, 3),
('Card10', 'C', 3, 2),
('Card11', 'C', 6, 6),
('Card12', 'C', 3, 3),
('Card13', 'C', 3, 4),
('Card14', 'C', 4, 4),
('Card15', 'C', 2, 3),
('Card16', 'C', 5, 6),
('Card17', 'C', 3, 3),
('Card18', 'C', 4, 4),
('Card19', 'Type1', 100, 110),
('Card20', 'Type2', 105, 115),
('Card21', 'Type1', 110, 120),
('Card22', 'Type2', 115, 125),
('Card23', 'Type1', 120, 130),
('Card24', 'Type2', 125, 135),
('Card25', 'Type1', 130, 140),
('Card26', 'Type2', 135, 145),
('Card27', 'Type1', 140, 150),
('Card28', 'Type2', 145, 155);