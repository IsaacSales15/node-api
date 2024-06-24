const express = require('express');
const mysql = require('mysql2');
const fileupload = require('express-fileupload');
const { engine } = require('express-handlebars');
const fs = require('fs');

const app = express();

app.use(fileupload());
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist')); 
app.use(express.static(__dirname + '/public'));
app.use('/images', express.static(__dirname + '/public/images'));

// Aqui diz básicamente que todos os arquivos que estão na pasta views são handlebars
app.engine('handlebars', engine());
app.set('view engine','handlebars');
app.set('views', './views');

// Aqui define o tipo de dado que a rota vai manipular
// Lembrar de colocar isso toda vez que for trabalhar com um FORM
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const connect = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'project'
});

connect.connect(function(error){
    if(error) throw error;
    console.log('kakakaka') 
})

// Rotas do site
// ROTA PRINCIPAL
app.get('/', function(req, res){
    let sql = 'SELECT * FROM products';

    connect.query(sql, function(error, ret){
        res.render('form', {products: ret});
    })
});

// Essa rota vai servir para cadastrar os produtos. OBS: coloquei algumas coisas em português, releve
app.post('/register', function (req, res) {
    let name = req.body.nome;
    let value = req.body.valor;
    let image = req.files.imagem.name;

    let sql = `INSERT INTO products (nome, valor, imagem) VALUES ('${name}', ${value}, '${image}')`;

    connect.query(sql, function(error, ret){
        if(error) throw error;

        req.files.imagem.mv(__dirname + '/public/images/' + req.files.imagem.name);
        console.log(ret);
    });

    res.redirect('/');
});

// Essa rota vai remover os produtos e apaga-los do diretório
app.get('/remove/:codigo&:imagem', function(req, res){
    let sql = `DELETE FROM products WHERE codigo = ${req.params.codigo}`;

    connect.query(sql, function(error, ret){
        if(error) throw error;

        fs.unlink(__dirname + '/public/images/' + req.params.imagem, (error_image) => {
            console.log("Deu erro em remover a imagem, meu chapa");
        });
    });
    res.redirect('/');
});

app.get('/form-edit/:codigo', function(req, res){
    res.render('form-edit');
});


app.listen(8080);