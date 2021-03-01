const Categorias = require('../models/Categorias');
const Grupos = require('../models/Grupos');
const multer = require('multer');
const shortId = require('shortid');
const fs = require('fs');
const uuid = require('uuid/v4');

//Configuración general para multer
const configuracionMulter = {
    limits: { fileSize : 1000000 }, //Tamaño en bytes - Limitar tamaño del archivo
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => { //Donde se alojaran los archivos subidos
            next(null, __dirname + '../../public/uploads/grupos/');
        },
        filename: (req, file, next) => {
            //Extrae el formato el archivo
            const extension = file.mimetype.split('/')[1];
            next(null, `${shortId.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, next){ //Filtrar tipos de archivo permitidos
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
            //Formato válido
            next(null, true);
        } else {
            next(new Error('Formato no válido, solo archivos JPEG Y PNG'), false);
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');

//Cargar una imagen en el servidor
exports.subirImagen = (req, res, next) => {
    upload(req, res, function(error){
        if(error){
            console.log(error);
            if(error instanceof multer.MulterError){ //Validar una instancia de error
                if(error.code === 'LIMIT_FILE_SIZE'){
                    req.flash('error', 'El archivo es muy pesado, solo se permiten 100Kb');
                } else {
                    req.flash('error', error.message);
                }
            } else if(error.hasOwnProperty('message')){ //Buscar si un objeto errores tiene una llave message
                req.flash('error', error.message);
            }
            res.redirect('back');
            return;
        } else {
            next();
        }
    });
}

exports.formNuevoGrupo = async (req, res) => {
    const categorias = await Categorias.findAll({
        attributes: ['id', 'categoria'],
        order: [
            ['categoria', 'ASC']
        ]
    });

    res.render('grupos/nuevo-grupo', {
        nombrePagina: 'Crea un nuevo grupo',
        categorias
    });
}

//Crear nuevo grupo 
exports.crearGrupo = async (req, res) => {
    //Sanitizar los campos
    req.sanitizeBody('nombre');
    req.sanitizeBody('url');

    const grupo = req.body;
    grupo.CategoriaId = req.body.categoria; //Almacena la categoria del grupo
    grupo.UsuarioId = req.user.id; //Almacena usuario autenticado como creador del grupo

    //Leer imagen - req.file toda info de multer
    if(req.file){
        grupo.imagen = req.file.filename;
    }

    grupo.id = uuid();

    try {
        //Almacenar en BD
        await Grupos.create(grupo);
        req.flash('exito', 'Se ha creado el grupo correctamente');
        res.redirect('/administracion');

    } catch (error) {
        //Extrar el message de los errores
        const erroresSequelize = error.errors.map(err => err.message);

        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-grupo');
    }
}

//Leer datos para editar
exports.formEditarGrupo = async (req, res) => {
    //El await se utiliza para consultas anidadas dependientes de parámetros de una y otra
    //Multiples consultas para mejorar el performance
    const consultas = [];
    consultas.push(Grupos.findByPk(req.params.grupoId));
    consultas.push(Categorias.findAll({
        attributes: ['id', 'categoria'],
        order: [
            ['categoria', 'ASC']
        ]
    }));

    //Promise con await y destroctoring 
    const [grupo, categorias] = await Promise.all(consultas);

    res.render('grupos/editar-grupo', {
        nombrePagina: `Editar grupo : ${grupo.nombre}`,
        grupo,
        categorias
    });
}

//Guardar cabios en la BD
exports.editarGrupo = async (req, res) => {
    const grupo = await Grupos.findOne({ where: { id: req.params.grupoId, UsuarioId: req.user.id }});
    
    //SI no existe el grupo o no es el dueño
    if(!grupo){
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    
    //Todo bien, leer valores
    const { nombre, descripcion, categoria, url} = req.body;

    //Asignar valores
    grupo.nombre =  nombre;
    grupo.descripcion = descripcion;
    grupo.CategoriaId = categoria;
    grupo.url = url;

    //Guardar en la BD
    await grupo.save();

    req.flash('exito', 'Se guardaron los cambios correctamente');
    res.redirect('/administracion');
}

//Formulario para editar imagen
exports.formEditarImagen = async (req, res) => {
    const grupo = await Grupos.findByPk(req.params.grupoId);

    res.render('grupos/imagen-grupo', {
        nombrePagina: `Editar imagen del grupo : ${grupo.nombre}`,
        grupo
    });
}

//Modificar la imagen en la BD y elimina anterior
exports.editarImagen = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where: { id: req.params.grupoId, UsuarioId: req.user.id }});
    
    //Si no existe el grupo o no es el dueño
    if(!grupo){
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    //Verificar que el archivo sea nuevo
    if(req.file){
        console.log(req.file.filename);
    }

    //Revisar que exista una archivo anterior
    if(grupo.imagen){
        console.log(grupo.imagen);
    }

    //Si hay imagen anterior y nueva, significa que se debe borrar la anterior y reemplazar por la nueva
    if(req.file && grupo.imagen){
        const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;
        //Eliminar archivo con filesystem
        fs.unlink(imagenAnteriorPath, (error) => {
            if(error){
                console.log(error);
                return;
            }
        });
    }

    //Si hay imagen nueva, se guarda
    if(req.file){
        grupo.imagen =req.file.filename;
    }

    //Guardar en la BD
    await grupo.save();
    req.flash('exito', 'Se guardaron los cambios de imagen correctamente');
    res.redirect('/administracion');
}

exports.formEliminarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where: { id: req.params.grupoId, UsuarioId: req.user.id } });

    //Si no existe el grupo o no es el dueño
    if(!grupo){
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    //Todo bien, ejecutar la vista
    res.render('grupos/eliminar-grupo', {
        nombrePagina: `Eliminar grupo : ${grupo.nombre}`
    });
}

//Eliminar un grupo y su imagen
exports.eliminarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where: { id: req.params.grupoId, UsuarioId: req.user.id } });

    //Si no existe el grupo o no es el dueño
    if(!grupo){
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    //Si hay imagen, eliminarla
    if(grupo.imagen){
        const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;
        //Eliminar archivo con filesystem
        fs.unlink(imagenAnteriorPath, (error) => {
            if(error){
                console.log(error);
                return;
            }
        });
    }


    //Eliminar grupo
    await Grupos.destroy({
        where: { id: req.params.grupoId}
    });

    req.flash('exito', 'Se ha eliminado el grupo exitosamente');
    res.redirect('/administracion');

}
