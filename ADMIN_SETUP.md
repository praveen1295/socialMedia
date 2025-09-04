# Admin Setup Instructions

## Default Admin Credentials

After setting up the application, you can create a default admin account with the following credentials:

### Method 1: Using the Setup Script (Recommended)

Run the following command from the project root:

```bash
cd backend
node scripts/setupAdmin.js
```

### Method 2: Using API Endpoint

Make a POST request to create the default admin:

```bash
curl -X POST http://localhost:5000/api/v1/admin/create-default
```

### Default Admin Credentials

- **Email**: `admin@socialmedia.com`
- **Password**: `Admin@123`
- **Role**: `Manager`
- **Permissions**:
  - user-management
  - post-management
  - content-moderation
  - analytics
  - system-settings

## Admin Login

Once the admin account is created, you can log in using the admin login endpoint:

```bash
curl -X POST http://localhost:5000/api/v1/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@socialmedia.com",
    "password": "Admin@123"
  }'
```

## Security Notes

⚠️ **Important**: Change the default admin password after first login in a production environment.

## Admin Features

The admin system includes:

1. **User Management**: View, edit, and manage user accounts
2. **Post Management**: Moderate and manage posts
3. **Content Moderation**: Review and moderate content
4. **Analytics**: Access platform analytics
5. **System Settings**: Configure system-wide settings

## API Endpoints

### Admin Authentication

- `POST /api/v1/admin/login` - Admin login
- `GET /api/v1/admin/logout` - Admin logout
- `GET /api/v1/admin/profile` - Get admin profile (requires authentication)

### Admin Setup

- `POST /api/v1/admin/create-default` - Create default admin account
