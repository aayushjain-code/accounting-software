# Accounting AI - Financial Management System

A comprehensive accounting software designed specifically for service-based companies, particularly those focused on staff augmentation. This modern web application provides complete financial management capabilities with a beautiful, intuitive interface.

## 🚀 Features

### Core Modules

1. **Dashboard** - Real-time financial overview with key metrics
2. **Client Management** - Complete client relationship tracking
3. **Staff Management** - Augmented staff and contractor management
4. **Project Management** - Client project tracking with budgets
5. **Invoice Management** - Professional invoice creation and tracking
6. **Expense Management** - Business expense tracking and categorization
7. **Financial Reports** - Comprehensive analytics and insights

### Key Features

- **Modern UI/UX** - Clean, responsive design with Tailwind CSS
- **Real-time Data** - Instant updates across all modules
- **Financial Analytics** - Profit/loss, cash flow, and performance metrics
- **Invoice Generation** - Professional invoice creation with tax calculations
- **Expense Categorization** - Organized expense tracking by category
- **Staff Augmentation Focus** - Specialized features for service companies
- **Mobile Responsive** - Works seamlessly on all devices
- **Indian Rupees (₹)** - All amounts displayed in Indian currency

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 with React 18
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand with persistence
- **Icons**: Heroicons and Lucide React
- **Date Handling**: date-fns
- **Notifications**: react-hot-toast
- **TypeScript**: Full type safety throughout

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd accounting-ai
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
accounting-ai/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Dashboard
│   ├── clients/           # Client management
│   ├── staff/             # Staff management
│   ├── projects/          # Project management

│   ├── invoices/          # Invoice management
│   ├── expenses/          # Expense management
│   └── reports/           # Financial reports
├── components/            # Reusable components
│   └── Layout.tsx         # Main layout component
├── store/                 # State management
│   └── index.ts           # Zustand store
├── types/                 # TypeScript definitions
│   └── index.ts           # Type definitions
└── package.json           # Dependencies and scripts
```

## 📊 Data Models

### Core Entities

- **Client**: Company information, contact details, tax ID
- **Staff**: Employee/contractor details, hourly rates, status
- **Project**: Client projects with budgets and timelines

- **Invoice**: Client billing with tax calculations
- **Expense**: Business expenses with categorization
- **FinancialReport**: Analytics and reporting data

## 🎯 Use Cases

### For Staff Augmentation Companies

1. **Client Management**

   - Track client companies and their requirements
   - Manage contact information and billing details
   - Monitor client relationships and history

2. **Staff Management**

   - Manage augmented staff and contractors
   - Track hourly rates and availability
   - Monitor staff performance and utilization

3. **Project Tracking**

   - Assign staff to client projects
   - Track project budgets and timelines
   - Monitor project profitability

4. **Time Tracking**

   - Log hours worked by staff on projects
   - Track billable vs non-billable hours
   - Calculate project costs and revenue

5. **Financial Management**
   - Generate invoices for client work
   - Track business expenses
   - Monitor cash flow and profitability

## 📈 Key Metrics

### Financial Metrics

- Total Revenue and Expenses
- Net Profit and Profit Margin
- Outstanding Invoices
- Monthly Performance

### Operational Metrics

- Staff Utilization Rates
- Project Budget Tracking
- Client Revenue Analysis
- Expense Category Breakdown

### Time Tracking Metrics

- Total Hours Worked
- Billable Hours Percentage
- Time Value Calculation
- Project-wise Time Allocation

## 🎨 UI/UX Features

### Design System

- **Color Palette**: Professional blue theme with semantic colors
- **Typography**: Inter font family for readability
- **Components**: Consistent button, card, and form styles
- **Responsive**: Mobile-first design approach

### User Experience

- **Intuitive Navigation**: Clear sidebar navigation
- **Real-time Updates**: Instant data synchronization
- **Toast Notifications**: User feedback for actions
- **Modal Forms**: Clean data entry experience
- **Data Tables**: Sortable and filterable data views

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file for environment-specific settings:

```env
NEXT_PUBLIC_APP_NAME=Accounting AI
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Customization

- **Branding**: Update colors in `tailwind.config.js`
- **Data Persistence**: Configure Zustand persistence options
- **Currency**: Modify currency formatting in components
- **Date Format**: Adjust date formatting preferences

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deployment Options

- **Vercel**: Recommended for Next.js applications
- **Netlify**: Static site deployment
- **AWS/GCP**: Container-based deployment
- **Self-hosted**: Traditional server deployment

## 📝 Development

### Code Style

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Component Structure**: Functional components with hooks

### State Management

- **Zustand**: Lightweight state management
- **Persistence**: Local storage for data persistence
- **Real-time Updates**: Automatic UI updates
- **Type Safety**: Full TypeScript integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the code examples

## 🔮 Future Enhancements

- **Multi-currency Support**: International business support
- **Advanced Reporting**: Custom report builder
- **Integration APIs**: Third-party service integrations
- **Mobile App**: Native mobile application
- **Multi-tenancy**: SaaS platform capabilities
- **Advanced Analytics**: Machine learning insights
- **Document Management**: File upload and storage
- **Email Integration**: Automated invoice sending

---

**Built with ❤️ for service-based companies and staff augmentation businesses.**
