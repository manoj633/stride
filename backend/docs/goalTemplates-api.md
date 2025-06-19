# Goal Templates API Documentation

## Base URL
`/api/goal-templates`

## Authentication
All endpoints require authentication (JWT cookie).

---

## Endpoints

### Get All Templates
**GET** `/api/goal-templates`
- Returns all public templates and templates created by the authenticated user.
- **Response:** `200 OK` — Array of template objects

### Get Template by ID
**GET** `/api/goal-templates/:id`
- Returns a template if it is public or owned by the authenticated user.
- **Response:** `200 OK` — Template object
- **Errors:** `403 Forbidden` if not authorized, `404 Not Found` if not found

### Create a User Template
**POST** `/api/goal-templates`
- Creates a new user-specific template for the authenticated user.
- **Body:**
```json
{
  "title": "string",
  "description": "string",
  "category": "string",
  "priority": "string",
  "duration": { "startDate": "date", "endDate": "date" },
  "tags": ["tagId1", "tagId2"],
  "subtasks": [
    { "title": "string", "description": "string", "completed": false }
  ]
}
```
- **Response:** `201 Created` — Created template object

### Update a User Template
**PUT** `/api/goal-templates/:id`
- Updates a template owned by the authenticated user.
- **Body:** Same as create
- **Response:** `200 OK` — Updated template object
- **Errors:** `403 Forbidden` if not authorized, `404 Not Found` if not found

### Delete a User Template
**DELETE** `/api/goal-templates/:id`
- Deletes a template owned by the authenticated user.
- **Response:** `200 OK` — `{ message: "Template deleted" }`
- **Errors:** `403 Forbidden` if not authorized, `404 Not Found` if not found

---

## Template Object Example
```json
{
  "_id": "templateId",
  "title": "Learn a New Programming Language",
  "description": "Master the basics and build a project in a new language.",
  "category": "Education",
  "priority": "High",
  "duration": { "startDate": "2025-07-01", "endDate": "2025-09-30" },
  "tags": ["tagId1"],
  "subtasks": [
    { "title": "Choose a language", "description": "Pick a language to learn.", "completed": false }
  ],
  "isPublic": true,
  "createdBy": null
}
```
