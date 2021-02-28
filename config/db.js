// const Sequelize = require('sequelize');

// module.exports = new Sequelize('meeti', 'postgres', 'root',{
//     host: '127.0.0.1',
//     port: '5432',
//     dialect: 'postgres',
//     pool: {
//         max: 5,
//         min: 0,
//         acquire: 30000,
//         idle: 10000
//     },
//     // define: {
//     //     timestamps: false
//     // },
//     //Quitar los logs de consola
//     // logging: false 
// });

const Sequelize = require('sequelize');
require('dotenv').config({ path: 'variables.env' });

module.exports = new Sequelize(process.env.BD_NAME, process.env.BD_USER, process.env.BD_PASS,{
    host: process.env.BD_HOST,
    port: process.env.BD_PORT,
    dialect: 'postgres',
    dialectOptions: {
      ssl: true
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    logging: false 
});
