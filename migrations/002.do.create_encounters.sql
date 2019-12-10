CREATE TABLE encounters (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    names TEXT NOT NULL,
    users INTEGER REFERENCES users(id) NOT NULL
);