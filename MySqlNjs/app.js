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
app.engine('handlebars', engine({
    helpers: {
      // Função auxiliar para verificar igualdade (Valeu Ralf Lima)
      conditionalEquality: function (parm1, parm2, options) {
        return parm1 === parm2 ? options.fn(this) : options.inverse(this);
      }
    }
  }));
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
app.get('/', function(req, res){
    let sql = 'SELECT * FROM products';

    connect.query(sql, function(error, ret){
        if (error) throw error;
        res.render('form', { products: ret });
    });
});

// ROTA DE SITUAÇÃO, POR FAVOR NÃO CONFUNDIR COM A PRINCIPAL (Isso é para mim mesmo)
app.get('/:situation', function(req, res){
    let sql = 'SELECT * FROM products';

    connect.query(sql, function(error, ret){
        if (error) throw error;
        res.render('form', { products: ret, situation: req.params.situation });
    });
});

// Essa rota vai servir para cadastrar os produtos. OBS: coloquei algumas coisas em português, releve
app.post('/register', function (req, res) {
    try{
        let name = req.body.nome;
        let value = req.body.valor.trim();
        let image = req.files.imagem.name;

        if(name == '' || value == '' || isNaN(value)){
            res.redirect('/register-failed')
        } else {
            let sql = `INSERT INTO products (nome, valor, imagem) VALUES ('${name}', ${value}, '${image}')`;

            connect.query(sql, [name, parseFloat(value), image], function(error, ret){
            if (error) throw error;

            req.files.imagem.mv(__dirname + '/public/images/' + req.files.imagem.name, function(err) {
            if (err) throw err;
                console.log('Sucesso na imagem, meu brother');
        });
            console.log(ret);
        });

            res.redirect('/register-success');
    } 

    } catch (err) {
        res.redirect('/register-failed');
    }
});

// Essa rota vai remover os produtos e apaga-los do diretório
app.get('/remove/:codigo&:imagem', function(req, res){
    
    try {
        let sql = `DELETE FROM products WHERE codigo = ${req.params.codigo}`;

        connect.query(sql, function(error, ret){
        if (error) throw error;

        fs.unlink(__dirname + '/public/images/' + req.params.imagem, (error_image) => {
            if (error_image) {
                console.log("Deu erro em remover a imagem, meu chapa");
            } else {
                console.log('Imagem deletada!');
            }
        });
      });
        res.redirect('/remove-success');
    } catch (error) {
        res.redirect('/remove-failed');
    }

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

    if(name == '' || value == '' || isNaN(value)){
        res.redirect('/edit-failed');

    } else {
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
        res.redirect('/edit-success');
    }
});

app.listen(8080);
