<?php
// Parámetros de conexión a la base de datos
$host = 'localhost';
$dbname = 'questedit';
$user = 'webonyx';
$password = '';


// Crear una cadena de conexión
$conn_string = "host=$host dbname=$dbname user=$user password=$password";


// Establecer conexión a la base de datos
$conn = pg_connect($conn_string);


// Verificar si la conexión fue exitosa
if (!$conn) {
    die("Error de conexión: " . pg_last_error());
}


// Consulta para seleccionar todos los contenidos de la tabla maps
$query = "SELECT * FROM maps";


// Ejecutar la consulta
$result = pg_query($conn, $query);


// Verificar si la consulta fue exitosa
if (!$result) {
    die("Error en la consulta: " . pg_last_error());
}


// Mostrar resultados en un estilo básico de tema oscuro
echo '<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contenido de la Tabla Maps</title>
    <style>
        body {
            background-color: #2c2c2c;
            color: #ffffff;
            font-family: Arial, sans-serif;
            padding: 20px;
        }
        h1 {
            color: #f0a500;
        }
        hr {
            border: 1px solid #444;
        }
    </style>
</head>
<body>
    <h1>Contenido de la Tabla Maps</h1>';


while ($row = pg_fetch_assoc($result)) {
    echo "<p>Categoría: " . htmlspecialchars($row['category']) . "</p>";
    echo "<p>Dificultad: " . htmlspecialchars($row['difficulty']) . "</p>";
    echo "<p>Descripción: " . htmlspecialchars($row['description']) . "</p>";
    echo "<p>Datos del Mapa: " . htmlspecialchars($row['map_data']) . "</p>";
    echo "<hr>";
}


// Liberar el recurso de resultado
pg_free_result($result);


// Cerrar la conexión a la base de datos
pg_close($conn);


echo '</body>
</html>';
?>

