const Grupos = require('../../models/Grupos');
const Meeti = require('../../models/Meeti');
const moment = require('moment');

exports.mostrarGrupo = async (req, res, next) => {
    const query = [];

    query.push( Grupos.findOne({ where: {id: req.params.id} }));
    query.push( Meeti.findAll({ 
            where: { GrupoId: req.params.id },
            order: [
                ['fecha', 'ASC']
            ]
        })
    );

    const [grupo, meetis] = await Promise.all(query);

    //Si existe
    if(!grupo){
        res.redirect('/');
        return next();
    }

    //Mostrar vista
    res.render('frontend/mostrar-grupo',{
        nombrePagina: `Informacion del grupo: ${grupo.nombre}`,
        grupo,
        meetis,
        moment
    });s

}