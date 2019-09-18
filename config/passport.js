const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Usuarios = require('../models/Usuarios');

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
    },
    async(email, password, next) => {
        //El código se ejecuta al llenar el formulario
        const usuario = await Usuarios.findOne({ 
            where: { email: email, activo: 1 }
        });

        //Revisar si existe
        if(!usuario) return next(null, false, {
            message: 'El usuario ingresado no existe'
        });

        //El usuario existe
        const verificarPass = usuario.validarPassword(password);

        if(!verificarPass) return next(null, false, {
            message: 'Password incorrecto'
        });

        //Todo ok
        return next(null, usuario);
    }
));

passport.serializeUser(function (usuario, callback){
    callback(null, usuario);
});

passport.deserializeUser(function (usuario, callback){
    callback(null, usuario);
});

module.exports = passport;
