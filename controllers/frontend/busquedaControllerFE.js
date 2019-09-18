const Meeti = require('../../models/Meeti');
const Grupos = require('../../models/Grupos');
const Usuarios = require('../../models/Usuarios');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const moment = require('moment');

exports.resultadoBusqueda = async (req, res) => {
    //Leer datos de la url
    // console.log(req.query); //Leer datos GET

    const { categoria, titulo, ciudad, pais } = req.query;

    //Si la categoría está vacía
    let query;
    if(categoria === ''){
        query = '';
    } else {
        query = `where: {
            CategoriaId: { [Op.eq]: ${categoria} }
        }`;
    }

    //Filtrar los meetis por los términos de la busqueda
    const busqueda = await Meeti.findAll({
        where: {
            titulo: { [Op.iLike]: '%' + titulo + '%'},
            ciudad: { [Op.iLike]: '%' + ciudad + '%'},
            pais: { [Op.iLike]: '%' + pais + '%'}
        },
        include: [
            {
                model: Grupos,
                query
            }, {
                model: Usuarios,
                attributes: ['id', 'nombre', 'imagen']
            }
        ]
    });
    
    //Pasar resultados a la vista
    res.render('frontend/busqueda',{
       nombrePagina: 'Resultado de la búsqueda',
       busqueda,
       moment 
    });
}