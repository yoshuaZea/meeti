const passport = require('passport');

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
});

//Revisa si el usuario está autenticado
exports.usuarioAutenticado = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }

    //Si no está autenticado
    return res.redirect('/iniciar-sesion');
}

//Cerrar sesion
exports.cerrarSesion = (req, res, next) => {
    req.logout();
    req.flash('exito', 'Cierre de sesión correctamente');
    res.redirect('/iniciar-sesion');
    next();
}