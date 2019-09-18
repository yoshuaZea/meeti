const nodeMailer = require('nodemailer');
const emailConfig = require('../config/email');
const fs = require('fs');
const util = require('util');
const ejs = require('ejs');

let transport = nodeMailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    auth: {
        user: emailConfig.user,
        pass: emailConfig.pass
    }
});

exports.enviarEmail = async (opciones) => {
    console.log(opciones);

    //Leer el archivo para el email - Template
    const archivo = __dirname + `/../views/emails/${opciones.archivo}.ejs`;

    //Compilarlo con FileSystem
    const compilado = ejs.compile(fs.readFileSync(archivo, 'utf8'));

    //Crear el HTML reemplazando variables de EJS
    const html = compilado({ url: opciones.url });

    //Configurar opciones del email
    const opcionesEmail = {
        from: 'Meeti <noreply@meeti.com',
        to: opciones.usuario.email,
        subject: opciones.usuario.subject,
        html: html
    }

    //Enviar el email
    const sendEmail = util.promisify(transport.sendMail, transport);
    return sendEmail.call(transport, opcionesEmail);
}