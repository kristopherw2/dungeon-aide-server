CREATE TABLE monsters (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    name TEXT NOT NULL,
    health INTEGER NOT NULL,
    armor_class INTEGER NOT NULL,
    status_effects TEXT,
    encounter INTEGER REFERENCES encounters(id)
);