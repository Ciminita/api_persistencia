var express = require("express");
var router = express.Router();
var models = require("../models");
const alumnos = require("../models/alumnos");

router.get("/", (req, res) => {
  console.log("Esto es un mensaje para ver en consola");
  models.alumnos
    .findAll({
      attributes: ["id", "nombre", "apellido", "id_carrera"],
      include: [{
        as: 'Carrera-Relacionada',
        model: models.carrera,
        attributes: ['id', 'nombre']
      }]
    })
    .then(alumnos => res.send(alumnos))
    .catch(() => res.sendStatus(500));
});

router.post("/", (req, res) => {
  models.alumnos
    .create({ nombre: req.body.nombre, apellido: req.body.apellido ,id_carrera: req.body.id_carrera })
    .then(alumnos => res.status(201).send({ id: alumnos.id }))
    .catch(error => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res.status(400).send('Bad request: existe otra carrera con el mismo nombre')
      }
      else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`)
        res.sendStatus(500)
      }
    });
});

const findAlumnos = (id, { onSuccess, onNotFound, onError }) => {
  models.alumnos
    .findOne({
      attributes: ["id", "nombre", "apellido", "id_carrera"],
      where: { id },
    })
    .then(alumnos => (alumnos ? onSuccess(alumnos) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", (req, res) => {
  findAlumnos(req.params.id, {
    onSuccess: alumnos => res.send(alumnos),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id", (req, res) => {
  const onSuccess = alumnos =>
    alumnos
      .update({ nombre: req.body.nombre, apellido: req.body.apellido ,id_carrera: req.body.id_carrera }, { fields: ["nombre"] ["apellido"] ["id_carrera"] })
      .then(() => res.sendStatus(200))
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res.status(400).send('Bad request: existe otra carrera con el mismo nombre')
        }
        else {
          console.log(`Error al intentar actualizar la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
    findAlumnos(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.delete("/:id", (req, res) => {
  const onSuccess = alumnos =>
    alumnos
      .destroy()
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
  findAlumnos(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.patch("/", (req, res) => {
  console.log("Esto es un mensaje para ver en consola");
  models.alumnos
    .findAll({
      attributes: ["id", "nombre", "apellido", "id_carrera"],
      include:[{as: 'Carrera-Relacionada',
      model: models.carrera, 
      attributes: ['id', 'nombre']}],
      limit: 2
    })
    .then(alumnos => res.send(alumnos))
    .catch(() => res.sendStatus(500));
});


module.exports = router;
