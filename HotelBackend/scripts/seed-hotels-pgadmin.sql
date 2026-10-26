-- Grand Horizon sample data for pgAdmin 4
-- Database: HotelManagementDB
--
-- Kaise chalayein:
-- 1. pgAdmin mein HotelManagementDB par right-click -> Query Tool
-- 2. Is file ko kholo (Open File) ya poora script paste karo
-- 3. F5 dabao
--
-- Room 101 pehle se ho to script naya data nahi daalti.
-- Neeche last SELECT pgAdmin ke Data Output mein counts dikhata hai.

SET TIME ZONE 'Asia/Kolkata';

CREATE OR REPLACE FUNCTION pg_temp.at_ist(day_offset integer, hour integer, minute integer DEFAULT 0)
RETURNS timestamp WITHOUT TIME ZONE
LANGUAGE sql STABLE AS $fn$
    SELECT (CURRENT_DATE + day_offset) + make_time(hour, minute, 0) - INTERVAL '5 hours 30 minutes';
$fn$;

CREATE OR REPLACE FUNCTION pg_temp.calc_bill(
    check_in timestamp,
    expected_out timestamp,
    check_out timestamp,
    plan_rate numeric,
    overtime_rate numeric,
    grace_minutes integer,
    extras numeric,
    discount numeric,
    advance numeric,
    tax_percent numeric,
    settled boolean
)
RETURNS TABLE (
    elapsed_minutes integer,
    billable_hours integer,
    overtime_hours integer,
    overtime_amount numeric,
    gross_amount numeric,
    taxable_amount numeric,
    tax_amount numeric,
    total_amount numeric,
    paid_amount numeric,
    due_amount numeric
)
LANGUAGE plpgsql STABLE AS $fn$
DECLARE
    as_of timestamp := COALESCE(check_out, (CURRENT_TIMESTAMP AT TIME ZONE 'UTC'));
    extra_minutes integer;
BEGIN
    elapsed_minutes := GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (as_of - check_in)) / 60)::int);
    billable_hours := GREATEST(1, CEIL(elapsed_minutes / 60.0)::int);
    overtime_hours := 0;
    overtime_amount := 0;
    IF expected_out IS NOT NULL
       AND as_of > expected_out + make_interval(mins => grace_minutes)
       AND overtime_rate > 0 THEN
        extra_minutes := FLOOR(EXTRACT(EPOCH FROM (as_of - expected_out)) / 60)::int - grace_minutes;
        overtime_hours := GREATEST(1, CEIL(extra_minutes / 60.0)::int);
        overtime_amount := overtime_hours * overtime_rate;
    END IF;
    gross_amount := plan_rate + overtime_amount + extras;
    taxable_amount := GREATEST(0, gross_amount - discount);
    tax_amount := ROUND(taxable_amount * tax_percent / 100, 2);
    total_amount := taxable_amount + tax_amount;
    IF settled THEN
        paid_amount := total_amount;
        due_amount := 0;
    ELSE
        paid_amount := advance;
        due_amount := GREATEST(0, total_amount - advance);
    END IF;
    RETURN NEXT;
END;
$fn$;

DO $seed$
DECLARE
    org_id integer;
    now_utc timestamp := (CURRENT_TIMESTAMP AT TIME ZONE 'UTC');
    jaipur_id integer;
    goa_id integer;
    deluxe_id integer;
    superior_id integer;
    family_id integer;
    palace_id integer;
    garden_id integer;
    accessible_id integer;
    plan_deluxe integer;
    plan_superior integer;
    plan_family integer;
    plan_palace integer;
    plan_garden integer;
    plan_dayuse integer;
    plan_till integer;
    g_rahul integer;
    g_ananya integer;
    g_sharma integer;
    g_daniel integer;
    g_priya integer;
    g_fernandes integer;
    g_neha integer;
    s_rahul integer;
    s_ananya integer;
    s_sharma integer;
    s_daniel integer;
    s_priya integer;
    s_fernandes integer;
    room_101 integer;
    room_102 integer;
    room_104 integer;
    room_106 integer;
    room_201 integer;
    room_501 integer;
    room_505 integer;
    room_602 integer;
    room_701 integer;
    pos_poha integer;
    pos_omelette integer;
    pos_thali integer;
    pos_fish integer;
    pos_sandwich integer;
    pos_coffee integer;
    pos_water integer;
    pos_laundry integer;
    order_id integer;
    audit_date date;
    room_rev numeric;
    pos_rev numeric;
    svc_rev numeric;
    total_rev numeric;
