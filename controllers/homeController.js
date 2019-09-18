const Categorias = require('../models/Categorias');
const Grupos = require('../models/Grupos');
const Usuarios = require('../models/Usuarios');
const Meeti = require('../models/Meeti');
const moment = require('moment');
const Sequelize = require('sequelize');
const op = Sequelize.Op;

exports.home = async (req, res) => {
    //Promise para consultas
    const consultas = [];
    consultas.push( Categorias.findAll({}) );
    consultas.push( Meeti.findAll({ 
        attributes: ['slug', 'titulo', 'fecha', 'hora'],
        where: { fecha: { [op.gte] : moment(new Date()).format('YYYY-MM-DD') } 
        },
        order: [
            ['fecha', 'ASC']
        ],
        limit: 3,
        include: [ //Para hacer JOIN SQL
            {
                model: Grupos,
                attributes: ['imagen']
            },
            {
                model: Usuarios,
                attributes: ['nombre', 'imagen']
            }
        ]
    }));

    //Extraer y pasar a la vista - Destructuring
    const [ categorias, meetis ] = await Promise.all(consultas);

    res.render('home/home', {
        nombrePagina: 'Inicio',
        categorias,
        meetis,
        moment
    });
};