# InternHub - Firebase Integration

A comprehensive internship management system with Firebase backend integration.

## 🔥 Firebase Setup Instructions

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `internhub` (or your preferred name)
4. Enable Google Analytics (optional)
5. Create project

### 2. Enable Authentication
1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Go to **Sign-in method** tab
4. Enable **Email/Password** authentication
5. Click **Save**

### 3. Create Firestore Database
1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select your preferred location
5. Click **Done**

### 4. Get Firebase Configuration
1. Go to **Project Settings** (gear icon)
2. Scroll down to **Your apps**
3. Click **Web app** icon (`</>`)
4. Register app with name: `InternHub`
5. Copy the configuration object

### 5. Update Firebase Config
Replace the configuration in `src/config/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 6. Create Admin Account
1. Go to **Authentication** > **Users**
2. Click **Add user**
3. Email: `divyanshpansari123@gmail.com`
4. Password: `admin123` (or your preferred password)
5. Click **Add user**

### 7. Security Rules (Optional - for production)
Update Firestore rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🚀 Features

### ✅ Complete Firebase Integration
- **Authentication**: Email/password login for admin and interns
- **Firestore**: Real-time data storage and synchronization
- **Auto-sync**: All changes reflect across admin and intern accounts
- **Persistent Data**: No more localStorage - everything saved to cloud

### 👥 User Management
- **Admin Account**: Full system access and management
- **Dynamic Intern Creation**: Admin creates interns with auto-generated Firebase accounts
- **Role-based Access**: Different features for admin vs intern users

### 💬 Real-time Messaging
- **Cross-account Sync**: Messages between admin and interns
- **Persistent Chat History**: All conversations saved to Firebase
- **Real-time Updates**: Instant message delivery and read status

### 📊 Data Management
- **Tasks**: Create, assign, and track task completion
- **Performance**: Review and rating system
- **Attendance**: Mark and track intern attendance
- **Reports**: Generate comprehensive reports

### ⚙️ Settings & Preferences
- **Theme Toggle**: Light/Dark mode with Firebase persistence
- **Password Change**: Update authentication passwords
- **User Preferences**: Saved to Firebase per user

## 🔧 Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Update Firebase Config**
   - Replace config in `src/config/firebase.ts`

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## 📱 Usage

### Admin Login
- Email: `divyanshpansari123@gmail.com`
- Password: `admin123` (or your set password)

### Creating Interns
1. Login as admin
2. Go to **Interns** page
3. Click **Add Intern**
4. Fill intern details
5. System automatically creates Firebase account with default password: `intern123`

### Intern Login
- Use email provided during creation
- Default password: `intern123`
- Can change password in Settings

## 🌐 Deployment

### GitHub Pages Deployment
1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to GitHub Pages**
   - Push code to GitHub repository
   - Enable GitHub Pages in repository settings
   - Set source to `dist` folder

### Firebase Hosting (Recommended)
1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase Hosting**
   ```bash
   firebase init hosting
   ```

4. **Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

## 🔒 Security Notes

- Update Firestore security rules for production
- Use environment variables for sensitive config
- Enable Firebase App Check for additional security
- Regular backup of Firestore data

## 📋 Collections Structure

### Firestore Collections:
- `interns` - Intern user data and profiles
- `tasks` - Task assignments and status
- `performances` - Performance reviews and ratings
- `attendance` - Attendance records
- `messages` - Chat messages
- `chats` - Chat room information
- `settings` - User preferences and settings

## 🎯 Key Features

✅ **No localStorage** - Everything stored in Firebase
✅ **Real-time sync** - Changes reflect instantly across accounts
✅ **Automatic intern account creation** - Admin creates, Firebase handles auth
✅ **Cross-platform messaging** - Admin ↔ Intern communication
✅ **Theme persistence** - Settings saved per user
✅ **Production ready** - Deployable to any hosting platform
✅ **Scalable architecture** - Firebase handles scaling automatically

## 🆘 Troubleshooting

### Common Issues:
1. **Firebase config errors**: Double-check all config values
2. **Authentication issues**: Ensure Email/Password is enabled
3. **Permission errors**: Check Firestore security rules
4. **Build errors**: Ensure all dependencies are installed

### Support:
- Check Firebase Console for error logs
- Review browser console for client-side errors
- Ensure internet connection for Firebase operations