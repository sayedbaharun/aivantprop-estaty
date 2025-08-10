# 🏢 Aivantprop - shadcn/ui Enhanced

> Off Plan Dub.ai - Enhanced with shadcn/ui components. Modern property platform with advanced search, interactive maps, and professional UI components.

[![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Latest-green)](https://ui.shadcn.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-cyan)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-Latest-blueviolet)](https://www.prisma.io/)

## ✨ Features

### 🎨 Enhanced UI Components
- **Advanced Search** - Multi-filter search with real-time suggestions
- **Interactive Property Cards** - Quick view, favorites, and enhanced CTAs
- **Professional Contact Forms** - Validation with zod and react-hook-form
- **Stats Dashboard** - Live data visualization with interactive tabs
- **Modern Navigation** - Mobile-responsive with sheet components

### 🗺️ Interactive Maps
- **Property Mapping** - Leaflet-based interactive maps
- **Location Search** - Geographic property discovery
- **Nearby Properties** - Context-aware recommendations
- **Dynamic Loading** - SSR-compatible map components

### 📱 Mobile-First Design
- **Responsive Layout** - Works seamlessly on all devices
- **Touch-Friendly** - Optimized for mobile interactions
- **Progressive Enhancement** - Graceful fallbacks

### 🛠️ Developer Experience
- **TypeScript** - Full type safety
- **Component Library** - Consistent shadcn/ui design system
- **Modern Patterns** - React 18+ with latest Next.js
- **Accessibility** - WCAG compliant components

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database

### Installation

```bash
# Clone the repository
git clone https://github.com/sayedbaharun/aivantprop-shadcn.git
cd aivantprop-shadcn

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Set up the database
npx prisma generate
npx prisma db push

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📦 Tech Stack

### Frontend
- **Next.js 15.4.6** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern component library
- **React Hook Form** - Form state management
- **Zod** - Schema validation

### Backend
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database
- **API Routes** - Next.js API endpoints

### Maps & Visualization
- **Leaflet** - Interactive maps
- **React Leaflet** - React bindings
- **Recharts** - Data visualization

## 🎯 Demo

### Component Showcase
Visit `/demo` to explore all enhanced components:

1. **Search Components** - Advanced filtering and suggestions
2. **Property Cards** - Multiple variants and interactions
3. **Contact Forms** - Validation and user feedback
4. **Dashboard** - Live statistics and analytics
5. **UI Components** - Complete design system

### Live Features
- **Property Search** - `/properties`
- **Interactive Map** - `/map`
- **Investment Calculator** - `/investment`
- **Developer Profiles** - `/developers`

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── demo/              # Component showcase
│   ├── map/               # Interactive map page
│   └── properties/        # Property pages
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   ├── enhanced-*.tsx     # Enhanced components
│   └── *.tsx              # Custom components
├── lib/                   # Utilities and configuration
└── styles/                # Global styles
```

## 🎨 Enhanced Components

### EnhancedSearch
```tsx
import { EnhancedSearch } from '@/components/enhanced-search';

<EnhancedSearch 
  onSearch={handleSearch}
  showFilters={true}
  placeholder="Search properties..."
/>
```

### EnhancedPropertyCard
```tsx
import { EnhancedPropertyCard } from '@/components/enhanced-property-card';

<EnhancedPropertyCard
  property={property}
  onFavorite={handleFavorite}
  variant="featured"
/>
```

### EnhancedContactForm
```tsx
import { EnhancedContactForm } from '@/components/enhanced-contact-form';

<EnhancedContactForm
  propertyTitle="Luxury Villa"
  defaultInquiryType="property_inquiry"
/>
```

## 🔧 API Endpoints

- **GET** `/api/stats` - Property statistics
- **POST** `/api/contact` - Contact form submissions
- **GET** `/api/properties/map` - Map property data

## 🌟 Key Improvements

### Next.js 15 Compatibility
- ✅ Fixed params Promise handling
- ✅ SSR optimization for map components
- ✅ Dynamic imports for client-side components

### Enhanced User Experience
- ✅ Advanced search with filters
- ✅ Interactive property cards
- ✅ Professional form validation
- ✅ Mobile-responsive design
- ✅ Loading states and error handling

### Developer Experience
- ✅ TypeScript throughout
- ✅ Component documentation
- ✅ Consistent design system
- ✅ Modern React patterns
- ✅ Accessible components

## 📱 Responsive Design

The application is fully responsive across all device sizes:

- **Mobile** (320px+) - Touch-optimized interface
- **Tablet** (768px+) - Adaptive layouts
- **Desktop** (1024px+) - Full feature set
- **Large Screens** (1440px+) - Enhanced experience

## 🧪 Testing

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - Amazing component library
- [Next.js](https://nextjs.org/) - The React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Heroicons](https://heroicons.com/) - Beautiful icons
- [Leaflet](https://leafletjs.com/) - Interactive maps

## 📞 Support

For support and questions:
- 📧 Email: info@offplandub.ai
- 🌐 Website: [offplandub.ai](https://offplandub.ai)
- 💬 WhatsApp: +971 50 123 4567

---

<div align="center">
  <p>Built with ❤️ for the UAE property market</p>
  <p>© 2025 Off Plan Dub.ai. All rights reserved.</p>
</div>