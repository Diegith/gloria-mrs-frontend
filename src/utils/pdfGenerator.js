import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

export const ejecutarGenerarPDF = (datosIA, positivos, negativos) => {
    const doc = new jsPDF();
    const azulUNAB = [0, 51, 102];
    const azulClaro = [0, 86, 150];

    // --- ENCABEZADO ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(azulUNAB[0], azulUNAB[1], azulUNAB[2]);
    doc.text("Diseño de Escenarios - GlorIA UNAB", 105, 20, { align: "center" });

    // --- SECCIÓN: INFORMACIÓN GENERAL ---
    autoTable(doc, {
        startY: 30,
        head: [["ITEM", "DESCRIPCIÓN"]],
        headStyles: { fillColor: azulUNAB },
        body: [
            ["Nombre del escenario", datosIA.nombreEscenario],
            ["Cliente / Autores", datosIA.autores],
            ["Áreas de conocimiento", datosIA.areasConocimiento],
            ["Duración", `${datosIA.duracion} min`],
            ["Lenguaje", datosIA.lenguaje],
        ],
        bodyStyles: { fontSize: 9 }
    });

    // --- SECCIÓN 1: EL PARTICIPANTE ---
    doc.setFontSize(14);
    doc.setTextColor(azulUNAB[0], azulUNAB[1], azulUNAB[2]);
    doc.text("Sección 1: El Participante", 14, doc.lastAutoTable.finalY + 15);
    autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [["Campo", "Contenido"]],
        headStyles: { fillColor: azulClaro },
        body: [
            ["Rol del participante", datosIA.rolParticipante],
            ["Escenario (Narrativa)", datosIA.descripcionEscenario],
            ["Objetivo 1", datosIA.objetivo1],
            ["Resultado 1", datosIA.resultado1],
        ],
        columnStyles: { 0: { cellWidth: 45, fontStyle: 'bold' } },
        styles: { overflow: 'linebreak' } // Asegura que el texto largo salte de línea
    });

    // --- SECCIÓN 2 Y 3: CONTENIDO Y ENTORNO ---
    doc.text("Sección 2 y 3: Contenido y Entorno", 14, doc.lastAutoTable.finalY + 15);
    autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [["Sección", "Detalles"]],
        headStyles: { fillColor: azulClaro },
        body: [
            ["Contenido Académico", datosIA.contenidoAcademico],
            ["Ambientes (Sección 3)", `${datosIA.escenario1} / ${datosIA.escenario2}`],
            ["Pre-Simulación", datosIA.preSimulacion],
            ["Conocimientos Previos", datosIA.conocimientosPrevios],
            ["Dinámica de Simulación", datosIA.comportamientosSimulacion],
        ],
        columnStyles: { 0: { cellWidth: 45, fontStyle: 'bold' } },
        styles: { overflow: 'linebreak' }
    });

    // --- SECCIÓN 4 Y 5: PERSONAJES Y RETROALIMENTACIÓN ---
    doc.addPage();
    doc.text("Sección 4 y 5: Personajes y Feedback", 14, 20);
    autoTable(doc, {
        startY: 25,
        head: [["Campo", "Descripción"]],
        headStyles: { fillColor: azulClaro },
        body: [
            ["Personajes Adultos", datosIA.personajesAdultos],
            ["Dificultad", datosIA.dificultad],
            ["Retroalimentación", datosIA.retroalimentacion],
            ["Preguntas Post-Simulación", datosIA.accionesPostSimulacion],
        ],
        columnStyles: { 0: { cellWidth: 45, fontStyle: 'bold' } }
    });

    // --- TABLA DE COMPORTAMIENTOS POSITIVOS ---
    doc.setTextColor(46, 125, 50);
    doc.text("Matriz de Comportamientos Positivos (Aciertos)", 14, doc.lastAutoTable.finalY + 15);
    autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [["Activador", "Respuesta Positiva", "Ejemplo"]],
        headStyles: { fillColor: [46, 125, 50] },
        body: positivos.map(p => [p.activador, p.respuestaPositiva, p.ejemplo]),
    });

    // --- TABLA DE COMPORTAMIENTOS NEGATIVOS ---
    doc.setTextColor(198, 40, 40);
    doc.text("Matriz de Comportamientos Problemáticos (Desaciertos)", 14, doc.lastAutoTable.finalY + 15);
    autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [["Activador", "Reacción Negativa", "Plan de Recuperación"]],
        headStyles: { fillColor: [198, 40, 40] },
        body: negativos.map(n => [n.activador, n.respuestaNegativa, n.recuperacion]),
    });

    // --- SECCIÓN FINAL: CONSENTIMIENTO ---
    doc.addPage();
    doc.setTextColor(0, 51, 102);
    doc.text("Consentimiento Informado", 105, 20, { align: "center" });
    autoTable(doc, {
        startY: 30,
        head: [["Término", "Dato Registrado"]],
        headStyles: { fillColor: [40, 40, 40] },
        body: [
            ["Nombre del Firmante", datosIA.nombreConsentimiento],
            ["Documento de Identidad", datosIA.documentoConsentimiento],
            ["Fecha de Aceptación", datosIA.fechaConsentimiento],
            ["Estado de Consentimiento", datosIA.aceptaTerminos ? "ACEPTADO" : "PENDIENTE"],
            ["Firma", datosIA.firmaConsentimiento],
        ]
    });

    // Numeración de páginas
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`GlorIA UNAB | Página ${i} de ${totalPages} | ${new Date().toLocaleDateString()}`, 105, 285, { align: "center" });
    }

    // Guardar archivo en el navegador
    doc.save(`UNAB_Guion_${datosIA.nombreEscenario.replace(/\s+/g, '_')}.pdf`);

    // IMPORTANTE: Retornar el objeto doc para que pueda ser procesado por la función de subida al servidor
    return doc; 
};