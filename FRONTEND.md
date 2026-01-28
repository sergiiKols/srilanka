# 🎨 FRONTEND.md — Web приложение, Формы, Компоненты

**Версия:** 1.0  
**Дата:** 25 января 2026  
**Для кого?** Frontend разработчик (React/Astro), UI/UX дизайнер  
**Размер:** ~5,000 слов  
**Время чтения:** 20-25 минут

---

## 📋 ОГЛАВЛЕНИЕ

1. [Web Structure & Routes](#web-structure--routes)
2. [Landing Page](#landing-page)
3. [Search Forms](#search-forms)
4. [Key Components](#key-components)
5. [Styling & Responsive Design](#styling--responsive-design)

---

## WEB STRUCTURE & ROUTES

### Routes (Astro)

```
src/pages/
├─ index.astro                     # Landing page
├─ search.astro                    # Search form selection
├─ search-form-tourist.astro       # Tourist form (3 steps)
├─ search-form-nomad.astro         # Crypto nomad form (3 steps)
├─ map/
│  ├─ [task_id].astro              # Personalized map view
│  └─ offers/[offer_id].astro      # Offer detail page
├─ landlords/[landlord_id].astro   # Landlord profile
├─ blog/
│  ├─ index.astro                  # Blog listing
│  └─ [slug].astro                 # Blog article
├─ contact.astro                   # Contact form
├─ about.astro                     # About page
├─ privacy.astro                   # Privacy policy
├─ terms.astro                     # Terms of service
└─ 404.astro                       # 404 error page

Admin routes: /admin/* (Next.js or separate app)
```

---

### Components Tree

```
src/components/
├─ Header.astro                    # Navigation bar
├─ Footer.astro                    # Footer
├─ Hero.astro                      # Landing hero section
│
├─ Forms/
│  ├─ TouristForm.tsx              # 3-step tourist form
│  ├─ NomadForm.tsx                # 3-step nomad form
│  ├─ ContactForm.tsx              # Contact form
│  └─ FormStep.tsx                 # Reusable step component
│
├─ Search/
│  ├─ SearchBar.tsx                # Location search
│  ├─ DatePicker.tsx               # Date range picker
│  ├─ FilterSidebar.tsx            # Filters (price, amenities)
│  └─ ResultsList.tsx              # Results in list view
│
├─ Map/
│  ├─ MapViewer.tsx                # Leaflet map component
│  ├─ MarkerCluster.tsx            # Marker clustering
│  └─ OfferPopup.tsx               # Popup on marker click
│
├─ Cards/
│  ├─ OfferCard.tsx                # Offer listing card
│  ├─ LandlordCard.tsx             # Landlord profile card
│  ├─ TestimonialCard.tsx          # User testimonial
│  └─ FeatureCard.tsx              # Feature highlight
│
├─ Common/
│  ├─ Button.tsx                   # Reusable button
│  ├─ Input.tsx                    # Reusable input
│  ├─ Modal.tsx                    # Modal dialog
│  ├─ Toast.tsx                    # Notifications
│  └─ Spinner.tsx                  # Loading spinner
│
└─ Admin/
   ├─ Sidebar.tsx                  # Admin sidebar
   ├─ DataTable.tsx                # Generic data table
   ├─ Dashboard.tsx                # Main dashboard
   └─ Charts.tsx                   # Analytics charts
```

---

## LANDING PAGE

### Structure

```
┌────────────────────────────────────────┐
│         HEADER & NAVIGATION            │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  🌍 Find Your Perfect Stay       │ │
│  │  Cheap. Direct. Easy.            │ │
│  │  [Get Started]                   │ │
│  └──────────────────────────────────┘ │  HERO
│                                        │
├────────────────────────────────────────┤
│                                        │
│  How It Works (3 steps with icons)    │  HOW IT WORKS
│                                        │
├────────────────────────────────────────┤
│                                        │
│  Success Stories (3 testimonials)     │  TESTIMONIALS
│                                        │
├────────────────────────────────────────┤
│                                        │
│  Why Choose Us (6 benefits)           │  BENEFITS
│                                        │
├────────────────────────────────────────┤
│                                        │
│  Featured Destinations (Carousel)     │  DESTINATIONS
│                                        │
├────────────────────────────────────────┤
│  FAQ (Accordion)                       │  FAQ
├────────────────────────────────────────┤
│  CTA: [Start Searching]               │  CTA
├────────────────────────────────────────┤
│         FOOTER                         │
└────────────────────────────────────────┘
```

---

### Code Example (Hero Section)

```astro
// components/Hero.astro
---
interface Props {
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
}

const { title, subtitle, cta_text, cta_link } = Astro.props;
---

<section class="hero">
  <div class="hero__content">
    <h1 class="hero__title">{title}</h1>
    <p class="hero__subtitle">{subtitle}</p>
    <a href={cta_link} class="btn btn--primary btn--lg">
      {cta_text} →
    </a>
  </div>
</section>

<style>
  .hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 120px 20px;
    text-align: center;
    min-height: 600px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hero__title {
    font-size: 3.5rem;
    margin-bottom: 20px;
    font-weight: 700;
  }

  .hero__subtitle {
    font-size: 1.25rem;
    margin-bottom: 40px;
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    .hero {
      padding: 60px 20px;
      min-height: auto;
    }

    .hero__title {
      font-size: 2rem;
    }

    .hero__subtitle {
      font-size: 1rem;
    }
  }
</style>
```

---

## SEARCH FORMS

### Tourist Form (3 Steps)

#### Step 1: Dates & Location

```typescript
// components/Forms/TouristForm.tsx
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import axios from 'axios';

export function TouristFormStep1() {
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [location, setLocation] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!checkIn) newErrors.checkIn = 'Check-in date is required';
    if (!checkOut) newErrors.checkOut = 'Check-out date is required';
    if (checkIn && checkOut && checkOut <= checkIn) {
      newErrors.checkOut = 'Check-out must be after check-in';
    }
    if (!location.trim()) newErrors.location = 'Location is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Geocode location
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${location}&format=json`
    );

    if (response.data.length === 0) {
      setErrors({ location: 'Location not found' });
      return;
    }

    const { lat, lon } = response.data[0];

    // Store in state/context and move to next step
    window.dispatchEvent(
      new CustomEvent('formStep1Complete', {
        detail: { checkIn, checkOut, location, lat, lon }
      })
    );
  };

  return (
    <form onSubmit={handleNext} className="form form--step1">
      <div className="form__group">
        <label className="form__label">When are you traveling?</label>
        <div className="form__row">
          <div className="form__field">
            <label className="form__label--small">From</label>
            <DatePicker
              selected={checkIn}
              onChange={(date) => setCheckIn(date)}
              placeholderText="2026-03-01"
              minDate={new Date()}
              dateFormat="yyyy-MM-dd"
              className="form__input"
            />
            {errors.checkIn && <span className="form__error">{errors.checkIn}</span>}
          </div>

          <div className="form__field">
            <label className="form__label--small">To</label>
            <DatePicker
              selected={checkOut}
              onChange={(date) => setCheckOut(date)}
              placeholderText="2026-03-14"
              minDate={checkIn || new Date()}
              dateFormat="yyyy-MM-dd"
              className="form__input"
            />
            {errors.checkOut && <span className="form__error">{errors.checkOut}</span>}
          </div>
        </div>
      </div>

      <div className="form__group">
        <label className="form__label">Where?</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Bali, Indonesia"
          className="form__input form__input--large"
        />
        {errors.location && <span className="form__error">{errors.location}</span>}
      </div>

      <button type="submit" className="btn btn--primary btn--full-width">
        Next →
      </button>
    </form>
  );
}
```

---

#### Step 2: Property Type & Amenities

```typescript
export function TouristFormStep2() {
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [budget, setBudget] = useState([50, 300]);
  const [amenities, setAmenities] = useState<string[]>([]);

  const propertyOptions = ['Apartment', 'Villa', 'House', 'Room'];
  const amenityOptions = [
    'WiFi',
    'Kitchen',
    'AC',
    'Pool',
    'Workspace',
    'Washer',
    'A/C',
    'Terrace'
  ];

  const togglePropertyType = (type: string) => {
    setPropertyTypes(
      propertyTypes.includes(type)
        ? propertyTypes.filter((t) => t !== type)
        : [...propertyTypes, type]
    );
  };

  const toggleAmenity = (amenity: string) => {
    setAmenities(
      amenities.includes(amenity)
        ? amenities.filter((a) => a !== amenity)
        : [...amenities, amenity]
    );
  };

  return (
    <form className="form form--step2">
      <div className="form__group">
        <label className="form__label">Property Type</label>
        <div className="form__checkboxes">
          {propertyOptions.map((type) => (
            <label key={type} className="form__checkbox">
              <input
                type="checkbox"
                checked={propertyTypes.includes(type)}
                onChange={() => togglePropertyType(type)}
              />
              {type}
            </label>
          ))}
        </div>
      </div>

      <div className="form__group">
        <label className="form__label">
          Budget per night: ${budget[0]} - ${budget[1]}
        </label>
        <div className="form__range-container">
          <input
            type="range"
            min="0"
            max="500"
            step="10"
            value={budget[0]}
            onChange={(e) => setBudget([parseInt(e.target.value), budget[1]])}
            className="form__range"
          />
          <input
            type="range"
            min="0"
            max="500"
            step="10"
            value={budget[1]}
            onChange={(e) => setBudget([budget[0], parseInt(e.target.value)])}
            className="form__range"
          />
        </div>
      </div>

      <div className="form__group">
        <label className="form__label">Must-have Amenities</label>
        <div className="form__checkboxes">
          {amenityOptions.map((amenity) => (
            <label key={amenity} className="form__checkbox">
              <input
                type="checkbox"
                checked={amenities.includes(amenity)}
                onChange={() => toggleAmenity(amenity)}
              />
              {amenity}
            </label>
          ))}
        </div>
      </div>

      <div className="form__actions">
        <button type="button" className="btn btn--outline">
          ← Back
        </button>
        <button type="submit" className="btn btn--primary">
          Next →
        </button>
      </div>
    </form>
  );
}
```

---

#### Step 3: Contact Info

```typescript
export function TouristFormStep3() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    telegram: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name required';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Valid email required';
    }
    if (!formData.phone && !formData.telegram) {
      newErrors.contact = 'Phone or Telegram required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await axios.post('/api/rental-tasks', {
        ...formData,
        ...(window as any).__formData // from previous steps
      });

      // Redirect to map
      window.location.href = `/map/${response.data.task_id}`;
    } catch (error) {
      setErrors({ submit: 'Failed to submit form' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form form--step3">
      <div className="form__row">
        <div className="form__field">
          <label className="form__label">First Name</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="form__input"
            placeholder="John"
          />
          {errors.firstName && <span className="form__error">{errors.firstName}</span>}
        </div>

        <div className="form__field">
          <label className="form__label">Last Name</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="form__input"
            placeholder="Doe"
          />
          {errors.lastName && <span className="form__error">{errors.lastName}</span>}
        </div>
      </div>

      <div className="form__group">
        <label className="form__label">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="form__input"
          placeholder="john@example.com"
        />
        {errors.email && <span className="form__error">{errors.email}</span>}
      </div>

      <div className="form__group">
        <label className="form__label">Phone (optional)</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="form__input"
          placeholder="+1-234-567-8900"
        />
      </div>

      <div className="form__group">
        <label className="form__label">Telegram (optional)</label>
        <input
          type="text"
          value={formData.telegram}
          onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
          className="form__input"
          placeholder="@johndoe"
        />
      </div>

      <label className="form__checkbox">
        <input type="checkbox" required />
        I accept terms of service
      </label>

      <div className="form__actions">
        <button type="button" className="btn btn--outline">
          ← Back
        </button>
        <button
          type="submit"
          className="btn btn--primary btn--full-width"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
}
```

---

## KEY COMPONENTS

### Map Component (Leaflet)

```typescript
import L from 'leaflet';
import { useEffect, useRef } from 'react';

interface Offer {
  id: string;
  title: string;
  lat: number;
  lng: number;
  price: number;
}

export function MapViewer({ taskId, offers }: { taskId: string; offers: Offer[] }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = L.map(mapContainer.current).setView([0, 0], 12);

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map.current);

    // Add markers for each offer
    offers.forEach((offer) => {
      const customIcon = L.icon({
        iconUrl: '/images/marker-blue.png',
        shadowUrl: '/images/marker-shadow.png',
        iconSize: [30, 40],
        shadowSize: [40, 40],
        iconAnchor: [15, 40],
        shadowAnchor: [12, 40],
        popupAnchor: [0, -40]
      });

      const marker = L.marker([offer.lat, offer.lng], { icon: customIcon }).addTo(
        map.current!
      );

      marker.bindPopup(`
        <div class="offer-popup">
          <h3 class="offer-popup__title">${offer.title}</h3>
          <p class="offer-popup__price">$${offer.price}/night</p>
          <a href="/map/offers/${offer.id}" class="btn btn--sm btn--primary">
            View Details
          </a>
        </div>
      `);
    });

    // Fit bounds to all markers
    if (offers.length > 0) {
      const bounds = L.latLngBounds(offers.map((o) => [o.lat, o.lng]));
      map.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [offers]);

  return (
    <div
      ref={mapContainer}
      style={{
        width: '100%',
        height: '600px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}
    />
  );
}
```

---

### Offer Card Component

```typescript
export function OfferCard({ offer }: { offer: Offer }) {
  return (
    <div className="offer-card">
      <div className="offer-card__image">
        <img
          src={offer.photo_urls?.[0] || '/images/placeholder.jpg'}
          alt={offer.title}
          className="offer-card__img"
        />
        {offer.featured && <span className="offer-card__badge">Featured</span>}
      </div>

      <div className="offer-card__content">
        <h3 className="offer-card__title">{offer.title}</h3>

        <div className="offer-card__meta">
          <span className="offer-card__location">📍 {offer.location_city}</span>
          <span className="offer-card__rating">⭐ {offer.average_rating || 'N/A'}</span>
        </div>

        <p className="offer-card__description">{offer.description.substring(0, 100)}...</p>

        <div className="offer-card__amenities">
          {offer.amenities?.slice(0, 3).map((amenity) => (
            <span key={amenity} className="offer-card__amenity-tag">
              {amenity}
            </span>
          ))}
          {offer.amenities?.length > 3 && (
            <span className="offer-card__amenity-tag">+{offer.amenities.length - 3}</span>
          )}
        </div>

        <div className="offer-card__footer">
          <div className="offer-card__price">
            <span className="offer-card__price-value">${offer.price_per_night}</span>
            <span className="offer-card__price-period">/night</span>
          </div>

          <a href={`/map/offers/${offer.offer_id}`} className="btn btn--sm btn--primary">
            View Details →
          </a>
        </div>
      </div>
    </div>
  );
}
```

---

## STYLING & RESPONSIVE DESIGN

### Tailwind CSS Examples

```css
/* src/styles/global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom components */
@layer components {
  .form {
    @apply bg-white rounded-lg shadow-md p-6 space-y-4;
  }

  .form__input {
    @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition;
  }

  .form__label {
    @apply block text-sm font-medium text-gray-700 mb-1;
  }

  .btn--primary {
    @apply bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .btn--outline {
    @apply border-2 border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:border-gray-400 transition-colors;
  }

  .offer-card {
    @apply bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden;
  }

  .offer-card__image {
    @apply relative w-full h-48 bg-gray-200 overflow-hidden;
  }

  .offer-card__img {
    @apply w-full h-full object-cover hover:scale-105 transition-transform;
  }

  .offer-card__badge {
    @apply absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold;
  }

  .offer-card__content {
    @apply p-4 space-y-2;
  }

  .offer-card__title {
    @apply text-lg font-bold text-gray-900;
  }

  .offer-card__amenities {
    @apply flex flex-wrap gap-1;
  }

  .offer-card__amenity-tag {
    @apply text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded;
  }
}
```

---

### Mobile Responsive Example

```typescript
// Automatically responsive with Tailwind
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {offers.map((offer) => (
    <OfferCard key={offer.id} offer={offer} />
  ))}
</div>

// Mobile-first approach
<div className="flex flex-col md:flex-row gap-4">
  <aside className="w-full md:w-64">
    <FilterSidebar />
  </aside>
  <main className="flex-1">
    <ResultsList />
  </main>
</div>
```

---

### Responsive Meta Tags

```html
<!-- In Astro layout head -->
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="description" content="Find cheap rentals directly from owners" />
<meta name="theme-color" content="#667eea" />

<!-- Open Graph for social sharing -->
<meta property="og:title" content="UNMISSABLE RENTALS - Direct Rentals" />
<meta property="og:description" content="Find cheap rentals in Bali, Thailand, Sri Lanka" />
<meta property="og:image" content="/images/og-image.jpg" />
<meta property="og:type" content="website" />
```

---

### Accessibility (WCAG 2.1)

```typescript
// Example: Accessible form with ARIA labels
<form className="form" aria-labelledby="form-title">
  <h2 id="form-title" className="sr-only">
    Search for Rentals
  </h2>

  <div className="form__group">
    <label htmlFor="location" className="form__label">
      Where are you looking?
    </label>
    <input
      id="location"
      type="text"
      placeholder="Bali, Indonesia"
      className="form__input"
      aria-required="true"
      aria-invalid={errors.location ? 'true' : 'false'}
      aria-describedby={errors.location ? 'location-error' : undefined}
    />
    {errors.location && (
      <div id="location-error" role="alert" className="form__error">
        {errors.location}
      </div>
    )}
  </div>

  <button type="submit" className="btn btn--primary" aria-busy={loading}>
    {loading ? 'Searching...' : 'Search'}
  </button>
</form>
```

---

### Dark Mode Support

```css
/* Tailwind dark mode configuration */
@media (prefers-color-scheme: dark) {
  .form {
    @apply bg-gray-900 text-white;
  }

  .form__input {
    @apply bg-gray-800 border-gray-700 text-white;
  }

  .offer-card {
    @apply bg-gray-900 border border-gray-800;
  }
}

/* Or using Tailwind dark: modifier */
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content
</div>
```

---

**Статус:** ✅ ГОТОВО  
**Следующий документ:** [OPERATIONS.md](OPERATIONS.md)

**Дата последнего обновления:** 25 января 2026, 14:35 UTC
