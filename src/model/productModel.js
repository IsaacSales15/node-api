const db = require('../../db');

exports.getAll = (callback) => {
    db.query('SELECT * FROM products', callback);
};

exports.getById = (id, callback) => {
    db.query('SELECT * FROM products WHERE codigo = ?', [id], callback);
};

exports.insert = (product, callback) => {
    const { nome, valor, imagem } = product;
    db.query('INSERT INTO products (nome, valor, imagem) VALUES (?, ?, ?)', [nome, valor, imagem], callback);
};

exports.update = (product, callback) => {
    const { codigo, nome, valor, imagem } = product;
    const sql = imagem
        ? 'UPDATE products SET nome = ?, valor = ?, imagem = ? WHERE codigo = ?'
        : 'UPDATE products SET nome = ?, valor = ? WHERE codigo = ?';

    const values = imagem ? [nome, valor, imagem, codigo] : [nome, valor, codigo];
    db.query(sql, values, callback);
};

exports.remove = (codigo, callback) => {
    db.query('DELETE FROM products WHERE codigo = ?', [codigo], callback);
};