BEGIN
    SELECT "Id" INTO org_id FROM "Organizations" ORDER BY "Id" LIMIT 1;
    IF org_id IS NULL THEN
        RAISE EXCEPTION 'Organizations table khali hai. Pehle backend ek baar chalao, phir ye script.';
    END IF;

    SELECT "Id" INTO jaipur_id
    FROM "HotelProperties"
    WHERE "IsDeleted" = FALSE
      AND ("Location" = 'Jaipur' OR "Name" IN ('Hotel 1', 'Grand Horizon Palace & Spa'))
    ORDER BY "Id"
    LIMIT 1;

    IF jaipur_id IS NULL THEN
        INSERT INTO "HotelProperties" (
            "Name", "Chain", "BrandTier", "Location", "StarRating", "RoomCount", "OccupancyRate",
            "Phone", "Email", "Address", "Gstin", "UpiId", "DailyRevenue", "Adr", "ManagerName", "Status",
            "CreatedDate", "IsActive", "IsDeleted", "OrganizationId"
        ) VALUES (
            'Grand Horizon Palace & Spa', 'Grand Horizon', 'Palace', 'Jaipur', '5 Star', 0, 0,
            '0141-4567890', 'jaipur@grandhorizon.local', 'Amer Road, Civil Lines, Jaipur, Rajasthan 302006',
            '08AABCG1234P1Z5', 'grandhorizon.jaipur@okaxis', 0, 0, 'Vikram Malhotra', 1,
            now_utc, TRUE, FALSE, org_id
        ) RETURNING "Id" INTO jaipur_id;
    ELSE
        UPDATE "HotelProperties" SET
            "Name" = 'Grand Horizon Palace & Spa',
            "Chain" = 'Grand Horizon',
            "BrandTier" = 'Palace',
            "Location" = 'Jaipur',
            "StarRating" = '5 Star',
            "Phone" = '0141-4567890',
            "Email" = 'jaipur@grandhorizon.local',
            "Address" = 'Amer Road, Civil Lines, Jaipur, Rajasthan 302006',
            "Gstin" = '08AABCG1234P1Z5',
            "UpiId" = 'grandhorizon.jaipur@okaxis',
            "ManagerName" = 'Vikram Malhotra',
            "Status" = 1,
            "IsActive" = TRUE,
            "UpdatedDate" = now_utc
        WHERE "Id" = jaipur_id;
    END IF;

    SELECT "Id" INTO goa_id
    FROM "HotelProperties"
    WHERE "IsDeleted" = FALSE
      AND ("Location" = 'Goa' OR "Name" IN ('Hotel 2', 'Grand Horizon Beach Resort'))
    ORDER BY "Id"
    LIMIT 1;

    IF goa_id IS NULL THEN
        INSERT INTO "HotelProperties" (
            "Name", "Chain", "BrandTier", "Location", "StarRating", "RoomCount", "OccupancyRate",
            "Phone", "Email", "Address", "Gstin", "UpiId", "DailyRevenue", "Adr", "ManagerName", "Status",
            "CreatedDate", "IsActive", "IsDeleted", "OrganizationId"
        ) VALUES (
            'Grand Horizon Beach Resort', 'Grand Horizon', 'Resort', 'Goa', '4 Star', 0, 0,
            '0832-2456789', 'goa@grandhorizon.local', 'Candolim Beach Road, Bardez, Goa 403515',
            '30AABCG5678Q1Z2', 'grandhorizon.goa@okaxis', 0, 0, 'Sneha Patel', 1,
            now_utc, TRUE, FALSE, org_id
        ) RETURNING "Id" INTO goa_id;
    ELSE
        UPDATE "HotelProperties" SET
            "Name" = 'Grand Horizon Beach Resort',
            "Chain" = 'Grand Horizon',
            "BrandTier" = 'Resort',
            "Location" = 'Goa',
            "StarRating" = '4 Star',
            "Phone" = '0832-2456789',
            "Email" = 'goa@grandhorizon.local',
            "Address" = 'Candolim Beach Road, Bardez, Goa 403515',
            "Gstin" = '30AABCG5678Q1Z2',
            "UpiId" = 'grandhorizon.goa@okaxis',
            "ManagerName" = 'Sneha Patel',
            "Status" = 1,
            "IsActive" = TRUE,
            "UpdatedDate" = now_utc
        WHERE "Id" = goa_id;
    END IF;

    IF EXISTS (SELECT 1 FROM "Rooms" WHERE "Number" = '101' AND "IsDeleted" = FALSE) THEN
        RAISE NOTICE 'Room 101 pehle se hai. Naya data insert nahi hua.';
        RETURN;
    END IF;

    INSERT INTO "RoomTypes" ("Name", "Description", "Category", "SuitableFor", "BedConfig", "MaxGuests", "SizeSqFt", "BasePrice", "Amenities", "Badge", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId")
    VALUES ('Deluxe King', 'King room with a sitting corner and city or garden view.', 1, 'Couples', '1 King', 2, 320, 4500, '["Wi-Fi","Air conditioning","Smart TV","Minibar","Safe"]', 'Signature', now_utc, TRUE, FALSE, org_id)
    RETURNING "Id" INTO deluxe_id;
    INSERT INTO "RoomTypes" ("Name", "Description", "Category", "SuitableFor", "BedConfig", "MaxGuests", "SizeSqFt", "BasePrice", "Amenities", "Badge", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId")
    VALUES ('Superior Twin', 'Two twin beds, work desk, and a quiet street-side room.', 2, 'Solo or colleagues', '2 Twin', 2, 280, 3200, '["Wi-Fi","Air conditioning","Smart TV","Work desk"]', NULL, now_utc, TRUE, FALSE, org_id)
    RETURNING "Id" INTO superior_id;
    INSERT INTO "RoomTypes" ("Name", "Description", "Category", "SuitableFor", "BedConfig", "MaxGuests", "SizeSqFt", "BasePrice", "Amenities", "Badge", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId")
    VALUES ('Family Suite', 'Separate living room and two beds for parents and children.', 3, 'Families', '1 King + 1 Sofa bed', 4, 520, 7800, '["Wi-Fi","Air conditioning","Smart TV","Sofa bed","Extra linen"]', 'Family', now_utc, TRUE, FALSE, org_id)
    RETURNING "Id" INTO family_id;
    INSERT INTO "RoomTypes" ("Name", "Description", "Category", "SuitableFor", "BedConfig", "MaxGuests", "SizeSqFt", "BasePrice", "Amenities", "Badge", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId")
    VALUES ('Palace Suite', 'A larger suite with a bathtub and a private balcony.', 5, 'Celebrations', '1 King', 3, 780, 14500, '["Wi-Fi","Air conditioning","Bathtub","Balcony","Butler on call"]', 'Suite', now_utc, TRUE, FALSE, org_id)
    RETURNING "Id" INTO palace_id;
    INSERT INTO "RoomTypes" ("Name", "Description", "Category", "SuitableFor", "BedConfig", "MaxGuests", "SizeSqFt", "BasePrice", "Amenities", "Badge", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId")
    VALUES ('Garden Room', 'Ground-floor room opening towards the garden.', 6, 'Short stays', '1 Queen', 2, 240, 2800, '["Wi-Fi","Air conditioning","Garden view"]', 'Value', now_utc, TRUE, FALSE, org_id)
    RETURNING "Id" INTO garden_id;
    INSERT INTO "RoomTypes" ("Name", "Description", "Category", "SuitableFor", "BedConfig", "MaxGuests", "SizeSqFt", "BasePrice", "Amenities", "Badge", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId")
    VALUES ('Accessible Queen', 'Step-free room with a roll-in shower.', 4, 'Step-free stay', '1 Queen', 2, 300, 4000, '["Wi-Fi","Air conditioning","Roll-in shower","Grab bars"]', 'Accessible', now_utc, TRUE, FALSE, org_id)
    RETURNING "Id" INTO accessible_id;

    INSERT INTO "RatePlans" ("Name", "Kind", "Rate", "DurationHours", "CheckoutTime", "MinHours", "OvertimeRate", "GraceMinutes", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId")
    VALUES ('Deluxe Overnight', 2, 4500, 24, '11:00', 0, 300, 30, now_utc, TRUE, FALSE, org_id) RETURNING "Id" INTO plan_deluxe;
    INSERT INTO "RatePlans" ("Name", "Kind", "Rate", "DurationHours", "CheckoutTime", "MinHours", "OvertimeRate", "GraceMinutes", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId")
    VALUES ('Superior Overnight', 2, 3200, 24, '11:00', 0, 300, 30, now_utc, TRUE, FALSE, org_id) RETURNING "Id" INTO plan_superior;
    INSERT INTO "RatePlans" ("Name", "Kind", "Rate", "DurationHours", "CheckoutTime", "MinHours", "OvertimeRate", "GraceMinutes", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId")
    VALUES ('Family Overnight', 2, 7800, 24, '11:00', 0, 300, 30, now_utc, TRUE, FALSE, org_id) RETURNING "Id" INTO plan_family;
    INSERT INTO "RatePlans" ("Name", "Kind", "Rate", "DurationHours", "CheckoutTime", "MinHours", "OvertimeRate", "GraceMinutes", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId")
    VALUES ('Palace Overnight', 2, 14500, 24, '11:00', 0, 300, 30, now_utc, TRUE, FALSE, org_id) RETURNING "Id" INTO plan_palace;
    INSERT INTO "RatePlans" ("Name", "Kind", "Rate", "DurationHours", "CheckoutTime", "MinHours", "OvertimeRate", "GraceMinutes", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId")
    VALUES ('Garden Overnight', 2, 2800, 24, '11:00', 0, 300, 30, now_utc, TRUE, FALSE, org_id) RETURNING "Id" INTO plan_garden;
    INSERT INTO "RatePlans" ("Name", "Kind", "Rate", "DurationHours", "CheckoutTime", "MinHours", "OvertimeRate", "GraceMinutes", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId")
    VALUES ('3 Hour Day Use', 1, 1800, 3, NULL, 3, 300, 30, now_utc, TRUE, FALSE, org_id) RETURNING "Id" INTO plan_dayuse;
    INSERT INTO "RatePlans" ("Name", "Kind", "Rate", "DurationHours", "CheckoutTime", "MinHours", "OvertimeRate", "GraceMinutes", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId")
    VALUES ('Day Use till 6 PM', 3, 2500, 0, '18:00', 0, 300, 30, now_utc, TRUE, FALSE, org_id) RETURNING "Id" INTO plan_till;

    INSERT INTO "RatePlanRooms" ("RatePlanId", "RoomTypeId", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId") VALUES
        (plan_deluxe, deluxe_id, now_utc, TRUE, FALSE, org_id),
        (plan_superior, superior_id, now_utc, TRUE, FALSE, org_id),
        (plan_family, family_id, now_utc, TRUE, FALSE, org_id),
        (plan_palace, palace_id, now_utc, TRUE, FALSE, org_id),
        (plan_garden, garden_id, now_utc, TRUE, FALSE, org_id),
        (plan_dayuse, deluxe_id, now_utc, TRUE, FALSE, org_id),
        (plan_dayuse, superior_id, now_utc, TRUE, FALSE, org_id),
        (plan_dayuse, garden_id, now_utc, TRUE, FALSE, org_id),
        (plan_till, deluxe_id, now_utc, TRUE, FALSE, org_id),
        (plan_till, superior_id, now_utc, TRUE, FALSE, org_id);

    INSERT INTO "Rooms" (
        "Number", "Floor", "RoomTypeId", "Status", "Notes", "BedType", "Category", "SuitableFor", "BedConfig",
        "MaxGuests", "SizeSqFt", "BasePrice", "Amenities", "Badge", "PropertyId",
        "CreatedDate", "IsActive", "IsDeleted", "OrganizationId"
    )
    SELECT s.num, s.floor, t."Id", s.status, s.notes, t."BedConfig", t."Category", t."SuitableFor", t."BedConfig",
           t."MaxGuests", t."SizeSqFt", t."BasePrice", t."Amenities", t."Badge",
           CASE WHEN s.hotel = 'jaipur' THEN jaipur_id ELSE goa_id END,
           now_utc, TRUE, FALSE, org_id
    FROM (VALUES
        ('101', '1', 'Deluxe King', 2, 'Late checkout requested.', 'jaipur'),
        ('102', '1', 'Deluxe King', 1, NULL, 'jaipur'),
        ('103', '1', 'Deluxe King', 3, 'Departure linen still in the room.', 'jaipur'),
        ('104', '1', 'Superior Twin', 2, NULL, 'jaipur'),
        ('105', '1', 'Superior Twin', 1, NULL, 'jaipur'),
        ('106', '1', 'Superior Twin', 4, 'AC not cooling.', 'jaipur'),
        ('201', '2', 'Family Suite', 2, 'Extra bed already in the room.', 'jaipur'),
        ('202', '2', 'Family Suite', 1, NULL, 'jaipur'),
        ('301', '3', 'Palace Suite', 1, NULL, 'jaipur'),
        ('302', '3', 'Accessible Queen', 1, NULL, 'jaipur'),
        ('501', '5', 'Deluxe King', 2, NULL, 'goa'),
        ('502', '5', 'Deluxe King', 1, NULL, 'goa'),
        ('503', '5', 'Deluxe King', 3, NULL, 'goa'),
        ('504', '5', 'Superior Twin', 1, NULL, 'goa'),
        ('505', '5', 'Superior Twin', 2, 'Day-use guest, departs this evening.', 'goa'),
        ('601', '6', 'Family Suite', 1, NULL, 'goa'),
        ('602', '6', 'Family Suite', 2, NULL, 'goa'),
        ('701', '7', 'Garden Room', 1, NULL, 'goa'),
        ('702', '7', 'Garden Room', 1, NULL, 'goa'),
        ('703', '7', 'Garden Room', 3, 'Sand on the floor after checkout.', 'goa')
    ) AS s(num, floor, type_name, status, notes, hotel)
    JOIN "RoomTypes" t ON t."Id" = CASE s.type_name
        WHEN 'Deluxe King' THEN deluxe_id
        WHEN 'Superior Twin' THEN superior_id
        WHEN 'Family Suite' THEN family_id
        WHEN 'Palace Suite' THEN palace_id
        WHEN 'Garden Room' THEN garden_id
        ELSE accessible_id
    END;

    UPDATE "HotelProperties" p SET
        "RoomCount" = c.cnt,
        "OccupancyRate" = ROUND(c.occ * 100.0 / NULLIF(c.cnt, 0), 2),
        "Adr" = COALESCE(ROUND(c.adr, 2), 0),
        "DailyRevenue" = COALESCE(c.rev, 0)
    FROM (
        SELECT "PropertyId",
               COUNT(*)::int AS cnt,
               COUNT(*) FILTER (WHERE "Status" = 2)::int AS occ,
               AVG("BasePrice") FILTER (WHERE "Status" = 2) AS adr,
               SUM("BasePrice") FILTER (WHERE "Status" = 2) AS rev
        FROM "Rooms"
        WHERE "IsDeleted" = FALSE AND "PropertyId" IN (jaipur_id, goa_id)
        GROUP BY "PropertyId"
    ) c
    WHERE p."Id" = c."PropertyId";

    SELECT "Id" INTO room_101 FROM "Rooms" WHERE "Number" = '101' AND "IsDeleted" = FALSE;
    SELECT "Id" INTO room_102 FROM "Rooms" WHERE "Number" = '102' AND "IsDeleted" = FALSE;
    SELECT "Id" INTO room_104 FROM "Rooms" WHERE "Number" = '104' AND "IsDeleted" = FALSE;
    SELECT "Id" INTO room_106 FROM "Rooms" WHERE "Number" = '106' AND "IsDeleted" = FALSE;
    SELECT "Id" INTO room_201 FROM "Rooms" WHERE "Number" = '201' AND "IsDeleted" = FALSE;
    SELECT "Id" INTO room_501 FROM "Rooms" WHERE "Number" = '501' AND "IsDeleted" = FALSE;
    SELECT "Id" INTO room_505 FROM "Rooms" WHERE "Number" = '505' AND "IsDeleted" = FALSE;
    SELECT "Id" INTO room_602 FROM "Rooms" WHERE "Number" = '602' AND "IsDeleted" = FALSE;
    SELECT "Id" INTO room_701 FROM "Rooms" WHERE "Number" = '701' AND "IsDeleted" = FALSE;

    INSERT INTO "Guests" ("Name", "Phone", "IdType", "IdNumber", "Address", "IsFlagged", "FlagReason", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId") VALUES
        ('Rahul Mehta', '9810011101', 'Aadhaar', '458712309876', 'C-42, C Scheme, Jaipur', FALSE, NULL, now_utc, TRUE, FALSE, org_id) RETURNING "Id" INTO g_rahul;
    INSERT INTO "Guests" ("Name", "Phone", "IdType", "IdNumber", "Address", "IsFlagged", "FlagReason", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId") VALUES
        ('Ananya Kapoor', '9810011102', 'Passport', 'Z4412987', '12 Residency Road, Bengaluru', FALSE, NULL, now_utc, TRUE, FALSE, org_id) RETURNING "Id" INTO g_ananya;
    INSERT INTO "Guests" ("Name", "Phone", "IdType", "IdNumber", "Address", "IsFlagged", "FlagReason", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId") VALUES
        ('Amit Sharma', '9810011103', 'Aadhaar', '612309874521', '44 Vaishali Nagar, Jaipur', FALSE, NULL, now_utc, TRUE, FALSE, org_id) RETURNING "Id" INTO g_sharma;
    INSERT INTO "Guests" ("Name", "Phone", "IdType", "IdNumber", "Address", "IsFlagged", "FlagReason", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId") VALUES
        ('Daniel Costa', '9820012201', 'Passport', 'P8834210', 'Panaji, Goa', FALSE, NULL, now_utc, TRUE, FALSE, org_id) RETURNING "Id" INTO g_daniel;
    INSERT INTO "Guests" ("Name", "Phone", "IdType", "IdNumber", "Address", "IsFlagged", "FlagReason", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId") VALUES
        ('Priya Naik', '9820012202', 'Aadhaar', '778812340965', 'Mapusa, Goa', FALSE, NULL, now_utc, TRUE, FALSE, org_id) RETURNING "Id" INTO g_priya;
    INSERT INTO "Guests" ("Name", "Phone", "IdType", "IdNumber", "Address", "IsFlagged", "FlagReason", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId") VALUES
        ('Rohan Fernandes', '9820012203', 'Aadhaar', '334409871256', 'Margao, Goa', FALSE, NULL, now_utc, TRUE, FALSE, org_id) RETURNING "Id" INTO g_fernandes;
    INSERT INTO "Guests" ("Name", "Phone", "IdType", "IdNumber", "Address", "IsFlagged", "FlagReason", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId") VALUES
        ('Neha Joshi', '9810011199', 'Driving Licence', 'RJ14-20190012345', 'Malviya Nagar, Jaipur', FALSE, NULL, now_utc, TRUE, FALSE, org_id) RETURNING "Id" INTO g_neha;
    INSERT INTO "Guests" ("Name", "Phone", "IdType", "IdNumber", "Address", "IsFlagged", "FlagReason", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId") VALUES
        ('Rakesh Yadav', '9810099999', 'Aadhaar', '909090121212', 'Sikar Road, Jaipur', TRUE, 'Previous stay: cigarette burn on the bedside table. Take a damage deposit.', now_utc, TRUE, FALSE, org_id);

    INSERT INTO "Stays" (
        "StayNo", "GuestId", "GuestName", "GuestPhone", "GuestIdType", "GuestIdNumber", "PartyType", "GuestCount",
        "RoomId", "RoomNumber", "RoomTypeName", "RatePlanId", "PlanName", "PlanKind", "PlanRate", "PlanDurationHours",
        "PlanCheckoutTime", "PlanMinHours", "PlanOvertimeRate", "PlanGraceMinutes", "CheckInAt", "ExpectedCheckOutAt", "CheckOutAt",
        "Status", "AdvanceAmount", "AdvanceMode", "Discount", "TaxPercent", "ElapsedMinutes", "BillableHours", "BaseLabel",
        "BaseAmount", "OvertimeHours", "OvertimeAmount", "ExtraTotal", "GrossAmount", "TaxableAmount", "TaxAmount",
        "TotalAmount", "PaidAmount", "DueAmount", "PaymentMode", "Notes",
        "CreatedDate", "IsActive", "IsDeleted", "OrganizationId"
    )
    SELECT 'ST-1001', g_rahul, 'Rahul Mehta', '9810011101', 'Aadhaar', '458712309876', 1, 1,
           room_101, '101', 'Deluxe King', plan_deluxe, 'Deluxe Overnight', 2, 4500, 24,
           '11:00', 0, 300, 30, pg_temp.at_ist(-1, 14, 0), pg_temp.at_ist(0, 11, 0), NULL,
           1, 2000, 2, 0, 12, b.elapsed_minutes, b.billable_hours, 'Overnight',
           4500, b.overtime_hours, b.overtime_amount, 450, b.gross_amount, b.taxable_amount, b.tax_amount,
           b.total_amount, b.paid_amount, b.due_amount, NULL, NULL,
           now_utc, TRUE, FALSE, org_id
    FROM pg_temp.calc_bill(pg_temp.at_ist(-1, 14, 0), pg_temp.at_ist(0, 11, 0), NULL, 4500, 300, 30, 450, 0, 2000, 12, FALSE) b
    RETURNING "Id" INTO s_rahul;

    INSERT INTO "Stays" (
        "StayNo", "GuestId", "GuestName", "GuestPhone", "GuestIdType", "GuestIdNumber", "PartyType", "GuestCount",
        "RoomId", "RoomNumber", "RoomTypeName", "RatePlanId", "PlanName", "PlanKind", "PlanRate", "PlanDurationHours",
        "PlanCheckoutTime", "PlanMinHours", "PlanOvertimeRate", "PlanGraceMinutes", "CheckInAt", "ExpectedCheckOutAt", "CheckOutAt",
        "Status", "AdvanceAmount", "AdvanceMode", "Discount", "TaxPercent", "ElapsedMinutes", "BillableHours", "BaseLabel",
        "BaseAmount", "OvertimeHours", "OvertimeAmount", "ExtraTotal", "GrossAmount", "TaxableAmount", "TaxAmount",
        "TotalAmount", "PaidAmount", "DueAmount", "PaymentMode", "Notes",
        "CreatedDate", "IsActive", "IsDeleted", "OrganizationId"
    )
    SELECT 'ST-1002', g_ananya, 'Ananya Kapoor', '9810011102', 'Passport', 'Z4412987', 2, 2,
           room_104, '104', 'Superior Twin', plan_superior, 'Superior Overnight', 2, 3200, 24,
           '11:00', 0, 300, 30, pg_temp.at_ist(0, 13, 30), pg_temp.at_ist(1, 11, 0), NULL,
           1, 3200, 3, 0, 12, b.elapsed_minutes, b.billable_hours, 'Overnight',
           3200, b.overtime_hours, b.overtime_amount, 0, b.gross_amount, b.taxable_amount, b.tax_amount,
           b.total_amount, b.paid_amount, b.due_amount, NULL, NULL,
           now_utc, TRUE, FALSE, org_id
    FROM pg_temp.calc_bill(pg_temp.at_ist(0, 13, 30), pg_temp.at_ist(1, 11, 0), NULL, 3200, 300, 30, 0, 0, 3200, 12, FALSE) b
    RETURNING "Id" INTO s_ananya;

    INSERT INTO "Stays" (
        "StayNo", "GuestId", "GuestName", "GuestPhone", "GuestIdType", "GuestIdNumber", "PartyType", "GuestCount",
        "RoomId", "RoomNumber", "RoomTypeName", "RatePlanId", "PlanName", "PlanKind", "PlanRate", "PlanDurationHours",
        "PlanCheckoutTime", "PlanMinHours", "PlanOvertimeRate", "PlanGraceMinutes", "CheckInAt", "ExpectedCheckOutAt", "CheckOutAt",
        "Status", "AdvanceAmount", "AdvanceMode", "Discount", "TaxPercent", "ElapsedMinutes", "BillableHours", "BaseLabel",
        "BaseAmount", "OvertimeHours", "OvertimeAmount", "ExtraTotal", "GrossAmount", "TaxableAmount", "TaxAmount",
        "TotalAmount", "PaidAmount", "DueAmount", "PaymentMode", "Notes",
        "CreatedDate", "IsActive", "IsDeleted", "OrganizationId"
    )
    SELECT 'ST-1003', g_sharma, 'Amit Sharma', '9810011103', 'Aadhaar', '612309874521', 3, 4,
           room_201, '201', 'Family Suite', plan_family, 'Family Overnight', 2, 7800, 24,
           '11:00', 0, 300, 30, pg_temp.at_ist(0, 12, 0), pg_temp.at_ist(1, 11, 0), NULL,
           1, 5000, 1, 500, 12, b.elapsed_minutes, b.billable_hours, 'Overnight',
           7800, b.overtime_hours, b.overtime_amount, 800, b.gross_amount, b.taxable_amount, b.tax_amount,
           b.total_amount, b.paid_amount, b.due_amount, NULL, NULL,
           now_utc, TRUE, FALSE, org_id
    FROM pg_temp.calc_bill(pg_temp.at_ist(0, 12, 0), pg_temp.at_ist(1, 11, 0), NULL, 7800, 300, 30, 800, 500, 5000, 12, FALSE) b
    RETURNING "Id" INTO s_sharma;

    INSERT INTO "Stays" (
        "StayNo", "GuestId", "GuestName", "GuestPhone", "GuestIdType", "GuestIdNumber", "PartyType", "GuestCount",
        "RoomId", "RoomNumber", "RoomTypeName", "RatePlanId", "PlanName", "PlanKind", "PlanRate", "PlanDurationHours",
        "PlanCheckoutTime", "PlanMinHours", "PlanOvertimeRate", "PlanGraceMinutes", "CheckInAt", "ExpectedCheckOutAt", "CheckOutAt",
        "Status", "AdvanceAmount", "AdvanceMode", "Discount", "TaxPercent", "ElapsedMinutes", "BillableHours", "BaseLabel",
        "BaseAmount", "OvertimeHours", "OvertimeAmount", "ExtraTotal", "GrossAmount", "TaxableAmount", "TaxAmount",
        "TotalAmount", "PaidAmount", "DueAmount", "PaymentMode", "Notes",
        "CreatedDate", "IsActive", "IsDeleted", "OrganizationId"
    )
    SELECT 'ST-2001', g_daniel, 'Daniel Costa', '9820012201', 'Passport', 'P8834210', 1, 1,
           room_501, '501', 'Deluxe King', plan_deluxe, 'Deluxe Overnight', 2, 4500, 24,
           '11:00', 0, 300, 30, pg_temp.at_ist(-1, 16, 0), pg_temp.at_ist(0, 11, 0), NULL,
           1, 4500, 3, 0, 12, b.elapsed_minutes, b.billable_hours, 'Overnight',
           4500, b.overtime_hours, b.overtime_amount, 0, b.gross_amount, b.taxable_amount, b.tax_amount,
           b.total_amount, b.paid_amount, b.due_amount, NULL, NULL,
           now_utc, TRUE, FALSE, org_id
    FROM pg_temp.calc_bill(pg_temp.at_ist(-1, 16, 0), pg_temp.at_ist(0, 11, 0), NULL, 4500, 300, 30, 0, 0, 4500, 12, FALSE) b
    RETURNING "Id" INTO s_daniel;

    INSERT INTO "Stays" (
        "StayNo", "GuestId", "GuestName", "GuestPhone", "GuestIdType", "GuestIdNumber", "PartyType", "GuestCount",
        "RoomId", "RoomNumber", "RoomTypeName", "RatePlanId", "PlanName", "PlanKind", "PlanRate", "PlanDurationHours",
        "PlanCheckoutTime", "PlanMinHours", "PlanOvertimeRate", "PlanGraceMinutes", "CheckInAt", "ExpectedCheckOutAt", "CheckOutAt",
        "Status", "AdvanceAmount", "AdvanceMode", "Discount", "TaxPercent", "ElapsedMinutes", "BillableHours", "BaseLabel",
        "BaseAmount", "OvertimeHours", "OvertimeAmount", "ExtraTotal", "GrossAmount", "TaxableAmount", "TaxAmount",
        "TotalAmount", "PaidAmount", "DueAmount", "PaymentMode", "Notes",
        "CreatedDate", "IsActive", "IsDeleted", "OrganizationId"
    )
    SELECT 'ST-2002', g_priya, 'Priya Naik', '9820012202', 'Aadhaar', '778812340965', 1, 1,
           room_505, '505', 'Superior Twin', plan_dayuse, '3 Hour Day Use', 1, 1800, 3,
           NULL, 3, 300, 30, pg_temp.at_ist(0, 14, 0), pg_temp.at_ist(0, 17, 0), NULL,
           1, 1800, 2, 0, 12, b.elapsed_minutes, b.billable_hours, '3 hour stay',
           1800, b.overtime_hours, b.overtime_amount, 0, b.gross_amount, b.taxable_amount, b.tax_amount,
           b.total_amount, b.paid_amount, b.due_amount, NULL, NULL,
           now_utc, TRUE, FALSE, org_id
    FROM pg_temp.calc_bill(pg_temp.at_ist(0, 14, 0), pg_temp.at_ist(0, 17, 0), NULL, 1800, 300, 30, 0, 0, 1800, 12, FALSE) b
    RETURNING "Id" INTO s_priya;

    INSERT INTO "Stays" (
        "StayNo", "GuestId", "GuestName", "GuestPhone", "GuestIdType", "GuestIdNumber", "PartyType", "GuestCount",
        "RoomId", "RoomNumber", "RoomTypeName", "RatePlanId", "PlanName", "PlanKind", "PlanRate", "PlanDurationHours",
        "PlanCheckoutTime", "PlanMinHours", "PlanOvertimeRate", "PlanGraceMinutes", "CheckInAt", "ExpectedCheckOutAt", "CheckOutAt",
        "Status", "AdvanceAmount", "AdvanceMode", "Discount", "TaxPercent", "ElapsedMinutes", "BillableHours", "BaseLabel",
        "BaseAmount", "OvertimeHours", "OvertimeAmount", "ExtraTotal", "GrossAmount", "TaxableAmount", "TaxAmount",
        "TotalAmount", "PaidAmount", "DueAmount", "PaymentMode", "Notes",
        "CreatedDate", "IsActive", "IsDeleted", "OrganizationId"
    )
    SELECT 'ST-2003', g_fernandes, 'Rohan Fernandes', '9820012203', 'Aadhaar', '334409871256', 3, 3,
           room_602, '602', 'Family Suite', plan_family, 'Family Overnight', 2, 7800, 24,
           '11:00', 0, 300, 30, pg_temp.at_ist(0, 11, 30), pg_temp.at_ist(1, 11, 0), NULL,
           1, 3000, 2, 0, 12, b.elapsed_minutes, b.billable_hours, 'Overnight',
           7800, b.overtime_hours, b.overtime_amount, 0, b.gross_amount, b.taxable_amount, b.tax_amount,
           b.total_amount, b.paid_amount, b.due_amount, NULL, NULL,
           now_utc, TRUE, FALSE, org_id
    FROM pg_temp.calc_bill(pg_temp.at_ist(0, 11, 30), pg_temp.at_ist(1, 11, 0), NULL, 7800, 300, 30, 0, 0, 3000, 12, FALSE) b
    RETURNING "Id" INTO s_fernandes;

    INSERT INTO "Stays" (
        "StayNo", "GuestId", "GuestName", "GuestPhone", "GuestIdType", "GuestIdNumber", "PartyType", "GuestCount",
        "RoomId", "RoomNumber", "RoomTypeName", "RatePlanId", "PlanName", "PlanKind", "PlanRate", "PlanDurationHours",
        "PlanCheckoutTime", "PlanMinHours", "PlanOvertimeRate", "PlanGraceMinutes", "CheckInAt", "ExpectedCheckOutAt", "CheckOutAt",
        "Status", "AdvanceAmount", "AdvanceMode", "Discount", "TaxPercent", "ElapsedMinutes", "BillableHours", "BaseLabel",
        "BaseAmount", "OvertimeHours", "OvertimeAmount", "ExtraTotal", "GrossAmount", "TaxableAmount", "TaxAmount",
        "TotalAmount", "PaidAmount", "DueAmount", "PaymentMode", "Notes",
        "CreatedDate", "IsActive", "IsDeleted", "OrganizationId"
    )
    SELECT 'ST-0991', g_neha, 'Neha Joshi', '9810011199', 'Driving Licence', 'RJ14-20190012345', 1, 1,
           room_102, '102', 'Deluxe King', plan_deluxe, 'Deluxe Overnight', 2, 4500, 24,
           '11:00', 0, 300, 30, pg_temp.at_ist(-2, 14, 0), pg_temp.at_ist(-1, 11, 0), pg_temp.at_ist(-1, 10, 40),
           2, 4500, 2, 0, 12, b.elapsed_minutes, b.billable_hours, 'Overnight',
           4500, b.overtime_hours, b.overtime_amount, 0, b.gross_amount, b.taxable_amount, b.tax_amount,
           b.total_amount, b.paid_amount, b.due_amount, 2, 'Checked out on time.',
           now_utc, TRUE, FALSE, org_id
    FROM pg_temp.calc_bill(pg_temp.at_ist(-2, 14, 0), pg_temp.at_ist(-1, 11, 0), pg_temp.at_ist(-1, 10, 40), 4500, 300, 30, 0, 0, 4500, 12, TRUE) b;

    INSERT INTO "StayRooms" ("StayId", "RoomId", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId") VALUES
        (s_rahul, room_101, now_utc, TRUE, FALSE, org_id),
        (s_ananya, room_104, now_utc, TRUE, FALSE, org_id),
        (s_sharma, room_201, now_utc, TRUE, FALSE, org_id),
        (s_daniel, room_501, now_utc, TRUE, FALSE, org_id),
        (s_priya, room_505, now_utc, TRUE, FALSE, org_id),
        (s_fernandes, room_602, now_utc, TRUE, FALSE, org_id);

    INSERT INTO "StayRooms" ("StayId", "RoomId", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId")
    SELECT s."Id", room_102, now_utc, TRUE, FALSE, org_id FROM "Stays" s WHERE s."StayNo" = 'ST-0991' AND s."IsDeleted" = FALSE;

    INSERT INTO "StayCompanions" ("StayId", "Name", "IdType", "IdNumber", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId") VALUES
        (s_ananya, 'Kabir Kapoor', 'Passport', 'Z4413102', now_utc, TRUE, FALSE, org_id),
        (s_sharma, 'Meera Sharma', 'Aadhaar', '612309874522', now_utc, TRUE, FALSE, org_id),
        (s_sharma, 'Aarav Sharma', 'Aadhaar', '612309874523', now_utc, TRUE, FALSE, org_id),
        (s_fernandes, 'Leah Fernandes', 'Aadhaar', '334409871257', now_utc, TRUE, FALSE, org_id);

    INSERT INTO "StayCharges" ("StayId", "Label", "Amount", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId") VALUES
        (s_rahul, 'Minibar — still water and cola', 450, now_utc, TRUE, FALSE, org_id),
        (s_sharma, 'Airport pickup', 800, now_utc, TRUE, FALSE, org_id);

    INSERT INTO "Reservations" (
        "BookingNo", "GuestName", "GuestPhone", "GuestEmail", "RoomId", "RoomNumber", "RoomTypeId", "RoomTypeName",
        "CheckInDate", "CheckOutDate", "Nights", "TotalAmount", "AdvanceAmount", "PaymentMode", "Source", "Status", "SpecialRequests",
        "CreatedDate", "IsActive", "IsDeleted", "OrganizationId"
    ) VALUES
        ('BK-2401', 'Kavya Iyer', '9845011101', 'kavya.iyer@example.com', room_102, '102', deluxe_id, 'Deluxe King', CURRENT_DATE + 1, CURRENT_DATE + 2, 1, 4500, 2000, 2, 6, 1, 'High floor if 102 is not free.', now_utc, TRUE, FALSE, org_id),
        ('BK-2402', 'The Oberoi Travel Desk', '01145670011', 'desk@example.com', NULL, NULL, palace_id, 'Palace Suite', CURRENT_DATE + 3, CURRENT_DATE + 5, 2, 29000, 10000, 3, 7, 1, 'Anniversary setup. No nuts in the room.', now_utc, TRUE, FALSE, org_id),
        ('BK-2403', 'Joseph D''Souza', '9823011108', NULL, room_701, '701', garden_id, 'Garden Room', CURRENT_DATE + 2, CURRENT_DATE + 4, 2, 5600, 1000, 1, 2, 1, NULL, now_utc, TRUE, FALSE, org_id),
        ('BK-2390', 'Pooja Nair', '9811110004', NULL, NULL, NULL, superior_id, 'Superior Twin', CURRENT_DATE, CURRENT_DATE + 1, 1, 3200, 0, 2, 3, 3, 'Guest cancelled this morning.', now_utc, TRUE, FALSE, org_id);

    INSERT INTO "HousekeepingTasks" (
        "RoomId", "RoomNumber", "RoomTypeName", "Status", "AssignedTo", "Priority", "Notes", "LastCleanedAt",
        "CreatedDate", "IsActive", "IsDeleted", "OrganizationId"
    )
    SELECT r."Id", r."Number", t."Name",
           CASE r."Status" WHEN 3 THEN 2 WHEN 4 THEN 4 ELSE 3 END,
           CASE WHEN r."PropertyId" = goa_id THEN 'Fatima Bi' ELSE 'Lakshmi Bai' END,
           CASE r."Status" WHEN 3 THEN 3 WHEN 4 THEN 3 WHEN 2 THEN 1 ELSE 2 END,
           CASE r."Status"
               WHEN 3 THEN 'Departure clean in progress.'
               WHEN 4 THEN r."Notes"
               WHEN 2 THEN 'Occupied. Tidy on request only.'
               ELSE 'Inspected and ready.'
           END,
           CASE WHEN r."Status" IN (1, 2) THEN pg_temp.at_ist(0, 9, 30) ELSE NULL END,
           now_utc, TRUE, FALSE, org_id
    FROM "Rooms" r
    JOIN "RoomTypes" t ON t."Id" = r."RoomTypeId"
    WHERE r."IsDeleted" = FALSE AND r."PropertyId" IN (jaipur_id, goa_id);

    INSERT INTO "MaintenanceTickets" (
        "TicketNo", "RoomId", "RoomNumber", "Title", "Description", "Priority", "Status", "ReportedBy", "AssignedTo", "Cost",
        "CreatedDate", "IsActive", "IsDeleted", "OrganizationId"
    ) VALUES (
        'MT-1001', room_106, '106', 'AC not cooling',
        'Guest desk reported the room is warm. Compressor is running but the vent air is not cold.',
        3, 2, 'Aarav Sharma', 'Imran Qureshi', 2500,
        now_utc, TRUE, FALSE, org_id
    );

    INSERT INTO "PosItems" ("Name", "Category", "Price", "IsAvailable", "Description", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId")
    VALUES ('Poha and chai', 1, 180, TRUE, 'Jaipur breakfast plate with masala chai.', now_utc, TRUE, FALSE, org_id) RETURNING "Id" INTO pos_poha;
    INSERT INTO "PosItems" ("Name", "Category", "Price", "IsAvailable", "Description", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId")
    VALUES ('Masala omelette', 1, 220, TRUE, 'Three eggs, toast on the side.', now_utc, TRUE, FALSE, org_id) RETURNING "Id" INTO pos_omelette;
    INSERT INTO "PosItems" ("Name", "Category", "Price", "IsAvailable", "Description", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId")
    VALUES ('Rajasthani thali', 2, 540, TRUE, 'Dal, two sabzi, roti, rice, and chaas.', now_utc, TRUE, FALSE, org_id) RETURNING "Id" INTO pos_thali;
    INSERT INTO "PosItems" ("Name", "Category", "Price", "IsAvailable", "Description", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId")
    VALUES ('Fish curry and rice', 2, 680, TRUE, 'Goa kitchen. Available after 12:30.', now_utc, TRUE, FALSE, org_id) RETURNING "Id" INTO pos_fish;
    INSERT INTO "PosItems" ("Name", "Category", "Price", "IsAvailable", "Description", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId")
    VALUES ('Grilled vegetable sandwich', 3, 240, TRUE, NULL, now_utc, TRUE, FALSE, org_id) RETURNING "Id" INTO pos_sandwich;
    INSERT INTO "PosItems" ("Name", "Category", "Price", "IsAvailable", "Description", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId")
    VALUES ('Filter coffee', 4, 120, TRUE, NULL, now_utc, TRUE, FALSE, org_id) RETURNING "Id" INTO pos_coffee;
    INSERT INTO "PosItems" ("Name", "Category", "Price", "IsAvailable", "Description", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId")
    VALUES ('Still water 1L', 4, 60, TRUE, NULL, now_utc, TRUE, FALSE, org_id) RETURNING "Id" INTO pos_water;
    INSERT INTO "PosItems" ("Name", "Category", "Price", "IsAvailable", "Description", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId")
    VALUES ('Fresh lime soda', 4, 140, TRUE, NULL, now_utc, TRUE, FALSE, org_id);
    INSERT INTO "PosItems" ("Name", "Category", "Price", "IsAvailable", "Description", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId")
    VALUES ('Shirt laundry', 5, 80, TRUE, 'Same-day if given before 10:00.', now_utc, TRUE, FALSE, org_id) RETURNING "Id" INTO pos_laundry;
    INSERT INTO "PosItems" ("Name", "Category", "Price", "IsAvailable", "Description", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId")
    VALUES ('Extra bed', 6, 900, TRUE, 'Includes linen. Subject to room size.', now_utc, TRUE, FALSE, org_id);
    INSERT INTO "PosItems" ("Name", "Category", "Price", "IsAvailable", "Description", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId")
    VALUES ('Airport pickup', 6, 800, TRUE, 'Sedan, one way, inside city.', now_utc, TRUE, FALSE, org_id);

    INSERT INTO "ServiceOrders" (
        "OrderNo", "RoomId", "RoomNumber", "StayId", "GuestName", "Subtotal", "TaxPercent", "TaxAmount", "TotalAmount",
        "BilledToRoom", "PaymentMode", "Status", "Notes", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId"
    ) VALUES (
        'SO-1001', room_101, '101', s_rahul, 'Rahul Mehta', 780, 5, 39, 819,
        TRUE, NULL, 2, 'Send with extra napkins.', now_utc, TRUE, FALSE, org_id
    ) RETURNING "Id" INTO order_id;
    INSERT INTO "ServiceOrderLines" ("ServiceOrderId", "PosItemId", "Name", "Price", "Quantity", "Category", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId") VALUES
        (order_id, pos_thali, 'Rajasthani thali', 540, 1, 2, now_utc, TRUE, FALSE, org_id),
        (order_id, pos_coffee, 'Filter coffee', 120, 2, 4, now_utc, TRUE, FALSE, org_id);

    INSERT INTO "ServiceOrders" (
        "OrderNo", "RoomId", "RoomNumber", "StayId", "GuestName", "Subtotal", "TaxPercent", "TaxAmount", "TotalAmount",
        "BilledToRoom", "PaymentMode", "Status", "Notes", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId"
    ) VALUES (
        'SO-2001', room_505, '505', s_priya, 'Priya Naik', 300, 5, 15, 315,
        FALSE, 2, 3, NULL, now_utc, TRUE, FALSE, org_id
    ) RETURNING "Id" INTO order_id;
    INSERT INTO "ServiceOrderLines" ("ServiceOrderId", "PosItemId", "Name", "Price", "Quantity", "Category", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId") VALUES
        (order_id, pos_sandwich, 'Grilled vegetable sandwich', 240, 1, 3, now_utc, TRUE, FALSE, org_id),
        (order_id, pos_water, 'Still water 1L', 60, 1, 4, now_utc, TRUE, FALSE, org_id);

    INSERT INTO "ServiceOrders" (
        "OrderNo", "RoomId", "RoomNumber", "StayId", "GuestName", "Subtotal", "TaxPercent", "TaxAmount", "TotalAmount",
        "BilledToRoom", "PaymentMode", "Status", "Notes", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId"
    ) VALUES (
        'SO-2002', room_501, '501', s_daniel, 'Daniel Costa', 860, 5, 43, 903,
        TRUE, NULL, 1, 'No onion.', now_utc, TRUE, FALSE, org_id
    ) RETURNING "Id" INTO order_id;
    INSERT INTO "ServiceOrderLines" ("ServiceOrderId", "PosItemId", "Name", "Price", "Quantity", "Category", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId") VALUES
        (order_id, pos_fish, 'Fish curry and rice', 680, 1, 2, now_utc, TRUE, FALSE, org_id),
        (order_id, pos_poha, 'Poha and chai', 180, 1, 1, now_utc, TRUE, FALSE, org_id);

    INSERT INTO "ServiceOrders" (
        "OrderNo", "RoomId", "RoomNumber", "StayId", "GuestName", "Subtotal", "TaxPercent", "TaxAmount", "TotalAmount",
        "BilledToRoom", "PaymentMode", "Status", "Notes", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId"
    ) VALUES (
        'SO-1002', room_104, '104', s_ananya, 'Ananya Kapoor', 600, 5, 30, 630,
        TRUE, NULL, 3, NULL, now_utc, TRUE, FALSE, org_id
    ) RETURNING "Id" INTO order_id;
    INSERT INTO "ServiceOrderLines" ("ServiceOrderId", "PosItemId", "Name", "Price", "Quantity", "Category", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId") VALUES
        (order_id, pos_laundry, 'Shirt laundry', 80, 2, 5, now_utc, TRUE, FALSE, org_id),
        (order_id, pos_omelette, 'Masala omelette', 220, 2, 1, now_utc, TRUE, FALSE, org_id);

    INSERT INTO "HotelStaffs" ("Name", "Role", "Phone", "Email", "Shift", "DutyStatus", "JoinedDate", "PropertyId", "PropertyName", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId") VALUES
        ('Vikram Malhotra', 2, '9876500001', 'hotel1.admin@hotel.local', 4, 1, DATE '2024-01-10', jaipur_id, 'Grand Horizon Palace & Spa', now_utc, TRUE, FALSE, org_id),
        ('Aarav Sharma', 4, '9876500002', 'hotel1.desk@hotel.local', 1, 1, DATE '2024-03-15', jaipur_id, 'Grand Horizon Palace & Spa', now_utc, TRUE, FALSE, org_id),
        ('Pooja Rathore', 4, '9876500012', 'pooja.rathore@grandhorizon.local', 2, 2, DATE '2024-06-01', jaipur_id, 'Grand Horizon Palace & Spa', now_utc, TRUE, FALSE, org_id),
        ('Lakshmi Bai', 5, '9876500013', NULL, 1, 1, DATE '2023-11-02', jaipur_id, 'Grand Horizon Palace & Spa', now_utc, TRUE, FALSE, org_id),
        ('Imran Qureshi', 7, '9876500014', NULL, 4, 1, DATE '2023-08-19', jaipur_id, 'Grand Horizon Palace & Spa', now_utc, TRUE, FALSE, org_id),
        ('Chef Harish Saini', 6, '9876500015', NULL, 1, 1, DATE '2024-02-11', jaipur_id, 'Grand Horizon Palace & Spa', now_utc, TRUE, FALSE, org_id),
        ('Sneha Patel', 2, '9876500003', 'hotel2.admin@hotel.local', 4, 1, DATE '2024-05-20', goa_id, 'Grand Horizon Beach Resort', now_utc, TRUE, FALSE, org_id),
        ('Rohan D''Silva', 4, '9876500004', 'hotel2.desk@hotel.local', 1, 1, DATE '2024-02-01', goa_id, 'Grand Horizon Beach Resort', now_utc, TRUE, FALSE, org_id),
        ('Fatima Bi', 5, '9876500021', NULL, 1, 1, DATE '2024-04-08', goa_id, 'Grand Horizon Beach Resort', now_utc, TRUE, FALSE, org_id),
        ('Chef Maria Fernandes', 6, '9876500022', NULL, 2, 2, DATE '2023-12-01', goa_id, 'Grand Horizon Beach Resort', now_utc, TRUE, FALSE, org_id);

    INSERT INTO "ShiftRegisters" (
        "ShiftDate", "ShiftType", "StaffName", "OpeningCash", "CashCollected", "PettyExpensesPaid",
        "ClosingCashExpected", "ActualCashCounted", "CashDifference", "HandoverNotes",
        "CreatedDate", "IsActive", "IsDeleted", "OrganizationId"
    ) VALUES
        (CURRENT_DATE, 1, 'Aarav Sharma', 5000, 18400, 650, 22750, 22750, 0, 'UPI settlements are on the card machine slip. No cash variance.', now_utc, TRUE, FALSE, org_id),
        (CURRENT_DATE, 1, 'Rohan D''Silva', 4000, 9600, 300, 13300, 13280, -20, 'Rs 20 short. Coins left in the drop box, noted for the evening shift.', now_utc, TRUE, FALSE, org_id),
        (CURRENT_DATE - 1, 3, 'Pooja Rathore', 3000, 7200, 0, 10200, 10200, 0, 'Quiet night. One late checkout on 101.', now_utc, TRUE, FALSE, org_id);

    INSERT INTO "HotelExpenses" ("Title", "Category", "Amount", "PaymentMode", "ExpenseDate", "PaidTo", "Notes", "CreatedDate", "IsActive", "IsDeleted", "OrganizationId") VALUES
        ('Vegetable mandi', 1, 6400, 1, CURRENT_DATE - 1, 'Mohan Vegetables', 'Jaipur kitchen.', now_utc, TRUE, FALSE, org_id),
        ('Electricity bill', 2, 28600, 2, CURRENT_DATE - 3, 'Jaipur Vidyut Vitran', 'Common area and rooms, last cycle.', now_utc, TRUE, FALSE, org_id),
        ('Laundry soap and starch', 3, 2100, 1, CURRENT_DATE, 'Goa Laundry Stores', NULL, now_utc, TRUE, FALSE, org_id),
        ('AC capacitor for 106', 4, 1850, 2, CURRENT_DATE, 'CoolCare Jaipur', 'Fitted today, ticket MT-1001 still open for the gas check.', now_utc, TRUE, FALSE, org_id),
        ('Generator diesel', 5, 4500, 1, CURRENT_DATE - 2, 'Candolim Fuels', 'Goa backup generator.', now_utc, TRUE, FALSE, org_id);

    INSERT INTO "LostItems" (
        "ItemNo", "Title", "Category", "LocationFound", "RoomNumber", "FoundDate", "FoundTime", "FoundByStaff", "StorageLocker",
        "GuestName", "GuestPhone", "Status", "Notes", "ClaimedAt", "ClaimedBy", "ClaimantContact",
        "CreatedDate", "IsActive", "IsDeleted", "OrganizationId"
    ) VALUES
        ('LF-1001', 'Black iPhone', 1, 'Lobby sofa', '101', CURRENT_DATE, '09:40', 'Lakshmi Bai', 'L-12', 'Rahul Mehta', '9810011101', 2, 'Guest asked us to hold it until checkout.', NULL, NULL, NULL, now_utc, TRUE, FALSE, org_id),
        ('LF-1002', 'Gold earring', 3, 'Room 102 bathroom', '102', CURRENT_DATE - 2, '11:10', 'Lakshmi Bai', 'L-04', 'Neha Joshi', '9810011199', 3, 'Matched to the checkout guest.', pg_temp.at_ist(-1, 18, 0), 'Neha Joshi', '9810011199', now_utc, TRUE, FALSE, org_id),
        ('LF-2001', 'Blue cap', 5, 'Pool deck', NULL, CURRENT_DATE - 1, '17:20', 'Fatima Bi', 'G-02', NULL, NULL, 1, 'No name inside.', NULL, NULL, NULL, now_utc, TRUE, FALSE, org_id);

    FOREACH audit_date IN ARRAY ARRAY[CURRENT_DATE - 1, CURRENT_DATE - 2, CURRENT_DATE - 3] LOOP
        IF EXISTS (SELECT 1 FROM "NightAudits" WHERE "OrganizationId" = org_id AND "BusinessDate" = audit_date AND "IsDeleted" = FALSE) THEN
            CONTINUE;
        END IF;
        IF audit_date = CURRENT_DATE - 1 THEN
            room_rev := 31200; pos_rev := 2460; svc_rev := 800;
        ELSIF audit_date = CURRENT_DATE - 2 THEN
            room_rev := 22800; pos_rev := 1540; svc_rev := 0;
        ELSE
            room_rev := 36400; pos_rev := 3100; svc_rev := 900;
        END IF;
        total_rev := room_rev + pos_rev + svc_rev;
        INSERT INTO "NightAudits" (
            "BusinessDate", "AuditTimestamp", "AuditedBy", "TotalRooms", "OccupiedRooms", "OccupancyRate",
            "RoomRevenue", "PosRevenue", "ServicesRevenue", "TotalRevenue", "Adr", "RevPar", "TotalGst",
            "CashSettlement", "UpiSettlement", "CardSettlement", "CorporateSettlement", "Notes",
            "CreatedDate", "IsActive", "IsDeleted", "OrganizationId"
        ) VALUES (
            audit_date,
            (audit_date + TIME '23:50') - INTERVAL '5 hours 30 minutes',
            CASE audit_date WHEN CURRENT_DATE - 1 THEN 'Aarav Sharma' WHEN CURRENT_DATE - 2 THEN 'Pooja Rathore' ELSE 'Rohan D''Silva' END,
            20,
            CASE audit_date WHEN CURRENT_DATE - 1 THEN 7 WHEN CURRENT_DATE - 2 THEN 5 ELSE 8 END,
            CASE audit_date WHEN CURRENT_DATE - 1 THEN 35.00 WHEN CURRENT_DATE - 2 THEN 25.00 ELSE 40.00 END,
            room_rev, pos_rev, svc_rev, total_rev,
            ROUND(room_rev / CASE audit_date WHEN CURRENT_DATE - 1 THEN 7 WHEN CURRENT_DATE - 2 THEN 5 ELSE 8 END, 2),
            ROUND(room_rev / 20, 2),
            ROUND(total_rev * 0.12, 2),
            ROUND(total_rev * 0.35, 2),
            ROUND(total_rev * 0.40, 2),
            ROUND(total_rev * 0.25, 2),
            0,
            'Closed by the night auditor. No unresolved folios.',
            now_utc, TRUE, FALSE, org_id
        );
    END LOOP;

    IF EXISTS (SELECT 1 FROM "HotelSettings" WHERE "OrganizationId" = org_id AND "IsDeleted" = FALSE) THEN
        UPDATE "HotelSettings" SET
            "HotelName" = 'Grand Horizon Palace & Spa',
            "ChainName" = 'Grand Horizon',
            "BrandTier" = 'Palace',
            "Tagline" = 'Palaces, beaches, and a quieter kind of stay.',
            "Address" = 'Amer Road, Civil Lines, Jaipur, Rajasthan 302006',
            "City" = 'Jaipur',
            "StateCode" = 'RJ',
            "Phone" = '0141-4567890',
            "Email" = 'jaipur@grandhorizon.local',
            "Website" = 'https://grandhorizon.local',
            "Gstin" = '08AABCG1234P1Z5',
            "Cin" = 'U55101RJ2020PTC012345',
            "Fssai" = '12219022000123',
            "UpiId" = 'grandhorizon.jaipur@okaxis',
            "TaxPercent" = 12,
            "CgstPercent" = 6,
            "SgstPercent" = 6,
            "SacCodeAccommodation" = '996311',
            "SacCodeFood" = '996331',
            "InvoicePrefix" = 'GH',
            "BankName" = 'HDFC Bank',
            "BankAccountNo" = '50200044112233',
            "BankIfsc" = 'HDFC0000141',
            "FolioPolicy" = 'Checkout by 11:00. Late checkout is billed at the plan overtime rate. GST is extra.',
            "AutoCleaning" = TRUE,
            "CurrencySymbol" = '₹',
            "CheckInTime" = '14:00',
            "CheckOutTime" = '11:00',
            "ManagerSignatory" = 'Vikram Malhotra',
            "EnableNightAudit" = TRUE,
            "EnableLostAndFound" = TRUE,
            "IsActive" = TRUE,
            "UpdatedDate" = now_utc
        WHERE "OrganizationId" = org_id AND "IsDeleted" = FALSE;
    ELSE
        INSERT INTO "HotelSettings" (
            "HotelName", "ChainName", "BrandTier", "Tagline", "Address", "City", "StateCode", "Phone", "Email", "Website",
            "Gstin", "Cin", "Fssai", "UpiId", "TaxPercent", "CgstPercent", "SgstPercent", "SacCodeAccommodation", "SacCodeFood",
            "InvoicePrefix", "BankName", "BankAccountNo", "BankIfsc", "FolioPolicy", "AutoCleaning", "CurrencySymbol",
            "CheckInTime", "CheckOutTime", "ManagerSignatory", "EnableNightAudit", "EnableLostAndFound",
            "CreatedDate", "IsActive", "IsDeleted", "OrganizationId"
        ) VALUES (
            'Grand Horizon Palace & Spa', 'Grand Horizon', 'Palace', 'Palaces, beaches, and a quieter kind of stay.',
            'Amer Road, Civil Lines, Jaipur, Rajasthan 302006', 'Jaipur', 'RJ', '0141-4567890', 'jaipur@grandhorizon.local', 'https://grandhorizon.local',
            '08AABCG1234P1Z5', 'U55101RJ2020PTC012345', '12219022000123', 'grandhorizon.jaipur@okaxis', 12, 6, 6, '996311', '996331',
            'GH', 'HDFC Bank', '50200044112233', 'HDFC0000141', 'Checkout by 11:00. Late checkout is billed at the plan overtime rate. GST is extra.',
            TRUE, '₹', '14:00', '11:00', 'Vikram Malhotra', TRUE, TRUE,
            now_utc, TRUE, FALSE, org_id
        );
    END IF;

    RAISE NOTICE 'Grand Horizon Palace & Spa aur Grand Horizon Beach Resort ka data insert ho gaya.';
END
$seed$;

SELECT item, total FROM (
    SELECT 1 AS sort, 'Hotels' AS item, COUNT(*) AS total FROM "HotelProperties" WHERE "IsDeleted" = FALSE
    UNION ALL SELECT 2, 'Room types', COUNT(*) FROM "RoomTypes" WHERE "IsDeleted" = FALSE
    UNION ALL SELECT 3, 'Rooms', COUNT(*) FROM "Rooms" WHERE "IsDeleted" = FALSE
    UNION ALL SELECT 4, 'Guests', COUNT(*) FROM "Guests" WHERE "IsDeleted" = FALSE
    UNION ALL SELECT 5, 'Stays', COUNT(*) FROM "Stays" WHERE "IsDeleted" = FALSE
    UNION ALL SELECT 6, 'Reservations', COUNT(*) FROM "Reservations" WHERE "IsDeleted" = FALSE
    UNION ALL SELECT 7, 'Staff', COUNT(*) FROM "HotelStaffs" WHERE "IsDeleted" = FALSE
    UNION ALL SELECT 8, 'Menu items', COUNT(*) FROM "PosItems" WHERE "IsDeleted" = FALSE
) counts
ORDER BY sort;
