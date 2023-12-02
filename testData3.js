const { Client } = require("pg");

const client = new Client({
    user: "postgres",
    password: "KFpbY46yBik3U7Mq",
    database: "postgres",
    port: 5432,
    host: "db.amxwrxbngptrgtasmbms.supabase.co",
    ssl: { rejectUnauthorized: false },
});

let purchasesData = [];

client.connect(function (err) {
    if (err) {
        console.log("Error in Database", err.message);
    } else {
        let sql = "SELECT * FROM purchases";
        client.query(sql, function (err, result) {
            if (err) {
                console.log("Error executing query", err.message);
            } else {
                purchasesData = result.rows;
                console.log(purchasesData);
            }
            client.end(); 
        });
    }
});

module.exports.purchasesData = purchasesData;
