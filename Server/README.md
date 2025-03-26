# IP-HCK81

API ini merupakan backend untuk aplikasi Wizarding World yang menyediakan endpoint untuk user management, pengelolaan karakter, favorit, dan quiz Sorting Hat.

## Base URL

```

https://wizardingworldip.franzzwan.site/

```

## Authentication

Sebagian besar endpoint memerlukan autentikasi menggunakan Bearer token yang dikirimkan melalui header `Authorization`:

```

Authorization: Bearer <access_token>

```

## Endpoints

### Users

#### Register User

```http
POST /users/register
```

**Request Body:**

```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response (201):**

```json
{
  "id": "integer",
  "username": "string",
  "email": "string"
}
```

#### Login User

```http
POST /users/login
```

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**

```json
{
  "access_token": "string"
}
```

#### Google Login

```http
POST /users/googleLogin
```

**Request Body:**

```json
{
  "googleToken": "string"
}
```

**Response (200/201):**

```json
{
  "message": "string",
  "access_token": "string",
  "user": {
    "id": "integer",
    "username": "string",
    "email": "string"
  }
}
```

#### Get User Profile

```http
GET /users/profile
```

**Response (200):**

```json
{
  "id": "integer",
  "username": "string",
  "email": "string",
  "house": "string"
}
```

### Characters

#### Get All Characters

```http
GET /fav
```

**Query Parameters:**

- `house` (string, optional): Filter berdasarkan house
- `q` (string, optional): Pencarian berdasarkan nama
- `pageNumber` (integer, optional): Nomor halaman
- `pageSize` (integer, optional): Jumlah item per halaman
- `sortBy` (string, optional): Field untuk mengurutkan
- `sortOrder` (string, optional): "ASC" atau "DESC"

**Response (200):**

```json
{
  "message": "string",
  "totalItems": "integer",
  "totalPages": "integer",
  "currentPage": "integer",
  "data": [
    {
      "id": "string",
      "name": "string",
      "house": "string",
      "image": "string"
    }
  ]
}
```

#### Get Character Detail

```http
GET /fav/:CharacterId
```

**Response (200):**

```json
{
  "message": "string",
  "data": {
    "id": "string",
    "name": "string",
    "house": "string",
    "species": "string",
    "gender": "string",
    "patronus": "string",
    "actor": "string",
    "imageUrl": "string"
  }
}
```

### Favorites

#### Add to Favorites

```http
POST /fav/:CharacterId
```

**Response (201):**

```json
{
  "message": "string",
  "data": {
    "id": "integer",
    "CharacterId": "string",
    "characterName": "string",
    "house": "string",
    "imageUrl": "string",
    "UserId": "integer"
  }
}
```

#### Get User Favorites

```http
GET /fav/user
```

**Response (200):**

```json
{
  "message": "string",
  "data": [
    {
      "id": "integer",
      "CharacterId": "string",
      "characterName": "string",
      "house": "string",
      "imageUrl": "string"
    }
  ]
}
```

#### Delete Favorite

```http
DELETE /fav/:CharacterId
```

**Response (200):**

```json
{
  "message": "Favorite character removed successfully"
}
```

### Sorting Hat

#### Submit Sorting Hat Quiz

```http
POST /fav/sortHat
```

**Request Body:**

```json
{
  "answers": ["string", "string", "string", "string"]
}
```

**Response (201):**

```json
{
  "house": "string",
  "explanation": "string",
  "message": "string"
}
```

## Error Responses

### 400 Bad Request

```json
{
  "message": "Error message describing the issue"
}
```

### 401 Unauthorized

```json
{
  "message": "Invalid token"
}
```

### 403 Forbidden

```json
{
  "message": "Access denied"
}
```

### 404 Not Found

```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "message": "Internal server error"
}
```

---

## Setup & Installation

1. **Clone repository:**

   ```bash
   git clone <repository_url>
   cd IP-HCK81
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Konfigurasi Environment:**

   Buat file `.env` berdasarkan contoh berikut:

   ```env
   PORT=3000
   DATABASE_URL=your_database_url
   GOOGLE_CLIENT_ID=your_google_client_id
   SECRET_KEY=your_secret_key
   ```

4. **Jalankan Aplikasi:**

   ```bash
   npm start
   ```

5. **Jalankan Test:**

   ```bash
   npm test
   ```

## Catatan

- Pastikan Anda sudah mengkonfigurasi file `.env` dengan benar.
- Endpoints yang memerlukan autentikasi harus menggunakan token yang valid.
- Dokumentasi ini mengacu pada versi API saat ini. Untuk perubahan dan update selanjutnya, pastikan untuk memeriksa dokumentasi terbaru.
