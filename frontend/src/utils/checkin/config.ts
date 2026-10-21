export type GuestLookupScope = "hotel" | "chain";

/**
 * Guest lookup scope configuration.
 * 'hotel': scopes search to the currently active HotelId only.
 * 'chain': allows cross-chain lookup across all hotels in the chain.
 */
export const GUEST_LOOKUP_SCOPE: GuestLookupScope = "hotel";

export const DEFAULT_HOTEL_ID = "hotel-1";
