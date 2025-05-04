const fs = require('fs');
const path = require('path');
const Product = require('../models/productModel');

exports.showForm = (req, res) => {
    Product.getAll((err, data) => {
        if (err) throw err;
        res.render('form', { products: data });
    });
};

exports.showFormWithSituation = (req, res) => {
    Product.getAll((err, data) => {
        if (err) throw err;
        res.render('form', { products: data, situation: req.params.situation });
    });
};

exports.register = (req, res) => {
    const { nome, valor } = req.body;
    const imagem = req.files?.imagem;

    if (!nome || !valor || isNaN(valor)) return res.redirect('/register-failed');

    const imgName = imagem.name;
    const product = { nome, valor: parseFloat(valor), imagem: imgName };

    Product.insert(product, (err) => {
        if (err) throw err;
        imagem.mv(path.join(__dirname, '../public/images/', imgName), (err) => {
            if (err) throw err;
            console.log('Imagem salva com sucesso.');
            res.redirect('/register-success');
        });
    });
};

exports.remove = (req, res) => {
    const { codigo, imagem } = req.params;
    Product.remove(codigo, (err) => {
        if (err) throw err;

        fs.unlink(path.join(__dirname, '../public/images/', imagem), (errImg) => {
            if (errImg) console.log("Erro ao remover imagem:", errImg);
            res.redirect('/remove-success');
        });
    });
};

exports.showEditForm = (req, res) => {
    Product.getById(req.params.codigo, (err, result) => {
        if (err) throw err;
        res.render('form-edit', { products: result[0] });
    });
};

exports.edit = (req, res) => {
    const { nome, valor, codigo, nameImage } = req.body;
    const imagem = req.files?.imagem;

    if (!nome || !valor || isNaN(valor)) return res.redirect('/edit-failed');

    const updateProduct = {
        codigo,
        nome,
        valor,
        imagem: imagem ? imagem.name : null
    };

    Product.update(updateProduct, (err) => {
        if (err) throw err;

        if (imagem) {
            fs.unlink(path.join(__dirname, '../public/images/', nameImage), () => {
                imagem.mv(path.join(__dirname, '../public/images/', imagem.name), () => {
                    res.redirect('/edit-success');
                });
            });
        } else {
            res.redirect('/edit-success');
        }
    });
};
