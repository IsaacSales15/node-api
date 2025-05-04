const mysql = require('mysql2');

const connect = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'project'
});

connect.connect(function(error){
    if(error) throw error;
    console.log('KKKKKKKKKKKKKKKKK');
})

module.exports = connect;