const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const passport = require('./config/passport');
const createError = require('http-errors');
const router = require('./routes/routes');

//Configuración y modelos de la BD
const db = require('./config/db');
    require('./models/Usuarios');
    require('./models/Categorias');
    require('./models/Grupos');
    require('./models/Meeti');
    require('./models/Comentarios');
    db.sync().then(() => console.log('DB Conectada')).catch((error) => console.log(error));

//Variables de desarrollo
require('dotenv').config({ path: 'variables.env'});

//Aplicación principal
const app = express();

//Bodyparse para leer formularios
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//Express validatos (Validación con bastantes funciones)
app.use(expressValidator());

//Habilitar EJS conmo templeate engine
app.use(expressLayouts);
app.set('view engine', 'ejs');

//Ubicación de vistas
app.set('views', path.join(__dirname, './views'));

//Archivos estáticos
app.use(express.static('public'));

//Habilitar cookie parser
app.use(cookieParser());

//Crear la sesión
app.use(session({
    secret: process.env.SECRET,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false
}));

//Inicializar passport
app.use(passport.initialize());
app.use(passport.session());

//Agrega flash messages
app.use(flash());

//Middleware (usuario logueado, flash messages, fecha actual)
app.use((req, res, next) => {
    res.locals.usuario = {...req.user} || null; //Validación para partials usuario autenticado o no
    res.locals.mensajes = req.flash();
    const fecha = new Date();
    res.locals.year = fecha.getFullYear();
    next();
});

//Routing siempre antes del listen
app.use('/', router());

//404 Page not found
app.use((req, res, next) => {
    next(createError(404, 'No encontrada'));
});

//Administración de los errores
app.use((error, req, res, next) => {
    //No se pasa variable porque es local
    res.locals.mensaje = error.message;
    const status = error.status || 500;
    res.locals.status = status;
    res.status(status);
    res.render('error', { nombrePagina: 'Error' });
});

//Leer el host y el puerto
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || '4500';

//Agrega el puerto
app.listen(port, host, () => {
    console.log('El servidor está funcionando - Port:' + port);
});