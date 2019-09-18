const Grupos = require('../models/Grupos');
const Meeti = require('../models/Meeti');
const uuid = require('uuid/v4');

exports.formNuevoMeeti = async (req, res) => {
    const grupos = await Grupos.findAll({ 
        where: { UsuarioId: req.user.id},
        order: [
            ['nombre', 'ASC']
        ]
    });

    res.render('meeti/nuevo-meeti', {
        nombrePagina: 'Crear un nuevo Meeti',
        grupos
    });
}

//Crear nuevo meeti
exports.crearMeeti = async (req, res) => {
    const meeti = req.body;

    //Asignar usuario
    meeti.UsuarioId = req.user.id;
    meeti.GrupoId = req.body.grupoId;

    //Almacenar a ubicación
    const point = { type: 'Point', coordinates: [parseFloat(req.body.lat), parseFloat(req.body.lng)] };
    meeti.ubicacion = point;

    meeti.id = uuid();

    //Cupo opcional
    if(req.body.cupo === ''){
        meeti.cupo = 0;
    }

    try {
        await Meeti.create(meeti);
        req.flash('exito', 'Se ha creado el nuevo meeti');
        res.redirect('/administracion');

    } catch (error) {
        //Extrar el message de los errores
        const erroresSequelize = error.errors.map(err => err.message);
        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-meeti');
    }

    console.log(meeti);
}

//Sanitizar meeti
exports.sanitizarMeeti = (req, res, next) => {
    req.sanitizeBody('titulo');
    req.sanitizeBody('invitado');
    req.sanitizeBody('cupo');
    req.sanitizeBody('fecha');
    req.sanitizeBody('hora');
    req.sanitizeBody('direccion');
    req.sanitizeBody('ciudad');
    req.sanitizeBody('estado');
    req.sanitizeBody('pais');
    req.sanitizeBody('lat');
    req.sanitizeBody('lng');
    req.sanitizeBody('grupoId');

    next();
}

//Muestra formulario para editar meeti
exports.formEditarMeeti = async (req, res, next) => {

    const consultas = [];
    consultas.push( Grupos.findAll({ where: { UsuarioId : req.user.id } }) );
    consultas.push( Meeti.findByPk( req.params.id ) );
    //Return promise
    const [grupos, meeti] = await Promise.all(consultas);

    if(!grupos || !meeti){
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    res.render('meeti/editar-meeti', {
        nombrePagina: `Editar Meeti : ${meeti.titulo}`,
        grupos,
        meeti
    });
}

//Almacenar cambios del meeti
exports.editarMeeti = async (req, res, next) => {
    const meeti = await Meeti.findOne({ where: { id: req.params.id, UsuarioId: req.user.id } });

    if(!meeti){
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    //Asignar valores
    const { grupoId, titulo, invitado, fecha, hora, cupo, descripcion, direccion, ciudad, estado, pais, lat, lng } = req.body;
    meeti.grupoId = grupoId;
    meeti.titulo = titulo;
    meeti.invitado = invitado;
    meeti.fecha = fecha;
    meeti.hora = hora;
    meeti.cupo = cupo;
    meeti.descripcion = descripcion;
    meeti.direccion = direccion;
    meeti.ciudad = ciudad;
    meeti.estado = estado;
    meeti.pais = pais;

    //Asignar point
    const point = { type: 'Point', coordinates: [parseFloat(lat), parseFloat(lng)] };
    meeti.ubicacion = point;

    //Almacenar en la base de datos
    await meeti.save();
    req.flash('exito', 'Cambios guardados correctamente');
    res.redirect('/administracion');
    
}

//Form para eliminar meeti
exports.formEliminarMeeti = async (req, res, next) => {
    const meeti = await Meeti.findOne({ where: { id: req.params.id, UsuarioId: req.user.id }} );

    if(!meeti){
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    //Mostrar la vista
    res.render('meeti/eliminar-meeti', {
        nombrePagina: `Eliminar Meeti : ${meeti.titulo}`,
        meeti
    });
}

//Eliminar el meeti
exports.eliminarMeeti = async (req, res, next) => {
    const meeti = await Meeti.findOne({ where: { id: req.params.id, UsuarioId: req.user.id }} );

    if(!meeti){
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    //Eliminar meeti
    await Meeti.destroy({
        where: { id: req.params.id }
    });

    req.flash('exito', 'Meeti eliminado');
    res.redirect('/administracion');
}