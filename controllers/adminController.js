const Grupos = require('../models/Grupos');
const Meeti = require('../models/Meeti');
const moment = require('moment'); //Importar librería al cliente
const Sequelize = require('sequelize');
const op = Sequelize.Op;


exports.panelAdministracion = async (req, res) => {

    //Consultas
    const consultas = [];
    consultas.push( Grupos.findAll({ where: { UsuarioId: req.user.id } }) );
    consultas.push( Meeti.findAll({ 
        where: { 
            UsuarioId: req.user.id, 
            fecha: { [op.gte] : moment(new Date()).format('YYYY-MM-DD') }
        },
        order: [
            ['fecha', 'ASC']
        ]
    }));
    consultas.push( Meeti.findAll({ where: { UsuarioId: req.user.id,    
                                            fecha: { [op.lt] : moment(new Date()).format('YYYY-MM-DD') } } }) );

    //Array destructuring
    const [grupos, meeti, anteriores] = await Promise.all(consultas);

    res.render('admin/administracion',{
        nombrePagina: 'Panel de administración',
        grupos,
        meeti,
        moment,
        anteriores
    });
}