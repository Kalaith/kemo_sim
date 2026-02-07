# Kemo Sim 🐾

A captivating god simulation game where you collect, breed, train, and manage adorable kemonomimi creatures with animal ears and unique personalities. Take on the role of a divine being overseeing your own world of magical beings!

## 🌟 Features

- **Collection Management**: Discover and collect various kemonomimi types with unique traits and stats
- **Breeding System**: Combine different kemonomimi to create new generations with inherited traits
- **Training Academy**: Train your creatures for specialized jobs and careers
- **Marketplace**: Buy and sell kemonomimi with a dynamic economy system
- **Family Trees**: Track lineages and genetic inheritance across generations
- **Real-time Simulation**: Watch your creatures grow, train, and develop over time

## 🎮 Game Mechanics

### Kemonomimi Types
Each kemonomimi has:
- **Animal Type**: Fox, Cat, Wolf, Rabbit, and more
- **Base Stats**: Strength, Agility, Intelligence, Charisma, Endurance, Loyalty
- **Unique Traits**: Special abilities and characteristics
- **Job Bonuses**: Natural aptitudes for different professions

### Core Systems
- **Breeding Queue**: Manage multiple breeding pairs simultaneously
- **Training Queue**: Train multiple creatures at once
- **Market Dynamics**: Prices fluctuate based on supply and demand
- **Stat Inheritance**: Complex genetics system for offspring

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Framer Motion animations
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Charts**: Chart.js for statistics visualization
- **Utilities**: React Use hooks
- **Build Tool**: Vite with TypeScript
- **Linting**: ESLint

## 🚀 Installation

### Prerequisites
- Node.js 18+ and npm
- Git

### Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd kemo_sim/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Main application pages
│   ├── hooks/         # Custom React hooks
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions and data
│   ├── api/           # API integration layer
│   └── assets/        # Static assets
├── public/            # Public static files
└── dist/              # Production build output
```

## 🌐 Deployment

The project includes a PowerShell deployment script for publishing to web servers:

### Quick Deploy
```powershell
# Deploy to preview environment (localhost)
.\publish.ps1

# Deploy to production
.\publish.ps1 -Environment production

# Deploy with cleaning
.\publish.ps1 -All -Clean -Environment production
```

### Deployment Options
- **Frontend Only**: `.\publish.ps1 -Frontend`
- **Backend Only**: `.\publish.ps1 -Backend`
- **Both**: `.\publish.ps1 -All` (default)
- **Clean Build**: Add `-Clean` flag
- **Verbose Output**: Add `-Verbose` flag

## 🎯 Development

### Code Style
- Uses ESLint for code quality
- TypeScript for type safety
- Follows React best practices

### Adding New Features
1. Create components in `src/components/`
2. Add pages in `src/pages/`
3. Update types in `src/types/`
4. Add state management in `src/hooks/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

**Enjoy your divine journey as the god of kemonomimi!** 🐺🦊🐱

## License

This project is licensed under the MIT License - see the individual component README files for details.


**Enjoy your divine journey as the god of kemonomimi!** 🐺🦊🐱

Part of the WebHatchery game collection.</content>
