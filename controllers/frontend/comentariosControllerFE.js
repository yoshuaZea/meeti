const Comentarios = require('../../models/Comentarios');
const Meeti = require('../../models/Meeti');

exports.agregarComentario = async (req, res) => {
    //Obtener el comentario
    const { comentario } = req.body;

    await Comentarios.create({
        mensaje: comentario,
        UsuarioId: req.user.id,
        meetiId: req.params.slug
    });

    //Redireccionar a la misma página
    res.redirect('back');
    next();
}

//Eliminar comentarios
exports.eliminarComentario = async (req, res, next) => {
    //Tomar el id del comentario
    const { comentarioId } = req.body;
    
    //Consutlar el comentario
    const comentario = await Comentarios.findOne({ where: {id: comentarioId} });

    //Verificar si existe el comentario
    if(!comentario){
        res.status(404).send('Acción no válida'); //Error - No encontrada
        return next();
    }

    //Consultar el creado del usuario
    const meeti = await Meeti.findOne({ where: {id: comentario.meetiId} });

    //Verificar que quien lo borra sea el creador
    if(comentario.UsuarioId === req.user.id || req.user.id === meeti.UsuarioId){
        await Comentarios.destroy({
            where: { id: comentario.id}
        });

        res.status(200).send('Eliminado correctamente'); //Todo ok
        return next();

    } else {
        res.status(403).send('Acción no válida'); //Error - Prohibido
        return next();
    }
}