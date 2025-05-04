const express = require('express');
const fileupload = require('express-fileupload');
const { engine } = require('express-handlebars');
const path = require('path');

const app = express();

// Configurações
app.use(fileupload());
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// View engine
app.engine('handlebars', engine({
    helpers: {
        conditionalEquality: function (a, b, options) {
            return a === b ? options.fn(this) : options.inverse(this);
        }
    }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rotas
const productRoutes = require('./routes/productRoutes');
app.use('/', productRoutes);

// Servidor
app.listen(8080, () => console.log('Servidor rodando na porta 8080'));
