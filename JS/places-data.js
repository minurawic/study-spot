/* ============================================================
   StudySpot – places-data.js
   OFFLINE FALLBACK data for study spaces.

   Used by space-detail.js, booking.js and write-review.js ONLY when
   php/get_space_detail.php cannot be reached (server/DB down, slow, etc).
   It guarantees the page still shows the place the user actually
   selected – never a different, hard-coded one.

   The data is a copy of the `places` + `place_images` tables in
   database/schema.sql. If you change the seed data there, update it here.
   ============================================================ */

(function () {
    const RAW = {
        1: { "name": "National Library Colombo", "type": "library", "city": "Colombo", "address": "Colombo 07, Sri Lanka", "distance_km": 0.8, "wifi": "free", "wifi_note": "High Speed", "noise_level": "very_quiet", "noise_note": "Perfect for deep focus", "cost_type": "free", "cost_label": "Free", "price": 0.0, "open_time": "08:00:00", "close_time": "20:00:00", "open_days": "Monday - Sunday", "description": "The National Library Colombo is a peaceful and spacious environment ideal for focused study and research. It offers a wide collection of books, comfortable seating and free Wi-Fi for students.", "cover_image": "national-library.jpg", "rating": 4.5, "facilities": ["Power Outlets", "Parking", "Air Conditioning", "Drinking Water", "Restrooms"], "gallery": ["national-library-2.jpg", "national-library-3.jpg", "national-library-4.jpg", "national-library-5.jpg", "national-library-6.jpg"] },
        2: { "name": "Cafe Kumbuk", "type": "cafe", "city": "Colombo", "address": "Colombo 06, Sri Lanka", "distance_km": 1.2, "wifi": "free", "wifi_note": "Free Wi-Fi", "noise_level": "quiet", "noise_note": "Soft background music", "cost_type": "201-500", "cost_label": "LKR 200 - 500", "price": 350.0, "open_time": "07:00:00", "close_time": "22:00:00", "open_days": "Monday - Sunday", "description": "A cosy garden cafe with plenty of natural light, long tables and power outlets at almost every seat. Good for short study sessions and group work.", "cover_image": "cafe-kumbuk.jpg", "rating": 4.5, "facilities": ["Power Outlets", "Parking", "Air Conditioning", "Drinking Water", "Restrooms"], "gallery": ["cafe-kumbuk-2.jpg", "cafe-kumbuk-3.jpg"] },
        3: { "name": "Hub Lanka Co-working Space", "type": "coworking", "city": "Colombo", "address": "Colombo 03, Sri Lanka", "distance_km": 1.5, "wifi": "free", "wifi_note": "High Speed Wi-Fi", "noise_level": "quiet", "noise_note": "Quiet working floor", "cost_type": "201-500", "cost_label": "LKR 300 / day", "price": 300.0, "open_time": "06:30:00", "close_time": "19:00:00", "open_days": "Monday - Saturday", "description": "A professional co-working space with dedicated desks, meeting rooms, unlimited coffee and very fast internet. Day passes are available for students.", "cover_image": "hub-lanka.jpg", "rating": 4.5, "facilities": ["Power Outlets", "Parking", "Air Conditioning", "Drinking Water", "Restrooms"], "gallery": ["hub-lanka-2.jpg", "hub-lanka-3.jpg"] },
        4: { "name": "University of Colombo Library", "type": "university", "city": "Colombo", "address": "Colombo 03, Sri Lanka", "distance_km": 2.1, "wifi": "free", "wifi_note": "Free Wi-Fi", "noise_level": "very_quiet", "noise_note": "Silent reading hall", "cost_type": "free", "cost_label": "Free", "price": 0.0, "open_time": "07:00:00", "close_time": "22:30:00", "open_days": "Monday - Sunday", "description": "The main university library with silent reading halls, reference sections and group discussion rooms. Open to visiting students with a valid ID.", "cover_image": "uoc-library.jpg", "rating": 4.5, "facilities": ["Power Outlets", "Parking", "Air Conditioning", "Drinking Water", "Restrooms"], "gallery": ["uoc-library-2.jpg", "national-library-2.jpg"] },
        5: { "name": "The Library Cafe", "type": "cafe", "city": "Kandy", "address": "Peradeniya Road, Kandy", "distance_km": 0.8, "wifi": "free", "wifi_note": "Free Wi-Fi", "noise_level": "quiet", "noise_note": "Calm and comfortable", "cost_type": "201-500", "cost_label": "LKR 500", "price": 500.0, "open_time": "08:00:00", "close_time": "21:00:00", "open_days": "Monday - Sunday", "description": "Book-lined walls, wooden tables and filter coffee. One of the calmest study cafes in Kandy, popular with university students.", "cover_image": "library-cafe.jpg", "rating": 4.5, "facilities": ["Power Outlets", "Parking", "Air Conditioning", "Drinking Water", "Restrooms"], "gallery": ["library-cafe-2.jpg", "cafe-kumbuk-3.jpg"] },
        6: { "name": "Mind Space", "type": "coworking", "city": "Peradeniya", "address": "Peradeniya, Kandy", "distance_km": 1.4, "wifi": "paid", "wifi_note": "Paid Wi-Fi", "noise_level": "very_quiet", "noise_note": "Dedicated silent zone", "cost_type": "500+", "cost_label": "LKR 600 / day", "price": 600.0, "open_time": "08:00:00", "close_time": "20:00:00", "open_days": "Monday - Saturday", "description": "A small co-working studio built for students, with silent pods, whiteboards and a study lounge.", "cover_image": "mind-space.jpg", "rating": 4.5, "facilities": ["Power Outlets", "Parking", "Air Conditioning", "Drinking Water", "Restrooms"], "gallery": ["book-haven-2.jpg"] },
        7: { "name": "Book Haven", "type": "library", "city": "Kandy", "address": "Dalada Veediya, Kandy", "distance_km": 2.0, "wifi": "free", "wifi_note": "Free Wi-Fi", "noise_level": "quiet", "noise_note": "Quiet most of the day", "cost_type": "1-200", "cost_label": "LKR 150", "price": 150.0, "open_time": "09:00:00", "close_time": "19:00:00", "open_days": "Monday - Sunday", "description": "A community library and reading room with a large fiction and reference collection, plus a quiet upstairs study area.", "cover_image": "book-haven.jpg", "rating": 4.5, "facilities": ["Power Outlets", "Parking", "Air Conditioning", "Drinking Water", "Restrooms"], "gallery": ["book-haven-2.jpg", "national-library-4.jpg"] },
        8: { "name": "Green Space", "type": "university", "city": "Kandy", "address": "University of Peradeniya, Kandy", "distance_km": 3.2, "wifi": "free", "wifi_note": "Free Wi-Fi", "noise_level": "moderate", "noise_note": "Open air, light chatter", "cost_type": "free", "cost_label": "Free", "price": 0.0, "open_time": "07:00:00", "close_time": "18:00:00", "open_days": "Monday - Sunday", "description": "Open air study lawns and shaded seating inside the Peradeniya campus. Best in the morning before it gets busy.", "cover_image": "green-space.jpg", "rating": 4.5, "facilities": ["Power Outlets", "Parking", "Air Conditioning", "Drinking Water", "Restrooms"], "gallery": ["green-space-2.jpg"] },
        9: { "name": "Colombo Public Library", "type": "library", "city": "Colombo", "address": "Colombo 07", "distance_km": 0.8, "wifi": "free", "wifi_note": "Free Wi-Fi", "noise_level": "quiet", "noise_note": "Quiet study rooms", "cost_type": "free", "cost_label": "Free", "price": 0.0, "open_time": "08:00:00", "close_time": "19:00:00", "open_days": "Monday - Sunday", "description": "Colombo Public Library provides open reading areas, extensive reference sections, and free high-speed Wi-Fi in a calm learning environment.", "cover_image": "national-library.jpg", "rating": 4.8, "facilities": ["Power Outlets", "Parking", "Air Conditioning", "Drinking Water", "Restrooms"], "gallery": [] },
        10: { "name": "Campus Learning Centre", "type": "university", "city": "Malabe", "address": "Malabe", "distance_km": 1.2, "wifi": "free", "wifi_note": "Campus Wi-Fi", "noise_level": "quiet", "noise_note": "Silent learning environment", "cost_type": "free", "cost_label": "Free", "price": 0.0, "open_time": "08:00:00", "close_time": "21:00:00", "open_days": "Monday - Sunday", "description": "A dedicated learning centre in Malabe offering spacious study pods, research desks, and reliable Wi-Fi for university students.", "cover_image": "uoc-library.jpg", "rating": 4.7, "facilities": ["Power Outlets", "Parking", "Air Conditioning", "Drinking Water", "Restrooms"], "gallery": [] },
        11: { "name": "Focus Coworking", "type": "coworking", "city": "Colombo", "address": "Colombo 05", "distance_km": 1.5, "wifi": "free", "wifi_note": "High Speed Fiber Wi-Fi", "noise_level": "quiet", "noise_note": "Quiet focus zone", "cost_type": "500+", "cost_label": "LKR 500/hr", "price": 500.0, "open_time": "07:30:00", "close_time": "22:00:00", "open_days": "Monday - Saturday", "description": "Modern co-working facility with ergonomic chairs, silent booths, fast Wi-Fi, and coffee on demand.", "cover_image": "hub-lanka.jpg", "rating": 4.6, "facilities": ["Power Outlets", "Parking", "Air Conditioning", "Drinking Water", "Restrooms"], "gallery": [] },
        12: { "name": "Cafe Study Hub", "type": "cafe", "city": "Colombo", "address": "Colombo 03", "distance_km": 2.0, "wifi": "free", "wifi_note": "Fast Customer Wi-Fi", "noise_level": "moderate", "noise_note": "Soft background cafe ambiance", "cost_type": "201-500", "cost_label": "LKR 300/hr", "price": 300.0, "open_time": "08:00:00", "close_time": "22:30:00", "open_days": "Monday - Sunday", "description": "Comfortable study cafe with plenty of power sockets, artisanal tea and coffee, and moderate ambient sound.", "cover_image": "cafe-kumbuk.jpg", "rating": 4.5, "facilities": ["Power Outlets", "Parking", "Air Conditioning", "Drinking Water", "Restrooms"], "gallery": [] },
        13: { "name": "Quiet Corner Library", "type": "library", "city": "Kandy", "address": "Kandy", "distance_km": 2.5, "wifi": "free", "wifi_note": "Free Public Wi-Fi", "noise_level": "quiet", "noise_note": "Quiet reading rooms", "cost_type": "free", "cost_label": "Free", "price": 0.0, "open_time": "08:30:00", "close_time": "18:30:00", "open_days": "Monday - Saturday", "description": "A peaceful community library in Kandy ideal for undisturbed exam preparation and deep study.", "cover_image": "book-haven.jpg", "rating": 4.4, "facilities": ["Power Outlets", "Parking", "Air Conditioning", "Drinking Water", "Restrooms"], "gallery": [] },
        14: { "name": "Read & Relax Cafe", "type": "cafe", "city": "Nugegoda", "address": "Nugegoda", "distance_km": 3.1, "wifi": "free", "wifi_note": "Complimentary Wi-Fi", "noise_level": "moderate", "noise_note": "Moderate conversation level", "cost_type": "201-500", "cost_label": "LKR 250/hr", "price": 250.0, "open_time": "09:00:00", "close_time": "21:00:00", "open_days": "Monday - Sunday", "description": "Charming student-friendly cafe in Nugegoda with affordable snacks, power outlets, and Wi-Fi access.", "cover_image": "library-cafe.jpg", "rating": 4.3, "facilities": ["Power Outlets", "Parking", "Air Conditioning", "Drinking Water", "Restrooms"], "gallery": [] }
    };

    const TYPE_LABELS = { library: 'Library', cafe: 'Cafe', coworking: 'Co-working Space', university: 'University Area' };
    const NOISE_LABELS = { very_quiet: 'Very Quiet', quiet: 'Quiet', moderate: 'Moderate', lively: 'Lively' };
    const WIFI_LABELS = { paid: 'Paid Wi-Fi', none: 'No Wi-Fi', free: 'Free Wi-Fi' };

    const img = (f) => (/^(https?:|images\/)/.test(f) ? f : 'images/' + f);

    // "08:00:00" -> "8.00 AM"  (same format as get_space_detail.php)
    function fmtTime(t) {
        const [h, m] = String(t || '08:00:00').split(':').map(Number);
        const ap = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 === 0 ? 12 : h % 12;
        return `${h12}.${String(m).padStart(2, '0')} ${ap}`;
    }

    // Build the same object that get_space_detail.php returns in `place`
    function build(id) {
        const r = RAW[id];
        if (!r) return null;
        const cover = img(r.cover_image || 'national-library.jpg');
        let gallery = (r.gallery || []).map(img);
        if (id === 1) {
            gallery = ['national-library.jpg', 'national-library-2.jpg', 'national-library-3.jpg',
                'national-library-4.jpg', 'national-library-5.jpg'].map(img);
        } else {
            // Same rule as get_space_detail.php: cover image first, then the extras (no duplicates, max 5)
            gallery = [cover].concat(gallery).filter((g, i, a) => a.indexOf(g) === i).slice(0, 5);
        }
        const price = Number(r.price) || 0;
        return {
            id: id,
            name: r.name,
            type: r.type,
            type_label: TYPE_LABELS[r.type] || r.type,
            city: r.city,
            address: r.address,
            distance_km: r.distance_km,
            distance_text: Number(r.distance_km).toFixed(1) + ' km from you',
            cover_image: cover,
            gallery: gallery,
            hours_label: fmtTime(r.open_time) + ' - ' + fmtTime(r.close_time),
            open_days: r.open_days || 'Monday - Sunday',
            wifi_label: WIFI_LABELS[r.wifi] || 'Free Wi-Fi',
            wifi_note: r.wifi_note || 'High Speed',
            noise_label: NOISE_LABELS[r.noise_level] || r.noise_level,
            noise_note: r.noise_note || 'Perfect for deep focus',
            cost_label: r.cost_label || (price > 0 ? 'LKR ' + price.toLocaleString('en-US') : 'Free'),
            cost_note: (price <= 0 || r.cost_type === 'free') ? 'No entrance fee' : 'Per session / day',
            price: price,
            facilities: r.facilities && r.facilities.length
                ? r.facilities.slice()
                : ['Power Outlets', 'Parking', 'Air Conditioning', 'Drinking Water', 'Restrooms'],
            description: r.description || '',
            rating: r.rating
        };
    }

    window.StudySpotPlaces = { get: build };
})();
