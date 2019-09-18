const Sequelize = require('sequelize');
const db = require('../config/db');

const Categorias = db.define('Categorias',{
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    categoria: Sequelize.TEXT,
    slug: Sequelize.TEXT
}, {
    timestamps: false
});

module.exports = Categorias;