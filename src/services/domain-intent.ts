import type { ComponentNode, ComponentTree } from '@/types/component-tree';

export type DomainIntentId =
  | 'finance'
  | 'weather'
  | 'cooking'
  | 'automotive'
  | 'travel'
  | 'fitness'
  | 'healthcare'
  | 'education'
  | 'productivity'
  | 'commerce';

interface DomainIntentProfile {
  id: DomainIntentId;
  title: string;
  subtitle: string;
  primaryAction: string;
  secondaryAction: string;
  statMetrics: Array<{ label: string; value: string; change: string }>;
  cardTitles: string[];
  activityItems: string[];
  inputPlaceholders: string[];
  navItems: string[];
  tabItems: string[];
  tableHeaders: string[];
  tableRows: string[][];
  badgeLabels: string[];
  selectOptions?: string[];
  keywords: string[];
}

const DOMAIN_PROFILES: DomainIntentProfile[] = [
  {
    id: 'finance',
    title: 'Finance Home',
    subtitle: 'Track balances, spending, and goals in one place',
    primaryAction: 'Add transaction',
    secondaryAction: 'View insights',
    statMetrics: [
      { label: 'Total Balance', value: '$128,430', change: '+2.8%' },
      { label: 'Monthly Spend', value: '$4,260', change: '-6.1%' },
      { label: 'Investments', value: '$92,040', change: '+3.4%' },
      { label: 'Savings Rate', value: '24%', change: '+1.2%' },
    ],
    cardTitles: ['Spending Trend', 'Budget Health', 'Recent Transactions', 'Goals Progress'],
    activityItems: ['Salary +$4,200', 'Rent -$1,450', 'ETF Buy -$600', 'Dividend +$84', 'Transfer to Savings -$300'],
    inputPlaceholders: ['Search transactions', 'Amount', 'Category', 'Merchant'],
    navItems: ['Overview', 'Accounts', 'Transactions', 'Budgets', 'Investments'],
    tabItems: ['Summary', 'Cash Flow', 'Holdings', 'Goals'],
    tableHeaders: ['Date', 'Description', 'Category', 'Amount'],
    tableRows: [
      ['Mar 02', 'Payroll Deposit', 'Income', '+$4,200'],
      ['Mar 01', 'City Rent', 'Housing', '-$1,450'],
      ['Feb 28', 'ETF Purchase', 'Investments', '-$600'],
    ],
    badgeLabels: ['On Budget', 'Stable', 'Opportunity'],
    selectOptions: ['All Accounts', 'Checking', 'Savings', 'Brokerage'],
    keywords: ['finance', 'financial', 'banking', 'wallet', 'budget', 'transaction', 'portfolio', 'investment', 'wealth', 'cash flow'],
  },
  {
    id: 'weather',
    title: 'Weather Overview',
    subtitle: 'Current conditions, forecast, and alerts at a glance',
    primaryAction: 'View hourly forecast',
    secondaryAction: 'Add location',
    statMetrics: [
      { label: 'Current Temp', value: '72°F', change: '+3°' },
      { label: 'Humidity', value: '58%', change: '-4%' },
      { label: 'Wind', value: '12 mph', change: '+2 mph' },
      { label: 'Rain Chance', value: '30%', change: '+10%' },
    ],
    cardTitles: ['7-Day Forecast', 'Hourly Conditions', 'Air Quality', 'Severe Alerts'],
    activityItems: ['Cloud cover increasing tonight', 'Light rain expected at 6 PM', 'AQI improved to Moderate', 'UV index peaks at 4 PM'],
    inputPlaceholders: ['Search city', 'ZIP code', 'Saved location name', 'Alert threshold'],
    navItems: ['Today', 'Hourly', '10-Day', 'Radar', 'Alerts'],
    tabItems: ['Now', 'Hourly', 'Daily', 'Air Quality'],
    tableHeaders: ['Time', 'Temp', 'Condition', 'Precip'],
    tableRows: [
      ['09:00', '70°F', 'Partly Cloudy', '10%'],
      ['12:00', '74°F', 'Sunny', '0%'],
      ['18:00', '68°F', 'Light Rain', '40%'],
    ],
    badgeLabels: ['Moderate AQI', 'Wind Advisory', 'Rain Watch'],
    selectOptions: ['Current Location', 'San Francisco', 'New York', 'Chicago'],
    keywords: ['weather', 'forecast', 'temperature', 'rain', 'snow', 'storm', 'climate', 'humidity', 'wind', 'aqi', 'air quality'],
  },
  {
    id: 'cooking',
    title: 'Cooking Planner',
    subtitle: 'Recipes, prep, and meal plans for this week',
    primaryAction: 'Add recipe',
    secondaryAction: 'Plan meals',
    statMetrics: [
      { label: 'Saved Recipes', value: '146', change: '+8' },
      { label: 'Meal Prep Time', value: '2h 40m', change: '-15m' },
      { label: 'Weekly Budget', value: '$82', change: '-$6' },
      { label: 'Pantry Score', value: '78%', change: '+5%' },
    ],
    cardTitles: ['Today\'s Meals', 'Top Recipes', 'Shopping List', 'Pantry Inventory'],
    activityItems: ['Added chicken tikka recipe', 'Updated grocery list', 'Prep reminder for tomorrow', 'Saved 3 vegetarian ideas'],
    inputPlaceholders: ['Search recipes', 'Ingredient', 'Cuisine', 'Servings'],
    navItems: ['Recipes', 'Meal Plan', 'Pantry', 'Shopping', 'Favorites'],
    tabItems: ['Breakfast', 'Lunch', 'Dinner', 'Prep'],
    tableHeaders: ['Dish', 'Prep', 'Calories', 'Servings'],
    tableRows: [
      ['Avocado Toast', '10m', '320', '2'],
      ['Chicken Stir Fry', '25m', '540', '3'],
      ['Lentil Soup', '35m', '410', '4'],
    ],
    badgeLabels: ['High Protein', 'Vegetarian', 'Quick Prep'],
    selectOptions: ['Any Cuisine', 'Italian', 'Mexican', 'Japanese'],
    keywords: ['cooking', 'cook', 'recipe', 'meal plan', 'kitchen', 'ingredient', 'bake', 'chef', 'grocery'],
  },
  {
    id: 'automotive',
    title: 'Auto Marketplace',
    subtitle: 'Browse vehicles, pricing, and financing options',
    primaryAction: 'Browse inventory',
    secondaryAction: 'Compare vehicles',
    statMetrics: [
      { label: 'New Listings', value: '324', change: '+21' },
      { label: 'Avg Price', value: '$28,900', change: '-2.4%' },
      { label: 'Saved Cars', value: '14', change: '+3' },
      { label: 'Loan Rate', value: '5.2%', change: '-0.2%' },
    ],
    cardTitles: ['Featured Cars', 'Price Trends', 'Financing Options', 'Dealer Activity'],
    activityItems: ['New Tesla Model 3 listed', 'Price drop: Toyota Camry', 'Loan pre-approval ready', 'Dealer offer expires in 2 days'],
    inputPlaceholders: ['Make or model', 'Maximum price', 'Mileage', 'Location'],
    navItems: ['Inventory', 'Compare', 'Financing', 'Dealers', 'Saved'],
    tabItems: ['New', 'Used', 'Certified', 'Electric'],
    tableHeaders: ['Vehicle', 'Mileage', 'Price', 'Status'],
    tableRows: [
      ['2024 Tesla Model 3', '12,400', '$31,990', 'Available'],
      ['2023 Toyota Camry', '22,180', '$24,800', 'Price Drop'],
      ['2022 Honda Civic', '18,930', '$22,450', 'Pending'],
    ],
    badgeLabels: ['Great Deal', 'Low Mileage', 'Pre-Approved'],
    selectOptions: ['Any Body Type', 'Sedan', 'SUV', 'Truck'],
    keywords: ['car', 'cars', 'auto', 'automotive', 'vehicle', 'dealership', 'dealer', 'used car', 'new car', 'lease', 'financing'],
  },
  {
    id: 'travel',
    title: 'Travel Planner',
    subtitle: 'Organize trips, bookings, and itineraries',
    primaryAction: 'Create itinerary',
    secondaryAction: 'Search flights',
    statMetrics: [
      { label: 'Upcoming Trips', value: '3', change: '+1' },
      { label: 'Avg Nightly', value: '$184', change: '-$12' },
      { label: 'Flight Watch', value: '12 routes', change: '+4' },
      { label: 'Loyalty Points', value: '42,800', change: '+1,300' },
    ],
    cardTitles: ['Upcoming Itinerary', 'Flight Deals', 'Hotels', 'Travel Alerts'],
    activityItems: ['Price drop to Tokyo', 'Hotel booking confirmed', 'Gate update for JFK flight', 'Passport reminder in 30 days'],
    inputPlaceholders: ['Destination', 'Departure date', 'Budget', 'Travelers'],
    navItems: ['Trips', 'Flights', 'Hotels', 'Itineraries', 'Alerts'],
    tabItems: ['Upcoming', 'Planned', 'Booked', 'Saved'],
    tableHeaders: ['Leg', 'Date', 'Carrier', 'Status'],
    tableRows: [
      ['SFO → JFK', 'Mar 18', 'Delta 407', 'On Time'],
      ['JFK → LIS', 'Mar 19', 'TAP 202', 'Boarding 09:20'],
      ['Hotel Check-in', 'Mar 19', 'Lisbon Central', 'Confirmed'],
    ],
    badgeLabels: ['Price Drop', 'Confirmed', 'Check-in Soon'],
    selectOptions: ['Any Destination', 'Tokyo', 'Lisbon', 'Mexico City'],
    keywords: ['travel', 'trip', 'itinerary', 'flight', 'hotel', 'booking', 'vacation', 'destination', 'airbnb'],
  },
  {
    id: 'fitness',
    title: 'Fitness Hub',
    subtitle: 'Workouts, progress, and recovery tracking',
    primaryAction: 'Start workout',
    secondaryAction: 'View plan',
    statMetrics: [
      { label: 'Active Days', value: '18', change: '+3' },
      { label: 'Calories Burned', value: '8,420', change: '+410' },
      { label: 'Avg Heart Rate', value: '132 bpm', change: '-4 bpm' },
      { label: 'Sleep Score', value: '84', change: '+6' },
    ],
    cardTitles: ['Workout Split', 'Progress Trend', 'Recovery', 'Nutrition'],
    activityItems: ['Completed upper body session', 'Hit weekly cardio goal', 'Recovery score improved', 'Hydration target met'],
    inputPlaceholders: ['Search workout', 'Exercise', 'Duration', 'Target muscle'],
    navItems: ['Dashboard', 'Workouts', 'Nutrition', 'Recovery', 'Coach'],
    tabItems: ['Today', 'Plan', 'History', 'Insights'],
    tableHeaders: ['Exercise', 'Sets', 'Reps', 'Load'],
    tableRows: [
      ['Bench Press', '4', '8', '155 lb'],
      ['Squat', '5', '5', '225 lb'],
      ['Row', '4', '10', '95 lb'],
    ],
    badgeLabels: ['PR Week', 'On Track', 'Recovered'],
    selectOptions: ['All Programs', 'Strength', 'Hypertrophy', 'Conditioning'],
    keywords: ['fitness', 'workout', 'gym', 'exercise', 'training', 'calories', 'steps', 'cardio', 'strength'],
  },
  {
    id: 'healthcare',
    title: 'Health Dashboard',
    subtitle: 'Appointments, vitals, and care plans',
    primaryAction: 'Book appointment',
    secondaryAction: 'View records',
    statMetrics: [
      { label: 'Next Appointment', value: 'Mar 14', change: 'In 4 days' },
      { label: 'Heart Rate', value: '71 bpm', change: 'Normal' },
      { label: 'Medication Adherence', value: '92%', change: '+2%' },
      { label: 'Sleep', value: '7h 24m', change: '+18m' },
    ],
    cardTitles: ['Care Timeline', 'Vitals', 'Medications', 'Lab Results'],
    activityItems: ['Lab report uploaded', 'Prescription refill reminder', 'Telehealth slot available', 'Care plan updated'],
    inputPlaceholders: ['Search provider', 'Symptoms', 'Medication', 'Insurance ID'],
    navItems: ['Overview', 'Appointments', 'Vitals', 'Medications', 'Records'],
    tabItems: ['Today', 'Care Plan', 'History', 'Messages'],
    tableHeaders: ['Date', 'Provider', 'Visit', 'Outcome'],
    tableRows: [
      ['Mar 01', 'Dr. Patel', 'Annual Checkup', 'Completed'],
      ['Mar 14', 'Dr. Lin', 'Follow-up', 'Scheduled'],
      ['Mar 20', 'Lab Center', 'Blood Panel', 'Pending'],
    ],
    badgeLabels: ['Stable', 'Refill Due', 'Follow-Up'],
    selectOptions: ['All Providers', 'Primary Care', 'Cardiology', 'Dermatology'],
    keywords: ['health', 'healthcare', 'medical', 'doctor', 'clinic', 'patient', 'appointment', 'medication', 'hospital'],
  },
  {
    id: 'education',
    title: 'Learning Dashboard',
    subtitle: 'Courses, progress, and assignments',
    primaryAction: 'Continue learning',
    secondaryAction: 'Browse courses',
    statMetrics: [
      { label: 'Courses Active', value: '6', change: '+1' },
      { label: 'Completion', value: '68%', change: '+9%' },
      { label: 'Study Time', value: '9h 15m', change: '+1h' },
      { label: 'Quizzes Due', value: '3', change: 'Today' },
    ],
    cardTitles: ['Course Progress', 'Upcoming Lessons', 'Assignments', 'Achievements'],
    activityItems: ['Module 4 completed', 'Quiz due tomorrow', 'New lesson unlocked', 'Certificate milestone reached'],
    inputPlaceholders: ['Search courses', 'Topic', 'Instructor', 'Difficulty'],
    navItems: ['Home', 'Courses', 'Assignments', 'Grades', 'Certificates'],
    tabItems: ['Current', 'Upcoming', 'Completed', 'Recommended'],
    tableHeaders: ['Course', 'Instructor', 'Progress', 'Due'],
    tableRows: [
      ['Intro to UX', 'M. Keller', '72%', 'Quiz Mar 05'],
      ['Data Foundations', 'A. Singh', '64%', 'Lab Mar 07'],
      ['Product Strategy', 'L. Chen', '88%', 'Project Mar 11'],
    ],
    badgeLabels: ['On Pace', 'Quiz Due', 'Certificate Ready'],
    selectOptions: ['All Subjects', 'Design', 'Engineering', 'Business'],
    keywords: ['learn', 'learning', 'education', 'course', 'lesson', 'class', 'student', 'teacher', 'quiz', 'assignment', 'school'],
  },
  {
    id: 'productivity',
    title: 'Productivity Workspace',
    subtitle: 'Tasks, priorities, and team activity',
    primaryAction: 'Create task',
    secondaryAction: 'Open calendar',
    statMetrics: [
      { label: 'Tasks Completed', value: '42', change: '+7' },
      { label: 'In Progress', value: '9', change: '-2' },
      { label: 'Focus Hours', value: '26h', change: '+4h' },
      { label: 'Team Velocity', value: '88', change: '+6' },
    ],
    cardTitles: ['Priority Queue', 'Team Timeline', 'Calendar', 'Recent Updates'],
    activityItems: ['Roadmap draft reviewed', 'Design handoff complete', 'Sprint tasks reprioritized', 'Meeting moved to 3 PM'],
    inputPlaceholders: ['Search tasks', 'Project name', 'Assignee', 'Due date'],
    navItems: ['Inbox', 'Projects', 'Calendar', 'Team', 'Reports'],
    tabItems: ['My Work', 'Team', 'Upcoming', 'Done'],
    tableHeaders: ['Task', 'Owner', 'Priority', 'Due'],
    tableRows: [
      ['Finalize Q2 roadmap', 'Carlo', 'High', 'Mar 04'],
      ['Prep design review', 'Ari', 'Medium', 'Mar 06'],
      ['Ship onboarding fix', 'Nina', 'High', 'Mar 03'],
    ],
    badgeLabels: ['High Priority', 'Blocked', 'Ready'],
    selectOptions: ['All Projects', 'Core App', 'Growth', 'Infra'],
    keywords: ['productivity', 'task', 'todo', 'project', 'workflow', 'kanban', 'schedule', 'roadmap', 'team app'],
  },
  {
    id: 'commerce',
    title: 'Commerce Dashboard',
    subtitle: 'Orders, conversion, and inventory insights',
    primaryAction: 'Add product',
    secondaryAction: 'View orders',
    statMetrics: [
      { label: 'Orders Today', value: '184', change: '+14%' },
      { label: 'Conversion', value: '3.9%', change: '+0.4%' },
      { label: 'AOV', value: '$74.60', change: '+$3.10' },
      { label: 'Stock Alerts', value: '7', change: '+2' },
    ],
    cardTitles: ['Sales Trend', 'Top Products', 'Order Pipeline', 'Inventory Health'],
    activityItems: ['Order #3821 fulfilled', 'Low stock: Wireless Mouse', 'New review on Product A', 'Campaign CTR improved to 5.4%'],
    inputPlaceholders: ['Search products', 'SKU', 'Category', 'Order ID'],
    navItems: ['Overview', 'Orders', 'Products', 'Customers', 'Inventory'],
    tabItems: ['Today', 'Week', 'Month', 'Campaigns'],
    tableHeaders: ['Order', 'Customer', 'Total', 'Status'],
    tableRows: [
      ['#3821', 'Mia Chen', '$128.50', 'Fulfilled'],
      ['#3822', 'Noah Smith', '$74.10', 'Packed'],
      ['#3823', 'Ravi Patel', '$219.90', 'Payment Review'],
    ],
    badgeLabels: ['Top Seller', 'Low Stock', 'High Conversion'],
    selectOptions: ['All Categories', 'Accessories', 'Electronics', 'Home'],
    keywords: ['shop', 'store', 'ecommerce', 'checkout', 'cart', 'order', 'inventory', 'retail', 'marketplace'],
  },
];

