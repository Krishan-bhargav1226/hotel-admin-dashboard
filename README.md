# Hotel Admin Dashboard

React + TypeScript + Vite + MUI + Tailwind + Redux Toolkit (RTK Query) + Formik/Yup.
Folder structure aur coding style `admin-setup-dev` wala hi hai.

## Run
```bash
npm install
npm run dev
```

## Kya-kya hai
- **Dashboard** – live room board (status, running bill, overdue), aaj ka revenue, 7-day chart, plan mix
- **New Check-in** – phone number se shuru. Repeat guest ho to pichhli visit ki ID/naam/address khud aa jata hai; couple ke liye extra guests + unki ID photo
- **Stays** – search/filter, check-out, print, Excel export; stay details me extra charges
- **Check-out** – plan badal sakte ho, extra charges, discount, GST, advance adjust, due tracking, receipt print
- **Rooms** – single ya bulk add (101–110), status change
- **Guests** – phone/name/ID se search, visit history, ID photos, flag guest
- **Reports** – revenue by day, payment mode, peak hours, room-wise occupancy, top guests, repeat guest %
- **Settings** – Rate Plans, Room Types, Hotel info (GST, auto-cleaning), Backup/Restore, demo data

## Pricing plans (Settings → Rate Plans)
| Type | Example | Billing |
|---|---|---|
| Hourly | ₹200 / hr | ceil(hours), min hours, grace minutes |
| Fixed hours | 24 hrs = ₹1800 | flat price, extra hour rate after time ends |
| Till a time | Day use till 8 PM = ₹1200 | flat price till clock time, extra hour rate after |

Har plan kuch room types tak limit kar sakte ho (khali = sab rooms). Stay apna plan snapshot rakhti hai,
isliye rate badalne se purane bills nahi badalte.

## Data kahan save hota hai
Abhi backend nahi hai — sab data browser ke **IndexedDB** me save hota hai (ID photos bhi).
Isliye Settings → Data & Backup se regular backup lo.

Backend lagana ho to sirf `src/store/services/baseQuery.ts` (`fakeBaseQuery` → `fetchBaseQuery`) aur
`store/services/*/…Slice.ts` ke `queryFn` badalne honge — pages/hooks same rahenge.

## Reference project se farak
- Auth/permission/menu/employee modules hata diye (hotel app me zarurat nahi, abhi login nahi hai)
- `utils/permission/StaticRoutes.tsx` → `utils/routes/StaticRoutes.tsx`
- 1 shared `hotelApi` (`injectEndpoints`) – taaki check-in jaisi cheezein Room/Guest/Stay cache ek saath refresh karein
