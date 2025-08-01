# Accounting Software

A comprehensive accounting software designed specifically for Indian staff augmentation companies. Built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Dashboard**: Real-time financial overview with key metrics
- **Client Management**: Complete CRUD operations for client data
- **Staff Management**: Employee tracking with roles and compensation
- **Project Management**: Budget tracking with GST integration
- **Invoice Management**: Complete billing system with Indian Rupee support
- **Expense Tracking**: Categorized expense management
- **Financial Reports**: Comprehensive analytics and insights

## 🇮🇳 Indian Business Features

- **Currency**: All amounts in Indian Rupees (₹)
- **GST Integration**: 18% tax calculations
- **Indian Addresses**: Realistic Indian business data
- **Phone Numbers**: Indian format (+91-XXXXXXXXXX)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand with persistence
- **Icons**: Heroicons & Lucide React
- **Date Handling**: date-fns
- **Notifications**: react-hot-toast

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/aayushjain-code/accounting-software.git

# Navigate to the project directory
cd accounting-software

# Install dependencies
npm install

# Run the development server
npm run dev
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**:

   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect Next.js and configure the build

2. **Environment Variables** (if needed):

   ```bash
   # Add any environment variables in Vercel dashboard
   CUSTOM_KEY=your_value
   ```

3. **Deploy**:
   - Vercel will automatically build and deploy your application
   - Your app will be available at `https://your-project.vercel.app`

### Manual Deployment

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## 📊 Sample Data

The application comes with realistic dummy data:

- **3 Clients**: TechCorp Solutions, Digital Innovations, Global Systems
- **4 Staff**: Rahul Sharma, Priya Patel, Amit Kumar, Neha Singh
- **3 Projects**: E-commerce Platform, Mobile App, Cloud Migration
- **3 Invoices**: Various statuses (Paid, Sent, Draft)
- **6 Expenses**: Office Rent, Software Licenses, Marketing, etc.

## 🏗️ Project Structure

```
accounting-software/
├── app/                    # Next.js App Router pages
│   ├── clients/           # Client management
│   ├── staff/             # Staff management
│   ├── projects/          # Project management
│   ├── invoices/          # Invoice management
│   ├── expenses/          # Expense tracking
│   ├── reports/           # Financial reports
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
├── store/                # Zustand state management
├── types/                # TypeScript type definitions
├── public/               # Static assets
└── README.md            # This file
```

## 🔧 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 📱 Responsive Design

The application is fully responsive and works on:

- Desktop computers
- Tablets
- Mobile phones

## 🎨 Customization

### Colors

The application uses a custom color palette defined in `tailwind.config.js`:

- Primary: Blue shades
- Success: Green shades
- Warning: Yellow shades
- Danger: Red shades

### Data Models

All data models are defined in `types/index.ts`:

- Client
- Staff
- Project
- Invoice
- Expense
- FinancialReport

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Aayush Jain**

- GitHub: [@aayushjain-code](https://github.com/aayushjain-code)

## 🆘 Support

If you encounter any issues or have questions, please:

1. Check the existing issues
2. Create a new issue with detailed information
3. Include your environment details

---

**Built with ❤️ for Indian businesses**
