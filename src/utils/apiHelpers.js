/**
 * Prepara el FormData para el endpoint @RequestPart
 * @param {Object} doc - Instancia de jsPDF
 * @param {Object} escenarioGenerado - Datos devueltos por la IA
 */
export const crearFormDataEscenario = (doc, escenarioGenerado) => {
    const formData = new FormData();
    const pdfBlob = doc.output('blob'); // Convertimos el PDF a binario

    // Parte 1: Metadata (El DTO EscenarioPdfRequest)
    // Se envía como Blob con tipo application/json para que Spring lo reconozca
    const metadata = {
        escenarioId: null, // O el ID si ya existe
        nombre: `Escenario_${escenarioGenerado.formData.nombreEscenario}.pdf`
    };
    
    formData.append("metadata", new Blob([JSON.stringify(metadata)], {
        type: "application/json"
    }));

    // Parte 2: El archivo binario
    formData.append("file", pdfBlob, `${escenarioGenerado.formData.nombreEscenario}.pdf`);

    return formData;
};