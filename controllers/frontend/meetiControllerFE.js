const Meeti = require('../../models/Meeti');
const Grupos = require('../../models/Grupos');
const Usuarios = require('../../models/Usuarios');
const Categorias = require('../../models/Categorias');
const Comentarios = require('../../models/Comentarios');
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const sequelize = new Sequelize('meeti', 'postgres', 'root',{
    host: '127.0.0.1',
    port: '5432',
    dialect: 'postgres',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});


exports.mostrarMeeti = async (req, res, next) => {

    const meeti = await Meeti.findOne({
        where: {
            slug: req.params.slug
        },
        include: [
            {
                model: Grupos
            }, {
                model: Usuarios,
                attributes: ['id', 'nombre', 'imagen']
            }
        ]
    });

    
    //Si no existe
    if(!meeti){
        res.redirect('/');
    }

    // Consultar por meeti's cercanos
    const ubicacion = Sequelize.literal(`ST_GeomFromText( 'POINT( ${meeti.ubicacion.coordinates[0]} ${meeti.ubicacion.coordinates[1]} )' )`);

    //ST_DISTANCE_Sphere = Retorna una línea en metros
    const distancia = Sequelize.fn('ST_Distance_Sphere', Sequelize.col('ubicacion'), ubicacion);

    //Encontrar meeti's cercanos
    const cercanos = await Meeti.findAll({
        order: distancia.Fn, //Ordena del más cercano al lejano
        where: Sequelize.where(distancia, { [Op.lte] : 500 } ), //2 km de distancia
        limit: 3, //Máximo 3
        offset: 1, //Ignora el primero
        include: [
            {
                model: Grupos
            }, {
                model: Usuarios,
                attributes: ['id', 'nombre', 'imagen']
            }
        ]
    });
    
    const comentarios = await Comentarios.findAll({ 
        where: { meetiId: meeti.id },
        include: {
            model: Usuarios,
            attributes: ['id', 'nombre', 'imagen']
        }
    });

    //Pasar información a la vista
    res.render('frontend/mostrar-meeti',{
        nombrePagina: meeti.titulo,
        meeti,
        comentarios,
        moment,
        cercanos
    })
}

//Confirmar o cancelar asistencia
exports.confirmarAsistencia = async (req, res) => {
    //Extraemos el valor
    const { accion  }  = req.body;
    let array = new Array();
    array.push(req.user.id.toString());
    
    if(accion === 'confirmar'){
        //Agregar asistencia
        await sequelize.query("UPDATE meetis SET interesados = ARRAY_APPEND(meetis.interesados, $usr) WHERE slug = $slug",
        { bind: {usr: req.user.id, slug: req.params.slug } }
        ).then(result =>{
            // console.log(JSON.stringify(result));
            if(result[1].rowCount > 0){
                res.send('Has confirmado tu asistencia');
            } else {
                res.send('Hubo un error al agregar tu asistencia');
            }
        });

        // Meeti.update(
        //     { 'interesados' :  Sequelize.fn('array_append', Sequelize.col('interesados'), array  ) },
        //     { 'where' : { 'slug' : req.params.slug } }
        // );  

    } else {
        //Cancelar asistencia
        await sequelize.query("UPDATE meetis SET interesados = ARRAY_REMOVE(meetis.interesados, $usr) WHERE slug = $slug",
        { bind: {usr: req.user.id, slug: req.params.slug } }
        ).then(result =>{
            if(result[1].rowCount > 0){
                res.send('Has cancelado tu asistencia');
            } else {
                res.send('Hubo un error al cancelar tu asistencia');
            }
        });
    //    Meeti.update(
    //         { 'interesados' : Sequelize.fn('array_remove', Sequelize.col('interesados'), array ) },
    //         { 'where' : { 'slug' : req.params.slug } }
    //     );
    }
}

//Mostrar listado de asistentes
exports.mostrarAsistentes = async (req, res) => {
    const meeti = await Meeti.findOne({ 
        where : { slug: req.params.slug },
        attributes : ['interesados']
    });

    //Extraer interesados
    const { interesados } = meeti;
    const asistentes = await Usuarios.findAll({
        attributes: ['nombre', 'imagen'],
        where: { id: interesados }
    });

    res.render('frontend/asistentes-meeti', {
        nombrePagina: 'Listado de asistentes',
        asistentes
    })
}

//Mostrar meeti's agrupados por categoría
exports.mostrarCategorias = async (req, res, next) => {
    const categoria = await Categorias.findOne({ 
        where: { slug: req.params.categoria },
        attributes: ['id', 'categoria']
    });

    const meetis = await Meeti.findAll({
        order: [
            ['fecha', 'ASC'],
            ['hora', 'ASC']
        ],
        include: [{
            model: Grupos,
            where: { CategoriaId: categoria.id }
        }, {
            model: Usuarios
        }]
    });

    res.render('frontend/categoria', {
        nombrePagina: `Categoría: ${categoria.categoria}`,
        meetis,
        moment
    });
}