export interface DomainIntentMatch {
  id: DomainIntentId;
  confidence: number;
}

function domainById(id: DomainIntentId): DomainIntentProfile {
  return DOMAIN_PROFILES.find((domain) => domain.id === id) ?? DOMAIN_PROFILES[0];
}

export function detectDomainIntent(prompt: string): DomainIntentMatch | null {
  const text = prompt.trim().toLowerCase();
  if (!text) return null;

  let best: { id: DomainIntentId; score: number } | null = null;

  for (const profile of DOMAIN_PROFILES) {
    const score = profile.keywords.reduce((sum, keyword) => {
      if (!keyword) return sum;
      if (keyword.includes(' ')) {
        return text.includes(keyword.toLowerCase()) ? sum + 2 : sum;
      }

      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      return regex.test(text) ? sum + 1 : sum;
    }, 0);

    if (score <= 0) continue;
    if (!best || score > best.score) {
      best = { id: profile.id, score };
    }
  }

  if (!best) return null;
  const confidence = Math.min(0.98, 0.35 + best.score * 0.09);
  return { id: best.id, confidence };
}

export function buildDomainPromptSection(match: DomainIntentMatch): string {
  const profile = domainById(match.id);
  return [
    `Domain Intent: ${profile.id}`,
    `Primary Context: ${profile.title}`,
    `Primary CTA: ${profile.primaryAction}`,
    `Secondary CTA: ${profile.secondaryAction}`,
    `Navigation labels should reflect this domain: ${profile.navItems.join(', ')}.`,
    `Use table columns relevant to this domain: ${profile.tableHeaders.join(', ')}.`,
    `Use domain-specific information architecture with these modules: ${profile.cardTitles.join(', ')}.`,
    `Use realistic domain copy and metrics that fit ${profile.id}.`,
  ].join('\n');
}

