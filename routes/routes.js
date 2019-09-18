const express = require('express');
const router = express.Router();

//Importar controlladores
const homeController = require('../controllers/homeController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const gruposController = require('../controllers/gruposController');
const meetiController = require('../controllers/meetiController');
const meetiControllerFE = require('../controllers/frontend/meetiControllerFE');
const usuariosControllerFE = require('../controllers/frontend/usuariosControllerFE');
const gruposControllerFE = require('../controllers/frontend/gruposControllerFE');
const comentariosControllerFE = require('../controllers/frontend/comentariosControllerFE');
const busquedaControllerFE = require('../controllers/frontend/busquedaControllerFE');

module.exports = () => {
    /** ÁREA PÚBLICA */
    router.get('/', homeController.home); 

    //Muestra un meeti
    router.get('/meeti/:slug', meetiControllerFE.mostrarMeeti);

    //Agregar comentarios en el meeti
    router.post('/meeti/:slug', 
        authController.usuarioAutenticado,
        comentariosControllerFE.agregarComentario
    );

    //Elimina comentarios en el meeti
    router.post('/eliminar-comentario', 
        authController.usuarioAutenticado,
        comentariosControllerFE.eliminarComentario
    );
    
    //Confirma asistencia a meeti
    router.post('/confirmar-asistencia/:slug', meetiControllerFE.confirmarAsistencia);

    //Muestra asistentes del meeti
    router.get('/asistentes/:slug', meetiControllerFE.mostrarAsistentes);

    //Muestra perfiles en el frontend
    router.get('/usuarios/:id', usuariosControllerFE.mostrarUsuario);

    //Muestra los grupos en el frontend
    router.get('/grupos/:id', gruposControllerFE.mostrarGrupo);

    //Muestra Meeti's por categorias
    router.get('/categoria/:categoria', meetiControllerFE.mostrarCategorias);

    router.get('/busqueda', busquedaControllerFE.resultadoBusqueda);

    //Usuarios - Crear y confirmar cuentas
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta', usuariosController.crearNuevaCuenta);
    router.get('/confirmar-cuenta/:correo', usuariosController.confirmarCuenta);

    //Iniciar sesión
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);
    
    //Cerrar sesión
    router.get('/cerrar-sesion', 
        authController.usuarioAutenticado,
        authController.cerrarSesion
    )


    /** ÁREA PRIVADA */

    //Administración
    router.get('/administracion', 
        authController.usuarioAutenticado,
        adminController.panelAdministracion
    );

    router.get('/nuevo-grupo', 
        authController.usuarioAutenticado,
        gruposController.formNuevoGrupo
    );

    router.post('/nuevo-grupo', 
        authController.usuarioAutenticado,
        gruposController.subirImagen,
        gruposController.crearGrupo
    );

    router.get('/editar-grupo/:grupoId', 
        authController.usuarioAutenticado,
        gruposController.formEditarGrupo
    );

    router.post('/editar-grupo/:grupoId', 
        authController.usuarioAutenticado,
        gruposController.editarGrupo
    );

    router.get('/imagen-grupo/:grupoId', 
        authController.usuarioAutenticado,
        gruposController.formEditarImagen
    );

    router.post('/imagen-grupo/:grupoId', 
        authController.usuarioAutenticado,
        gruposController.subirImagen,
        gruposController.editarImagen
    );

    router.get('/eliminar-grupo/:grupoId', 
        authController.usuarioAutenticado,
        gruposController.formEliminarGrupo
    );

    router.post('/eliminar-grupo/:grupoId', 
        authController.usuarioAutenticado,
        gruposController.eliminarGrupo
    );

    //Meeti
    router.get('/nuevo-meeti',
        authController.usuarioAutenticado,
        meetiController.formNuevoMeeti
    );

    router.post('/nuevo-meeti',
        authController.usuarioAutenticado,
        meetiController.sanitizarMeeti,
        meetiController.crearMeeti
    );

    router.get('/editar-meeti/:id', 
        authController.usuarioAutenticado,
        meetiController.formEditarMeeti
    );

    router.post('/editar-meeti/:id', 
        authController.usuarioAutenticado,
        meetiController.editarMeeti
    );

    router.get('/eliminar-meeti/:id', 
        authController.usuarioAutenticado,
        meetiController.formEliminarMeeti
    );

    router.post('/eliminar-meeti/:id', 
        authController.usuarioAutenticado,
        meetiController.eliminarMeeti
    );

    //Editar información de perfil
    router.get('/editar-perfil', 
        authController.usuarioAutenticado,
        usuariosController.fomrEditarPerfil
    );

    router.post('/editar-perfil', 
        authController.usuarioAutenticado,
        usuariosController.editarPerfil
    );

    //Modifica el password
    router.get('/cambiar-password', 
        authController.usuarioAutenticado,
        usuariosController.formCambiarPassword
    );

    router.post('/cambiar-password', 
        authController.usuarioAutenticado,
        usuariosController.cambiarPassword
    );

    //Imagen de perfil
    router.get('/imagen-perfil', 
        authController.usuarioAutenticado,
        usuariosController.formSubirImagenPerfil
    );

    router.post('/imagen-perfil', 
        authController.usuarioAutenticado,
        usuariosController.subirImagen,
        usuariosController.guardarImagenPerfil
    );

    return router;
};
