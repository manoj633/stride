# Stride Frontend

A modern React application for goal tracking and personal productivity management.

## Overview

Stride Frontend is the user interface for the Stride goal management system. It allows users to create, track, and manage their personal and professional goals, tasks, and subtasks through an intuitive interface.

## Features

- **User Authentication**: Secure login and registration system
- **Goal Management**: Create, edit, and organise personal goals
- **Task Tracking**: Break down goals into manageable tasks and subtasks
- **Progress Visualization**: Track progress with interactive charts
- **Comments System**: Add comments to goals with clickable URL support
- **Calendar View**: Visualise tasks in a calendar format with a heat map

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running (see [main project README](file:///C:\Users\DELL\0Mywork\2024\_11_November\Stride\README.md))

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/manoj633/stride.git
   cd stride/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. The application will be available at `http://localhost:5173`

## Project Structure

```
frontend/
├── public/              # Static files
├── src/
│   ├── components/      # React components
│   │   ├── AddTask/     # Task creation components
│   │   ├── GoalDescription/ # Goal detail components
│   │   ├── Login/       # Authentication components
│   │   ├── Navigation/  # Navigation bar
│   │   ├── TaskCalendar/# Calendar view components
│   │   └── TaskList/    # Task listing components
│   ├── services/        # API services
│   │   ├── api/         # API endpoint definitions
│   │   └── dataService.js # Mock data service
│   ├── store/           # Redux store
│   │   ├── features/    # Redux slices
│   │   └── hooks.js     # Custom Redux hooks
│   ├── utils/           # Utility functions
│   ├── App.jsx          # Main application component
│   └── main.jsx         # Application entry point
├── index.html           # HTML entry point
├── vite.config.js       # Vite configuration
└── package.json         # Project dependencies
```

## Technology Stack

- **React**: UI library
- **Redux Toolkit**: State management
- **React Router**: Navigation
- **Axios**: API requests
- **Vite**: Build tool
- **AmCharts**: Data visualization

## Development

### Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build for production
- `npm run lint`: Run ESLint
- `npm run preview`: Preview production build

### API Integration

The application communicates with the backend API using Axios. The base configuration can be found in [apiService.js](file:///C:\Users\DELL\0Mywork\2024\_11_November\Stride\frontend\src\utils\apiService.js).

Proxy settings in [vite.config.js](file:///C:\Users\DELL\0Mywork\2024\_11_November\Stride\frontend\vite.config.js) allow development mode to seamlessly connect to the API running on port 5000.

### State Management

Redux Toolkit is used for state management with the following main slices:

- `authSlice`: Handles user authentication
- `goalSlice`: Manages goal data
- `taskSlice`: Handles task operations
- `subtaskSlice`: Manages subtasks
- `commentSlice`: Handles goal comments

### Styling

The application uses CSS for styling, with component-specific CSS files alongside their respective components.

## Deployment

To build the production application:

```bash
npm run build
```

The build artefacts will be stored in the `dist/` directory, ready to be deployed to a static hosting service.

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

## License

This project is licensed under the MIT License - see the main project [README](file:///C:\Users\DELL\0Mywork\2024\_11_November\Stride\README.md) for details.