function replaceFirstText(children: (ComponentNode | string)[] | undefined, value: string): (ComponentNode | string)[] | undefined {
  if (!children) return children;
  let replaced = false;
  return children.map((child) => {
    if (replaced) return child;
    if (typeof child === 'string') {
      replaced = true;
      return value;
    }
    return child;
  });
}

export function applyDomainIntentToTree(tree: ComponentTree, match: DomainIntentMatch): ComponentTree {
  const profile = domainById(match.id);
  const narrative = [profile.subtitle, ...profile.activityItems, ...profile.cardTitles];

  const index = {
    heading: 0,
    paragraph: 0,
    button: 0,
    stat: 0,
    card: 0,
    listItem: 0,
    input: 0,
    text: 0,
    link: 0,
    badge: 0,
    narrative: 0,
    table: 0,
    tabs: 0,
  };

  const nextNarrative = () => {
    const value = narrative[index.narrative % narrative.length] ?? profile.subtitle;
    index.narrative += 1;
    return value;
  };

  const mapNode = (node: ComponentNode): ComponentNode => {
    const props = { ...node.props } as Record<string, unknown>;
    const styles = { ...node.styles };
    let children = node.children;

    switch (node.type) {
      case 'heading': {
        if (index.heading === 0) {
          children = replaceFirstText(children, profile.title);
        } else {
          const cardTitle = profile.cardTitles[(index.heading - 1) % profile.cardTitles.length] ?? 'Overview';
          children = replaceFirstText(children, cardTitle);
        }
        index.heading += 1;
        break;
      }
      case 'paragraph': {
        children = replaceFirstText(children, nextNarrative());
        index.paragraph += 1;
        break;
      }
      case 'text': {
        children = replaceFirstText(children, nextNarrative());
        index.text += 1;
        break;
      }
      case 'button': {
        const label =
          index.button === 0
            ? profile.primaryAction
            : index.button === 1
              ? profile.secondaryAction
              : profile.navItems[index.button % profile.navItems.length] ?? profile.secondaryAction;
        children = replaceFirstText(children, label);
        index.button += 1;
        break;
      }
      case 'stat': {
        const metric = profile.statMetrics[index.stat % profile.statMetrics.length];
        props.label = metric.label;
        props.value = metric.value;
        props.change = metric.change;
        index.stat += 1;
        break;
      }
      case 'card': {
        props.title = profile.cardTitles[index.card % profile.cardTitles.length] ?? props.title;
        index.card += 1;
        break;
      }
      case 'listItem': {
        const item = profile.activityItems[index.listItem % profile.activityItems.length];
        children = replaceFirstText(children, item);
        index.listItem += 1;
        break;
      }
      case 'badge': {
        children = replaceFirstText(children, profile.badgeLabels[index.badge % profile.badgeLabels.length] ?? profile.badgeLabels[0]);
        index.badge += 1;
        break;
      }
      case 'link':
      case 'menu': {
        children = replaceFirstText(children, profile.navItems[index.link % profile.navItems.length] ?? profile.primaryAction);
        index.link += 1;
        break;
      }
      case 'tabs': {
        props.items = profile.tabItems;
        if (children && children.length > 0) {
          let tabIndex = 0;
          children = children.map((child) => {
            if (typeof child === 'string') {
              const value = profile.tabItems[tabIndex % profile.tabItems.length] ?? child;
              tabIndex += 1;
              return value;
            }
            return child;
          });
        }
        index.tabs += 1;
        break;
      }
      case 'table': {
        props.headers = profile.tableHeaders;
        props.columns = profile.tableHeaders;
        props.rows = profile.tableRows;
        index.table += 1;
        break;
      }
      case 'input':
      case 'textarea':
      case 'select': {
        props.placeholder = profile.inputPlaceholders[index.input % profile.inputPlaceholders.length] ?? props.placeholder;
        if (node.type === 'select') {
          props.options = profile.selectOptions ?? profile.navItems;
        }
        index.input += 1;
        break;
      }
      default:
        break;
    }

    const nextChildren = children?.map((child) => (typeof child === 'string' ? child : mapNode(child)));

    return {
      ...node,
      props,
      styles,
      children: nextChildren,
    };
  };

  return {
    ...tree,
    root: mapNode(tree.root),
    metadata: {
      ...tree.metadata,
      name: `${profile.title} — ${tree.metadata.name}`,
      description: `${profile.id} context · ${tree.metadata.description}`,
      domainIntent: profile.id,
      domainConfidence: Number(match.confidence.toFixed(2)),
    },
  };
}
