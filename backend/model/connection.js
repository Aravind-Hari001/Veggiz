let mysql = require('mysql');

let con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database:"veggiz"
});
// let con = mysql.createConnection({
//   host: "195.35.7.129",
//   user: "root",
//   password: "Aravind001@",
//   database:"veggiz"
// });

con.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database as id ' + con.threadId);
});
module.exports={con}