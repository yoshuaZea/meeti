const Usuarios = require('../models/Usuarios');
const enviarEmail = require('../handlers/emails');
const multer = require('multer');
const shortId = require('shortid');
const fs = require('fs');

exports.formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu cuenta'
    });
}

exports.crearNuevaCuenta = async (req, res) => {
    const usuario = req.body;

    req.checkBody('password', 'El password no coincide, vuelve a intentarlo').equals(req.body.confirmar);
    req.checkBody('confirmar', 'Debes confirmar tu password').notEmpty();

    //Leer errores de express
    const erroresExpress = req.validationErrors();

    try{
        await Usuarios.create(usuario);

        //Generar URL de confirmación
        const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`;

        //Enviar email de confirmación
        await enviarEmail.enviarEmail({
            usuario,
            url,
            subject: 'Confirma tu cuenta de Meeti',
            archivo: 'confirmar-cuenta'
        });

        req.flash('exito', 'Te hemos enviado un email, confirma tu cuenta');
        res.redirect('/iniciar-sesion');

    } catch(error) {
        //TODO : Error de usuario no registrado no lo muestra - Error 23505
        // console.log(error.original);

        if(error.hasOwnProperty('original')){ //Valida si el objeto tiene la llave 'original'
            if(error.original.code === '23505'){
                req.flash('error', 'El usuario ya se encuentra registrado');
                res.redirect('/crear-cuenta');
            } else {
                req.flash('error', error.original.detail);
                res.redirect('/crear-cuenta');
            }
        } else {
            //Extrar el message de los errores
            const erroresSequelize = error.errors.map(err => err.message);
            
            //Extraer el msg de los errores
            const errExp = erroresExpress.map(err => err.msg);
    
            //Unir errores
            const listaErrores = [...errExp, ...erroresSequelize];
    
            req.flash('error', listaErrores);
            res.redirect('/crear-cuenta');
        }
    }
}

//Formulario para iniciar sesión
exports.formIniciarSesion = (req, res) => {
    res.render('iniciar-sesion', {
        nombrePagina: 'Iniciar sesión'
    });
}

//Confirmar cuenta de correo
exports.confirmarCuenta = async (req, res, next) => {
    //Verificar que el usuario existe
    const usuario = await Usuarios.findOne({ 
        where: { 
            email: req.params.correo
        }
    });

    //Si no existe, redireccionar
    if(!usuario){
        req.flash('error', 'No existe la cuenta');
        res.redirect('/crear-cuenta');
        return next();
    }

    //Si existe confirmar suscripción y redireccionar
    usuario.activo = 1;
    await usuario.save();

    req.flash('exito', 'La cuenta se ha confirmado, ya puedes inicisar sesión');
    res.redirect('/iniciar-sesion');
}   

//Muestra form para editar pefil
exports.fomrEditarPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    res.render('editar-perfil', {
        nombrePagina: 'Editar perfil',
        usuario
    });
}

//Editar perfil y almacenar cambios
exports.editarPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    req.sanitizeBody('nombre');
    req.sanitizeBody('descripcion');
    req.sanitizeBody('email');

    //leer datos del form
    const { nombre, descripcion, email } = req.body;

    //Asignar valores
    usuario.nombre = nombre;
    usuario.descripcion = descripcion;
    usuario.email = email;

    //Guardar en la BD
    usuario.save();

    req.flash('exito', `Tus datos han sido actualizados ${usuario.nombre}`);
    res.redirect('/administracion');
}

//Form para cambiar password
exports.formCambiarPassword = (req, res) => {
    res.render('cambiar-password', {
        nombrePagina: 'Cambiar password'
    });
}

//Cambiar password y validaciones
exports.cambiarPassword = async (req, res, next) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    const { anterior, nuevo } = req.body;

    //Verificar password anterior vs ingresado
    if(!usuario.validarPassword(anterior)){
        req.flash('error', 'El password actual es incorrecto');
        res.redirect('/administracion');
        return next();
    }

    //Si password correcto, hashear el nuevo
    const hash = usuario.hashPassword(nuevo);
    
    //Asignar password hasheado
    usuario.password = hash;

    //Guardar en la BD
    await usuario.save();

    //Redireccionar y desloguear
    req.logout(); // Desloguear
    req.flash('exito', 'Se actualizó el password correctamente, vuelve a iniciar sesión');
    res.redirect('/iniciar-sesion');
}

//Form subir imagen
exports.formSubirImagenPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    res.render('imagen-perfil', {
        nombrePagina: 'Subir imagen de perfil',
        usuario
    });
}

//Guardar imagen nueva, eliminar anterior (si aplica) y se guarda la información
exports.guardarImagenPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    //Si hay imagen anterior y nueva, significa que se debe borrar la anterior y reemplazar por la nueva
    if(req.file && usuario.imagen){
        const imagenAnteriorPath = __dirname + `/../public/uploads/perfiles/${usuario.imagen}`;
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
        usuario.imagen =req.file.filename;
    }

    //Guardar en la BD
    await usuario.save();

    req.flash('exito', 'Se subió tu imagen de perfil correctamente');
    res.redirect('/administracion');
}

//Configuración general para multer
const configuracionMulter = {
    limits: { fileSize : 100000 }, //Tamaño en bytes - Limitar tamaño del archivo
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => { //Donde se alojaran los archivos subidos
            next(null, __dirname + '../../public/uploads/perfiles/');
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