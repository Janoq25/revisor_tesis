const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const tesis1 = await prisma.tesis.create({
    data: {
      titulo: 'Sistema web para control de inventarios',
      autor: 'Juan Pérez',
      archivoUrl: 'http://localhost:3000/uploads/dummy1.pdf',
      archivoNombre: 'dummy1.pdf',
      tipoArchivo: 'pdf',
      tamanioBytes: 1500000,
      estado: 'COMPLETADO',
      revision: {
        create: {
          estadoGeneral: 'Aprobado',
          puntuacionGeneral: 85,
          tiempoProcesamiento: 45,
          observaciones: [
            { seccion: 'Introducción', estado: 'OK', comentario: 'Bien estructurado.' }
          ]
        }
      }
    }
  });

  const tesis2 = await prisma.tesis.create({
    data: {
      titulo: 'Aplicación móvil de asistencia',
      autor: 'María Gómez',
      archivoUrl: 'http://localhost:3000/uploads/dummy2.pdf',
      archivoNombre: 'dummy2.pdf',
      tipoArchivo: 'pdf',
      tamanioBytes: 2500000,
      estado: 'COMPLETADO',
      revision: {
        create: {
          estadoGeneral: 'Observado',
          puntuacionGeneral: 60,
          tiempoProcesamiento: 35,
          observaciones: [
            { seccion: 'Marco Teórico', estado: 'Incompleto', comentario: 'Falta metodologías alternativas.', sugerencia: 'Agregar más marcos de referencia.' }
          ]
        }
      }
    }
  });

  const tesis3 = await prisma.tesis.create({
    data: {
      titulo: 'Red neuronal para detección de plagas',
      autor: 'Carlos Ruiz',
      archivoUrl: 'http://localhost:3000/uploads/dummy3.pdf',
      archivoNombre: 'dummy3.pdf',
      tipoArchivo: 'pdf',
      tamanioBytes: 4500000,
      estado: 'COMPLETADO',
      revision: {
        create: {
          estadoGeneral: 'Rechazado',
          puntuacionGeneral: 35,
          tiempoProcesamiento: 60,
          observaciones: [
            { seccion: 'Referencias', estado: 'Con errores', comentario: 'Solo hay 10 referencias, deben ser 25.', sugerencia: 'Añadir 15 referencias recientes.' }
          ]
        }
      }
    }
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
