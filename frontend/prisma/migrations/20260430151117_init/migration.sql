-- CreateEnum
CREATE TYPE "EstadoRevision" AS ENUM ('EN_COLA', 'PROCESANDO', 'COMPLETADO', 'ERROR');

-- CreateTable
CREATE TABLE "Tesis" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "autor" TEXT NOT NULL,
    "archivoUrl" TEXT NOT NULL,
    "archivoNombre" TEXT NOT NULL,
    "tipoArchivo" TEXT NOT NULL,
    "tamanioBytes" INTEGER NOT NULL,
    "estado" "EstadoRevision" NOT NULL DEFAULT 'EN_COLA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tesis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Revision" (
    "id" TEXT NOT NULL,
    "tesisId" TEXT NOT NULL,
    "estadoGeneral" TEXT NOT NULL,
    "puntuacionGeneral" DOUBLE PRECISION NOT NULL,
    "tiempoProcesamiento" INTEGER NOT NULL,
    "reportePdfUrl" TEXT,
    "observaciones" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Revision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Revision_tesisId_key" ON "Revision"("tesisId");

-- AddForeignKey
ALTER TABLE "Revision" ADD CONSTRAINT "Revision_tesisId_fkey" FOREIGN KEY ("tesisId") REFERENCES "Tesis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
