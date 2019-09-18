const Sequelize = require('sequelize');
const db = require('../config/db');
const Usuarios = require('../models/Usuarios');
const Meeti = require('../models/Meeti');

const Comentarios = db.define('Comentarios',{
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    mensaje: Sequelize.TEXT
},{
    timestamps: false
});

Comentarios.belongsTo(Usuarios);
Comentarios.belongsTo(Meeti);

module.exports = Comentarios;