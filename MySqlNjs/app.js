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
app.set('view engine', 'handlebars');
app.set('views', './views');

// Aqui define o tipo de dado que a rota vai manipular
// Lembrar de colocar isso toda vez que for trabalhar com um FORM
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

// Rotas do site
// ROTA PRINCIPAL
app.get('/:situation', function(req, res){
    let sql = 'SELECT * FROM products';

    connect.query(sql, function(error, ret){
        if (error) throw error;
        res.render('form', { products: ret, situation: req.params.situation });
    });
});

// Essa rota vai servir para cadastrar os produtos. OBS: coloquei algumas coisas em português, releve
app.post('/register', function (req, res) {
    let name = req.body.nome;
    let value = req.body.valor;
    let image = req.files.imagem.name;

    let sql = `INSERT INTO products (nome, valor, imagem) VALUES ('${name}', ${value}, '${image}')`;

    connect.query(sql, function(error, ret){
        if (error) throw error;

        req.files.imagem.mv(__dirname + '/public/images/' + req.files.imagem.name, function(err) {
            if (err) throw err;
            console.log('Image uploaded!');
        });
        console.log(ret);
    });

    res.redirect('/');
});

// Essa rota vai remover os produtos e apaga-los do diretório
app.get('/remove/:codigo&:imagem', function(req, res){
    let sql = `DELETE FROM products WHERE codigo = ${req.params.codigo}`;

    connect.query(sql, function(error, ret){
        if (error) throw error;

        fs.unlink(__dirname + '/public/images/' + req.params.imagem, (error_image) => {
            if (error_image) {
                console.log("Deu erro em remover a imagem, meu chapa");
            } else {
                console.log('Image deleted!');
            }
        });
    });
    res.redirect('/');
});

app.get('/form-edit/:codigo', function(req, res){
    // Select sempre vai retornar uma lista, mas como eu estou trabalhando do IDs eu só vou ter o retorno de um
    let sql = `SELECT * FROM products WHERE codigo = ${req.params.codigo}`;

    connect.query(sql, function(error, ret){
        if (error) throw error;

        res.render('form-edit', { products: ret[0] });
    });
});

app.post('/edit', function(req, res) {
    let name = req.body.nome;
    let value = req.body.valor;
    let cod = req.body.codigo;
    let nameImage = req.body.nameImage;

    try {
        if (req.files && req.files.imagem) {
            let image = req.files.imagem;

            let sql = `UPDATE products SET nome = '${name}', valor = ${value}, imagem = '${image.name}' WHERE codigo = ${cod}`;

            connect.query(sql, function(error, ret) {
                if (error) throw error;

                fs.unlink(__dirname + '/public/images/' + nameImage, (error_image) => {
                    if (error_image) {
                        console.log("Deu erro em remover a imagem, meu chapa");
                    } else {
                        console.log('Antiga imagem foi de ralo!');
                    }
                });

                image.mv(__dirname + '/public/images/' + image.name, function(err) {
                    if (err) throw err;
                    console.log('Novo meliante acionado!');
                });

                console.log(ret);
            });
        } else {
            let sql = `UPDATE products SET nome = '${name}', valor = ${value} WHERE codigo = ${cod}`;

            connect.query(sql, function(error, ret) {
                if (error) throw error;
                console.log(ret);
            });
        }
    } catch (error) {
        console.error('Error:', error);
    }

    res.redirect('/');
});

app.listen(8080);
