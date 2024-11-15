import mysql from "mysql2"

export const db = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'Abhirupdey123@',
    database:'blog'

})

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the MySQL database.');
    }
});