# Guide de Configuration Backend (MySQL)

Pour connecter l'application React (Kambegoye) à la base de données MySQL en production, vous ne pouvez pas utiliser directement le code frontend. Vous devez mettre en place un petit serveur backend (API).

## Option A : Node.js (Recommandé)

1.  Créez un dossier `server` à la racine.
2.  Installez les dépendances : `npm install express mysql2 cors dotenv`
3.  Créez un fichier `server/index.js` :

```javascript
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connexion MySQL
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kambegoye_db'
});

// Exemple API : Récupérer les ouvriers
app.get('/api/workers', (req, res) => {
  db.query('SELECT * FROM workers WHERE account_status = "active"', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.listen(3001, () => {
  console.log('Serveur API tourne sur le port 3001');
});
```

4.  Dans votre code React (`services/db.ts`), remplacez les appels `localStorage` par des appels `fetch('http://votre-serveur:3001/api/workers')`.

## Option B : PHP (Si hébergement classique type XAMPP/Cpanel)

1.  Créez un dossier `api` dans votre dossier public (`htdocs`).
2.  Créez `db_connect.php` :

```php
<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$host = "localhost";
$db_name = "kambegoye_db";
$username = "root";
$password = "";

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->exec("set names utf8mb4");
} catch(PDOException $exception) {
    echo "Connection error: " . $exception->getMessage();
}
?>
```

3.  Créez `get_workers.php` :

```php
<?php
include_once 'db_connect.php';

$query = "SELECT * FROM workers WHERE account_status = 'active'";
$stmt = $conn->prepare($query);
$stmt->execute();
$workers = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($workers);
?>
```

## Installation de la base de données

1.  Ouvrez phpMyAdmin ou votre client SQL.
2.  Importez le fichier `database.sql` fourni.
3.  Importez ensuite le fichier `seed.sql` pour avoir les données de test.
