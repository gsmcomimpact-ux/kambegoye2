# Guide de Déploiement KAMBEGOYE (Production MySQL)

Ce guide explique comment connecter l'application React à la base de données MySQL que vous venez de créer.

## 1. Mise en place de la Base de Données

1.  Connectez-vous à votre interface de gestion de base de données (phpMyAdmin, MySQL Workbench, etc.).
2.  Exécutez le script contenu dans `database.sql`.
3.  Exécutez le script contenu dans `seed.sql` pour insérer les données de base.

## 2. Création de l'API Backend (Obligatoire)

React ne peut pas se connecter directement à MySQL. Vous devez héberger un petit script PHP sur le même serveur.

**Créez un fichier nommé `api.php` à la racine de votre dossier public sur le serveur (ex: dans `htdocs/` ou `public_html/`).**

```php
<?php
// api.php - API Universelle pour Kambegoye
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Gestion des requêtes OPTIONS (CORS pré-vol)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// CONFIGURATION BDD - À MODIFIER SELON VOTRE HÉBERGEUR
$host = "localhost";
$db_name = "kambegoye_db";
$username = "root";     // ex: id20000_kambegoye
$password = "";         // ex: MonMotDePasse123!

try {
    $pdo = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $pdo->exec("set names utf8mb4");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $exception) {
    echo json_encode(["error" => "Connection error: " . $exception->getMessage()]);
    exit();
}

// ROUTEUR SIMPLE
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';
$data = json_decode(file_get_contents("php://input"), true);

// 1. GET WORKERS
if ($method === 'GET' && $action === 'getWorkers') {
    $stmt = $pdo->prepare("SELECT * FROM workers");
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    // Décodage des JSON strings (workImages)
    foreach ($results as &$row) {
        if (isset($row['workImages'])) $row['workImages'] = json_decode($row['workImages']);
        // Conversion des nombres
        $row['rating'] = (float)$row['rating'];
        $row['reviewCount'] = (int)$row['reviewCount'];
        $row['latitude'] = (float)$row['latitude'];
        $row['longitude'] = (float)$row['longitude'];
        $row['isVerified'] = (bool)$row['isVerified'];
    }
    echo json_encode($results);
}

// 2. GET SPECIALTIES
else if ($method === 'GET' && $action === 'getSpecialties') {
    $stmt = $pdo->prepare("SELECT * FROM specialties");
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

// 3. GET NEIGHBORHOODS
else if ($method === 'GET' && $action === 'getNeighborhoods') {
    $stmt = $pdo->prepare("SELECT * FROM neighborhoods");
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($results as &$row) {
        $row['latitude'] = (float)$row['latitude'];
        $row['longitude'] = (float)$row['longitude'];
    }
    echo json_encode($results);
}

// 4. REGISTER WORKER (POST)
else if ($method === 'POST' && $action === 'registerWorker') {
    $sql = "INSERT INTO workers (id, firstName, lastName, specialtyId, countryId, cityId, neighborhoodId, phone, whatsapp, photoUrl, isVerified, accountStatus, workImages, rating, reviewCount, availability, views) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 'available', 0)";
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([
        $data['id'], $data['firstName'], $data['lastName'], $data['specialtyId'], 
        'NE', 'NE_NIA', $data['neighborhoodId'], $data['phone'], $data['whatsapp'], 
        $data['photoUrl'], 0, 'pending', json_encode($data['workImages'])
    ]);
    echo json_encode(['success' => $result]);
}

// AJOUTER LES AUTRES ROUTES ICI SELON BESOIN...

else {
    echo json_encode(["message" => "API Ready", "action" => $action]);
}
?>
```

## 3. Modification de l'application React

Dans `services/db.ts`, vous devrez modifier les fonctions pour appeler cette API au lieu du localStorage.

Exemple de modification pour `getWorkers` :

```typescript
// Ancienne version
// return safeParse(KEYS.WORKERS, []);

// Nouvelle version (Production)
const response = await fetch('https://votre-site.com/api.php?action=getWorkers');
const data = await response.json();
return data;
```

*Note : Pour le moment, l'application est configurée en mode "Simulation Locale" (localStorage) pour garantir qu'elle fonctionne immédiatement sans serveur. Le passage à l'API PHP se fait lors de l'hébergement définitif.*
