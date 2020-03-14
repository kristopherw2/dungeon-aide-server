const { expect } = require("chai");
const knex = require("knex");
const app = require("../src/app");
const { makeEncountersArray } = require("./encounters.fixtures");
const { makeMonstersArray } = require("./monsters.fixtures");

//declare db variable
let db;

//dummy data for encounters table
const testEncounters = makeEncountersArray();

//dummy data for monsters table
const testMonsters = makeMonstersArray();

//create knexinstance
before("make knex instance", () => {
    db = knex({
        client: "pg",
        connection: process.env.TEST_DATABASE_URL
    });
    app.set("db", db);
});

//truncate all tables due to FK restraints before each test
before(() => {
    return db.raw(
        "TRUNCATE TABLE encounters, monsters RESTART IDENTITY CASCADE"
    );
});

//truncate after each test to keep tables clean
afterEach(() => {
    return db.raw(
        "TRUNCATE TABLE encounters, monsters RESTART IDENTITY CASCADE"
    );
});

after("disconnect from db", () => db.destroy());

describe("GET /api/encounters", function() {
    context("given there are encounters in the database", () => {
        //have to insert encounters data
        beforeEach("insert encounters", () => {
            return db.into("encounters").insert(testEncounters);
        });

        it("GET /api/encounters responds with 200 and all the encounters", () => {
            return supertest(app)
                .get("/api/encounters")
                .expect(200, testEncounters);
        });
    });
});

describe(`Get /api/encounters`, () => {
    context("given no encounters", () => {
        it("responds with 200 and an empty array", () => {
            return supertest(app)
                .get("/api/encounters")
                .expect(200, []);
        });
    });
});

describe("POST /api/encounters", () => {
    it(`creates a new encounter, responds with 201 and the new encounter`, () => {
        const newEncounter = {
            names: "BIG DRAGON"
        };

        return supertest(app)
            .post("/api/encounters")
            .send(newEncounter)
            .expect(201)
            .expect(res => {
                expect(res.body[0].names).to.eql(newEncounter.names);
                expect(res.body[0]).to.have.property("id");
                expect(res.headers.location).to.eql(
                    `/api/encounters/${res.body[0].id}`
                );
            })
            .then(postRes => {
                supertest(app)
                    .get(`/api/encounters/${postRes.body.id}`)
                    .expect(postRes.body[0]);
            });
    });

    it(`responds with 400 and an error message when the 'names' property is missing`, () => {
        return supertest(app)
            .post("/api/encounters")
            .send({})
            .expect(400, { error: { message: `Missing 'name' in encounter` } });
    });
});